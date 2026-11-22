use super::atomic::ATOMIC_CLASSES_IDENT;
use super::cache::CSS_CLASSNAME_CACHE;
use super::dependency_tracker::{DEFAULT_EXPORT, STAR_IMPORT};
use super::error::TransformError;
use super::types::{CssVariableIdentifier, VirtualProgramInsert};
use crate::PREFIX;
use crate::ast;
use crate::error_mapping::get_pos_from_offset;
use crate::styled_component_transformer::ClassDisplayNames;
use crate::utils::{
    self, binding_pattern_kind_get_idents, replace_in_class_body_using_spans,
    replace_in_expression_using_identifiers, replace_in_expression_using_spans,
    replace_in_statement_using_spans,
};
use oxc_allocator::{Allocator, CloneIn};
use oxc_ast::AstBuilder;
use oxc_ast::ast::{
    BindingPatternKind, ChainElement, Declaration, ExportDefaultDeclaration,
    ExportDefaultDeclarationKind, Expression, ImportDeclarationSpecifier, LogicalOperator, Program,
    Statement, TaggedTemplateExpression, VariableDeclarationKind, VariableDeclarator,
};
use oxc_ast_visit::VisitMut;
use oxc_semantic::ScopeFlags;
use oxc_span::{GetSpan, Span};
use std::collections::{BTreeSet, HashMap, HashSet};

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
    class_display_names: ClassDisplayNames,

    store: String,
    referenced_idents: Vec<HashSet<String>>,
    css_variable_identifiers: Vec<CssVariableIdentifier>,
    style_variable_identifiers: HashSet<String>,
    /// exported name -> local name
    exported_idents: HashMap<String, String>,
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
    /// per statement list being visited
    pending_declarations: Vec<Vec<PendingDeclaration<'alloc>>>,

    atomic: bool,

    pub error: Option<TransformError>,
}

/// A declaration that wasn't referenced when it was visited. Statements are visited bottom-up, so
/// a declaration above it can still reference it, e.g. `function f() { return size; }
/// const size = 4;`.
struct PendingDeclaration<'alloc> {
    declaration: VirtualProgramInsert<'alloc>,
    right_references: Vec<String>,
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
        class_display_names: ClassDisplayNames,
        atomic: bool,
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
            class_display_names,

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
            pending_declarations: Default::default(),

            atomic,

            error: None,
        }
    }

    #[allow(clippy::type_complexity)]
    pub fn finish(
        mut self,
    ) -> (
        Vec<CssVariableIdentifier>,
        HashSet<String>,
        HashMap<String, HashSet<String>>,
        HashMap<String, String>,
        Program<'alloc>,
    ) {
        let mut namespace_imports_by_module: HashMap<String, HashSet<String>> = HashMap::new();
        for (module_id, referenced_idents) in self.namespace_imports.into_values() {
            namespace_imports_by_module
                .entry(module_id)
                .or_default()
                .extend(referenced_idents);
        }

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
        // before the walk rewrites the CSS inside
        let right_references = utils::function_get_references(it);

        oxc_ast_visit::walk_mut::walk_function(self, it, flags);

        self.include_or_defer_declaration(
            VirtualProgramInsert::FunctionDeclaration(it.clone_in(self.allocator)),
            right_references,
            pos,
        );
    }

    fn visit_class_declaration(&mut self, it: &mut oxc_ast::ast::Class<'alloc>) {
        let pos = self.tmp_program_statement_buffer.last().unwrap().len();
        // before the walk rewrites the CSS inside
        let right_references = utils::class_get_references(it);

        oxc_ast_visit::walk_mut::walk_class(self, it);

        self.include_or_defer_declaration(
            VirtualProgramInsert::ClassDeclaration(it.clone_in(self.allocator)),
            right_references,
            pos,
        );
    }

    fn include_or_defer_declaration(
        &mut self,
        declaration: VirtualProgramInsert<'alloc>,
        right_references: Vec<String>,
        pos: usize,
    ) {
        let Some(names) = declaration.name() else {
            return;
        };

        if names.iter().any(|name| self.is_variable_referenced(name)) {
            self.include_declaration(declaration, right_references, pos);
        } else if let Some(pending) = self.pending_declarations.last_mut() {
            pending.push(PendingDeclaration {
                declaration,
                right_references,
            });
        }
    }

    /// Includes the pending declarations that got referenced, including the ones they reference.
    ///
    /// They can't keep their position, the `css` templates inside functions are evaluated where
    /// the function is, e.g. `function f() { return css\`${size}\`; } const size = 4;`. So each
    /// one is inserted right above the first statement using it, or calling a function using it
    /// (function declarations are hoisted). The statements below that point it depends on move
    /// up with it, e.g. `const size = base * 2;` with `base` declared below `f`. The ones only
    /// used by exports or other pending declarations go to the bottom, the latter pull them up
    /// once included.
    fn include_pending_declarations(&mut self) {
        let mut pending = self.pending_declarations.pop().unwrap();
        let mut included = vec![];
        while let Some(idx) = pending.iter().position(|declaration| {
            declaration
                .declaration
                .name()
                .unwrap()
                .iter()
                .any(|name| self.is_variable_referenced(name))
        }) {
            let declaration = pending.swap_remove(idx);
            for ident in &declaration.right_references {
                self.reference_variable(ident.clone());
            }
            included.push(declaration);
        }

        for PendingDeclaration {
            declaration,
            right_references,
        } in included
        {
            let len = self.tmp_program_statement_buffer.last().unwrap().len();
            self.include_declaration(declaration, right_references, len);
            if self.error.is_some() {
                return;
            }

            let buffer = self.tmp_program_statement_buffer.last_mut().unwrap();
            let mut statements: Vec<_> = buffer.drain(len..).collect();
            let mut names = program_declared_values(&statements);
            let references: Vec<_> = buffer.iter().map(utils::statement_get_references).collect();
            let uses = |idx: usize, names: &HashSet<String>| {
                references[idx].iter().any(|name| names.contains(name))
            };
            // function declarations are hoisted, they use it where they're called
            loop {
                let len = names.len();
                for (idx, statement) in buffer.iter().enumerate() {
                    if let Statement::FunctionDeclaration(function) = statement
                        && uses(idx, &names)
                    {
                        names.extend(function.id.as_ref().map(|id| id.name.to_string()));
                    }
                }
                if names.len() == len {
                    break;
                }
            }
            // the buffer is bottom-up
            let Some(user) = (0..buffer.len()).rev().find(|&idx| {
                !matches!(buffer[idx], Statement::FunctionDeclaration(_)) && uses(idx, &names)
            }) else {
                buffer.splice(0..0, statements);
                continue;
            };

            let below: Vec<_> = buffer.drain(..user).collect();
            let dependencies = statement_dependencies(&below, &statements);
            let (dependencies, below): (Vec<_>, Vec<_>) = below
                .into_iter()
                .enumerate()
                .partition(|(idx, _)| dependencies.contains(idx));
            statements.extend(dependencies.into_iter().map(|(_, statement)| statement));
            buffer.splice(1..1, statements);
            buffer.splice(0..0, below.into_iter().map(|(_, statement)| statement));
        }
    }

    fn include_declaration(
        &mut self,
        declaration: VirtualProgramInsert<'alloc>,
        right_references: Vec<String>,
        pos: usize,
    ) {
        let declaration = match declaration {
            VirtualProgramInsert::FunctionDeclaration(mut function) => {
                if let Some(body) = &mut function.body {
                    if self.check_dynamic_variable_access(&right_references, body.span().start) {
                        return;
                    }

                    for ident in right_references {
                        self.reference_variable(ident);
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

                VirtualProgramInsert::FunctionDeclaration(function)
            }
            VirtualProgramInsert::ClassDeclaration(mut class) => {
                if self.check_dynamic_variable_access(&right_references, class.body.span.start) {
                    return;
                }

                for ident in right_references {
                    self.reference_variable(ident);
                }

                replace_in_class_body_using_spans(
                    self.ast_builder,
                    &mut class.body,
                    &mut self.replacement_points,
                );

                VirtualProgramInsert::ClassDeclaration(class)
            }
            VirtualProgramInsert::VariableDeclarator(declarator) => {
                let VariableDeclarator { span, id, init, .. } = declarator;
                let Some(mut right) = init else { return };
                let init_span = right.span();

                if self.check_dynamic_variable_access(&right_references, init_span.start) {
                    return;
                }

                for ident in right_references {
                    self.reference_variable(ident);
                }

                replace_in_expression_using_spans(
                    self.ast_builder,
                    &mut right,
                    &mut self.replacement_points,
                );

                replace_in_expression_using_identifiers(self.ast_builder, &mut right, &|name| {
                    self.get_alias(name).map(|v| v.to_string())
                });

                let mut aliased_idents = id.kind;
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
                        init_span,
                        Expression::Identifier(self.ast_builder.alloc_identifier_reference(
                            span,
                            self.ast_builder.atom(&variable_name),
                        )),
                    );
                };
                return;
            }
        };

        self.insert_into_virtual_program(declaration, Some(pos));
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
        // For _Global prefixed variables, use the variable name as-is without random suffix
        let class_name = if variable_name.starts_with("_Global") {
            variable_name.to_string()
        } else {
            let relative_program_filepath = self
                .program_filepath
                .strip_prefix(self.cwd)
                .unwrap_or(self.program_filepath);

            let random_suffix = self
                .random
                .random_string(6, &format!("{relative_program_filepath}_{unique_number}"));

            // `$` is valid in JS identifiers but not in CSS class names, `__` instead of `_` so
            // `$Global` doesn't become a `_Global` class
            let variable_name = variable_name.replace('$', "__");

            format!("{variable_name}-{random_suffix}")
        };

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

    /// Name used for the class name and atomic export key of a declaration, the styled wrapper's
    /// class binding uses the component's display name instead of the binding name.
    fn get_display_name<'b>(&'b self, init_span: Span, binding_name: &'b str) -> &'b str {
        self.class_display_names
            .get(&init_span)
            .map_or(binding_name, String::as_str)
    }

    fn get_alias(&self, name: &str) -> Option<&str> {
        for alias_map in self.aliases.iter().rev() {
            if let Some(alias) = alias_map.get(name) {
                return alias.as_ref().map(|x| x.as_str());
            }
        }
        None
    }

    /// Depth of the innermost scope declaring the name, the global scope for unknown names.
    fn declaring_depth(&self, name: &str) -> usize {
        self.aliases
            .iter()
            .rposition(|alias_map| alias_map.contains_key(name))
            .unwrap_or(0)
    }

    fn reference_variable(&mut self, name: String) {
        let depth = self.declaring_depth(&name);
        self.referenced_idents[depth].insert(name);
    }

    fn is_variable_referenced(&self, name: &str) -> bool {
        self.referenced_idents[self.declaring_depth(name)].contains(name)
    }

    /// checks if the variable exits in the current scope or any scope above it
    fn variable_exists(&self, name: &str) -> bool {
        self.aliases
            .iter()
            .any(|aliases| aliases.contains_key(name))
    }

    fn get_dynamic_variable(&self, name: &str) -> bool {
        self.dynamic_variable_names
            .iter()
            .rev()
            .any(|vars| vars.contains(name))
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
        extra_classes: BTreeSet<String>,
    ) {
        let span = it.span;

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
        utils::escape_raw_quasis(self.ast_builder, &mut new_quasis);

        let mut right =
            self.ast_builder
                .expression_template_literal(span, new_quasis, new_expressions);

        replace_in_expression_using_identifiers(self.ast_builder, &mut right, &|name| {
            self.get_alias(name).map(|v| v.to_string())
        });

        // Store the CSS variable identifier for the evaluator
        self.css_variable_identifiers
            .push(CssVariableIdentifier::new(
                variable_name.to_string(),
                class_name.to_string(),
                extra_classes,
                span,
            ));

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

    /// In the virtual program, the variable only holds the generated class so it can be used in
    /// other selectors (e.g. `.${Other} {}`), extra classes are only part of the runtime value.
    fn insert_css_class_into_virtual_program(
        &mut self,
        span: Span,
        variable_name: &str,
        class_name: &str,
    ) {
        let variable_declarator = ast::build_variable_declarator(
            self.ast_builder,
            span,
            variable_name,
            ast::build_decorated_string(self.ast_builder, span, class_name),
        );

        self.insert_into_virtual_program(
            VirtualProgramInsert::VariableDeclarator(variable_declarator),
            None,
        );

        self.replacement_points.insert(
            span,
            Expression::Identifier(
                self.ast_builder
                    .alloc_identifier_reference(span, self.ast_builder.atom(variable_name)),
            ),
        );
    }

    /// Builds the runtime value of a `css` template, atomic mode references the class list
    /// exported by the `.style-this.js` module (`_styleThisClasses._styleThis_xxx`), which also
    /// includes the extra classes.
    fn build_css_class_value(
        &self,
        span: Span,
        variable_name: &str,
        class_name: &str,
        extra_classes: &BTreeSet<String>,
    ) -> Expression<'alloc> {
        if self.atomic {
            return Expression::StaticMemberExpression(
                self.ast_builder.alloc_static_member_expression(
                    span,
                    Expression::Identifier(self.ast_builder.alloc_identifier_reference(
                        span,
                        self.ast_builder.atom(ATOMIC_CLASSES_IDENT),
                    )),
                    self.ast_builder
                        .identifier_name(span, self.ast_builder.atom(variable_name)),
                    false,
                ),
            );
        }

        let mut class_list = vec![class_name];
        class_list.extend(extra_classes.iter().map(String::as_str));
        ast::build_string(self.ast_builder, span, &class_list.join(" "))
    }

    /// extracts extraClass("a b c") calls from template expressions
    fn extract_extra_classes(&self, it: &TaggedTemplateExpression<'alloc>) -> BTreeSet<String> {
        let mut extra_classes = BTreeSet::new();

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
                                        extra_classes.insert(class.to_string());
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

    /// Handles `export { x as y }`, `export { x as y } from "./b"`, `export * as y from "./b"` and
    /// `export * from "./b"`, their locals are referenced up front since the declarations can come
    /// after the export.
    ///
    /// Referenced names that aren't exported by the program itself are evaluated in all
    /// `export * from` modules, the first module exporting a name provides it.
    ///
    /// `STAR_IMPORT` requests all exports, for namespaces that are used as a whole.
    fn reference_export_specifiers(&mut self, statements: &[Statement<'alloc>]) {
        let declared_values = program_declared_values(statements);
        let exported_names = program_exported_names(statements);
        let requested = self.referenced_idents.first_mut().unwrap();
        if requested.contains(STAR_IMPORT) {
            requested.extend(exported_names.iter().cloned());
        }
        let mut star_reexports = vec![];
        let forwarded_names: BTreeSet<String> = requested
            .difference(&exported_names)
            .filter(|name| *name != DEFAULT_EXPORT)
            .cloned()
            .collect();

        for stmt in statements {
            if let Statement::ExportAllDeclaration(export) = stmt
                && !export.export_kind.is_type()
            {
                let local = utils::reexport_local_name(export.span);
                match &export.exported {
                    Some(exported) => {
                        let exported = match exported.name().as_str() {
                            "default" => DEFAULT_EXPORT.to_string(),
                            name => name.to_string(),
                        };
                        if self.referenced_idents.first().unwrap().contains(&exported) {
                            self.referenced_idents
                                .first_mut()
                                .unwrap()
                                .insert(local.clone());
                            self.namespace_imports.insert(
                                local.clone(),
                                (
                                    export.source.value.to_string(),
                                    HashSet::from([STAR_IMPORT.to_string()]),
                                ),
                            );
                            self.exported_idents.insert(exported, local);
                        }
                    }
                    None => star_reexports.push((local, export.source.value.to_string())),
                }
                continue;
            }

            let Statement::ExportNamedDeclaration(export) = stmt else {
                continue;
            };
            if export.export_kind.is_type() {
                continue;
            }

            for specifier in &export.specifiers {
                let exported = match specifier.exported.name().as_str() {
                    "default" => DEFAULT_EXPORT.to_string(),
                    name => name.to_string(),
                };
                if specifier.export_kind.is_type()
                    || !self.referenced_idents.first().unwrap().contains(&exported)
                {
                    continue;
                }

                let local = if export.source.is_some() {
                    utils::reexport_local_name(specifier.span)
                } else {
                    let local = specifier.local.name();
                    // e.g. types, which don't exist at runtime
                    if !declared_values.contains(local.as_str()) {
                        continue;
                    }
                    // e.g. `import * as ns from "./b"; export { ns };`
                    if let Some((_, remote_referenced_idents)) =
                        self.namespace_imports.get_mut(local.as_str())
                    {
                        remote_referenced_idents.insert(STAR_IMPORT.to_string());
                    }
                    local.to_string()
                };

                self.referenced_idents
                    .first_mut()
                    .unwrap()
                    .insert(local.clone());
                self.exported_idents.insert(exported, local);
            }
        }

        if star_reexports.is_empty() || forwarded_names.is_empty() {
            return;
        }

        for (namespace, module_id) in &star_reexports {
            self.referenced_idents
                .first_mut()
                .unwrap()
                .insert(namespace.clone());
            self.namespace_imports.insert(
                namespace.clone(),
                (module_id.clone(), forwarded_names.iter().cloned().collect()),
            );
        }

        // `const local = namespace_1?.["name"] ?? namespace_2?.["name"];`, all exports are
        // `const local = { ...namespace_2, ...namespace_1 };`
        let span = Span::default();
        for (idx, name) in forwarded_names.into_iter().enumerate() {
            let local = format!("{PREFIX}_star_reexport_{idx}");
            let value = if name == STAR_IMPORT {
                self.ast_builder.expression_object(
                    span,
                    self.ast_builder
                        .vec_from_iter(star_reexports.iter().rev().map(|(namespace, _)| {
                            self.ast_builder.object_property_kind_spread_property(
                                span,
                                ast::build_identifier(self.ast_builder, span, namespace),
                            )
                        })),
                )
            } else {
                star_reexports
                    .iter()
                    .map(|(namespace, _)| {
                        Expression::ChainExpression(self.ast_builder.alloc_chain_expression(
                            span,
                            ChainElement::ComputedMemberExpression(
                                self.ast_builder.alloc_computed_member_expression(
                                    span,
                                    ast::build_identifier(self.ast_builder, span, namespace),
                                    ast::build_string(self.ast_builder, span, &name),
                                    true,
                                ),
                            ),
                        ))
                    })
                    .reduce(|left, right| {
                        self.ast_builder.expression_logical(
                            span,
                            left,
                            LogicalOperator::Coalesce,
                            right,
                        )
                    })
                    .unwrap()
            };

            self.tmp_program_statement_buffer.last_mut().unwrap().push(
                Statement::VariableDeclaration(self.ast_builder.alloc_variable_declaration(
                    span,
                    VariableDeclarationKind::Const,
                    self.ast_builder.vec1(ast::build_variable_declarator(
                        self.ast_builder,
                        span,
                        &local,
                        value,
                    )),
                    false,
                )),
            );
            self.referenced_idents
                .first_mut()
                .unwrap()
                .insert(local.clone());
            self.exported_idents.insert(name, local);
        }
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
        if self.scope_depth == 1 {
            self.reference_export_specifiers(it);
        }
        self.pending_declarations.push(Default::default());
        for el in it.iter_mut().rev() {
            self.visit_statement(el);
        }
        self.include_pending_declarations();
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
            let variable_name = &format!("{PREFIX}_{}", self.unique_number());

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

                    self.insert_into_virtual_program_css(
                        template,
                        &resolved_variable_name,
                        &class_name,
                        extra_classes.clone(),
                    );

                    self.insert_css_class_into_virtual_program(
                        span,
                        &resolved_variable_name,
                        &class_name,
                    );

                    *it = self.build_css_class_value(
                        span,
                        &resolved_variable_name,
                        &class_name,
                        &extra_classes,
                    );
                }
                tag if Some(tag) == self.style_function_name.as_deref() => {
                    let mut quasis = template.quasi.quasis.clone_in(self.allocator);
                    utils::trim_newlines(self.ast_builder, &mut quasis);
                    utils::escape_raw_quasis(self.ast_builder, &mut quasis);
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

    fn visit_variable_declarators(
        &mut self,
        it: &mut oxc_allocator::Vec<'alloc, VariableDeclarator<'alloc>>,
    ) {
        if self.scan_pass {
            oxc_ast_visit::walk_mut::walk_variable_declarators(self, it);
            return;
        }
        // bottom-up like the statements, e.g. `const a = 1, b = a;`
        for el in it.iter_mut().rev() {
            self.visit_variable_declarator(el);
        }
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
                    let display_name = it
                        .init
                        .as_ref()
                        .map_or(ident.as_str(), |init| self.get_display_name(init.span(), &ident))
                        .to_string();
                    Some(format!("{PREFIX}_var_{display_name}_{}", self.unique_number()))
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
                    let display_name = self.get_display_name(span, variable_name).to_string();
                    let class_name = self.create_virtual_css_template(&display_name);
                    let extra_classes = self.extract_extra_classes(template);

                    self.insert_into_virtual_program_css(
                        template,
                        &resolved_variable_name,
                        &class_name,
                        extra_classes.clone(),
                    );

                    self.insert_css_class_into_virtual_program(
                        span,
                        &resolved_variable_name,
                        &class_name,
                    );

                    *init = self.build_css_class_value(
                        span,
                        &resolved_variable_name,
                        &class_name,
                        &extra_classes,
                    );
                }
                tag if Some(tag) == self.style_function_name.as_deref() => {
                    let mut quasis = template.quasi.quasis.clone_in(self.allocator);
                    utils::trim_newlines(self.ast_builder, &mut quasis);
                    utils::escape_raw_quasis(self.ast_builder, &mut quasis);
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
        let right_references = utils::expression_get_references(init);

        self.include_or_defer_declaration(
            VirtualProgramInsert::VariableDeclarator(it.clone_in(self.allocator)),
            right_references,
            pos,
        );
    }

    fn visit_statement(&mut self, it: &mut Statement<'alloc>) {
        if self.error.is_some() {
            return;
        }

        if self.scan_pass {
            let id = match it {
                Statement::FunctionDeclaration(function) => function.id.as_ref(),
                Statement::ClassDeclaration(class) => class.id.as_ref(),
                _ => None,
            };
            // not aliased, they keep their name in the virtual program
            if let Some(id) = id {
                self.aliases
                    .last_mut()
                    .unwrap()
                    .insert(id.name.to_string(), None);
            }
        } else {
            // these walk the declaration themselves
            match it {
                Statement::FunctionDeclaration(function) => {
                    self.visit_function_declaration(function, ScopeFlags::Function);
                    return;
                }
                Statement::ClassDeclaration(class) => {
                    self.visit_class_declaration(class);
                    return;
                }
                _ => {}
            }
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

        let global_sentinel = DEFAULT_EXPORT;

        if !self
            .referenced_idents
            .first()
            .unwrap()
            .contains(global_sentinel)
        {
            oxc_ast_visit::walk_mut::walk_export_default_declaration(self, it);
            return;
        }

        self.exported_idents
            .insert(global_sentinel.to_string(), global_sentinel.to_string());

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

        // specifiers are handled by `reference_export_specifiers`
        let Some(declaration) = &mut it.declaration else {
            return;
        };

        match declaration {
            Declaration::VariableDeclaration(variable_declaration) => {
                // TODO
                //                 if !self.referenced_idents.contains(global_sentinel) {
                //                     return;
                // }

                for decl in &variable_declaration.declarations {
                    let idents = binding_pattern_kind_get_idents(&decl.id.kind);
                    self.exported_idents.extend(
                        idents
                            .into_iter()
                            .filter(|ident| self.referenced_idents.first().unwrap().contains(ident))
                            .map(|ident| (ident.clone(), ident)),
                    );
                }
            }
            Declaration::FunctionDeclaration(function) => {
                let name = function
                    .id
                    .as_ref()
                    .expect("named exported functions always have a name")
                    .name
                    .as_str();

                if self.referenced_idents.first().unwrap().contains(name) {
                    self.exported_idents
                        .insert(name.to_string(), name.to_string());
                }
            }
            Declaration::ClassDeclaration(class) => {
                let name = class
                    .id
                    .as_ref()
                    .expect("named exported classes always have a name")
                    .name
                    .as_str();

                if self.referenced_idents.first().unwrap().contains(name) {
                    self.exported_idents
                        .insert(name.to_string(), name.to_string());
                }
            }
            _ => return,
        }

        // visit the declaration in place as a statement, so the rewrites end up in the output
        let mut statement = Statement::from(it.declaration.take().unwrap());
        self.visit_statement(&mut statement);
        it.declaration = Some(statement.into_declaration());
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

/// Indices of the statements declaring something the dependents use, directly or through each
/// other.
fn statement_dependencies(statements: &[Statement], dependents: &[Statement]) -> HashSet<usize> {
    let declared: Vec<_> = statements
        .iter()
        .map(|statement| program_declared_values(std::slice::from_ref(statement)))
        .collect();
    let mut references: HashSet<_> = dependents
        .iter()
        .flat_map(utils::statement_get_references)
        .collect();
    let mut dependencies = HashSet::new();

    while let Some(idx) = (0..statements.len()).find(|idx| {
        !dependencies.contains(idx) && declared[*idx].iter().any(|name| references.contains(name))
    }) {
        dependencies.insert(idx);
        references.extend(utils::statement_get_references(&statements[idx]));
    }
    dependencies
}

/// Names of the top level values of a program that exist at runtime.
fn program_declared_values(statements: &[Statement]) -> HashSet<String> {
    let mut names = HashSet::new();

    for stmt in statements {
        let declaration = match stmt {
            Statement::ImportDeclaration(import) => {
                if import.import_kind.is_type() {
                    continue;
                }
                let specifiers = import.specifiers.iter().flatten();
                names.extend(
                    specifiers
                        .filter(|specifier| {
                            !matches!(specifier, ImportDeclarationSpecifier::ImportSpecifier(spec) if spec.import_kind.is_type())
                        })
                        .map(|specifier| specifier.name().to_string()),
                );
                continue;
            }
            Statement::ExportNamedDeclaration(export) => export.declaration.as_ref(),
            stmt => stmt.as_declaration(),
        };

        match declaration {
            Some(Declaration::VariableDeclaration(declaration)) if !declaration.declare => {
                names.extend(
                    declaration.declarations.iter().flat_map(|declarator| {
                        binding_pattern_kind_get_idents(&declarator.id.kind)
                    }),
                );
            }
            Some(Declaration::FunctionDeclaration(function)) if !function.declare => {
                names.extend(function.id.as_ref().map(|id| id.name.to_string()));
            }
            Some(Declaration::ClassDeclaration(class)) if !class.declare => {
                names.extend(class.id.as_ref().map(|id| id.name.to_string()));
            }
            _ => {}
        }
    }

    names
}

/// Names the program exports itself, i.e. not through `export * from`.
fn program_exported_names(statements: &[Statement]) -> HashSet<String> {
    let mut names = HashSet::new();

    for stmt in statements {
        match stmt {
            Statement::ExportDefaultDeclaration(_) => {
                names.insert(DEFAULT_EXPORT.to_string());
            }
            Statement::ExportAllDeclaration(export) => {
                names.extend(export.exported.as_ref().map(|name| name.name().to_string()));
            }
            Statement::ExportNamedDeclaration(export) => {
                names.extend(
                    export
                        .specifiers
                        .iter()
                        .map(|specifier| specifier.exported.name().to_string()),
                );
                names.extend(program_declared_values(std::slice::from_ref(stmt)));
            }
            _ => {}
        }
    }

    if names.remove("default") {
        names.insert(DEFAULT_EXPORT.to_string());
    }
    names
}
