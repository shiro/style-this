use crate::{styled_component_transformer::*, *};

struct ReactStyledComponentTransformer<'a, 'alloc> {
    base: StyledComponentTransformer<'a, 'alloc>,
}

impl<'a, 'alloc> ReactStyledComponentTransformer<'a, 'alloc> {
    fn new(
        ast_builder: &'a AstBuilder<'alloc>,
        skip_jsx: bool,
        filepath: String,
    ) -> Self {
        Self {
            base: StyledComponentTransformer::new(ast_builder, skip_jsx, filepath, "className"),
        }
    }

    fn transform_styled_component(
        &mut self,
        expression: &mut Expression<'alloc>,
        jsx_tag: &'alloc str,
        _is_extending_custom_component: bool, // React doesn't need this, kept for consistency
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

        // For React, we spread all props directly (no splitProps needed)
        let mut attributes = vec![
            self.base.ast_builder.jsx_attribute_item_spread_attribute(
                span,
                Expression::Identifier(
                    self.base.ast_builder
                        .alloc_identifier_reference(span, self.base.ast_builder.atom("props")),
                ),
            ),
            self.base.build_class_attribute(span, &class_variable_name, "props"),
        ];

        if let Some(style_attr) = style_attribute {
            attributes.push(style_attr);
        }

        let jsx_element_expression = self.base.build_jsx_element(span, jsx_tag, attributes);

        // For React, the component is an inline expression arrow function
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
                                true,  // expression = true for React (inline JSX)
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
                                    self.base.ast_builder.vec1(Statement::ExpressionStatement(
                                        self.base.ast_builder.alloc_expression_statement(
                                            span,
                                            jsx_element_expression,
                                        ),
                                    )),
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

impl<'a, 'alloc> VisitMut<'alloc> for ReactStyledComponentTransformer<'a, 'alloc> {
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

pub fn react_prepass<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    filepath: String,
    program: &mut Program<'alloc>,
    skip_jsx: bool,
) {
    let mut transformer = ReactStyledComponentTransformer::new(ast_builder, skip_jsx, filepath);
    transformer.visit_program(program);
}
