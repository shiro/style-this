use crate::{utils::SeededRandom, *};

struct SolidTransformer<'a, 'alloc> {
    ast_builder: &'a AstBuilder<'alloc>,
    skip_jsx: bool,
    variable_name: Option<String>,
    current_statement_index: usize,
    anonymous_component_name_counter: usize,
    filepath: String,
    component_counter: usize,
}

impl<'a, 'alloc> SolidTransformer<'a, 'alloc> {
    fn new(ast_builder: &'a AstBuilder<'alloc>, skip_jsx: bool, filepath: String) -> Self {
        Self {
            ast_builder,
            skip_jsx,
            filepath,
            variable_name: None,
            current_statement_index: 0,
            anonymous_component_name_counter: 0,
            component_counter: 0,
        }
    }

    fn transform_styled_component(
        &mut self,
        expression: &mut Expression<'alloc>,
        jsx_tag: &'alloc str,
    ) {
        self.component_counter += 1;
        let class_variable_name = self.variable_name.clone().unwrap_or_else(|| {
            let name = format!("component_{}", self.anonymous_component_name_counter);
            self.anonymous_component_name_counter += 1;
            name
        });
        let span = expression.span();

        // Extract the tagged template expression from the variable declarator
        let Expression::TaggedTemplateExpression(tagged_template_expression) = &mut *expression
        else {
            return;
        };

        // A styled css`...` template derived from the styled component template
        let mut simple_tagged_template_expression =
            tagged_template_expression.clone_in(self.ast_builder.allocator);
        simple_tagged_template_expression.tag = Expression::Identifier(
            self.ast_builder
                .alloc_identifier_reference(span, self.ast_builder.atom("css")),
        );

        // Substitute arrow functions with CSS variables
        let mut captured_expressions = Vec::new();
        let mut var_counter = 1;
        let mut random = SeededRandom::new();

        // Iterate through template expressions and replace arrow functions with variables
        for expression in simple_tagged_template_expression
            .quasi
            .expressions
            .iter_mut()
        {
            if let Expression::ArrowFunctionExpression(_) = expression {
                // Replace with variable string (var1, var2, etc.)
                let random_suffix = random.random_string(
                    6,
                    &format!("{}_{}_{var_counter}", self.filepath, self.component_counter),
                );
                let var_name = format!("var(--var{var_counter}-{random_suffix})");

                let prev_expression = std::mem::replace(
                    expression,
                    Expression::StringLiteral(self.ast_builder.alloc_string_literal(
                        expression.span(),
                        self.ast_builder.atom(&var_name),
                        None,
                    )),
                );
                // Capture the original arrow function expression
                captured_expressions.push(prev_expression);
                var_counter += 1;
            }
        }

        // treat the styled component like a regular css`...` definition
        if self.skip_jsx {
            *tagged_template_expression =
                simple_tagged_template_expression.clone_in(self.ast_builder.allocator);
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
                let var_counter = i + 1;
                let random_suffix = random.random_string(
                    6,
                    &format!("{}_{}_{var_counter}", self.filepath, self.component_counter),
                );
                let var_name = format!("--var{var_counter}-{random_suffix}");

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
                                // we pass in `{ ...styleProps, props }`
                                Expression::ObjectExpression(
                                    self.ast_builder.alloc_object_expression(
                                        span,
                                        self.ast_builder.vec_from_iter([
                                            // ...styleProps
                                            self.ast_builder.object_property_kind_spread_property(
                                                span,
                                                Expression::StaticMemberExpression(
                                                    self.ast_builder
                                                        .alloc_static_member_expression(
                                                            span,
                                                            Expression::Identifier(
                                                                self.ast_builder
                                                                    .alloc_identifier_reference(
                                                                        span,
                                                                        self.ast_builder
                                                                            .atom("props"),
                                                                    ),
                                                            ),
                                                            self.ast_builder.identifier_name(
                                                                span,
                                                                self.ast_builder.atom("styleProps"),
                                                            ),
                                                            false,
                                                        ),
                                                ),
                                            ),
                                            // props: props
                                            self.ast_builder.object_property_kind_object_property(
                                                span,
                                                oxc_ast::ast::PropertyKind::Init,
                                                self.ast_builder
                                                    .expression_string_literal(
                                                        span,
                                                        self.ast_builder.atom("props"),
                                                        None,
                                                    )
                                                    .into(),
                                                Expression::Identifier(
                                                    self.ast_builder.alloc_identifier_reference(
                                                        span,
                                                        self.ast_builder.atom("props"),
                                                    ),
                                                ),
                                                false,
                                                false,
                                                false,
                                            ),
                                        ]),
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
            // Add spread element for props.style ?? {} after the CSS custom properties
            let mut all_style_properties = style_properties;
            all_style_properties.push(
                self.ast_builder.object_property_kind_spread_property(
                    span,
                    Expression::LogicalExpression(
                        self.ast_builder.alloc_logical_expression(
                            span,
                            Expression::StaticMemberExpression(
                                self.ast_builder.alloc_static_member_expression(
                                    span,
                                    Expression::Identifier(
                                        self.ast_builder.alloc_identifier_reference(
                                            span,
                                            self.ast_builder.atom("props"),
                                        ),
                                    ),
                                    self.ast_builder
                                        .identifier_name(span, self.ast_builder.atom("style")),
                                    false,
                                ),
                            ),
                            oxc_ast::ast::LogicalOperator::Coalesce,
                            Expression::ObjectExpression(
                                self.ast_builder
                                    .alloc_object_expression(span, self.ast_builder.vec()),
                            ),
                        ),
                    ),
                ),
            );

            Some(
                self.ast_builder.jsx_attribute_item_attribute(
                    span,
                    self.ast_builder
                        .jsx_attribute_name_identifier(span, self.ast_builder.atom("style")),
                    Some(self.ast_builder.jsx_attribute_value_expression_container(
                        span,
                        JSXExpression::ObjectExpression(self.ast_builder.alloc_object_expression(
                            span,
                            self.ast_builder.vec_from_iter(all_style_properties),
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
                    JSXExpression::BinaryExpression(self.ast_builder.alloc_binary_expression(
                        span,
                        Expression::Identifier(self.ast_builder.alloc_identifier_reference(
                            span,
                            self.ast_builder.atom(&class_variable_name),
                        )),
                        oxc_ast::ast::BinaryOperator::Addition,
                        Expression::BinaryExpression(self.ast_builder.alloc_binary_expression(
                            span,
                            Expression::StringLiteral(self.ast_builder.alloc_string_literal(
                                span,
                                self.ast_builder.atom(" "),
                                None,
                            )),
                            oxc_ast::ast::BinaryOperator::Addition,
                            Expression::LogicalExpression(
                                self.ast_builder.alloc_logical_expression(
                                    span,
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
                                                self.ast_builder.atom("class"),
                                            ),
                                            false,
                                        ),
                                    ),
                                    oxc_ast::ast::LogicalOperator::Coalesce,
                                    Expression::StringLiteral(
                                        self.ast_builder.alloc_string_literal(
                                            span,
                                            self.ast_builder.atom(""),
                                            None,
                                        ),
                                    ),
                                ),
                            ),
                        )),
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
        // const Test: Component<any> & { class: string } = (() => {
        //   const testStyle = css`
        //     color: var(--var1-xxxxxx);
        //   `;
        //   const comp = (props: any) => {
        //     const [var1, rest] = splitProps(props, ["var1"])
        //     return <div
        //       {...rest}
        //       style={{"--var1-xxxxxx": arrowFn(props)}}
        //       class={testStyle + " " + class}
        //     />;
        //   };
        //   comp.css = testStyle.css;
        //   comp.toString = () => testStyle;
        //   return comp;
        // })()
        // TODO Object.freeze
        // ```
        *expression = Expression::CallExpression(self.ast_builder.alloc_call_expression(
            span,
            Expression::ArrowFunctionExpression(self.ast_builder.alloc_arrow_function_expression(
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
            )),
            None as Option<oxc_allocator::Box<_>>,
            self.ast_builder.vec(),
            false,
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
                tagged_template_expression.clone_in(self.ast_builder.allocator);
            modified_tagged_template_expression.tag = Expression::Identifier(
                self.ast_builder
                    .alloc_identifier_reference(it.span(), self.ast_builder.atom("style")),
            );

            *it = Expression::TaggedTemplateExpression(modified_tagged_template_expression);
            self.transform_styled_component(it, base_component_name);

            return;
        }

        if let Expression::TaggedTemplateExpression(tagged_template_expression) = it
            && let Expression::StaticMemberExpression(static_member_expression) =
                &tagged_template_expression.tag
            && let Expression::Identifier(object_identifier) = &static_member_expression.object
            && object_identifier.name == "styled"
        {
            let jsx_tag = static_member_expression.property.name.as_str();
            self.transform_styled_component(it, jsx_tag);
            return;
        }

        oxc_ast_visit::walk_mut::walk_expression(self, it);
    }

    fn visit_variable_declarator(&mut self, it: &mut VariableDeclarator<'alloc>) {
        let prev = self.variable_name.take();
        self.variable_name = match &it.id.kind {
            BindingPatternKind::BindingIdentifier(binding_identifier) => {
                Some(binding_identifier.name.to_string())
            }
            // Skip non-identifier patterns for now
            _ => None,
        };
        oxc_ast_visit::walk_mut::walk_variable_declarator(self, it);
        self.variable_name = prev;
    }
}

pub fn solid_js_prepass<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    filepath: String,
    program: &mut Program<'alloc>,
    skip_jsx: bool,
) {
    let mut transformer = SolidTransformer::new(ast_builder, skip_jsx, filepath);
    transformer.visit_program(program);
}
