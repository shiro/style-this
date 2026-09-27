use crate::compiler::evaluate_program;

pub use crate::compiler::{TransformError, Transformer};
use crate::*;
use oxc_allocator::Allocator;
use oxc_ast::AstBuilder;
use oxc_parser::{ParseOptions, Parser};
use oxc_span::SourceType;
use std::cell::RefCell;
use std::collections::HashSet;
use std::rc::Rc;
use wasm_bindgen_futures::spawn_local;

#[wasm_bindgen]
impl Transformer {
    pub async fn transform(
        &self,
        code: String,
        filepath: String,
        skip_css_eval: bool,
    ) -> Result<Option<JsValue>, TransformError> {
        // Clear old import registrations before re-transforming
        // BUT only if we're going to re-evaluate (skip_css_eval = false)
        // If we skip evaluation, we won't re-register imports, so we must keep the old ones
        if !skip_css_eval {
            self.cache_registry
                .dependency_tracker()
                .borrow()
                .clear_file_imports(&filepath);
        }
        
        let _self = self.clone();
        let (tx, rx) = futures::channel::oneshot::channel();

        spawn_local(async move {
            let allocator = Allocator::default();
            let ast_builder = AstBuilder::new(&allocator);
            let temporary_programs = Rc::new(RefCell::new(Default::default()));

            let Ok(source_type) = SourceType::from_path(&filepath) else {
                let _ = tx.send(Err(TransformError::UknownExtension {
                    filepath: filepath.clone(),
                    row: 1,
                    column: 1,
                }));
                return;
            };

            let mut ast = Parser::new(&allocator, &code, source_type)
                .with_options(ParseOptions {
                    parse_regular_expression: true,
                    ..ParseOptions::default()
                })
                .parse();

            if ast.panicked {
                let _ = tx.send(Err(TransformError::RawParseFailed {
                    filepath,
                    message: ast.errors.first().unwrap().message.to_string(),
                    row: 1,
                    column: 1,
                }));
                return;
            }

            evaluate_program(
                &ast_builder,
                &_self,
                true,
                &_self.cwd,
                filepath.clone(),
                None,
                &code,
                &mut ast.program,
                HashSet::new(),
                temporary_programs.clone(),
                Some(tx),
                skip_css_eval,
            )
            .await;
        });

        rx.await.unwrap()
    }
}
