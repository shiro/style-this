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
    pub(crate) value_cache_ref: String,
    pub(crate) css_extension: String,
    pub(crate) wrap_selectors_with_global: bool,

    pub(crate) use_require: bool,
    pub(crate) debug: bool,
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

        let random_suffix = crate::utils::generate_random_id(8);

        let css_cache = js_sys::Reflect::get(&opts, &JsValue::from_str("cssCache")).unwrap();
        let css_file_store_ref = format!("{PREFIX}_css_{random_suffix}");
        js_sys::Reflect::set(&global, &JsValue::from_str(&css_file_store_ref), &css_cache).unwrap();

        let value_cache = js_sys::Reflect::get(&opts, &JsValue::from_str("valueCache")).unwrap();
        let value_cache_ref = format!("{PREFIX}_vars_{random_suffix}");
        js_sys::Reflect::set(&global, &JsValue::from_str(&value_cache_ref), &value_cache).unwrap();

        let use_require = js_sys::Reflect::get(&opts, &JsValue::from_str("useRequire"))
            .unwrap()
            .as_bool()
            .unwrap_or_default();

        let debug = js_sys::Reflect::get(&opts, &JsValue::from_str("debug"))
            .unwrap()
            .as_bool()
            .unwrap_or_default();

        Self {
            cwd,
            ignored_imports,

            load_file,
            css_file_store_ref,
            value_cache_ref,
            css_extension,
            wrap_selectors_with_global,

            use_require,
            debug,
        }
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
