use super::cache::VALUE_CACHE;
use super::error::TransformError;
use super::transformer::Transformer;
use super::types::ExportedJSValue;
use super::visitor::VisitorTransformer;
use crate::error_mapping;
use crate::react::react_prepass;
use crate::solid_js::solid_js_prepass;
use crate::utils::{self, transpile_ts_to_js};
use crate::{LIBRARY_CORE_IMPORT_NAME, LIBRARY_CORE_ATOMIC_IMPORT_NAME, LIBRARY_REACT_IMPORT_NAME, LIBRARY_SOLID_JS_IMPORT_NAME, PREFIX};
use futures::lock::Mutex as FutureMutex;
use indoc::formatdoc;
use oxc_allocator::{Allocator, CloneIn};
use oxc_ast::ast::{
    BindingPatternKind, Expression, ImportDeclarationSpecifier, ImportOrExportKind,
    ModuleExportName, Program, PropertyKey, Statement, VariableDeclarationKind, WithClause,
};
use oxc_ast::AstBuilder;
use oxc_ast_visit::VisitMut;
use oxc_codegen::{Codegen, CodegenOptions};
use oxc_parser::{ParseOptions, Parser};
use oxc_span::SourceType;
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::path::PathBuf;
use std::rc::Rc;
use std::str::FromStr;
use wasm_bindgen::prelude::*;

/// Helper to get the local name from any import specifier type
fn get_import_local_name<'a>(specifier: &'a ImportDeclarationSpecifier<'a>) -> &'a str {
    match specifier {
        ImportDeclarationSpecifier::ImportSpecifier(import) => import.local.name.as_str(),
        ImportDeclarationSpecifier::ImportDefaultSpecifier(import) => import.local.name.as_str(),
        ImportDeclarationSpecifier::ImportNamespaceSpecifier(import) => import.local.name.as_str(),
    }
}

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
    import_source: Option<String>,
    tx: Option<futures::channel::oneshot::Sender<Result<Option<JsValue>, TransformError>>>,
    skip_css_eval: bool,
) {
    let allocator = &ast_builder.allocator;

    // keep values until end of function
    let value_cache_guard = VALUE_CACHE.with(|cache| {
        cache
            .borrow_mut()
            .entry(program_filepath.clone())
            .or_insert_with(|| Rc::new(FutureMutex::new(HashSet::new())))
            .clone()
    });

    let mut value_cache = value_cache_guard.lock().await;

    referenced_idents.retain(|ident| !value_cache.contains(ident));

    if !entrypoint && referenced_idents.is_empty() {
        if let Some(tx) = tx {
            let _ = tx.send(Ok(None));
        }
        return;
    }

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

    if return_early {
        // return Ok(EvaluateProgramReturnStatus::NotTransformed);
        if let Some(tx) = tx {
            let _ = tx.send(Ok(None));
        }
        return;
    }

    if solid_prepass {
        solid_js_prepass(ast_builder, program_filepath.clone(), program, false);
    }

    if react_prepass_enabled {
        react_prepass(ast_builder, program_filepath.clone(), program, false);
    }

    let cache_ref = &transformer.value_cache_ref;
    let store = format!("global.{cache_ref}[\"{program_filepath}\"]");

    // transform all css`...` expresisons into classname strings
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

    // Transform @style-this/core/atomic imports into virtual module imports
    if transformer.atomic {
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
            let atomic_css_path = format!("virtual:style-this:{}.atomic.css", program_filepath);
            
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

    // In atomic mode, add import for .style-this.js module if there are CSS variables
    // This needs to happen BEFORE codegen for entrypoints
    if transformer.atomic && !css_variable_identifiers.is_empty() {
        if let Some(import_source) = &import_source {
            // Remove the .css extension and add .style-this.js
            let base_import = if let Some(stripped) = import_source.strip_suffix(&format!(".{}", transformer.css_extension)) {
                stripped
            } else {
                import_source.as_str()
            };
            let style_this_import_source = format!("{}.style-this.js", base_import);
            
            // Create: import * as _styleThisClasses from "virtual:style-this:file.style-this.js"
            use oxc_ast::ast::ImportNamespaceSpecifier;
            
            let namespace_specifier = ast_builder.alloc(ImportNamespaceSpecifier {
                span: program.span,
                local: ast_builder.binding_identifier(
                    program.span,
                    ast_builder.atom("_styleThisClasses")
                ),
            });
            
            let specifiers = ast_builder.vec1(ImportDeclarationSpecifier::ImportNamespaceSpecifier(namespace_specifier));
            
            let style_this_import = ast_builder
                .alloc_import_declaration(
                    program.span,
                    Some(specifiers),
                    ast_builder.string_literal(program.span, ast_builder.atom(&style_this_import_source), None),
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
    }

    // new entrypoint handling
    if entrypoint {
        // add import to virtual css
        if let Some(import_source) = &import_source {
            let import_declaration = ast_builder
                .alloc_import_declaration(
                    program.span,
                    None,
                    ast_builder.string_literal(program.span, ast_builder.atom(import_source), None),
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

        let options = CodegenOptions {
            source_map_path: Some(PathBuf::from_str(&program_filepath).unwrap()),
            ..Default::default()
        };
        let output_js = Codegen::new().with_options(options).build(&program);

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

    if skip_css_eval {
        return;
    }

    let eval_program = Rc::new(RefCell::new(tmp_program));

    let mut futures = vec![];

    // handle imports - resolve other modules and rewrite return values into variable declarations
    for stmt in program.body.iter() {
        let Statement::ImportDeclaration(import_declaration) = stmt else {
            break;
        };
        let remote_module_id = import_declaration.source.value.to_string();
        
        // Skip the virtual atomic CSS import - it should not be evaluated as a dependency
        // The atomic CSS file will be loaded separately by Vite when requested
        if remote_module_id.starts_with("virtual:style-this:") && remote_module_id.ends_with(".atomic.css") {
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

        let future = {
            let tmp_program = eval_program.clone();
            let program_filepath = program_filepath.clone();
            let specifiers = specifiers.clone_in(allocator);
            let referenced_idents = referenced_idents.clone();
            let temporary_programs = temporary_programs.clone();

            std::boxed::Box::pin(async move {
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
                    cwd,
                    remote_filepath,
                    Some(&program_filepath),
                    &code,
                    &mut remote_program,
                    remote_referenced_idents,
                    temporary_programs,
                    None,
                    None,
                    skip_css_eval,
                )
                .await;

                Ok(())
            })
        };
        futures.push(future);
    }

    let css_file_store_ref = &transformer.css_file_store_ref;
    let value_cache_ref = &transformer.value_cache_ref;
    let css_filepath = format!("'{program_filepath}.{}'", transformer.css_extension);
    let css_filepath_unquoted = format!("{program_filepath}.{}", transformer.css_extension);


    if let Err(err) = futures::future::try_join_all(futures).await {
        let err = ExportedJSValue::new(err.into());
        js_sys::eval(&format!(
            "
            {css_file_store_ref}.get({css_filepath}).reject({err});
            "
        ))
        .unwrap();
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

    // For atomic mode, prepend variable initializations so .css properties can be assigned
    if transformer.atomic && !css_variable_identifiers.is_empty() {
        let (global_vars, atomic_vars): (Vec<_>, Vec<_>) = css_variable_identifiers
            .iter()
            .partition(|css_var| css_var.class_name.starts_with("_Global"));
        
        let var_initializations = css_variable_identifiers
            .iter()
            .map(|css_var| {
                // Use new String() with the class name so it coerces to the class name in template literals
                format!("const {} = new String('{}');", css_var.variable_name, css_var.class_name)
            })
            .collect::<Vec<_>>()
            .join("\n");
        
        if !var_initializations.is_empty() {
            eval_program_js = format!("{}\n{}", var_initializations, eval_program_js);
        }
    }

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

    let has_css = !css_variable_identifiers.is_empty();
    
    // Track the virtual CSS file if in atomic mode and we have CSS to generate
    let virtual_css_filepath = if transformer.atomic && entrypoint && has_css {
        use crate::compiler::atomic_sync::GLOBAL_SYNC;
        let path = format!("{}.{}", program_filepath, transformer.css_extension);
        GLOBAL_SYNC.add(path.clone());
        Some(path)
    } else {
        None
    };

    if entrypoint && has_css {
        if transformer.atomic {
            // Atomic mode: parse CSS into atomic classes
            // Build source map metadata for JavaScript
            let sourcemap_data = css_variable_identifiers
                .iter()
                .map(|css_var| {
                    let line = css_var.span.start;
                    let end_line = css_var.span.end;
                    format!(
                        "{{className:'{}',start:{},end:{}}}",
                        css_var.class_name.replace('\'', "\\'"),
                        line,
                        end_line
                    )
                })
                .collect::<Vec<_>>()
                .join(",");

            // Separate global styles from atomic-eligible styles
            let (global_vars, atomic_vars): (Vec<_>, Vec<_>) = css_variable_identifiers
                .iter()
                .partition(|css_var| css_var.class_name.starts_with("_Global"));

            // For atomic mode, we need to:
            // 1. Variables are initialized as objects (done above before eval_program_js)
            // 2. The virtual program assigns variable_name.css = template_literal (in eval_program_js)
            // 3. Register all atomic classes by calling cssToAtomicClassList
            // 4. Generate the .style-this.js module with those lists
            
            // Register all atomic classes (this happens after eval_program_js runs)
            let css_transformations = atomic_vars
                .iter()
                .map(|css_var| {
                    // The virtual program evaluates and sets variable_name.css = template_literal
                    // We pass the evaluated CSS to cssToAtomicClassList
                    // Also store the non-atomic CSS for the per-file CSS
                    // Add error handling for undefined CSS
                    format!(
                        "if (!{}.css) {{ console.error('[atomic] {}.css is undefined'); {}.css = ''; }}\nconst _{}_atomic = cssToAtomicClassList({}.css);",
                        css_var.variable_name,
                        css_var.variable_name,
                        css_var.variable_name,
                        css_var.variable_name,
                        css_var.variable_name
                    )
                })
                .collect::<Vec<_>>()
                .join("\n");

            // Build the .style-this.js module content
            let atomic_exports = atomic_vars
                .iter()
                .map(|css_var| {
                    // Strip __styleThis_ prefix if it exists to match the visitor's naming
                    let base_name = css_var.variable_name.strip_prefix(&format!("{}_", PREFIX))
                        .unwrap_or(&css_var.variable_name);
                    let export_name = format!("_styleThis_{}", base_name);
                    
                    // Combine named class with atomic classes
                    format!(
                        "'export const {} = \"' + '{}' + ' ' + _{}_atomic + '\";'",
                        export_name,
                        css_var.class_name,
                        css_var.variable_name
                    )
                })
                .collect::<Vec<_>>();
            
            // Add global vars to exports (they don't have atomic classes, just the variable name)
            let global_exports = global_vars
                .iter()
                .map(|css_var| {
                    let base_name = css_var.variable_name.strip_prefix(&format!("{}_", PREFIX))
                        .unwrap_or(&css_var.variable_name);
                    let export_name = format!("_styleThis_{}", base_name);
                    
                    // Global vars just export their variable name (which is the class name)
                    format!(
                        "'export const {} = \"' + '{}' + '\";'",
                        export_name,
                        css_var.class_name
                    )
                })
                .collect::<Vec<_>>();
            
            let style_this_exports = [atomic_exports, global_exports]
                .concat()
                .join(" + '\\n' + ");

            // Global styles keep their original format
            let global_css = global_vars
                .iter()
                .map(|css_var| {
                    format!("`${{{}.css}}\n`", css_var.variable_name)
                })
                .collect::<Vec<_>>()
                .join(",\n");

            // Generate CSS blocks with full content (same as non-atomic mode)
            // This preserves media queries, nested selectors, etc.
            let atomic_css_blocks = atomic_vars
                .iter()
                .map(|css_var| {
                    // In atomic mode, extract only non-atomic CSS (media queries, nested selectors)
                    // Simple top-level declarations are atomized and go into the .atomic.css file
                    // Keep the marker class even if empty for sourcemap purposes, with a comment to prevent removal
                    let css_content = format!("extractNonAtomicCss({}.css)", css_var.variable_name);
                    let empty_comment = "/* atomized */";
                    if transformer.wrap_selectors_with_global {
                        format!("`:global(.{}) {{\\n${{{}||'{}'}}\\n}}`", css_var.class_name, css_content, empty_comment)
                    } else {
                        format!("`.{} {{\\n${{{}||'{}'}}\\n}}`", css_var.class_name, css_content, empty_comment)
                    }
                })
                .collect::<Vec<_>>()
                .join(",\n");

            // Include global styles in the per-file CSS
            let global_css_blocks = global_vars
                .iter()
                .map(|css_var| {
                    format!("`${{{}.css}}\n`", css_var.variable_name)
                })
                .collect::<Vec<_>>()
                .join(",\n");

            // Combine atomic CSS blocks and global styles for the per-file CSS module
            let per_file_css = if global_css_blocks.is_empty() && atomic_css_blocks.is_empty() {
                "''".to_string()
            } else if global_css_blocks.is_empty() {
                format!("[{atomic_css_blocks}].join('\\n')")
            } else if atomic_css_blocks.is_empty() {
                format!("[{global_css_blocks}].join('\\n')")
            } else {
                format!("[{global_css_blocks}, {atomic_css_blocks}].join('\\n')")
            };

            let style_this_module_code = if !style_this_exports.is_empty() {
                format!("const styleThisModule = {};\nglobal.{}.get('{}.style-this.js').resolve(styleThisModule);",
                    style_this_exports,
                    css_file_store_ref,
                    program_filepath.replace('\\', "\\\\").replace('\'', "\\'")
                )
            } else {
                // Even if empty, resolve it to avoid hanging
                format!("global.{}.get('{}.style-this.js').resolve('');",
                    css_file_store_ref,
                    program_filepath.replace('\\', "\\\\").replace('\'', "\\'")
                )
            };

            eval_program_js.push_str(&formatdoc!(
                "
                // Import atomic CSS helpers from wasm
                const cssToAtomicClassList = global.__styleThis_cssToAtomicClassList;
                const extractNonAtomicCss = global.__styleThis_extractNonAtomicCss;
                if (!cssToAtomicClassList) {{
                    throw new Error('cssToAtomicClassList not found on global. Available: ' + Object.keys(global).filter(k => k.includes('styleThis')).join(', '));
                }}
                if (!extractNonAtomicCss) {{
                    throw new Error('extractNonAtomicCss not found on global. Available: ' + Object.keys(global).filter(k => k.includes('styleThis')).join(', '));
                }}
                
                // Convert CSS to atomic class lists
                {css_transformations}
                
                const cssSourcemapData = [{sourcemap_data}];
                
                // In atomic mode, resolve per-file CSS with marker classes for sourcemaps
                // The actual atomic CSS goes into the .atomic.css file via explicit import
                const perFileCss = {per_file_css};
                global.{css_file_store_ref}.get({css_filepath}).resolve(perFileCss, cssSourcemapData, {css_filepath});
                
                // Generate and resolve the .style-this.js module
                {style_this_module_code}
                ",
            ));
        } else {
            // Non-atomic mode: existing behavior
            // Build source map metadata for JavaScript
            let sourcemap_data = css_variable_identifiers
                .iter()
                .map(|css_var| {
                    let line = css_var.span.start;
                    let end_line = css_var.span.end;
                    format!(
                        "{{className:'{}',start:{},end:{}}}",
                        css_var.class_name.replace('\'', "\\'"),
                        line,
                        end_line
                    )
                })
                .collect::<Vec<_>>()
                .join(",");

            let css = css_variable_identifiers
                .into_iter()
                .map(|css_var| {
                    if css_var.class_name.starts_with("_Global") {
                        return format!("`${{{}.css}}\n`", css_var.variable_name);
                    }
                    if transformer.wrap_selectors_with_global {
                        return format!("`:global(.{}) {{\n${{{}.css}}\n}}`", css_var.class_name, css_var.variable_name);
                    }

                    format!("`.{} {{\n${{{}.css}}\n}}`", css_var.class_name, css_var.variable_name)
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
        js_sys::eval(&format!(
            "
            if(global.{PREFIX}_temporaryPrograms)
                global.{PREFIX}_temporaryPrograms['{}'] = '{}';
            ",
            key.replace('\\', "\\\\")
                .replace('\'', "\\'")
                .replace('\n', "\\n"),
            eval_program_js
                .replace('\\', "\\\\")
                .replace('\'', "\\'")
                .replace('\n', "\\n")
        ))
        .unwrap();
    }

    // wrap into promise
    let eval_program_js = if let Some(require_ref) = &transformer.require_ref {
        let atomic_funcs = if transformer.atomic {
            format!("__styleThis_cssToAtomicClassList: globalThis.__styleThis_cssToAtomicClassList,\n                __styleThis_getAtomicCss: globalThis.__styleThis_getAtomicCss,\n                __styleThis_extractNonAtomicCss: globalThis.__styleThis_extractNonAtomicCss,")
        } else {
            String::new()
        };
        
        formatdoc!(
            "
            const _global = {{
                {css_file_store_ref}: globalThis.{css_file_store_ref},
                {value_cache_ref}: globalThis.{value_cache_ref},
                {atomic_funcs}
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
        let atomic_funcs = if transformer.atomic {
            format!("__styleThis_cssToAtomicClassList,\n                __styleThis_getAtomicCss,\n                __styleThis_extractNonAtomicCss,")
        } else {
            String::new()
        };
        
        formatdoc!(
            "
            const _global = {{
                {css_file_store_ref},
                {value_cache_ref},
                {atomic_funcs}
            }};

            (async () => {{
                const global = _global;
                // start
    {eval_program_js}
            }})()
            "
        )
    };

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
    
    // Remove virtual CSS file from atomic sync tracking after CSS evaluation completes
    if let Some(virtual_css_path) = virtual_css_filepath {
        use crate::compiler::atomic_sync::GLOBAL_SYNC;
        GLOBAL_SYNC.remove(&virtual_css_path);
    }
}

// EvaluateProgramReturnStatus is now in compiler/types.rs

