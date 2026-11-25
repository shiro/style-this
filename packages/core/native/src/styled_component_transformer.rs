use crate::library_references::{LibraryExport, LibraryReferences};
use crate::{utils::SeededRandom, *};
use oxc_ast::ast::{
    Argument, ArrowFunctionBody, AssignmentOperator, AssignmentTarget, BindingPattern,
    FormalParameterKind, FormalParameters, IdentifierName, JSXAttributeItem, JSXAttributeName,
    JSXAttributeValue, JSXElement, JSXElementName, JSXIdentifier, JSXMemberExpression,
    JSXMemberExpressionObject, JSXOpeningElement, LogicalOperator, ObjectPropertyKind,
    PropertyKey, PropertyKind, StaticMemberExpression,
};

pub const MERGE_STYLES_LOCAL_NAME: &str = "__styleThis__mergeStyles";
pub const MERGE_INLINE_STYLES_LOCAL_NAME: &str = "__styleThis__mergeInlineStyles";

// locals of the generated wrapper, prefixed so they don't shadow user variables referenced by
// captured style functions (e.g. `${() => props.color}` with a module-level `props`)
pub const COMPONENT_LOCAL_NAME: &str = "__styleThis__comp";
pub const PROPS_LOCAL_NAME: &str = "__styleThis__props";
pub const REST_PROPS_LOCAL_NAME: &str = "__styleThis__rest";
// the class name is derived from the display name instead, see `ClassDisplayNames`
pub const CLASS_LOCAL_NAME: &str = "__styleThis__class";
const BASE_LOCAL_NAME: &str = "__styleThis__Base";
/// Tag of the generated `css` templates, independent of the user's `css` import (or another
/// library's `css`).
pub const CSS_TAG_LOCAL_NAME: &str = "__styleThis__css";

/// Span of a generated `let __styleThis__class = __styleThis__css\`...\`` template -> name the compiler uses
/// for its class name and atomic export key (e.g. `Button` for `const Button = styled.button`).
pub type ClassDisplayNames = HashMap<oxc_span::Span, String>;

/// Inserts `import { mergeStyles as __styleThis__mergeStyles } from "@style-this/core"` after the last import.
pub fn insert_merge_styles_import<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    program: &mut Program<'alloc>,
) {
    insert_named_import(
        ast_builder,
        program,
        "mergeStyles",
        MERGE_STYLES_LOCAL_NAME,
        LIBRARY_CORE_IMPORT_NAME,
    );
}

/// Inserts `import { imported as local } from "source"` after the last import.
pub fn insert_named_import<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    program: &mut Program<'alloc>,
    imported: &str,
    local: &str,
    source: &str,
) {
    use oxc_ast::ast::{
        BindingIdentifier, ImportDeclarationSpecifier, ImportOrExportKind, ModuleExportName,
        StringLiteral,
    };

    let import_spec = ImportDeclarationSpecifier::new_import_specifier(
        program.span,
        ModuleExportName::IdentifierName(IdentifierName::new(
            program.span,
            Ident::from_str_in(imported, ast_builder),
            ast_builder,
        )),
        BindingIdentifier::new(program.span, Ident::from_str_in(local, ast_builder), ast_builder),
        ImportOrExportKind::Value,
        ast_builder,
    );

    let import_declaration = Statement::new_import_declaration(
        program.span,
        Some(ArenaVec::from_array_in([import_spec], ast_builder)),
        StringLiteral::new(program.span, Str::from_str_in(source, ast_builder), None, ast_builder),
        None,
        None,
        ImportOrExportKind::Value,
        ast_builder,
    );

    let insert_pos = program
        .body
        .iter()
        .position(|stmt| !matches!(stmt, Statement::ImportDeclaration(_)))
        .unwrap_or(0);

    program
        .body
        .insert(insert_pos, import_declaration);
}

pub struct CapturedExpression<'alloc> {
    pub expression: Expression<'alloc>,
    pub var_name: String,
}

pub struct StyledElement<'alloc> {
    pub name: JSXElementName<'alloc>,
    pub is_component: bool,
    /// `const __styleThis__Base = <base>`, declared before the component when the base is aliased
    pub base_declaration: Option<Statement<'alloc>>,
}

pub struct ComponentTransformContext<'alloc> {
    pub class_variable_name: String,
    pub captured_expressions: Vec<CapturedExpression<'alloc>>,
    pub span: oxc_span::Span,
}

pub struct StyledComponentTransformer<'a, 'alloc> {
    pub ast_builder: &'a AstBuilder<'alloc>,
    references: &'a LibraryReferences,
    /// the `styled` export of the framework
    styled: LibraryExport,
    pub skip_jsx: bool,
    pub variable_name: Option<String>,
    pub current_statement_index: usize,
    anonymous_component_name_counter: usize,
    filepath: String,
    pub component_counter: usize,
    class_prop_name: &'static str,
    pub class_display_names: ClassDisplayNames,
}

impl<'a, 'alloc> StyledComponentTransformer<'a, 'alloc> {
    pub fn new(
        ast_builder: &'a AstBuilder<'alloc>,
        references: &'a LibraryReferences,
        styled: LibraryExport,
        skip_jsx: bool,
        filepath: String,
        class_prop_name: &'static str,
    ) -> Self {
        Self {
            ast_builder,
            references,
            styled,
            skip_jsx,
            filepath,
            variable_name: None,
            current_statement_index: 0,
            anonymous_component_name_counter: 0,
            component_counter: 0,
            class_prop_name,
            class_display_names: Default::default(),
        }
    }

    pub fn get_class_display_name(&mut self) -> String {
        self.variable_name.clone().unwrap_or_else(|| {
            let name = format!("component_{}", self.anonymous_component_name_counter);
            self.anonymous_component_name_counter += 1;
            name
        })
    }

    /// Replaces function expressions (also parenthesized or TS-wrapped) with CSS variables, to be
    /// evaluated at runtime with the style props.
    pub fn extract_and_replace_style_functions(
        &self,
        simple_tagged_template_expression: &mut oxc_allocator::Box<'alloc, TaggedTemplateExpression<'alloc>>,
    ) -> Vec<CapturedExpression<'alloc>> {
        let mut captured_expressions = Vec::new();
        let mut var_counter = 1;
        let mut random = SeededRandom::new();

        for expression in simple_tagged_template_expression.quasi.expressions.iter_mut() {
            if expression.get_inner_expression().is_function() {
                let random_suffix = random.random_string(
                    6,
                    &format!("{}_{}_{var_counter}", self.filepath, self.component_counter),
                );
                let var_name_with_var = format!("var(--var{var_counter}-{random_suffix})");
                let var_name = format!("--var{var_counter}-{random_suffix}");

                let prev_expression = std::mem::replace(
                    expression,
                    Expression::new_string_literal(
                        expression.span(),
                        Str::from_str_in(&var_name_with_var, self.ast_builder),
                        None,
                        self.ast_builder,
                    ),
                );

                captured_expressions.push(CapturedExpression {
                    expression: prev_expression.into_inner_expression(),
                    var_name,
                });
                var_counter += 1;
            }
        }

        captured_expressions
    }

    pub fn build_css_declaration(
        &mut self,
        span: oxc_span::Span,
        class_display_name: String,
        simple_tagged_template_expression: oxc_allocator::Box<'alloc, TaggedTemplateExpression<'alloc>>,
    ) -> Statement<'alloc> {
        self.class_display_names
            .insert(simple_tagged_template_expression.span, class_display_name);

        Statement::new_variable_declaration(
            span,
            VariableDeclarationKind::Let,
            [ast::build_variable_declarator_pattern(
                self.ast_builder,
                span,
                BindingPattern::new_binding_identifier(span, CLASS_LOCAL_NAME, self.ast_builder),
                Expression::TaggedTemplateExpression(simple_tagged_template_expression),
            )],
            false,
            self.ast_builder,
        )
    }

    pub fn build_style_properties(
        &self,
        span: oxc_span::Span,
        captured_expressions: &[CapturedExpression<'alloc>],
    ) -> Vec<oxc_ast::ast::ObjectPropertyKind<'alloc>> {
        captured_expressions
            .iter()
            .map(|captured| {
                ObjectPropertyKind::new_object_property(
                    span,
                    PropertyKind::Init,
                    PropertyKey::new_static_string_literal(
                        span,
                        Str::from_str_in(&captured.var_name, self.ast_builder),
                        None,
                        self.ast_builder,
                    ),
                    Expression::new_call_expression(
                        span,
                        captured.expression.clone_in(self.ast_builder.allocator()),
                        None,
                        [Argument::new_object_expression(
                            span,
                            [
                                ObjectPropertyKind::new_spread_property(
                                    span,
                                    Expression::new_static_member_expression(
                                        span,
                                        Expression::new_identifier(
                                            span,
                                            PROPS_LOCAL_NAME,
                                            self.ast_builder,
                                        ),
                                        IdentifierName::new(span, "styleProps", self.ast_builder),
                                        false,
                                        self.ast_builder,
                                    ),
                                    self.ast_builder,
                                ),
                                ObjectPropertyKind::new_object_property(
                                    span,
                                    PropertyKind::Init,
                                    PropertyKey::new_static_string_literal(
                                        span,
                                        "props",
                                        None,
                                        self.ast_builder,
                                    ),
                                    Expression::new_identifier(
                                        span,
                                        PROPS_LOCAL_NAME,
                                        self.ast_builder,
                                    ),
                                    false,
                                    false,
                                    self.ast_builder,
                                ),
                            ],
                            self.ast_builder,
                        )],
                        false,
                        self.ast_builder,
                    ),
                    false,
                    false,
                    self.ast_builder,
                )
            })
            .collect()
    }

    /// Builds the `style` attribute merging the CSS variables with `props.style`, either as
    /// `{...vars, ...props.style ?? {}}` or, when `props.style` may be a string (Solid), as
    /// `__styleThis__mergeInlineStyles({...vars}, props.style)`.
    pub fn build_style_attribute(
        &self,
        span: oxc_span::Span,
        style_properties: Vec<oxc_ast::ast::ObjectPropertyKind<'alloc>>,
        use_merge_inline_styles: bool,
    ) -> Option<JSXAttributeItem<'alloc>> {
        if style_properties.is_empty() {
            return None;
        }

        let props_style = Expression::new_static_member_expression(
            span,
            Expression::new_identifier(span, PROPS_LOCAL_NAME, self.ast_builder),
            IdentifierName::new(span, "style", self.ast_builder),
            false,
            self.ast_builder,
        );

        let style_expression = if use_merge_inline_styles {
            JSXExpression::new_call_expression(
                span,
                Expression::new_identifier(span, MERGE_INLINE_STYLES_LOCAL_NAME, self.ast_builder),
                None,
                [
                    Argument::new_object_expression(
                        span,
                        ArenaVec::from_iter_in(style_properties, self.ast_builder),
                        self.ast_builder,
                    ),
                    props_style.into(),
                ],
                false,
                self.ast_builder,
            )
        } else {
            let mut all_style_properties = style_properties;
            all_style_properties.push(ObjectPropertyKind::new_spread_property(
                span,
                Expression::new_logical_expression(
                    span,
                    props_style,
                    LogicalOperator::Coalesce,
                    Expression::new_object_expression(
                        span,
                        ArenaVec::new_in(self.ast_builder),
                        self.ast_builder,
                    ),
                    self.ast_builder,
                ),
                self.ast_builder,
            ));
            JSXExpression::new_object_expression(
                span,
                ArenaVec::from_iter_in(all_style_properties, self.ast_builder),
                self.ast_builder,
            )
        };

        Some(JSXAttributeItem::new_attribute(
            span,
            JSXAttributeName::new_identifier(span, "style", self.ast_builder),
            Some(JSXAttributeValue::new_expression_container(
                span,
                style_expression,
                self.ast_builder,
            )),
            self.ast_builder,
        ))
    }

    /// Builds `class={__styleThis__mergeStyles(ClassVar, props.class)}` so classes passed in by the
    /// parent win over the component's own atomic classes.
    pub fn build_class_attribute(
        &self,
        span: oxc_span::Span,
        props_identifier: &str,
    ) -> JSXAttributeItem<'alloc> {
        JSXAttributeItem::new_attribute(
            span,
            JSXAttributeName::new_identifier(span, self.class_prop_name, self.ast_builder),
            Some(JSXAttributeValue::new_expression_container(
                span,
                JSXExpression::new_call_expression(
                    span,
                    Expression::new_identifier(span, MERGE_STYLES_LOCAL_NAME, self.ast_builder),
                    None,
                    [
                        Argument::new_identifier(span, CLASS_LOCAL_NAME, self.ast_builder),
                        Argument::new_static_member_expression(
                            span,
                            ast::build_identifier(self.ast_builder, span, props_identifier),
                            IdentifierName::new(span, self.class_prop_name, self.ast_builder),
                            false,
                            self.ast_builder,
                        ),
                    ],
                    false,
                    self.ast_builder,
                ),
                self.ast_builder,
            )),
            self.ast_builder,
        )
    }

    /// The element of a styled template: `styled.div`, `styled("div")`, `styled(Component)`,
    /// `styled(ui.Component)`, or any other base (e.g. `styled(card)`, `styled(ui["Card"])`) aliased
    /// to a capitalized local, since JSX would treat it as an HTML element or can't reference it.
    pub fn styled_element(&self, template: &TaggedTemplateExpression<'alloc>) -> Option<StyledElement<'alloc>> {
        let span = template.span;
        let element = |name: Str<'alloc>, is_component| StyledElement {
            name: JSXElementName::new_identifier(span, name, self.ast_builder),
            is_component,
            base_declaration: None,
        };
        match &template.tag {
            Expression::StaticMemberExpression(member)
                if self.references.get(&member.object) == Some(self.styled) =>
            {
                Some(element(member.property.name.into(), false))
            }
            Expression::CallExpression(call)
                if self.references.get(&call.callee) == Some(self.styled) && call.arguments.len() == 1 =>
            {
                let base = call.arguments[0].as_expression()?.get_inner_expression();
                let direct = match base {
                    Expression::StringLiteral(name) => {
                        name.value.as_arena_str().map(|name| element(name, false))
                    }
                    Expression::TemplateLiteral(template) => template
                        .single_quasi()
                        .and_then(|name| name.as_arena_str())
                        .map(|name| element(name, false)),
                    // JSX treats lowercase names as HTML elements
                    Expression::Identifier(component) if !component.name.starts_with(|c: char| c.is_ascii_lowercase()) => {
                        Some(element(component.name.into(), true))
                    }
                    Expression::StaticMemberExpression(member) => {
                        self.jsx_member_expression(span, member).map(|member| StyledElement {
                            name: JSXElementName::MemberExpression(member),
                            is_component: true,
                            base_declaration: None,
                        })
                    }
                    _ => None,
                };
                Some(direct.unwrap_or_else(|| StyledElement {
                    base_declaration: Some(self.build_base_declaration(span, base)),
                    ..element(Str::from(BASE_LOCAL_NAME), true)
                }))
            }
            _ => None,
        }
    }

    fn build_base_declaration(&self, span: oxc_span::Span, base: &Expression<'alloc>) -> Statement<'alloc> {
        Statement::new_variable_declaration(
            span,
            VariableDeclarationKind::Const,
            [ast::build_variable_declarator(
                self.ast_builder,
                span,
                BASE_LOCAL_NAME,
                base.clone_in(self.ast_builder.allocator()),
            )],
            false,
            self.ast_builder,
        )
    }

    /// `ui.Component` as a JSX element name, `None` for other member expressions (e.g. `this.x`).
    fn jsx_member_expression(
        &self,
        span: oxc_span::Span,
        member: &StaticMemberExpression<'alloc>,
    ) -> Option<oxc_allocator::Box<'alloc, JSXMemberExpression<'alloc>>> {
        let object = match &member.object {
            Expression::Identifier(object) => {
                JSXMemberExpressionObject::new_identifier_reference(span, object.name, self.ast_builder)
            }
            Expression::StaticMemberExpression(object) => {
                JSXMemberExpressionObject::MemberExpression(self.jsx_member_expression(span, object)?)
            }
            _ => return None,
        };
        let property = JSXIdentifier::new(span, member.property.name, self.ast_builder);
        Some(JSXMemberExpression::boxed(span, object, property, self.ast_builder))
    }

    pub fn build_jsx_element(
        &self,
        span: oxc_span::Span,
        name: JSXElementName<'alloc>,
        attributes: Vec<JSXAttributeItem<'alloc>>,
    ) -> Expression<'alloc> {
        Expression::JSXElement(JSXElement::boxed(
            span,
            JSXOpeningElement::boxed(
                span,
                name,
                None,
                ArenaVec::from_iter_in(attributes, self.ast_builder),
                self.ast_builder,
            ),
            ArenaVec::new_in(self.ast_builder),
            None,
            self.ast_builder,
        ))
    }

    pub fn build_assign_to_string_statement(
        &self,
        span: oxc_span::Span,
    ) -> Statement<'alloc> {
        self.build_assign_component_member_statement(
            span,
            "toString",
            Expression::new_arrow_function_expression(
                span,
                false,
                None,
                self.build_empty_arrow_params(span),
                None,
                ArrowFunctionBody::new_identifier(span, CLASS_LOCAL_NAME, self.ast_builder),
                self.ast_builder,
            ),
        )
    }

    pub fn build_assign_css_statement(
        &self,
        span: oxc_span::Span,
    ) -> Statement<'alloc> {
        self.build_assign_component_member_statement(
            span,
            "css",
            Expression::new_static_member_expression(
                span,
                Expression::new_identifier(span, CLASS_LOCAL_NAME, self.ast_builder),
                IdentifierName::new(span, "css", self.ast_builder),
                false,
                self.ast_builder,
            ),
        )
    }

    /// `__styleThis__comp.<member> = <value>`
    fn build_assign_component_member_statement(
        &self,
        span: oxc_span::Span,
        member: &'static str,
        value: Expression<'alloc>,
    ) -> Statement<'alloc> {
        Statement::new_expression_statement(
            span,
            Expression::new_assignment_expression(
                span,
                AssignmentOperator::Assign,
                AssignmentTarget::new_static_member_expression(
                    span,
                    Expression::new_identifier(span, COMPONENT_LOCAL_NAME, self.ast_builder),
                    IdentifierName::new(span, member, self.ast_builder),
                    false,
                    self.ast_builder,
                ),
                value,
                self.ast_builder,
            ),
            self.ast_builder,
        )
    }

    fn build_empty_arrow_params(
        &self,
        span: oxc_span::Span,
    ) -> oxc_allocator::Box<'alloc, FormalParameters<'alloc>> {
        FormalParameters::boxed(
            span,
            FormalParameterKind::ArrowFormalParameters,
            ArenaVec::new_in(self.ast_builder),
            None,
            self.ast_builder,
        )
    }

    pub fn build_return_statement(&self, span: oxc_span::Span) -> Statement<'alloc> {
        Statement::new_return_statement(
            span,
            Some(Expression::new_identifier(span, COMPONENT_LOCAL_NAME, self.ast_builder)),
            self.ast_builder,
        )
    }

    pub fn wrap_in_iife(
        &self,
        span: oxc_span::Span,
        function_body_statements: Vec<Statement<'alloc>>,
    ) -> Expression<'alloc> {
        Expression::new_call_expression(
            span,
            Expression::new_arrow_function_expression(
                span,
                false,
                None,
                self.build_empty_arrow_params(span),
                None,
                ArrowFunctionBody::new_function_body(
                    span,
                    ArenaVec::new_in(self.ast_builder),
                    ArenaVec::from_iter_in(function_body_statements, self.ast_builder),
                    self.ast_builder,
                ),
                self.ast_builder,
            ),
            None,
            ArenaVec::new_in(self.ast_builder),
            false,
            self.ast_builder,
        )
    }
}
