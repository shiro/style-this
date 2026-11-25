use crate::{styled_component_transformer::*, *};
use crate::library_references::{LibraryExport, LibraryReferences};
use oxc_ast::ast::{
    Argument, ArrayExpressionElement, ArrowFunctionBody, BindingPattern, FormalParameter,
    FormalParameterKind, FormalParameters, JSXAttributeItem,
};

const SPLIT_PROPS_LOCAL_NAME: &str = "__styleThis__splitProps";

struct SolidStyledComponentTransformer<'a, 'alloc> {
    base: StyledComponentTransformer<'a, 'alloc>,
    uses_merge_inline_styles: bool,
}

impl<'a, 'alloc> SolidStyledComponentTransformer<'a, 'alloc> {
    fn new(
        ast_builder: &'a AstBuilder<'alloc>,
        references: &'a LibraryReferences,
        skip_jsx: bool,
        filepath: String,
    ) -> Self {
        Self {
            base: StyledComponentTransformer::new(ast_builder, references, LibraryExport::SolidStyled, skip_jsx, filepath, "class"),
            uses_merge_inline_styles: false,
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
        // Solid's `style` prop may be a string, so it can't be spread
        let style_attribute = self.base.build_style_attribute(span, style_properties, true);
        self.uses_merge_inline_styles |= style_attribute.is_some();

        // For Solid, we need to use splitProps to filter out styleProps and style
        // BUT only if we're extending an HTML element, not a custom component
        let should_filter_props = !is_extending_custom_component && !captured_expressions.is_empty();
        let ast_builder = self.base.ast_builder;
        let split_props_statement = if should_filter_props {
            Some(Statement::new_variable_declaration(
                span,
                VariableDeclarationKind::Const,
                [ast::build_variable_declarator_pattern(
                    ast_builder,
                    span,
                    BindingPattern::new_array_pattern(
                        span,
                        [
                            None,
                            Some(BindingPattern::new_binding_identifier(
                                span,
                                REST_PROPS_LOCAL_NAME,
                                ast_builder,
                            )),
                        ],
                        None,
                        ast_builder,
                    ),
                    Expression::new_call_expression(
                        span,
                        Expression::new_identifier(span, SPLIT_PROPS_LOCAL_NAME, ast_builder),
                        None,
                        [
                            Argument::new_identifier(span, PROPS_LOCAL_NAME, ast_builder),
                            Argument::new_array_expression(
                                span,
                                ["styleProps", "style"].map(|name| {
                                    ArrayExpressionElement::new_string_literal(
                                        span,
                                        name,
                                        None,
                                        ast_builder,
                                    )
                                }),
                                ast_builder,
                            ),
                        ],
                        false,
                        ast_builder,
                    ),
                )],
                false,
                ast_builder,
            ))
        } else {
            None
        };

        // Build attributes - for Solid with splitProps, spread the rest instead of the props
        let spread_identifier = if should_filter_props { REST_PROPS_LOCAL_NAME } else { PROPS_LOCAL_NAME };
        let mut attributes = vec![
            JSXAttributeItem::new_spread_attribute(
                span,
                Expression::new_identifier(span, spread_identifier, ast_builder),
                ast_builder,
            ),
            self.base.build_class_attribute(span, PROPS_LOCAL_NAME),
        ];

        if let Some(style_attr) = style_attribute {
            attributes.push(style_attr);
        }

        let jsx_element_expression = self.base.build_jsx_element(span, name, attributes);

        // For Solid, the component body includes splitProps and returns JSX
        let mut component_body_statements = Vec::from_iter(split_props_statement);
        component_body_statements.push(Statement::new_return_statement(
            span,
            Some(jsx_element_expression),
            ast_builder,
        ));

        let define_jsx_element_statement = Statement::new_variable_declaration(
            span,
            VariableDeclarationKind::Let,
            [ast::build_variable_declarator(
                ast_builder,
                span,
                COMPONENT_LOCAL_NAME,
                Expression::new_arrow_function_expression(
                    span,
                    false,
                    None,
                    FormalParameters::boxed(
                        span,
                        FormalParameterKind::ArrowFormalParameters,
                        [FormalParameter::new(
                            span,
                            ArenaVec::new_in(ast_builder),
                            BindingPattern::new_binding_identifier(
                                span,
                                PROPS_LOCAL_NAME,
                                ast_builder,
                            ),
                            None,
                            None,
                            false,
                            None,
                            false,
                            false,
                            ast_builder,
                        )],
                        None,
                        ast_builder,
                    ),
                    None,
                    ArrowFunctionBody::new_function_body(
                        span,
                        ArenaVec::new_in(ast_builder),
                        ArenaVec::from_iter_in(component_body_statements, ast_builder),
                        ast_builder,
                    ),
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

impl<'a, 'alloc> VisitMut<'alloc> for SolidStyledComponentTransformer<'a, 'alloc> {
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

pub fn solid_js_prepass<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    references: &LibraryReferences,
    filepath: String,
    program: &mut Program<'alloc>,
    skip_jsx: bool,
    class_display_names: &mut ClassDisplayNames,
) {
    let mut transformer = SolidStyledComponentTransformer::new(ast_builder, references, skip_jsx, filepath);
    transformer.visit_program(program);
    class_display_names.extend(std::mem::take(&mut transformer.base.class_display_names));

    if transformer.base.component_counter > 0 && !transformer.base.skip_jsx {
        insert_merge_styles_import(ast_builder, program);
    }

    if transformer.uses_merge_inline_styles {
        insert_named_import(
            ast_builder,
            program,
            "mergeInlineStyles",
            MERGE_INLINE_STYLES_LOCAL_NAME,
            LIBRARY_CORE_IMPORT_NAME,
        );
    }

    // Add import for splitProps if we generated any styled components with captured expressions
    if transformer.base.component_counter > 0 && !transformer.base.skip_jsx {
        insert_named_import(ast_builder, program, "splitProps", SPLIT_PROPS_LOCAL_NAME, "solid-js");
    }
}
