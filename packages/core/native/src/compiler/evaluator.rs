use super::atomic::{insert_virtual_atomic_program_import, transform_atomic_entrypoint};
use super::css_parser;
use super::error::TransformError;
use super::transformer::Transformer;
use super::types::ExportedJSValue;
use super::visitor::VisitorTransformer;
use crate::compiler::atomic::add_atomic;
use crate::error_mapping;
use crate::react::react_prepass;
use crate::solid_js::solid_js_prepass;
use crate::utils::{self, transpile_ts_to_js};
use crate::{
    LIBRARY_CORE_IMPORT_NAME, LIBRARY_REACT_IMPORT_NAME, LIBRARY_SOLID_JS_IMPORT_NAME, PREFIX,
};
use indoc::formatdoc;
use oxc_allocator::{Allocator, CloneIn};
use oxc_ast::AstBuilder;
use oxc_ast::ast::{
    BindingPatternKind, Expression, ImportDeclarationSpecifier, ImportOrExportKind,
    ModuleExportName, Program, PropertyKey, Statement, VariableDeclarationKind, WithClause,
};
use oxc_ast_visit::VisitMut;
use oxc_codegen::{Codegen, CodegenOptions};
use oxc_parser::{ParseOptions, Parser};
use oxc_span::SourceType;
use std::cell::RefCell;
use std::collections::{BTreeSet, HashMap, HashSet};
use std::path::PathBuf;
use std::rc::Rc;
use std::str::FromStr;
use wasm_bindgen::prelude::*;

/// Wraps an eval program in an async IIFE with isolated globals
///
/// This prevents user code from accidentally (or maliciously) calling into Node's global,
/// accessing environment variables, or reaching other global state outside the CSS variables
/// we want to expose. Only the specified references are made available to the eval context.
///
/// Returns the wrapped program as JavaScript that returns a Promise.
fn wrap_eval_program(
    eval_program_js: &str,
    css_file_store_ref: &str,
    value_cache_ref: &str,
    require_ref: Option<&str>,
) -> String {
    if let Some(require_ref) = require_ref {
        formatdoc!(
            "
            const _global = {{
                {css_file_store_ref}: globalThis.{css_file_store_ref},
                {value_cache_ref}: globalThis.{value_cache_ref},
            }};
            
            const _require = (typeof globalThis !== 'undefined' && globalThis.{require_ref}) 
                || (typeof global !== 'undefined' && global.{require_ref})
                || (function() {{ throw new Error('require not found in globalThis or global'); }})();

            (async (require) => {{
                const global = _global;
                // start
    {eval_program_js}
            }})(_require)
            "
        )
    } else {
        formatdoc!(
            "
            const _global = {{
                {css_file_store_ref},
                {value_cache_ref},
            }};

            (async () => {{
                const global = _global;
                // start
    {eval_program_js}
            }})()
            "
        )
    }
}

/// Helper to get the local name from any import specifier type
fn get_import_local_name<'a>(specifier: &'a ImportDeclarationSpecifier<'a>) -> &'a str {
    match specifier {
        ImportDeclarationSpecifier::ImportSpecifier(import) => import.local.name.as_str(),
        ImportDeclarationSpecifier::ImportDefaultSpecifier(import) => import.local.name.as_str(),
        ImportDeclarationSpecifier::ImportNamespaceSpecifier(import) => import.local.name.as_str(),
    }
}

#[allow(clippy::too_many_arguments)]
/// Iterate over program's imports and run an evaluation on each of them we import referenced
/// identifiers from.
/// Then copy over imports into temporary program, but transform them into variable assignments.
fn evaluate_dependencies<'alloc>(
    program: &'alloc Program<'alloc>,
    ast_builder: &'alloc AstBuilder<'alloc>,
    transformer: &Transformer,
    referenced_idents: &HashSet<String>,
    namespace_imports: &mut HashMap<String, HashSet<String>>,
    eval_program: Rc<RefCell<Program<'alloc>>>,
    program_filepath: String,
    cwd: &str,
    temporary_programs: Rc<RefCell<HashMap<String, String>>>,
    skip_css_eval: bool,
) -> Vec<
    std::pin::Pin<
        std::boxed::Box<dyn futures::future::Future<Output = Result<(), TransformError>> + 'alloc>,
    >,
> {
    let mut futures = vec![];
    let cwd = cwd.to_string();

    // handle imports - resolve other modules and rewrite return values into variable declarations
    for stmt in program.body.iter() {
        let Statement::ImportDeclaration(import_declaration) = stmt else {
            break;
        };
        let remote_module_id = import_declaration.source.value.to_string();

        // Skip the virtual atomic CSS import - it should not be evaluated as a dependency
        // The atomic CSS file will be loaded separately by Vite when requested
        if remote_module_id.starts_with("virtual:style-this:")
            && remote_module_id.ends_with(".atomic.css")
        {
            continue;
        }

        // Skip virtual .style-this.js module imports - they are synthesized modules
        // that should not be treated as real dependencies to load and evaluate
        if remote_module_id.starts_with("virtual:style-this:")
            && remote_module_id.ends_with(".style-this.js")
        {
            continue;
        }

        let Some(specifiers) = &import_declaration.specifiers else {
            continue;
        };

        let mut remote_referenced_idents = namespace_imports
            .remove(&remote_module_id)
            .unwrap_or_default();

        let any_ident_referenced = specifiers.iter().any(|specifier| {
            let local_name = get_import_local_name(specifier);

            // if inside of ignored_imports, skip this import
            if let Some(ignored_list) = transformer.ignored_imports.get(&remote_module_id)
                && (ignored_list.is_empty() || ignored_list.contains(&local_name.to_string()))
            {
                return false;
            }

            referenced_idents.contains(local_name)
        });

        if !any_ident_referenced {
            continue;
        }

        let future: std::pin::Pin<
            std::boxed::Box<dyn futures::future::Future<Output = Result<(), TransformError>>>,
        > = {
            let tmp_program = eval_program.clone();
            let program_filepath = program_filepath.clone();
            let specifiers = specifiers.clone_in(ast_builder.allocator);
            let referenced_idents = referenced_idents.clone();
            let temporary_programs = temporary_programs.clone();
            let cwd = cwd.clone();
            let transformer =
                unsafe { std::mem::transmute::<&Transformer, &'static Transformer>(transformer) };

            Box::pin(async move {
                let (remote_filepath, code) = transformer
                    .load_file(&remote_module_id, &program_filepath)
                    .await
                    .unwrap();

                for specifier in specifiers.iter() {
                    // ignore `css` imports from us
                    if import_declaration.source.value == LIBRARY_CORE_IMPORT_NAME
                        && let ImportDeclarationSpecifier::ImportSpecifier(import_specifier) =
                            specifier
                        && !matches!(
                            &import_specifier.imported,
                            ModuleExportName::IdentifierName(identifier_name)
                            if identifier_name.name == "css"
                        )
                    {
                        continue;
                    }

                    let (local_name, remote_name, span) =
                        match specifier {
                            oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(
                                import_specifier,
                            ) => {
                                let local_name = import_specifier.local.name.to_string();
                                if !referenced_idents.contains(&local_name) {
                                    continue;
                                }

                                let remote_name = import_specifier.imported.to_string();
                                let span = import_specifier.span;

                                // node_modules imports
                                if code.is_empty() {
                                    let left = BindingPatternKind::ObjectPattern(
                                ast_builder.alloc_object_pattern(
                                    span,
                                    ast_builder.vec1(ast_builder.binding_property(
                                        span,
                                        PropertyKey::StaticIdentifier(
                                            ast_builder.alloc_identifier_name(
                                                span,
                                                ast_builder.atom(&remote_name),
                                            ),
                                        ),
                                        ast_builder.binding_pattern(
                                            ast_builder.binding_pattern_kind_binding_identifier(
                                                span,
                                                ast_builder.atom(&local_name),
                                            ),
                                            None as Option<oxc_allocator::Box<_>>,
                                            false,
                                        ),
                                        true,
                                        false,
                                    )),
                                    None as Option<oxc_allocator::Box<_>>,
                                ),
                            );
                                    tmp_program.borrow_mut().body.insert(
                                        0,
                                        if transformer.use_require {
                                            utils::make_require(
                                                ast_builder,
                                                left,
                                                &remote_filepath,
                                                span,
                                            )
                                        } else {
                                            utils::make_dynamic_import(
                                                ast_builder,
                                                left,
                                                &remote_filepath,
                                                span,
                                            )
                                        },
                                    );
                                    continue;
                                }

                                (local_name, Some(remote_name), import_specifier.span)
                            }
                            oxc_ast::ast::ImportDeclarationSpecifier::ImportDefaultSpecifier(
                                import_default_specifier,
                            ) => {
                                let local_name = import_default_specifier.local.name.to_string();
                                if !referenced_idents.contains(&local_name) {
                                    continue;
                                }

                                let span = import_default_specifier.span;

                                // node_modules imports
                                if code.is_empty() {
                                    let left = BindingPatternKind::ObjectPattern(
                                ast_builder.alloc_object_pattern(
                                    span,
                                    ast_builder.vec1(ast_builder.binding_property(
                                        span,
                                        PropertyKey::StaticIdentifier(
                                            ast_builder.alloc_identifier_name(
                                                span,
                                                ast_builder.atom("default"),
                                            ),
                                        ),
                                        ast_builder.binding_pattern(
                                            ast_builder.binding_pattern_kind_binding_identifier(
                                                span,
                                                ast_builder.atom(&local_name),
                                            ),
                                            None as Option<oxc_allocator::Box<_>>,
                                            false,
                                        ),
                                        true,
                                        false,
                                    )),
                                    None as Option<oxc_allocator::Box<_>>,
                                ),
                            );
                                    tmp_program.borrow_mut().body.insert(
                                        0,
                                        if transformer.use_require {
                                            utils::make_require(
                                                ast_builder,
                                                left,
                                                &remote_filepath,
                                                span,
                                            )
                                        } else {
                                            utils::make_dynamic_import(
                                                ast_builder,
                                                left,
                                                &remote_filepath,
                                                span,
                                            )
                                        },
                                    );
                                    continue;
                                }

                                (
                                    local_name,
                                    Some("__global__export__".to_string()),
                                    import_default_specifier.span,
                                )
                            }
                            oxc_ast::ast::ImportDeclarationSpecifier::ImportNamespaceSpecifier(
                                import,
                            ) => {
                                let namespace_name = import.local.name.to_string();

                                if !referenced_idents.contains(&namespace_name) {
                                    continue;
                                }

                                let span = import.span;

                                // node_modules imports
                                if code.is_empty() {
                                    let left = BindingPatternKind::BindingIdentifier(
                                        ast_builder.alloc_binding_identifier(
                                            span,
                                            ast_builder.atom(&namespace_name),
                                        ),
                                    );
                                    tmp_program.borrow_mut().body.insert(
                                        0,
                                        if transformer.use_require {
                                            utils::make_require(
                                                ast_builder,
                                                left,
                                                &remote_filepath,
                                                span,
                                            )
                                        } else {
                                            utils::make_dynamic_import(
                                                ast_builder,
                                                left,
                                                &remote_filepath,
                                                span,
                                            )
                                        },
                                    );
                                    continue;
                                }

                                (namespace_name, None, import.span)
                            }
                        };

                    let cache_ref = &transformer.value_cache_ref;
                    let cache_source = if let Some(remote_name) = &remote_name {
                        format!("{cache_ref}[\"{remote_filepath}\"][\"{remote_name}\"]")
                    } else {
                        format!("{cache_ref}[\"{remote_filepath}\"]")
                    };

                    // add new variable declaration to our tmp program
                    let variable_declaration =
                        Statement::VariableDeclaration(ast_builder.alloc_variable_declaration(
                            span,
                            VariableDeclarationKind::Const,
                            ast_builder.vec1(ast_builder.variable_declarator(
                                span,
                                VariableDeclarationKind::Const,
                                ast_builder.binding_pattern(
                                    BindingPatternKind::BindingIdentifier(
                                        ast_builder.alloc_binding_identifier(
                                            span,
                                            ast_builder.atom(&local_name),
                                        ),
                                    ),
                                    None as Option<oxc_allocator::Box<_>>,
                                    false,
                                ),
                                Some(Expression::Identifier(
                                    ast_builder.alloc_identifier_reference(
                                        span,
                                        ast_builder.atom(&cache_source),
                                    ),
                                )),
                                false,
                            )),
                            false,
                        ));
                    tmp_program
                        .borrow_mut()
                        .body
                        .insert(0, variable_declaration);
                    
                    // Track this import dependency
                    let var_name_for_tracking = if let Some(ref remote_name) = remote_name {
                        remote_name.as_str()
                    } else {
                        "__star__" // Namespace import
                    };
                    
                    transformer.cache_registry
                        .dependency_tracker()
                        .borrow()
                        .register_import(
                            &remote_filepath,
                            var_name_for_tracking,
                            &program_filepath,
                        );
                    
                    if let Some(remote_name) = remote_name {
                        remote_referenced_idents.insert(remote_name);
                    }
                }

                // if nothing referenced, nothing to do
                if remote_referenced_idents.is_empty() {
                    // continue;
                    return Ok(());
                }

                let source_type = SourceType::from_path(&remote_filepath)
                    .map_err(|_| TransformError::UknownExtension {
                        filepath: remote_filepath.clone(),
                        row: 1,
                        column: 1,
                    })
                    .unwrap();

                let allocator = Allocator::default();
                let ast_builder = AstBuilder::new(&allocator);

                let ast = Parser::new(&allocator, &code, source_type)
                    .with_options(ParseOptions {
                        parse_regular_expression: true,
                        ..ParseOptions::default()
                    })
                    .parse();

                if ast.panicked {
                    return Err(TransformError::RawParseFailed {
                        filepath: remote_filepath,
                        message: ast.errors.first().unwrap().message.to_string(),
                        row: 1,
                        column: 1,
                    });
                }

                let mut remote_program = ast.program;

                evaluate_program(
                    &ast_builder,
                    transformer,
                    false,
                    &cwd,
                    remote_filepath,
                    Some(&program_filepath),
                    &code,
                    &mut remote_program,
                    remote_referenced_idents,
                    temporary_programs,
                    None,
                    skip_css_eval,
                )
                .await;

                Ok(())
            })
        };
        futures.push(future);
    }

    futures
}

/// Insert a virtual CSS import for the given program filepath.
/// In atomic mode, creates a side-effect import to the .style-this.js module.
/// In non-atomic mode, creates a side-effect import to the .css file.
fn insert_virtual_css_import<'alloc>(
    program: &mut Program<'alloc>,
    ast_builder: &'alloc AstBuilder<'alloc>,
    transformer: &Transformer,
    program_filepath: &str,
) {
    let module_id = format!(
        "virtual:style-this:{}.{}",
        program_filepath, transformer.css_extension
    );

    let import_declaration = ast_builder.alloc_import_declaration(
        program.span,
        None,
        ast_builder.string_literal(program.span, ast_builder.atom(&module_id), None),
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
        .insert(insert_pos, Statement::ImportDeclaration(import_declaration));
}

/// * `skip_css_eval` - If we already have the cached CSS and just want the transformed source file, we can set
/// this flag to skip the evaluation portion.
#[allow(clippy::too_many_arguments)]
pub async fn evaluate_program<'alloc>(
    ast_builder: &'alloc AstBuilder<'alloc>,
    transformer: &Transformer,
    entrypoint: bool,
    cwd: &str,
    program_filepath: String,
    importer_filepath: Option<&str>,
    program_code: &str,
    program: &mut Program<'alloc>,
    mut referenced_idents: HashSet<String>,
    temporary_programs: Rc<RefCell<HashMap<String, String>>>,
    tx: Option<futures::channel::oneshot::Sender<Result<Option<JsValue>, TransformError>>>,
    skip_css_eval: bool,
) {
    let allocator = &ast_builder.allocator;

    // keep values until end of function
    let value_cache_guard = transformer
        .cache_registry
        .get_or_create_value_cache(program_filepath.clone());

    let mut value_cache = value_cache_guard.lock().await;

    referenced_idents.retain(|ident| !value_cache.contains(ident));

    // We used to return early here if !entrypoint && referenced_idents.is_empty(),
    // but we need to continue to extract exports for dependency tracking
    // The CSS transformer visit is fast (just an AST walk), so we'll do it even if
    // the file doesn't use CSS

    let cache_ref = &transformer.value_cache_ref;
    let store = format!("global.{cache_ref}[\"{program_filepath}\"]");

    // find "css" import or quit early if entrypoint
    let mut return_early = entrypoint;
    let mut solid_prepass = false;
    let mut react_prepass_enabled = false;
    let mut style_function_name = None;
    let mut css_function_name = None;
    let mut extra_class_function_name = None;

    for stmt in &program.body {
        let Statement::ImportDeclaration(import_decl) = stmt else {
            break;
        };

        let Some(specifiers) = &import_decl.specifiers else {
            continue;
        };

        for specifier in specifiers.iter() {
            // TODO move loop 1 lvl up for perf
            match import_decl.source.value.as_str() {
                LIBRARY_CORE_IMPORT_NAME => {
                    match specifier {
                        oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(spec)
                            if spec.imported.name() == "css" =>
                        {
                            css_function_name = Some(spec.local.name.to_string());
                        }
                        oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(spec)
                            if spec.imported.name() == "style" =>
                        {
                            style_function_name = Some(spec.local.name.to_string());
                        }
                        oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(spec)
                            if spec.imported.name() == "extraClass" =>
                        {
                            extra_class_function_name = Some(spec.local.name.to_string());
                        }
                        _ => {
                            continue;
                        }
                    };
                    return_early = false;
                }
                LIBRARY_SOLID_JS_IMPORT_NAME => {
                    solid_prepass = true;
                    if let oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(spec) =
                        specifier
                        && spec.local.name == "styled"
                    {
                        return_early = false;
                    }
                }
                LIBRARY_REACT_IMPORT_NAME => {
                    react_prepass_enabled = true;
                    if let oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(spec) =
                        specifier
                        && spec.local.name == "styled"
                    {
                        return_early = false;
                    }
                }
                _ => continue,
            }
        }
    }

    // Early return check happens here, but we need to handle it differently for dependency tracking
    // We'll check return_early after running the CSS transformer to extract exports
    let should_return_early = return_early;

    if solid_prepass {
        solid_js_prepass(ast_builder, program_filepath.clone(), program, false);
    }

    if react_prepass_enabled {
        react_prepass(ast_builder, program_filepath.clone(), program, false);
    }

    // Always run CSS transformer to extract exports, even if we'll return early
    // This is necessary for dependency tracking to know what a file exports
    let mut css_transformer = VisitorTransformer::new(
        ast_builder,
        allocator,
        entrypoint,
        &store,
        referenced_idents.clone(),
        cwd,
        &program_filepath,
        program_code,
        &mut value_cache,
        css_function_name,
        style_function_name,
        extra_class_function_name,
        transformer.atomic,
    );
    css_transformer.visit_program(program);
    if let Some(error) = css_transformer.error {
        if let Some(tx) = tx {
            let _ = tx.send(Err(error));
        }
        return;
    }
    let (
        css_variable_identifiers,
        referenced_idents,
        mut namespace_imports,
        exported_idents,
        tmp_program,
    ) = css_transformer.finish();

    // Now check if we should return early (no CSS functions imported)
    // But we've already extracted exports, so dependency tracking will work
    if should_return_early {
        // Populate value cache with exports before returning
        if !exported_idents.is_empty() {
            value_cache.extend(exported_idents.iter().cloned());
        }
        
        if let Some(tx) = tx {
            let _ = tx.send(Ok(None));
        }
        return;
    }

    // Transform @style-this/core/atomic imports into virtual module imports
    transform_atomic_entrypoint(program, ast_builder, transformer, &program_filepath);

    let has_css = !css_variable_identifiers.is_empty();

    // new entrypoint handling
    if entrypoint {
        // Insert virtual module imports
        if has_css {
            // Add import for .style-this.js virtual atomic module
            if transformer.atomic {
                insert_virtual_atomic_program_import(program, ast_builder, &program_filepath);
            }
        }
        insert_virtual_css_import(program, ast_builder, transformer, &program_filepath);

        let options = CodegenOptions {
            source_map_path: Some(PathBuf::from_str(&program_filepath).unwrap()),
            ..Default::default()
        };
        let output_js = Codegen::new().with_options(options).build(program);

        let result = js_sys::Object::new();
        js_sys::Reflect::set(
            &result,
            &JsValue::from_str("code"),
            &JsValue::from_str(&format!("// @ts-nocheck\n{}", output_js.code)),
        )
        .unwrap();
        js_sys::Reflect::set(
            &result,
            &JsValue::from_str("sourcemap"),
            &JsValue::from_str(&output_js.map.unwrap().to_json_string()),
        )
        .unwrap();

        if let Some(tx) = tx {
            let _ = tx.send(Ok(Some(result.into())));
        }
    }

    // first evaluate dependencies (imports) and transform imports into varible assignments
    // NOTE: We MUST do this even when skip_css_eval is true, because import registration
    // happens inside evaluate_dependencies. If we skip it, dependency tracking won't work.
    let eval_program = Rc::new(RefCell::new(tmp_program));

    let css_file_store_ref = &transformer.css_file_store_ref;
    let atomic_file_store_ref = &transformer.atomic_file_store_ref;
    let css_filepath = format!("'{program_filepath}.{}'", transformer.css_extension);
    let atomic_filepath = format!("'{program_filepath}.style-this.js'");

    let dependency_futures = evaluate_dependencies(
        program,
        ast_builder,
        transformer,
        &referenced_idents,
        &mut namespace_imports,
        eval_program.clone(),
        program_filepath.clone(),
        cwd,
        temporary_programs.clone(),
        skip_css_eval,
    );

    if let Err(err) = futures::future::try_join_all(dependency_futures).await {
        let err = ExportedJSValue::new(err.into());
        js_sys::eval(&format!(
            "
            {css_file_store_ref}.get({css_filepath}).reject({err});
            "
        ))
        .unwrap();
        return;
    }

    // Always populate value cache with exported idents, even when skipping CSS eval
    // This is needed for dependency tracking to know what exports a file has
    if !exported_idents.is_empty() {
        value_cache.extend(exported_idents.iter().cloned());
    }

    // After registering imports and exports, if we're skipping CSS evaluation, return early
    if skip_css_eval {
        return;
    }

    transpile_ts_to_js(allocator, &mut eval_program.borrow_mut());

    if !eval_program.borrow().body.is_empty()
        && matches!(
            eval_program.borrow().body[0],
            Statement::ImportDeclaration(_)
        )
    {
        eval_program.borrow_mut().body.remove(0);
    }

    let mut eval_program_js = Codegen::new()
        .with_options(CodegenOptions::default())
        .build(&eval_program.borrow())
        .code;

    // js_sys::eval(&format!("console.log('program', '{program_path}')",)).unwrap();

    // we append all exported idents we evaluated to the cache
    if !exported_idents.is_empty() {
        value_cache.extend(exported_idents.iter().cloned());

        // TODO this only needs to be sorted for tests to stay consistent
        let mut idents: Vec<String> = exported_idents.into_iter().collect();
        idents.sort();
        let idents = idents.join(",");

        eval_program_js.push_str(&format!("\n{store} = {{...({store} ?? {{}}), {idents}}};"));
    }

    if entrypoint && has_css {
        if transformer.atomic {
            let css_return_statements = css_variable_identifiers
                .iter()
                .map(|css_var| {
                    let var = &css_var.variable_name;
                    format!("\"{var}\": {var}.css")
                })
                .collect::<Vec<_>>()
                .join(",\n");

            eval_program_js.push_str(&formatdoc!(
                "
                return {{
                {css_return_statements}
                }};
                "
            ));
        } else {
            // ===== NON-ATOMIC MODE =====
            // Keep existing behavior: inline CSS resolution

            let sourcemap_data = css_variable_identifiers
                .iter()
                .map(|css_var| {
                    let line = css_var.span.start;
                    let end_line = css_var.span.end;
                    format!(
                        "{{className:'{}',start:{},end:{}}}",
                        css_var.classname.replace('\'', "\\'"),
                        line,
                        end_line
                    )
                })
                .collect::<Vec<_>>()
                .join(",");

            let css = css_variable_identifiers
                .iter()
                .map(|css_var| {
                    let classname = &css_var.classname;
                    let var = &css_var.variable_name;

                    if css_var.classname.starts_with("_Global") {
                        return format!("`${{{var}.css}}\n`");
                    }
                    if transformer.wrap_selectors_with_global {
                        return format!("`:global(.{classname}) {{\n${{{var}.css}}\n}}`");
                    }

                    format!("`.{classname} {{\n${{{var}.css}}\n}}`")
                })
                .collect::<Vec<_>>()
                .join(",\n");

            eval_program_js.push_str(&formatdoc!(
                "
                const cssSourcemapData = [{sourcemap_data}];
                global.{css_file_store_ref}.get({css_filepath}).resolve([\n{css}\n].join('\\n'), cssSourcemapData, {css_filepath});
                ",
            ));
        }
    }

    if transformer.debug {
        let importer_part = if let Some(importer_filepath) = importer_filepath {
            format!(" ({importer_filepath})")
        } else {
            String::new()
        };
        let key = format!("{program_filepath}{importer_part}: {referenced_idents:?}");

        // Call the debug callback with the module name and code
        let args = js_sys::Array::new();
        args.push(&JsValue::from_str(&key));
        args.push(&JsValue::from_str(&eval_program_js));

        js_sys::Reflect::apply(
            &js_sys::Reflect::get(
                &js_sys::global(),
                &JsValue::from_str(&transformer.on_debug_virtual_module_ref),
            )
            .unwrap()
            .dyn_into::<js_sys::Function>()
            .unwrap(),
            &JsValue::UNDEFINED,
            &args,
        )
        .unwrap();
    }

    let value_cache_ref = &transformer.value_cache_ref;

    // Handle atomic vs non-atomic mode evaluation
    // In atomic mode, only process CSS for entrypoint files
    // Non-entrypoint files are just evaluated for their exports
    if transformer.atomic && entrypoint && has_css {
        // ===== ATOMIC MODE: Process CSS Blocks (Entrypoint Only) =====
        // Wrap eval_program_js in async IIFE to get the CSS blocks

        let eval_program_js = wrap_eval_program(
            &eval_program_js,
            css_file_store_ref,
            value_cache_ref,
            transformer.require_ref.as_deref(),
        );

        // js_sys::eval(&format!(
        //     "console.log('ATOMIC_PROGRAM:\\n', '{}')",
        //     eval_program_js
        //         .replace('\\', "\\\\")
        //         .replace('\'', "\\'")
        //         .replace('\n', "\\n")
        // ))
        // .unwrap();

        // Execute Stage 1 eval and get the promise
        let evaluated_promise: JsValue =
            match js_sys::eval(&eval_program_js).map_err(|cause| TransformError::EvaluationFailed {
                filepath: program_filepath.clone(),
                program: if transformer.debug {
                    Some(eval_program_js.to_string())
                } else {
                    None
                },
                cause,
            }) {
                Ok(v) => v,
                Err(err) => {
                    let err_str = ExportedJSValue::new(err.into());
                    js_sys::eval(&format!(
                        "global.{css_file_store_ref}.get({css_filepath}).reject({err_str});
                         global.{atomic_file_store_ref}.get({atomic_filepath}).reject({err_str});"
                    ))
                    .unwrap();
                    return;
                }
            };

        // Await the promise to get the CSS blocks
        let promise = js_sys::Promise::from(evaluated_promise);
        let future = wasm_bindgen_futures::JsFuture::from(promise);
        let evaluated = match future.await {
            Ok(v) => v,
            Err(err) => {
                let err_str = ExportedJSValue::new(err.into());
                js_sys::eval(&format!(
                    "
                    global.{css_file_store_ref}.get({css_filepath}).reject({err_str}); 
                    global.{atomic_file_store_ref}.get({atomic_filepath}).reject({err_str});
                    "
                ))
                .unwrap();
                return;
            }
        };

        // Extract CSS blocks from evaluated object
        let obj = evaluated.dyn_into::<js_sys::Object>().unwrap();
        let keys = js_sys::Object::keys(&obj);
        let mut css_blocks: HashMap<String, String> = HashMap::new();

        for key_value in keys.iter() {
            if let Some(var_name) = key_value.as_string()
                && let Ok(css_string) = js_sys::Reflect::get(&obj, &JsValue::from_str(&var_name))
                && let Some(css_str) = css_string.as_string()
            {
                css_blocks.insert(var_name, css_str);
            }
        }

        // Parse each CSS block into atomic + non-atomic classes
        let mut variable_to_atomics: HashMap<String, BTreeSet<String>> = HashMap::new();
        let mut module_css = String::new();

        // Build sourcemap data for module CSS
        let sourcemap_data = css_variable_identifiers
            .iter()
            .map(|css_var| {
                let line = css_var.span.start;
                let end_line = css_var.span.end;
                format!(
                    "{{className:'{}',start:{},end:{}}}",
                    css_var.classname.replace('\'', "\\'"),
                    line,
                    end_line
                )
            })
            .collect::<Vec<_>>()
            .join(",");

        for css_var in css_variable_identifiers.iter() {
            if let Some(css_string) = css_blocks.get(&css_var.variable_name) {
                let classname = &css_var.classname;

                // Global styles don't need a wrapper selector
                if css_var.classname.starts_with("_Global") {
                    module_css.push_str(&format!("{}\n", css_string));
                    continue;
                }

                let parse_result = css_parser::parse_css(css_string);

                let atomic_classes: BTreeSet<String> = parse_result
                    .atomizable
                    .into_iter()
                    .map(|decl| add_atomic(decl.as_str(), &transformer.cache_registry))
                    .filter(|s: &String| !s.is_empty())
                    .collect();

                variable_to_atomics.insert(css_var.variable_name.clone(), atomic_classes);

                if let Some(non_atomizable) = parse_result.non_atomizable {
                    module_css.push_str(&format!(".{classname} {{ {} }}\n", non_atomizable));
                } else {
                    module_css.push_str(&format!(".{classname} {{ /* marker */ }}\n"));
                }
            }
        }

        // Generate the atomic module for .style-this.js
        let empty_set = BTreeSet::new();
        let atomic_module = css_variable_identifiers
            .iter()
            .map(|css_var| {
                let var = &css_var.variable_name;
                let classname = &css_var.classname;

                let atomics = variable_to_atomics
                    .get(&css_var.variable_name)
                    .unwrap_or(&empty_set);

                let mut all_classes: Vec<String> = vec![classname.clone()];
                all_classes.extend(atomics.iter().cloned());
                all_classes.extend(css_var.extra_classes.iter().cloned());

                let class_list = all_classes.join(" ");
                format!("export const {var} = \"{class_list}\"")
            })
            .collect::<Vec<_>>()
            .join(";\n");

        // CSS string already contains all non-atomizable CSS, trim trailing newline
        let css = module_css.trim_end();

        let css = css
            .replace('\\', "\\\\")
            .replace('\'', "\\'")
            .replace('\n', "\\n");
        
        // Escape atomic_module for use in template literal
        let atomic_module = atomic_module
            .replace('\\', "\\\\")
            .replace('`', "\\`")
            .replace("${", "\\${");

        // Stage 2: Resolve .style-this.js with atomic exports and .css with non-atomizable CSS
        js_sys::eval(&format!(
            "
            global.{css_file_store_ref}.get({css_filepath}).resolve('{css}', [{sourcemap_data}], {css_filepath}); 
            global.{atomic_file_store_ref}.get({atomic_filepath}).resolve(`{atomic_module}`);
            "
        ))
        .unwrap();

        return;
    }

    // wrap into promise and hide global symbols
    let eval_program_js = wrap_eval_program(
        &eval_program_js,
        css_file_store_ref,
        value_cache_ref,
        transformer.require_ref.as_deref(),
    );

    let evaluated =
        match js_sys::eval(&eval_program_js).map_err(|cause| TransformError::EvaluationFailed {
            filepath: program_filepath.clone(),
            program: if transformer.debug {
                Some(eval_program_js.to_string())
            } else {
                None
            },
            cause,
        }) {
            Ok(v) => v,
            Err(err) => {
                let err = ExportedJSValue::new(err.into());
                js_sys::eval(&format!(
                    "
                    {css_file_store_ref}.get({css_filepath}).resolve({err});
                    "
                ))
                .unwrap();
                return;
            }
        };

    let promise = js_sys::Promise::from(evaluated);
    let future = wasm_bindgen_futures::JsFuture::from(promise);
    if let Err(err) = future
        .await
        .inspect_err(|err| {
            error_mapping::resolve_err(
                allocator,
                err,
                &program_filepath,
                program_code,
                &eval_program.borrow(),
                &eval_program_js,
            );
        })
        .map_err(|cause| TransformError::EvaluationFailed {
            filepath: program_filepath,
            program: if transformer.debug {
                Some(eval_program_js.to_string())
            } else {
                None
            },
            cause,
        })
    {
        let err = ExportedJSValue::new(err.into());
        js_sys::eval(&format!(
            "
            {css_file_store_ref}.get({css_filepath}).resolve({err});
            "
        ))
        .unwrap();
    }
}
