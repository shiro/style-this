use super::cache::VALUE_CACHE;
use super::error::TransformError;
use super::transformer::Transformer;
use super::types::ExportedJSValue;
use super::visitor::VisitorTransformer;
use crate::error_mapping;
use crate::solid_js::solid_js_prepass;
use crate::utils::{self, transpile_ts_to_js};
use crate::{LIBRARY_CORE_IMPORT_NAME, LIBRARY_SOLID_JS_IMPORT_NAME, PREFIX};
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
    let mut style_function_name = None;
    let mut css_function_name = None;

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
            &JsValue::from_str(&output_js.code),
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
        let Some(specifiers) = &import_declaration.specifiers else {
            continue;
        };

        let mut remote_referenced_idents = namespace_imports
            .remove(&remote_module_id)
            .unwrap_or_default();

        let any_ident_referenced = specifiers.iter().any(|specifier| {
            let local_name = match specifier {
                oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(import) => {
                    import.local.name.as_str()
                }
                oxc_ast::ast::ImportDeclarationSpecifier::ImportDefaultSpecifier(import) => {
                    import.local.name.as_str()
                }
                oxc_ast::ast::ImportDeclarationSpecifier::ImportNamespaceSpecifier(import) => {
                    import.local.name.as_str()
                }
            };

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

    if entrypoint && has_css {
        let css = css_variable_identifiers
            .into_iter()
            .map(|(variable_name, class_name)| {
                if class_name.starts_with("_Global") {
                    return format!("`${{{variable_name}.css}}\n`");
                }
                if transformer.wrap_selectors_with_global {
                    return format!("`:global(.{class_name}) {{\n${{{variable_name}.css}}\n}}`");
                }

                format!("`.{class_name} {{\n${{{variable_name}.css}}\n}}`")
            })
            .collect::<Vec<_>>()
            .join(",\n");

        eval_program_js.push_str(&formatdoc!(
            "
            {css_file_store_ref}.get({css_filepath}).resolve([\n{css}\n].join('\\n'));
            ",
        ));
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
    let eval_program_js = formatdoc!(
        "
        const global = {{
            {css_file_store_ref},
            {value_cache_ref},
        }};

        (async () => {{
            \"use strict\";
            // start
{eval_program_js}
        }})()
        "
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

// EvaluateProgramReturnStatus is now in compiler/types.rs

