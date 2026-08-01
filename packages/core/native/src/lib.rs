#![feature(try_blocks)]

mod utils;
use oxc_ast::ast::JSXExpression;
use std::collections::HashMap;
use wasm_bindgen::prelude::*;

use std::collections::HashSet;
use std::path::Path;

use oxc_allocator::Allocator;
use oxc_allocator::CloneIn;
use oxc_ast::ast::BindingPatternKind;
use oxc_ast::ast::ClassBody;
use oxc_ast::ast::ExportDefaultDeclarationKind;
use oxc_ast::ast::Expression;
use oxc_ast::ast::Program;
use oxc_ast::ast::TaggedTemplateExpression;
use oxc_ast::ast::TemplateElement;
use oxc_ast::ast::VariableDeclarationKind;
use oxc_ast::ast::VariableDeclarator;
use oxc_ast::{
    AstBuilder,
    ast::Statement,
};
use oxc_ast_visit::{Visit, VisitMut};
use oxc_parser::{ParseOptions, Parser};
use oxc_span::GetSpan;
use oxc_span::SourceType;
use oxc_span::Span;

mod ast;
mod compiler;
mod error_mapping;
mod solid_js;

const PREFIX: &str = "__styleThis";
const LIBRARY_CORE_IMPORT_NAME: &str = "@style-this/core";
const LIBRARY_SOLID_JS_IMPORT_NAME: &str = "@style-this/solid";

pub use compiler::Transformer;

#[wasm_bindgen]
pub fn initialize() {
    utils::set_panic_hook();
}
