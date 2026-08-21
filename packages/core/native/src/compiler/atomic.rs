use super::cache_registry::CacheRegistry;
use super::transformer::Transformer;
use crate::LIBRARY_CORE_ATOMIC_IMPORT_NAME;
use oxc_ast::AstBuilder;
use oxc_ast::ast::{
    ImportDeclarationSpecifier, ImportOrExportKind, Program, Statement, WithClause,
};
use std::collections::HashMap;
use wasm_bindgen::prelude::*;

/// Represents a single CSS declaration (property: value)
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct CssDeclaration {
    pub property: String,
    pub value: String,
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
    let class_name = generate_atomic_hash(&key);
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
