use oxc_ast::ast::{
    Declaration, ExportDefaultDeclaration, ImportDeclarationSpecifier, ModuleExportName,
};

use crate::solid_js::solid_js_prepass;
use crate::utils::{
    binding_pattern_kind_get_idents, replace_in_expression_using_identifiers,
    replace_in_expression_using_spans, transpile_ts_to_js,
};
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
    #[error("tried to access dynamic variable '{variable}' during style evaluation")]
    AccessDynamicVariableError { variable: String },
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
    program_filepath: &'a str,
    store: String,
    referenced_idents: Vec<HashSet<String>>,
    css_variable_identifiers: HashMap<String, String>,
    style_variable_identifiers: HashSet<String>,
    exported_idents: HashSet<String>,
    scope_depth: u32,

    scan_pass: bool,
    aliases: Vec<HashMap<String, Option<String>>>,
    dynamic_variable_names: Vec<HashSet<String>>,
    unique_number_counter: u32,
    css_unique_number_counter: u32,

    replacement_points: HashMap<Span, Expression<'alloc>>,

    random: utils::SeededRandom,
    tmp_program: Program<'alloc>,
    tmp_program_statement_buffer: Vec<Vec<Statement<'alloc>>>,

    pub error: Option<TransformError>,
}

impl<'a, 'alloc> VisitorTransformer<'a, 'alloc> {
    pub fn new(
        ast_builder: &'a AstBuilder<'alloc>,
        allocator: &'alloc Allocator,
        entrypoint: bool,
        store: &str,
        referenced_idents: HashSet<String>,
        program_filepath: &'a str,
    ) -> Self {
        Self {
            ast_builder,
            allocator,
            entrypoint,
            program_filepath,
            store: store.to_string(),
            referenced_idents: vec![referenced_idents],
            css_variable_identifiers: Default::default(),
            style_variable_identifiers: Default::default(),
            exported_idents: Default::default(),
            scope_depth: 0,

            replacement_points: Default::default(),

            scan_pass: false,
            aliases: Default::default(),
            dynamic_variable_names: Default::default(),
            unique_number_counter: 0,
            css_unique_number_counter: 0,

            random: Default::default(),
            tmp_program: utils::build_new_ast(allocator).program,
            tmp_program_statement_buffer: Default::default(),

            error: None,
        }
    }

    #[allow(clippy::type_complexity)]
    pub fn finish(
        self,
    ) -> (
        HashMap<String, String>,
        HashSet<String>,
        HashSet<String>,
        Program<'alloc>,
    ) {
        (
            self.css_variable_identifiers,
            self.referenced_idents.into_iter().next().unwrap(),
            self.exported_idents,
            self.tmp_program,
        )
    }
}

impl<'a, 'alloc> VisitorTransformer<'a, 'alloc> {
    /// creates a class name or gets it from cache
    fn create_virtual_css_template(&mut self, variable_name: &str) -> String {
        // get class name from cache or compute
        let unique_number = self.css_unique_number();
        self.entrypoint
            .then(|| {
                js_sys::eval(&format!("{}?.__css_{unique_number}", self.store))
                    .unwrap()
                    .as_string()
            })
            .flatten()
            .unwrap_or_else(|| {
                let random_suffix = self
                    .random
                    .random_string(6, &format!("{}_{unique_number}", self.program_filepath));
                let class_name = format!("{variable_name}-{random_suffix}");

                js_sys::eval(&format!(
                    "{} = {{...({} ?? {{}}), __css_{unique_number}: \"{}\"}};",
                    self.store, self.store, class_name
                ))
                .unwrap();
                class_name
            })
    }

    fn get_alias(&self, name: &str) -> Option<&str> {
        for alias_map in self.aliases.iter().rev() {
            if let Some(alias) = alias_map.get(name) {
                return alias.as_ref().map(|x| x.as_str());
            }
        }
        None
    }

    fn reference_variable(&mut self, name: String) {
        for (depth, alias_map) in self.aliases.iter().rev().enumerate() {
            if alias_map.contains_key(&name) {
                self.referenced_idents.get_mut(depth).unwrap().insert(name);
                return;
            }
        }

        // if there's no known variable, use the global scope as fallback
        self.referenced_idents.first_mut().unwrap().insert(name);
    }

    fn is_variable_referenced(&mut self, name: &str) -> bool {
        for referenced_set in self.referenced_idents.iter() {
            if referenced_set.contains(name) {
                return true;
            }
        }
        false
    }

    fn get_dynamic_variable(&self, name: &str) -> bool {
        for dynamic_vars in self.dynamic_variable_names.iter().rev() {
            if dynamic_vars.contains(name) {
                return true;
            }
        }
        false
    }

    fn insert_into_virtual_program(&mut self, it: VariableDeclarator<'alloc>, pos: Option<usize>) {
        // TODO handle other kinds
        let BindingPatternKind::BindingIdentifier(variable_name) = &it.id.kind else {
            return;
        };

        let span = it.span;
        let variable_name = variable_name.name.as_str();

        // if cached, grab from cache
        let cached = js_sys::eval(&format!(
            "{}?.hasOwnProperty('{variable_name}')",
            self.store
        ))
        .unwrap()
        .is_truthy();
        if cached {
            let variable_declaration = ast::build_variable_declaration_ident(
                self.ast_builder,
                span,
                self.get_alias(variable_name).unwrap_or(variable_name),
                &format!("{}['{variable_name}']", self.store),
            );

            self.tmp_program_statement_buffer
                .last_mut()
                .unwrap()
                .push(variable_declaration);
            return;
        }

        // copy the entire variable declaration verbatim
        let variable_declaration =
            Statement::VariableDeclaration(self.ast_builder.alloc_variable_declaration(
                span,
                VariableDeclarationKind::Let,
                self.ast_builder.vec1(it),
                false,
            ));

        if let Some(pos) = pos {
            self.tmp_program_statement_buffer
                .last_mut()
                .unwrap()
                .insert(pos, variable_declaration);
        } else {
            self.tmp_program_statement_buffer
                .last_mut()
                .unwrap()
                .push(variable_declaration);
        }
    }

    /// inserts the `var.css = \`...\`` part
    fn insert_into_virtual_program_css(
        &mut self,
        it: &TaggedTemplateExpression<'alloc>,
        variable_name: &str,
        class_name: &str,
    ) {
        let span = it.span;

        self.css_variable_identifiers
            .insert(variable_name.to_string(), class_name.to_string());

        let mut quasis = it.quasi.quasis.clone_in(self.allocator);
        utils::trim_newlines(self.ast_builder, &mut quasis);

        let mut right = self.ast_builder.expression_template_literal(
            span,
            quasis,
            it.quasi.expressions.clone_in(self.allocator),
        );

        replace_in_expression_using_identifiers(self.ast_builder, &mut right, &|name| {
            self.get_alias(name).map(|v| v.to_string())
        });

        let stmt = Statement::ExpressionStatement(self.ast_builder.alloc_expression_statement(
            span,
            ast::build_object_member_string_assignment(
                self.ast_builder,
                span,
                variable_name,
                "css",
                right,
            ),
        ));

        self.tmp_program_statement_buffer
            .last_mut()
            .unwrap()
            .push(stmt);
    }

    fn alias_binding_pattern(&self, pattern: &mut BindingPatternKind<'alloc>) {
        match pattern {
            BindingPatternKind::BindingIdentifier(it) => {
                if let Some(name) = self.get_alias(&it.name) {
                    it.name = self.ast_builder.atom(name);
                }
            }
            BindingPatternKind::ObjectPattern(pattern) => {
                pattern
                    .properties
                    .iter_mut()
                    .for_each(|v| self.alias_binding_pattern(&mut v.value.kind));

                if let Some(rest) = &mut pattern.rest {
                    self.alias_binding_pattern(&mut rest.argument.kind);
                }
            }
            BindingPatternKind::ArrayPattern(pattern) => {
                pattern
                    .elements
                    .iter_mut()
                    .filter_map(|element| element.as_mut())
                    .for_each(|element| self.alias_binding_pattern(&mut element.kind));

                if let Some(rest) = &mut pattern.rest {
                    self.alias_binding_pattern(&mut rest.argument.kind);
                }
            }
            BindingPatternKind::AssignmentPattern(pattern) => {
                self.alias_binding_pattern(&mut pattern.left.kind);
            }
        };
    }

    fn unique_number(&mut self) -> u32 {
        self.unique_number_counter += 1;
        self.unique_number_counter
    }

    fn css_unique_number(&mut self) -> u32 {
        self.css_unique_number_counter += 1;
        self.css_unique_number_counter
    }
}

impl<'a, 'alloc> VisitMut<'alloc> for VisitorTransformer<'a, 'alloc> {
    // do a forward scan for variable declarations, then move backwards through statements
    fn visit_statements(&mut self, it: &mut oxc_allocator::Vec<'alloc, Statement<'alloc>>) {
        if self.error.is_some() {
            return;
        }

        if self.scan_pass {
            return;
        }

        let scan_pass = self.scan_pass;
        self.scan_pass = true;
        for el in it.iter_mut().rev() {
            self.visit_statement(el);
        }
        self.scan_pass = false;
        for el in it.iter_mut().rev() {
            self.visit_statement(el);
        }
        self.scan_pass = scan_pass;
    }

    fn enter_scope(
        &mut self,
        _flags: oxc_semantic::ScopeFlags,
        _scope_id: &std::cell::Cell<Option<oxc_semantic::ScopeId>>,
    ) {
        self.scope_depth += 1;
        self.aliases.push(Default::default());
        self.dynamic_variable_names.push(Default::default());
        self.tmp_program_statement_buffer.push(Default::default());
        if self.scope_depth != 1 {
            self.referenced_idents.push(Default::default());
        }
    }

    fn leave_scope(&mut self) {
        self.aliases.pop();
        self.dynamic_variable_names.pop();

        let statements = self.tmp_program_statement_buffer.pop().unwrap();

        if self.scope_depth != 1 {
            self.referenced_idents.pop();

            self.tmp_program_statement_buffer
                .last_mut()
                .unwrap()
                .extend(statements);
        } else {
            self.tmp_program
                .body
                .splice(0..0, statements.into_iter().rev());
        }

        self.scope_depth -= 1;
    }

    fn visit_expression(&mut self, it: &mut Expression<'alloc>) {
        if self.error.is_some() {
            return;
        }
        if self.scan_pass {
            oxc_ast_visit::walk_mut::walk_expression(self, it);
            return;
        }
        if let Expression::TaggedTemplateExpression(template) = it
            && let Some(tag) = utils::tagged_template_get_tag(template)
            && (tag == "css" || tag == "style")
        {
            let span = template.span;
            let variable_name = &format!("{PREFIX}_expression_{}", self.unique_number());

            let right_references = utils::tagged_template_expression_get_references(template);

            for ident in &right_references {
                if self.get_dynamic_variable(ident) {
                    self.error = Some(TransformError::AccessDynamicVariableError {
                        variable: ident.to_string(),
                    });
                    return;
                }
            }

            self.reference_variable(variable_name.to_string());
            for ident in right_references {
                self.reference_variable(ident);
            }

            let resolved_variable_name = self
                .get_alias(variable_name)
                .unwrap_or(variable_name)
                .to_string();

            match tag {
                "css" => {
                    let class_name = self.create_virtual_css_template(variable_name);

                    self.insert_into_virtual_program_css(
                        template,
                        &resolved_variable_name,
                        &class_name,
                    );

                    let variable_declarator = ast::build_variable_declarator(
                        self.ast_builder,
                        span,
                        &resolved_variable_name,
                        ast::build_decorated_string(self.ast_builder, span, &class_name),
                    );

                    self.insert_into_virtual_program(variable_declarator, None);

                    self.replacement_points.insert(
                        span,
                        Expression::Identifier(self.ast_builder.alloc_identifier_reference(
                            span,
                            self.ast_builder.atom(&resolved_variable_name),
                        )),
                    );

                    *it = ast::build_string(self.ast_builder, span, &class_name);
                }
                "style" => {
                    let mut quasis = template.quasi.quasis.clone_in(self.allocator);
                    utils::trim_newlines(self.ast_builder, &mut quasis);
                    let variable_declarator = ast::build_variable_declarator(
                        self.ast_builder,
                        span,
                        &resolved_variable_name,
                        self.ast_builder.expression_template_literal(
                            span,
                            quasis,
                            template.quasi.expressions.clone_in(self.allocator),
                        ),
                    );

                    self.style_variable_identifiers
                        .insert(variable_name.to_string());

                    self.insert_into_virtual_program(variable_declarator, None);

                    self.replacement_points.insert(
                        span,
                        Expression::Identifier(self.ast_builder.alloc_identifier_reference(
                            span,
                            self.ast_builder.atom(&resolved_variable_name),
                        )),
                    );

                    *it = ast::build_undefined(self.ast_builder, span);
                }
                _ => {
                    unreachable!()
                }
            };
        };

        oxc_ast_visit::walk_mut::walk_expression(self, it);
    }

    fn visit_variable_declarator(&mut self, it: &mut VariableDeclarator<'alloc>) {
        if self.error.is_some() {
            return;
        }
        if self.scan_pass {
            let idents = binding_pattern_kind_get_idents(&it.id.kind);
            for ident in idents {
                let alias = if self.scope_depth == 1 {
                    None
                } else {
                    Some(format!("{PREFIX}_var_{ident}_{}", self.unique_number()))
                };

                self.aliases.last_mut().unwrap().insert(ident, alias);
            }
            oxc_ast_visit::walk_mut::walk_variable_declarator(self, it);
            return;
        }

        let Some(init) = &mut it.init else {
            return;
        };

        if let Expression::TaggedTemplateExpression(template) = init
            && let Some(tag) = utils::tagged_template_get_tag(template)
            && (tag == "css" || tag == "style")
        {
            let BindingPatternKind::BindingIdentifier(variable_name) = &it.id.kind else {
                panic!("css variable declaration was not a regular variable declaration")
            };
            let span = template.span;
            let variable_name = variable_name.name.as_str();

            let right_references = utils::tagged_template_expression_get_references(template);

            for ident in &right_references {
                if self.get_dynamic_variable(ident) {
                    self.error = Some(TransformError::AccessDynamicVariableError {
                        variable: ident.to_string(),
                    });
                    return;
                }
            }

            self.reference_variable(variable_name.to_string());
            for ident in right_references {
                self.reference_variable(ident);
            }

            let resolved_variable_name = self
                .get_alias(variable_name)
                .unwrap_or(variable_name)
                .to_string();

            match tag {
                "css" => {
                    let class_name = self.create_virtual_css_template(variable_name);

                    let variable_declarator = ast::build_variable_declarator(
                        self.ast_builder,
                        span,
                        &resolved_variable_name,
                        ast::build_decorated_string(self.ast_builder, span, &class_name),
                    );

                    self.insert_into_virtual_program_css(
                        template,
                        &resolved_variable_name,
                        &class_name,
                    );

                    self.insert_into_virtual_program(variable_declarator, None);

                    *init = ast::build_string(self.ast_builder, span, &class_name);

                    // if self.entrypoint || self.referenced_idents.contains(variable_name) {
                    // ...
                }
                "style" => {
                    let mut quasis = template.quasi.quasis.clone_in(self.allocator);
                    utils::trim_newlines(self.ast_builder, &mut quasis);
                    let variable_declarator = ast::build_variable_declarator(
                        self.ast_builder,
                        span,
                        &resolved_variable_name,
                        self.ast_builder.expression_template_literal(
                            span,
                            quasis,
                            template.quasi.expressions.clone_in(self.allocator),
                        ),
                    );

                    self.style_variable_identifiers
                        .insert(variable_name.to_string());

                    self.insert_into_virtual_program(variable_declarator, None);

                    self.replacement_points.insert(
                        span,
                        Expression::Identifier(self.ast_builder.alloc_identifier_reference(
                            span,
                            self.ast_builder.atom(&resolved_variable_name),
                        )),
                    );

                    *init = ast::build_undefined(self.ast_builder, span);
                }
                _ => {
                    unreachable!()
                }
            };

            return;
        };

        let pos = self.tmp_program_statement_buffer.last().unwrap().len();

        oxc_ast_visit::walk_mut::walk_variable_declarator(self, it);

        let Some(init) = &it.init else { return };

        let variable_names = binding_pattern_kind_get_idents(&it.id.kind);
        let referenced_variable_names: Vec<_> = variable_names
            .iter()
            .filter(|name| self.is_variable_referenced(name))
            .collect();

        if referenced_variable_names.is_empty() {
            self.replacement_points.insert(
                init.span(),
                ast::build_undefined(self.ast_builder, init.span()),
            );
            return;
        }

        let span = it.span;
        let right_references = utils::expression_get_references(init);

        for ident in &right_references {
            if self.get_dynamic_variable(ident) {
                self.error = Some(TransformError::AccessDynamicVariableError {
                    variable: ident.to_string(),
                });
                return;
            }
        }

        for ident in right_references {
            self.reference_variable(ident);
        }

        let mut right = init.clone_in(self.allocator);

        // transform
        replace_in_expression_using_spans(
            self.ast_builder,
            &mut right,
            &mut self.replacement_points,
        );

        let mut aliased_idents = it.id.kind.clone_in(self.allocator);
        self.alias_binding_pattern(&mut aliased_idents);

        let variable_declarator =
            ast::build_variable_declarator_pattern(self.ast_builder, span, aliased_idents, right);
        self.insert_into_virtual_program(variable_declarator, Some(pos));
    }

    fn visit_export_default_declaration(&mut self, it: &mut ExportDefaultDeclaration<'alloc>) {
        if self.error.is_some() {
            return;
        }
        if self.scan_pass {
            return;
        }

        let global_sentinel = "__global__export__";

        if !self
            .referenced_idents
            .first()
            .unwrap()
            .contains(global_sentinel)
        {
            return;
        }

        self.exported_idents.insert(global_sentinel.to_string());

        match &it.declaration {
            ExportDefaultDeclarationKind::Identifier(identifier) => {
                let span = identifier.span;

                // pretend the default export is actually a variable declaration
                // for our meta variable
                let mut variable_declaration = self.ast_builder.alloc_variable_declaration(
                    span,
                    VariableDeclarationKind::Let,
                    self.ast_builder.vec1(self.ast_builder.variable_declarator(
                        span,
                        VariableDeclarationKind::Let,
                        self.ast_builder.binding_pattern(
                            BindingPatternKind::BindingIdentifier(
                                self.ast_builder.alloc_binding_identifier(
                                    span,
                                    self.ast_builder.atom(global_sentinel),
                                ),
                            ),
                            None as Option<oxc_allocator::Box<_>>,
                            false,
                        ),
                        Some(Expression::Identifier(
                            self.ast_builder.alloc_identifier_reference(
                                span,
                                self.ast_builder.atom(&identifier.name),
                            ),
                        )),
                        false,
                    )),
                    false,
                );

                self.visit_variable_declaration(&mut variable_declaration);
            }
            ExportDefaultDeclarationKind::CallExpression(call_expression) => {
                let span = call_expression.span;

                // pretend the default export is actually a variable declaration
                // for our meta variable
                let mut variable_declaration = self.ast_builder.alloc_variable_declaration(
                    span,
                    VariableDeclarationKind::Let,
                    self.ast_builder.vec1(self.ast_builder.variable_declarator(
                        span,
                        VariableDeclarationKind::Let,
                        self.ast_builder.binding_pattern(
                            BindingPatternKind::BindingIdentifier(
                                self.ast_builder.alloc_binding_identifier(
                                    span,
                                    self.ast_builder.atom(global_sentinel),
                                ),
                            ),
                            None as Option<oxc_allocator::Box<_>>,
                            false,
                        ),
                        Some(Expression::CallExpression(
                            call_expression.clone_in(self.allocator),
                        )),
                        false,
                    )),
                    false,
                );

                self.visit_variable_declaration(&mut variable_declaration);
            }
            ExportDefaultDeclarationKind::FunctionDeclaration(_function_declaration) => {
                // TODO
            }
            _ => {}
        }
    }

    fn visit_export_named_declaration(
        &mut self,
        it: &mut oxc_ast::ast::ExportNamedDeclaration<'alloc>,
    ) {
        if self.error.is_some() {
            return;
        }
        // TODO handle correctly
        if self.scan_pass {
            return;
        }

        let Some(declaration) = &mut it.declaration else {
            return;
        };
        match declaration {
            Declaration::VariableDeclaration(it) => {
                // TODO
                //                 if !self.referenced_idents.contains(global_sentinel) {
                //                     return;
                // }

                for decl in &it.declarations {
                    let idents = binding_pattern_kind_get_idents(&decl.id.kind);
                    self.exported_idents.extend(
                        idents.into_iter().filter(|ident| {
                            self.referenced_idents.first().unwrap().contains(ident)
                        }),
                    );
                }
                self.visit_variable_declaration(it);
            }
            Declaration::FunctionDeclaration(_it) => {
                // TODO
            }
            Declaration::ClassDeclaration(_it) => {
                // TODO
            }
            _ => {}
        }
    }

    fn visit_formal_parameter(&mut self, it: &mut oxc_ast::ast::FormalParameter<'alloc>) {
        if self.error.is_some() {
            return;
        }
        let idents = binding_pattern_kind_get_idents(&it.pattern.kind);

        self.dynamic_variable_names
            .last_mut()
            .unwrap()
            .extend(idents);
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
    ast_builder: &'alloc AstBuilder<'alloc>,
    transformer: &Transformer,
    entrypoint: bool,
    program_path: &String,
    program: &mut Program<'alloc>,
    referenced_idents: HashSet<String>,
    temporary_programs: &mut Vec<String>,
) -> Result<EvaluateProgramReturnStatus, TransformError> {
    let allocator = &ast_builder.allocator;

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

    let cache_ref = &transformer.export_cache_ref;
    let store = format!("global.{cache_ref}[\"{program_path}\"]");

    // transform all css`...` expresisons into classname strings
    let mut css_transformer = VisitorTransformer::new(
        ast_builder,
        allocator,
        entrypoint,
        &store,
        referenced_idents.clone(),
        program_path,
    );
    css_transformer.visit_program(program);
    if let Some(error) = css_transformer.error {
        return Err(error);
    }
    let (css_variable_identifiers, referenced_idents, exported_idents, mut tmp_program) =
        css_transformer.finish();

    // handle imports - resolve other modules and rewrite return values into variable declarations
    for stmt in program.body.iter() {
        let Statement::ImportDeclaration(import_declaration) = stmt else {
            break;
        };
        let remote_module_id = import_declaration.source.value.to_string();
        let Some(specifiers) = &import_declaration.specifiers else {
            continue;
        };

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

        let (remote_filepath, code) = transformer.load_file(&remote_module_id).await?;

        for specifier in specifiers.iter() {
            // ignore `css` imports from us
            if import_declaration.source.value == LIBRARY_CORE_IMPORT_NAME
                && let ImportDeclarationSpecifier::ImportSpecifier(import_specifier) = specifier
                && !matches!(
                    &import_specifier.imported,
                    ModuleExportName::IdentifierName(identifier_name)
                    if identifier_name.name == "css"
                )
            {
                continue;
            }

            let (local_name, remote_name, span) = match specifier {
                oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(import_specifier) => {
                    let local_name = import_specifier.local.name.to_string();
                    if !referenced_idents.contains(&local_name) {
                        continue;
                    }

                    let remote_name = import_specifier.imported.to_string();
                    let span = import_specifier.span;

                    if code.is_empty() {
                        tmp_program.body.insert(
                            0,
                            utils::make_require(
                                ast_builder,
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
                        tmp_program.body.insert(
                            0,
                            utils::make_require(
                                ast_builder,
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
            tmp_program.body.insert(0, variable_declaration);
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

        solid_js_prepass(ast_builder, &mut ast.program, true);

        std::boxed::Box::pin(evaluate_program(
            ast_builder,
            transformer,
            false,
            &remote_filepath,
            &mut ast.program,
            remote_referenced_idents,
            temporary_programs,
        ))
        .await?;
    }

    transpile_ts_to_js(allocator, &mut tmp_program);

    if !tmp_program.body.is_empty()
        && matches!(tmp_program.body[0], Statement::ImportDeclaration(_))
    {
        tmp_program.body.remove(0);
    }

    let mut tmp_program_js = Codegen::new()
        .with_options(CodegenOptions::default())
        .build(&tmp_program)
        .code;

    // js_sys::eval(&format!("console.log('program', '{program_path}')",)).unwrap();

    // we append all exported idents we evaluated to the cache
    if !exported_idents.is_empty() {
        tmp_program_js.push_str(&format!(
            "\n{store} = {{...({store} ?? {{}}), {}}};",
            exported_idents
                .into_iter()
                .collect::<Vec<String>>()
                .join(","),
        ));
    }

    if !css_variable_identifiers.is_empty() {
        // const cssFile = [var.css, var2.css].join("\n\n");
        tmp_program_js.push_str(&format!(
            "\n{}.set('{}.{}', [\n{}\n].join('\\n'));",
            &transformer.css_file_store_ref,
            program_path.replace("'", "\\'"),
            transformer.css_extension,
            css_variable_identifiers
                .into_iter()
                .map(|(variable_name, class_name)| {
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

    temporary_programs.push(tmp_program_js.to_string());

    let css_file_store_ref = &transformer.css_file_store_ref;
    let export_cache_ref = &transformer.export_cache_ref;
    // wrap into promise
    let tmp_program_js = format!(
        "//let eval;
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
        let mut temporary_programs = vec![];

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
            &ast_builder,
            self,
            true,
            &filepath,
            &mut ast.program,
            HashSet::new(),
            &mut temporary_programs,
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

        js_sys::Reflect::set(
            &result,
            &JsValue::from_str("temporaryPrograms"),
            &Array::from_iter(temporary_programs.into_iter().map(JsValue::from)),
        )
        .unwrap();

        Ok(Some(result.into()))
    }
}
