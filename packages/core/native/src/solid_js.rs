use crate::{utils::generate_random_id, *};

#[wasm_bindgen]
pub struct SolidJsTransformer {}

#[derive(Error, Debug)]
pub enum SolidJsTransformError {
    #[error("failed to parse program from bunlder 'bundler-id:{id}'")]
    BunlderParseFailed { id: String },
    #[error("failed to parse program from file '{filepath}'")]
    RawParseFailed { filepath: String },
    #[error("failed to determine program type from extension '{filepath}'")]
    UknownExtension { filepath: String },
    #[error("failed to run program:\n{program}")]
    EvaluationFailed { program: String, cause: JsValue },
}

impl From<SolidJsTransformError> for JsValue {
    fn from(from: SolidJsTransformError) -> Self {
        let err = js_sys::Error::new(&from.to_string());

        // stack trace points to wasm wrapper, delete it
        js_sys::Reflect::set(&err, &JsValue::from_str("stack"), &JsValue::from_str("")).unwrap();

        // set cause property for variants that have one
        #[allow(clippy::single_match)]
        match &from {
            SolidJsTransformError::EvaluationFailed { cause, .. } => {
                js_sys::Reflect::set(&err, &JsValue::from_str("cause"), cause).unwrap();
            }
            _ => (),
        };

        err.into()
    }
}

#[wasm_bindgen]
impl SolidJsTransformer {
    #[wasm_bindgen(constructor)]
    #[allow(clippy::new_without_default)]
    pub fn new() -> Self {
        Self {}
    }

    pub async fn transform(
        &self,
        code: String,
        filepath: String,
    ) -> Result<Option<JsValue>, SolidJsTransformError> {
        let allocator = Allocator::default();
        let ast_builder = AstBuilder::new(&allocator);

        let source_type = SourceType::from_path(&filepath).map_err(|_| {
            SolidJsTransformError::UknownExtension {
                filepath: filepath.clone(),
            }
        })?;
        let mut ast = Parser::new(&allocator, &code, source_type)
            .with_options(ParseOptions {
                parse_regular_expression: true,
                ..ParseOptions::default()
            })
            .parse();

        if ast.panicked {
            // return Err(JsValue::from_str("failed to parse program"));
            return Err(SolidJsTransformError::BunlderParseFailed { id: filepath });
        }

        solid_js_prepass(&ast_builder, &mut ast.program, false);

        let options = CodegenOptions {
            source_map_path: Some(PathBuf::from_str(&filepath).unwrap()),
            ..Default::default()
        };
        let output_js = Codegen::new().with_options(options).build(&ast.program);

        let result = js_sys::Object::new();
        js_sys::Reflect::set(
            &result,
            &JsValue::from_str("code"),
            &JsValue::from_str(&output_js.code),
        )
        .unwrap();
        js_sys::Reflect::set(
            &result,
            &JsValue::from_str("sourcemap"),
            &JsValue::from_str(&output_js.map.unwrap().to_json_string()),
        )
        .unwrap();

        Ok(Some(result.into()))
    }
}

pub fn solid_js_prepass<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    program: &mut Program<'alloc>,
    skip_jsx: bool,
) {
    let return_early = program.body.iter().all(|import| {
        if let Statement::ImportDeclaration(import_decl) = import {
            if let Some(specifiers) = &import_decl.specifiers {
                for specifier in specifiers.iter() {
                    if import_decl.source.value != LIBRARY_SOLID_JS_IMPORT_NAME {
                        continue;
                    }

                    if let oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(spec) =
                        specifier
                    {
                        if spec.local.name == "styled" {
                            return false;
                        }
                    }
                }
            }
        }
        true
    });

    if return_early {
        return;
    }

    let mut statements_to_insert = vec![];

    for (idx, statement) in program.body.iter_mut().enumerate() {
        let variable_declaration = match statement {
            Statement::VariableDeclaration(it) => it,
            Statement::ExportNamedDeclaration(it) => {
                let Some(declaration) = &mut it.declaration else {
                    continue;
                };
                match declaration {
                    oxc_ast::ast::Declaration::VariableDeclaration(variable_declaration) => {
                        variable_declaration
                    }
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

            let Expression::StaticMemberExpression(static_member_expression) =
                &tagged_template_expression.tag
            else {
                continue;
            };

            let Expression::Identifier(object_identifier) = &static_member_expression.object else {
                continue;
            };

            if object_identifier.name != "styled" {
                continue;
            }

            let jsx_tag = static_member_expression.property.name;

            let component_variable_name = match &variable_declarator.id.kind {
                BindingPatternKind::BindingIdentifier(binding_identifier) => {
                    binding_identifier.name
                }
                _ => todo!(),
            };

            let random_suffix = generate_random_id(6);
            let class_variable_name = format!("{component_variable_name}_{random_suffix}");

            let mut simple_tagged_template_expression =
                tagged_template_expression.clone_in(ast_builder.allocator);
            simple_tagged_template_expression.tag = Expression::Identifier(
                ast_builder.alloc_identifier_reference(span, ast_builder.atom("css")),
            );

            // Substitute arrow functions with CSS variables
            let mut captured_expressions = Vec::new();
            let mut var_counter = 1;

            // Iterate through template expressions and replace arrow functions
            for expression in simple_tagged_template_expression
                .quasi
                .expressions
                .iter_mut()
            {
                if let Expression::ArrowFunctionExpression(_) = expression {
                    // Capture the original arrow function expression
                    captured_expressions.push(expression.clone_in(ast_builder.allocator));

                    // Replace with variable string (var1, var2, etc.)
                    let var_name = format!("var(--var{var_counter})");
                    *expression = Expression::StringLiteral(ast_builder.alloc_string_literal(
                        expression.span(),
                        ast_builder.atom(&var_name),
                        None,
                    ));
                    var_counter += 1;
                }
            }

            // treat the styled component like a regular css`...` definition
            if skip_jsx {
                *init = Expression::TaggedTemplateExpression(simple_tagged_template_expression);
                continue;
            };

            statements_to_insert.push((
                idx,
                Statement::VariableDeclaration(ast_builder.alloc_variable_declaration(
                    span,
                    VariableDeclarationKind::Let,
                    ast_builder.vec1(ast_builder.variable_declarator(
                        span,
                        VariableDeclarationKind::Let,
                        ast_builder.binding_pattern(
                            BindingPatternKind::BindingIdentifier(
                                ast_builder.alloc_binding_identifier(
                                    span,
                                    ast_builder.atom(&class_variable_name),
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
                )),
            ));

            // Build style attribute with captured variables and their arrow function calls
            let style_properties: Vec<_> = captured_expressions
                .iter()
                .enumerate()
                .map(|(i, arrow_fn)| {
                    let var_name = format!("--var{}", i + 1);
                    ast_builder.object_property_kind_object_property(
                        span,
                        oxc_ast::ast::PropertyKind::Init,
                        ast_builder
                            .expression_string_literal(span, ast_builder.atom(&var_name), None)
                            .into(),
                        Expression::CallExpression(
                            ast_builder.alloc_call_expression(
                                span,
                                arrow_fn.clone_in(ast_builder.allocator),
                                None as Option<oxc_allocator::Box<_>>,
                                ast_builder.vec1(
                                    Expression::StaticMemberExpression(
                                        ast_builder.alloc_static_member_expression(
                                            span,
                                            Expression::Identifier(
                                                ast_builder.alloc_identifier_reference(
                                                    span,
                                                    ast_builder.atom("props"),
                                                ),
                                            ),
                                            ast_builder.identifier_name(
                                                span,
                                                ast_builder.atom("styleProps"),
                                            ),
                                            false,
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
                Some(ast_builder.jsx_attribute_item_attribute(
                    span,
                    ast_builder.jsx_attribute_name_identifier(span, ast_builder.atom("style")),
                    Some(ast_builder.jsx_attribute_value_expression_container(
                        span,
                        JSXExpression::ObjectExpression(ast_builder.alloc_object_expression(
                            span,
                            ast_builder.vec_from_iter(style_properties),
                        )),
                    )),
                ))
            } else {
                None
            };

            // Build attributes array with conditional style attribute
            let mut attributes = vec![
                ast_builder.jsx_attribute_item_spread_attribute(
                    span,
                    Expression::Identifier(
                        ast_builder.alloc_identifier_reference(span, ast_builder.atom("props")),
                    ),
                ),
                ast_builder.jsx_attribute_item_attribute(
                    span,
                    ast_builder.jsx_attribute_name_identifier(span, ast_builder.atom("class")),
                    Some(ast_builder.jsx_attribute_value_expression_container(
                        span,
                        JSXExpression::Identifier(ast_builder.alloc_identifier_reference(
                            span,
                            ast_builder.atom(&class_variable_name),
                        )),
                    )),
                ),
            ];

            if let Some(style_attr) = style_attribute {
                attributes.push(style_attr);
            }

            let jsx_element_expression = Expression::JSXElement(ast_builder.alloc_jsx_element(
                span,
                ast_builder.alloc_jsx_opening_element(
                    span,
                    ast_builder.jsx_element_name_identifier(span, jsx_tag),
                    None as Option<oxc_allocator::Box<_>>,
                    ast_builder.vec_from_iter(attributes),
                ),
                ast_builder.vec(),
                None as Option<oxc_allocator::Box<_>>,
            ));

            let define_jsx_element_statement = Statement::VariableDeclaration(
                ast_builder.alloc_variable_declaration(
                    span,
                    VariableDeclarationKind::Let,
                    ast_builder.vec1(
                        ast_builder.variable_declarator(
                            span,
                            VariableDeclarationKind::Let,
                            ast_builder.binding_pattern(
                                BindingPatternKind::BindingIdentifier(
                                    ast_builder
                                        .alloc_binding_identifier(span, ast_builder.atom("comp")),
                                ),
                                None as Option<oxc_allocator::Box<_>>,
                                false,
                            ),
                            Some(Expression::ArrowFunctionExpression(
                                ast_builder.alloc_arrow_function_expression(
                                    span,
                                    true,
                                    false,
                                    None as Option<oxc_allocator::Box<_>>,
                                    ast_builder.alloc_formal_parameters(
                                        span,
                                        oxc_ast::ast::FormalParameterKind::ArrowFormalParameters,
                                        ast_builder.vec1(ast_builder.formal_parameter(
                                            span,
                                            ast_builder.vec(),
                                            ast_builder.binding_pattern(
                                                BindingPatternKind::BindingIdentifier(
                                                    ast_builder.alloc_binding_identifier(
                                                        span,
                                                        ast_builder.atom("props"),
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
                                    ast_builder.function_body(
                                        span,
                                        ast_builder.vec(),
                                        ast_builder.vec1(Statement::ExpressionStatement(
                                            ast_builder.alloc_expression_statement(
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

            let assign_css_statement =
                Statement::ExpressionStatement(ast_builder.alloc_expression_statement(
                    span,
                    Expression::AssignmentExpression(
                        ast_builder.alloc_assignment_expression(
                            span,
                            oxc_ast::ast::AssignmentOperator::Assign,
                            oxc_ast::ast::AssignmentTarget::StaticMemberExpression(
                                ast_builder.alloc_static_member_expression(
                                    span,
                                    Expression::Identifier(ast_builder.alloc_identifier_reference(
                                        span,
                                        ast_builder.atom("comp"),
                                    )),
                                    ast_builder.identifier_name(span, ast_builder.atom("css")),
                                    false,
                                ),
                            ),
                            Expression::StaticMemberExpression(
                                ast_builder.alloc_static_member_expression(
                                    span,
                                    Expression::Identifier(ast_builder.alloc_identifier_reference(
                                        span,
                                        ast_builder.atom(&class_variable_name),
                                    )),
                                    ast_builder.identifier_name(span, ast_builder.atom("css")),
                                    false,
                                ),
                            ),
                        ),
                    ),
                ));

            let assign_to_string_statement =
                Statement::ExpressionStatement(ast_builder.alloc_expression_statement(
                    span,
                    Expression::AssignmentExpression(
                        ast_builder.alloc_assignment_expression(
                            span,
                            oxc_ast::ast::AssignmentOperator::Assign,
                            oxc_ast::ast::AssignmentTarget::StaticMemberExpression(
                                ast_builder.alloc_static_member_expression(
                                    span,
                                    Expression::Identifier(ast_builder.alloc_identifier_reference(
                                        span,
                                        ast_builder.atom("comp"),
                                    )),
                                    ast_builder.identifier_name(span, ast_builder.atom("toString")),
                                    false,
                                ),
                            ),
                            Expression::ArrowFunctionExpression(
                                ast_builder.alloc_arrow_function_expression(
                                    span,
                                    true,
                                    false,
                                    None as Option<oxc_allocator::Box<_>>,
                                    ast_builder.alloc_formal_parameters(
                                        span,
                                        oxc_ast::ast::FormalParameterKind::ArrowFormalParameters,
                                        ast_builder.vec(),
                                        None as Option<oxc_allocator::Box<_>>,
                                    ),
                                    None as Option<oxc_allocator::Box<_>>,
                                    ast_builder.alloc_function_body(
                                        span,
                                        ast_builder.vec(),
                                        ast_builder.vec1(Statement::ExpressionStatement(
                                            ast_builder.alloc_expression_statement(
                                                span,
                                                Expression::Identifier(
                                                    ast_builder.alloc_identifier_reference(
                                                        span,
                                                        ast_builder.atom(&class_variable_name),
                                                    ),
                                                ),
                                            ),
                                        )),
                                    ),
                                ),
                            ),
                        ),
                    ),
                ));

            let return_statement = Statement::ReturnStatement(ast_builder.alloc_return_statement(
                span,
                Some(Expression::Identifier(
                    ast_builder.alloc_identifier_reference(span, ast_builder.atom("comp")),
                )),
            ));

            // build function body statements conditionally
            let mut function_body_statements = vec![define_jsx_element_statement];

            // only add assign_css_statement if there are no captured expressions
            if captured_expressions.is_empty() {
                function_body_statements.push(assign_css_statement);
            }

            function_body_statements.push(assign_to_string_statement);
            function_body_statements.push(return_statement);

            // build this schema:
            // ```.ts
            // const testStyle = css`
            //   color: white;
            // `;
            // const Test: Component<any> & { class: string } = (() => {
            //   const comp = (props: any) => {
            //     const [var1, rest] = splitProps(props, ["var1"])
            //     return <div
            //       {...rest}
            //       style={{"--var1": arrowFn(props)}}
            //       class={testStyle}
            //     />;
            //   };
            //   comp.css = testStyle.css;
            //   comp.toString = () => testStyle;
            //   return comp;
            // })()
            // TODO Object.freeze
            // ```
            *init = Expression::CallExpression(ast_builder.alloc_call_expression(
                span,
                Expression::ArrowFunctionExpression(ast_builder.alloc_arrow_function_expression(
                    span,
                    false,
                    false,
                    None as Option<oxc_allocator::Box<_>>,
                    ast_builder.alloc_formal_parameters(
                        span,
                        oxc_ast::ast::FormalParameterKind::ArrowFormalParameters,
                        ast_builder.vec(),
                        None as Option<oxc_allocator::Box<_>>,
                    ),
                    None as Option<oxc_allocator::Box<_>>,
                    ast_builder.alloc_function_body(
                        span,
                        ast_builder.vec(),
                        ast_builder.vec_from_iter(function_body_statements),
                    ),
                )),
                None as Option<oxc_allocator::Box<_>>,
                ast_builder.vec(),
                false,
            ));
        }
    }

    for (idx, statement) in statements_to_insert.into_iter().rev() {
        program.body.insert(idx, statement);
    }
}
