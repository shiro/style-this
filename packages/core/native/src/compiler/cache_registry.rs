use futures::lock::Mutex as FutureMutex;
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::rc::Rc;
use wasm_bindgen::prelude::*;

/// Registry for all caches used during CSS transformation.
/// Holds Rust-side VALUE_CACHE, ATOMIC_CSS_CACHE, and owns JS-side caches.
#[wasm_bindgen]
#[derive(Clone)]
pub struct CacheRegistry {
    /// Reference to JS CSS cache (for .css files)
    css_cache_ref: String,
    /// Reference to JS atomic CSS cache (for .style-this.js files)
    atomic_cache_ref: String,
    /// Reference to JS value cache
    value_cache_ref: String,
    /// Rust-side value cache - stores evaluated identifiers per file
    value_cache: Rc<RefCell<HashMap<String, Rc<FutureMutex<HashSet<String>>>>>>,
    /// Rust-side atomic CSS class cache - Maps CSS declaration to atomic class name
    /// e.g., "margin-top:10px" -> "a1b2c"
    atomic_css_cache: Rc<RefCell<HashMap<String, String>>>,
}

#[wasm_bindgen]
impl CacheRegistry {
    /// Create a new CacheRegistry with default JS caches
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        // Generate unique refs for this registry instance
        let css_cache_ref = format!("__style_this_css_cache_{}", Self::random_id());
        let atomic_cache_ref = format!("__style_this_atomic_cache_{}", Self::random_id());
        let value_cache_ref = format!("__style_this_value_cache_{}", Self::random_id());

        // Initialize the JS-side caches in global scope
        Self::init_caches(&css_cache_ref, &atomic_cache_ref, &value_cache_ref);

        Self {
            css_cache_ref,
            atomic_cache_ref,
            value_cache_ref,
            value_cache: Rc::new(RefCell::new(HashMap::new())),
            atomic_css_cache: Rc::new(RefCell::new(HashMap::new())),
        }
    }

    /// Create a new CacheRegistry from an existing JS CacheRegistry
    /// This creates global refs that point to the TS CacheRegistry's existing cache objects
    pub fn from_js_cache_registry(
        js_cache_registry: JsValue,
        css_cache_ref: String,
        atomic_cache_ref: String,
        value_cache_ref: String,
    ) -> Self {
        // Extract the existing cache objects from the TS CacheRegistry
        // The TS version stores them as private fields, so we need to create refs to them
        // The Rust code will have already called initializeRefs on the TS side
        // which stores the cache Maps in global scope under the provided ref names
        
        Self {
            css_cache_ref,
            atomic_cache_ref,
            value_cache_ref,
            value_cache: Rc::new(RefCell::new(HashMap::new())),
            atomic_css_cache: Rc::new(RefCell::new(HashMap::new())),
        }
    }

    /// Get the CSS cache reference (for internal Rust use with JS eval)
    pub fn css_cache_ref(&self) -> String {
        self.css_cache_ref.clone()
    }

    /// Get the atomic cache reference (for internal Rust use with JS eval)
    pub fn atomic_cache_ref(&self) -> String {
        self.atomic_cache_ref.clone()
    }

    /// Get the value cache reference (for internal Rust use with JS eval)
    pub fn value_cache_ref(&self) -> String {
        self.value_cache_ref.clone()
    }

    /// Invalidate a module by removing it from both CSS and atomic caches
    pub fn invalidate_module(&self, filepath: &str) {
        let css_key = format!("{}.css", filepath);
        let atomic_key = format!("{}.style-this.js", filepath);
        
        Self::delete_from_cache(&self.css_cache_ref, &css_key);
        Self::delete_from_cache(&self.atomic_cache_ref, &atomic_key);
    }

    /// Delete a CSS cache entry
    pub fn delete_css_module(&self, filepath: &str) {
        let css_key = format!("{}.css", filepath);
        Self::delete_from_cache(&self.css_cache_ref, &css_key);
    }

    /// Delete an atomic cache entry
    pub fn delete_atomic_module(&self, filepath: &str) {
        let atomic_key = format!("{}.style-this.js", filepath);
        Self::delete_from_cache(&self.atomic_cache_ref, &atomic_key);
    }

    /// Delete a value cache entry
    pub fn delete_value_cache_entry(&self, filepath: &str) {
        Self::delete_from_cache(&self.value_cache_ref, filepath);
    }

    /// Check if CSS module exists in cache
    pub fn has_css_module(&self, filepath: &str) -> bool {
        let css_key = format!("{}.css", filepath);
        Self::has_in_cache(&self.css_cache_ref, &css_key)
    }

    /// Check if atomic module exists in cache
    pub fn has_atomic_module(&self, filepath: &str) -> bool {
        let atomic_key = format!("{}.style-this.js", filepath);
        Self::has_in_cache(&self.atomic_cache_ref, &atomic_key)
    }

    /// Get CSS module from cache
    pub fn get_css_module(&self, filepath: &str) -> JsValue {
        let css_key = format!("{}.css", filepath);
        Self::get_from_cache(&self.css_cache_ref, &css_key)
    }

    /// Get atomic module from cache
    pub fn get_atomic_module(&self, filepath: &str) -> JsValue {
        let atomic_key = format!("{}.style-this.js", filepath);
        Self::get_from_cache(&self.atomic_cache_ref, &atomic_key)
    }

    /// Set CSS module in cache
    pub fn set_css_module(&self, filepath: &str, value: JsValue) {
        let css_key = format!("{}.css", filepath);
        Self::set_in_cache(&self.css_cache_ref, &css_key, value);
    }

    /// Set atomic module in cache
    pub fn set_atomic_module(&self, filepath: &str, value: JsValue) {
        let atomic_key = format!("{}.style-this.js", filepath);
        Self::set_in_cache(&self.atomic_cache_ref, &atomic_key, value);
    }
}

impl CacheRegistry {
    /// Generate a random ID for unique cache references
    fn random_id() -> String {
        // Use timestamp for uniqueness
        let now = js_sys::Date::now() as u64;
        format!("{:x}", now % 1000000)
    }

    /// Initialize JS-side caches in global scope
    fn init_caches(css_cache_ref: &str, atomic_cache_ref: &str, value_cache_ref: &str) {
        let global = js_sys::global();
        
        // Create Map constructors and set them in global scope
        let css_map = js_sys::Map::new();
        let atomic_map = js_sys::Map::new();
        let value_map = js_sys::Map::new();
        
        let _ = js_sys::Reflect::set(&global, &JsValue::from_str(css_cache_ref), &css_map);
        let _ = js_sys::Reflect::set(&global, &JsValue::from_str(atomic_cache_ref), &atomic_map);
        let _ = js_sys::Reflect::set(&global, &JsValue::from_str(value_cache_ref), &value_map);
    }

    /// Delete a value from a cache by key
    fn delete_from_cache(cache_ref: &str, key: &str) {
        let global = js_sys::global();
        
        // Get the cache Map from global
        if let Ok(cache) = js_sys::Reflect::get(&global, &JsValue::from_str(cache_ref)) {
            if !cache.is_undefined() && !cache.is_null() {
                // Call cache.delete(key) using Reflect
                let key_value = JsValue::from_str(key);
                let _ = js_sys::Reflect::apply(
                    &js_sys::Reflect::get(&cache, &JsValue::from_str("delete"))
                        .unwrap_or(JsValue::null())
                        .unchecked_ref::<js_sys::Function>(),
                    &cache,
                    &js_sys::Array::of1(&key_value),
                );
            }
        }
    }

    /// Check if a key exists in a cache
    fn has_in_cache(cache_ref: &str, key: &str) -> bool {
        let global = js_sys::global();
        
        if let Ok(cache) = js_sys::Reflect::get(&global, &JsValue::from_str(cache_ref)) {
            if !cache.is_undefined() && !cache.is_null() {
                let key_value = JsValue::from_str(key);
                if let Ok(result) = js_sys::Reflect::apply(
                    &js_sys::Reflect::get(&cache, &JsValue::from_str("has"))
                        .unwrap_or(JsValue::null())
                        .unchecked_ref::<js_sys::Function>(),
                    &cache,
                    &js_sys::Array::of1(&key_value),
                ) {
                    return result.is_truthy();
                }
            }
        }
        false
    }

    /// Get a value from a cache by key
    fn get_from_cache(cache_ref: &str, key: &str) -> JsValue {
        let global = js_sys::global();
        
        if let Ok(cache) = js_sys::Reflect::get(&global, &JsValue::from_str(cache_ref)) {
            if !cache.is_undefined() && !cache.is_null() {
                let key_value = JsValue::from_str(key);
                if let Ok(result) = js_sys::Reflect::apply(
                    &js_sys::Reflect::get(&cache, &JsValue::from_str("get"))
                        .unwrap_or(JsValue::null())
                        .unchecked_ref::<js_sys::Function>(),
                    &cache,
                    &js_sys::Array::of1(&key_value),
                ) {
                    return result;
                }
            }
        }
        JsValue::undefined()
    }

    /// Set a value in a cache by key
    fn set_in_cache(cache_ref: &str, key: &str, value: JsValue) {
        let global = js_sys::global();
        
        if let Ok(cache) = js_sys::Reflect::get(&global, &JsValue::from_str(cache_ref)) {
            if !cache.is_undefined() && !cache.is_null() {
                let key_value = JsValue::from_str(key);
                let args = js_sys::Array::of2(&key_value, &value);
                let _ = js_sys::Reflect::apply(
                    &js_sys::Reflect::get(&cache, &JsValue::from_str("set"))
                        .unwrap_or(JsValue::null())
                        .unchecked_ref::<js_sys::Function>(),
                    &cache,
                    &args,
                );
            }
        }
    }

    /// Get or create the value cache for a specific file
    pub fn get_or_create_value_cache(
        &self,
        filepath: String,
    ) -> Rc<FutureMutex<HashSet<String>>> {
        let mut cache = self.value_cache.borrow_mut();
        cache
            .entry(filepath)
            .or_insert_with(|| Rc::new(FutureMutex::new(HashSet::new())))
            .clone()
    }

    /// Insert an atomic CSS class into the cache
    pub fn insert_atomic_class(&self, declaration: String, class_name: String) {
        self.atomic_css_cache.borrow_mut().insert(declaration, class_name);
    }

    /// Get an atomic CSS class from the cache
    pub fn get_atomic_class(&self, declaration: &str) -> Option<String> {
        self.atomic_css_cache.borrow().get(declaration).cloned()
    }

    /// Get all atomic CSS rules as a string
    pub fn get_all_atomic_css(&self) -> String {
        let cache = self.atomic_css_cache.borrow();
        let mut rules: Vec<String> = cache
            .iter()
            .map(|(declaration, class_name)| format!(".{} {{ {} }}", class_name, declaration))
            .collect();
        rules.sort(); // Ensure deterministic output
        rules.join("\n")
    }

    /// Clear all caches
    pub fn clear(&self) {
        self.value_cache.borrow_mut().clear();
        self.atomic_css_cache.borrow_mut().clear();
    }

    /// Clear value cache for a specific file
    pub fn clear_file(&self, filepath: &str) {
        self.value_cache.borrow_mut().remove(filepath);
    }
}

