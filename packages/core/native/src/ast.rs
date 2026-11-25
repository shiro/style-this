use oxc_ast::ast::{
    Argument, AssignmentOperator, AssignmentTarget, BindingPattern, IdentifierName, TSTypeName,
};

use crate::*;

pub fn build_decorated_string<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    span: Span,
    content: &str,
) -> Expression<'alloc> {
    Expression::new_new_expression(
        span,
        Expression::new_identifier(span, "String", ast_builder),
        None,
        [Argument::new_string_literal(
            span,
            Str::from_str_in(content, ast_builder),
            None,
            ast_builder,
        )],
        ast_builder,
    )
}

pub fn build_string<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    span: Span,
    content: &str,
) -> Expression<'alloc> {
    Expression::new_string_literal(
        span,
        Str::from_str_in(content, ast_builder),
        None,
        ast_builder,
    )
}

pub fn build_undefined<'alloc>(ast_builder: &AstBuilder<'alloc>, span: Span) -> Expression<'alloc> {
    Expression::new_identifier(span, "undefined", ast_builder)
}

pub fn build_object_member_string_assignment<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    span: Span,
    object_name: &str,
    member_name: &str,
    value: Expression<'alloc>,
) -> Expression<'alloc> {
    Expression::new_assignment_expression(
        span,
        AssignmentOperator::Assign,
        AssignmentTarget::new_static_member_expression(
            span,
            build_identifier(ast_builder, span, object_name),
            IdentifierName::new(span, Ident::from_str_in(member_name, ast_builder), ast_builder),
            false,
            ast_builder,
        ),
        value,
        ast_builder,
    )
}

pub fn build_identifier<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    span: Span,
    name: &str,
) -> Expression<'alloc> {
    Expression::new_identifier(span, Ident::from_str_in(name, ast_builder), ast_builder)
}

/// e.g. `N.B` of `import A = N.B`
pub fn build_ts_type_name_expression<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    name: &TSTypeName<'alloc>,
) -> Expression<'alloc> {
    match name {
        TSTypeName::IdentifierReference(ident) => {
            Expression::Identifier(ident.clone_in(ast_builder.allocator()))
        }
        TSTypeName::QualifiedName(name) => Expression::new_static_member_expression(
            name.span,
            build_ts_type_name_expression(ast_builder, &name.left),
            name.right.clone_in(ast_builder.allocator()),
            false,
            ast_builder,
        ),
        TSTypeName::ThisExpression(this) => Expression::new_this_expression(this.span, ast_builder),
    }
}

#[allow(dead_code)]
pub fn build_assignment<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    span: Span,
    variable_name: &str,
    value: Expression<'alloc>,
) -> Expression<'alloc> {
    Expression::new_assignment_expression(
        span,
        AssignmentOperator::Assign,
        AssignmentTarget::new_assignment_target_identifier(
            span,
            Ident::from_str_in(variable_name, ast_builder),
            ast_builder,
        ),
        value,
        ast_builder,
    )
}

pub fn build_variable_declarator<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    span: Span,
    variable_name: &str,
    value: Expression<'alloc>,
) -> VariableDeclarator<'alloc> {
    VariableDeclarator::new(
        span,
        BindingPattern::new_binding_identifier(
            span,
            Ident::from_str_in(variable_name, ast_builder),
            ast_builder,
        ),
        None,
        Some(value),
        false,
        ast_builder,
    )
}

pub fn build_variable_declarator_pattern<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    span: Span,
    variable_pattern: BindingPattern<'alloc>,
    value: Expression<'alloc>,
) -> VariableDeclarator<'alloc> {
    VariableDeclarator::new(span, variable_pattern, None, Some(value), false, ast_builder)
}

pub fn build_variable_declaration_ident<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    span: Span,
    kind: VariableDeclarationKind,
    variable_name: &str,
    identifier: &str,
) -> Statement<'alloc> {
    Statement::new_variable_declaration(
        span,
        kind,
        [build_variable_declarator(
            ast_builder,
            span,
            variable_name,
            build_identifier(ast_builder, span, identifier),
        )],
        false,
        ast_builder,
    )
}
