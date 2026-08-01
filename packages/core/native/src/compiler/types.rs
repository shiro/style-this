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

/// Represents a CSS variable identifier with its associated metadata
#[derive(Debug, Clone)]
pub struct CssVariableIdentifier {
    /// The variable name (e.g., "_styleThis_expression_0")
    pub variable_name: String,
    /// The generated CSS class name (e.g., "myClass-abc123")
    pub class_name: String,
    /// Extra classes from extraClass() calls
    pub extra_classes: Vec<String>,
    /// Source span of the original css`...` block
    pub span: Span,
}

impl CssVariableIdentifier {
    pub fn new(
        variable_name: String,
        class_name: String,
        extra_classes: Vec<String>,
        span: Span,
    ) -> Self {
        Self {
            variable_name,
            class_name,
            extra_classes,
            span,
        }
    }
}

#[allow(dead_code)]
#[derive(PartialEq)]
pub enum EvaluateProgramReturnStatus {
    Transfomred,
    NotTransformed,
}
