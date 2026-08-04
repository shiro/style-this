use crate::{styled_component_transformer::*, *};

struct SolidStyledComponentTransformer<'a, 'alloc> {
    base: StyledComponentTransformer<'a, 'alloc>,
}

impl<'a, 'alloc> SolidStyledComponentTransformer<'a, 'alloc> {
    fn new(
        ast_builder: &'a AstBuilder<'alloc>,
        skip_jsx: bool,
        filepath: String,
    ) -> Self {
        Self {
            base: StyledComponentTransformer::new(ast_builder, skip_jsx, filepath, "class"),
        }
    }

    fn transform_styled_component(
        &mut self,
        expression: &mut Expression<'alloc>,
        jsx_tag: &'alloc str,
        is_extending_custom_component: bool,
    ) {
        self.base.component_counter += 1;
        let class_variable_name = self.base.get_class_variable_name();
        let span = expression.span();

        let Expression::TaggedTemplateExpression(tagged_template_expression) = &mut *expression
        else {
            return;
        };

        let mut simple_tagged_template_expression =
            tagged_template_expression.clone_in(self.base.ast_builder.allocator);
        simple_tagged_template_expression.tag = Expression::Identifier(
            self.base.ast_builder
                .alloc_identifier_reference(span, self.base.ast_builder.atom("css")),
        );

        let captured_expressions =
            self.base.extract_and_replace_arrow_functions(&mut simple_tagged_template_expression);

        if self.base.skip_jsx {
            *tagged_template_expression =
                simple_tagged_template_expression.clone_in(self.base.ast_builder.allocator);
            return;
        }

        let css_declaration = self.base.build_css_declaration(span, &class_variable_name, simple_tagged_template_expression);
        
        let style_properties = self.base.build_style_properties(span, &captured_expressions);
        let style_attribute = self.base.build_style_attribute(span, style_properties, true);

        // For Solid, we need to use splitProps to filter out styleProps and style
        // BUT only if we're extending an HTML element, not a custom component
        let should_filter_props = !is_extending_custom_component && !captured_expressions.is_empty();
        let split_props_statement = if should_filter_props {
            Some(Statement::VariableDeclaration(
                self.base.ast_builder.alloc_variable_declaration(
                    span,
                    VariableDeclarationKind::Const,
                    self.base.ast_builder.vec1(self.base.ast_builder.variable_declarator(
                        span,
                        VariableDeclarationKind::Const,
                        self.base.ast_builder.binding_pattern(
                            BindingPatternKind::ArrayPattern(
                                self.base.ast_builder.alloc_array_pattern(
                                    span,
                                    self.base.ast_builder.vec_from_iter([
                                        Some(self.base.ast_builder.binding_pattern(
                                            BindingPatternKind::BindingIdentifier(
                                                self.base.ast_builder.alloc_binding_identifier(
                                                    span,
                                                    self.base.ast_builder.atom("_"),
                                                ),
                                            ),
                                            None as Option<oxc_allocator::Box<_>>,
                                            false,
                                        )),
                                        Some(self.base.ast_builder.binding_pattern(
                                            BindingPatternKind::BindingIdentifier(
                                                self.base.ast_builder.alloc_binding_identifier(
                                                    span,
                                                    self.base.ast_builder.atom("rest"),
                                                ),
                                            ),
                                            None as Option<oxc_allocator::Box<_>>,
                                            false,
                                        )),
                                    ]),
                                    None as Option<oxc_allocator::Box<_>>,
                                ),
                            ),
                            None as Option<oxc_allocator::Box<_>>,
                            false,
                        ),
                        Some(Expression::CallExpression(
                            self.base.ast_builder.alloc_call_expression(
                                span,
                                Expression::Identifier(
                                    self.base.ast_builder.alloc_identifier_reference(
                                        span,
                                        self.base.ast_builder.atom("__styleThis__splitProps"),
                                    ),
                                ),
                                None as Option<oxc_allocator::Box<_>>,
                                self.base.ast_builder.vec_from_iter([
                                    oxc_ast::ast::Argument::Identifier(
                                        self.base.ast_builder.alloc_identifier_reference(
                                            span,
                                            self.base.ast_builder.atom("props"),
                                        ),
                                    ),
                                    oxc_ast::ast::Argument::ArrayExpression(
                                        self.base.ast_builder.alloc_array_expression(
                                            span,
                                            self.base.ast_builder.vec_from_iter([
                                                oxc_ast::ast::ArrayExpressionElement::StringLiteral(
                                                    self.base.ast_builder.alloc_string_literal(
                                                        span,
                                                        self.base.ast_builder.atom("styleProps"),
                                                        None,
                                                    ),
                                                ),
                                                oxc_ast::ast::ArrayExpressionElement::StringLiteral(
                                                    self.base.ast_builder.alloc_string_literal(
                                                        span,
                                                        self.base.ast_builder.atom("style"),
                                                        None,
                                                    ),
                                                ),
                                            ]),
                                        ),
                                    ),
                                ]),
                                false,
                            ),
                        )),
                        false,
                    )),
                    false,
                ),
            ))
        } else {
            None
        };

        // Build attributes - for Solid with splitProps, use "rest" instead of "props"
        let spread_identifier = if should_filter_props { "rest" } else { "props" };
        let mut attributes = vec![
            self.base.ast_builder.jsx_attribute_item_spread_attribute(
                span,
                Expression::Identifier(
                    self.base.ast_builder
                        .alloc_identifier_reference(span, self.base.ast_builder.atom(spread_identifier)),
                ),
            ),
            self.base.build_class_attribute(span, &class_variable_name, "props"),
        ];

        if let Some(style_attr) = style_attribute {
            attributes.push(style_attr);
        }

        let jsx_element_expression = self.base.build_jsx_element(span, jsx_tag, attributes);

        // For Solid, the component body includes splitProps and returns JSX
        let mut component_body_statements = Vec::new();
        
        if let Some(split_props) = split_props_statement {
            component_body_statements.push(split_props);
        }
        
        component_body_statements.push(Statement::ReturnStatement(
            self.base.ast_builder.alloc_return_statement(
                span,
                Some(jsx_element_expression),
            ),
        ));

        let define_jsx_element_statement = Statement::VariableDeclaration(
            self.base.ast_builder.alloc_variable_declaration(
                span,
                VariableDeclarationKind::Let,
                self.base.ast_builder.vec1(
                    self.base.ast_builder.variable_declarator(
                        span,
                        VariableDeclarationKind::Let,
                        self.base.ast_builder.binding_pattern(
                            BindingPatternKind::BindingIdentifier(
                                self.base.ast_builder
                                    .alloc_binding_identifier(span, self.base.ast_builder.atom("comp")),
                            ),
                            None as Option<oxc_allocator::Box<_>>,
                            false,
                        ),
                        Some(Expression::ArrowFunctionExpression(
                            self.base.ast_builder.alloc_arrow_function_expression(
                                span,
                                false,  // NOT expression for Solid (it's a block)
                                false,
                                None as Option<oxc_allocator::Box<_>>,
                                self.base.ast_builder.alloc_formal_parameters(
                                    span,
                                    oxc_ast::ast::FormalParameterKind::ArrowFormalParameters,
                                    self.base.ast_builder.vec1(self.base.ast_builder.formal_parameter(
                                        span,
                                        self.base.ast_builder.vec(),
                                        self.base.ast_builder.binding_pattern(
                                            BindingPatternKind::BindingIdentifier(
                                                self.base.ast_builder.alloc_binding_identifier(
                                                    span,
                                                    self.base.ast_builder.atom("props"),
                                                ),
                                            ),
                                            None as Option<oxc_allocator::Box<_>>,
                                            false,
                                        ),
                                        None,
                                        false,
                                        false,
                                    )),
                                    None as Option<oxc_allocator::Box<_>>,
                                ),
                                None as Option<oxc_allocator::Box<_>>,
                                self.base.ast_builder.function_body(
                                    span,
                                    self.base.ast_builder.vec(),
                                    self.base.ast_builder.vec_from_iter(component_body_statements),
                                ),
                            ),
                        )),
                        false,
                    ),
                ),
                false,
            ),
        );

        let mut function_body_statements = vec![css_declaration, define_jsx_element_statement];

        if captured_expressions.is_empty() {
            function_body_statements.push(self.base.build_assign_css_statement(span, &class_variable_name));
        }

        function_body_statements.push(self.base.build_assign_to_string_statement(span, &class_variable_name));
        function_body_statements.push(self.base.build_return_statement(span));

        *expression = self.base.wrap_in_iife(span, function_body_statements);
    }
}

impl<'a, 'alloc> VisitMut<'alloc> for SolidStyledComponentTransformer<'a, 'alloc> {
    fn visit_statements(&mut self, statements: &mut oxc_allocator::Vec<'alloc, Statement<'alloc>>) {
        for (idx, statement) in statements.iter_mut().enumerate() {
            self.base.current_statement_index = idx;
            self.visit_statement(statement);
        }
    }

    fn visit_expression(&mut self, it: &mut Expression<'alloc>) {
        if let Expression::TaggedTemplateExpression(tagged_template_expression) = &it
            && let Expression::CallExpression(call_expression) = &tagged_template_expression.tag
            && let Expression::Identifier(identifier) = &call_expression.callee
            && identifier.name == "styled"
            && call_expression.arguments.len() == 1
            && let oxc_ast::ast::Argument::Identifier(component_identifier) =
                &call_expression.arguments[0]
        {
            let base_component_name = component_identifier.name.as_str();

            let mut modified_tagged_template_expression =
                tagged_template_expression.clone_in(self.base.ast_builder.allocator);
            modified_tagged_template_expression.tag = Expression::Identifier(
                self.base.ast_builder
                    .alloc_identifier_reference(it.span(), self.base.ast_builder.atom("style")),
            );

            *it = Expression::TaggedTemplateExpression(modified_tagged_template_expression);
            self.transform_styled_component(it, base_component_name, true); // true = extending custom component

            return;
        }

        if let Expression::TaggedTemplateExpression(tagged_template_expression) = it
            && let Expression::StaticMemberExpression(static_member_expression) =
                &tagged_template_expression.tag
            && let Expression::Identifier(object_identifier) = &static_member_expression.object
            && object_identifier.name == "styled"
        {
            let jsx_tag = static_member_expression.property.name.as_str();
            self.transform_styled_component(it, jsx_tag, false); // false = extending HTML element
            return;
        }

        oxc_ast_visit::walk_mut::walk_expression(self, it);
    }

    fn visit_variable_declarator(&mut self, it: &mut VariableDeclarator<'alloc>) {
        let prev = self.base.variable_name.take();
        self.base.variable_name = match &it.id.kind {
            BindingPatternKind::BindingIdentifier(binding_identifier) => {
                Some(binding_identifier.name.to_string())
            }
            _ => None,
        };
        oxc_ast_visit::walk_mut::walk_variable_declarator(self, it);
        self.base.variable_name = prev;
    }
}

pub fn solid_js_prepass<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    filepath: String,
    program: &mut Program<'alloc>,
    skip_jsx: bool,
) {
    let mut transformer = SolidStyledComponentTransformer::new(ast_builder, skip_jsx, filepath);
    transformer.visit_program(program);

    // Add import for splitProps if we generated any styled components with captured expressions
    if transformer.base.component_counter > 0 && !transformer.base.skip_jsx {
        use oxc_ast::ast::{ImportDeclarationSpecifier, ImportSpecifier, ImportOrExportKind, ModuleExportName};
        
        let import_spec = ast_builder.alloc(ImportSpecifier {
            span: program.span,
            imported: ModuleExportName::IdentifierName(
                ast_builder.identifier_name(program.span, ast_builder.atom("splitProps"))
            ),
            local: ast_builder.binding_identifier(program.span, ast_builder.atom("__styleThis__splitProps")),
            import_kind: oxc_ast::ast::ImportOrExportKind::Value,
        });

        let specifiers = ast_builder.vec1(ImportDeclarationSpecifier::ImportSpecifier(import_spec));

        let import_declaration = ast_builder.alloc_import_declaration(
            program.span,
            Some(specifiers),
            ast_builder.string_literal(program.span, ast_builder.atom("solid-js"), None),
            None,
            None::<oxc_allocator::Box<oxc_ast::ast::WithClause>>,
            ImportOrExportKind::Value,
        );

        // Find the position after all imports
        let insert_pos = program
            .body
            .iter()
            .position(|stmt| !matches!(stmt, Statement::ImportDeclaration(_)))
            .unwrap_or(0);

        program
            .body
            .insert(insert_pos, Statement::ImportDeclaration(import_declaration));
    }
}
