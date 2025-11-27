use oxc_ast::ast::{
    Declaration, ExportDefaultDeclaration, ImportDeclarationSpecifier, ModuleExportName,
};

use crate::solid_js::solid_js_prepass;
use crate::utils::{binding_pattern_kind_get_idents, transpile_ts_to_js};
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
    store: String,
    referenced_idents: &'a mut HashSet<String>,
    css_variable_identifiers: HashMap<String, String>,
    style_variable_identifiers: HashSet<String>,
    exported_idents: HashSet<String>,
    scope_depth: u32,

    scan_pass: bool,
    aliases: Vec<HashMap<String, String>>,
    dynamic_variable_names: Vec<HashSet<String>>,
    ident_alias_counter: u32,
    replacer: utils::IdentReplacer<'a, 'alloc>,

    tmp_program: Program<'alloc>,

    pub error: Option<TransformError>,
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
            css_variable_identifiers: Default::default(),
            style_variable_identifiers: Default::default(),
            exported_idents: Default::default(),
            scope_depth: 0,

            scan_pass: true,
            aliases: Default::default(),
            dynamic_variable_names: Default::default(),
            ident_alias_counter: 0,
            replacer: utils::IdentReplacer::new(),

            tmp_program: utils::build_new_ast(allocator).program,
            error: None,
        }
    }

    #[allow(clippy::type_complexity)]
    pub fn finish(self) -> (HashMap<String, String>, HashSet<String>, Program<'alloc>) {
        (
            self.css_variable_identifiers,
            self.exported_idents,
            self.tmp_program,
        )
    }
}

#[derive(PartialEq)]
enum TagType {
    Css,
    Style,
}

impl<'a, 'alloc> VisitorTransformer<'a, 'alloc> {
    // handle css`` and style``
    fn handle_tagged_template_expression(
        &mut self,
        variable_name: &str,
        it: &mut oxc_allocator::Box<'alloc, oxc_ast::ast::TaggedTemplateExpression<'alloc>>,
    ) -> Option<(TagType, Expression<'alloc>)> {
        let span = it.span;
        let tag = utils::tagged_template_get_tag(it)?;

        if tag == "css" {
            // get class name from the store or compute
            let class_name = self
                .entrypoint
                .then(|| {
                    js_sys::eval(&format!(
                        "{}?.__css_{}_{}",
                        self.store, span.start, span.end
                    ))
                    .unwrap()
                    .as_string()
                })
                .flatten()
                .unwrap_or_else(|| {
                    let random_suffix = utils::generate_random_id(6);
                    let class_name = format!("{variable_name}-{random_suffix}");

                    js_sys::eval(&format!(
                        "{} = {{...({} ?? {{}}), __css_{}_{}: \"{}\"}};",
                        self.store, self.store, span.start, span.end, class_name
                    ))
                    .unwrap();
                    class_name
                });

            self.css_variable_identifiers.insert(
                self.get_alias(variable_name)
                    .unwrap_or(variable_name)
                    .to_string(),
                class_name.to_string(),
            );

            return Some((
                TagType::Css,
                ast::build_decorated_string(self.ast_builder, span, &class_name),
            ));
        } else if tag == "style" {
            self.style_variable_identifiers
                .insert(variable_name.to_string());

            return Some((
                TagType::Style,
                Expression::Identifier(
                    self.ast_builder
                        .alloc_identifier_reference(span, self.ast_builder.atom("undefined")),
                ),
            ));
        }
        None
    }

    fn get_alias(&self, name: &str) -> Option<&str> {
        for alias_map in self.aliases.iter().rev() {
            if let Some(alias) = alias_map.get(name) {
                return Some(alias);
            }
        }
        None
    }

    fn get_dynamic_variable(&self, name: &str) -> bool {
        for dynamic_vars in self.dynamic_variable_names.iter().rev() {
            if dynamic_vars.contains(name) {
                return true;
            }
        }
        false
    }

    /// transforms the declarator and builds the tmp program
    fn handle_expression(
        &mut self,
        it: &VariableDeclarator<'alloc>,
        tag_type: Option<(
            TagType,
            oxc_allocator::Box<'alloc, TaggedTemplateExpression<'alloc>>,
        )>,
    ) {
        let Some(init) = &it.init else {
            return;
        };

        // TODO handle other kinds
        let BindingPatternKind::BindingIdentifier(variable_name) = &it.id.kind else {
            return;
        };
        let variable_name = variable_name.name.as_str();

        // TODO this should probably consider aliases everywhere...
        if !self.referenced_idents.contains(variable_name) {
            return;
        }

        let span = it.span;

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

            self.tmp_program.body.insert(0, variable_declaration);
            return;
        }

        // copy the entire variable declaration verbatim
        let mut variable_declaration =
            Statement::VariableDeclaration(self.ast_builder.alloc_variable_declaration(
                span,
                VariableDeclarationKind::Let,
                self.ast_builder.vec1(it.clone_in(self.allocator)),
                false,
            ));

        self.replacer
            .replace(self.ast_builder, &mut variable_declaration, &self.aliases);

        self.tmp_program.body.insert(0, variable_declaration);

        // if it's a css`` or style`` declaration, also add the `var.css = ...` statement
        match tag_type {
            Some((TagType::Css, tagged_template_expression)) => {
                let mut stmt = Statement::ExpressionStatement(
                    self.ast_builder.alloc_expression_statement(
                        span,
                        ast::build_object_member_string_assignment(
                            self.ast_builder,
                            span,
                            variable_name,
                            "css",
                            self.ast_builder.expression_template_literal(
                                span,
                                tagged_template_expression
                                    .quasi
                                    .quasis
                                    .clone_in(self.allocator),
                                tagged_template_expression
                                    .quasi
                                    .expressions
                                    .clone_in(self.allocator),
                            ),
                        ),
                    ),
                );

                self.replacer
                    .replace(self.ast_builder, &mut stmt, &self.aliases);

                self.tmp_program.body.insert(1, stmt);
            }
            Some((TagType::Style, tagged_template_expression)) => {
                self.tmp_program.body.insert(
                    1,
                    Statement::ExpressionStatement(
                        self.ast_builder.alloc_expression_statement(
                            span,
                            ast::build_assignment(
                                self.ast_builder,
                                span,
                                variable_name,
                                self.ast_builder.expression_template_literal(
                                    span,
                                    tagged_template_expression
                                        .quasi
                                        .quasis
                                        .clone_in(self.allocator),
                                    tagged_template_expression
                                        .quasi
                                        .expressions
                                        .clone_in(self.allocator),
                                ),
                            ),
                        ),
                    ),
                );
            }
            _ => {}
        };

        let right_references = utils::expression_get_references(init);

        for ident in &right_references {
            if self.get_dynamic_variable(ident) {
                self.error = Some(TransformError::AccessDynamicVariableError {
                    variable: ident.to_string(),
                });
                return;
            }
        }

        // if the right side references any idents, add them
        self.referenced_idents.extend(right_references);
    }
}

impl<'a, 'alloc> VisitMut<'alloc> for VisitorTransformer<'a, 'alloc> {
    // do a forward scan for variable declarations, then move backwards through statements
    fn visit_statements(&mut self, it: &mut oxc_allocator::Vec<'alloc, Statement<'alloc>>) {
        if self.error.is_some() {
            return;
        }

        let scan_pass = self.scan_pass;
        self.scan_pass = true;
        for el in it.iter_mut() {
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
    }

    fn leave_scope(&mut self) {
        self.scope_depth -= 1;
        self.aliases.pop();
        self.dynamic_variable_names.pop();
    }

    fn visit_expression(&mut self, it: &mut Expression<'alloc>) {
        if self.error.is_some() {
            return;
        }
        if self.scan_pass {
            oxc_ast_visit::walk_mut::walk_expression(self, it);
            return;
        }
        if let Expression::TaggedTemplateExpression(tagged_template_expression) = it
            && let Some(tag) = utils::tagged_template_get_tag(tagged_template_expression)
            && (tag == "css" || tag == "style")
        {
            let span = tagged_template_expression.span;
            let variable_name = &format!("{PREFIX}_css_{}_{}", span.start, span.end);

            if self.entrypoint || self.referenced_idents.contains(variable_name) {
                let ret = self
                    .handle_tagged_template_expression(variable_name, tagged_template_expression);

                let right_references =
                    utils::tagged_template_expression_get_references(tagged_template_expression);

                for ident in &right_references {
                    if self.get_dynamic_variable(ident) {
                        self.error = Some(TransformError::AccessDynamicVariableError {
                            variable: ident.to_string(),
                        });
                        return;
                    }
                }

                self.referenced_idents.insert(variable_name.to_string());
                // if the right side references any idents, add them
                self.referenced_idents.extend(right_references);

                if let Some((_type, right)) = ret {
                    let variable_declarator = ast::build_variable_declarator(
                        self.ast_builder,
                        span,
                        variable_name,
                        right.clone_in(self.allocator),
                    );

                    self.handle_expression(
                        &variable_declarator,
                        Some((_type, tagged_template_expression.clone_in(self.allocator))),
                    );

                    // TODO swap
                    *it = right;
                    return;
                }
            }
        };

        oxc_ast_visit::walk_mut::walk_expression(self, it);
    }

    fn visit_variable_declarator(&mut self, it: &mut VariableDeclarator<'alloc>) {
        if self.error.is_some() {
            return;
        }
        if self.scan_pass {
            if self.scope_depth != 1 {
                let idents = binding_pattern_kind_get_idents(&it.id.kind);
                for ident in idents {
                    let alias = format!("{PREFIX}_var_{ident}_{}", self.ident_alias_counter);
                    self.aliases.last_mut().unwrap().insert(ident, alias);
                    self.ident_alias_counter += 1;
                }
            }
            oxc_ast_visit::walk_mut::walk_variable_declarator(self, it);
            return;
        }

        let Some(init) = &mut it.init else {
            return;
        };

        let mut tag_type = None;

        if let Expression::TaggedTemplateExpression(tagged_template_expression) = init
            && let Some(tag) = utils::tagged_template_get_tag(tagged_template_expression)
            && (tag == "css" || tag == "style")
        {
            let BindingPatternKind::BindingIdentifier(variable_name) = &it.id.kind else {
                panic!("css variable declaration was not a regular variable declaration")
            };
            let variable_name = variable_name.name.as_str();

            if self.entrypoint || self.referenced_idents.contains(variable_name) {
                let ret = self
                    .handle_tagged_template_expression(variable_name, tagged_template_expression);

                let right_references =
                    utils::tagged_template_expression_get_references(tagged_template_expression);

                for ident in &right_references {
                    if self.get_dynamic_variable(ident) {
                        self.error = Some(TransformError::AccessDynamicVariableError {
                            variable: ident.to_string(),
                        });
                        return;
                    }
                }

                self.referenced_idents.insert(variable_name.to_string());
                // if the right side references any idents, add them
                self.referenced_idents.extend(right_references);

                if let Some((_type, right)) = ret {
                    tag_type = Some((
                        _type,
                        // TODO swap init and avoid copy
                        tagged_template_expression.clone_in(self.allocator),
                    ));
                    *init = right;
                }
            }
        };

        self.handle_expression(it, tag_type);
    }

    fn visit_export_default_declaration(&mut self, it: &mut ExportDefaultDeclaration<'alloc>) {
        if self.error.is_some() {
            return;
        }
        if self.scan_pass {
            return;
        }

        let global_sentinel = "__global__export__";

        if !self.referenced_idents.contains(global_sentinel) {
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
                        idents
                            .into_iter()
                            .filter(|ident| self.referenced_idents.contains(ident)),
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
    mut referenced_idents: HashSet<String>,
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
        &mut referenced_idents,
    );
    css_transformer.visit_program(program);
    if let Some(error) = css_transformer.error {
        return Err(error);
    }
    let (css_variable_identifiers, exported_idents, mut tmp_program) = css_transformer.finish();

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
                        tmp_program.body.insert(
                            0,
                            utils::make_require(
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
            "\n{}.set('{}.{}', [\n{}\n].join('\\n\\n'));",
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
            &ast_builder,
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
