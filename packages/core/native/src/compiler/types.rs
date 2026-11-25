use crate::utils::{binding_pattern_kind_get_idents, ts_declaration_id};
use oxc_ast::ast::{Class, Declaration, Function, VariableDeclarator};
use oxc_span::{GetSpan, Span};
use std::collections::{BTreeSet, HashSet};

pub(crate) enum VirtualProgramInsert<'alloc> {
    VariableDeclarator(VariableDeclarator<'alloc>),
    FunctionDeclaration(Function<'alloc>),
    ClassDeclaration(Class<'alloc>),
    /// namespaces, enums and `import A = N.B` aliases, compiled to JS with the rest of the
    /// virtual program
    TSDeclaration(Declaration<'alloc>),
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
            VirtualProgramInsert::TSDeclaration(declaration) => ts_declaration_id(declaration)
                .map(|id| HashSet::from([id.name.to_string()])),
        }
    }

    pub fn span(&self) -> Span {
        match self {
            VirtualProgramInsert::VariableDeclarator(declarator) => declarator.span,
            VirtualProgramInsert::FunctionDeclaration(function) => function.span,
            VirtualProgramInsert::ClassDeclaration(class) => class.span,
            VirtualProgramInsert::TSDeclaration(declaration) => declaration.span(),
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
    /// Declared with a `_Global` prefix, the CSS is emitted without a wrapping class
    pub global: bool,
    /// Extra classes from extraClass() calls
    pub extra_classes: BTreeSet<String>,
    /// Source span of the original css`...` block
    pub span: Span,
}

impl CssVariableIdentifier {
    pub fn new(
        variable_name: String,
        non_atomic_class: String,
        global: bool,
        extra_classes: BTreeSet<String>,
        span: Span,
    ) -> Self {
        Self {
            variable_name,
            classname: non_atomic_class,
            global,
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
