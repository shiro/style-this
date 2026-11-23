use super::cache_registry::CacheRegistry;
use super::error::TransformError;
use crate::PREFIX;
use js_sys::Array;
use std::collections::HashMap;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Clone)]
pub struct Transformer {
    pub(crate) cwd: String,
    pub(crate) ignored_imports: HashMap<String, Vec<String>>,

    pub(crate) load_file: js_sys::Function,
    pub(crate) css_file_store_ref: String,
    pub(crate) atomic_file_store_ref: String,
    pub(crate) value_cache_ref: String,
    pub(crate) cache_registry: CacheRegistry,
    pub(crate) require_ref: Option<String>,
    pub(crate) css_extension: String,

    pub(crate) use_require: bool,
    pub(crate) debug: bool,
    pub(crate) atomic: bool,
    pub(crate) on_debug_virtual_module: Option<js_sys::Function>,
    pub(crate) resolve_virtual_import: Option<js_sys::Function>,
}

/// Virtual module the compiler inserts an import of.
#[derive(Clone, Copy)]
pub(crate) enum VirtualImport {
    Css,
    AtomicProgram,
}

#[wasm_bindgen]
impl Transformer {
    #[wasm_bindgen(constructor)]
    #[allow(clippy::new_without_default)]
    pub fn new(opts: JsValue) -> Result<Self, TransformError> {
        let global = js_sys::global();

        let get =
            |key: &str| js_sys::Reflect::get(&opts, &JsValue::from_str(key)).unwrap_or_default();
        let invalid = |option, expected| TransformError::InvalidOption { option, expected };

        let cwd = get("cwd")
            .as_string()
            .ok_or_else(|| invalid("cwd", "a string"))?;

        let ignored_imports = get("ignoredImports").dyn_into::<js_sys::Object>().ok();

        let ignored_imports: HashMap<String, Vec<String>> = ignored_imports
            .as_ref()
            .map(|ignored_imports| {
                js_sys::Object::keys(ignored_imports)
                    .iter()
                    .filter_map(|key| {
                        let key_str = key.as_string()?;
                        let value = js_sys::Reflect::get(ignored_imports, &key).ok()?;
                        let array = js_sys::Array::from(&value);
                        let vec: Vec<String> =
                            array.iter().filter_map(|item| item.as_string()).collect();
                        Some((key_str, vec))
                    })
                    .collect()
            })
            .unwrap_or_default();

        let load_file = get("loadFile")
            .dyn_into::<js_sys::Function>()
            .map_err(|_| invalid("loadFile", "a function"))?;

        let css_extension = get("cssExtension")
            .as_string()
            .ok_or_else(|| invalid("cssExtension", "a string"))?;

        // Get CacheRegistry from options (passed from Vite)
        let cache_registry_value = get("cacheRegistry");

        let (
            cache_registry,
            css_file_store_ref_str,
            atomic_file_store_ref_str,
            value_cache_ref_str,
        ) = if !cache_registry_value.is_null() && !cache_registry_value.is_undefined() {
            // Generate unique refs for this instance
            let css_ref_suffix = crate::utils::generate_random_id(8);
            let atomic_ref_suffix = crate::utils::generate_random_id(8);
            let value_ref_suffix = crate::utils::generate_random_id(8);

            let css_file_store_ref_str = format!("{PREFIX}_css_cache_{css_ref_suffix}");
            let atomic_file_store_ref_str = format!("{PREFIX}_atomic_cache_{atomic_ref_suffix}");
            let value_cache_ref_str = format!("{PREFIX}_value_cache_{value_ref_suffix}");

            // Call initializeRefs on the TS CacheRegistry to make it store its cache objects
            // in global scope under the provided ref names
            let init_refs_fn =
                js_sys::Reflect::get(&cache_registry_value, &JsValue::from_str("initializeRefs"))
                    .ok()
                    .and_then(|v| v.dyn_into::<js_sys::Function>().ok());

            if let Some(init_fn) = init_refs_fn {
                let _ = init_fn.call2(
                    &cache_registry_value,
                    &JsValue::from_str(&css_file_store_ref_str),
                    &JsValue::from_str(&atomic_file_store_ref_str),
                );
            }

            // Create a new Map for value_cache in global scope (not exposed in TS version)
            let value_cache = js_sys::Map::new();
            let _ = js_sys::Reflect::set(
                &global,
                &JsValue::from_str(&value_cache_ref_str),
                &value_cache,
            );

            // Create a Rust-side CacheRegistry that references the TS cache objects via global refs
            let rust_cache_registry = CacheRegistry::from_js_cache_registry(
                cache_registry_value.clone(),
                css_file_store_ref_str.clone(),
                atomic_file_store_ref_str.clone(),
                value_cache_ref_str.clone(),
            );

            // Set __native on the TS CacheRegistry object to point to the Rust registry
            let _ = js_sys::Reflect::set(
                &cache_registry_value,
                &JsValue::from_str("__native"),
                &rust_cache_registry.clone().into(),
            );

            (
                rust_cache_registry,
                css_file_store_ref_str,
                atomic_file_store_ref_str,
                value_cache_ref_str,
            )
        } else {
            // No TS CacheRegistry passed, create both TS and Rust caches
            let cache_registry = CacheRegistry::new();
            let css_file_store_ref_str = cache_registry.css_cache_ref();
            let atomic_file_store_ref_str = cache_registry.atomic_cache_ref();
            let value_cache_ref_str = cache_registry.value_cache_ref();
            (
                cache_registry,
                css_file_store_ref_str,
                atomic_file_store_ref_str,
                value_cache_ref_str,
            )
        };

        let use_require = get("useRequire").as_bool().unwrap_or_default();
        let debug = get("debug").as_bool().unwrap_or_default();
        let atomic = get("atomic").as_bool().unwrap_or_default();

        let create_require = get("createRequire").dyn_into::<js_sys::Function>().ok();

        let require_ref = create_require.map(|create_require_fn| {
            let require_suffix = crate::utils::generate_random_id(8);
            let require_ref = format!("{PREFIX}_require_{require_suffix}");

            let _ = js_sys::Reflect::set(
                &global,
                &JsValue::from_str(&require_ref),
                &create_require_fn,
            );
            require_ref
        });

        let on_debug_virtual_module = get("onDebugVirtualModule")
            .dyn_into::<js_sys::Function>()
            .ok();
        let resolve_virtual_import = get("resolveVirtualImport")
            .dyn_into::<js_sys::Function>()
            .ok();

        Ok(Self {
            cwd,
            ignored_imports,

            load_file,
            css_file_store_ref: css_file_store_ref_str,
            atomic_file_store_ref: atomic_file_store_ref_str,
            value_cache_ref: value_cache_ref_str,
            cache_registry,
            require_ref,
            css_extension,

            use_require,
            debug,
            atomic,
            on_debug_virtual_module,
            resolve_virtual_import,
        })
    }

    /// Get all collected atomic CSS
    pub fn get_atomic_css(&self) -> String {
        self.cache_registry.get_all_atomic_css()
    }

    /// Atomic CSS of the declarations `filepath` uses, as of its latest evaluation. For bundlers
    /// that can't collect the atomic CSS of all files into one stylesheet.
    pub fn get_file_atomic_css(&self, filepath: &str) -> String {
        self.cache_registry.get_file_atomic_css(filepath)
    }

    /// Get all files that transitively depend on changed exports from the given file
    ///
    /// `changed_exports` should be a JS Array of export names that changed, empty means any
    pub fn get_transitive_importers(&self, filepath: &str, changed_exports: JsValue) -> Array {
        let changed_exports_arr = Array::from(&changed_exports);
        let mut changed_set = std::collections::HashSet::new();

        for export_name in changed_exports_arr.iter() {
            if let Some(name) = export_name.as_string() {
                changed_set.insert(name);
            }
        }

        let importers = self
            .cache_registry
            .dependency_tracker()
            .borrow()
            .get_transitive_importers(filepath, &changed_set);

        let arr = Array::new();
        for importer in importers {
            arr.push(&JsValue::from_str(&importer));
        }
        arr
    }

    pub fn has_importers(&self, filepath: &str) -> bool {
        !self
            .cache_registry
            .dependency_tracker()
            .borrow()
            .get_all_importers(filepath)
            .is_empty()
    }

    /// loads file contents and id
    pub(crate) async fn load_file(
        &self,
        id: &str,
        importer: &str,
    ) -> Result<(String, String), TransformError> {
        let error = |cause| TransformError::ReadFileError {
            filepath: id.to_string(),
            cause,
        };
        let ret = self
            .load_file
            .call2(
                &JsValue::UNDEFINED,
                &JsValue::from_str(id),
                &JsValue::from_str(importer),
            )
            .map_err(error)?;
        let ret = wasm_bindgen_futures::JsFuture::from(js_sys::Promise::resolve(&ret))
            .await
            .map_err(error)?;

        let file = ret
            .dyn_into::<Array>()
            .ok()
            .and_then(|arr| Some((arr.get(0).as_string()?, arr.get(1).as_string()?)));
        file.ok_or_else(|| {
            error(js_sys::Error::new("loadFile must resolve to [filepath, code]").into())
        })
    }

    /// Import specifier of a virtual module imported by `filepath`, `resolveVirtualImport` replaces
    /// the default `virtual:style-this:` specifiers for bundlers without virtual module support.
    pub(crate) fn virtual_import(
        &self,
        kind: VirtualImport,
        filepath: &str,
    ) -> Result<String, TransformError> {
        let Some(resolve) = &self.resolve_virtual_import else {
            return Ok(match kind {
                VirtualImport::Css => {
                    format!("virtual:style-this:{filepath}.{}", self.css_extension)
                }
                VirtualImport::AtomicProgram => {
                    let filename = filepath.split('/').next_back().unwrap_or(filepath);
                    format!("virtual:style-this:./{filename}.style-this.js")
                }
            });
        };

        let kind = match kind {
            VirtualImport::Css => "css",
            VirtualImport::AtomicProgram => "atomicProgram",
        };
        let error = |cause| TransformError::ResolveVirtualImportFailed {
            filepath: filepath.to_string(),
            cause,
        };
        resolve
            .call2(
                &JsValue::UNDEFINED,
                &JsValue::from_str(kind),
                &JsValue::from_str(filepath),
            )
            .map_err(error)?
            .as_string()
            .ok_or_else(|| {
                error(js_sys::TypeError::new("resolveVirtualImport must return a string").into())
            })
    }
}
