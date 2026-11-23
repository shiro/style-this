use super::atomic::{insert_virtual_atomic_program_import, is_atomic_program_import};
use super::css_parser;
use super::dependency_tracker::{DEFAULT_EXPORT, QUERY_SOURCE_IMPORT, STAR_IMPORT};
use super::error::TransformError;
use super::transformer::{Transformer, VirtualImport};
use super::types::CssVariableIdentifier;
use super::visitor::VisitorTransformer;
use crate::compiler::atomic::{add_atomic, dedupe_atomic_declarations, rewrite_merge_styles_imports};
use crate::error_mapping;
use crate::react::react_prepass;
use crate::solid_js::solid_js_prepass;
use crate::styled_component_transformer::ClassDisplayNames;
use crate::utils::{self, transpile_ts_to_js};
use crate::{
    LIBRARY_CORE_IMPORT_NAME, LIBRARY_REACT_IMPORT_NAME, LIBRARY_SOLID_JS_IMPORT_NAME, PREFIX,
};
use indoc::formatdoc;
use oxc_allocator::{Allocator, CloneIn};
use oxc_ast::AstBuilder;
use oxc_ast::ast::{
    BindingPatternKind, Expression, ImportDeclaration, ImportDeclarationSpecifier,
    ImportOrExportKind, ModuleExportName, Program, PropertyKey, Statement, VariableDeclarationKind,
    WithClause,
};
use oxc_ast_visit::VisitMut;
use oxc_codegen::{Codegen, CodegenOptions};
use oxc_parser::{ParseOptions, Parser};
use oxc_sourcemap::ConcatSourceMapBuilder;
use oxc_span::SourceType;
use oxc_syntax::identifier::is_identifier_name;
use oxc_syntax::keyword::is_reserved_keyword_or_global_object;
use std::cell::RefCell;
use std::collections::{BTreeSet, HashMap, HashSet};
use std::path::PathBuf;
use std::rc::Rc;
use std::str::FromStr;
use wasm_bindgen::prelude::*;

/// Wraps an eval program in an async IIFE with isolated globals
///
/// This prevents user code from accidentally (or maliciously) calling into Node's global,
/// accessing environment variables, or reaching other global state outside the CSS variables
/// we want to expose. Only the specified references are made available to the eval context.
///
/// Returns the wrapped program as JavaScript that returns a Promise.
fn wrap_eval_program(
    eval_program_js: &str,
    css_file_store_ref: &str,
    value_cache_ref: &str,
    require_ref: Option<&str>,
) -> String {
    if let Some(require_ref) = require_ref {
        formatdoc!(
            "
            const _global = {{
                {css_file_store_ref}: globalThis.{css_file_store_ref},
                {value_cache_ref}: globalThis.{value_cache_ref},
            }};
            
            const _require = (typeof globalThis !== 'undefined' && globalThis.{require_ref}) 
                || (typeof global !== 'undefined' && global.{require_ref})
                || (function() {{ throw new Error('require not found in globalThis or global'); }})();

            (async (require) => {{
                const global = _global;
                // start
    {eval_program_js}
            }})(_require)
            "
        )
    } else {
        formatdoc!(
            "
            const _global = {{
                {css_file_store_ref},
                {value_cache_ref},
            }};

            (async () => {{
                const global = _global;
                // start
    {eval_program_js}
            }})()
            "
        )
    }
}

fn codegen_transform_result(program: &Program, program_filepath: &str) -> JsValue {
    let options = CodegenOptions {
        source_map_path: Some(PathBuf::from_str(program_filepath).unwrap()),
        ..Default::default()
    };
    let output_js = Codegen::new().with_options(options).build(program);
    // shift the mappings below the prepended `// @ts-nocheck` line
    let sourcemap =
        ConcatSourceMapBuilder::from_sourcemaps(&[(&output_js.map.unwrap(), 1)]).into_sourcemap();

    let result = js_sys::Object::new();
    js_sys::Reflect::set(
        &result,
        &JsValue::from_str("code"),
        &JsValue::from_str(&format!("// @ts-nocheck\n{}", output_js.code)),
    )
    .unwrap();
    js_sys::Reflect::set(
        &result,
        &JsValue::from_str("sourcemap"),
        &JsValue::from_str(&sourcemap.to_json_string()),
    )
    .unwrap();
    result.into()
}

/// Helper to get the local name from any import specifier type
fn get_import_local_name<'a>(specifier: &'a ImportDeclarationSpecifier<'a>) -> &'a str {
    match specifier {
        ImportDeclarationSpecifier::ImportSpecifier(import) => import.local.name.as_str(),
        ImportDeclarationSpecifier::ImportDefaultSpecifier(import) => import.local.name.as_str(),
        ImportDeclarationSpecifier::ImportNamespaceSpecifier(import) => import.local.name.as_str(),
    }
}

/// `ignored_list` lists the imported names (`DEFAULT_EXPORT` for the default import), an empty
/// list ignores the whole module.
fn is_import_ignored(
    specifier: &ImportDeclarationSpecifier,
    ignored_list: Option<&Vec<String>>,
) -> bool {
    let Some(ignored_list) = ignored_list else {
        return false;
    };
    if ignored_list.is_empty() {
        return true;
    }

    let imported_name = match specifier {
        ImportDeclarationSpecifier::ImportSpecifier(import) => import.imported.name(),
        ImportDeclarationSpecifier::ImportDefaultSpecifier(_) => DEFAULT_EXPORT.into(),
        ImportDeclarationSpecifier::ImportNamespaceSpecifier(_) => return false,
    };
    ignored_list.iter().any(|name| name == imported_name.as_str())
}

#[allow(clippy::too_many_arguments)]
/// Iterate over program's imports and run an evaluation on each of them we import referenced
/// identifiers from.
/// Then copy over imports into temporary program, but transform them into variable assignments.
fn evaluate_dependencies<'alloc>(
    program: &'alloc Program<'alloc>,
    ast_builder: &'alloc AstBuilder<'alloc>,
    transformer: &Transformer,
    referenced_idents: &HashSet<String>,
    namespace_imports: &mut HashMap<String, HashSet<String>>,
    program_filepath: String,
    cwd: &str,
    temporary_programs: Rc<RefCell<HashMap<String, String>>>,
    skip_css_eval: bool,
    import_chain: Rc<Vec<String>>,
) -> Vec<
    std::pin::Pin<
        std::boxed::Box<
            dyn futures::future::Future<Output = Result<Vec<Statement<'alloc>>, TransformError>>
                + 'alloc,
        >,
    >,
> {
    let mut futures = vec![];
    let cwd = cwd.to_string();

    // handle imports - resolve other modules and rewrite return values into variable declarations
    for import_declaration in program_imports(program, ast_builder) {
        let remote_module_id = import_declaration.source.value.to_string();

        // the `.style-this.js` module is generated from this program's evaluation, the other
        // inserted virtual module imports are side-effect imports and skipped below
        if is_atomic_program_import(import_declaration) {
            continue;
        }

        let Some(specifiers) = &import_declaration.specifiers else {
            continue;
        };

        let ignored_list = transformer.ignored_imports.get(&remote_module_id);
        let specifiers = ast_builder.vec_from_iter(
            specifiers
                .iter()
                .filter(|specifier| !is_import_ignored(specifier, ignored_list))
                .map(|specifier| specifier.clone_in(ast_builder.allocator)),
        );

        let mut remote_referenced_idents = namespace_imports
            .remove(&remote_module_id)
            .unwrap_or_default();

        let any_ident_referenced = specifiers
            .iter()
            .any(|specifier| referenced_idents.contains(get_import_local_name(specifier)));

        if !any_ident_referenced {
            continue;
        }

        let future: std::pin::Pin<
            std::boxed::Box<
                dyn futures::future::Future<Output = Result<Vec<Statement<'alloc>>, TransformError>>,
            >,
        > = {
            let program_filepath = program_filepath.clone();
            let referenced_idents = referenced_idents.clone();
            let temporary_programs = temporary_programs.clone();
            let import_chain = import_chain.clone();
            let cwd = cwd.clone();
            let transformer =
                unsafe { std::mem::transmute::<&Transformer, &'static Transformer>(transformer) };

            Box::pin(async move {
                // declarations of the imported values, in the order they're inserted at the start
                // of the evaluated program
                let mut statements = vec![];

                let (remote_filepath, code) = transformer
                    .load_file(&remote_module_id, &program_filepath)
                    .await?;

                // modules with a query are separate modules generated from the file
                let (code, query_source) = match remote_filepath.split_once('?') {
                    None => (code, None),
                    Some((source, "raw")) => {
                        // to find out whether the source changed, see `get_evaluated_dependencies`
                        transformer.cache_registry.record_module_code(source, &code);
                        (raw_module(&code), Some(source))
                    }
                    Some(_) => {
                        return Err(TransformError::UnsupportedImportQuery {
                            filepath: remote_filepath,
                        });
                    }
                };

                // needed to find out which exports changed on HMR
                if !code.is_empty() {
                    transformer
                        .cache_registry
                        .record_module_code(&remote_filepath, &code);
                    let tracker = transformer.cache_registry.dependency_tracker();
                    let tracker = tracker.borrow();
                    tracker.register_resolution(&program_filepath, &remote_module_id, &remote_filepath);
                    if let Some(query_source) = query_source {
                        tracker.register_import(query_source, QUERY_SOURCE_IMPORT, &remote_filepath);
                    }
                }

                for specifier in specifiers.iter() {
                    // ignore `css` imports from us
                    if import_declaration.source.value == LIBRARY_CORE_IMPORT_NAME
                        && let ImportDeclarationSpecifier::ImportSpecifier(import_specifier) =
                            specifier
                        && !matches!(
                            &import_specifier.imported,
                            ModuleExportName::IdentifierName(identifier_name)
                            if identifier_name.name == "css"
                        )
                    {
                        continue;
                    }

                    let (local_name, remote_name, span) =
                        match specifier {
                            oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(
                                import_specifier,
                            ) => {
                                let local_name = import_specifier.local.name.to_string();
                                if !referenced_idents.contains(&local_name) {
                                    continue;
                                }

                                let remote_name = import_specifier.imported.to_string();
                                let span = import_specifier.span;

                                // node_modules imports
                                if code.is_empty() {
                                    let left = BindingPatternKind::ObjectPattern(
                                ast_builder.alloc_object_pattern(
                                    span,
                                    ast_builder.vec1(ast_builder.binding_property(
                                        span,
                                        PropertyKey::StaticIdentifier(
                                            ast_builder.alloc_identifier_name(
                                                span,
                                                ast_builder.atom(&remote_name),
                                            ),
                                        ),
                                        ast_builder.binding_pattern(
                                            ast_builder.binding_pattern_kind_binding_identifier(
                                                span,
                                                ast_builder.atom(&local_name),
                                            ),
                                            None as Option<oxc_allocator::Box<_>>,
                                            false,
                                        ),
                                        true,
                                        false,
                                    )),
                                    None as Option<oxc_allocator::Box<_>>,
                                ),
                            );
                                    statements.push(
                                        if transformer.use_require {
                                            utils::make_require(
                                                ast_builder,
                                                left,
                                                &remote_filepath,
                                                span,
                                            )
                                        } else {
                                            utils::make_dynamic_import(
                                                ast_builder,
                                                left,
                                                &remote_filepath,
                                                span,
                                            )
                                        },
                                    );
                                    continue;
                                }

                                (local_name, Some(remote_name), import_specifier.span)
                            }
                            oxc_ast::ast::ImportDeclarationSpecifier::ImportDefaultSpecifier(
                                import_default_specifier,
                            ) => {
                                let local_name = import_default_specifier.local.name.to_string();
                                if !referenced_idents.contains(&local_name) {
                                    continue;
                                }

                                let span = import_default_specifier.span;

                                // node_modules imports
                                if code.is_empty() {
                                    let left = BindingPatternKind::ObjectPattern(
                                ast_builder.alloc_object_pattern(
                                    span,
                                    ast_builder.vec1(ast_builder.binding_property(
                                        span,
                                        PropertyKey::StaticIdentifier(
                                            ast_builder.alloc_identifier_name(
                                                span,
                                                ast_builder.atom("default"),
                                            ),
                                        ),
                                        ast_builder.binding_pattern(
                                            ast_builder.binding_pattern_kind_binding_identifier(
                                                span,
                                                ast_builder.atom(&local_name),
                                            ),
                                            None as Option<oxc_allocator::Box<_>>,
                                            false,
                                        ),
                                        true,
                                        false,
                                    )),
                                    None as Option<oxc_allocator::Box<_>>,
                                ),
                            );
                                    statements.push(
                                        if transformer.use_require {
                                            utils::make_require(
                                                ast_builder,
                                                left,
                                                &remote_filepath,
                                                span,
                                            )
                                        } else {
                                            utils::make_dynamic_import(
                                                ast_builder,
                                                left,
                                                &remote_filepath,
                                                span,
                                            )
                                        },
                                    );
                                    continue;
                                }

                                (
                                    local_name,
                                    Some(DEFAULT_EXPORT.to_string()),
                                    import_default_specifier.span,
                                )
                            }
                            oxc_ast::ast::ImportDeclarationSpecifier::ImportNamespaceSpecifier(
                                import,
                            ) => {
                                let namespace_name = import.local.name.to_string();

                                if !referenced_idents.contains(&namespace_name) {
                                    continue;
                                }

                                let span = import.span;

                                // node_modules imports
                                if code.is_empty() {
                                    let left = BindingPatternKind::BindingIdentifier(
                                        ast_builder.alloc_binding_identifier(
                                            span,
                                            ast_builder.atom(&namespace_name),
                                        ),
                                    );
                                    statements.push(
                                        if transformer.use_require {
                                            utils::make_require(
                                                ast_builder,
                                                left,
                                                &remote_filepath,
                                                span,
                                            )
                                        } else {
                                            utils::make_dynamic_import(
                                                ast_builder,
                                                left,
                                                &remote_filepath,
                                                span,
                                            )
                                        },
                                    );
                                    continue;
                                }

                                (namespace_name, None, import.span)
                            }
                        };

                    let cache_ref = &transformer.value_cache_ref;
                    let module_source = if import_chain.contains(&remote_filepath) {
                        // circular imports aren't evaluated, see below
                        let message = format!(
                            "circular import of '{remote_filepath}' from '{program_filepath}', its values can't be used before it's evaluated"
                        );
                        format!(
                            "({cache_ref}[{remote_filepath:?}] ?? (() => {{ throw new Error({message:?}); }})())"
                        )
                    } else {
                        format!("{cache_ref}[{remote_filepath:?}]")
                    };
                    let cache_source = if let Some(remote_name) = &remote_name {
                        format!("{module_source}[{remote_name:?}]")
                    } else {
                        module_source
                    };

                    // add new variable declaration to our tmp program
                    let variable_declaration =
                        Statement::VariableDeclaration(ast_builder.alloc_variable_declaration(
                            span,
                            VariableDeclarationKind::Const,
                            ast_builder.vec1(ast_builder.variable_declarator(
                                span,
                                VariableDeclarationKind::Const,
                                ast_builder.binding_pattern(
                                    BindingPatternKind::BindingIdentifier(
                                        ast_builder.alloc_binding_identifier(
                                            span,
                                            ast_builder.atom(&local_name),
                                        ),
                                    ),
                                    None as Option<oxc_allocator::Box<_>>,
                                    false,
                                ),
                                Some(Expression::Identifier(
                                    ast_builder.alloc_identifier_reference(
                                        span,
                                        ast_builder.atom(&cache_source),
                                    ),
                                )),
                                false,
                            )),
                            false,
                        ));
                    statements.push(variable_declaration);
                    
                    // Track this import dependency
                    let var_name_for_tracking = if let Some(ref remote_name) = remote_name {
                        remote_name.as_str()
                    } else {
                        STAR_IMPORT
                    };
                    
                    transformer.cache_registry
                        .dependency_tracker()
                        .borrow()
                        .register_import(
                            &remote_filepath,
                            var_name_for_tracking,
                            &program_filepath,
                        );
                    
                    if let Some(remote_name) = remote_name {
                        remote_referenced_idents.insert(remote_name);
                    }
                }

                // if nothing referenced, nothing to do
                if remote_referenced_idents.is_empty() {
                    return Ok(statements);
                }

                // circular import, like in JS the importer sees the partially initialized
                // module, i.e. only the values that are already in the value cache
                if import_chain.contains(&remote_filepath) {
                    return Ok(statements);
                }

                let (source_type, code) = if query_source.is_some() {
                    (SourceType::mjs(), code)
                } else if remote_filepath.ends_with(".json") {
                    (SourceType::mjs(), json_module(&remote_filepath, &code)?)
                } else {
                    let source_type = SourceType::from_path(&remote_filepath).map_err(|_| {
                        TransformError::UknownExtension {
                            filepath: remote_filepath.clone(),
                            row: 1,
                            column: 1,
                        }
                    })?;
                    (source_type, code)
                };

                let allocator = Allocator::default();
                let ast_builder = AstBuilder::new(&allocator);

                let ast = Parser::new(&allocator, &code, source_type)
                    .with_options(ParseOptions {
                        parse_regular_expression: true,
                        ..ParseOptions::default()
                    })
                    .parse();

                if ast.panicked {
                    return Err(TransformError::RawParseFailed {
                        filepath: remote_filepath,
                        message: ast.errors.first().unwrap().message.to_string(),
                        row: 1,
                        column: 1,
                    });
                }

                let mut remote_program = ast.program;

                evaluate_program(
                    &ast_builder,
                    transformer,
                    false,
                    &cwd,
                    remote_filepath,
                    Some(&program_filepath),
                    &code,
                    &mut remote_program,
                    remote_referenced_idents,
                    temporary_programs,
                    None,
                    skip_css_eval,
                    &import_chain,
                )
                .await?;
                Ok(statements)
            })
        };
        futures.push(future);
    }

    futures
}

/// Imports of `program`, re-exports (`export { x as y } from "./b"`, `export * from "./b"`) are
/// included as imports bound to their `utils::reexport_local_name`s.
pub(crate) fn program_imports<'a, 'alloc>(
    program: &'a Program<'alloc>,
    ast_builder: &'a AstBuilder<'alloc>,
) -> Vec<&'a ImportDeclaration<'alloc>> {
    program
        .body
        .iter()
        .filter_map(|stmt| match stmt {
            Statement::ImportDeclaration(import) => Some(&**import),
            Statement::ExportNamedDeclaration(export) => {
                let source = export.source.as_ref()?;
                let specifiers =
                    ast_builder.vec_from_iter(export.specifiers.iter().map(|specifier| {
                        let span = specifier.span;
                        let local = ast_builder.binding_identifier(
                            span,
                            ast_builder.atom(&utils::reexport_local_name(specifier.span)),
                        );
                        if specifier.local.name() == "default" {
                            ast_builder
                                .import_declaration_specifier_import_default_specifier(span, local)
                        } else {
                            ast_builder.import_declaration_specifier_import_specifier(
                                span,
                                specifier.local.clone_in(ast_builder.allocator),
                                local,
                                specifier.export_kind,
                            )
                        }
                    }));
                let import = ast_builder.import_declaration(
                    export.span,
                    Some(specifiers),
                    source.clone_in(ast_builder.allocator),
                    None,
                    None::<oxc_allocator::Box<WithClause>>,
                    export.export_kind,
                );
                Some(&*ast_builder.allocator.alloc(import))
            }
            Statement::ExportAllDeclaration(export) => {
                let local = ast_builder.binding_identifier(
                    export.span,
                    ast_builder.atom(&utils::reexport_local_name(export.span)),
                );
                let import = ast_builder.import_declaration(
                    export.span,
                    Some(ast_builder.vec1(
                        ast_builder.import_declaration_specifier_import_namespace_specifier(
                            export.span,
                            local,
                        ),
                    )),
                    export.source.clone_in(ast_builder.allocator),
                    None,
                    None::<oxc_allocator::Box<WithClause>>,
                    export.export_kind,
                );
                Some(&*ast_builder.allocator.alloc(import))
            }
            _ => None,
        })
        .collect()
}

/// Module of a file imported with `?raw`, like Vite it default-exports the file's contents.
fn raw_module(code: &str) -> String {
    let code = js_sys::JSON::stringify(&JsValue::from_str(code)).unwrap();
    format!("export default {};\n", String::from(code))
}

/// Module of a JSON file, like Vite it default-exports the JSON and exports top level keys that
/// are valid identifiers by name.
fn json_module(filepath: &str, code: &str) -> Result<String, TransformError> {
    let parse_error = |cause: JsValue| TransformError::RawParseFailed {
        filepath: filepath.to_string(),
        message: js_sys::Error::from(cause).message().into(),
        row: 1,
        column: 1,
    };
    let value = js_sys::JSON::parse(code).map_err(parse_error)?;

    let mut module = format!("export default {code};\n");
    if let Some(object) = value.dyn_ref::<js_sys::Object>()
        && !js_sys::Array::is_array(object)
    {
        for (key, value) in js_sys::Object::entries(object).iter().filter_map(|entry| {
            let entry = js_sys::Array::from(&entry);
            Some((entry.get(0).as_string()?, entry.get(1)))
        }) {
            if !is_identifier_name(&key)
                || is_reserved_keyword_or_global_object(&key)
                || matches!(key.as_str(), "arguments" | "eval")
            {
                continue;
            }
            let value = js_sys::JSON::stringify(&value).map_err(parse_error)?;
            module.push_str(&format!("export const {key} = {};\n", String::from(value)));
        }
    }
    Ok(module)
}

/// Inserts the imports of the entrypoint's virtual modules. Only the entrypoint's code is emitted,
/// in dependencies the virtual modules aren't needed.
fn insert_virtual_imports<'alloc>(
    program: &mut Program<'alloc>,
    ast_builder: &'alloc AstBuilder<'alloc>,
    transformer: &Transformer,
    program_filepath: &str,
    has_css: bool,
) -> Result<(), TransformError> {
    if transformer.atomic && has_css {
        insert_virtual_atomic_program_import(program, ast_builder, transformer, program_filepath)?;
    }
    insert_virtual_css_import(program, ast_builder, transformer, program_filepath)
}

/// Insert a side-effect import of the program's virtual CSS module.
fn insert_virtual_css_import<'alloc>(
    program: &mut Program<'alloc>,
    ast_builder: &'alloc AstBuilder<'alloc>,
    transformer: &Transformer,
    program_filepath: &str,
) -> Result<(), TransformError> {
    let module_id = transformer.virtual_import(VirtualImport::Css, program_filepath)?;

    let import_declaration = ast_builder.alloc_import_declaration(
        program.span,
        None,
        ast_builder.string_literal(program.span, ast_builder.atom(&module_id), None),
        None,
        None::<oxc_allocator::Box<WithClause>>,
        ImportOrExportKind::Value,
    );

    let insert_pos = program
        .body
        .iter()
        .position(|stmt| !matches!(stmt, Statement::ImportDeclaration(_)))
        .unwrap_or(0);

    program
        .body
        .insert(insert_pos, Statement::ImportDeclaration(import_declaration));
    Ok(())
}

/// JS expression of the object evaluated exports of `filepath` are stored in.
fn value_store(transformer: &Transformer, filepath: &str) -> String {
    let cache_ref = &transformer.value_cache_ref;
    format!("global.{cache_ref}[{filepath:?}]")
}

pub(crate) struct ProgramSlice<'alloc> {
    pub css_variable_identifiers: Vec<CssVariableIdentifier>,
    /// Identifiers the slice references, including local names of imports.
    pub referenced_idents: HashSet<String>,
    pub namespace_imports: HashMap<String, HashSet<String>>,
    /// exported name -> local name
    pub exported_idents: HashMap<String, String>,
    /// Program that only contains what's needed to evaluate the referenced identifiers.
    pub tmp_program: Program<'alloc>,
    /// The program is an entrypoint that doesn't use the library.
    pub return_early: bool,
    pub rewrote_merge_styles: bool,
}

/// Runs the prepasses on `program` and extracts the parts needed to evaluate
/// `referenced_idents` and the program's CSS into a separate program.
#[allow(clippy::too_many_arguments)]
pub(crate) fn slice_program<'alloc>(
    ast_builder: &'alloc AstBuilder<'alloc>,
    transformer: &Transformer,
    entrypoint: bool,
    cwd: &str,
    program_filepath: &str,
    program_code: &str,
    program: &mut Program<'alloc>,
    referenced_idents: HashSet<String>,
    value_cache: &mut HashSet<String>,
) -> Result<ProgramSlice<'alloc>, TransformError> {
    let store = value_store(transformer, program_filepath);

    // find "css" import or quit early if entrypoint
    let mut return_early = entrypoint;
    let mut solid_styled_name = None;
    let mut react_styled_name = None;
    let mut style_function_name = None;
    let mut css_function_name = None;
    let mut extra_class_function_name = None;

    for stmt in &program.body {
        let Statement::ImportDeclaration(import_decl) = stmt else {
            continue;
        };

        let Some(specifiers) = &import_decl.specifiers else {
            continue;
        };

        for specifier in specifiers.iter() {
            // TODO move loop 1 lvl up for perf
            match import_decl.source.value.as_str() {
                LIBRARY_CORE_IMPORT_NAME => {
                    match specifier {
                        oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(spec)
                            if spec.imported.name() == "css" =>
                        {
                            css_function_name = Some(spec.local.name.to_string());
                        }
                        oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(spec)
                            if spec.imported.name() == "style" =>
                        {
                            style_function_name = Some(spec.local.name.to_string());
                        }
                        oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(spec)
                            if spec.imported.name() == "extraClass" =>
                        {
                            extra_class_function_name = Some(spec.local.name.to_string());
                        }
                        _ => {
                            continue;
                        }
                    };
                    return_early = false;
                }
                source @ (LIBRARY_SOLID_JS_IMPORT_NAME | LIBRARY_REACT_IMPORT_NAME) => {
                    if let oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(spec) =
                        specifier
                        && spec.imported.name() == "styled"
                    {
                        let styled_name = if source == LIBRARY_SOLID_JS_IMPORT_NAME {
                            &mut solid_styled_name
                        } else {
                            &mut react_styled_name
                        };
                        *styled_name = Some(spec.local.name.to_string());
                        return_early = false;
                    }
                }
                _ => continue,
            }
        }
    }

    let relative_program_filepath = program_filepath
        .strip_prefix(cwd)
        .unwrap_or(program_filepath)
        .to_string();

    let mut class_display_names = ClassDisplayNames::new();

    if let Some(styled_name) = &solid_styled_name {
        solid_js_prepass(
            ast_builder,
            styled_name,
            relative_program_filepath.clone(),
            program,
            false,
            &mut class_display_names,
        );
    }

    if let Some(styled_name) = &react_styled_name {
        react_prepass(
            ast_builder,
            styled_name,
            relative_program_filepath,
            program,
            false,
            &mut class_display_names,
        );
    }

    let rewrote_merge_styles = !transformer.atomic && rewrite_merge_styles_imports(program, ast_builder);

    // Always run CSS transformer to extract exports, even if we'll return early
    // This is necessary for dependency tracking to know what a file exports
    let mut css_transformer = VisitorTransformer::new(
        ast_builder,
        ast_builder.allocator,
        &store,
        referenced_idents,
        cwd,
        program_filepath,
        program_code,
        value_cache,
        css_function_name,
        style_function_name,
        extra_class_function_name,
        class_display_names,
        transformer.atomic,
    );
    css_transformer.visit_program(program);
    if let Some(error) = css_transformer.error {
        return Err(error);
    }
    let (
        css_variable_identifiers,
        referenced_idents,
        namespace_imports,
        exported_idents,
        tmp_program,
    ) = css_transformer.finish();

    Ok(ProgramSlice {
        css_variable_identifiers,
        referenced_idents,
        namespace_imports,
        exported_idents,
        tmp_program,
        return_early,
        rewrote_merge_styles,
    })
}

/// * `skip_css_eval` - If we already have the cached CSS and just want the transformed source file, we can set
/// this flag to skip the evaluation portion.
/// * `import_chain` - Files currently being evaluated up the import chain, used to detect circular
/// imports.
#[allow(clippy::too_many_arguments)]
pub async fn evaluate_program<'alloc>(
    ast_builder: &'alloc AstBuilder<'alloc>,
    transformer: &Transformer,
    entrypoint: bool,
    cwd: &str,
    program_filepath: String,
    importer_filepath: Option<&str>,
    program_code: &str,
    program: &mut Program<'alloc>,
    mut referenced_idents: HashSet<String>,
    temporary_programs: Rc<RefCell<HashMap<String, String>>>,
    tx: Option<futures::channel::oneshot::Sender<Result<Option<JsValue>, TransformError>>>,
    skip_css_eval: bool,
    import_chain: &[String],
) -> Result<(), TransformError> {
    let allocator = &ast_builder.allocator;

    let entries = entrypoint.then(|| VirtualModuleEntries::capture(transformer, &program_filepath));

    let value_cache_guard = transformer
        .cache_registry
        .get_or_create_value_cache(program_filepath.clone());

    // released while awaiting dependencies, otherwise circular imports (also across concurrent
    // evaluations) deadlock
    let mut value_cache = value_cache_guard.lock().await;

    referenced_idents.retain(|ident| !value_cache.contains(ident));

    // We used to return early here if !entrypoint && referenced_idents.is_empty(),
    // but we need to continue to extract exports for dependency tracking
    // The CSS transformer visit is fast (just an AST walk), so we'll do it even if
    // the file doesn't use CSS

    let store = value_store(transformer, &program_filepath);

    let ProgramSlice {
        css_variable_identifiers,
        referenced_idents,
        mut namespace_imports,
        mut exported_idents,
        tmp_program,
        return_early: should_return_early,
        rewrote_merge_styles,
    } = match slice_program(
        ast_builder,
        transformer,
        entrypoint,
        cwd,
        &program_filepath,
        program_code,
        program,
        referenced_idents,
        &mut value_cache,
    ) {
        Ok(slice) => slice,
        Err(error) => {
            let Some(tx) = tx else {
                return Err(error);
            };
            if let Some(entries) = &entries {
                entries.resolve_all(&(&error).into());
            }
            let _ = tx.send(Err(error));
            return Ok(());
        }
    };

    // the evaluations of entrypoints and of their exports for importers register imports under
    // the same file, the ones of files it no longer imports are outdated either way
    if entrypoint {
        let module_ids = program_imports(program, ast_builder)
            .iter()
            .map(|import| import.source.value.to_string())
            .collect();
        let unimported = transformer
            .cache_registry
            .dependency_tracker()
            .borrow()
            .retain_file_imports(&program_filepath, &module_ids);
        // changes of files nothing imports aren't checked, their values would become outdated
        for file in unimported {
            transformer.cache_registry.clear_file(&file);
            transformer.cache_registry.update_module_code(&file, None);
        }
    }

    // Now check if we should return early (no CSS functions imported)
    // But we've already extracted exports, so dependency tracking will work
    if should_return_early {
        if let Some(entries) = &entries {
            // the virtual modules of a previous evaluation with CSS may still be requested, resolve
            // them as empty so they don't wait forever
            entries.resolve_all(&"".into());
            if transformer.atomic {
                transformer
                    .cache_registry
                    .set_file_atomic_declarations(&program_filepath, BTreeSet::new());
            }
        }

        if let Some(tx) = tx {
            // files only using `mergeStyles` still need the non-atomic rewrite emitted
            let result = (entrypoint && rewrote_merge_styles)
                .then(|| codegen_transform_result(program, &program_filepath));
            let _ = tx.send(Ok(result));
        }
        return Ok(());
    }

    let has_css = !css_variable_identifiers.is_empty();

    if entrypoint {
        if let Err(error) = insert_virtual_imports(
            program,
            ast_builder,
            transformer,
            &program_filepath,
            has_css,
        ) {
            let Some(tx) = tx else {
                return Err(error);
            };
            if let Some(entries) = &entries {
                entries.resolve_all(&(&error).into());
            }
            let _ = tx.send(Err(error));
            return Ok(());
        }

        if let Some(tx) = tx {
            let _ = tx.send(Ok(Some(codegen_transform_result(program, &program_filepath))));
        }
    }

    // first evaluate dependencies (imports) and transform imports into varible assignments
    // NOTE: We MUST do this even when skip_css_eval is true, because import registration
    // happens inside evaluate_dependencies. If we skip it, dependency tracking won't work.
    let mut eval_program = tmp_program;

    let css_file_store_ref = &transformer.css_file_store_ref;

    let dependency_futures = evaluate_dependencies(
        program,
        ast_builder,
        transformer,
        &referenced_idents,
        &mut namespace_imports,
        program_filepath.clone(),
        cwd,
        temporary_programs.clone(),
        skip_css_eval,
        Rc::new(
            import_chain
                .iter()
                .cloned()
                .chain([program_filepath.clone()])
                .collect(),
        ),
    );

    drop(value_cache);
    let dependency_statements = match futures::future::try_join_all(dependency_futures).await {
        Ok(statements) => statements,
        Err(err) => return report_error(entries.as_ref(), err),
    };
    // inserted in import order, independent of which dependency finished loading first
    for statement in dependency_statements.into_iter().flatten() {
        eval_program.body.insert(0, statement);
    }
    // the dependencies only had to register their imports. The exports aren't evaluated, so they
    // mustn't be cached, importers would read them from the store before it's populated
    if skip_css_eval {
        return Ok(());
    }
    let value_cache = value_cache_guard.lock().await;

    transpile_ts_to_js(allocator, &mut eval_program);

    if !eval_program.body.is_empty()
        && matches!(eval_program.body[0], Statement::ImportDeclaration(_))
    {
        eval_program.body.remove(0);
    }

    let mut eval_program_js = Codegen::new()
        .with_options(CodegenOptions::default())
        .build(&eval_program)
        .code;

    // we append all exported idents we evaluated to the cache
    let cached_exports = CachedExports::new(value_cache, exported_idents.keys().cloned().collect());

    // importers (which evaluate the file as a non-entrypoint) read the store even if none of the
    // names they import are values (e.g. types)
    if !entrypoint || !exported_idents.is_empty() {
        // the program's own exports take precedence over the ones of `export * from`
        let star_reexports = exported_idents
            .remove(STAR_IMPORT)
            .map(|local| format!("...{local},"))
            .unwrap_or_default();

        // TODO this only needs to be sorted for tests to stay consistent
        let mut idents: Vec<String> = exported_idents
            .into_iter()
            .map(|(exported, local)| {
                if exported == local {
                    local
                } else {
                    format!("{exported:?}: {local}")
                }
            })
            .collect();
        idents.sort();
        let idents = idents.join(",");

        eval_program_js.push_str(&format!(
            "\n{store} = {{...({store} ?? {{}}), {star_reexports}{idents}}};"
        ));
    }

    if entrypoint && has_css {
        if transformer.atomic {
            let css_return_statements = css_variable_identifiers
                .iter()
                .map(|css_var| {
                    let var = &css_var.variable_name;
                    format!("\"{var}\": {var}.css")
                })
                .collect::<Vec<_>>()
                .join(",\n");

            eval_program_js.push_str(&formatdoc!(
                "
                return {{
                {css_return_statements}
                }};
                "
            ));
        } else {
            // ===== NON-ATOMIC MODE =====
            // Keep existing behavior: inline CSS resolution
            let css = css_variable_identifiers
                .iter()
                .map(|css_var| {
                    let classname = &css_var.classname;
                    let var = &css_var.variable_name;

                    if css_var.classname.starts_with("_Global") {
                        return format!("`${{{var}.css}}\n`");
                    }

                    format!("`.{classname} {{\n${{{var}.css}}\n}}`")
                })
                .collect::<Vec<_>>()
                .join(",\n");

            eval_program_js.push_str(&formatdoc!(
                "
                return [\n{css}\n].join('\\n');
                ",
            ));
        }
    }

    if transformer.debug
        && let Some(on_debug_virtual_module) = &transformer.on_debug_virtual_module
    {
        let importer_part = if let Some(importer_filepath) = importer_filepath {
            format!(" ({importer_filepath})")
        } else {
            String::new()
        };
        let mut sorted_idents = referenced_idents.iter().map(|ident| format!("{ident:?}")).collect::<Vec<_>>();
        sorted_idents.sort();
        let key = format!("{program_filepath}{importer_part}: {{{}}}", sorted_idents.join(", "));

        // a debug hook, its errors mustn't fail the transform
        let _ = on_debug_virtual_module.call2(
            &JsValue::UNDEFINED,
            &JsValue::from_str(&key),
            &JsValue::from_str(&eval_program_js),
        );
    }

    let value_cache_ref = &transformer.value_cache_ref;

    // Handle atomic vs non-atomic mode evaluation
    // In atomic mode, only process CSS for entrypoint files
    // Non-entrypoint files are just evaluated for their exports
    if transformer.atomic && entrypoint && has_css {
        // ===== ATOMIC MODE: Process CSS Blocks (Entrypoint Only) =====
        // Wrap eval_program_js in async IIFE to get the CSS blocks

        let eval_program_js = wrap_eval_program(
            &eval_program_js,
            css_file_store_ref,
            value_cache_ref,
            transformer.require_ref.as_deref(),
        );

        let evaluated = match evaluate(
            allocator,
            transformer.debug,
            &program_filepath,
            program_code,
            &eval_program,
            &eval_program_js,
        )
        .await
        {
            Ok(v) => v,
            Err(err) => return report_error(entries.as_ref(), err),
        };
        cached_exports.commit();

        // Extract CSS blocks from evaluated object
        // the program can only return the object literal appended above
        let obj = evaluated.unchecked_into::<js_sys::Object>();
        let keys = js_sys::Object::keys(&obj);
        let mut css_blocks: HashMap<String, String> = HashMap::new();

        for key_value in keys.iter() {
            if let Some(var_name) = key_value.as_string()
                && let Ok(css_string) = js_sys::Reflect::get(&obj, &JsValue::from_str(&var_name))
                && let Some(css_str) = css_string.as_string()
            {
                css_blocks.insert(var_name, css_str);
            }
        }

        // Parse each CSS block into atomic + non-atomic classes
        let mut variable_to_atomics: HashMap<String, BTreeSet<String>> = HashMap::new();
        let mut atomic_declarations = BTreeSet::new();
        let mut module_css = String::new();

        for css_var in css_variable_identifiers.iter() {
            if let Some(css_string) = css_blocks.get(&css_var.variable_name) {
                let classname = &css_var.classname;

                // Global styles don't need a wrapper selector
                if css_var.classname.starts_with("_Global") {
                    module_css.push_str(&format!("{}\n", css_string));
                    continue;
                }

                let parse_result = css_parser::parse_css(css_string);

                let declarations = dedupe_atomic_declarations(parse_result.atomizable);
                let atomic_classes: BTreeSet<String> = declarations
                    .iter()
                    .filter_map(|decl| add_atomic(decl.as_str(), &transformer.cache_registry))
                    .collect();
                atomic_declarations.extend(declarations.into_iter().map(|decl| decl.trim().to_string()));

                variable_to_atomics.insert(css_var.variable_name.clone(), atomic_classes);

                if let Some(non_atomizable) = parse_result.non_atomizable {
                    module_css.push_str(&format!(".{classname} {{ {} }}\n", non_atomizable));
                } else {
                    module_css.push_str(&format!(".{classname} {{ /* marker */ }}\n"));
                }
            }
        }

        // Generate the atomic module for .style-this.js
        let empty_set = BTreeSet::new();
        let atomic_module = css_variable_identifiers
            .iter()
            .map(|css_var| {
                let var = &css_var.variable_name;
                let classname = &css_var.classname;

                let atomics = variable_to_atomics
                    .get(&css_var.variable_name)
                    .unwrap_or(&empty_set);

                let mut all_classes: Vec<String> = vec![classname.clone()];
                all_classes.extend(atomics.iter().cloned());
                all_classes.extend(css_var.extra_classes.iter().cloned());

                let class_list = all_classes.join(" ");
                format!("export const {var} = {class_list:?}")
            })
            .collect::<Vec<_>>()
            .join(";\n");

        // CSS string already contains all non-atomizable CSS, trim trailing newline
        let css = module_css.trim_end();

        transformer
            .cache_registry
            .set_file_atomic_declarations(&program_filepath, atomic_declarations);

        // Stage 2: Resolve .style-this.js with atomic exports and .css with non-atomizable CSS.
        if let Some(entries) = &entries {
            entries.resolve_css(&css.into(), &css_variable_identifiers);
            entries.resolve_atomic(&atomic_module.into());
        }

        return Ok(());
    }

    if transformer.atomic && entrypoint {
        // files with CSS are handled above, the declarations of a previous evaluation are outdated
        transformer
            .cache_registry
            .set_file_atomic_declarations(&program_filepath, BTreeSet::new());
    }

    // wrap into promise and hide global symbols
    let eval_program_js = wrap_eval_program(
        &eval_program_js,
        css_file_store_ref,
        value_cache_ref,
        transformer.require_ref.as_deref(),
    );

    let evaluated = match evaluate(
        allocator,
        transformer.debug,
        &program_filepath,
        program_code,
        &eval_program,
        &eval_program_js,
    )
    .await
    {
        Ok(v) => v,
        Err(err) => return report_error(entries.as_ref(), err),
    };
    cached_exports.commit();

    if let Some(entries) = &entries {
        if has_css {
            // non-atomic entrypoints return their CSS
            entries.resolve_css(&evaluated, &css_variable_identifiers);
        } else {
            // entrypoints without any CSS still get their virtual modules requested, resolve them
            // as empty so they don't wait forever
            entries.resolve_all(&"".into());
        }
    }

    Ok(())
}

/// Evaluates the wrapped program, mapping the error locations of the evaluated code to the source.
async fn evaluate(
    allocator: &oxc_allocator::Allocator,
    debug: bool,
    program_filepath: &str,
    program_code: &str,
    eval_program: &Program<'_>,
    eval_program_js: &str,
) -> Result<JsValue, TransformError> {
    let evaluation_failed = |cause: JsValue| TransformError::EvaluationFailed {
        filepath: program_filepath.to_string(),
        program: debug.then(|| eval_program_js.to_string()),
        cause,
    };

    let promise = js_sys::eval(eval_program_js).map_err(evaluation_failed)?;
    wasm_bindgen_futures::JsFuture::from(js_sys::Promise::from(promise))
        .await
        .map_err(|cause| {
            error_mapping::resolve_err(
                allocator,
                &cause,
                program_filepath,
                program_code,
                eval_program,
                eval_program_js,
            );
            evaluation_failed(cause)
        })
}

/// Exports added to the value cache before evaluating them, they're only stored at the end of the
/// program. Unless committed after a successful evaluation they're removed again on drop, also when
/// the evaluation is dropped mid-flight (e.g. `try_join_all` of a failing sibling dependency), so
/// the next importer evaluates them again instead of reading the missing values from the store.
struct CachedExports<'a> {
    value_cache: futures::lock::MutexGuard<'a, HashSet<String>>,
    exports: Vec<String>,
}

impl<'a> CachedExports<'a> {
    fn new(mut value_cache: futures::lock::MutexGuard<'a, HashSet<String>>, exports: Vec<String>) -> Self {
        value_cache.extend(exports.iter().cloned());
        Self { value_cache, exports }
    }

    fn commit(mut self) {
        self.exports.clear();
    }
}

impl Drop for CachedExports<'_> {
    fn drop(&mut self) {
        self.value_cache.retain(|ident| !self.exports.contains(ident));
    }
}

/// Virtual module entries of an entrypoint, captured when its evaluation starts. Edits during the
/// evaluation replace the entries in the stores, the stale result must only resolve the old ones.
struct VirtualModuleEntries {
    css: JsValue,
    css_filepath: String,
    atomic: JsValue,
}

impl VirtualModuleEntries {
    fn capture(transformer: &Transformer, program_filepath: &str) -> Self {
        let get = |store_ref: &str, key: &str| {
            js_sys::Reflect::get(&js_sys::global(), &JsValue::from_str(store_ref))
                .ok()
                .and_then(|store| store.dyn_into::<js_sys::Map>().ok())
                .map(|store| store.get(&JsValue::from_str(key)))
                .unwrap_or(JsValue::UNDEFINED)
        };

        let css_filepath = format!("{program_filepath}.{}", transformer.css_extension);
        Self {
            css: get(&transformer.css_file_store_ref, &css_filepath),
            atomic: get(
                &transformer.atomic_file_store_ref,
                &format!("{program_filepath}.style-this.js"),
            ),
            css_filepath,
        }
    }

    fn resolve(entry: &JsValue, args: &js_sys::Array) {
        if let Ok(resolve) = js_sys::Reflect::get(entry, &JsValue::from_str("resolve"))
            && let Ok(resolve) = resolve.dyn_into::<js_sys::Function>()
        {
            let _ = resolve.apply(entry, args);
        }
    }

    fn resolve_css(&self, css: &JsValue, css_variable_identifiers: &[CssVariableIdentifier]) {
        let sourcemap_data = css_variable_identifiers
            .iter()
            .map(|css_var| {
                let data = js_sys::Object::new();
                let set = |key: &str, value: JsValue| {
                    js_sys::Reflect::set(&data, &JsValue::from_str(key), &value).unwrap();
                };
                set("className", JsValue::from_str(&css_var.classname));
                set("start", css_var.span.start.into());
                set("end", css_var.span.end.into());
                data
            })
            .collect::<js_sys::Array>();

        let args = js_sys::Array::of3(css, &sourcemap_data, &JsValue::from_str(&self.css_filepath));
        Self::resolve(&self.css, &args);
    }

    fn resolve_atomic(&self, value: &JsValue) {
        Self::resolve(&self.atomic, &js_sys::Array::of1(value));
    }

    fn resolve_all(&self, value: &JsValue) {
        let args = js_sys::Array::of1(value);
        Self::resolve(&self.css, &args);
        Self::resolve(&self.atomic, &args);
    }
}

/// Entrypoints report errors through their virtual modules, dependencies pass them on to their
/// importer.
fn report_error(
    entries: Option<&VirtualModuleEntries>,
    err: TransformError,
) -> Result<(), TransformError> {
    let Some(entries) = entries else {
        return Err(err);
    };

    entries.resolve_all(&err.into());
    Ok(())
}

/// Resolves the entrypoint's pending virtual modules with `err`, so their waiters don't hang. Only
/// for errors before `evaluate_program` captured the entries, the current entries in the stores
/// belong to this transform then.
pub(crate) fn resolve_virtual_modules_with_error(
    transformer: &Transformer,
    program_filepath: &str,
    err: &TransformError,
) {
    VirtualModuleEntries::capture(transformer, program_filepath).resolve_all(&err.into());
}
