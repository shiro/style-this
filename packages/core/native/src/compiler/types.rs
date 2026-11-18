use crate::utils::binding_pattern_kind_get_idents;
use oxc_ast::ast::{Class, Function, VariableDeclarator};
use oxc_span::Span;
use std::collections::{BTreeSet, HashSet};

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
    /// The generated CSS class name for non-atomic CSS (e.g., "myClass-abc123")
    pub classname: String,
    /// Extra classes from extraClass() calls
    pub extra_classes: BTreeSet<String>,
    /// Source span of the original css`...` block
    pub span: Span,
}

impl CssVariableIdentifier {
    pub fn new(
        variable_name: String,
        non_atomic_class: String,
        extra_classes: BTreeSet<String>,
        span: Span,
    ) -> Self {
        Self {
            variable_name,
            classname: non_atomic_class,
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
