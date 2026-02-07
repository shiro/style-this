use crate::*;

pub fn resolve_err(
    allocator: &oxc_allocator::Allocator,
    err: &JsValue,
    program_filepath: &str,
    source_program: &str,
    source_ast: &Program<'_>,
    eval_program: &str,
) {
    use itertools::Itertools;

    let eval_ast = Parser::new(allocator, &eval_program, SourceType::default())
        .with_options(ParseOptions {
            parse_regular_expression: true,
            ..ParseOptions::default()
        })
        .parse()
        .program;

    let program_offset = eval_program
        .lines()
        .take_while_inclusive(|line| !line.contains("// start"))
        .map(|line| line.len() + 1) // also add newline char
        .sum::<usize>();

    let Some(program_start_node_idx) = get_node_idx_from_offset(&eval_ast, program_offset) else {
        return;
    };

    let regex = js_sys::RegExp::new(r"/style-this/.*/core/dist/compiler\.cjs:", "");

    let stack_lines = js_sys::Reflect::get(err, &JsValue::from_str("stack"))
        .ok()
        .and_then(|stack| stack.as_string())
        .map(|stack_str| {
            stack_str
                .lines()
                .map(|line| line.to_string())
                .collect::<Vec<String>>()
        })
        .unwrap_or_default()
        .into_iter()
        .map(|mut line| {
            if !regex.test(&line) {
                return line;
            }

            let mut it = line.trim().trim_end_matches(')').split(':').rev();
            let _: Option<_> = try {
                let col: usize = it.next()?.parse().ok()?;
                let row: usize = it.next()?.parse().ok()?;

                let error_offset = get_offset_from_pos(eval_program, row, col);

                let Some(mut node_idx) = get_node_idx_from_offset(&eval_ast, error_offset) else {
                    return None?;
                };

                // take the program preable offset into account
                node_idx -= program_start_node_idx;
                // we also undercounted the "Program" node and a "use strict" string literal node
                node_idx += 2;

                let Some((span, name)) = get_nth_node(source_ast, node_idx) else {
                    return None?;
                };
                let name = name.unwrap_or("<anonymous>".to_string());

                let (row, col) = get_pos_from_offset(source_program, span.start as usize);

                line = format!("    at {name} ({program_filepath}:{row}:{col})");
            };
            line
        })
        .collect::<Vec<String>>();

    let _ = js_sys::Reflect::set(
        err,
        &JsValue::from_str("stack"),
        &JsValue::from_str(&stack_lines.join("\n")),
    );
}

pub fn get_pos_from_offset(source: &str, offset: usize) -> (usize, usize) {
    let mut row = 1;
    let mut col = 1;

    for (i, ch) in source.char_indices() {
        if i >= offset {
            break;
        }

        if ch == '\n' {
            row += 1;
            col = 1;
        } else {
            col += 1;
        }
    }

    (row, col)
}

fn get_offset_from_pos(source: &str, target_row: usize, target_col: usize) -> usize {
    let mut row = 1;
    let mut col = 1;

    for (i, ch) in source.char_indices() {
        if row == target_row && col == target_col {
            return i;
        }

        if ch == '\n' {
            row += 1;
            col = 1;
        } else {
            col += 1;
        }
    }

    // If we reach the end of the source, return the length
    source.len()
}

fn get_node_idx_from_offset(ast: &Program, target_offset: usize) -> Option<usize> {
    struct FindVistior {
        target_offset: usize,
        node_idx: usize,
        found: Option<usize>,
    }

    impl<'a> Visit<'a> for FindVistior {
        fn enter_node(&mut self, kind: oxc_ast::AstKind<'a>) {
            let span = kind.span();
            self.node_idx += 1;

            if self.target_offset < span.start as usize || self.target_offset > span.end as usize {
                return;
            }

            self.found = Some(self.node_idx - 1);
        }
    }

    let mut visitor = FindVistior {
        target_offset,
        node_idx: 0,
        found: None,
    };
    visitor.visit_program(ast);
    visitor.found
}

fn get_nth_node(ast: &Program, node_idx: usize) -> Option<(Span, Option<String>)> {
    struct Vistior {
        node_idx: usize,
        target_node_idx: usize,
        target_node_span: Option<(Span, Option<String>)>,
        scope_name: Option<String>,
    }

    impl<'a> Visit<'a> for Vistior {
        fn enter_node(&mut self, kind: oxc_ast::AstKind<'a>) {
            if self.node_idx == self.target_node_idx {
                self.target_node_span = Some((kind.span(), self.scope_name.clone()));
            }
            self.node_idx += 1;
        }

        fn visit_variable_declarator(&mut self, it: &VariableDeclarator<'a>) {
            if let Some(init) = &it.init
                && let Expression::ArrowFunctionExpression(_) = init
                && let oxc_ast::ast::BindingPatternKind::BindingIdentifier(binding_id) = &it.id.kind
            {
                let scope_name = self.scope_name.replace(binding_id.name.to_string());
                oxc_ast_visit::walk::walk_variable_declarator(self, it);
                self.scope_name = scope_name;
                return;
            }
            oxc_ast_visit::walk::walk_variable_declarator(self, it);
        }

        fn visit_function(
            &mut self,
            it: &oxc_ast::ast::Function<'a>,
            flags: oxc_semantic::ScopeFlags,
        ) {
            let scope_name =
                std::mem::replace(&mut self.scope_name, it.name().map(|v| v.to_string()));
            oxc_ast_visit::walk::walk_function(self, it, flags);
            self.scope_name = scope_name;
        }
    }

    let mut visitor = Vistior {
        node_idx: 0,
        target_node_idx: node_idx,
        target_node_span: None,
        scope_name: None,
    };
    visitor.visit_program(ast);
    visitor.target_node_span
}
