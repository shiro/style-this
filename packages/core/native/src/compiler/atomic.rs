use std::collections::HashMap;
use std::sync::Mutex;
use once_cell::sync::Lazy;
use wasm_bindgen::prelude::*;

/// Global cache for atomic CSS classes
/// Maps CSS declaration (e.g., "margin-top:10px") to atomic class name (e.g., "a1b2c")
pub static ATOMIC_CSS_CACHE: Lazy<Mutex<HashMap<String, String>>> = Lazy::new(|| {
    Mutex::new(HashMap::new())
});

/// Represents a single CSS declaration (property: value)
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct CssDeclaration {
    pub property: String,
    pub value: String,
}

/// Generate a deterministic 5-character hash from CSS declaration
pub fn generate_atomic_hash(property: &str, value: &str) -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    
    let input = format!("{}:{}", property.trim(), value.trim());
    let mut hasher = DefaultHasher::new();
    input.hash(&mut hasher);
    let hash = hasher.finish();
    
    // Convert to base62 (alphanumeric) for shorter, URL-safe identifiers
    let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let mut result = String::new();
    let mut n = hash;
    
    for _ in 0..5 {
        result.push(chars.chars().nth((n % 62) as usize).unwrap());
        n /= 62;
    }
    
    result
}

/// Parse CSS string into individual declarations
/// Handles nested braces, media queries, etc.
pub fn parse_css_declarations(css: &str) -> Vec<CssDeclaration> {
    let mut declarations = Vec::new();
    let css = css.trim();
    
    // Simple state machine parser
    let mut current_prop = String::new();
    let mut current_value = String::new();
    let mut in_property = true;
    let mut brace_depth = 0;
    let mut paren_depth = 0;
    
    let chars: Vec<char> = css.chars().collect();
    let mut i = 0;
    
    while i < chars.len() {
        let ch = chars[i];
        
        match ch {
            '{' => {
                brace_depth += 1;
                if brace_depth > 0 && !in_property {
                    current_value.push(ch);
                }
            }
            '}' => {
                brace_depth -= 1;
                if brace_depth >= 0 && !in_property {
                    current_value.push(ch);
                }
            }
            '(' => {
                paren_depth += 1;
                if !in_property {
                    current_value.push(ch);
                }
            }
            ')' => {
                paren_depth -= 1;
                if !in_property {
                    current_value.push(ch);
                }
            }
            ':' if brace_depth == 0 && paren_depth == 0 && in_property => {
                in_property = false;
            }
            ';' if brace_depth == 0 && paren_depth == 0 => {
                // End of declaration
                let prop = current_prop.trim().to_string();
                let val = current_value.trim().to_string();
                
                if !prop.is_empty() && !val.is_empty() {
                    declarations.push(CssDeclaration {
                        property: prop,
                        value: val,
                    });
                }
                
                current_prop.clear();
                current_value.clear();
                in_property = true;
            }
            _ => {
                if in_property {
                    current_prop.push(ch);
                } else {
                    current_value.push(ch);
                }
            }
        }
        
        i += 1;
    }
    
    // Handle last declaration if no trailing semicolon
    let prop = current_prop.trim().to_string();
    let val = current_value.trim().to_string();
    
    if !prop.is_empty() && !val.is_empty() {
        declarations.push(CssDeclaration {
            property: prop,
            value: val,
        });
    }
    
    declarations
}

/// Get or create atomic class for a CSS declaration
pub fn get_atomic_class(property: &str, value: &str) -> String {
    let key = format!("{}:{}", property.trim(), value.trim());
    
    let mut cache = ATOMIC_CSS_CACHE.lock().unwrap();
    
    if let Some(class_name) = cache.get(&key) {
        return class_name.clone();
    }
    
    let class_name = generate_atomic_hash(property, value);
    cache.insert(key, class_name.clone());
    
    class_name
}

/// Convert a block of CSS into atomic classes and return the class list
pub fn css_to_atomic_classes(css: &str) -> Vec<String> {
    let declarations = parse_css_declarations(css);
    declarations
        .into_iter()
        .map(|decl| get_atomic_class(&decl.property, &decl.value))
        .collect()
}

/// Get all atomic CSS rules collected so far
pub fn get_all_atomic_css() -> String {
    let cache = ATOMIC_CSS_CACHE.lock().unwrap();
    
    let mut rules: Vec<String> = cache
        .iter()
        .map(|(declaration, class_name)| {
            format!(".{} {{ {} }}", class_name, declaration)
        })
        .collect();
    
    rules.sort(); // Ensure deterministic output
    rules.join("\n")
}

/// Clear the atomic CSS cache (useful for testing/HMR)
#[allow(dead_code)]
pub fn clear_atomic_cache() {
    let mut cache = ATOMIC_CSS_CACHE.lock().unwrap();
    cache.clear();
}

// Wasm-bindgen exports for JavaScript interop

/// Parse CSS and return space-separated atomic class names (JavaScript API)
#[wasm_bindgen]
pub fn css_to_atomic_class_list(css: &str) -> String {
    css_to_atomic_classes(css).join(" ")
}

/// Get all collected atomic CSS (JavaScript API)
#[wasm_bindgen]
pub fn get_atomic_css() -> String {
    get_all_atomic_css()
}

/// Clear the atomic cache (JavaScript API)
#[wasm_bindgen]
pub fn clear_atomic_css_cache() {
    clear_atomic_cache();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_atomic_hash() {
        let hash1 = generate_atomic_hash("margin-top", "10px");
        let hash2 = generate_atomic_hash("margin-top", "10px");
        let hash3 = generate_atomic_hash("margin-top", "20px");
        
        assert_eq!(hash1, hash2, "Same input should generate same hash");
        assert_ne!(hash1, hash3, "Different input should generate different hash");
        assert_eq!(hash1.len(), 5, "Hash should be 5 characters");
    }

    #[test]
    fn test_parse_css_declarations() {
        let css = "margin-top: 10px; padding: 20px;";
        let decls = parse_css_declarations(css);
        
        assert_eq!(decls.len(), 2);
        assert_eq!(decls[0].property, "margin-top");
        assert_eq!(decls[0].value, "10px");
        assert_eq!(decls[1].property, "padding");
        assert_eq!(decls[1].value, "20px");
    }

    #[test]
    fn test_parse_complex_css() {
        let css = "background: linear-gradient(to right, red, blue); border: 1px solid black;";
        let decls = parse_css_declarations(css);
        
        assert_eq!(decls.len(), 2);
        assert_eq!(decls[0].property, "background");
        assert!(decls[0].value.contains("linear-gradient"));
    }

    #[test]
    fn test_css_to_atomic_classes() {
        clear_atomic_cache();
        
        let css = "margin-top: 10px; padding: 20px;";
        let classes = css_to_atomic_classes(css);
        
        assert_eq!(classes.len(), 2);
        assert_eq!(classes[0].len(), 5);
        assert_eq!(classes[1].len(), 5);
    }
}
