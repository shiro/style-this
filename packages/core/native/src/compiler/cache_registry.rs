use futures::lock::Mutex as FutureMutex;
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::rc::Rc;
use wasm_bindgen::prelude::*;

/// Registry for all caches used during CSS transformation.
/// Holds Rust-side VALUE_CACHE, ATOMIC_CSS_CACHE, and provides methods for accessing JS caches.
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
    /// Create a new CacheRegistry with the given JS cache references
    #[wasm_bindgen(constructor)]
    pub fn new(css_cache_ref: String, atomic_cache_ref: String, value_cache_ref: String) -> Self {
        Self {
            css_cache_ref,
            atomic_cache_ref,
            value_cache_ref,
            value_cache: Rc::new(RefCell::new(HashMap::new())),
            atomic_css_cache: Rc::new(RefCell::new(HashMap::new())),
        }
    }

    /// Get the CSS cache reference
    pub fn css_cache_ref(&self) -> String {
        self.css_cache_ref.clone()
    }

    /// Get the atomic cache reference
    pub fn atomic_cache_ref(&self) -> String {
        self.atomic_cache_ref.clone()
    }

    /// Get the value cache reference
    pub fn value_cache_ref(&self) -> String {
        self.value_cache_ref.clone()
    }
}

impl CacheRegistry {
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
