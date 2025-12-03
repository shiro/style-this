use crate::{utils::generate_random_id, *};

struct SolidTransformer<'a, 'alloc> {
    ast_builder: &'a AstBuilder<'alloc>,
    skip_jsx: bool,
    current_statement_index: usize,
}

impl<'a, 'alloc> SolidTransformer<'a, 'alloc> {
    fn new(ast_builder: &'a AstBuilder<'alloc>, skip_jsx: bool) -> Self {
        Self {
            ast_builder,
            skip_jsx,
            current_statement_index: 0,
        }
    }

    fn transform_styled_component(
        &mut self,
        variable_declarator: &mut VariableDeclarator<'alloc>,
        jsx_tag: &'alloc str,
        component_variable_name: &str,
    ) {
        let span = variable_declarator.span;
        let random_suffix = generate_random_id(6);
        let class_variable_name = format!("{component_variable_name}_{random_suffix}");

        // Extract the tagged template expression from the variable declarator
        let Some(Expression::TaggedTemplateExpression(tagged_template_expression)) =
            &variable_declarator.init
        else {
            return;
        };

        let mut simple_tagged_template_expression =
            tagged_template_expression.clone_in(self.ast_builder.allocator);
        simple_tagged_template_expression.tag = Expression::Identifier(
            self.ast_builder
                .alloc_identifier_reference(span, self.ast_builder.atom("css")),
        );

        // Substitute arrow functions with CSS variables
        let mut captured_expressions = Vec::new();
        let mut var_counter = 1;

        // Iterate through template expressions and replace arrow functions
        for expression in simple_tagged_template_expression
            .quasi
            .expressions
            .iter_mut()
        {
            if let Expression::ArrowFunctionExpression(_) = expression {
                // Capture the original arrow function expression
                captured_expressions.push(expression.clone_in(self.ast_builder.allocator));

                // Replace with variable string (var1, var2, etc.)
                let var_name = format!("var(--var{var_counter})");
                *expression = Expression::StringLiteral(self.ast_builder.alloc_string_literal(
                    expression.span(),
                    self.ast_builder.atom(&var_name),
                    None,
                ));
                var_counter += 1;
            }
        }

        // treat the styled component like a regular css`...` definition
        if self.skip_jsx {
            variable_declarator.init = Some(Expression::TaggedTemplateExpression(
                simple_tagged_template_expression,
            ));
            return;
        }

        let css_declaration =
            Statement::VariableDeclaration(self.ast_builder.alloc_variable_declaration(
                span,
                VariableDeclarationKind::Let,
                self.ast_builder.vec1(self.ast_builder.variable_declarator(
                    span,
                    VariableDeclarationKind::Let,
                    self.ast_builder.binding_pattern(
                        BindingPatternKind::BindingIdentifier(
                            self.ast_builder.alloc_binding_identifier(
                                span,
                                self.ast_builder.atom(&class_variable_name),
                            ),
                        ),
                        None as Option<oxc_allocator::Box<_>>,
                        false,
                    ),
                    Some(Expression::TaggedTemplateExpression(
                        simple_tagged_template_expression,
                    )),
                    false,
                )),
                false,
            ));

        // Build style attribute with captured variables and their arrow function calls
        let style_properties: Vec<_> = captured_expressions
            .iter()
            .enumerate()
            .map(|(i, arrow_fn)| {
                let var_name = format!("--var{}", i + 1);
                self.ast_builder.object_property_kind_object_property(
                    span,
                    oxc_ast::ast::PropertyKind::Init,
                    self.ast_builder
                        .expression_string_literal(span, self.ast_builder.atom(&var_name), None)
                        .into(),
                    Expression::CallExpression(
                        self.ast_builder.alloc_call_expression(
                            span,
                            arrow_fn.clone_in(self.ast_builder.allocator),
                            None as Option<oxc_allocator::Box<_>>,
                            self.ast_builder.vec1(
                                Expression::StaticMemberExpression(
                                    self.ast_builder.alloc_static_member_expression(
                                        span,
                                        Expression::Identifier(
                                            self.ast_builder.alloc_identifier_reference(
                                                span,
                                                self.ast_builder.atom("props"),
                                            ),
                                        ),
                                        self.ast_builder.identifier_name(
                                            span,
                                            self.ast_builder.atom("styleProps"),
                                        ),
                                        false,
                                    ),
                                )
                                .into(),
                            ),
                            false,
                        ),
                    ),
                    false,
                    false,
                    false,
                )
            })
            .collect();

        let style_attribute = if !captured_expressions.is_empty() {
            Some(
                self.ast_builder.jsx_attribute_item_attribute(
                    span,
                    self.ast_builder
                        .jsx_attribute_name_identifier(span, self.ast_builder.atom("style")),
                    Some(self.ast_builder.jsx_attribute_value_expression_container(
                        span,
                        JSXExpression::ObjectExpression(self.ast_builder.alloc_object_expression(
                            span,
                            self.ast_builder.vec_from_iter(style_properties),
                        )),
                    )),
                ),
            )
        } else {
            None
        };

        // Build attributes array with conditional style attribute
        let mut attributes = vec![
            self.ast_builder.jsx_attribute_item_spread_attribute(
                span,
                Expression::Identifier(
                    self.ast_builder
                        .alloc_identifier_reference(span, self.ast_builder.atom("props")),
                ),
            ),
            self.ast_builder.jsx_attribute_item_attribute(
                span,
                self.ast_builder
                    .jsx_attribute_name_identifier(span, self.ast_builder.atom("class")),
                Some(self.ast_builder.jsx_attribute_value_expression_container(
                    span,
                    JSXExpression::Identifier(self.ast_builder.alloc_identifier_reference(
                        span,
                        self.ast_builder.atom(&class_variable_name),
                    )),
                )),
            ),
        ];

        if let Some(style_attr) = style_attribute {
            attributes.push(style_attr);
        }

        let jsx_element_expression = Expression::JSXElement(self.ast_builder.alloc_jsx_element(
            span,
            self.ast_builder.alloc_jsx_opening_element(
                span,
                self.ast_builder.jsx_element_name_identifier(span, jsx_tag),
                None as Option<oxc_allocator::Box<_>>,
                self.ast_builder.vec_from_iter(attributes),
            ),
            self.ast_builder.vec(),
            None as Option<oxc_allocator::Box<_>>,
        ));

        let define_jsx_element_statement = Statement::VariableDeclaration(
            self.ast_builder.alloc_variable_declaration(
                span,
                VariableDeclarationKind::Let,
                self.ast_builder.vec1(
                    self.ast_builder.variable_declarator(
                        span,
                        VariableDeclarationKind::Let,
                        self.ast_builder.binding_pattern(
                            BindingPatternKind::BindingIdentifier(
                                self.ast_builder
                                    .alloc_binding_identifier(span, self.ast_builder.atom("comp")),
                            ),
                            None as Option<oxc_allocator::Box<_>>,
                            false,
                        ),
                        Some(Expression::ArrowFunctionExpression(
                            self.ast_builder.alloc_arrow_function_expression(
                                span,
                                true,
                                false,
                                None as Option<oxc_allocator::Box<_>>,
                                self.ast_builder.alloc_formal_parameters(
                                    span,
                                    oxc_ast::ast::FormalParameterKind::ArrowFormalParameters,
                                    self.ast_builder.vec1(self.ast_builder.formal_parameter(
                                        span,
                                        self.ast_builder.vec(),
                                        self.ast_builder.binding_pattern(
                                            BindingPatternKind::BindingIdentifier(
                                                self.ast_builder.alloc_binding_identifier(
                                                    span,
                                                    self.ast_builder.atom("props"),
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
                                self.ast_builder.function_body(
                                    span,
                                    self.ast_builder.vec(),
                                    self.ast_builder.vec1(Statement::ExpressionStatement(
                                        self.ast_builder.alloc_expression_statement(
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

        let assign_css_statement = Statement::ExpressionStatement(
            self.ast_builder.alloc_expression_statement(
                span,
                Expression::AssignmentExpression(
                    self.ast_builder.alloc_assignment_expression(
                        span,
                        oxc_ast::ast::AssignmentOperator::Assign,
                        oxc_ast::ast::AssignmentTarget::StaticMemberExpression(
                            self.ast_builder.alloc_static_member_expression(
                                span,
                                Expression::Identifier(
                                    self.ast_builder.alloc_identifier_reference(
                                        span,
                                        self.ast_builder.atom("comp"),
                                    ),
                                ),
                                self.ast_builder
                                    .identifier_name(span, self.ast_builder.atom("css")),
                                false,
                            ),
                        ),
                        Expression::StaticMemberExpression(
                            self.ast_builder.alloc_static_member_expression(
                                span,
                                Expression::Identifier(
                                    self.ast_builder.alloc_identifier_reference(
                                        span,
                                        self.ast_builder.atom(&class_variable_name),
                                    ),
                                ),
                                self.ast_builder
                                    .identifier_name(span, self.ast_builder.atom("css")),
                                false,
                            ),
                        ),
                    ),
                ),
            ),
        );

        let assign_to_string_statement = Statement::ExpressionStatement(
            self.ast_builder.alloc_expression_statement(
                span,
                Expression::AssignmentExpression(
                    self.ast_builder.alloc_assignment_expression(
                        span,
                        oxc_ast::ast::AssignmentOperator::Assign,
                        oxc_ast::ast::AssignmentTarget::StaticMemberExpression(
                            self.ast_builder.alloc_static_member_expression(
                                span,
                                Expression::Identifier(
                                    self.ast_builder.alloc_identifier_reference(
                                        span,
                                        self.ast_builder.atom("comp"),
                                    ),
                                ),
                                self.ast_builder
                                    .identifier_name(span, self.ast_builder.atom("toString")),
                                false,
                            ),
                        ),
                        Expression::ArrowFunctionExpression(
                            self.ast_builder.alloc_arrow_function_expression(
                                span,
                                true,
                                false,
                                None as Option<oxc_allocator::Box<_>>,
                                self.ast_builder.alloc_formal_parameters(
                                    span,
                                    oxc_ast::ast::FormalParameterKind::ArrowFormalParameters,
                                    self.ast_builder.vec(),
                                    None as Option<oxc_allocator::Box<_>>,
                                ),
                                None as Option<oxc_allocator::Box<_>>,
                                self.ast_builder.alloc_function_body(
                                    span,
                                    self.ast_builder.vec(),
                                    self.ast_builder.vec1(Statement::ExpressionStatement(
                                        self.ast_builder.alloc_expression_statement(
                                            span,
                                            Expression::Identifier(
                                                self.ast_builder.alloc_identifier_reference(
                                                    span,
                                                    self.ast_builder.atom(&class_variable_name),
                                                ),
                                            ),
                                        ),
                                    )),
                                ),
                            ),
                        ),
                    ),
                ),
            ),
        );

        let return_statement = Statement::ReturnStatement(
            self.ast_builder.alloc_return_statement(
                span,
                Some(Expression::Identifier(
                    self.ast_builder
                        .alloc_identifier_reference(span, self.ast_builder.atom("comp")),
                )),
            ),
        );

        // build function body statements conditionally
        let mut function_body_statements = vec![css_declaration, define_jsx_element_statement];

        // only add assign_css_statement if there are no captured expressions
        if captured_expressions.is_empty() {
            function_body_statements.push(assign_css_statement);
        }

        function_body_statements.push(assign_to_string_statement);
        function_body_statements.push(return_statement);

        // build this schema:
        // ```.ts
        // const testStyle = css`
        //   color: white;
        // `;
        // const Test: Component<any> & { class: string } = (() => {
        //   const comp = (props: any) => {
        //     const [var1, rest] = splitProps(props, ["var1"])
        //     return <div
        //       {...rest}
        //       style={{"--var1": arrowFn(props)}}
        //       class={testStyle}
        //     />;
        //   };
        //   comp.css = testStyle.css;
        //   comp.toString = () => testStyle;
        //   return comp;
        // })()
        // TODO Object.freeze
        // ```
        variable_declarator.init = Some(Expression::CallExpression(
            self.ast_builder.alloc_call_expression(
                span,
                Expression::ArrowFunctionExpression(
                    self.ast_builder.alloc_arrow_function_expression(
                        span,
                        false,
                        false,
                        None as Option<oxc_allocator::Box<_>>,
                        self.ast_builder.alloc_formal_parameters(
                            span,
                            oxc_ast::ast::FormalParameterKind::ArrowFormalParameters,
                            self.ast_builder.vec(),
                            None as Option<oxc_allocator::Box<_>>,
                        ),
                        None as Option<oxc_allocator::Box<_>>,
                        self.ast_builder.alloc_function_body(
                            span,
                            self.ast_builder.vec(),
                            self.ast_builder.vec_from_iter(function_body_statements),
                        ),
                    ),
                ),
                None as Option<oxc_allocator::Box<_>>,
                self.ast_builder.vec(),
                false,
            ),
        ));
    }
}

impl<'a, 'alloc> VisitMut<'alloc> for SolidTransformer<'a, 'alloc> {
    fn visit_statements(&mut self, statements: &mut oxc_allocator::Vec<'alloc, Statement<'alloc>>) {
        for (idx, statement) in statements.iter_mut().enumerate() {
            self.current_statement_index = idx;
            self.visit_statement(statement);
        }
    }

    fn visit_variable_declarator(&mut self, variable_declarator: &mut VariableDeclarator<'alloc>) {
        // Check if this is a styled component before doing anything else
        let should_transform =
            if let Some(Expression::TaggedTemplateExpression(tagged_template_expression)) =
                &variable_declarator.init
                && let Expression::StaticMemberExpression(static_member_expression) =
                    &tagged_template_expression.tag
                && let Expression::Identifier(object_identifier) = &static_member_expression.object
                && object_identifier.name == "styled"
            {
                true
            } else {
                false
            };

        if should_transform {
            // Extract the necessary information before transforming
            let jsx_tag =
                if let Some(Expression::TaggedTemplateExpression(tagged_template_expression)) =
                    &variable_declarator.init
                    && let Expression::StaticMemberExpression(static_member_expression) =
                        &tagged_template_expression.tag
                {
                    static_member_expression.property.name.as_str()
                } else {
                    ""
                };

            let component_variable_name = match &variable_declarator.id.kind {
                BindingPatternKind::BindingIdentifier(binding_identifier) => {
                    binding_identifier.name.as_str()
                }
                _ => {
                    // Skip non-identifier patterns for now
                    oxc_ast_visit::walk_mut::walk_variable_declarator(self, variable_declarator);
                    return;
                }
            };

            self.transform_styled_component(variable_declarator, jsx_tag, component_variable_name);
        } else {
            oxc_ast_visit::walk_mut::walk_variable_declarator(self, variable_declarator);
        }
    }
}

pub fn solid_js_prepass<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    program: &mut Program<'alloc>,
    skip_jsx: bool,
) {
    let mut transformer = SolidTransformer::new(ast_builder, skip_jsx);
    transformer.visit_program(program);
}
