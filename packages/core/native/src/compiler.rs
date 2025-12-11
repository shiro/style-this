use oxc_ast::ast::{
    Class, Declaration, ExportDefaultDeclaration, Function, ImportDeclarationSpecifier,
    ModuleExportName,
};
use oxc_semantic::ScopeFlags;
use std::cell::RefCell;
use std::collections::HashMap;
use std::thread_local;

use crate::solid_js::solid_js_prepass;
use crate::utils::{
    binding_pattern_kind_get_idents, replace_in_class_body_using_spans,
    replace_in_expression_using_identifiers, replace_in_expression_using_spans,
    replace_in_statement_using_spans, transpile_ts_to_js,
};
use crate::*;
use wasm_bindgen_futures::spawn_local;

thread_local! {
    static CSS_CLASSNAME_CACHE: RefCell<HashMap<String, HashMap<u32, String>>> = RefCell::new(HashMap::new());
    static VALUE_CACHE: RefCell<HashMap<String, HashSet<String>>> = RefCell::new(HashMap::new());
}

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
    #[error(
        "tried to access dynamic variable '{variable}' during style evaluation in '{filepath}'"
    )]
    AccessDynamicVariableError { variable: String, filepath: String },
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

enum VirtualProgramInsert<'alloc> {
    VariableDeclarator(VariableDeclarator<'alloc>),
    FunctionDeclaration(Function<'alloc>),
    ClassDeclaration(Class<'alloc>),
}

impl<'alloc> VirtualProgramInsert<'alloc> {
    fn name(&self) -> Option<HashSet<String>> {
        match self {
            VirtualProgramInsert::VariableDeclarator(declarator) => {
                let idents = binding_pattern_kind_get_idents(&declarator.id.kind);
                if idents.is_empty() {
                    None
                } else {
                    Some(idents.into_iter().collect())
                }
            }
            VirtualProgramInsert::FunctionDeclaration(function) => function.id.as_ref().map(|id| {
                let mut ret = HashSet::new();
                ret.insert(id.name.as_str().to_string());
                ret
            }),
            VirtualProgramInsert::ClassDeclaration(class) => class.id.as_ref().map(|id| {
                let mut ret = HashSet::new();
                ret.insert(id.name.as_str().to_string());
                ret
            }),
        }
    }

    fn span(&self) -> Span {
        match self {
            VirtualProgramInsert::VariableDeclarator(declarator) => declarator.span,
            VirtualProgramInsert::FunctionDeclaration(function) => function.span,
            VirtualProgramInsert::ClassDeclaration(class) => class.span,
        }
    }
}

pub struct VisitorTransformer<'a, 'alloc> {
    ast_builder: &'a AstBuilder<'alloc>,
    allocator: &'alloc Allocator,
    entrypoint: bool,
    cwd: &'a str,
    program_filepath: &'a str,

    style_function_name: Option<String>,
    css_function_name: Option<String>,

    store: String,
    referenced_idents: Vec<HashSet<String>>,
    css_variable_identifiers: Vec<(String, String)>,
    style_variable_identifiers: HashSet<String>,
    exported_idents: HashSet<String>,
    scope_depth: u32,

    scan_pass: bool,
    aliases: Vec<HashMap<String, Option<String>>>,
    dynamic_variable_names: Vec<HashSet<String>>,
    namespace_imports: HashMap<String, (String, HashSet<String>)>,
    unique_number_counter: u32,
    css_unique_number_counter: u32,

    replacement_points: HashMap<Span, Expression<'alloc>>,

    random: utils::SeededRandom,
    tmp_program: Program<'alloc>,
    tmp_program_statement_buffer: Vec<Vec<Statement<'alloc>>>,

    pub error: Option<TransformError>,
}

impl<'a, 'alloc> VisitorTransformer<'a, 'alloc> {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        ast_builder: &'a AstBuilder<'alloc>,
        allocator: &'alloc Allocator,
        entrypoint: bool,
        store: &str,
        referenced_idents: HashSet<String>,
        cwd: &'a str,
        program_filepath: &'a str,
        css_function_name: Option<String>,
        style_function_name: Option<String>,
    ) -> Self {
        Self {
            ast_builder,
            allocator,
            entrypoint,
            cwd,
            program_filepath,
            css_function_name,
            style_function_name,

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
            namespace_imports: Default::default(),
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
        Vec<(String, String)>,
        HashSet<String>,
        HashMap<String, HashSet<String>>,
        HashSet<String>,
        Program<'alloc>,
    ) {
        let namespace_imports_by_module: HashMap<String, HashSet<String>> = self
            .namespace_imports
            .into_iter()
            .map(|(_, (module_id, referenced_idents))| (module_id, referenced_idents))
            .collect();

        (
            self.css_variable_identifiers,
            self.referenced_idents.into_iter().next().unwrap(),
            namespace_imports_by_module,
            self.exported_idents,
            self.tmp_program,
        )
    }
}

impl<'a, 'alloc> VisitorTransformer<'a, 'alloc> {
    fn visit_function_declaration(
        &mut self,
        it: &mut oxc_ast::ast::Function<'alloc>,
        flags: oxc_semantic::ScopeFlags,
    ) {
        let pos = self.tmp_program_statement_buffer.last().unwrap().len();

        oxc_ast_visit::walk_mut::walk_function(self, it, flags);

        let Some(id) = &it.id else { return };
        let name = id.name.as_str();

        if !self.is_variable_referenced(name) {
            return;
        }

        let mut function_declaration = it.clone_in(self.allocator);

        if let Some(body) = &mut function_declaration.body {
            let right_references = body
                .statements
                .iter()
                .flat_map(|stmt| utils::statement_get_references(stmt))
                .collect::<Vec<_>>();

            for ident in &right_references {
                if self.get_dynamic_variable(ident) {
                    self.error = Some(TransformError::AccessDynamicVariableError {
                        variable: ident.to_string(),
                        filepath: self.program_filepath.to_string(),
                    });
                    return;
                }
            }

            // transform
            for statement in &mut body.statements {
                replace_in_statement_using_spans(
                    self.ast_builder,
                    statement,
                    &mut self.replacement_points,
                );
            }
        }

        self.insert_into_virtual_program(
            VirtualProgramInsert::FunctionDeclaration(function_declaration),
            Some(pos),
        );
    }

    fn visit_class_declaration(&mut self, it: &mut oxc_ast::ast::Class<'alloc>) {
        let pos = self.tmp_program_statement_buffer.last().unwrap().len();

        oxc_ast_visit::walk_mut::walk_class(self, it);

        let Some(id) = &it.id else { return };
        let name = id.name.as_str();

        if !self.is_variable_referenced(name) {
            return;
        }

        replace_in_class_body_using_spans(
            self.ast_builder,
            &mut it.body,
            &mut self.replacement_points,
        );

        self.insert_into_virtual_program(
            VirtualProgramInsert::ClassDeclaration(it.clone_in(self.allocator)),
            Some(pos),
        );
    }

    /// creates a class name or gets it from cache
    fn create_virtual_css_template(&mut self, variable_name: &str) -> String {
        // get class name from cache or compute
        let unique_number = self.css_unique_number();
        self.entrypoint
            .then(|| {
                CSS_CLASSNAME_CACHE.with(|cache| {
                    cache
                        .borrow()
                        .get(self.program_filepath)
                        .and_then(|file_cache| file_cache.get(&unique_number))
                        .cloned()
                })
            })
            .flatten()
            .unwrap_or_else(|| {
                let relative_program_filepath = self
                    .program_filepath
                    .strip_prefix(self.cwd)
                    .unwrap_or(self.program_filepath);

                let random_suffix = self
                    .random
                    .random_string(6, &format!("{relative_program_filepath}_{unique_number}"));

                let class_name = format!("{variable_name}-{random_suffix}");

                CSS_CLASSNAME_CACHE.with(|cache| {
                    cache
                        .borrow_mut()
                        .entry(self.program_filepath.to_string())
                        .or_default()
                        .entry(unique_number)
                        .or_insert_with(|| class_name.clone())
                        .clone()
                });

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
        for (depth, alias_map) in self.aliases.iter().enumerate().rev() {
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

    /// checks if the variable exits in the current scope or any scope above it
    fn variable_exists(&mut self, name: &str) -> bool {
        for aliases in self.aliases.iter() {
            if aliases.contains_key(name) {
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

    fn insert_into_virtual_program(
        &mut self,
        it: VirtualProgramInsert<'alloc>,
        pos: Option<usize>,
    ) -> Option<String> {
        let mut variable_names = it.name()?;
        let span = it.span();

        // if cached, grab from cache
        variable_names.retain(|variable_name| {
            let cached = VALUE_CACHE.with(|cache| {
                cache
                    .borrow()
                    .get(self.program_filepath)
                    .is_some_and(|cache| cache.contains(variable_name))
            });
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
                return false;
            }
            true
        });

        if variable_names.is_empty() {
            return None;
        }

        let pos = pos.unwrap_or(self.tmp_program_statement_buffer.last().unwrap().len());

        // copy the entire variable/function/class declaration verbatim
        let (temporary_variable_name, statement) = match it {
            VirtualProgramInsert::VariableDeclarator(mut variable_declarator) => {
                if let BindingPatternKind::BindingIdentifier(left) = &variable_declarator.id.kind {
                    (
                        left.name.to_string(),
                        Statement::VariableDeclaration(
                            self.ast_builder.alloc_variable_declaration(
                                span,
                                VariableDeclarationKind::Let,
                                self.ast_builder.vec1(variable_declarator),
                                false,
                            ),
                        ),
                    )
                } else {
                    let variable_name = format!("{PREFIX}_expression_{}", self.unique_number());

                    // we swap the left side with the new variable identifier, then add another
                    // declaration destructuring the values out of it
                    let pattern = std::mem::replace(
                        &mut variable_declarator.id,
                        self.ast_builder.binding_pattern(
                            BindingPatternKind::BindingIdentifier(
                                self.ast_builder.alloc_binding_identifier(
                                    span,
                                    self.ast_builder.atom(&variable_name),
                                ),
                            ),
                            None as Option<oxc_allocator::Box<_>>,
                            false,
                        ),
                    );
                    let destructure_declarator = ast::build_variable_declarator_pattern(
                        self.ast_builder,
                        span,
                        pattern,
                        ast::build_identifier(self.ast_builder, span, &variable_name),
                    );

                    let variable_declaration = Statement::VariableDeclaration(
                        self.ast_builder.alloc_variable_declaration(
                            span,
                            VariableDeclarationKind::Let,
                            self.ast_builder
                                .vec1(variable_declarator.clone_in(self.allocator)),
                            false,
                        ),
                    );

                    self.tmp_program_statement_buffer
                        .last_mut()
                        .unwrap()
                        .insert(pos, variable_declaration);

                    let s = Statement::VariableDeclaration(
                        self.ast_builder.alloc_variable_declaration(
                            span,
                            VariableDeclarationKind::Let,
                            self.ast_builder.vec1(destructure_declarator),
                            false,
                        ),
                    );
                    (variable_name, s)
                }
            }
            VirtualProgramInsert::FunctionDeclaration(function) => (
                function.name().unwrap().to_string(),
                Statement::FunctionDeclaration(self.ast_builder.alloc(function)),
            ),
            VirtualProgramInsert::ClassDeclaration(class) => (
                class.name().unwrap().to_string(),
                Statement::ClassDeclaration(self.ast_builder.alloc(class)),
            ),
        };

        self.tmp_program_statement_buffer
            .last_mut()
            .unwrap()
            .insert(pos, statement);

        Some(temporary_variable_name)
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
            .push((variable_name.to_string(), class_name.to_string()));

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

    fn visit_import_declaration(&mut self, it: &mut oxc_ast::ast::ImportDeclaration<'alloc>) {
        if self.scan_pass
            && let Some(specifiers) = &it.specifiers
        {
            for specifier in specifiers {
                if let ImportDeclarationSpecifier::ImportNamespaceSpecifier(namespace_spec) =
                    specifier
                {
                    let remote_module_id = it.source.value.to_string();
                    let namespace_name = namespace_spec.local.name.to_string();
                    self.namespace_imports
                        .insert(namespace_name, (remote_module_id, Default::default()));
                }
            }
        }
    }

    fn visit_member_expression(&mut self, it: &mut oxc_ast::ast::MemberExpression<'alloc>) {
        if !self.scan_pass
            && let Some(property) = it.static_property_name()
            && let Some(object) = it
                .object()
                .get_identifier_reference()
                .map(|id| id.name.as_str())
            && !self.variable_exists(object)
            && let Some((_, remote_referenced_idents)) = self.namespace_imports.get_mut(object)
        {
            remote_referenced_idents.insert(property.to_string());
        }

        oxc_ast_visit::walk_mut::walk_member_expression(self, it);
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
            && (Some(tag) == self.css_function_name.as_deref()
                || Some(tag) == self.style_function_name.as_deref())
        {
            oxc_ast_visit::walk_mut::walk_tagged_template_expression(self, template);

            let span = template.span;
            let variable_name = &format!("{PREFIX}_expression_{}", self.unique_number());

            let right_references = utils::tagged_template_expression_get_references(template);

            for ident in &right_references {
                if self.get_dynamic_variable(ident) {
                    self.error = Some(TransformError::AccessDynamicVariableError {
                        variable: ident.to_string(),
                        filepath: self.program_filepath.to_string(),
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
                tag if Some(tag) == self.css_function_name.as_deref() => {
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

                    self.insert_into_virtual_program(
                        VirtualProgramInsert::VariableDeclarator(variable_declarator),
                        None,
                    );

                    self.replacement_points.insert(
                        span,
                        Expression::Identifier(self.ast_builder.alloc_identifier_reference(
                            span,
                            self.ast_builder.atom(&resolved_variable_name),
                        )),
                    );

                    *it = ast::build_string(self.ast_builder, span, &class_name);
                }
                tag if Some(tag) == self.style_function_name.as_deref() => {
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

                    self.insert_into_virtual_program(
                        VirtualProgramInsert::VariableDeclarator(variable_declarator),
                        None,
                    );

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
            && (Some(tag) == self.css_function_name.as_deref()
                || Some(tag) == self.style_function_name.as_deref())
        {
            let BindingPatternKind::BindingIdentifier(variable_name) = &it.id.kind else {
                panic!("css variable declaration was not a regular variable declaration")
            };

            oxc_ast_visit::walk_mut::walk_tagged_template_expression(self, template);

            let span = template.span;
            let variable_name = variable_name.name.as_str();

            let right_references = utils::tagged_template_expression_get_references(template);

            for ident in &right_references {
                if self.get_dynamic_variable(ident) {
                    self.error = Some(TransformError::AccessDynamicVariableError {
                        variable: ident.to_string(),
                        filepath: self.program_filepath.to_string(),
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
                tag if Some(tag) == self.css_function_name.as_deref() => {
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

                    self.insert_into_virtual_program(
                        VirtualProgramInsert::VariableDeclarator(variable_declarator),
                        None,
                    );

                    self.replacement_points.insert(
                        span,
                        Expression::Identifier(self.ast_builder.alloc_identifier_reference(
                            span,
                            self.ast_builder.atom(&resolved_variable_name),
                        )),
                    );

                    *init = ast::build_string(self.ast_builder, span, &class_name);
                }
                tag if Some(tag) == self.style_function_name.as_deref() => {
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

                    self.insert_into_virtual_program(
                        VirtualProgramInsert::VariableDeclarator(variable_declarator),
                        None,
                    );

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
            return;
        }

        let span = it.span;
        let right_references = utils::expression_get_references(init);

        for ident in &right_references {
            if self.get_dynamic_variable(ident) {
                self.error = Some(TransformError::AccessDynamicVariableError {
                    variable: ident.to_string(),
                    filepath: self.program_filepath.to_string(),
                });
                return;
            }
        }

        for ident in right_references {
            self.reference_variable(ident);
        }

        let mut right = init.clone_in(self.allocator);

        replace_in_expression_using_spans(
            self.ast_builder,
            &mut right,
            &mut self.replacement_points,
        );

        replace_in_expression_using_identifiers(self.ast_builder, &mut right, &|name| {
            self.get_alias(name).map(|v| v.to_string())
        });

        let mut aliased_idents = it.id.kind.clone_in(self.allocator);
        self.alias_binding_pattern(&mut aliased_idents);

        let variable_declarator = ast::build_variable_declarator_pattern(
            self.ast_builder,
            span,
            self.ast_builder.binding_pattern(
                aliased_idents,
                None as Option<oxc_allocator::Box<_>>,
                false,
            ),
            right,
        );

        let ret = self.insert_into_virtual_program(
            VirtualProgramInsert::VariableDeclarator(variable_declarator),
            Some(pos),
        );

        // point to the newly hoisted variable on global level
        if let Some(variable_name) = ret {
            self.replacement_points.insert(
                init.span(),
                Expression::Identifier(
                    self.ast_builder
                        .alloc_identifier_reference(span, self.ast_builder.atom(&variable_name)),
                ),
            );
        };
    }

    fn visit_statement(&mut self, it: &mut Statement<'alloc>) {
        if self.error.is_some() {
            return;
        }

        if let Statement::FunctionDeclaration(function) = it {
            self.visit_function_declaration(function, ScopeFlags::Function);
        }

        if let Statement::ClassDeclaration(class) = it {
            self.visit_class_declaration(class);
        }

        oxc_ast_visit::walk_mut::walk_statement(self, it);
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
            oxc_ast_visit::walk_mut::walk_export_default_declaration(self, it);
            return;
        }

        self.exported_idents.insert(global_sentinel.to_string());

        match &it.declaration {
            ExportDefaultDeclarationKind::FunctionDeclaration(function) => {
                let span = function.span;

                let mut function = function.clone_in(self.allocator);
                function.id = Some(
                    self.ast_builder
                        .binding_identifier(span, self.ast_builder.atom(global_sentinel)),
                );

                let mut statement = Statement::FunctionDeclaration(function);
                self.visit_statement(&mut statement);
            }
            ExportDefaultDeclarationKind::ClassDeclaration(class) => {
                let span = class.span;

                let mut class = class.clone_in(self.allocator);
                class.id = Some(
                    self.ast_builder
                        .binding_identifier(span, self.ast_builder.atom(global_sentinel)),
                );

                let mut statement = Statement::ClassDeclaration(class);
                self.visit_statement(&mut statement);
            }
            rest => {
                let span = rest.span();
                let expression =
                    utils::export_default_declaration_to_expression(self.allocator, rest);

                // pretend the default export is actually a variable declaration
                // for our meta variable
                let variable_declarator = ast::build_variable_declarator(
                    self.ast_builder,
                    span,
                    global_sentinel,
                    expression,
                );

                let mut statement =
                    Statement::VariableDeclaration(self.ast_builder.alloc_variable_declaration(
                        span,
                        VariableDeclarationKind::Let,
                        self.ast_builder.vec1(variable_declarator),
                        false,
                    ));
                self.visit_statement(&mut statement);
            }
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
            Declaration::FunctionDeclaration(function) => {
                let name = function
                    .id
                    .as_ref()
                    .expect("named exported functions always have a name")
                    .name
                    .as_str();

                if self.referenced_idents.first().unwrap().contains(name) {
                    self.exported_idents.insert(name.to_string());
                }

                let mut statement =
                    Statement::FunctionDeclaration(function.clone_in(self.allocator));
                self.visit_statement(&mut statement);
            }
            Declaration::ClassDeclaration(class) => {
                let name = class
                    .id
                    .as_ref()
                    .expect("named exported classes always have a name")
                    .name
                    .as_str();

                if self.referenced_idents.first().unwrap().contains(name) {
                    self.exported_idents.insert(name.to_string());
                }

                let mut statement = Statement::ClassDeclaration(class.clone_in(self.allocator));
                self.visit_statement(&mut statement);
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
    cwd: String,
    ignored_imports: HashMap<String, Vec<String>>,

    load_file: js_sys::Function,
    css_file_store_ref: String,
    export_cache_ref: String,
    css_extension: String,
    wrap_selectors_with_global: bool,

    use_require: bool,
}

#[wasm_bindgen]
impl Transformer {
    #[wasm_bindgen(constructor)]
    #[allow(clippy::new_without_default)]
    pub fn new(opts: JsValue) -> Self {
        let global = js_sys::global();

        let cwd = js_sys::Reflect::get(&opts, &JsValue::from_str("cwd"))
            .unwrap()
            .as_string()
            .unwrap();

        let ignored_imports = js_sys::Reflect::get(&opts, &JsValue::from_str("ignoredImports"))
            .ok()
            .and_then(|v| v.dyn_into::<js_sys::Object>().ok());

        let ignored_imports: HashMap<String, Vec<String>> = ignored_imports
            .as_ref()
            .map(|ignored_imports| {
                js_sys::Object::keys(ignored_imports)
                    .iter()
                    .filter_map(|key| {
                        let key_str = key.as_string()?;
                        let value = js_sys::Reflect::get(ignored_imports, &key).ok()?;
                        let array = js_sys::Array::from(&value);
                        let vec: Vec<String> =
                            array.iter().filter_map(|item| item.as_string()).collect();
                        Some((key_str, vec))
                    })
                    .collect()
            })
            .unwrap_or_default();

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

        let use_require = js_sys::Reflect::get(&opts, &JsValue::from_str("useRequire"))
            .unwrap()
            .as_bool()
            .unwrap_or_default();

        Self {
            cwd,
            ignored_imports,

            load_file,
            css_file_store_ref,
            export_cache_ref,
            css_extension,
            wrap_selectors_with_global,

            use_require,
        }
    }

    /// loads file contents and id
    async fn load_file(
        &self,
        id: &str,
        importer: &str,
    ) -> Result<(String, String), TransformError> {
        let promise = self
            .load_file
            .call2(
                &JsValue::UNDEFINED,
                &JsValue::from_str(id),
                &JsValue::from_str(importer),
            )
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

#[allow(clippy::too_many_arguments)]
pub async fn evaluate_program<'alloc>(
    ast_builder: &'alloc AstBuilder<'alloc>,
    transformer: &Transformer,
    entrypoint: bool,
    cwd: &str,
    program_filepath: &str,
    program: &mut Program<'alloc>,
    referenced_idents: HashSet<String>,
    temporary_programs: &mut Vec<String>,
) -> Result<EvaluateProgramReturnStatus, TransformError> {
    let allocator = &ast_builder.allocator;

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
        return Ok(EvaluateProgramReturnStatus::NotTransformed);
    }

    if solid_prepass {
        solid_js_prepass(ast_builder, program, false);
    }

    let cache_ref = &transformer.export_cache_ref;
    let store = format!("global.{cache_ref}[\"{program_filepath}\"]");

    // transform all css`...` expresisons into classname strings
    let mut css_transformer = VisitorTransformer::new(
        ast_builder,
        allocator,
        entrypoint,
        &store,
        referenced_idents.clone(),
        cwd,
        program_filepath,
        css_function_name,
        style_function_name,
    );
    css_transformer.visit_program(program);
    if let Some(error) = css_transformer.error {
        return Err(error);
    }
    let (
        css_variable_identifiers,
        referenced_idents,
        mut namespace_imports,
        exported_idents,
        mut tmp_program,
    ) = css_transformer.finish();

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

        let (remote_filepath, code) = transformer
            .load_file(&remote_module_id, program_filepath)
            .await?;

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

                    // node_modules imports
                    if code.is_empty() {
                        let left =
                            BindingPatternKind::ObjectPattern(ast_builder.alloc_object_pattern(
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
                            ));
                        tmp_program.body.insert(
                            0,
                            if transformer.use_require {
                                utils::make_require(ast_builder, left, &remote_filepath, span)
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
                        let left =
                            BindingPatternKind::ObjectPattern(ast_builder.alloc_object_pattern(
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
                            ));
                        tmp_program.body.insert(
                            0,
                            if transformer.use_require {
                                utils::make_require(ast_builder, left, &remote_filepath, span)
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
                oxc_ast::ast::ImportDeclarationSpecifier::ImportNamespaceSpecifier(import) => {
                    let namespace_name = import.local.name.to_string();

                    if !referenced_idents.contains(&namespace_name) {
                        continue;
                    }

                    let span = import.span;

                    // node_modules imports
                    if code.is_empty() {
                        let left = BindingPatternKind::BindingIdentifier(
                            ast_builder
                                .alloc_binding_identifier(span, ast_builder.atom(&namespace_name)),
                        );
                        tmp_program.body.insert(
                            0,
                            if transformer.use_require {
                                utils::make_require(ast_builder, left, &remote_filepath, span)
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
                                    ast_builder.atom(&cache_source),
                                ),
                            )),
                            false,
                        ),
                    ),
                    false,
                ));
            tmp_program.body.insert(0, variable_declaration);
            if let Some(remote_name) = remote_name {
                remote_referenced_idents.insert(remote_name);
            }
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

        let all_cached = remote_referenced_idents.iter().all(|ident| {
            VALUE_CACHE.with(|cache| {
                cache
                    .borrow()
                    .get(&remote_filepath)
                    .is_some_and(|cache| cache.contains(ident))
            })
        });

        if all_cached {
            continue;
        }

        std::boxed::Box::pin(evaluate_program(
            ast_builder,
            transformer,
            false,
            cwd,
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
        VALUE_CACHE.with(|cache| {
            cache
                .borrow_mut()
                .entry(program_filepath.to_string())
                .or_default()
                .extend(exported_idents.iter().cloned());
        });

        // TODO this only needs to be sorted for tests to stay consistent
        let mut idents: Vec<String> = exported_idents.into_iter().collect();
        idents.sort();
        let idents = idents.join(",");

        tmp_program_js.push_str(&format!("\n{store} = {{...({store} ?? {{}}), {idents}}};"));
    }

    let has_css = !css_variable_identifiers.is_empty();

    if has_css {
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

        tmp_program_js.push_str(&format!(
            "\n{}.set('{}.{}', [\n{css}\n].join('\\n'));",
            &transformer.css_file_store_ref,
            program_filepath.replace("'", "\\'"),
            transformer.css_extension,
        ));

        // tmp_program_js.push_str(&format!("\nreturn [\n{css}\n].join('\\n');"));
    }

    temporary_programs.push(tmp_program_js.to_string());

    let css_file_store_ref = &transformer.css_file_store_ref;
    let export_cache_ref = &transformer.export_cache_ref;
    // wrap into promise
    let mut tmp_program_js = format!(
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

    // if has_css {
    //     tmp_program_js.push_str(&format!(
    //         "\n{}.set('{}.{}', ret);",
    //         &transformer.css_file_store_ref,
    //         program_filepath.replace("'", "\\'"),
    //         transformer.css_extension,
    //     ));
    // }

    let evaluated =
        js_sys::eval(&tmp_program_js).map_err(|cause| TransformError::EvaluationFailed {
            program: tmp_program_js.clone(),
            cause,
        })?;

    // TODO
    // spawn_local(async move {
    //     use async_std::task;
    //     use std::time::Duration;
    //     task::sleep(Duration::from_secs(1)).await;
    //     js_sys::eval(&format!("console.log('hi')",)).unwrap();
    // });

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
            &self.cwd,
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

            let insert_pos = ast
                .program
                .body
                .iter()
                .position(|stmt| !matches!(stmt, Statement::ImportDeclaration(_)))
                .unwrap_or(0);

            ast.program
                .body
                .insert(insert_pos, Statement::ImportDeclaration(import_declaration));
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
