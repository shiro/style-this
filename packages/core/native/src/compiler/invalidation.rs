//! Finds out which files are affected when a file changes.
//!
//! Exports are compared statically: an export's value only depends on the part of its program
//! needed to evaluate it (its slice) and the imports that slice reads. Exports are considered
//! changed if their slice or its imports differ, or if one of the imported values changed.

use super::cache::CSS_CLASSNAME_CACHE;
use super::dependency_tracker::{DEFAULT_EXPORT, STAR_IMPORT};
use super::evaluator::slice_program;
use super::transformer::Transformer;
use crate::utils::{
    binding_pattern_kind_get_idents, expression_get_references, statement_get_references,
};
use js_sys::Array;
use oxc_allocator::{Allocator, CloneIn};
use oxc_ast::AstBuilder;
use oxc_ast::ast::{Expression, ImportDeclarationSpecifier, Program, Statement};
use oxc_codegen::Codegen;
use oxc_parser::{ParseOptions, Parser};
use oxc_span::SourceType;
use std::collections::{BTreeSet, HashMap, HashSet};
use wasm_bindgen::prelude::*;


#[derive(Clone, Debug, PartialEq)]
enum ChangedExports {
    All,
    Names(HashSet<String>),
}

impl ChangedExports {
    fn contains(&self, name: &str) -> bool {
        match self {
            Self::All => true,
            Self::Names(names) => names.contains(name),
        }
    }

    fn is_empty(&self) -> bool {
        matches!(self, Self::Names(names) if names.is_empty())
    }

    fn names(&self) -> Option<&HashSet<String>> {
        match self {
            Self::All => None,
            Self::Names(names) => Some(names),
        }
    }

    /// Adds `other`, returns what wasn't contained before
    fn merge(&mut self, other: Self) -> Option<Self> {
        let Self::Names(names) = self else {
            return None;
        };
        let Self::Names(other) = other else {
            *self = Self::All;
            return Some(Self::All);
        };

        let added: HashSet<String> = other
            .into_iter()
            .filter(|name| !names.contains(name))
            .collect();
        if added.is_empty() {
            return None;
        }
        names.extend(added.iter().cloned());
        Some(Self::Names(added))
    }
}

#[derive(Debug, PartialEq)]
struct ExportSlice {
    code: String,
    /// (module id, imported name)
    imports: BTreeSet<(String, String)>,
}

/// Slices the given exports out of `code`, exports that can't be sliced are missing.
fn slice_exports(
    transformer: &Transformer,
    filepath: &str,
    code: &str,
    exports: &HashSet<String>,
) -> HashMap<String, ExportSlice> {
    let Ok(source_type) = SourceType::from_path(filepath) else {
        return HashMap::new();
    };

    let allocator = Allocator::default();
    let ast_builder = AstBuilder::new(&allocator);
    let parsed = Parser::new(&allocator, code, source_type)
        .with_options(ParseOptions {
            parse_regular_expression: true,
            ..ParseOptions::default()
        })
        .parse();
    if parsed.panicked || !parsed.errors.is_empty() {
        return HashMap::new();
    }

    // slicing generates class names, they must not replace the ones cached for the entrypoint
    let class_names = CSS_CLASSNAME_CACHE.with(|cache| cache.borrow().get(filepath).cloned());

    let slices = exports
        .iter()
        .filter_map(|export| {
            let mut program = parsed.program.clone_in(&allocator);
            let slice = slice_export(&ast_builder, transformer, filepath, code, &mut program, export)?;
            Some((export.clone(), slice))
        })
        .collect();

    CSS_CLASSNAME_CACHE.with(|cache| {
        let mut cache = cache.borrow_mut();
        match class_names {
            Some(class_names) => cache.insert(filepath.to_string(), class_names),
            None => cache.remove(filepath),
        };
    });

    slices
}

fn slice_export<'alloc>(
    ast_builder: &'alloc AstBuilder<'alloc>,
    transformer: &Transformer,
    filepath: &str,
    code: &str,
    program: &mut Program<'alloc>,
    export: &str,
) -> Option<ExportSlice> {
    let slice = slice_program(
        ast_builder,
        transformer,
        false,
        &transformer.cwd,
        filepath,
        code,
        program,
        HashSet::from([export.to_string()]),
        &mut HashSet::new(),
    )
    .ok()?;

    if !slice.exported_idents.contains(export) {
        return None;
    }

    let mut slice_program = slice.tmp_program;
    let references = prune_slice(&mut slice_program, export);

    // same as the imports `evaluate_dependencies` evaluates
    let mut imports = BTreeSet::new();
    for stmt in &program.body {
        let Statement::ImportDeclaration(import) = stmt else {
            break;
        };
        let Some(specifiers) = &import.specifiers else {
            continue;
        };
        for specifier in specifiers {
            let (local, imported) = match specifier {
                ImportDeclarationSpecifier::ImportSpecifier(spec) => {
                    (spec.local.name.as_str(), spec.imported.to_string())
                }
                ImportDeclarationSpecifier::ImportDefaultSpecifier(spec) => {
                    (spec.local.name.as_str(), DEFAULT_EXPORT.to_string())
                }
                ImportDeclarationSpecifier::ImportNamespaceSpecifier(spec) => {
                    (spec.local.name.as_str(), STAR_IMPORT.to_string())
                }
            };
            if references.contains(local) {
                imports.insert((import.source.value.to_string(), imported));
            }
        }
    }

    Some(ExportSlice {
        code: Codegen::new().build(&slice_program).code,
        imports,
    })
}

/// Removes top level statements `export` doesn't depend on, returns the identifiers it references.
///
/// The visitor only adds referenced declarations to slices, but always adds all CSS of the program
/// since entrypoints need it.
fn prune_slice(program: &mut Program, export: &str) -> HashSet<String> {
    let statements: Vec<_> = program
        .body
        .iter()
        .map(|stmt| (statement_declared_names(stmt), statement_references(stmt)))
        .collect();

    let mut references = HashSet::from([export.to_string()]);
    let mut kept = vec![false; statements.len()];
    let mut changed = true;
    while changed {
        changed = false;
        for (idx, (declared_names, stmt_references)) in statements.iter().enumerate() {
            if kept[idx] {
                continue;
            }
            // statements that don't declare anything might have side effects, keep them
            let needed = declared_names
                .as_ref()
                .is_none_or(|names| names.iter().any(|name| references.contains(name)));
            if needed {
                kept[idx] = true;
                changed = true;
                references.extend(stmt_references.iter().cloned());
            }
        }
    }

    let mut kept = kept.into_iter();
    program.body.retain(|_| kept.next().unwrap());
    references
}

/// Names a slice statement declares, assignments to members (e.g. `x.css = ...`) count as
/// declaring the object
fn statement_declared_names(stmt: &Statement) -> Option<HashSet<String>> {
    match stmt {
        Statement::VariableDeclaration(declaration) => Some(
            declaration
                .declarations
                .iter()
                .flat_map(|declarator| binding_pattern_kind_get_idents(&declarator.id.kind))
                .collect(),
        ),
        Statement::FunctionDeclaration(function) => {
            Some(HashSet::from([function.id.as_ref()?.name.to_string()]))
        }
        Statement::ClassDeclaration(class) => {
            Some(HashSet::from([class.id.as_ref()?.name.to_string()]))
        }
        Statement::ExpressionStatement(statement) => {
            let Expression::AssignmentExpression(assignment) = &statement.expression else {
                return None;
            };
            let object = assignment.left.as_member_expression()?.object();
            let Expression::Identifier(object) = object.without_parentheses() else {
                return None;
            };
            Some(HashSet::from([object.name.to_string()]))
        }
        _ => None,
    }
}

fn statement_references(stmt: &Statement) -> Vec<String> {
    match stmt {
        // the reference collector skips top level declarators
        Statement::VariableDeclaration(declaration) => declaration
            .declarations
            .iter()
            .filter_map(|declarator| declarator.init.as_ref())
            .flat_map(expression_get_references)
            .collect(),
        _ => statement_get_references(stmt),
    }
}

/// Tracked exports of a file with their slices, `None` if unknown.
type ImporterSlices = Option<(HashSet<String>, HashMap<String, ExportSlice>)>;

#[wasm_bindgen]
impl Transformer {
    /// Updates the cached values after `filepath` changed to `code` (`None` if deleted).
    ///
    /// Returns the other files whose CSS is affected: importers of the changed exports, importers
    /// of their exports that depend on those, and so on.
    pub fn invalidate_file(&self, filepath: &str, code: Option<String>) -> Array {
        let old_code = self.cache_registry.update_module_code(filepath, code.clone());
        let changed = match (old_code, &code) {
            (Some(old_code), Some(code)) => self.changed_exports(filepath, &old_code, code),
            _ => ChangedExports::All,
        };

        let tracker = self.cache_registry.dependency_tracker();
        let mut importer_slices = HashMap::new();
        let mut propagated = HashMap::from([(filepath.to_string(), changed.clone())]);
        let mut queue = vec![(filepath.to_string(), changed)];
        let mut affected = BTreeSet::new();

        while let Some((file, changed)) = queue.pop() {
            self.cache_registry.clear_values(&file, changed.names());

            let importers = match &changed {
                ChangedExports::All => tracker.borrow().get_all_importers(&file),
                ChangedExports::Names(names) => {
                    tracker.borrow().get_importers_of_changed_exports(&file, names)
                }
            };

            for importer in importers {
                let importer_changed =
                    self.changed_importer_exports(&importer, &file, &changed, &mut importer_slices);

                let added = propagated
                    .entry(importer.clone())
                    .or_insert_with(|| ChangedExports::Names(HashSet::new()))
                    .merge(importer_changed);
                if let Some(added) = added
                    && !added.is_empty()
                {
                    queue.push((importer.clone(), added));
                }

                affected.insert(importer);
            }
        }

        affected.remove(filepath);
        affected.iter().map(|file| JsValue::from_str(file)).collect()
    }
}

impl Transformer {
    /// Exports of a file that are cached or imported by other files, `None` if unknown
    fn tracked_exports(&self, filepath: &str) -> Option<HashSet<String>> {
        let mut exports = self.cache_registry.cached_values(filepath)?;
        exports.extend(
            self.cache_registry
                .dependency_tracker()
                .borrow()
                .get_imported_names(filepath),
        );
        Some(exports)
    }

    fn changed_exports(&self, filepath: &str, old_code: &str, code: &str) -> ChangedExports {
        if old_code == code {
            return ChangedExports::Names(HashSet::new());
        }
        let Some(exports) = self.tracked_exports(filepath) else {
            return ChangedExports::All;
        };

        let old_slices = slice_exports(self, filepath, old_code, &exports);
        let slices = slice_exports(self, filepath, code, &exports);

        ChangedExports::Names(
            exports
                .into_iter()
                .filter(|export| match (old_slices.get(export), slices.get(export)) {
                    (Some(old_slice), Some(slice)) => old_slice != slice,
                    _ => true,
                })
                .collect(),
        )
    }

    /// Exports of `importer` that depend on the changed exports of `source`
    fn changed_importer_exports(
        &self,
        importer: &str,
        source: &str,
        source_changed: &ChangedExports,
        importer_slices: &mut HashMap<String, ImporterSlices>,
    ) -> ChangedExports {
        let slices = importer_slices
            .entry(importer.to_string())
            .or_insert_with(|| {
                let exports = self.tracked_exports(importer)?;
                if exports.is_empty() {
                    return Some((exports, HashMap::new()));
                }
                let code = self.cache_registry.module_code(importer)?;
                let slices = slice_exports(self, importer, &code, &exports);
                Some((exports, slices))
            });
        let Some((exports, slices)) = slices else {
            return ChangedExports::All;
        };

        let tracker = self.cache_registry.dependency_tracker();
        let tracker = tracker.borrow();

        ChangedExports::Names(
            exports
                .iter()
                .filter(|export| {
                    let Some(slice) = slices.get(*export) else {
                        return true;
                    };
                    slice.imports.iter().any(|(module_id, name)| {
                        (name == STAR_IMPORT || source_changed.contains(name))
                            && tracker.resolve(importer, module_id).as_deref() == Some(source)
                    })
                })
                .cloned()
                .collect(),
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn prune(code: &str, export: &str) -> (String, BTreeSet<String>) {
        let allocator = Allocator::default();
        let mut program = Parser::new(&allocator, code, SourceType::mjs()).parse().program;
        let references = prune_slice(&mut program, export);
        (Codegen::new().build(&program).code, references.into_iter().collect())
    }

    fn names(names: &[&str]) -> HashSet<String> {
        names.iter().map(|name| name.to_string()).collect()
    }

    #[test]
    fn prune_slice_keeps_dependencies_of_the_export() {
        let (code, references) = prune(
            "
            let base = 1;
            let size = base * scale;
            function unrelated() { return other; }
            let style = new String('style');
            style.css = `width: ${size}`;
            let other_style = new String('other');
            other_style.css = `color: ${color}`;
            let { a, b } = destructured;
            let derived = style + a;
            ",
            "derived",
        );

        assert_eq!(
            code,
            "let base = 1;\nlet size = base * scale;\nlet style = new String(\"style\");\nstyle.css = `width: ${size}`;\nlet { a, b } = destructured;\nlet derived = style + a;\n"
        );
        assert_eq!(
            references,
            ["String", "a", "base", "derived", "destructured", "scale", "size", "style"]
                .map(String::from)
                .into()
        );
    }

    #[test]
    fn prune_slice_follows_function_bodies_and_keeps_side_effects() {
        let (code, references) = prune(
            "
            let palette = { primary: 'red' };
            let unused = 1;
            function color(name) { let local = palette; return local[name] + suffix; }
            register(unused);
            ",
            "color",
        );

        assert!(code.contains("let palette"));
        assert!(code.contains("function color"));
        // statements without declarations might have side effects
        assert!(code.contains("register(unused)"));
        assert!(code.contains("let unused"));
        assert!(references.contains("suffix"));
        assert!(!references.contains("local") && !references.contains("name"));
    }

    #[test]
    fn changed_exports_merge_returns_added_names() {
        let mut changed = ChangedExports::Names(names(&["a"]));
        assert_eq!(changed.merge(ChangedExports::Names(names(&["a"]))), None);
        assert_eq!(
            changed.merge(ChangedExports::Names(names(&["a", "b"]))),
            Some(ChangedExports::Names(names(&["b"])))
        );
        assert_eq!(changed, ChangedExports::Names(names(&["a", "b"])));

        assert_eq!(changed.merge(ChangedExports::All), Some(ChangedExports::All));
        assert_eq!(changed, ChangedExports::All);
        assert_eq!(changed.merge(ChangedExports::Names(names(&["c"]))), None);
        assert_eq!(changed.merge(ChangedExports::All), None);
    }
}
