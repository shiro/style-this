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

/// The source type of a transformed file, Svelte files are transformed as their (TS) script.
pub fn transformed_source_type(filepath: &str) -> Option<SourceType> {
    if filepath.ends_with(".svelte") {
        return Some(SourceType::ts());
    }
    SourceType::from_path(filepath).ok()
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

/// Name a re-exported value (`export { x } from "./b"`, `export * from "./b"`) is bound to during
/// evaluation, `span` is the span of the specifier or `export *` declaration.
pub fn reexport_local_name(span: Span) -> String {
    format!("{PREFIX}_reexport_{}", span.start)
}

pub fn export_default_declaration_to_expression<'alloc>(
    allocator: &'alloc Allocator,
    declaration: &ExportDefaultDeclarationKind<'alloc>,
) -> Expression<'alloc> {
    match declaration.clone_in(allocator) {
        ExportDefaultDeclarationKind::BooleanLiteral(it) => Expression::BooleanLiteral(it),
        ExportDefaultDeclarationKind::NullLiteral(it) => Expression::NullLiteral(it),
        ExportDefaultDeclarationKind::NumericLiteral(it) => Expression::NumericLiteral(it),
        ExportDefaultDeclarationKind::BigIntLiteral(it) => Expression::BigIntLiteral(it),
        ExportDefaultDeclarationKind::RegExpLiteral(it) => Expression::RegExpLiteral(it),
        ExportDefaultDeclarationKind::StringLiteral(it) => Expression::StringLiteral(it),
        ExportDefaultDeclarationKind::TemplateLiteral(it) => Expression::TemplateLiteral(it),
        ExportDefaultDeclarationKind::Identifier(it) => Expression::Identifier(it),
        ExportDefaultDeclarationKind::MetaProperty(it) => Expression::MetaProperty(it),
        ExportDefaultDeclarationKind::Super(it) => Expression::Super(it),
        ExportDefaultDeclarationKind::ArrayExpression(it) => Expression::ArrayExpression(it),
        ExportDefaultDeclarationKind::ArrowFunctionExpression(it) => {
            Expression::ArrowFunctionExpression(it)
        }
        ExportDefaultDeclarationKind::AssignmentExpression(it) => {
            Expression::AssignmentExpression(it)
        }
        ExportDefaultDeclarationKind::AwaitExpression(it) => Expression::AwaitExpression(it),
        ExportDefaultDeclarationKind::BinaryExpression(it) => Expression::BinaryExpression(it),
        ExportDefaultDeclarationKind::CallExpression(it) => Expression::CallExpression(it),
        ExportDefaultDeclarationKind::ChainExpression(it) => Expression::ChainExpression(it),
        ExportDefaultDeclarationKind::ClassExpression(it) => Expression::ClassExpression(it),
        ExportDefaultDeclarationKind::ConditionalExpression(it) => {
            Expression::ConditionalExpression(it)
        }
        ExportDefaultDeclarationKind::FunctionExpression(it) => Expression::FunctionExpression(it),
        ExportDefaultDeclarationKind::ImportExpression(it) => Expression::ImportExpression(it),
        ExportDefaultDeclarationKind::LogicalExpression(it) => Expression::LogicalExpression(it),
        ExportDefaultDeclarationKind::NewExpression(it) => Expression::NewExpression(it),
        ExportDefaultDeclarationKind::ObjectExpression(it) => Expression::ObjectExpression(it),
        ExportDefaultDeclarationKind::ParenthesizedExpression(it) => {
            Expression::ParenthesizedExpression(it)
        }
        ExportDefaultDeclarationKind::SequenceExpression(it) => Expression::SequenceExpression(it),
        ExportDefaultDeclarationKind::TaggedTemplateExpression(it) => {
            Expression::TaggedTemplateExpression(it)
        }
        ExportDefaultDeclarationKind::ThisExpression(it) => Expression::ThisExpression(it),
        ExportDefaultDeclarationKind::UnaryExpression(it) => Expression::UnaryExpression(it),
        ExportDefaultDeclarationKind::UpdateExpression(it) => Expression::UpdateExpression(it),
        ExportDefaultDeclarationKind::YieldExpression(it) => Expression::YieldExpression(it),
        ExportDefaultDeclarationKind::PrivateInExpression(it) => {
            Expression::PrivateInExpression(it)
        }
        ExportDefaultDeclarationKind::JSXElement(it) => Expression::JSXElement(it),
        ExportDefaultDeclarationKind::JSXFragment(it) => Expression::JSXFragment(it),
        ExportDefaultDeclarationKind::TSAsExpression(it) => Expression::TSAsExpression(it),
        ExportDefaultDeclarationKind::TSSatisfiesExpression(it) => {
            Expression::TSSatisfiesExpression(it)
        }
        ExportDefaultDeclarationKind::TSTypeAssertion(it) => Expression::TSTypeAssertion(it),
        ExportDefaultDeclarationKind::TSNonNullExpression(it) => {
            Expression::TSNonNullExpression(it)
        }
        ExportDefaultDeclarationKind::TSInstantiationExpression(it) => {
            Expression::TSInstantiationExpression(it)
        }
        ExportDefaultDeclarationKind::V8IntrinsicExpression(it) => {
            Expression::V8IntrinsicExpression(it)
        }
        ExportDefaultDeclarationKind::ComputedMemberExpression(it) => {
            Expression::ComputedMemberExpression(it)
        }
        ExportDefaultDeclarationKind::StaticMemberExpression(it) => {
            Expression::StaticMemberExpression(it)
        }
        ExportDefaultDeclarationKind::PrivateFieldExpression(it) => {
            Expression::PrivateFieldExpression(it)
        }
        _ => unreachable!(),
    }
}

// pub fn binding_pattern_kind_build_TODO<'alloc>(
//     ast_builder: &mut AstBuilder<'alloc>,
//     span: Span,
//     kind: &BindingPatternKind<'alloc>,
// ) {
//     let mut idents = HashSet::new();
//
//     let f = ast_builder.alloc_object_expression(span, ast_builder.vec_from_iter(iter));
//
//     match kind {
//         BindingPatternKind::BindingIdentifier(binding_identifier) => {
//             // idents.insert(binding_identifier.name.to_string());
//             todo!()
//         }
//         BindingPatternKind::ObjectPattern(object_pattern) => {
//             todo!()
//         }
//         BindingPatternKind::ArrayPattern(array_pattern) => {
//             todo!()
//         }
//         BindingPatternKind::AssignmentPattern(assignment_pattern) => {
//             todo!()
//         }
//     };
// }

pub fn generate_random_id(length: usize) -> String {
    (0..length)
        .map(|_| {
            let chars = b"abcdefghijklmnopqrstuvwxyz0123456789";
            let idx = (js_sys::Math::random() * chars.len() as f64) as usize;
            chars[idx] as char
        })
        .collect()
}

impl Default for SeededRandom {
    fn default() -> Self {
        Self::new()
    }
}

pub struct SeededRandom {
    chars: &'static [u8],
}

impl SeededRandom {
    pub fn new() -> Self {
        Self {
            chars: b"abcdefghijklmnopqrstuvwxyz0123456789",
        }
    }

    pub fn random_string(&mut self, length: usize, seed: &str) -> String {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};

        let mut hasher = DefaultHasher::new();
        seed.hash(&mut hasher);
        let mut rng_state = hasher.finish();

        (0..length)
            .map(|_| {
                rng_state = rng_state.wrapping_mul(1103515245).wrapping_add(12345);
                let idx = (rng_state as usize) % self.chars.len();
                self.chars[idx] as char
            })
            .collect()
        // let mut rng: Pcg64 = Seeder::from(seed).into_rng();
        // println!("{}", rng.random::<char>());

        // // If we want to be more explicit, first we create a SipRng:
        // let hasher = SipHasher::from("a sailboat");
        // let mut hasher_rng = hasher.into_rng();
        // // (Note: hasher_rng is a full RNG and can be used directly.)
        //
        // // Now, we use hasher_rng to create a seed:
        // let mut seed: <Pcg64 as SeedableRng>::Seed = Default::default();
        // hasher_rng.fill(&mut seed);
        //
        // // And create our RNG from that seed:
        // let mut rng = Pcg64::from_seed(seed);
        // println!("{}", rng.random::<char>());

        // (0..length)
        //     .map(|_| {
        //         let idx = rng.random_range(0..self.chars.len());
        //         self.chars[idx] as char
        //     })
        //     .collect()
        // let mut hasher = Sha256::new();
        //
        // // Feed the string seed bytes into the hasher
        // hasher.update(seed.as_bytes());
        //
        // // Finalize the hash and get the resulting bytes
        // // let result_bytes = hasher.finalize();
        //
        // // Encode the bytes into a hexadecimal string for the ID
        // // You can truncate this string if a shorter ID is acceptable,
        // // but it increases the collision risk.
        // // let ret = hex::encode(result_bytes);
        //
        // // let id1 = generate_deterministic_id(seed);
        // // println!("Seed: \"{}\" -> ID: {}", seed1, id1);
        //
        // let result_bytes = hasher.finalize();
        //
        // // Convert bytes to characters using the charset
        // (0..length)
        //     .map(|i| {
        //         let byte_index = i % result_bytes.len();
        //         let char_index = (result_bytes[byte_index] as usize) % self.chars.len();
        //         self.chars[char_index] as char
        //     })
        //     .collect()

        // let result = Sha256::digest(seed);
        // let hex_string = hex::encode(result);
        //
        // let ret = hex_string.chars().take(length).collect::<String>();
        // format!("{seed}__{hex_string}")
    }
}

/// Collects the references to names not declared inside the visited node. The names the node
/// itself declares (e.g. a visited function declaration's name) count as references.
#[derive(Default)]
struct ExpressionCollectorVisitor {
    pub references: Vec<String>,
    scopes: Vec<CollectorScope>,
}

#[derive(Default)]
struct CollectorScope {
    is_var: bool,
    declared: HashSet<String>,
    /// resolved when leaving the scope, declarations below a reference still apply to it
    references: Vec<String>,
}

impl ExpressionCollectorVisitor {
    /// `var`s belong to the function, the outermost scope if the node is inside one.
    fn declare(&mut self, names: impl IntoIterator<Item = String>, var: bool) {
        let Some(last) = self.scopes.len().checked_sub(1) else {
            return;
        };
        let idx = if var {
            self.scopes.iter().rposition(|scope| scope.is_var).unwrap_or(0)
        } else {
            last
        };
        self.scopes[idx].declared.extend(names);
    }
}

use oxc_ast_visit::walk;
use oxc_syntax::scope::{ScopeFlags, ScopeId};

impl<'a> Visit<'a> for ExpressionCollectorVisitor {
    fn enter_scope(&mut self, flags: ScopeFlags, _scope_id: &std::cell::Cell<Option<ScopeId>>) {
        self.scopes.push(CollectorScope {
            is_var: flags.is_var(),
            ..Default::default()
        });
    }
    fn leave_scope(&mut self) {
        let scope = self.scopes.pop().unwrap();
        let references = scope
            .references
            .into_iter()
            .filter(|name| !scope.declared.contains(name));
        match self.scopes.last_mut() {
            Some(parent) => parent.references.extend(references),
            None => self.references.extend(references),
        }
    }

    fn visit_variable_declarator(&mut self, it: &oxc_ast::ast::VariableDeclarator<'a>) {
        self.declare(binding_pattern_kind_get_idents(&it.id.kind), it.kind.is_var());
        walk::walk_variable_declarator(self, it);
    }
    fn visit_function(&mut self, it: &oxc_ast::ast::Function<'a>, flags: ScopeFlags) {
        if it.is_declaration()
            && let Some(id) = &it.id
        {
            self.declare([id.name.to_string()], false);
        }
        walk::walk_function(self, it, flags);
    }
    fn visit_class(&mut self, it: &oxc_ast::ast::Class<'a>) {
        if it.is_declaration()
            && let Some(id) = &it.id
        {
            self.declare([id.name.to_string()], false);
        }
        walk::walk_class(self, it);
    }
    fn visit_formal_parameter(&mut self, it: &oxc_ast::ast::FormalParameter<'a>) {
        self.declare(binding_pattern_kind_get_idents(&it.pattern.kind), false);
        walk::walk_formal_parameter(self, it);
    }
    fn visit_catch_parameter(&mut self, it: &oxc_ast::ast::CatchParameter<'a>) {
        self.declare(binding_pattern_kind_get_idents(&it.pattern.kind), false);
        walk::walk_catch_parameter(self, it);
    }
    fn visit_identifier_reference(&mut self, it: &oxc_ast::ast::IdentifierReference<'a>) {
        let name = it.name.to_string();
        match self.scopes.last_mut() {
            Some(scope) => scope.references.push(name),
            None => self.references.push(name),
        }
    }
}

pub fn statement_get_references<'a>(statement: &Statement<'a>) -> Vec<String> {
    let mut visitor = ExpressionCollectorVisitor {
        ..Default::default()
    };
    visitor.visit_statement(statement);
    visitor.references
}

pub fn expression_get_references<'a>(expression: &Expression<'a>) -> Vec<String> {
    let mut visitor = ExpressionCollectorVisitor {
        ..Default::default()
    };
    visitor.visit_expression(expression);
    visitor.references
}

pub fn function_get_references<'a>(function: &oxc_ast::ast::Function<'a>) -> Vec<String> {
    let mut visitor = ExpressionCollectorVisitor {
        ..Default::default()
    };
    visitor.visit_function(function, ScopeFlags::Function);
    visitor.references
}

pub fn class_get_references<'a>(class: &oxc_ast::ast::Class<'a>) -> Vec<String> {
    let mut visitor = ExpressionCollectorVisitor {
        ..Default::default()
    };
    visitor.visit_class(class);
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

pub fn make_dynamic_import<'a>(
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
            Some(Expression::AwaitExpression(
                ast_builder.alloc_await_expression(
                    span,
                    Expression::ImportExpression(ast_builder.alloc_import_expression(
                        span,
                        Expression::StringLiteral(ast_builder.alloc_string_literal(
                            span,
                            ast_builder.atom(source),
                            None,
                        )),
                        None,
                        None,
                    )),
                ),
            )),
            false,
        )),
        false,
    ))
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

/// Escapes the quasis of a tagged template so that, re-emitted as an untagged template, they
/// evaluate to the raw text as written. Otherwise CSS escapes like `\2014` or `\f101` would be
/// interpreted as JS escapes (or be a syntax error).
pub fn escape_raw_quasis<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    quasis: &mut oxc_allocator::Vec<'alloc, TemplateElement<'alloc>>,
) {
    for quasi in quasis.iter_mut() {
        let raw = quasi.value.raw;
        if !raw.contains('\\') {
            quasi.value.cooked = Some(raw);
            continue;
        }

        let mut escaped = String::with_capacity(raw.len() + 8);
        let mut chars = raw.chars().peekable();
        while let Some(c) = chars.next() {
            if c == '\\' {
                escaped.push_str("\\\\");
                // keep `` \` `` and `\$` escaped, they can't appear unescaped in a template
                if let Some('`' | '$') = chars.peek() {
                    escaped.push('\\');
                }
            } else {
                escaped.push(c);
            }
        }

        quasi.value.cooked = Some(raw);
        quasi.value.raw = ast_builder.atom(&escaped);
    }
}

/// The replacements are kept, each copy of a declaration needs them, e.g. a nested class is
/// included on its own and as part of the function declaring it.
struct SpanReplacer<'a, 'alloc> {
    ast_builder: &'a AstBuilder<'alloc>,
    replacement_points: &'a HashMap<Span, Expression<'alloc>>,
}

pub fn replace_in_expression_using_spans<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    expression: &mut Expression<'alloc>,
    replacement_points: &HashMap<Span, Expression<'alloc>>,
) {
    if replacement_points.is_empty() {
        return;
    }

    SpanReplacer {
        ast_builder,
        replacement_points,
    }
    .visit_expression(expression);
}

pub fn replace_in_function_using_spans<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    function: &mut oxc_ast::ast::Function<'alloc>,
    replacement_points: &HashMap<Span, Expression<'alloc>>,
) {
    if replacement_points.is_empty() {
        return;
    }

    SpanReplacer {
        ast_builder,
        replacement_points,
    }
    .visit_function(function, ScopeFlags::Function);
}

pub fn replace_in_class_body_using_spans<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    class_body: &mut ClassBody<'alloc>,
    replacement_points: &HashMap<Span, Expression<'alloc>>,
) {
    if replacement_points.is_empty() {
        return;
    }

    SpanReplacer {
        ast_builder,
        replacement_points,
    }
    .visit_class_body(class_body);
}

impl<'a, 'alloc> VisitMut<'alloc> for SpanReplacer<'a, 'alloc> {
    fn visit_expression(&mut self, it: &mut Expression<'alloc>) {
        if let Some(replacement) = self.replacement_points.get(&it.span()) {
            *it = replacement.clone_in(self.ast_builder.allocator);
            return;
        }

        oxc_ast_visit::walk_mut::walk_expression(self, it);
    }
}

struct IdentifierReplacer<'a, 'alloc, F>
where
    F: Fn(&str) -> Option<String>,
{
    ast_builder: &'a AstBuilder<'alloc>,
    get_replacement: &'a F,
}

pub fn replace_in_expression_using_identifiers<'alloc, F>(
    ast_builder: &AstBuilder<'alloc>,
    expression: &mut Expression<'alloc>,
    get_replacement: &F,
) where
    F: Fn(&str) -> Option<String>,
{
    IdentifierReplacer {
        ast_builder,
        get_replacement,
    }
    .visit_expression(expression);
}

pub fn replace_in_function_using_identifiers<'alloc, F>(
    ast_builder: &AstBuilder<'alloc>,
    function: &mut oxc_ast::ast::Function<'alloc>,
    get_replacement: &F,
) where
    F: Fn(&str) -> Option<String>,
{
    IdentifierReplacer {
        ast_builder,
        get_replacement,
    }
    .visit_function(function, ScopeFlags::Function);
}

pub fn replace_in_class_using_identifiers<'alloc, F>(
    ast_builder: &AstBuilder<'alloc>,
    class: &mut oxc_ast::ast::Class<'alloc>,
    get_replacement: &F,
) where
    F: Fn(&str) -> Option<String>,
{
    IdentifierReplacer {
        ast_builder,
        get_replacement,
    }
    .visit_class(class);
}

impl<'a, 'alloc, F> VisitMut<'alloc> for IdentifierReplacer<'a, 'alloc, F>
where
    F: Fn(&str) -> Option<String>,
{
    fn visit_identifier_reference(&mut self, it: &mut oxc_ast::ast::IdentifierReference<'alloc>) {
        if let Some(replacement) = (self.get_replacement)(&it.name) {
            it.name = self.ast_builder.atom(&replacement);
        }
    }

    fn visit_binding_identifier(&mut self, it: &mut oxc_ast::ast::BindingIdentifier<'alloc>) {
        if let Some(replacement) = (self.get_replacement)(&it.name) {
            it.name = self.ast_builder.atom(&replacement);
        }
    }
}
