use crate::*;

pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

pub fn binding_pattern_kind_get_idents<'a>(kind: &BindingPatternKind<'a>) -> HashSet<String> {
    let mut idents = HashSet::new();
    match kind {
        BindingPatternKind::BindingIdentifier(binding_identifier) => {
            idents.insert(binding_identifier.name.to_string());
        }
        BindingPatternKind::ObjectPattern(object_pattern) => {
            let local_idents = object_pattern
                .properties
                .iter()
                .map(|v| binding_pattern_kind_get_idents(&v.value.kind))
                .fold(HashSet::new(), |mut acc, hashset| {
                    acc.extend(hashset);
                    acc
                });
            idents.extend(local_idents);

            if let Some(rest) = &object_pattern.rest {
                idents.extend(binding_pattern_kind_get_idents(&rest.argument.kind));
            }
        }
        BindingPatternKind::ArrayPattern(array_pattern) => {
            let local_idents = array_pattern
                .elements
                .iter()
                .filter_map(|element| element.as_ref())
                .map(|element| binding_pattern_kind_get_idents(&element.kind))
                .fold(HashSet::new(), |mut acc, hashset| {
                    acc.extend(hashset);
                    acc
                });
            idents.extend(local_idents);

            if let Some(rest) = &array_pattern.rest {
                idents.extend(binding_pattern_kind_get_idents(&rest.argument.kind));
            }
        }
        BindingPatternKind::AssignmentPattern(assignment_pattern) => {
            idents.extend(binding_pattern_kind_get_idents(
                &assignment_pattern.left.kind,
            ));
        }
    };
    idents
}

pub fn generate_random_id(length: usize) -> String {
    (0..length)
        .map(|_| {
            let chars = b"abcdefghijklmnopqrstuvwxyz0123456789";
            let idx = (js_sys::Math::random() * chars.len() as f64) as usize;
            chars[idx] as char
        })
        .collect()
}

#[derive(Default)]
struct ExpressionCollectorVisitor {
    pub references: Vec<String>,
    pub scopes_references: Vec<HashSet<String>>,
}

use oxc_ast::ast::TemplateElement;
use oxc_ast_visit::walk::walk_formal_parameter;
use oxc_ast_visit::walk::walk_identifier_reference;
use oxc_ast_visit::walk::walk_variable_declarator;
use oxc_syntax::scope::{ScopeFlags, ScopeId};

impl<'a> Visit<'a> for ExpressionCollectorVisitor {
    fn enter_scope(&mut self, _flags: ScopeFlags, _scope_id: &std::cell::Cell<Option<ScopeId>>) {
        self.scopes_references.push(HashSet::new());
    }
    fn leave_scope(&mut self) {
        self.scopes_references.pop();
    }

    fn visit_variable_declarator(&mut self, it: &oxc_ast::ast::VariableDeclarator<'a>) {
        let Some(scope) = self.scopes_references.last_mut() else {
            return;
        };
        scope.extend(binding_pattern_kind_get_idents(&it.id.kind));

        walk_variable_declarator(self, it);
    }
    fn visit_formal_parameter(&mut self, it: &oxc_ast::ast::FormalParameter<'a>) {
        let Some(scope) = self.scopes_references.last_mut() else {
            return;
        };
        scope.extend(binding_pattern_kind_get_idents(&it.pattern.kind));

        walk_formal_parameter(self, it);
    }
    fn visit_identifier_reference(&mut self, it: &oxc_ast::ast::IdentifierReference<'a>) {
        let variable_name = &it.name;
        for scope in self.scopes_references.iter() {
            if scope.contains(variable_name.as_str()) {
                return;
            }
        }
        self.references.push(variable_name.to_string());

        walk_identifier_reference(self, it);
    }
}

pub fn tagged_template_get_tag<'alloc>(
    tagged_template_expression: &mut oxc_allocator::Box<
        'alloc,
        oxc_ast::ast::TaggedTemplateExpression<'alloc>,
    >,
) -> Option<&'alloc str> {
    let Expression::Identifier(identifier) = &mut tagged_template_expression.tag else {
        return None;
    };
    Some(identifier.name.as_str())
}

pub fn expression_get_references<'a>(expression: &Expression<'a>) -> Vec<String> {
    let mut visitor = ExpressionCollectorVisitor {
        ..Default::default()
    };
    visitor.visit_expression(expression);
    visitor.references
}

pub fn tagged_template_expression_get_references<'a>(
    it: &TaggedTemplateExpression<'a>,
) -> Vec<String> {
    let mut visitor = ExpressionCollectorVisitor {
        ..Default::default()
    };
    visitor.visit_tagged_template_expression(it);
    visitor.references
}

pub fn build_new_ast<'a>(allocator: &'a Allocator) -> oxc_parser::ParserReturn<'a> {
    let source_type = SourceType::tsx();

    Parser::new(allocator, "", source_type)
        .with_options(ParseOptions {
            parse_regular_expression: true,
            ..ParseOptions::default()
        })
        .parse()
}

pub fn transpile_ts_to_js<'a>(allocator: &'a Allocator, program: &mut Program<'a>) {
    use oxc_semantic::SemanticBuilder;
    use oxc_transformer::TransformOptions;
    use oxc_transformer::Transformer;

    let ret = SemanticBuilder::new().build(program);
    let scoping = ret.semantic.into_scoping();
    let options = TransformOptions {
        env: oxc_transformer::EnvOptions {
            module: oxc_transformer::Module::CommonJS,
            ..Default::default()
        },
        ..Default::default()
    };
    let t = Transformer::new(allocator, Path::new("test.tsx"), &options);
    t.build_with_scoping(scoping, program);
}

pub fn make_require<'a>(
    ast_builder: &AstBuilder<'a>,
    binding_pattern: BindingPatternKind<'a>,
    source: &str,
    span: Span,
) -> Statement<'a> {
    Statement::VariableDeclaration(ast_builder.alloc_variable_declaration(
        span,
        VariableDeclarationKind::Let,
        ast_builder.vec1(ast_builder.variable_declarator(
            span,
            VariableDeclarationKind::Let,
            ast_builder.binding_pattern(
                binding_pattern,
                None as Option<oxc_allocator::Box<_>>,
                false,
            ),
            Some(Expression::CallExpression(
                ast_builder.alloc_call_expression(
                    span,
                    Expression::Identifier(
                        ast_builder.alloc_identifier_reference(span, ast_builder.atom("require")),
                    ),
                    None as Option<oxc_allocator::Box<_>>,
                    ast_builder.vec1(oxc_ast::ast::Argument::StringLiteral(
                        ast_builder.alloc_string_literal(span, ast_builder.atom(source), None),
                    )),
                    false,
                ),
            )),
            false,
        )),
        false,
    ))
}

struct SpanReplacer<'a, 'alloc> {
    ast_builder: Option<&'a AstBuilder<'alloc>>,
    replacement_points: Option<&'a mut HashMap<Span, Expression<'alloc>>>,
}

pub fn replace_in_expression_using_spans<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    expression: &mut Expression<'alloc>,
    replacement_points: &mut HashMap<Span, Expression<'alloc>>,
) {
    let mut t = SpanReplacer {
        ast_builder: None,
        replacement_points: None,
    };

    if replacement_points.is_empty() {
        return;
    }

    t.ast_builder = Some(ast_builder);
    t.replacement_points = Some(unsafe { std::mem::transmute(replacement_points) });

    t.visit_expression(expression);

    t.ast_builder = None;
    t.replacement_points = None;
}

impl<'a, 'alloc> VisitMut<'alloc> for SpanReplacer<'a, 'alloc> {
    fn visit_expression(&mut self, it: &mut Expression<'alloc>) {
        let span = it.span();
        if let Some(replacement) = self
            .replacement_points
            .as_deref_mut()
            .unwrap()
            .remove(&span)
        {
            let ast_builder = self.ast_builder.unwrap();

            *it = replacement.clone_in(ast_builder.allocator);
            return;
        }

        oxc_ast_visit::walk_mut::walk_expression(self, it);
    }
}

struct IdentifierReplacer<'a, 'alloc, F>
where
    F: Fn(&str) -> Option<String>,
{
    ast_builder: Option<&'a AstBuilder<'alloc>>,
    get_replacement: Option<&'a F>,
}

pub fn replace_in_expression_using_identifiers<'alloc, F>(
    ast_builder: &AstBuilder<'alloc>,
    expression: &mut Expression<'alloc>,
    get_replacement: &F,
) where
    F: Fn(&str) -> Option<String>,
{
    let mut t = IdentifierReplacer {
        ast_builder: None,
        get_replacement: None,
    };

    t.ast_builder = Some(ast_builder);
    t.get_replacement = Some(get_replacement);

    t.visit_expression(expression);

    t.ast_builder = None;
    t.get_replacement = None;
}

impl<'a, 'alloc, F> VisitMut<'alloc> for IdentifierReplacer<'a, 'alloc, F>
where
    F: Fn(&str) -> Option<String>,
{
    fn visit_identifier_reference(&mut self, it: &mut oxc_ast::ast::IdentifierReference<'alloc>) {
        if let Some(replacement) = self.get_replacement.as_ref().unwrap()(&it.name) {
            it.name = self.ast_builder.unwrap().atom(&replacement);
        }
    }

    fn visit_binding_identifier(&mut self, it: &mut oxc_ast::ast::BindingIdentifier<'alloc>) {
        if let Some(replacement) = self.get_replacement.as_ref().unwrap()(&it.name) {
            it.name = self.ast_builder.unwrap().atom(&replacement);
        }
    }

    fn visit_identifier_name(&mut self, it: &mut oxc_ast::ast::IdentifierName<'alloc>) {
        if let Some(replacement) = self.get_replacement.as_ref().unwrap()(&it.name) {
            it.name = self.ast_builder.unwrap().atom(&replacement);
        }
    }
}

pub fn trim_newlines<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    quasis: &mut oxc_allocator::Vec<'alloc, TemplateElement<'alloc>>,
) {
    if !quasis.is_empty() {
        let last_idx = quasis.len() - 1;
        let trimmed_first = quasis[0]
            .value
            .raw
            .trim_start_matches([' ', '\n', '\r', '\t']);
        quasis[0].value.raw = ast_builder.atom(trimmed_first);
        let trimmed = quasis[last_idx].value.raw.trim_end_matches(['\n']);
        quasis[last_idx].value.raw = ast_builder.atom(trimmed);
    }
}
