use crate::{utils::SeededRandom, *};
use oxc_ast::ast::JSXAttributeItem;

pub struct CapturedExpression<'alloc> {
    pub expression: Expression<'alloc>,
    pub var_name: String,
}

pub struct ComponentTransformContext<'alloc> {
    pub class_variable_name: String,
    pub captured_expressions: Vec<CapturedExpression<'alloc>>,
    pub span: oxc_span::Span,
}

pub struct StyledComponentTransformer<'a, 'alloc> {
    pub ast_builder: &'a AstBuilder<'alloc>,
    pub skip_jsx: bool,
    pub variable_name: Option<String>,
    pub current_statement_index: usize,
    anonymous_component_name_counter: usize,
    filepath: String,
    pub component_counter: usize,
    class_prop_name: &'static str,
}

impl<'a, 'alloc> StyledComponentTransformer<'a, 'alloc> {
    pub fn new(
        ast_builder: &'a AstBuilder<'alloc>,
        skip_jsx: bool,
        filepath: String,
        class_prop_name: &'static str,
    ) -> Self {
        Self {
            ast_builder,
            skip_jsx,
            filepath,
            variable_name: None,
            current_statement_index: 0,
            anonymous_component_name_counter: 0,
            component_counter: 0,
            class_prop_name,
        }
    }

    pub fn get_class_variable_name(&mut self) -> String {
        self.variable_name.clone().unwrap_or_else(|| {
            let name = format!("component_{}", self.anonymous_component_name_counter);
            self.anonymous_component_name_counter += 1;
            name
        })
    }

    pub fn extract_and_replace_arrow_functions(
        &self,
        simple_tagged_template_expression: &mut oxc_allocator::Box<'alloc, TaggedTemplateExpression<'alloc>>,
    ) -> Vec<CapturedExpression<'alloc>> {
        let mut captured_expressions = Vec::new();
        let mut var_counter = 1;
        let mut random = SeededRandom::new();

        for expression in simple_tagged_template_expression.quasi.expressions.iter_mut() {
            if let Expression::ArrowFunctionExpression(_) = expression {
                let random_suffix = random.random_string(
                    6,
                    &format!("{}_{}_{var_counter}", self.filepath, self.component_counter),
                );
                let var_name_with_var = format!("var(--var{var_counter}-{random_suffix})");
                let var_name = format!("--var{var_counter}-{random_suffix}");

                let prev_expression = std::mem::replace(
                    expression,
                    Expression::StringLiteral(self.ast_builder.alloc_string_literal(
                        expression.span(),
                        self.ast_builder.atom(&var_name_with_var),
                        None,
                    )),
                );

                captured_expressions.push(CapturedExpression {
                    expression: prev_expression,
                    var_name,
                });
                var_counter += 1;
            }
        }

        captured_expressions
    }

    pub fn build_css_declaration(
        &self,
        span: oxc_span::Span,
        class_variable_name: &str,
        simple_tagged_template_expression: oxc_allocator::Box<'alloc, TaggedTemplateExpression<'alloc>>,
    ) -> Statement<'alloc> {
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
                            self.ast_builder.atom(class_variable_name),
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
        ))
    }

    pub fn build_style_properties(
        &self,
        span: oxc_span::Span,
        captured_expressions: &[CapturedExpression<'alloc>],
    ) -> Vec<oxc_ast::ast::ObjectPropertyKind<'alloc>> {
        captured_expressions
            .iter()
            .map(|captured| {
                self.ast_builder.object_property_kind_object_property(
                    span,
                    oxc_ast::ast::PropertyKind::Init,
                    self.ast_builder
                        .expression_string_literal(span, self.ast_builder.atom(&captured.var_name), None)
                        .into(),
                    Expression::CallExpression(
                        self.ast_builder.alloc_call_expression(
                            span,
                            captured.expression.clone_in(self.ast_builder.allocator),
                            None as Option<oxc_allocator::Box<_>>,
                            self.ast_builder.vec1(
                                Expression::ObjectExpression(
                                    self.ast_builder.alloc_object_expression(
                                        span,
                                        self.ast_builder.vec_from_iter([
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
                                                                        self.ast_builder.atom("props"),
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
            .collect()
    }

    pub fn build_style_attribute(
        &self,
        span: oxc_span::Span,
        style_properties: Vec<oxc_ast::ast::ObjectPropertyKind<'alloc>>,
        include_props_style: bool,
    ) -> Option<JSXAttributeItem<'alloc>> {
        if style_properties.is_empty() {
            return None;
        }

        let mut all_style_properties = style_properties;
        
        if include_props_style {
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
        }

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
    }

    pub fn build_class_attribute(
        &self,
        span: oxc_span::Span,
        class_variable_name: &str,
        props_identifier: &str,
    ) -> JSXAttributeItem<'alloc> {
        self.ast_builder.jsx_attribute_item_attribute(
            span,
            self.ast_builder.jsx_attribute_name_identifier(
                span,
                self.ast_builder.atom(self.class_prop_name),
            ),
            Some(self.ast_builder.jsx_attribute_value_expression_container(
                span,
                JSXExpression::ConditionalExpression(
                    self.ast_builder.alloc_conditional_expression(
                        span,
                        Expression::StaticMemberExpression(
                            self.ast_builder.alloc_static_member_expression(
                                span,
                                Expression::Identifier(
                                    self.ast_builder.alloc_identifier_reference(
                                        span,
                                        self.ast_builder.atom(props_identifier),
                                    ),
                                ),
                                self.ast_builder.identifier_name(
                                    span,
                                    self.ast_builder.atom(self.class_prop_name),
                                ),
                                false,
                            ),
                        ),
                        Expression::BinaryExpression(
                            self.ast_builder.alloc_binary_expression(
                                span,
                                Expression::Identifier(
                                    self.ast_builder.alloc_identifier_reference(
                                        span,
                                        self.ast_builder.atom(class_variable_name),
                                    ),
                                ),
                                oxc_ast::ast::BinaryOperator::Addition,
                                Expression::BinaryExpression(
                                    self.ast_builder.alloc_binary_expression(
                                        span,
                                        Expression::StringLiteral(
                                            self.ast_builder.alloc_string_literal(
                                                span,
                                                self.ast_builder.atom(" "),
                                                None,
                                            ),
                                        ),
                                        oxc_ast::ast::BinaryOperator::Addition,
                                        Expression::StaticMemberExpression(
                                            self.ast_builder.alloc_static_member_expression(
                                                span,
                                                Expression::Identifier(
                                                    self.ast_builder.alloc_identifier_reference(
                                                        span,
                                                        self.ast_builder.atom(props_identifier),
                                                    ),
                                                ),
                                                self.ast_builder.identifier_name(
                                                    span,
                                                    self.ast_builder.atom(self.class_prop_name),
                                                ),
                                                false,
                                            ),
                                        ),
                                    ),
                                ),
                            ),
                        ),
                        Expression::Identifier(
                            self.ast_builder.alloc_identifier_reference(
                                span,
                                self.ast_builder.atom(class_variable_name),
                            ),
                        ),
                    ),
                ),
            )),
        )
    }

    pub fn build_jsx_element(
        &self,
        span: oxc_span::Span,
        jsx_tag: &'alloc str,
        attributes: Vec<JSXAttributeItem<'alloc>>,
    ) -> Expression<'alloc> {
        Expression::JSXElement(self.ast_builder.alloc_jsx_element(
            span,
            self.ast_builder.alloc_jsx_opening_element(
                span,
                self.ast_builder.jsx_element_name_identifier(span, jsx_tag),
                None as Option<oxc_allocator::Box<_>>,
                self.ast_builder.vec_from_iter(attributes),
            ),
            self.ast_builder.vec(),
            None as Option<oxc_allocator::Box<_>>,
        ))
    }

    pub fn build_assign_to_string_statement(
        &self,
        span: oxc_span::Span,
        class_variable_name: &str,
    ) -> Statement<'alloc> {
        Statement::ExpressionStatement(
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
                                                    self.ast_builder.atom(class_variable_name),
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
        )
    }

    pub fn build_assign_css_statement(
        &self,
        span: oxc_span::Span,
        class_variable_name: &str,
    ) -> Statement<'alloc> {
        Statement::ExpressionStatement(
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
                                        self.ast_builder.atom(class_variable_name),
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
        )
    }

    pub fn build_return_statement(&self, span: oxc_span::Span) -> Statement<'alloc> {
        Statement::ReturnStatement(
            self.ast_builder.alloc_return_statement(
                span,
                Some(Expression::Identifier(
                    self.ast_builder
                        .alloc_identifier_reference(span, self.ast_builder.atom("comp")),
                )),
            ),
        )
    }

    pub fn wrap_in_iife(
        &self,
        span: oxc_span::Span,
        function_body_statements: Vec<Statement<'alloc>>,
    ) -> Expression<'alloc> {
        Expression::CallExpression(self.ast_builder.alloc_call_expression(
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
        ))
    }
}
