use crate::{LIBRARY_CORE_IMPORT_NAME, LIBRARY_REACT_IMPORT_NAME, LIBRARY_SOLID_JS_IMPORT_NAME};
use oxc_ast::AstKind;
use oxc_ast::ast::{Expression, ImportDeclarationSpecifier, Program, Statement};
use oxc_semantic::SemanticBuilder;
use oxc_span::{GetSpan, Span};
use std::collections::HashMap;

/// An export of ours the compiler transforms.
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum LibraryExport {
    Css,
    Style,
    ExtraClass,
    SolidStyled,
    ReactStyled,
}

impl LibraryExport {
    fn from_import(source: &str, name: &str) -> Option<Self> {
        Some(match (source, name) {
            (LIBRARY_CORE_IMPORT_NAME, "css") => Self::Css,
            (LIBRARY_CORE_IMPORT_NAME, "style") => Self::Style,
            (LIBRARY_CORE_IMPORT_NAME, "extraClass") => Self::ExtraClass,
            (LIBRARY_SOLID_JS_IMPORT_NAME, "styled") => Self::SolidStyled,
            (LIBRARY_REACT_IMPORT_NAME, "styled") => Self::ReactStyled,
            _ => return None,
        })
    }
}

/// The expressions referring to our exports, e.g. `css` (also aliased) or `ns.css` with
/// `import * as ns`, by span. Inner bindings shadowing an import aren't ours.
#[derive(Default)]
pub struct LibraryReferences {
    /// Whether the program imports any of our exports, also when it doesn't use them.
    pub imported: bool,
    exports: HashMap<Span, LibraryExport>,
}

impl LibraryReferences {
    pub fn new(program: &Program) -> Self {
        let mut imports = vec![];
        for statement in &program.body {
            let Statement::ImportDeclaration(import) = statement else {
                continue;
            };
            let Some(source) = import.source.value.as_str() else {
                continue;
            };
            if !matches!(
                source,
                LIBRARY_CORE_IMPORT_NAME | LIBRARY_SOLID_JS_IMPORT_NAME | LIBRARY_REACT_IMPORT_NAME
            ) {
                continue;
            }
            for specifier in import.specifiers.iter().flatten() {
                // `None` for namespaces
                let export = match specifier {
                    ImportDeclarationSpecifier::ImportSpecifier(spec) => {
                        match LibraryExport::from_import(source, &spec.imported.name()) {
                            None => continue,
                            export => export,
                        }
                    }
                    ImportDeclarationSpecifier::ImportNamespaceSpecifier(_) => None,
                    ImportDeclarationSpecifier::ImportDefaultSpecifier(_) => continue,
                };
                imports.push((source, specifier.local(), export));
            }
        }

        let mut references = Self {
            imported: !imports.is_empty(),
            exports: HashMap::new(),
        };
        if imports.is_empty() {
            return references;
        }

        let semantic = SemanticBuilder::new().with_build_nodes(true).build(program).semantic;
        let nodes = semantic.nodes();
        for (source, local, export) in imports {
            for reference in semantic.scoping().get_resolved_references(local.symbol_id()) {
                let node_id = reference.node_id();
                match export {
                    Some(export) => {
                        references
                            .exports
                            .insert(nodes.kind(node_id).span(), export);
                    }
                    // `ns.css`, the reference is the member expression's object
                    None => {
                        if let AstKind::StaticMemberExpression(member) = nodes.parent_kind(node_id)
                            && let Some(export) =
                                LibraryExport::from_import(source, &member.property.name)
                        {
                            references.exports.insert(member.span, export);
                        }
                    }
                }
            }
        }
        references
    }

    pub fn get(&self, expression: &Expression) -> Option<LibraryExport> {
        self.exports.get(&expression.span()).copied()
    }

    pub fn uses(&self, export: LibraryExport) -> bool {
        self.exports.values().any(|&used| used == export)
    }
}
