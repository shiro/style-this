use crate::solid_js::solid_js_prepass;
use crate::*;

#[derive(Error, Debug)]
pub enum TransformError {
    #[error("failed to parse program from bundler 'bundler-id:{id}'")]
    BundlerParseFailed { id: String },
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

pub struct VisitorTransformer<'a, 'alloc> {
    ast_builder: &'a AstBuilder<'alloc>,
    allocator: &'alloc Allocator,
    entrypoint: bool,
    store: String,
    referenced_idents: &'a mut HashSet<String>,
    expr_counter: u32,
    css_variable_identifiers: HashMap<
        String,
        (
            String,
            oxc_allocator::Box<'alloc, oxc_ast::ast::TaggedTemplateExpression<'alloc>>,
        ),
    >,
    style_variable_identifiers:
        HashMap<String, oxc_allocator::Box<'alloc, oxc_ast::ast::TaggedTemplateExpression<'alloc>>>,
}

impl<'a, 'alloc> VisitorTransformer<'a, 'alloc> {
    pub fn new(
        ast_builder: &'a AstBuilder<'alloc>,
        allocator: &'alloc Allocator,
        entrypoint: bool,
        store: &str,
        referenced_idents: &'a mut HashSet<String>,
    ) -> Self {
        Self {
            ast_builder,
            allocator,
            entrypoint,
            store: store.to_string(),
            referenced_idents,
            expr_counter: 0,
            css_variable_identifiers: HashMap::new(),
            style_variable_identifiers: HashMap::new(),
        }
    }

    #[allow(clippy::type_complexity)]
    pub fn finish(
        self,
    ) -> (
        HashMap<
            String,
            (
                String,
                oxc_allocator::Box<'alloc, oxc_ast::ast::TaggedTemplateExpression<'alloc>>,
            ),
        >,
        HashMap<String, oxc_allocator::Box<'alloc, oxc_ast::ast::TaggedTemplateExpression<'alloc>>>,
    ) {
        (
            self.css_variable_identifiers,
            self.style_variable_identifiers,
        )
    }
}

impl<'a, 'alloc> VisitorTransformer<'a, 'alloc> {
    // handle css`` and style``
    fn handle_tagged_template_expression(
        &mut self,
        variable_name: &str,
        tagged_template_expression: &mut oxc_allocator::Box<
            'alloc,
            oxc_ast::ast::TaggedTemplateExpression<'alloc>,
        >,
    ) -> Option<Expression<'alloc>> {
        let span = tagged_template_expression.span;
        let tag = utils::tagged_template_get_tag(tagged_template_expression)?;

        if tag != "css" && tag != "style" {
            return None;
        }

        if tag == "css" {
            self.expr_counter += 1;
            let idx = self.expr_counter;

            // get class name from the store or compute
            let class_name = self
                .entrypoint
                .then(|| {
                    js_sys::eval(&format!("{}?.__css_{}", self.store, idx))
                        .unwrap()
                        .as_string()
                })
                .flatten()
                .unwrap_or_else(|| {
                    let random_suffix = utils::generate_random_id(6);
                    let class_name = format!("{variable_name}-{random_suffix}");

                    js_sys::eval(&format!(
                        "{} = {{...({} ?? {{}}), __css_{}: \"{}\"}};",
                        self.store, self.store, idx, class_name
                    ))
                    .unwrap();
                    class_name
                });

            // completely ignore if we don't need it
            if !self.entrypoint && !self.referenced_idents.contains(variable_name) {
                return None;
            }

            self.css_variable_identifiers.insert(
                variable_name.to_string(),
                (
                    class_name.clone(),
                    tagged_template_expression.clone_in(self.allocator),
                ),
            );

            self.referenced_idents.insert(variable_name.to_string());
            // if the right side references any idents, add them
            self.referenced_idents
                .extend(utils::tagged_template_expression_get_references(
                    tagged_template_expression,
                ));

            return Some(ast::build_decorated_string(
                self.ast_builder,
                span,
                &class_name,
            ));
        } else if tag == "style" {
            self.style_variable_identifiers.insert(
                variable_name.to_string(),
                tagged_template_expression.clone_in(self.allocator),
            );

            self.referenced_idents.insert(variable_name.to_string());
            // if the right side references any idents, add them
            self.referenced_idents
                .extend(utils::tagged_template_expression_get_references(
                    tagged_template_expression,
                ));

            return Some(Expression::Identifier(
                self.ast_builder
                    .alloc_identifier_reference(span, self.ast_builder.atom("undefined")),
            ));
        }
        None
    }
}

impl<'a, 'alloc> VisitMut<'alloc> for VisitorTransformer<'a, 'alloc> {
    // move backwards through statements
    fn visit_statements(&mut self, it: &mut oxc_allocator::Vec<'alloc, Statement<'alloc>>) {
        for el in it.iter_mut().rev() {
            self.visit_statement(el);
        }
    }

    fn visit_variable_declarator(&mut self, declarator: &mut VariableDeclarator<'alloc>) {
        // let span = declarator.span;
        let Some(init) = &mut declarator.init else {
            return;
        };

        if let Expression::TaggedTemplateExpression(tagged_template_expression) = init
            && let Some(tag) = utils::tagged_template_get_tag(tagged_template_expression)
            && (tag == "css" || tag == "style")
        {
            let BindingPatternKind::BindingIdentifier(variable_name) = &declarator.id.kind else {
                panic!("css variable declaration was not a regular variable declaration")
            };

            let ret = self
                .handle_tagged_template_expression(&variable_name.name, tagged_template_expression);

            if let Some(ret) = ret {
                *init = ret;
            }
        };
    }
}

#[wasm_bindgen]
pub struct Transformer {
    load_file: js_sys::Function,
    css_file_store_ref: String,
    export_cache_ref: String,
    css_extension: String,
    wrap_selectors_with_global: bool,
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

        let wrap_selectors_with_global =
            js_sys::Reflect::get(&opts, &JsValue::from_str("wrapSelectorsWithGlobal"))
                .unwrap()
                .as_bool()
                .unwrap_or(false);

        let css_file_store_ref = format!("{PREFIX}_{}", utils::generate_random_id(8));
        let css_file_store =
            js_sys::Reflect::get(&opts, &JsValue::from_str("cssFileStore")).unwrap();
        js_sys::Reflect::set(
            &global,
            &JsValue::from_str(&css_file_store_ref),
            &css_file_store,
        )
        .unwrap();

        let export_cache = js_sys::Reflect::get(&opts, &JsValue::from_str("exportCache")).unwrap();
        let export_cache_ref = format!("{PREFIX}_{}", utils::generate_random_id(8));
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
            wrap_selectors_with_global,
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
            if let Statement::ImportDeclaration(import_decl) = import
                && let Some(specifiers) = &import_decl.specifiers
            {
                for specifier in specifiers.iter() {
                    if import_decl.source.value != LIBRARY_CORE_IMPORT_NAME {
                        continue;
                    }

                    if let oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(spec) =
                        specifier
                        && (spec.local.name == "css" || spec.local.name == "style")
                    {
                        return false;
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

    // transform all css`...` expresisons into classname strings
    let mut css_transformer = VisitorTransformer::new(
        &ast_builder,
        allocator,
        entrypoint,
        &store,
        &mut referenced_idents,
    );
    css_transformer.visit_program(program);
    let (mut css_variable_identifiers, mut style_variable_identifiers) = css_transformer.finish();

    // build a new minimal program
    let mut tmp_program = utils::build_new_ast(allocator);
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
                    let variable_declaration = ast::build_variable_declaration_ident(
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
                            ast::build_object_member_string_assignment(
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
                            ast::build_assignment(
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
                referenced_idents.extend(utils::expression_get_references(init));
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
        utils::transpile_ts_to_js(allocator, &mut ast.program);

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
                    if transformer.wrap_selectors_with_global {
                        return format!(
                            "`:global(.{class_name}) {{\n${{{variable_name}.css}}\n}}`"
                        );
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
        import_source: Option<String>,
    ) -> Result<Option<JsValue>, TransformError> {
        let allocator = Allocator::default();
        let ast_builder = AstBuilder::new(&allocator);

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
            // panic!(format!("{:?}", ast.errors));
            return Err(TransformError::BundlerParseFailed { id: filepath });
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

        // add import to virtual css
        if let Some(import_source) = &import_source {
            let import_declaration = ast_builder
                .alloc_import_declaration::<Option<Box<WithClause>>>(
                    ast.program.span,
                    None,
                    ast_builder.string_literal(
                        ast.program.span,
                        ast_builder.atom(import_source),
                        None,
                    ),
                    None,
                    None,
                    ImportOrExportKind::Value,
                );
            ast.program
                .body
                .insert(0, Statement::ImportDeclaration(import_declaration));
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
