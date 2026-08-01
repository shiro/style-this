use super::cache::CSS_CLASSNAME_CACHE;
use super::error::TransformError;
use super::types::VirtualProgramInsert;
use crate::ast;
use crate::error_mapping::get_pos_from_offset;
use crate::utils::{
    self, binding_pattern_kind_get_idents, replace_in_class_body_using_spans,
    replace_in_expression_using_identifiers, replace_in_expression_using_spans,
    replace_in_statement_using_spans,
};
use crate::PREFIX;
use oxc_allocator::{Allocator, CloneIn};
use oxc_ast::ast::{
    BindingPatternKind, Declaration, ExportDefaultDeclaration, ExportDefaultDeclarationKind,
    Expression, ImportDeclarationSpecifier, Program, Statement,
    TaggedTemplateExpression, VariableDeclarationKind, VariableDeclarator,
};
use oxc_ast::AstBuilder;
use oxc_ast_visit::VisitMut;
use oxc_semantic::ScopeFlags;
use oxc_span::{GetSpan, Span};
use std::collections::{HashMap, HashSet};

pub struct VisitorTransformer<'a, 'alloc> {
    ast_builder: &'a AstBuilder<'alloc>,
    allocator: &'alloc Allocator,
    entrypoint: bool,
    cwd: &'a str,
    program_filepath: &'a str,
    program_code: &'a str,
    value_cache: &'a mut HashSet<String>,

    style_function_name: Option<String>,
    css_function_name: Option<String>,
    extra_class_function_name: Option<String>,

    store: String,
    referenced_idents: Vec<HashSet<String>>,
    css_variable_identifiers: Vec<(String, String, Vec<String>)>,
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
        program_code: &'a str,
        value_cache: &'a mut HashSet<String>,
        css_function_name: Option<String>,
        style_function_name: Option<String>,
        extra_class_function_name: Option<String>,
    ) -> Self {
        Self {
            ast_builder,
            allocator,
            entrypoint,
            cwd,
            program_filepath,
            program_code,
            value_cache,

            css_function_name,
            style_function_name,
            extra_class_function_name,

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
        mut self,
    ) -> (
        Vec<(String, String, Vec<String>)>,
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

        // since we collected variable names buttom-up we reverse
        self.css_variable_identifiers.reverse();

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

            if self.check_dynamic_variable_access(&right_references, body.span().start) {
                return;
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
        let unique_number = self.css_unique_number();
        
        // Try to get from cache if entrypoint
        if self.entrypoint {
            if let Some(cached) = CSS_CLASSNAME_CACHE.with(|cache| {
                cache
                    .borrow()
                    .get(self.program_filepath)
                    .and_then(|file_cache| file_cache.get(&unique_number))
                    .cloned()
            }) {
                return cached;
            }
        }

        // Generate new class name
        let relative_program_filepath = self
            .program_filepath
            .strip_prefix(self.cwd)
            .unwrap_or(self.program_filepath);

        let random_suffix = self
            .random
            .random_string(6, &format!("{relative_program_filepath}_{unique_number}"));

        let class_name = format!("{variable_name}-{random_suffix}");

        // Cache it
        CSS_CLASSNAME_CACHE.with(|cache| {
            cache
                .borrow_mut()
                .entry(self.program_filepath.to_string())
                .or_default()
                .insert(unique_number, class_name.clone());
        });

        class_name
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

    fn is_variable_referenced(&self, name: &str) -> bool {
        self.referenced_idents.iter().any(|set| set.contains(name))
    }

    /// checks if the variable exits in the current scope or any scope above it
    fn variable_exists(&self, name: &str) -> bool {
        self.aliases.iter().any(|aliases| aliases.contains_key(name))
    }

    fn get_dynamic_variable(&self, name: &str) -> bool {
        self.dynamic_variable_names.iter().rev().any(|vars| vars.contains(name))
    }

    /// Checks if any references are dynamic variables and sets error if found
    /// Returns true if error was set (meaning there was a dynamic variable access)
    fn check_dynamic_variable_access(&mut self, references: &[String], span_start: u32) -> bool {
        for ident in references {
            if self.get_dynamic_variable(ident) {
                let (row, column) = get_pos_from_offset(self.program_code, span_start as usize);
                self.error = Some(TransformError::AccessDynamicVariableError {
                    variable: ident.to_string(),
                    filepath: self.program_filepath.to_string(),
                    row,
                    column,
                });
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
            let cached = self.value_cache.contains(variable_name);
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
        extra_classes: Vec<String>,
    ) {
        let span = it.span;

        self.css_variable_identifiers
            .push((variable_name.to_string(), class_name.to_string(), extra_classes));

        // Filter out extraClass calls from expressions and adjust quasis accordingly
        let mut new_quasis = oxc_allocator::Vec::new_in(self.allocator);
        let mut new_expressions = oxc_allocator::Vec::new_in(self.allocator);
        
        let extra_class_name = self.extra_class_function_name.as_deref();
        let mut quasi_iter = it.quasi.quasis.iter();
        
        // First quasi always exists
        if let Some(first_quasi) = quasi_iter.next() {
            let mut current_quasi_raw = first_quasi.value.raw.as_str();
            let mut current_span = first_quasi.span;
            let mut current_tail = first_quasi.tail;
            
            for expr in it.quasi.expressions.iter() {
                let is_extra_class = if let Some(name) = extra_class_name {
                    if let Expression::CallExpression(call) = expr {
                        if let Expression::Identifier(ident) = &call.callee {
                            ident.name.as_str() == name
                        } else {
                            false
                        }
                    } else {
                        false
                    }
                } else {
                    false
                };
                
                let next_quasi = quasi_iter.next().unwrap();
                
                if is_extra_class {
                    // Merge this quasi with the next one
                    let merged_value = format!("{}{}", current_quasi_raw, next_quasi.value.raw);
                    current_quasi_raw = self.allocator.alloc_str(&merged_value);
                    current_tail = next_quasi.tail;
                } else {
                    // Keep the expression and add current quasi
                    let value = oxc_ast::ast::TemplateElementValue {
                        raw: self.ast_builder.atom(current_quasi_raw),
                        cooked: Some(self.ast_builder.atom(current_quasi_raw)),
                    };
                    new_quasis.push(oxc_ast::ast::TemplateElement {
                        span: current_span,
                        tail: current_tail,
                        value,
                        lone_surrogates: false,
                    });
                    new_expressions.push(expr.clone_in(self.allocator));
                    current_quasi_raw = next_quasi.value.raw.as_str();
                    current_span = next_quasi.span;
                    current_tail = next_quasi.tail;
                }
            }
            
            // Add the final quasi
            let value = oxc_ast::ast::TemplateElementValue {
                raw: self.ast_builder.atom(current_quasi_raw),
                cooked: Some(self.ast_builder.atom(current_quasi_raw)),
            };
            new_quasis.push(oxc_ast::ast::TemplateElement {
                span: current_span,
                tail: current_tail,
                value,
                lone_surrogates: false,
            });
        }

        utils::trim_newlines(self.ast_builder, &mut new_quasis);

        let mut right = self.ast_builder.expression_template_literal(
            span,
            new_quasis,
            new_expressions,
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

    /// extracts extraClass("a b c") calls from template expressions
    fn extract_extra_classes(&self, it: &TaggedTemplateExpression<'alloc>) -> Vec<String> {
        let mut extra_classes = Vec::new();
        
        if let Some(extra_class_name) = &self.extra_class_function_name {
            for expr in &it.quasi.expressions {
                if let Expression::CallExpression(call) = expr {
                    if let Expression::Identifier(ident) = &call.callee {
                        if ident.name.as_str() == extra_class_name {
                            // Extract string arguments
                            for arg in &call.arguments {
                                if let oxc_ast::ast::Argument::StringLiteral(str_lit) = arg {
                                    // Split by whitespace and collect class names
                                    for class in str_lit.value.split_whitespace() {
                                        extra_classes.push(class.to_string());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        extra_classes
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

            if self.check_dynamic_variable_access(&right_references, template.span().start) {
                return;
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
                    let extra_classes = self.extract_extra_classes(template);
                    
                    // Build the full class list including generated class and extra classes
                    let mut full_class_list = vec![class_name.clone()];
                    full_class_list.extend(extra_classes.clone());
                    let full_class_string = full_class_list.join(" ");

                    self.insert_into_virtual_program_css(
                        template,
                        &resolved_variable_name,
                        &class_name,
                        extra_classes,
                    );

                    let variable_declarator = ast::build_variable_declarator(
                        self.ast_builder,
                        span,
                        &resolved_variable_name,
                        ast::build_decorated_string(self.ast_builder, span, &full_class_string),
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

                    *it = ast::build_string(self.ast_builder, span, &full_class_string);
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

            if self.check_dynamic_variable_access(&right_references, template.span().start) {
                return;
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
                    let extra_classes = self.extract_extra_classes(template);
                    
                    // Build the full class list including generated class and extra classes
                    let mut full_class_list = vec![class_name.clone()];
                    full_class_list.extend(extra_classes.clone());
                    let full_class_string = full_class_list.join(" ");

                    let variable_declarator = ast::build_variable_declarator(
                        self.ast_builder,
                        span,
                        &resolved_variable_name,
                        ast::build_decorated_string(self.ast_builder, span, &full_class_string),
                    );

                    self.insert_into_virtual_program_css(
                        template,
                        &resolved_variable_name,
                        &class_name,
                        extra_classes,
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

                    *init = ast::build_string(self.ast_builder, span, &full_class_string);
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

        if self.check_dynamic_variable_access(&right_references, init.span().start) {
            return;
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
