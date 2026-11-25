use oxc_ast::ast::BindingPattern;

use crate::*;

pub fn build_decorated_string<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    span: Span,
    content: &str,
) -> Expression<'alloc> {
    Expression::NewExpression(ast_builder.alloc_new_expression(
        span,
        Expression::Identifier(
            ast_builder.alloc_identifier_reference(span, ast_builder.atom("String")),
        ),
        None as Option<oxc_allocator::Box<_>>,
        ast_builder.vec1(oxc_ast::ast::Argument::StringLiteral(
            ast_builder.alloc_string_literal(span, ast_builder.atom(content), None),
        )),
    ))
}

pub fn build_string<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    span: Span,
    content: &str,
) -> Expression<'alloc> {
    Expression::StringLiteral(ast_builder.alloc_string_literal(
        span,
        ast_builder.atom(content),
        None,
    ))
}

pub fn build_undefined<'alloc>(ast_builder: &AstBuilder<'alloc>, span: Span) -> Expression<'alloc> {
    Expression::Identifier(
        ast_builder.alloc_identifier_reference(span, ast_builder.atom("undefined")),
    )
}

pub fn build_object_member_string_assignment<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    span: Span,
    object_name: &str,
    member_name: &str,
    value: Expression<'alloc>,
) -> Expression<'alloc> {
    Expression::AssignmentExpression(ast_builder.alloc_assignment_expression(
        span,
        oxc_ast::ast::AssignmentOperator::Assign,
        oxc_ast::ast::AssignmentTarget::StaticMemberExpression(
            ast_builder.alloc_static_member_expression(
                span,
                Expression::Identifier(
                    ast_builder.alloc_identifier_reference(span, ast_builder.atom(object_name)),
                ),
                ast_builder.identifier_name(span, ast_builder.atom(member_name)),
                false,
            ),
        ),
        value,
    ))
}

pub fn build_identifier<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    span: Span,
    name: &str,
) -> Expression<'alloc> {
    Expression::Identifier(ast_builder.alloc_identifier_reference(span, ast_builder.atom(name)))
}

/// e.g. `N.B` of `import A = N.B`
pub fn build_ts_type_name_expression<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    name: &oxc_ast::ast::TSTypeName<'alloc>,
) -> Expression<'alloc> {
    use oxc_allocator::CloneIn;
    use oxc_ast::ast::TSTypeName;

    match name {
        TSTypeName::IdentifierReference(ident) => {
            Expression::Identifier(ident.clone_in(ast_builder.allocator))
        }
        TSTypeName::QualifiedName(name) => Expression::StaticMemberExpression(
            ast_builder.alloc_static_member_expression(
                name.span,
                build_ts_type_name_expression(ast_builder, &name.left),
                name.right.clone_in(ast_builder.allocator),
                false,
            ),
        ),
        TSTypeName::ThisExpression(this) => ast_builder.expression_this(this.span),
    }
}

#[allow(dead_code)]
pub fn build_assignment<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    span: Span,
    variable_name: &str,
    value: Expression<'alloc>,
) -> Expression<'alloc> {
    Expression::AssignmentExpression(ast_builder.alloc_assignment_expression(
        span,
        oxc_ast::ast::AssignmentOperator::Assign,
        oxc_ast::ast::AssignmentTarget::AssignmentTargetIdentifier(
            ast_builder.alloc_identifier_reference(span, ast_builder.atom(variable_name)),
        ),
        value,
    ))
}

pub fn build_variable_declarator<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    span: Span,
    variable_name: &str,
    value: Expression<'alloc>,
) -> VariableDeclarator<'alloc> {
    ast_builder.variable_declarator(
        span,
        VariableDeclarationKind::Const,
        ast_builder.binding_pattern(
            BindingPatternKind::BindingIdentifier(
                ast_builder.alloc_binding_identifier(span, ast_builder.atom(variable_name)),
            ),
            None as Option<oxc_allocator::Box<_>>,
            false,
        ),
        Some(value),
        false,
    )
}

pub fn build_variable_declarator_pattern<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    span: Span,
    kind: VariableDeclarationKind,
    variable_pattern: BindingPattern<'alloc>,
    value: Expression<'alloc>,
) -> VariableDeclarator<'alloc> {
    ast_builder.variable_declarator(
        span,
        kind,
        variable_pattern,
        Some(value),
        false,
    )
}

pub fn build_variable_declaration_ident<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    span: Span,
    kind: VariableDeclarationKind,
    variable_name: &str,
    identifier: &str,
) -> Statement<'alloc> {
    Statement::VariableDeclaration(ast_builder.alloc_variable_declaration(
        span,
        kind,
        ast_builder.vec1(ast_builder.variable_declarator(
            span,
            kind,
            ast_builder.binding_pattern(
                BindingPatternKind::BindingIdentifier(
                    ast_builder.alloc_binding_identifier(span, ast_builder.atom(variable_name)),
                ),
                None as Option<oxc_allocator::Box<_>>,
                false,
            ),
            Some(Expression::Identifier(
                ast_builder.alloc_identifier_reference(span, ast_builder.atom(identifier)),
            )),
            false,
        )),
        false,
    ))
}
