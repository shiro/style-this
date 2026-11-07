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
    /// * `load_file` - Overrides the transformer's `loadFile` for this transform and all of its
    /// dependency evaluations, e.g. to resolve within the calling plugin context.
    pub async fn transform(
        &self,
        code: String,
        filepath: String,
        skip_css_eval: bool,
        load_file: Option<js_sys::Function>,
    ) -> Result<Option<JsValue>, TransformError> {
        // NOTE: import registrations are never cleared, other files' evaluations register
        // imports for this file too and wouldn't re-register them due to the value cache.
        // Outdated registrations only cause unnecessary invalidations.
        let mut _self = self.clone();
        if let Some(load_file) = load_file {
            _self.load_file = load_file;
        }
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

            // entrypoints report errors through `tx` and their virtual modules
            let _ = evaluate_program(
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
