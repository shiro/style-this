use crate::solid_js::solid_js_prepass;
use crate::utils::{binding_pattern_kind_get_idents, generate_random_id};
use crate::*;

#[derive(Error, Debug)]
pub enum TransformError {
    #[error("failed to parse program from bunlder 'bundler-id:{id}'")]
    BunlderParseFailed { id: String },
    #[error("failed to parse program from file '{filepath}'")]
    RawParseFailed { filepath: String },
    #[error("failed to determine program type from extension '{filepath}'")]
    UknownExtension { filepath: String },
    #[error("failed to run program:\n{program}")]
    EvaluationFailed { program: String, cause: JsValue },
    #[error("failed to read file '{filepath}'")]
    ReadFileError { filepath: String, cause: JsValue },
}

impl From<TransformError> for JsValue {
    fn from(from: TransformError) -> Self {
        let err = js_sys::Error::new(&from.to_string());

        // stack trace points to wasm wrapper, delete it
        js_sys::Reflect::set(&err, &JsValue::from_str("stack"), &JsValue::from_str("")).unwrap();

        // set cause property for variants that have one
        match &from {
            TransformError::EvaluationFailed { cause, .. }
            | TransformError::ReadFileError { cause, .. } => {
                js_sys::Reflect::set(&err, &JsValue::from_str("cause"), cause).unwrap();
            }
            _ => (),
        };

        err.into()
    }
}

#[wasm_bindgen]
pub struct Transformer {
    load_file: js_sys::Function,
    css_file_store_ref: String,
    export_cache_ref: String,
    css_extension: String,
}

#[wasm_bindgen]
impl Transformer {
    #[wasm_bindgen(constructor)]
    #[allow(clippy::new_without_default)]
    pub fn new(opts: JsValue) -> Self {
        let global = js_sys::global();

        let load_file = js_sys::Reflect::get(&opts, &JsValue::from_str("loadFile"))
            .unwrap()
            .dyn_into::<js_sys::Function>()
            .unwrap();

        let css_extension = js_sys::Reflect::get(&opts, &JsValue::from_str("cssExtension"))
            .unwrap()
            .as_string()
            .unwrap();

        let css_file_store_ref = format!("{PREFIX}_{}", generate_random_id(8));
        let css_file_store =
            js_sys::Reflect::get(&opts, &JsValue::from_str("cssFileStore")).unwrap();
        js_sys::Reflect::set(
            &global,
            &JsValue::from_str(&css_file_store_ref),
            &css_file_store,
        )
        .unwrap();

        let export_cache = js_sys::Reflect::get(&opts, &JsValue::from_str("exportCache")).unwrap();
        let export_cache_ref = format!("{PREFIX}_{}", generate_random_id(8));
        js_sys::Reflect::set(
            &global,
            &JsValue::from_str(&export_cache_ref),
            &export_cache,
        )
        .unwrap();

        Self {
            load_file,
            css_file_store_ref,
            export_cache_ref,
            css_extension,
        }
    }

    /// loads file contents and id
    async fn load_file(&self, id: &str) -> Result<(String, String), TransformError> {
        let promise = self
            .load_file
            .call1(&JsValue::UNDEFINED, &JsValue::from_str(id))
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

fn build_decorated_string<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    span: Span,
    content: &str,
) -> Expression<'alloc> {
    Expression::NewExpression(ast_builder.alloc_new_expression(
        span,
        Expression::Identifier(
            ast_builder.alloc_identifier_reference(span, ast_builder.atom("String")),
        ),
        None as Option<oxc_allocator::Box<_>>,
        ast_builder.vec1(oxc_ast::ast::Argument::StringLiteral(
            ast_builder.alloc_string_literal(span, ast_builder.atom(content), None),
        )),
    ))
}

fn build_object_member_string_assignment<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    span: Span,
    object_name: &str,
    member_name: &str,
    value: Expression<'alloc>,
) -> Expression<'alloc> {
    Expression::AssignmentExpression(ast_builder.alloc_assignment_expression(
        span,
        oxc_ast::ast::AssignmentOperator::Assign,
        oxc_ast::ast::AssignmentTarget::StaticMemberExpression(
            ast_builder.alloc_static_member_expression(
                span,
                Expression::Identifier(
                    ast_builder.alloc_identifier_reference(span, ast_builder.atom(object_name)),
                ),
                ast_builder.identifier_name(span, ast_builder.atom(member_name)),
                false,
            ),
        ),
        value,
    ))
}

fn build_assignment<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    span: Span,
    variable_name: &str,
    value: Expression<'alloc>,
) -> Expression<'alloc> {
    Expression::AssignmentExpression(ast_builder.alloc_assignment_expression(
        span,
        oxc_ast::ast::AssignmentOperator::Assign,
        oxc_ast::ast::AssignmentTarget::AssignmentTargetIdentifier(
            ast_builder.alloc_identifier_reference(span, ast_builder.atom(variable_name)),
        ),
        value,
    ))
}

fn build_variable_declaration_ident<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    span: Span,
    variable_name: &str,
    identifier: &str,
) -> Statement<'alloc> {
    Statement::VariableDeclaration(ast_builder.alloc_variable_declaration(
        span,
        VariableDeclarationKind::Let,
        ast_builder.vec1(ast_builder.variable_declarator(
            span,
            VariableDeclarationKind::Const,
            ast_builder.binding_pattern(
                BindingPatternKind::BindingIdentifier(
                    ast_builder.alloc_binding_identifier(span, ast_builder.atom(variable_name)),
                ),
                None as Option<oxc_allocator::Box<_>>,
                false,
            ),
            Some(Expression::Identifier(
                ast_builder.alloc_identifier_reference(span, ast_builder.atom(identifier)),
            )),
            false,
        )),
        false,
    ))
}

pub async fn evaluate_program<'alloc>(
    allocator: &'alloc Allocator,
    transformer: &Transformer,
    entrypoint: bool,
    program_path: &String,
    program: &mut Program<'alloc>,
    mut referenced_idents: HashSet<String>,
) -> Result<EvaluateProgramReturnStatus, TransformError> {
    // TODO pass through
    let ast_builder = AstBuilder::new(allocator);

    // find "css" import or quit early if entrypoint
    let return_early = entrypoint
        && program.body.iter().all(|import| {
            if let Statement::ImportDeclaration(import_decl) = import {
                if let Some(specifiers) = &import_decl.specifiers {
                    for specifier in specifiers.iter() {
                        if import_decl.source.value != LIBRARY_CORE_IMPORT_NAME {
                            continue;
                        }

                        if let oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(spec) =
                            specifier
                        {
                            if spec.local.name == "css" || spec.local.name == "style" {
                                return false;
                            }
                        }
                    }
                }
            }
            true
        });
    if return_early {
        return Ok(EvaluateProgramReturnStatus::NotTransformed);
    }

    let mut imports = HashMap::new();
    let mut exports = HashSet::new();

    let cache_ref = &transformer.export_cache_ref;
    let store = format!("global.{cache_ref}[\"{program_path}\"]");

    let n = ast_builder.alloc_import_declaration::<Option<Box<WithClause>>>(
        program.span,
        None,
        ast_builder.string_literal(
            program.span,
            ast_builder.atom(&format!(
                "virtual:style-this:{program_path}.{}",
                transformer.css_extension
            )),
            None,
        ),
        None,
        None,
        ImportOrExportKind::Value,
    );

    program.body.insert(0, Statement::ImportDeclaration(n));

    // transform all css`...` expresisons into classname strings
    let mut expr_counter = 0u32;
    let mut css_variable_identifiers = HashMap::new();
    let mut style_variable_identifiers = HashMap::new();
    for stmt in program.body.iter_mut() {
        let variable_declaration = match stmt {
            Statement::VariableDeclaration(it) => it,
            Statement::ExportNamedDeclaration(it) => {
                let Some(declaration) = &mut it.declaration else {
                    continue;
                };
                match declaration {
                    oxc_ast::ast::Declaration::VariableDeclaration(variable_declaration) => {
                        variable_declaration
                    }
                    // TODO functions
                    // TODO class
                    _ => continue,
                }
            }
            _ => continue,
        };

        for variable_declarator in variable_declaration.declarations.iter_mut().rev() {
            let span = variable_declarator.span;
            let Some(init) = &mut variable_declarator.init else {
                continue;
            };

            let Expression::TaggedTemplateExpression(tagged_template_expression) = init else {
                continue;
            };

            let Expression::Identifier(identifier) = &mut tagged_template_expression.tag else {
                continue;
            };

            if identifier.name != "css" && identifier.name != "style" {
                continue;
            };

            let BindingPatternKind::BindingIdentifier(variable_name) = &variable_declarator.id.kind
            else {
                panic!("css variable declaration was not a regular variable declaration")
            };

            if identifier.name == "css" {
                expr_counter += 1;
                let idx = expr_counter;

                // get class name from the store or compute
                let class_name = entrypoint
                    .then(|| {
                        js_sys::eval(&format!("{store}?.__css_{idx}"))
                            .unwrap()
                            .as_string()
                    })
                    .flatten()
                    .unwrap_or_else(|| {
                        let random_suffix = generate_random_id(6);
                        let class_name = format!("{variable_name}-{random_suffix}");

                        js_sys::eval(&format!(
                            "{store} = {{...({store} ?? {{}}), __css_{idx}: \"{class_name}\"}};",
                        ))
                        .unwrap();
                        class_name
                    });

                // completely ignore if we don't need it
                if !entrypoint && !referenced_idents.contains(variable_name.name.as_str()) {
                    continue;
                }

                css_variable_identifiers.insert(
                    variable_name.name.to_string(),
                    (
                        class_name.clone(),
                        tagged_template_expression.clone_in(allocator),
                    ),
                );

                referenced_idents.insert(variable_name.name.to_string());
                // if the right side references any idents, add them
                referenced_idents.extend(expression_get_references(init));

                *init = build_decorated_string(&ast_builder, span, &class_name);
            } else if identifier.name == "style" {
                // TODO dedupe

                style_variable_identifiers.insert(
                    variable_name.name.to_string(),
                    tagged_template_expression.clone_in(allocator),
                );

                referenced_idents.insert(variable_name.name.to_string());
                // if the right side references any idents, add them
                referenced_idents.extend(expression_get_references(init));

                *init = Expression::Identifier(
                    ast_builder.alloc_identifier_reference(span, ast_builder.atom("undefined")),
                );
            }
        }
    }

    // build a new minimal program
    let mut tmp_program = build_new_ast(allocator);
    for stmt in program.body.iter().rev() {
        if let Statement::ImportDeclaration(import_declaration) = stmt {
            let module_id = import_declaration.source.value.to_string();
            let Some(specifiers) = &import_declaration.specifiers else {
                continue;
            };

            let entry = imports.entry(module_id.clone()).or_insert_with(Vec::new);

            // ignore `css` import from this library
            if import_declaration.source.value == LIBRARY_CORE_IMPORT_NAME {
                entry.extend(specifiers.iter().filter(|specifier| match specifier {
                    oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(import_specifier) => {
                        !matches!(
                            &import_specifier.imported,
                            oxc_ast::ast::ModuleExportName::IdentifierName(identifier_name)
                            if identifier_name.name == "css"
                        )
                    }
                    _ => false,
                }));
                continue;
            }

            entry.extend(specifiers);
            continue;
        };

        let mut exported = false;
        let variable_declaration = match stmt {
            Statement::ExportNamedDeclaration(export_named_declaration) => {
                let Some(declaration) = &export_named_declaration.declaration else {
                    continue;
                };
                exported = true;
                match declaration {
                    oxc_ast::ast::Declaration::VariableDeclaration(variable_declaration) => {
                        Some(variable_declaration.clone_in(allocator))
                    }
                    // TODO functions
                    // TODO class
                    _ => continue,
                }
            }
            Statement::ExportDefaultDeclaration(export_default_declaration) => {
                exported = true;
                match &export_default_declaration.declaration {
                    ExportDefaultDeclarationKind::Identifier(identifier) => {
                        let span = export_default_declaration.span;

                        // pretend the default export is actually a variable declaration
                        // for our meta variable
                        let variable_declaration = ast_builder.alloc_variable_declaration(
                            span,
                            VariableDeclarationKind::Let,
                            ast_builder.vec1(ast_builder.variable_declarator(
                                span,
                                VariableDeclarationKind::Let,
                                ast_builder.binding_pattern(
                                    BindingPatternKind::BindingIdentifier(
                                        ast_builder.alloc_binding_identifier(
                                            span,
                                            ast_builder.atom("__global__export__"),
                                        ),
                                    ),
                                    None as Option<oxc_allocator::Box<_>>,
                                    false,
                                ),
                                Some(Expression::Identifier(
                                    ast_builder.alloc_identifier_reference(
                                        span,
                                        ast_builder.atom(&identifier.name),
                                    ),
                                )),
                                false,
                            )),
                            false,
                        );
                        Some(variable_declaration)
                    }
                    ExportDefaultDeclarationKind::CallExpression(call_expression) => {
                        let span = call_expression.span;

                        // pretend the default export is actually a variable declaration
                        // for our meta variable
                        let variable_declaration = ast_builder.alloc_variable_declaration(
                            span,
                            VariableDeclarationKind::Let,
                            ast_builder.vec1(ast_builder.variable_declarator(
                                span,
                                VariableDeclarationKind::Let,
                                ast_builder.binding_pattern(
                                    BindingPatternKind::BindingIdentifier(
                                        ast_builder.alloc_binding_identifier(
                                            span,
                                            ast_builder.atom("__global__export__"),
                                        ),
                                    ),
                                    None as Option<oxc_allocator::Box<_>>,
                                    false,
                                ),
                                Some(Expression::CallExpression(
                                    call_expression.clone_in(allocator),
                                )),
                                false,
                            )),
                            false,
                        );
                        Some(variable_declaration)
                    }
                    ExportDefaultDeclarationKind::FunctionDeclaration(_function_declaration) => {
                        // TODO
                        continue;
                    }
                    _ => continue,
                }
            }
            Statement::VariableDeclaration(variable_declaration) => {
                Some(variable_declaration.clone_in(allocator))
            }
            _ => None,
        };
        if let Some(variable_declaration) = variable_declaration {
            for variable_declarator in variable_declaration.declarations.iter().rev() {
                let Some(init) = &variable_declarator.init else {
                    continue;
                };
                let variable_name = match &variable_declarator.id.kind {
                    BindingPatternKind::BindingIdentifier(binding_identifier) => {
                        binding_identifier.name.as_str()
                    }
                    _ => panic!("invalid 'css`...`' usage"),
                };

                if !referenced_idents.contains(variable_name) {
                    continue;
                }

                let span = variable_declarator.span;

                // if cached, grab from cache
                let cached = js_sys::eval(&format!("{store}?.hasOwnProperty('{variable_name}')",))
                    .unwrap()
                    .is_truthy();
                if cached {
                    let variable_declaration = build_variable_declaration_ident(
                        &ast_builder,
                        span,
                        variable_name,
                        &format!("{store}['{variable_name}']"),
                    );

                    tmp_program.program.body.insert(0, variable_declaration);
                    continue;
                }

                if exported {
                    exports.insert(variable_name.to_string());
                }

                let variable_declaration =
                    Statement::VariableDeclaration(ast_builder.alloc_variable_declaration(
                        span,
                        VariableDeclarationKind::Let,
                        ast_builder.vec1(variable_declarator.clone_in(allocator)),
                        false,
                    ));
                // copy the entire variable declaration verbatim
                tmp_program.program.body.insert(0, variable_declaration);

                // if it's a `css` declaration, also add the `var.css = ...` statement
                if let Some((_, parts)) = css_variable_identifiers.get_mut(variable_name) {
                    tmp_program.program.body.insert(
                        1,
                        Statement::ExpressionStatement(ast_builder.alloc_expression_statement(
                            span,
                            build_object_member_string_assignment(
                                &ast_builder,
                                span,
                                variable_name,
                                "css",
                                ast_builder.expression_template_literal(
                                    span,
                                    parts.quasi.quasis.clone_in(allocator),
                                    parts.quasi.expressions.clone_in(allocator),
                                ),
                            ),
                        )),
                    );
                }

                // handle `style`
                if let Some(parts) = style_variable_identifiers.get_mut(variable_name) {
                    tmp_program.program.body.insert(
                        1,
                        Statement::ExpressionStatement(ast_builder.alloc_expression_statement(
                            span,
                            build_assignment(
                                &ast_builder,
                                span,
                                variable_name,
                                ast_builder.expression_template_literal(
                                    span,
                                    parts.quasi.quasis.clone_in(allocator),
                                    parts.quasi.expressions.clone_in(allocator),
                                ),
                            ),
                        )),
                    );
                }

                // if the right side references any idents, add them
                referenced_idents.extend(expression_get_references(init));
            }
        }
    }

    // handle imports - resolve other modules and rewrite return values into variable declarations
    for (remote_module_id, specifiers) in imports.iter() {
        let mut remote_referenced_idents = HashSet::new();

        let any_ident_referenced = specifiers.iter().any(|specifier| {
            let local_name = match specifier {
                oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(import_specifier) => {
                    import_specifier.local.name.as_str()
                }
                oxc_ast::ast::ImportDeclarationSpecifier::ImportDefaultSpecifier(
                    import_default_specifier,
                ) => import_default_specifier.local.name.as_str(),
                oxc_ast::ast::ImportDeclarationSpecifier::ImportNamespaceSpecifier(
                    _import_namespace_specifier,
                ) => "", // TODO import_namespace_specifier.local.name.to_string(),
            };
            referenced_idents.contains(local_name)
        });

        if !any_ident_referenced {
            continue;
        }

        let (remote_filepath, code) = transformer.load_file(remote_module_id).await?;

        fn make_require<'a>(
            ast_builder: &AstBuilder<'a>,
            binding_pattern: BindingPatternKind<'a>,
            source: &str,
            span: Span,
        ) -> Statement<'a> {
            Statement::VariableDeclaration(ast_builder.alloc_variable_declaration(
                span,
                VariableDeclarationKind::Let,
                ast_builder.vec1(ast_builder.variable_declarator(
                    span,
                    VariableDeclarationKind::Let,
                    ast_builder.binding_pattern(
                        binding_pattern,
                        None as Option<oxc_allocator::Box<_>>,
                        false,
                    ),
                    Some(
                        Expression::CallExpression(
                            ast_builder.alloc_call_expression(
                                span,
                                Expression::Identifier(
                                    ast_builder.alloc_identifier_reference(
                                        span,
                                        ast_builder.atom("require"),
                                    ),
                                ),
                                None as Option<oxc_allocator::Box<_>>,
                                ast_builder.vec1(oxc_ast::ast::Argument::StringLiteral(
                                    ast_builder.alloc_string_literal(
                                        span,
                                        ast_builder.atom(source),
                                        None,
                                    ),
                                )),
                                false,
                            ),
                        ),
                    ),
                    false,
                )),
                false,
            ))
        }

        for specifier in specifiers.iter() {
            let (local_name, remote_name, span) = match specifier {
                oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(import_specifier) => {
                    let local_name = import_specifier.local.name.to_string();
                    if !referenced_idents.contains(&local_name) {
                        continue;
                    }

                    let remote_name = import_specifier.imported.to_string();
                    let span = import_specifier.span;

                    if code.is_empty() {
                        tmp_program.program.body.insert(
                            0,
                            make_require(
                                &ast_builder,
                                BindingPatternKind::ObjectPattern(
                                    ast_builder.alloc_object_pattern(
                                        span,
                                        ast_builder.vec1(
                                            ast_builder.binding_property(
                                                span,
                                                PropertyKey::StaticIdentifier(
                                                    ast_builder.alloc_identifier_name(
                                                        span,
                                                        ast_builder.atom(&remote_name),
                                                    ),
                                                ),
                                                ast_builder.binding_pattern(
                                                    ast_builder
                                                        .binding_pattern_kind_binding_identifier(
                                                            span,
                                                            ast_builder.atom(&local_name),
                                                        ),
                                                    None as Option<oxc_allocator::Box<_>>,
                                                    false,
                                                ),
                                                true,
                                                false,
                                            ),
                                        ),
                                        None as Option<oxc_allocator::Box<_>>,
                                    ),
                                ),
                                &remote_filepath,
                                span,
                            ),
                        );
                        continue;
                    }

                    (local_name, remote_name, import_specifier.span)
                }
                oxc_ast::ast::ImportDeclarationSpecifier::ImportDefaultSpecifier(
                    import_default_specifier,
                ) => {
                    let local_name = import_default_specifier.local.name.to_string();
                    if !referenced_idents.contains(&local_name) {
                        continue;
                    }

                    let span = import_default_specifier.span;

                    if code.is_empty() {
                        tmp_program.program.body.insert(
                            0,
                            make_require(
                                &ast_builder,
                                BindingPatternKind::ObjectPattern(
                                    ast_builder.alloc_object_pattern(
                                        span,
                                        ast_builder.vec1(
                                            ast_builder.binding_property(
                                                span,
                                                PropertyKey::StaticIdentifier(
                                                    ast_builder.alloc_identifier_name(
                                                        span,
                                                        ast_builder.atom("default"),
                                                    ),
                                                ),
                                                ast_builder.binding_pattern(
                                                    ast_builder
                                                        .binding_pattern_kind_binding_identifier(
                                                            span,
                                                            ast_builder.atom(&local_name),
                                                        ),
                                                    None as Option<oxc_allocator::Box<_>>,
                                                    false,
                                                ),
                                                true,
                                                false,
                                            ),
                                        ),
                                        None as Option<oxc_allocator::Box<_>>,
                                    ),
                                ),
                                &remote_filepath,
                                span,
                            ),
                        );
                        continue;
                    }

                    (
                        local_name,
                        "__global__export__".to_string(),
                        import_default_specifier.span,
                    )
                }
                oxc_ast::ast::ImportDeclarationSpecifier::ImportNamespaceSpecifier(
                    _import_namespace_specifier,
                ) => {
                    // TODO
                    continue;
                }
            };

            // add new variable declaration to our tmp program
            let variable_declaration =
                Statement::VariableDeclaration(ast_builder.alloc_variable_declaration(
                    span,
                    VariableDeclarationKind::Const,
                    ast_builder.vec1(
                        ast_builder.variable_declarator(
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
                                    ast_builder.atom(&format!(
                                        "{cache_ref}[\"{remote_filepath}\"][\"{remote_name}\"]"
                                    )),
                                ),
                            )),
                            false,
                        ),
                    ),
                    false,
                ));
            tmp_program.program.body.insert(0, variable_declaration);
            remote_referenced_idents.insert(remote_name);
        }

        // if nothing referenced, nothing to do
        if remote_referenced_idents.is_empty() {
            continue;
        }

        let source_type = SourceType::from_path(&remote_filepath).map_err(|_| {
            TransformError::UknownExtension {
                filepath: remote_filepath.clone(),
            }
        })?;

        let mut ast = Parser::new(allocator, &code, source_type)
            .with_options(ParseOptions {
                parse_regular_expression: true,
                ..ParseOptions::default()
            })
            .parse();
        if ast.panicked {
            return Err(TransformError::RawParseFailed {
                filepath: remote_filepath,
            });
        }

        let cache_ref = &transformer.export_cache_ref;
        let store = format!("global.{cache_ref}[\"{remote_filepath}\"]");
        let all_cached = remote_referenced_idents.iter().all(|ident| {
            js_sys::eval(&format!("{store}?.hasOwnProperty('{ident}')",))
                .unwrap()
                .is_truthy()
        });

        if all_cached {
            continue;
        }

        solid_js_prepass(&ast_builder, &mut ast.program, true);
        transpile_ts_to_js(allocator, &mut ast.program);

        std::boxed::Box::pin(evaluate_program(
            allocator,
            transformer,
            false,
            &remote_filepath,
            &mut ast.program,
            remote_referenced_idents,
        ))
        .await?;
    }

    let mut tmp_program_js = Codegen::new()
        .with_options(CodegenOptions::default())
        .build(&tmp_program.program)
        .code;

    // we append all exported idents we evaluated to the cache
    if !exports.is_empty() {
        tmp_program_js.push_str(&format!(
            "\n{store} = {{...({store} ?? {{}}), {}}};",
            exports.into_iter().collect::<Vec<String>>().join(","),
        ));
    }

    if !css_variable_identifiers.is_empty() {
        // const cssFile = [var.css, var2.css].join("\n\n");
        tmp_program_js.push_str(&format!(
            "\n{}.set('{}.{}', [\n{}\n].join('\\n\\n'));",
            &transformer.css_file_store_ref,
            program_path.replace("'", "\\'"),
            transformer.css_extension,
            css_variable_identifiers
                .into_iter()
                .map(|(variable_name, (class_name, _))| {
                    if class_name.starts_with("_Global") {
                        return format!("`${{{variable_name}.css}}\n`");
                    }
                    format!("`.{class_name} {{\n${{{variable_name}.css}}\n}}`")
                })
                .collect::<Vec<_>>()
                .join(",\n")
        ));
    }

    let css_file_store_ref = &transformer.css_file_store_ref;
    let export_cache_ref = &transformer.export_cache_ref;
    // wrap into promise
    let tmp_program_js = format!(
        "let eval;
        const global = {{
            {css_file_store_ref},
            {export_cache_ref},
        }};
        (async () => {{
            \"use strict\";
            {tmp_program_js}
        }})()"
    );

    let evaluated =
        js_sys::eval(&tmp_program_js).map_err(|cause| TransformError::EvaluationFailed {
            program: tmp_program_js.clone(),
            cause,
        })?;

    let promise = js_sys::Promise::from(evaluated);
    let future = wasm_bindgen_futures::JsFuture::from(promise);
    future
        .await
        .map_err(|cause| TransformError::EvaluationFailed {
            program: tmp_program_js,
            cause,
        })?;

    if !entrypoint {
        return Ok(EvaluateProgramReturnStatus::NotTransformed);
    }

    Ok(EvaluateProgramReturnStatus::Transfomred)
}

#[derive(PartialEq)]
pub enum EvaluateProgramReturnStatus {
    Transfomred,
    NotTransformed,
}

#[wasm_bindgen]
impl Transformer {
    pub async fn transform(
        &self,
        code: String,
        filepath: String,
    ) -> Result<Option<JsValue>, TransformError> {
        let allocator = Allocator::default();
        let source_type =
            SourceType::from_path(&filepath).map_err(|_| TransformError::UknownExtension {
                filepath: filepath.clone(),
            })?;
        let mut ast = Parser::new(&allocator, &code, source_type)
            .with_options(ParseOptions {
                parse_regular_expression: true,
                ..ParseOptions::default()
            })
            .parse();

        if ast.panicked {
            return Err(TransformError::BunlderParseFailed { id: filepath });
        }

        let status = evaluate_program(
            &allocator,
            self,
            true,
            &filepath,
            &mut ast.program,
            HashSet::new(),
        )
        .await?;

        if status == EvaluateProgramReturnStatus::NotTransformed {
            return Ok(None);
        }

        let options = CodegenOptions {
            source_map_path: Some(PathBuf::from_str(&filepath).unwrap()),
            ..Default::default()
        };
        let output_js = Codegen::new().with_options(options).build(&ast.program);

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

        Ok(Some(result.into()))
    }
}

pub fn transpile_ts_to_js<'a>(allocator: &'a Allocator, program: &mut Program<'a>) {
    use oxc_semantic::SemanticBuilder;
    use oxc_transformer::TransformOptions;
    use oxc_transformer::Transformer;

    let ret = SemanticBuilder::new().build(program);
    let scoping = ret.semantic.into_scoping();
    let t = Transformer::new(
        allocator,
        Path::new("test.tsx"),
        &TransformOptions::default(),
    );
    t.build_with_scoping(scoping, program);
}

fn build_new_ast<'a>(allocator: &'a Allocator) -> oxc_parser::ParserReturn<'a> {
    let source_type = SourceType::tsx();
    let parsed = Parser::new(allocator, "", source_type)
        .with_options(ParseOptions {
            parse_regular_expression: true,
            ..ParseOptions::default()
        })
        .parse();
    parsed
}

fn expression_get_references<'a>(expression: &Expression<'a>) -> Vec<String> {
    #[derive(Default)]
    struct Visitor {
        pub references: Vec<String>,
        pub scopes_references: Vec<HashSet<String>>,
    }

    use oxc_ast_visit::walk::walk_formal_parameter;
    use oxc_ast_visit::walk::walk_identifier_reference;
    use oxc_ast_visit::walk::walk_variable_declarator;
    use oxc_syntax::scope::{ScopeFlags, ScopeId};

    impl<'a> Visit<'a> for Visitor {
        fn enter_scope(
            &mut self,
            _flags: ScopeFlags,
            _scope_id: &std::cell::Cell<Option<ScopeId>>,
        ) {
            self.scopes_references.push(HashSet::new());
        }
        fn leave_scope(&mut self) {
            self.scopes_references.pop();
        }

        fn visit_variable_declarator(&mut self, it: &oxc_ast::ast::VariableDeclarator<'a>) {
            let Some(scope) = self.scopes_references.last_mut() else {
                return;
            };
            scope.extend(binding_pattern_kind_get_idents(&it.id.kind));

            walk_variable_declarator(self, it);
        }
        fn visit_formal_parameter(&mut self, it: &oxc_ast::ast::FormalParameter<'a>) {
            let Some(scope) = self.scopes_references.last_mut() else {
                return;
            };
            scope.extend(binding_pattern_kind_get_idents(&it.pattern.kind));

            walk_formal_parameter(self, it);
        }
        fn visit_identifier_reference(&mut self, it: &oxc_ast::ast::IdentifierReference<'a>) {
            let variable_name = &it.name;
            for scope in self.scopes_references.iter() {
                if scope.contains(variable_name.as_str()) {
                    return;
                }
            }
            self.references.push(variable_name.to_string());

            walk_identifier_reference(self, it);
        }
    }

    let mut visitor = Visitor {
        ..Default::default()
    };
    visitor.visit_expression(expression);

    visitor.references
}
