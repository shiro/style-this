use crate::utils::binding_pattern_kind_get_idents;
use crate::PREFIX;
use oxc_ast::ast::{Class, Function, VariableDeclarator};
use oxc_span::Span;
use std::collections::HashSet;
use wasm_bindgen::prelude::*;

pub(crate) struct ExportedJSValue {
    #[allow(dead_code)]
    pub value: JsValue,
    pub js_ref: String,
}

impl ExportedJSValue {
    pub fn new(value: JsValue) -> Self {
        let js_ref = format!("{}_{}", PREFIX, crate::utils::generate_random_id(8));
        js_sys::Reflect::set(&js_sys::global(), &JsValue::from_str(&js_ref), &value).unwrap();

        Self { value, js_ref }
    }
}

impl std::fmt::Display for ExportedJSValue {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "global.{}", self.js_ref)
    }
}

impl Drop for ExportedJSValue {
    fn drop(&mut self) {
        js_sys::Reflect::delete_property(&js_sys::global(), &JsValue::from_str(&self.js_ref))
            .unwrap();
    }
}

pub(crate) enum VirtualProgramInsert<'alloc> {
    VariableDeclarator(VariableDeclarator<'alloc>),
    FunctionDeclaration(Function<'alloc>),
    ClassDeclaration(Class<'alloc>),
}

impl<'alloc> VirtualProgramInsert<'alloc> {
    pub fn name(&self) -> Option<HashSet<String>> {
        match self {
            VirtualProgramInsert::VariableDeclarator(declarator) => {
                let idents = binding_pattern_kind_get_idents(&declarator.id.kind);
                if idents.is_empty() {
                    None
                } else {
                    Some(idents.into_iter().collect())
                }
            }
            VirtualProgramInsert::FunctionDeclaration(function) => function.id.as_ref().map(|id| {
                let mut ret = HashSet::new();
                ret.insert(id.name.as_str().to_string());
                ret
            }),
            VirtualProgramInsert::ClassDeclaration(class) => class.id.as_ref().map(|id| {
                let mut ret = HashSet::new();
                ret.insert(id.name.as_str().to_string());
                ret
            }),
        }
    }

    pub fn span(&self) -> Span {
        match self {
            VirtualProgramInsert::VariableDeclarator(declarator) => declarator.span,
            VirtualProgramInsert::FunctionDeclaration(function) => function.span,
            VirtualProgramInsert::ClassDeclaration(class) => class.span,
        }
    }
}

#[allow(dead_code)]
#[derive(PartialEq)]
pub enum EvaluateProgramReturnStatus {
    Transfomred,
    NotTransformed,
}
