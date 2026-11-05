use super::cache_registry::CacheRegistry;
use super::transformer::Transformer;
use crate::{LIBRARY_CORE_ATOMIC_IMPORT_NAME, LIBRARY_CORE_IMPORT_NAME};
use oxc_ast::AstBuilder;
use oxc_ast::ast::{
    ImportDeclarationSpecifier, ImportOrExportKind, Program, Statement, WithClause,
};
use once_cell::sync::Lazy;
use std::collections::{HashMap, HashSet};
use wasm_bindgen::prelude::*;

/// Represents a single CSS declaration (property: value)
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct CssDeclaration {
    pub property: String,
    pub value: String,
}

/// Property -> class prefix table, shared with the TS runtime (`mergeStyles`).
/// The JSON is a flat object without escapes, so every quoted string is either a key or a value.
static ATOMIC_PREFIXES: Lazy<HashMap<&'static str, &'static str>> = Lazy::new(|| {
    let json = include_str!("../../../src/atomicPrefixes.json");
    let strings: Vec<&'static str> = json.split('"').skip(1).step_by(2).collect();
    strings
        .chunks_exact(2)
        .map(|pair| (pair[0], pair[1]))
        .collect()
});

pub fn atomic_prefix(property: &str) -> Option<&'static str> {
    ATOMIC_PREFIXES
        .get(property.trim().to_ascii_lowercase().as_str())
        .copied()
}

pub fn declaration_property(declaration: &str) -> &str {
    declaration
        .split_once(':')
        .map(|(property, _)| property.trim())
        .unwrap_or("")
}

/// Shorthands get a lower rank than their longhands so that longhands are emitted later and win
/// (e.g. `margin` before `margin-top`).
fn property_rank(property: &str) -> usize {
    let property = property.to_ascii_lowercase();
    let dashes = property.trim_start_matches('-').matches('-').count();
    match property.as_str() {
        "top" | "right" | "bottom" | "left" => 1,
        "flex-flow" | "place-items" | "place-content" | "place-self" | "grid-area" => 0,
        _ => dashes,
    }
}

/// Sort atomic rules (declaration, class name) deterministically, shorthands first.
pub fn sort_atomic_rules(rules: &mut [(&String, &String)]) {
    rules.sort_by(|(decl_a, class_a), (decl_b, class_b)| {
        property_rank(declaration_property(decl_a))
            .cmp(&property_rank(declaration_property(decl_b)))
            .then_with(|| class_a.cmp(class_b))
            .then_with(|| decl_a.cmp(decl_b))
    });
}

/// Generate the atomic class name for a declaration, `<prefix>-<hash>` for supported properties
/// and a bare hash otherwise. The hash only depends on the declaration, so it's stable across builds.
pub fn generate_atomic_class_name(statement: &str) -> String {
    let hash = generate_atomic_hash(statement);
    match atomic_prefix(declaration_property(statement)) {
        Some(prefix) => format!("{prefix}-{hash}"),
        None => hash,
    }
}

/// Keep only the last declaration of each prefixed property, mirroring `mergeStyles` semantics.
pub fn dedupe_atomic_declarations(declarations: Vec<String>) -> Vec<String> {
    let mut seen = HashSet::new();
    let mut result: Vec<String> = declarations
        .into_iter()
        .rev()
        .filter(|decl| match atomic_prefix(declaration_property(decl)) {
            Some(prefix) => seen.insert(prefix),
            None => true,
        })
        .collect();
    result.reverse();
    result
}

/// Generate a deterministic 5-character hash from a full CSS declaration statement (e.g., "color: red")
pub fn generate_atomic_hash(statement: &str) -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};

    let input = statement.trim();
    let mut hasher = DefaultHasher::new();
    input.hash(&mut hasher);
    let hash = hasher.finish();

    let first_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_";
    let mut result = String::new();
    let mut n = hash;

    result.push(first_chars.chars().nth((n % 52) as usize).unwrap());
    n /= 52;

    for _ in 0..4 {
        result.push(chars.chars().nth((n % 64) as usize).unwrap());
        n /= 64;
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

/// Create atomic class for a CSS declaration
pub fn add_atomic(declaration: &str, cache_registry: &CacheRegistry) -> String {
    let key = declaration.trim().to_string();
    let class_name = generate_atomic_class_name(&key);
    cache_registry.insert_atomic_class(key, class_name.clone());
    class_name
}

/// Transform @style-this/core/atomic imports into virtual module imports
pub fn transform_atomic_entrypoint<'alloc>(
    program: &mut Program<'alloc>,
    ast_builder: &'alloc AstBuilder<'alloc>,
    transformer: &Transformer,
    program_filepath: &str,
) {
    if !transformer.atomic {
        return;
    }

    let mut indices_to_replace = vec![];
    for (idx, stmt) in program.body.iter().enumerate() {
        let Statement::ImportDeclaration(import_decl) = stmt else {
            break;
        };

        if import_decl.source.value.as_str() == LIBRARY_CORE_ATOMIC_IMPORT_NAME {
            indices_to_replace.push(idx);
        }
    }

    // Replace the imports
    for idx in indices_to_replace.into_iter().rev() {
        let atomic_css_path = "virtual:style-this:__atomic_entrypoint.css".to_string();

        // Create new import declaration with transformed source
        let new_import = ast_builder.alloc_import_declaration(
            program.span,
            None, // side-effect import
            ast_builder.string_literal(program.span, ast_builder.atom(&atomic_css_path), None),
            None,
            None::<oxc_allocator::Box<WithClause>>,
            ImportOrExportKind::Value,
        );

        program.body[idx] = Statement::ImportDeclaration(new_import);
    }
}

/// In non-atomic mode there are no atomic classes to de-dupe, so `mergeStyles` imports from
/// `@style-this/core` are swapped for the plain `joinStyles`.
pub fn rewrite_merge_styles_imports<'alloc>(
    program: &mut Program<'alloc>,
    ast_builder: &AstBuilder<'alloc>,
) -> bool {
    use oxc_ast::ast::ModuleExportName;

    let mut rewrote = false;
    for stmt in program.body.iter_mut() {
        let Statement::ImportDeclaration(import_decl) = stmt else {
            continue;
        };
        if import_decl.source.value.as_str() != LIBRARY_CORE_IMPORT_NAME {
            continue;
        }
        let Some(specifiers) = import_decl.specifiers.as_mut() else {
            continue;
        };
        for specifier in specifiers.iter_mut() {
            if let ImportDeclarationSpecifier::ImportSpecifier(spec) = specifier
                && spec.imported.name() == "mergeStyles"
            {
                spec.imported = ModuleExportName::IdentifierName(
                    ast_builder.identifier_name(spec.span, ast_builder.atom("joinStyles")),
                );
                rewrote = true;
            }
        }
    }
    rewrote
}

/// Insert a namespace import for the atomic .style-this.js module in atomic mode
/// Creates: import * as _styleThisClasses from "virtual:style-this:filename.style-this.js"
pub fn insert_virtual_atomic_program_import<'alloc>(
    program: &mut Program<'alloc>,
    ast_builder: &'alloc AstBuilder<'alloc>,
    program_filepath: &str,
) {
    // Create: import * as _styleThisClasses from "virtual:style-this:filename.style-this.js"
    use oxc_ast::ast::ImportNamespaceSpecifier;

    let namespace_specifier = ast_builder.alloc(ImportNamespaceSpecifier {
        span: program.span,
        local: ast_builder.binding_identifier(program.span, ast_builder.atom("_styleThisClasses")),
    });

    let specifiers = ast_builder.vec1(ImportDeclarationSpecifier::ImportNamespaceSpecifier(
        namespace_specifier,
    ));

    // Extract just the filename from the full path
    let filename = program_filepath
        .split('/')
        .next_back()
        .unwrap_or(program_filepath);

    // Create import path with just the filename: virtual:style-this:filename.style-this.js
    let style_this_import_source = format!("virtual:style-this:./{}.style-this.js", filename);

    let style_this_import = ast_builder.alloc_import_declaration(
        program.span,
        Some(specifiers),
        ast_builder.string_literal(
            program.span,
            ast_builder.atom(&style_this_import_source),
            None,
        ),
        None,
        None::<oxc_allocator::Box<WithClause>>,
        ImportOrExportKind::Value,
    );

    let insert_pos = program
        .body
        .iter()
        .position(|stmt| !matches!(stmt, Statement::ImportDeclaration(_)))
        .unwrap_or(0);

    program
        .body
        .insert(insert_pos, Statement::ImportDeclaration(style_this_import));
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn prefixes_are_unique() {
        let mut seen = HashSet::new();
        for prefix in ATOMIC_PREFIXES.values() {
            assert!(seen.insert(*prefix), "duplicate atomic prefix '{prefix}'");
        }
        assert!(ATOMIC_PREFIXES.len() > 100);
    }

    #[test]
    fn class_name_is_prefixed_hash() {
        assert_eq!(atomic_prefix("margin"), Some("m"));
        assert_eq!(atomic_prefix(" Padding-Top "), Some("pt"));
        assert_eq!(
            generate_atomic_class_name("margin: 8px"),
            format!("m-{}", generate_atomic_hash("margin: 8px"))
        );
        assert_eq!(generate_atomic_class_name("margin: 8px"), "m-eu2PP");
        assert_eq!(generate_atomic_class_name("color: red"), "c-tMpWo");
    }

    #[test]
    fn class_name_edge_cases() {
        // property is matched case-insensitively, but the hash covers the exact declaration
        assert!(generate_atomic_class_name("MARGIN: 8px").starts_with("m-"));
        assert!(generate_atomic_class_name("margin: 8px !important").starts_with("m-"));
        assert!(generate_atomic_class_name("min-width: 0").starts_with("min-w-"));
        assert!(
            generate_atomic_class_name("grid-template-areas:\n  \"a b\"\n  \"c d\"")
                .starts_with("grid-areas-")
        );
        // surrounding whitespace doesn't affect the class
        assert_eq!(
            generate_atomic_class_name("  margin: 8px  "),
            generate_atomic_class_name("margin: 8px")
        );
        assert_ne!(
            generate_atomic_class_name("margin: 8px"),
            generate_atomic_class_name("margin: 9px")
        );
        for decl in ["margin: 8px", "background: url(a:b)", "content: ':'"] {
            let class = generate_atomic_class_name(decl);
            let hash = &class[class.len() - 5..];
            assert_eq!(&class[class.len() - 6..class.len() - 5], "-");
            assert!(hash.chars().next().unwrap().is_ascii_alphabetic());
        }
        assert!(generate_atomic_class_name("background: url(a:b)").starts_with("bg-"));
    }

    #[test]
    fn unsupported_property_uses_bare_hash() {
        for decl in ["-webkit-line-clamp: 3", "--custom: 1", "foo: bar", "nonsense"] {
            assert_eq!(generate_atomic_class_name(decl), generate_atomic_hash(decl));
            assert_eq!(generate_atomic_class_name(decl).len(), 5);
        }
    }

    #[test]
    fn dedupe_keeps_last_declaration_per_prefix() {
        let result = dedupe_atomic_declarations(vec![
            "padding: 16px".to_string(),
            "margin: 1px".to_string(),
            "-webkit-line-clamp: 2".to_string(),
            "padding: 8px".to_string(),
            "-webkit-line-clamp: 3".to_string(),
        ]);
        assert_eq!(
            result,
            vec![
                "margin: 1px",
                "-webkit-line-clamp: 2",
                "padding: 8px",
                "-webkit-line-clamp: 3",
            ]
        );
    }

    #[test]
    fn shorthands_sort_before_longhands() {
        let decls = ["margin-top: 1px", "margin: 0", "top: 0", "inset: 0", "flex-direction: row", "flex-flow: row"]
            .map(String::from);
        let classes = decls.clone().map(|d| generate_atomic_class_name(&d));
        let mut entries: Vec<(&String, &String)> = decls.iter().zip(classes.iter()).collect();
        sort_atomic_rules(&mut entries);
        let order: Vec<&str> = entries.iter().map(|(d, _)| d.as_str()).collect();
        let pos = |d: &str| order.iter().position(|o| *o == d).unwrap();
        assert!(pos("margin: 0") < pos("margin-top: 1px"));
        assert!(pos("inset: 0") < pos("top: 0"));
        assert!(pos("flex-flow: row") < pos("flex-direction: row"));
    }
}
