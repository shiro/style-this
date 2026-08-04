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
    // CSS class names cannot start with a digit, so we use different sets for first and rest
    let first_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let mut result = String::new();
    let mut n = hash;
    
    // First character from letters only
    result.push(first_chars.chars().nth((n % 52) as usize).unwrap());
    n /= 52;
    
    // Remaining 4 characters from full set
    for _ in 0..4 {
        result.push(chars.chars().nth((n % 62) as usize).unwrap());
        n /= 62;
    }
    
    result
}

/// Parse CSS string into individual declarations
/// Handles nested braces, media queries, at-rules, and nested selectors
pub fn parse_css_declarations(css: &str) -> Vec<CssDeclaration> {
    let mut declarations = Vec::new();
    let css = css.trim();
    
    parse_css_recursive(css, &mut declarations);
    
    declarations
}

/// Recursively parse CSS, extracting declarations at all nesting levels
fn parse_css_recursive(css: &str, declarations: &mut Vec<CssDeclaration>) {
    let mut current_prop = String::new();
    let mut current_value = String::new();
    let mut in_property = true;
    let mut brace_depth = 0;
    let mut paren_depth = 0;
    let mut current_block = String::new();
    
    let chars: Vec<char> = css.chars().collect();
    let mut i = 0;
    
    while i < chars.len() {
        let ch = chars[i];
        
        match ch {
            '{' => {
                if brace_depth == 0 {
                    // We're entering a new block (media query, selector, etc.)
                    // Save current declaration if we were building one
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
                brace_depth += 1;
                current_block.push(ch);
            }
            '}' => {
                brace_depth -= 1;
                current_block.push(ch);
                
                if brace_depth == 0 {
                    // End of a nested block - recursively parse it
                    let block_content = current_block.trim();
                    if !block_content.is_empty() {
                        // Find the content inside braces
                        if let Some(start) = block_content.find('{') {
                            if let Some(end) = block_content.rfind('}') {
                                let inner = &block_content[start + 1..end];
                                parse_css_recursive(inner, declarations);
                            }
                        }
                    }
                    current_block.clear();
                }
            }
            '(' => {
                paren_depth += 1;
                if brace_depth == 0 {
                    if !in_property {
                        current_value.push(ch);
                    }
                } else {
                    current_block.push(ch);
                }
            }
            ')' => {
                paren_depth -= 1;
                if brace_depth == 0 {
                    if !in_property {
                        current_value.push(ch);
                    }
                } else {
                    current_block.push(ch);
                }
            }
            ':' if brace_depth == 0 && paren_depth == 0 && in_property => {
                in_property = false;
            }
            ';' if brace_depth == 0 && paren_depth == 0 => {
                // End of declaration at top level
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
                if brace_depth == 0 {
                    if in_property {
                        current_prop.push(ch);
                    } else {
                        current_value.push(ch);
                    }
                } else {
                    current_block.push(ch);
                }
            }
        }
        
        i += 1;
    }
    
    // Handle last declaration if no trailing semicolon at top level
    if brace_depth == 0 {
        let prop = current_prop.trim().to_string();
        let val = current_value.trim().to_string();
        
        if !prop.is_empty() && !val.is_empty() {
            declarations.push(CssDeclaration {
                property: prop,
                value: val,
            });
        }
    }
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

/// Extract the non-atomizable CSS (media queries, nested selectors, etc.)
/// This preserves the CSS structure that cannot be converted to atomic classes
pub fn extract_non_atomic_css(css: &str) -> String {
    let mut result = String::new();
    let mut brace_depth = 0;
    let mut in_block = false;
    let mut current_block = String::new();
    let mut block_selector = String::new();
    
    let chars: Vec<char> = css.chars().collect();
    let mut i = 0;
    
    while i < chars.len() {
        let ch = chars[i];
        
        match ch {
            '{' => {
                if brace_depth == 0 {
                    // Start of a new block - save the selector
                    in_block = true;
                    block_selector = current_block.trim().to_string();
                    current_block.clear();
                }
                brace_depth += 1;
                current_block.push(ch);
            }
            '}' => {
                brace_depth -= 1;
                current_block.push(ch);
                
                if brace_depth == 0 && in_block {
                    // End of a block - check if it has non-top-level content
                    let block_content = current_block.trim();
                    if !block_content.is_empty() && !block_selector.is_empty() {
                        // This is a nested block (media query, selector, etc.)
                        // Include it as-is in the non-atomic CSS
                        result.push_str(&block_selector);
                        result.push_str(" ");
                        result.push_str(block_content);
                        result.push('\n');
                    }
                    current_block.clear();
                    in_block = false;
                }
            }
            _ => {
                if brace_depth == 0 {
                    current_block.push(ch);
                } else {
                    current_block.push(ch);
                }
            }
        }
        
        i += 1;
    }
    
    result.trim().to_string()
}

/// Get all collected atomic CSS rules collected so far
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

/// Extract non-atomizable CSS like media queries and nested selectors (JavaScript API)
#[wasm_bindgen]
pub fn extract_non_atomic_css_js(css: &str) -> String {
    extract_non_atomic_css(css)
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

    #[test]
    fn test_parse_media_queries() {
        clear_atomic_cache();
        
        let css = "background: red; @media (max-width: 500px) { background: blue; }";
        let decls = parse_css_declarations(css);
        
        // Should extract both background declarations
        assert_eq!(decls.len(), 2);
        let has_red = decls.iter().any(|d| d.property == "background" && d.value == "red");
        let has_blue = decls.iter().any(|d| d.property == "background" && d.value == "blue");
        assert!(has_red, "Should extract background: red from top level");
        assert!(has_blue, "Should extract background: blue from media query");
    }

    #[test]
    fn test_parse_nested_selectors() {
        clear_atomic_cache();
        
        let css = "padding: 20px; &:hover { color: red; } > div { margin: 10px; }";
        let decls = parse_css_declarations(css);
        
        // Debug: print what we extracted
        for decl in &decls {
            eprintln!("Extracted: {}: {}", decl.property, decl.value);
        }
        
        // Should extract all three declarations
        assert!(decls.iter().any(|d| d.property == "padding"), "Should extract padding");
        assert!(decls.iter().any(|d| d.property == "color"), "Should extract color");
        assert!(decls.iter().any(|d| d.property == "margin"), "Should extract margin");
    }

    #[test]
    fn test_parse_complex_media_queries() {
        clear_atomic_cache();
        
        let css = r#"
            width: 100%;
            @media (max-width: 768px) {
                width: 90%;
                @media (max-width: 500px) {
                    width: 80%;
                }
            }
        "#;
        let decls = parse_css_declarations(css);
        
        // Should extract all width declarations
        let width_decls: Vec<_> = decls.iter().filter(|d| d.property == "width").collect();
        assert_eq!(width_decls.len(), 3, "Should extract all 3 width declarations");
        assert!(width_decls.iter().any(|d| d.value == "100%"));
        assert!(width_decls.iter().any(|d| d.value == "90%"));
        assert!(width_decls.iter().any(|d| d.value == "80%"));
    }
}
