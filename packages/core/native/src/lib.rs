mod utils;
use js_sys::Array;
use std::collections::HashMap;
use std::panic;
use thiserror::Error;
use wasm_bindgen::prelude::*;

use std::collections::HashSet;
use std::path::Path;

use oxc_allocator::CloneIn;
use oxc_ast::ast::BindingPatternKind;
use oxc_ast::ast::ExportDefaultDeclarationKind;
use oxc_ast::ast::Expression;
use oxc_ast::ast::Program;
use oxc_ast::ast::PropertyKey;
use oxc_ast::ast::TaggedTemplateExpression;
use oxc_ast::ast::VariableDeclarationKind;
use oxc_ast::ast::WithClause;
use oxc_ast_visit::Visit;
use oxc_span::GetSpan;
use oxc_span::Span;

const PREFIX: &str = "__styleThis";
const LIBRARY_IMPORT_NAME: &str = "@style-this/core";

#[derive(Error, Debug)]
pub enum TransformError {
    #[error("failed to parse program from bunlder 'bundler-id:{id}'")]
    BunlderParseFailed { id: String },
    #[error("failed to parse program from file '{filepath}'")]
    RawParseFailed { filepath: String },
    #[error("failed to determine program type from extension '{filepath}'")]
    UknownExtension { filepath: String },
    #[error("failed to run program:\n{program}")]
    EvaluationFailed { program: String, cause: JsValue },
    #[error("failed to read file '{filepath}'")]
    ReadFileError { filepath: String, cause: JsValue },
}

impl From<TransformError> for JsValue {
    fn from(from: TransformError) -> Self {
        let err = js_sys::Error::new(&from.to_string());

        // stack trace points to wasm wrapper, delete it
        js_sys::Reflect::set(&err, &JsValue::from_str("stack"), &JsValue::from_str("")).unwrap();

        // set cause property for variants that have one
        match &from {
            TransformError::EvaluationFailed { cause, .. }
            | TransformError::ReadFileError { cause, .. } => {
                js_sys::Reflect::set(&err, &JsValue::from_str("cause"), cause).unwrap();
            }
            _ => (),
        };

        err.into()
    }
}

use oxc_allocator::Allocator;
use oxc_allocator::Box;
use oxc_ast::{
    ast::{ImportOrExportKind, Statement},
    AstBuilder,
};
use oxc_codegen::{Codegen, CodegenOptions};
use oxc_parser::{ParseOptions, Parser};
use oxc_span::SourceType;

fn binding_pattern_kind_get_idents<'a>(kind: &BindingPatternKind<'a>) -> HashSet<String> {
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

fn expression_get_references<'a>(expression: &Expression<'a>) -> Vec<String> {
    #[derive(Default)]
    struct Visitor {
        pub references: Vec<String>,
        pub scopes_references: Vec<HashSet<String>>,
    }

    use oxc_syntax::scope::{ScopeFlags, ScopeId};
    impl<'a> Visit<'a> for Visitor {
        fn enter_scope(
            &mut self,
            _flags: ScopeFlags,
            _scope_id: &std::cell::Cell<Option<ScopeId>>,
        ) {
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
        }
        fn visit_formal_parameter(&mut self, it: &oxc_ast::ast::FormalParameter<'a>) {
            let Some(scope) = self.scopes_references.last_mut() else {
                return;
            };
            scope.extend(binding_pattern_kind_get_idents(&it.pattern.kind));
        }
        fn visit_identifier_reference(&mut self, it: &oxc_ast::ast::IdentifierReference<'a>) {
            let variable_name = it.name.to_string();
            for scope in self.scopes_references.iter() {
                if scope.contains(&variable_name) {
                    return;
                }
            }
            self.references.push(variable_name);
        }
    }

    let mut visitor = Visitor {
        ..Default::default()
    };
    visitor.visit_expression(expression);

    visitor.references
}

#[wasm_bindgen]
pub struct Transformer {
    load_file: js_sys::Function,
    css_file_store_ref: String,
    export_cache_ref: String,
    css_extension: String,
}

fn generate_random_id(length: usize) -> String {
    (0..length)
        .map(|_| {
            let chars = b"abcdefghijklmnopqrstuvwxyz0123456789";
            let idx = (js_sys::Math::random() * chars.len() as f64) as usize;
            chars[idx] as char
        })
        .collect()
}

#[wasm_bindgen]
pub fn initialize(opts: JsValue) -> Transformer {
    utils::set_panic_hook();

    let global = js_sys::global();

    let load_file = js_sys::Reflect::get(&opts, &JsValue::from_str("loadFile"))
        .unwrap()
        .dyn_into::<js_sys::Function>()
        .unwrap();

    let css_extension = js_sys::Reflect::get(&opts, &JsValue::from_str("cssExtension"))
        .unwrap()
        .as_string()
        .unwrap();

    let css_file_store_ref = format!("{PREFIX}{}", generate_random_id(8));
    let css_file_store = js_sys::Reflect::get(&opts, &JsValue::from_str("cssFileStore")).unwrap();
    js_sys::Reflect::set(
        &global,
        &JsValue::from_str(&css_file_store_ref),
        &css_file_store,
    )
    .unwrap();

    let export_cache_ref = format!("{PREFIX}{}", generate_random_id(8));
    js_sys::Reflect::set(
        &global,
        &JsValue::from_str(&export_cache_ref),
        &js_sys::Object::new(),
    )
    .unwrap();

    Transformer {
        load_file,
        css_file_store_ref,
        export_cache_ref,
        css_extension,
    }
}

#[wasm_bindgen]
impl Transformer {
    /// loads file contents and id
    async fn load_file(&self, id: &str) -> Result<(String, String), TransformError> {
        let promise = self
            .load_file
            .call1(&JsValue::UNDEFINED, &JsValue::from_str(id))
            .unwrap();
        let future = wasm_bindgen_futures::JsFuture::from(js_sys::Promise::from(promise));
        let ret = future
            .await
            .map_err(|cause| TransformError::ReadFileError {
                filepath: id.to_string(),
                cause,
            })?;

        let arr = Array::from(&ret);
        let mut arr = arr
            .into_iter()
            .map(|v| v.as_string().unwrap())
            .collect::<Vec<String>>();

        let filepath = arr.remove(0);
        let code = arr.remove(0);

        Ok((filepath, code))
    }
}

pub fn transpile_ts_to_js<'a>(allocator: &'a Allocator, program: &mut Program<'a>) {
    use oxc_semantic::SemanticBuilder;
    use oxc_transformer::TransformOptions;
    use oxc_transformer::Transformer;

    let ret = SemanticBuilder::new().build(program);
    let scoping = ret.semantic.into_scoping();
    let t = Transformer::new(
        allocator,
        Path::new("test.tsx"),
        &TransformOptions::default(),
    );
    t.build_with_scoping(scoping, program);
}

fn transform_tagged_literal(
    tagged_template_expression: &mut TaggedTemplateExpression,
    raw_program: &str,
    variable_name: &str,
    referenced_idents: &mut HashSet<String>,
    css_content_parts: &mut Vec<String>,
    css_content_insert_expressions: &mut Vec<(usize, String)>,
) -> String {
    let oxc_ast::ast::TemplateLiteral {
        quasis,
        expressions,
        ..
    } = &mut tagged_template_expression.quasi;

    let random_suffix = generate_random_id(6);
    let class_name = format!("{variable_name}-{random_suffix}");
    css_content_parts.push(format!(".{class_name} {{"));

    loop {
        let l = quasis.first();
        let r = expressions.first();

        // string part is next
        if (l.is_some() && r.is_none())
            || (l.is_some() && r.is_some() && l.unwrap().span.start < r.unwrap().span().start)
        {
            let current = quasis.remove(0);
            let text_part = &current.value.cooked.unwrap_or(current.value.raw);
            css_content_parts.push(text_part.to_string());
            continue;
        }

        // expression part is next
        if (l.is_none() && r.is_some())
            || (l.is_some() && r.is_some() && l.unwrap().span.start > r.unwrap().span().start)
        {
            let current = expressions.remove(0);
            let expression_text = raw_program
                [(current.span().start as usize)..(current.span().end as usize)]
                .to_string();
            referenced_idents.extend(expression_get_references(&current));
            css_content_insert_expressions.push((css_content_parts.len(), expression_text));
            continue;
        }

        break;
    }

    css_content_parts.push("}\n".to_string());

    class_name
}

pub async fn evaluate_program<'alloc>(
    allocator: &'alloc Allocator,
    transformer: &Transformer,
    entrypoint: bool,
    program_path: &String,
    raw_program: &str,
    program: &mut Program<'alloc>,
    mut referenced_idents: HashSet<String>,
) -> Result<(), TransformError> {
    // find "css" import or quit early if entrypoint
    let return_early = entrypoint
        && program.body.iter().all(|import| {
            if let Statement::ImportDeclaration(import_decl) = import {
                if let Some(specifiers) = &import_decl.specifiers {
                    for specifier in specifiers.iter() {
                        if import_decl.source.value != LIBRARY_IMPORT_NAME {
                            continue;
                        }

                        if let oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(spec) =
                            specifier
                        {
                            if spec.local.name == "css" {
                                return false;
                            }
                        }
                    }
                }
            }
            true
        });
    if return_early {
        return Ok(());
    }

    let ast_builder = AstBuilder::new(allocator);
    let mut css_content_parts = vec![];
    let mut css_content_insert_expressions = vec![];
    let mut imports = HashMap::new();
    let mut exports = HashSet::new();

    let cache_ref = &transformer.export_cache_ref;
    let store = format!("{cache_ref}[\"{program_path}\"]");

    let n = ast_builder.alloc_import_declaration::<Option<Box<WithClause>>>(
        program.span,
        None,
        ast_builder.string_literal(
            program.span,
            ast_builder.atom(&format!(
                "virtual:style-this:{program_path}.{}",
                transformer.css_extension
            )),
            None,
        ),
        None,
        None,
        ImportOrExportKind::Value,
    );

    program.body.insert(0, Statement::ImportDeclaration(n));

    // transform all css`...` expresisons into classname strings
    let mut expr_counter = 0u32;

    for stmt in program.body.iter_mut() {
        let variable_declaration = match stmt {
            Statement::VariableDeclaration(it) => it,
            Statement::ExportNamedDeclaration(it) => {
                let Some(declaration) = &mut it.declaration else {
                    continue;
                };
                match declaration {
                    oxc_ast::ast::Declaration::VariableDeclaration(variable_declaration) => {
                        variable_declaration
                    }
                    // TODO functions
                    // TODO class
                    _ => continue,
                }
            }
            _ => continue,
        };

        for variable_declarator in variable_declaration.declarations.iter_mut().rev() {
            let span = variable_declarator.span;
            let Some(init) = &mut variable_declarator.init else {
                continue;
            };

            let Expression::TaggedTemplateExpression(tagged_template_expression) = init else {
                continue;
            };

            let Expression::Identifier(identifier) = &mut tagged_template_expression.tag else {
                continue;
            };

            if identifier.name != "css" {
                continue;
            };

            let BindingPatternKind::BindingIdentifier(variable_name) = &variable_declarator.id.kind
            else {
                panic!("css variable declaration was not a regular variable declaration")
            };

            expr_counter += 1;
            let idx = expr_counter;

            let class_name = entrypoint
                .then(|| {
                    js_sys::eval(&format!("{store}?.__css_{idx}"))
                        .unwrap()
                        .as_string()
                })
                .flatten()
                .unwrap_or_else(|| {
                    let class_name = transform_tagged_literal(
                        tagged_template_expression,
                        raw_program,
                        &variable_name.name,
                        &mut referenced_idents,
                        &mut css_content_parts,
                        &mut css_content_insert_expressions,
                    );
                    js_sys::eval(&format!(
                        "{store} = {{...({store} ?? {{}}), __css_{idx}: \"{class_name}\"}};",
                    ))
                    .unwrap();
                    class_name
                });

            // if the right side references any idents, add them
            referenced_idents.extend(expression_get_references(init));

            *init = Expression::StringLiteral(ast_builder.alloc_string_literal(
                span,
                ast_builder.atom(&class_name),
                None,
            ));
        }
    }

    // build a new minimal program
    let mut tmp_program = build_new_ast(allocator);
    for stmt in program.body.iter().rev() {
        match stmt {
            Statement::ImportDeclaration(import_declaration) => {
                let module_id = import_declaration.source.value.to_string();
                let Some(specifiers) = import_declaration.specifiers.clone_in(allocator) else {
                    continue;
                };

                // ignore imports from this library
                if import_declaration.source.value == LIBRARY_IMPORT_NAME {
                    continue;
                }

                let entry = imports.entry(module_id.clone()).or_insert_with(Vec::new);
                entry.extend(specifiers);
            }
            _ => {
                let mut exported = false;
                let variable_declaration = match stmt {
                    Statement::ExportNamedDeclaration(export_named_declaration) => {
                        let Some(declaration) = &export_named_declaration.declaration else {
                            continue;
                        };
                        exported = true;
                        match declaration {
                            oxc_ast::ast::Declaration::VariableDeclaration(
                                variable_declaration,
                            ) => Some(variable_declaration.clone_in(allocator)),
                            // TODO functions
                            // TODO class
                            _ => continue,
                        }
                    }
                    Statement::ExportDefaultDeclaration(export_default_declaration) => {
                        exported = true;
                        match &export_default_declaration.declaration {
                            ExportDefaultDeclarationKind::Identifier(identifier) => {
                                let span = export_default_declaration.span;

                                // pretend the default export is actually a variable declaration
                                // for our meta variable
                                let variable_declaration = ast_builder.alloc_variable_declaration(
                                    span,
                                    VariableDeclarationKind::Const,
                                    ast_builder.vec1(ast_builder.variable_declarator(
                                        span,
                                        VariableDeclarationKind::Const,
                                        ast_builder.binding_pattern(
                                            BindingPatternKind::BindingIdentifier(
                                                ast_builder.alloc_binding_identifier(
                                                    span,
                                                    ast_builder.atom("__global__export__"),
                                                ),
                                            ),
                                            None as Option<oxc_allocator::Box<_>>,
                                            false,
                                        ),
                                        Some(Expression::Identifier(
                                            ast_builder.alloc_identifier_reference(
                                                span,
                                                ast_builder.atom(&identifier.name),
                                            ),
                                        )),
                                        false,
                                    )),
                                    false,
                                );
                                Some(variable_declaration)
                            }
                            ExportDefaultDeclarationKind::CallExpression(call_expression) => {
                                let span = call_expression.span;

                                // pretend the default export is actually a variable declaration
                                // for our meta variable
                                let variable_declaration = ast_builder.alloc_variable_declaration(
                                    span,
                                    VariableDeclarationKind::Let,
                                    ast_builder.vec1(ast_builder.variable_declarator(
                                        span,
                                        VariableDeclarationKind::Let,
                                        ast_builder.binding_pattern(
                                            BindingPatternKind::BindingIdentifier(
                                                ast_builder.alloc_binding_identifier(
                                                    span,
                                                    ast_builder.atom("__global__export__"),
                                                ),
                                            ),
                                            None as Option<oxc_allocator::Box<_>>,
                                            false,
                                        ),
                                        Some(Expression::CallExpression(
                                            call_expression.clone_in(allocator),
                                        )),
                                        false,
                                    )),
                                    false,
                                );
                                Some(variable_declaration)
                            }
                            ExportDefaultDeclarationKind::FunctionDeclaration(
                                _function_declaration,
                            ) => {
                                // TODO
                                continue;
                            }
                            _ => continue,
                        }
                    }
                    Statement::VariableDeclaration(variable_declaration) => {
                        Some(variable_declaration.clone_in(allocator))
                    }
                    _ => None,
                };
                if let Some(variable_declaration) = variable_declaration {
                    for variable_declarator in variable_declaration.declarations.iter().rev() {
                        let Some(init) = &variable_declarator.init else {
                            continue;
                        };
                        let variable_declarator = variable_declarator.clone_in(allocator);

                        let idents = binding_pattern_kind_get_idents(&variable_declarator.id.kind);
                        if !idents.iter().any(|ident| referenced_idents.contains(ident)) {
                            continue;
                        }

                        let all_cached = idents.iter().all(|ident| {
                            js_sys::eval(&format!("{store}?.hasOwnProperty('{ident}')",))
                                .unwrap()
                                .is_truthy()
                        });

                        if all_cached {
                            // if cached, grab from cache
                            for ident in idents.iter() {
                                if !referenced_idents.contains(ident) {
                                    continue;
                                }
                                let variable_declaration = Statement::VariableDeclaration(
                                    ast_builder.alloc_variable_declaration(
                                        variable_declarator.span,
                                        VariableDeclarationKind::Let,
                                        ast_builder.vec1(
                                            ast_builder.variable_declarator(
                                                variable_declarator.span,
                                                VariableDeclarationKind::Const,
                                                ast_builder.binding_pattern(
                                                    BindingPatternKind::BindingIdentifier(
                                                        ast_builder.alloc_binding_identifier(
                                                            variable_declarator.span,
                                                            ast_builder.atom(ident),
                                                        ),
                                                    ),
                                                    None as Option<oxc_allocator::Box<_>>,
                                                    false,
                                                ),
                                                Some(Expression::Identifier(
                                                    ast_builder.alloc_identifier_reference(
                                                        variable_declarator.span,
                                                        ast_builder
                                                            .atom(&format!("{store}['{ident}']")),
                                                    ),
                                                )),
                                                false,
                                            ),
                                        ),
                                        false,
                                    ),
                                );
                                tmp_program.program.body.insert(0, variable_declaration);
                            }

                            continue;
                        }

                        if exported {
                            exports.extend(
                                idents
                                    .iter()
                                    .filter(|ident| referenced_idents.contains(*ident))
                                    .cloned()
                                    .collect::<HashSet<String>>(),
                            );
                        }

                        // copy the entire variable declaration verbatim
                        tmp_program.program.body.insert(
                            0,
                            Statement::VariableDeclaration(ast_builder.alloc_variable_declaration(
                                variable_declarator.span,
                                VariableDeclarationKind::Let,
                                ast_builder.vec1(variable_declarator.clone_in(allocator)),
                                false,
                            )),
                        );

                        // if the right side references any idents, add them
                        referenced_idents.extend(expression_get_references(init));
                    }
                }
            }
        }
    }

    // handle imports - resolve other modules and rewrite return values into variable declarations
    for (remote_module_id, specifiers) in imports.iter() {
        let mut remote_referenced_idents = HashSet::new();

        let any_ident_referenced = specifiers.iter().any(|specifier| {
            let local_name = match specifier {
                oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(import_specifier) => {
                    import_specifier.local.name.as_str()
                }
                oxc_ast::ast::ImportDeclarationSpecifier::ImportDefaultSpecifier(
                    import_default_specifier,
                ) => import_default_specifier.local.name.as_str(),
                oxc_ast::ast::ImportDeclarationSpecifier::ImportNamespaceSpecifier(
                    _import_namespace_specifier,
                ) => "", // TODO import_namespace_specifier.local.name.to_string(),
            };
            referenced_idents.contains(local_name)
        });

        if !any_ident_referenced {
            continue;
        }

        let (remote_filepath, code) = transformer.load_file(remote_module_id).await?;

        fn make_require<'a>(
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
                    Some(
                        Expression::CallExpression(
                            ast_builder.alloc_call_expression(
                                span,
                                Expression::Identifier(
                                    ast_builder.alloc_identifier_reference(
                                        span,
                                        ast_builder.atom("require"),
                                    ),
                                ),
                                None as Option<oxc_allocator::Box<_>>,
                                ast_builder.vec1(oxc_ast::ast::Argument::StringLiteral(
                                    ast_builder.alloc_string_literal(
                                        span,
                                        ast_builder.atom(source),
                                        None,
                                    ),
                                )),
                                false,
                            ),
                        ),
                    ),
                    false,
                )),
                false,
            ))
        }

        for specifier in specifiers.iter() {
            let (local_name, remote_name, span) = match specifier {
                oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(import_specifier) => {
                    let remote_name = import_specifier.imported.to_string();
                    // here we are looking at what the other file referenced
                    if !referenced_idents.contains(&remote_name) {
                        continue;
                    }

                    let local_name = import_specifier.local.name.to_string();
                    let span = import_specifier.span;

                    if code.is_empty() {
                        tmp_program.program.body.insert(
                            0,
                            make_require(
                                &ast_builder,
                                BindingPatternKind::ObjectPattern(
                                    ast_builder.alloc_object_pattern(
                                        span,
                                        ast_builder.vec1(
                                            ast_builder.binding_property(
                                                span,
                                                PropertyKey::StaticIdentifier(
                                                    ast_builder.alloc_identifier_name(
                                                        span,
                                                        ast_builder.atom(&local_name),
                                                    ),
                                                ),
                                                ast_builder.binding_pattern(
                                                    ast_builder
                                                        .binding_pattern_kind_binding_identifier(
                                                            span,
                                                            ast_builder.atom(&local_name),
                                                        ),
                                                    None as Option<oxc_allocator::Box<_>>,
                                                    false,
                                                ),
                                                true,
                                                false,
                                            ),
                                        ),
                                        None as Option<oxc_allocator::Box<_>>,
                                    ),
                                ),
                                &remote_filepath,
                                span,
                            ),
                        );
                        continue;
                    }

                    (local_name, remote_name, import_specifier.span)
                }
                oxc_ast::ast::ImportDeclarationSpecifier::ImportDefaultSpecifier(
                    import_default_specifier,
                ) => {
                    let local_name = import_default_specifier.local.name.to_string();
                    if !referenced_idents.contains(&local_name) {
                        continue;
                    }

                    let span = import_default_specifier.span;

                    if code.is_empty() {
                        tmp_program.program.body.insert(
                            0,
                            make_require(
                                &ast_builder,
                                BindingPatternKind::ObjectPattern(
                                    ast_builder.alloc_object_pattern(
                                        span,
                                        ast_builder.vec1(
                                            ast_builder.binding_property(
                                                span,
                                                PropertyKey::StaticIdentifier(
                                                    ast_builder.alloc_identifier_name(
                                                        span,
                                                        ast_builder.atom("default"),
                                                    ),
                                                ),
                                                ast_builder.binding_pattern(
                                                    ast_builder
                                                        .binding_pattern_kind_binding_identifier(
                                                            span,
                                                            ast_builder.atom(&local_name),
                                                        ),
                                                    None as Option<oxc_allocator::Box<_>>,
                                                    false,
                                                ),
                                                true,
                                                false,
                                            ),
                                        ),
                                        None as Option<oxc_allocator::Box<_>>,
                                    ),
                                ),
                                &remote_filepath,
                                span,
                            ),
                        );
                        continue;
                    }

                    (
                        local_name,
                        "__global__export__".to_string(),
                        import_default_specifier.span,
                    )
                }
                oxc_ast::ast::ImportDeclarationSpecifier::ImportNamespaceSpecifier(
                    _import_namespace_specifier,
                ) => {
                    // TODO
                    continue;
                }
            };

            // add new variable declaration to our tmp program
            let variable_declaration =
                Statement::VariableDeclaration(ast_builder.alloc_variable_declaration(
                    span,
                    VariableDeclarationKind::Const,
                    ast_builder.vec1(
                        ast_builder.variable_declarator(
                            span,
                            VariableDeclarationKind::Const,
                            ast_builder.binding_pattern(
                                BindingPatternKind::BindingIdentifier(
                                    ast_builder.alloc_binding_identifier(
                                        span,
                                        ast_builder.atom(&local_name),
                                    ),
                                ),
                                None as Option<oxc_allocator::Box<_>>,
                                false,
                            ),
                            Some(Expression::Identifier(
                                ast_builder.alloc_identifier_reference(
                                    span,
                                    ast_builder.atom(&format!(
                                        "{cache_ref}[\"{remote_filepath}\"][\"{remote_name}\"]"
                                    )),
                                ),
                            )),
                            false,
                        ),
                    ),
                    false,
                ));
            tmp_program.program.body.insert(0, variable_declaration);
            remote_referenced_idents.insert(remote_name);
        }

        // if nothing referenced, nothing to do
        if remote_referenced_idents.is_empty() {
            continue;
        }

        let source_type = SourceType::from_path(&remote_filepath).map_err(|_| {
            TransformError::UknownExtension {
                filepath: remote_filepath.clone(),
            }
        })?;

        let mut ast = Parser::new(allocator, &code, source_type)
            .with_options(ParseOptions {
                parse_regular_expression: true,
                ..ParseOptions::default()
            })
            .parse();
        if ast.panicked {
            return Err(TransformError::RawParseFailed {
                filepath: remote_filepath,
            });
        }
        transpile_ts_to_js(allocator, &mut ast.program);

        let cache_ref = &transformer.export_cache_ref;
        let store = format!("{cache_ref}[\"{remote_filepath}\"]");
        let all_cached = remote_referenced_idents.iter().all(|ident| {
            js_sys::eval(&format!("{store}?.hasOwnProperty('{ident}')",))
                .unwrap()
                .is_truthy()
        });

        if all_cached {
            continue;
        }

        std::boxed::Box::pin(evaluate_program(
            allocator,
            transformer,
            false,
            &remote_filepath,
            &code,
            &mut ast.program,
            remote_referenced_idents,
        ))
        .await?;
    }

    let mut tmp_program_js = Codegen::new()
        .with_options(CodegenOptions::default())
        .build(&tmp_program.program)
        .code;

    // we append all exported idents we evaluated to the cache
    if !exports.is_empty() {
        tmp_program_js.push_str(&format!(
            "\n{store} = {{...({store} ?? {{}}), {}}};",
            exports.into_iter().collect::<Vec<String>>().join(","),
        ));
    }

    let css_content_expressions = css_content_insert_expressions
        .iter()
        .cloned()
        .map(|(_pos, v)| format!("  typeof ({v}) === 'function' ? ({v})() : {v}"))
        .collect::<Vec<String>>();

    // evaluate expressions
    if !css_content_expressions.is_empty() {
        tmp_program_js.push_str(&format!(
            "\nPromise.all([\n{}\n]).then((v) => v.map(String))",
            css_content_expressions.join(",\n")
        ));
    } else {
        tmp_program_js.push_str("Promise.resolve([])");
    }

    let evaluated =
        js_sys::eval(&tmp_program_js).map_err(|cause| TransformError::EvaluationFailed {
            program: tmp_program_js.clone(),
            cause,
        })?;

    let promise = js_sys::Promise::from(evaluated);
    let future = wasm_bindgen_futures::JsFuture::from(promise);
    let evaluated = future
        .await
        .map_err(|cause| TransformError::EvaluationFailed {
            program: tmp_program_js,
            cause,
        })?;

    if !entrypoint {
        return Ok(());
    }

    if !css_content_expressions.is_empty() {
        let mut resolved = Array::from(&evaluated)
            .into_iter()
            .map(|v| v.as_string().unwrap())
            .collect::<Vec<String>>();

        for (pos, _) in css_content_insert_expressions.iter().rev() {
            let value = resolved.pop().unwrap();
            css_content_parts.insert(*pos, value);
        }
    }

    // assign CSS content to global Map
    let store = &transformer.css_file_store_ref;
    let _ = js_sys::eval(&format!(
        "{store}.set('{}.{}', '{}')",
        program_path.replace("'", "\\'"),
        transformer.css_extension,
        css_content_parts
            .join("")
            .replace("'", "\\'")
            .replace("\n", "\\n")
    ));
    Ok(())
}

#[wasm_bindgen]
impl Transformer {
    pub async fn transform(
        &self,
        code: String,
        filepath: String,
    ) -> Result<String, TransformError> {
        let allocator = Allocator::default();
        let source_type =
            SourceType::from_path(&filepath).map_err(|_| TransformError::UknownExtension {
                filepath: filepath.clone(),
            })?;
        let mut ast = Parser::new(&allocator, &code, source_type)
            .with_options(ParseOptions {
                parse_regular_expression: true,
                ..ParseOptions::default()
            })
            .parse();

        if ast.panicked {
            // return Err(JsValue::from_str("failed to parse program"));
            return Err(TransformError::BunlderParseFailed { id: filepath });
        }

        // clear css export cache
        let cache_ref = &self.export_cache_ref;
        js_sys::eval(&format!(
            "global.__styleThisClearCache('{cache_ref}', '{filepath}');"
        ))
        .unwrap();

        evaluate_program(
            &allocator,
            self,
            true,
            &filepath,
            &code,
            &mut ast.program,
            HashSet::new(),
        )
        .await?;

        let output_js = Codegen::new()
            .with_options(CodegenOptions::default())
            .build(&ast.program);

        Ok(output_js.code)
    }
}

fn build_new_ast<'a>(allocator: &'a Allocator) -> oxc_parser::ParserReturn<'a> {
    let source_type = SourceType::tsx();
    let parsed = Parser::new(allocator, "", source_type)
        .with_options(ParseOptions {
            parse_regular_expression: true,
            ..ParseOptions::default()
        })
        .parse();
    parsed
}
