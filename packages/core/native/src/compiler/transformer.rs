use super::cache_registry::CacheRegistry;
use super::error::TransformError;
use crate::PREFIX;
use futures::lock::Mutex as FutureMutex;
use js_sys::Array;
use std::collections::HashMap;
use std::rc::Rc;
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
    pub(crate) wrap_selectors_with_global: bool,

    pub(crate) use_require: bool,
    pub(crate) debug: bool,
    pub(crate) atomic: bool,
    pub(crate) on_debug_virtual_module_ref: String,
}

#[wasm_bindgen]
impl Transformer {
    #[wasm_bindgen(constructor)]
    #[allow(clippy::new_without_default)]
    pub fn new(opts: JsValue) -> Self {
        let global = js_sys::global();

        let cwd = js_sys::Reflect::get(&opts, &JsValue::from_str("cwd"))
            .unwrap()
            .as_string()
            .unwrap();

        let ignored_imports = js_sys::Reflect::get(&opts, &JsValue::from_str("ignoredImports"))
            .ok()
            .and_then(|v| v.dyn_into::<js_sys::Object>().ok());

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

        let load_file = js_sys::Reflect::get(&opts, &JsValue::from_str("loadFile"))
            .unwrap()
            .dyn_into::<js_sys::Function>()
            .unwrap();

        let css_extension = js_sys::Reflect::get(&opts, &JsValue::from_str("cssExtension"))
            .unwrap()
            .as_string()
            .unwrap();

        let wrap_selectors_with_global =
            js_sys::Reflect::get(&opts, &JsValue::from_str("wrapSelectorsWithGlobal"))
                .unwrap()
                .as_bool()
                .unwrap_or(false);

        // Get CacheRegistry from options (passed from Vite)
        let cache_registry_value = js_sys::Reflect::get(&opts, &JsValue::from_str("cacheRegistry"))
            .unwrap_or(JsValue::null());

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

        let use_require = js_sys::Reflect::get(&opts, &JsValue::from_str("useRequire"))
            .unwrap()
            .as_bool()
            .unwrap_or_default();

        let debug = js_sys::Reflect::get(&opts, &JsValue::from_str("debug"))
            .unwrap()
            .as_bool()
            .unwrap_or_default();

        let atomic = js_sys::Reflect::get(&opts, &JsValue::from_str("atomic"))
            .unwrap()
            .as_bool()
            .unwrap_or_default();

        let create_require = js_sys::Reflect::get(&opts, &JsValue::from_str("createRequire"))
            .ok()
            .and_then(|v| v.dyn_into::<js_sys::Function>().ok());

        let require_ref = create_require.map(|create_require_fn| {
            let require_suffix = crate::utils::generate_random_id(8);
            let require_ref = format!("{PREFIX}_require_{require_suffix}");

            js_sys::Reflect::set(
                &global,
                &JsValue::from_str(&require_ref),
                &create_require_fn,
            )
            .unwrap();
            require_ref
        });

        let on_debug_virtual_module =
            js_sys::Reflect::get(&opts, &JsValue::from_str("onDebugVirtualModule"))
                .unwrap()
                .dyn_into::<js_sys::Function>()
                .unwrap();

        let callback_suffix = crate::utils::generate_random_id(8);
        let on_debug_virtual_module_ref = format!("{PREFIX}_debug_callback_{callback_suffix}");

        js_sys::Reflect::set(
            &global,
            &JsValue::from_str(&on_debug_virtual_module_ref),
            &on_debug_virtual_module,
        )
        .unwrap();

        Self {
            cwd,
            ignored_imports,

            load_file,
            css_file_store_ref: css_file_store_ref_str,
            atomic_file_store_ref: atomic_file_store_ref_str,
            value_cache_ref: value_cache_ref_str,
            cache_registry,
            require_ref,
            css_extension,
            wrap_selectors_with_global,

            use_require,
            debug,
            atomic,
            on_debug_virtual_module_ref,
        }
    }

    /// Get all collected atomic CSS
    pub fn get_atomic_css(&self) -> String {
        self.cache_registry.get_all_atomic_css()
    }

    /// Clear value cache for a specific file
    pub fn clear_value_cache(&self, filepath: &str) {
        self.cache_registry.clear_file(filepath);
    }

    /// Get files that import changed exports from the given file
    /// Returns a JS Array of filepaths that need to be invalidated
    ///
    /// `changed_exports` should be a JS Array of export names that changed
    pub fn get_importers_of_changed_exports(
        &self,
        filepath: &str,
        changed_exports: JsValue,
    ) -> Array {
        let changed_exports_arr = Array::from(&changed_exports);
        let mut changed_set = std::collections::HashSet::new();

        for export_name in changed_exports_arr.iter() {
            if let Some(name) = export_name.as_string() {
                changed_set.insert(name);
            }
        }

        // Get direct importers
        let importers = self
            .cache_registry
            .dependency_tracker()
            .borrow()
            .get_importers_of_changed_exports(filepath, &changed_set);

        let arr = Array::new();
        for importer in importers {
            arr.push(&JsValue::from_str(&importer));
        }
        arr
    }

    /// Get all files that transitively depend on changed exports from the given file
    /// This performs a BFS to find the full transitive closure
    ///
    /// `changed_exports` should be a JS Array of export names that changed
    pub fn get_transitive_importers(&self, filepath: &str, changed_exports: JsValue) -> Array {
        let changed_exports_arr = Array::from(&changed_exports);
        let mut changed_set = std::collections::HashSet::new();

        for export_name in changed_exports_arr.iter() {
            if let Some(name) = export_name.as_string() {
                changed_set.insert(name);
            }
        }

        // Create a closure to get file exports from the value cache
        let value_cache = self.cache_registry.value_cache.clone();
        let get_exports = move |file: &str| -> Option<std::collections::HashSet<String>> {
            let cache = value_cache.borrow();
            cache.get(file).and_then(
                |mutex_ref: &Rc<FutureMutex<std::collections::HashSet<String>>>| {
                    // Try to lock synchronously - if we can't, assume no exports
                    // This is safe because we're only reading, not modifying
                    mutex_ref.try_lock().map(
                        |guard: futures::lock::MutexGuard<std::collections::HashSet<String>>| {
                            guard.clone()
                        },
                    )
                },
            )
        };

        let importers = self
            .cache_registry
            .dependency_tracker()
            .borrow()
            .get_transitive_importers(filepath, &changed_set, get_exports);

        let arr = Array::new();
        for importer in importers {
            arr.push(&JsValue::from_str(&importer));
        }
        arr
    }

    /// Clear import registrations for a file
    /// Call this before re-transforming a file to clear its old import records
    pub fn clear_file_imports(&self, filepath: &str) {
        self.cache_registry
            .dependency_tracker()
            .borrow()
            .clear_file_imports(filepath);
    }

    /// Get the current exports for a file from the value cache
    /// Returns a JS Array of export names
    pub fn get_file_exports(&self, filepath: &str) -> Array {
        let cache = self.cache_registry.value_cache.borrow();

        if let Some(mutex_ref) = cache.get(filepath) {
            // Try to lock synchronously - if we can't, return empty array
            if let Some(guard) = mutex_ref.try_lock() {
                let arr = Array::new();
                for export_name in guard.iter() {
                    arr.push(&JsValue::from_str(export_name));
                }
                return arr;
            }
        }

        Array::new()
    }

    /// loads file contents and id
    pub(crate) async fn load_file(
        &self,
        id: &str,
        importer: &str,
    ) -> Result<(String, String), TransformError> {
        let promise = self
            .load_file
            .call2(
                &JsValue::UNDEFINED,
                &JsValue::from_str(id),
                &JsValue::from_str(importer),
            )
            .unwrap();
        let future = wasm_bindgen_futures::JsFuture::from(js_sys::Promise::from(promise));
        let ret = future
            .await
            .map_err(|cause| TransformError::ReadFileError {
                filepath: id.to_string(),
                cause,
            })?;

        let arr = Array::from(&ret);
        let mut arr = arr
            .into_iter()
            .map(|v| v.as_string().unwrap())
            .collect::<Vec<String>>();

        let filepath = arr.remove(0);
        let code = arr.remove(0);

        Ok((filepath, code))
    }
}
