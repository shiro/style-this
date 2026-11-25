use crate::{styled_component_transformer::*, *};
use crate::library_references::{LibraryExport, LibraryReferences};
use oxc_ast::ast::{
    Argument, ArrowFunctionBody, BindingPattern, BindingProperty, BindingRestElement,
    FormalParameter, FormalParameterKind, FormalParameters, JSXAttributeItem, JSXAttributeName,
    JSXAttributeValue, JSXExpression,
};

const FORWARD_REF_LOCAL_NAME: &str = "__styleThis__forwardRef";
const REF_LOCAL_NAME: &str = "__styleThis__ref";

struct ReactStyledComponentTransformer<'a, 'alloc> {
    base: StyledComponentTransformer<'a, 'alloc>,
}

impl<'a, 'alloc> ReactStyledComponentTransformer<'a, 'alloc> {
    fn new(
        ast_builder: &'a AstBuilder<'alloc>,
        references: &'a LibraryReferences,
        skip_jsx: bool,
        filepath: String,
    ) -> Self {
        Self {
            base: StyledComponentTransformer::new(ast_builder, references, LibraryExport::ReactStyled, skip_jsx, filepath, "className"),
        }
    }

    fn transform_styled_component(
        &mut self,
        expression: &mut Expression<'alloc>,
        StyledElement { name, is_component: is_extending_custom_component, base_declaration }: StyledElement<'alloc>,
    ) {
        self.base.component_counter += 1;
        let class_display_name = self.base.get_class_display_name();
        let span = expression.span();

        let Expression::TaggedTemplateExpression(tagged_template_expression) = &mut *expression
        else {
            return;
        };

        let mut simple_tagged_template_expression =
            tagged_template_expression.clone_in(self.base.ast_builder.allocator());
        simple_tagged_template_expression.tag =
            Expression::new_identifier(span, CSS_TAG_LOCAL_NAME, self.base.ast_builder);

        let captured_expressions =
            self.base.extract_and_replace_style_functions(&mut simple_tagged_template_expression);

        if self.base.skip_jsx {
            *tagged_template_expression =
                simple_tagged_template_expression.clone_in(self.base.ast_builder.allocator());
            return;
        }

        let css_declaration = self.base.build_css_declaration(span, class_display_name, simple_tagged_template_expression);
        
        let style_properties = self.base.build_style_properties(span, &captured_expressions);
        let style_attribute = self.base.build_style_attribute(span, style_properties, false);

        // For React, filter props only when extending an HTML element (not a custom component) and we have captured expressions
        let should_filter_props = !is_extending_custom_component && !captured_expressions.is_empty();
        let spread_identifier = if should_filter_props { REST_PROPS_LOCAL_NAME } else { PROPS_LOCAL_NAME };
        
        // Build destructuring statement: const { styleProps, style, ...rest } = props;
        let ast_builder = self.base.ast_builder;
        let binding_property = |key: &'static str, local: &'static str| {
            BindingProperty::new(
                span,
                PropertyKey::new_static_identifier(span, key, ast_builder),
                BindingPattern::new_binding_identifier(span, local, ast_builder),
                false,
                ast_builder,
            )
        };
        let destructure_statement = if should_filter_props {
            Some(Statement::new_variable_declaration(
                span,
                VariableDeclarationKind::Const,
                [ast::build_variable_declarator_pattern(
                    ast_builder,
                    span,
                    BindingPattern::new_object_pattern(
                        span,
                        [
                            binding_property("styleProps", "__styleThis__styleProps"),
                            binding_property("style", "__styleThis__style"),
                        ],
                        Some(BindingRestElement::boxed(
                            span,
                            BindingPattern::new_binding_identifier(
                                span,
                                REST_PROPS_LOCAL_NAME,
                                ast_builder,
                            ),
                            ast_builder,
                        )),
                        ast_builder,
                    ),
                    Expression::new_identifier(span, PROPS_LOCAL_NAME, ast_builder),
                )],
                false,
                ast_builder,
            ))
        } else {
            None
        };

        let mut attributes = vec![
            JSXAttributeItem::new_spread_attribute(
                span,
                Expression::new_identifier(span, spread_identifier, ast_builder),
                ast_builder,
            ),
            // ref={ref}
            JSXAttributeItem::new_attribute(
                span,
                JSXAttributeName::new_identifier(span, "ref", ast_builder),
                Some(JSXAttributeValue::new_expression_container(
                    span,
                    JSXExpression::new_identifier(span, REF_LOCAL_NAME, ast_builder),
                    ast_builder,
                )),
                ast_builder,
            ),
            self.base.build_class_attribute(span, spread_identifier),
        ];

        if let Some(style_attr) = style_attribute {
            attributes.push(style_attr);
        }

        let jsx_element_expression = self.base.build_jsx_element(span, name, attributes);

        // For React, the component has a block body when filtering props
        let component_body = if should_filter_props {
            let mut statements = Vec::from_iter(destructure_statement);
            statements.push(Statement::new_return_statement(
                span,
                Some(jsx_element_expression),
                ast_builder,
            ));
            ArrowFunctionBody::new_function_body(
                span,
                ArenaVec::new_in(ast_builder),
                ArenaVec::from_iter_in(statements, ast_builder),
                ast_builder,
            )
        } else {
            ArrowFunctionBody::from(jsx_element_expression)
        };

        let define_jsx_element_statement = Statement::new_variable_declaration(
            span,
            VariableDeclarationKind::Let,
            [ast::build_variable_declarator(
                ast_builder,
                span,
                COMPONENT_LOCAL_NAME,
                // forwardRef((props, ref) => ...)
                Expression::new_call_expression(
                    span,
                    Expression::new_identifier(span, FORWARD_REF_LOCAL_NAME, ast_builder),
                    None,
                    [Argument::new_arrow_function_expression(
                        span,
                        false,
                        None,
                        FormalParameters::boxed(
                            span,
                            FormalParameterKind::ArrowFormalParameters,
                            ArenaVec::from_iter_in(
                                [PROPS_LOCAL_NAME, REF_LOCAL_NAME].map(|name| {
                                    FormalParameter::new(
                                        span,
                                        ArenaVec::new_in(ast_builder),
                                        BindingPattern::new_binding_identifier(
                                            span,
                                            name,
                                            ast_builder,
                                        ),
                                        None,
                                        None,
                                        false,
                                        None,
                                        false,
                                        false,
                                        ast_builder,
                                    )
                                }),
                                ast_builder,
                            ),
                            None,
                            ast_builder,
                        ),
                        None,
                        component_body,
                        ast_builder,
                    )],
                    false,
                    ast_builder,
                ),
            )],
            false,
            ast_builder,
        );

        let mut function_body_statements = Vec::from_iter(base_declaration);
        function_body_statements.extend([css_declaration, define_jsx_element_statement]);

        if captured_expressions.is_empty() {
            function_body_statements.push(self.base.build_assign_css_statement(span));
        }

        function_body_statements.push(self.base.build_assign_to_string_statement(span));
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
        if let Expression::TaggedTemplateExpression(template) = it
            && let Some(element) = self.base.styled_element(template)
        {
            self.transform_styled_component(it, element);
            return;
        }

        oxc_ast_visit::walk_mut::walk_expression(self, it);
    }

    fn visit_variable_declarator(&mut self, it: &mut VariableDeclarator<'alloc>) {
        let prev = self.base.variable_name.take();
        self.base.variable_name = match &it.id {
            BindingPattern::BindingIdentifier(binding_identifier) => {
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
    references: &LibraryReferences,
    filepath: String,
    program: &mut Program<'alloc>,
    skip_jsx: bool,
    class_display_names: &mut ClassDisplayNames,
) {
    let mut transformer = ReactStyledComponentTransformer::new(ast_builder, references, skip_jsx, filepath);
    transformer.visit_program(program);
    class_display_names.extend(std::mem::take(&mut transformer.base.class_display_names));

    if transformer.base.component_counter > 0 && !transformer.base.skip_jsx {
        insert_merge_styles_import(ast_builder, program);
        insert_named_import(ast_builder, program, "forwardRef", FORWARD_REF_LOCAL_NAME, "react");
    }
}
