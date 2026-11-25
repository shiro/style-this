use super::cache_registry::CacheRegistry;
use super::error::TransformError;
use super::transformer::{Transformer, VirtualImport};
use crate::LIBRARY_CORE_IMPORT_NAME;
use oxc_allocator::ArenaVec;
use oxc_ast::ast::{
    BindingIdentifier, ImportDeclaration, ImportDeclarationSpecifier, ImportOrExportKind, Program,
    Statement, Str, StringLiteral,
};
use oxc_ast::builder::AstBuilder;
use once_cell::sync::Lazy;
use std::collections::{BTreeMap, HashMap, HashSet};

/// Entries of a JSON table shared with the TS runtime (`mergeStyles`). The JSON is a flat object
/// of strings without escapes, so every quoted string is either a key or a value.
fn flat_json_entries(json: &'static str) -> Vec<(&'static str, &'static str)> {
    let strings: Vec<&'static str> = json.split('"').skip(1).step_by(2).collect();
    strings
        .chunks_exact(2)
        .map(|pair| (pair[0], pair[1]))
        .collect()
}

/// Property -> class prefix
static ATOMIC_PREFIXES: Lazy<HashMap<&'static str, &'static str>> =
    Lazy::new(|| flat_json_entries(include_str!("../../../src/atomicPrefixes.json")).into_iter().collect());

/// Shorthand -> the longhands it fully overrides, transitively (`margin` includes `margin-inline-start`)
static ATOMIC_SHORTHANDS: Lazy<HashMap<&'static str, Vec<&'static str>>> = Lazy::new(|| {
    flat_json_entries(include_str!("../../../src/atomicShorthands.json"))
        .into_iter()
        .map(|(shorthand, longhands)| (shorthand, longhands.split(' ').collect()))
        .collect()
});

pub fn atomic_prefix(property: &str) -> Option<&'static str> {
    ATOMIC_PREFIXES
        .get(property.trim().to_ascii_lowercase().as_str())
        .copied()
}

pub fn declaration_property(declaration: &str) -> &str {
    declaration
        .split_once(':')
        .map(|(property, _)| property.trim())
        .unwrap_or("")
}

/// Shorthands get a lower rank than their longhands so that longhands are emitted later and win
/// (e.g. `margin` before `margin-top`).
fn property_rank(property: &str) -> usize {
    let property = property.to_ascii_lowercase();
    let dashes = property.trim_start_matches('-').matches('-').count();
    match property.as_str() {
        "top" | "right" | "bottom" | "left" => 1,
        "flex-flow" | "place-items" | "place-content" | "place-self" | "grid-area" | "vertical-align" => 0,
        _ => dashes,
    }
}

/// Sort atomic rules (declaration, class name) deterministically, shorthands first.
pub fn sort_atomic_rules(rules: &mut [(&String, &String)]) {
    rules.sort_by(|(decl_a, class_a), (decl_b, class_b)| {
        property_rank(declaration_property(decl_a))
            .cmp(&property_rank(declaration_property(decl_b)))
            .then_with(|| class_a.cmp(class_b))
            .then_with(|| decl_a.cmp(decl_b))
    });
}

/// Atomic rules of `declarations`, with every rank (see `property_rank`) in its own cascade layer
/// (`r0`, `r1`, ...). The order of rules then doesn't matter, so stylesheets sharing declarations
/// can be loaded in any order and shorthands still lose against their longhands. All rank layers
/// up to the highest one are declared first, which keeps them ordered across stylesheets.
pub fn rank_layered_atomic_css<'a>(declarations: impl IntoIterator<Item = &'a String>) -> String {
    let mut ranks: BTreeMap<usize, Vec<(&String, String)>> = BTreeMap::new();
    for declaration in declarations {
        let Some(class) = generate_atomic_class_name(declaration) else {
            continue;
        };
        ranks
            .entry(property_rank(declaration_property(declaration)))
            .or_default()
            .push((declaration, class));
    }
    let Some(&max_rank) = ranks.keys().next_back() else {
        return String::new();
    };

    let layers = (0..=max_rank).map(|rank| format!("r{rank}")).collect::<Vec<_>>();
    let mut css = format!("@layer {};", layers.join(", "));
    for (rank, rules) in ranks {
        let mut rules: Vec<(&String, &String)> =
            rules.iter().map(|(declaration, class)| (*declaration, class)).collect();
        sort_atomic_rules(&mut rules);
        css.push_str(&format!("\n@layer r{rank} {{"));
        for (declaration, class) in rules {
            css.push_str(&format!("\n.{class} {{ {declaration} }}"));
        }
        css.push_str("\n}");
    }
    css
}

/// Generate the atomic class name `<prefix>-<hash>` for a declaration, `None` if its property has
/// no prefix. The hash only depends on the declaration, so it's stable across builds.
pub fn generate_atomic_class_name(statement: &str) -> Option<String> {
    atomic_prefix(declaration_property(statement))
        .map(|prefix| format!("{prefix}-{}", generate_atomic_hash(statement)))
}

/// Join the declarations of each property into a single declaration (and class), so fallbacks
/// (`display: -webkit-box; ...; display: flex`) keep their order, and drop longhands followed by
/// their shorthand (`margin-top` before `margin`), mirroring `mergeStyles` semantics. Longhands
/// always win against shorthands in the atomic CSS (see `property_rank`), so they can't be kept.
/// Properties are matched by prefix, which aliases (`font-stretch`, `font-width`) share.
pub fn dedupe_atomic_declarations(declarations: Vec<String>) -> Vec<String> {
    // prefixes set by a later declaration
    let mut overridden = HashSet::new();
    // prefix -> index in `result` of the declarations earlier ones are joined with
    let mut joinable = HashMap::new();
    let mut result: Vec<String> = Vec::new();
    for declaration in declarations.into_iter().rev() {
        let property = declaration_property(&declaration).to_ascii_lowercase();
        let prefix = atomic_prefix(&property).unwrap_or(&property).to_string();
        if let Some(&index) = joinable.get(&prefix) {
            result[index] = format!("{declaration}; {}", result[index]);
        } else if overridden.insert(prefix.clone()) {
            joinable.insert(prefix, result.len());
            result.push(declaration);
        }
        // a shorthand resets its longhands, earlier ones can't be fallbacks of later ones
        for longhand in ATOMIC_SHORTHANDS.get(property.as_str()).into_iter().flatten() {
            let longhand = atomic_prefix(longhand).unwrap_or(longhand);
            joinable.remove(longhand);
            overridden.insert(longhand.to_string());
        }
    }
    result.reverse();
    result
}

/// Generate a deterministic 5-character hash from a full CSS declaration statement (e.g., "color: red").
/// It starts with an uppercase letter, so `mergeStyles` can tell atomic classes apart from
/// hand-written ones like `bg-light`. Keep in sync with `ATOMIC_CLASS` in `src/index.ts`.
pub fn generate_atomic_hash(statement: &str) -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};

    let input = statement.trim();
    let mut hasher = DefaultHasher::new();
    input.hash(&mut hasher);
    let hash = hasher.finish();

    let first_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_";
    let mut result = String::new();
    let mut n = hash;

    result.push(first_chars.chars().nth((n % 26) as usize).unwrap());
    n /= 26;

    for _ in 0..4 {
        result.push(chars.chars().nth((n % 64) as usize).unwrap());
        n /= 64;
    }

    result
}

/// Create atomic class for a CSS declaration
pub fn add_atomic(declaration: &str, cache_registry: &CacheRegistry) -> Option<String> {
    let key = declaration.trim().to_string();
    let class_name = generate_atomic_class_name(&key)?;
    cache_registry.insert_atomic_class(key, class_name.clone());
    Some(class_name)
}

/// In non-atomic mode there are no atomic classes to de-dupe, so `mergeStyles` imports from
/// `@style-this/core` are swapped for the plain `joinStyles`.
pub fn rewrite_merge_styles_imports<'alloc>(
    program: &mut Program<'alloc>,
    ast_builder: &AstBuilder<'alloc>,
) -> bool {
    use oxc_ast::ast::ModuleExportName;

    let mut rewrote = false;
    for stmt in program.body.iter_mut() {
        let Statement::ImportDeclaration(import_decl) = stmt else {
            continue;
        };
        if import_decl.source.value.as_str() != Some(LIBRARY_CORE_IMPORT_NAME) {
            continue;
        }
        let Some(specifiers) = import_decl.specifiers.as_mut() else {
            continue;
        };
        for specifier in specifiers.iter_mut() {
            if let ImportDeclarationSpecifier::ImportSpecifier(spec) = specifier
                && spec.imported.name() == "mergeStyles"
            {
                spec.imported = ModuleExportName::new_identifier_name(
                    spec.span,
                    "joinStyles",
                    ast_builder,
                );
                rewrote = true;
            }
        }
    }
    rewrote
}

/// Local name of the atomic `.style-this.js` module's namespace import.
pub const ATOMIC_CLASSES_IDENT: &str = "_styleThisClasses";

/// Whether `import_decl` is the import inserted by `insert_virtual_atomic_program_import`.
pub fn is_atomic_program_import(import_decl: &ImportDeclaration) -> bool {
    import_decl.specifiers.as_ref().is_some_and(|specifiers| {
        specifiers.iter().any(|specifier| {
            matches!(
                specifier,
                ImportDeclarationSpecifier::ImportNamespaceSpecifier(namespace)
                    if namespace.local.name == ATOMIC_CLASSES_IDENT
            )
        })
    })
}

/// Insert a namespace import for the atomic .style-this.js module in atomic mode
/// Creates: import * as _styleThisClasses from "virtual:style-this:filename.style-this.js"
pub fn insert_virtual_atomic_program_import<'alloc>(
    program: &mut Program<'alloc>,
    ast_builder: &'alloc AstBuilder<'alloc>,
    transformer: &Transformer,
    program_filepath: &str,
) -> Result<(), TransformError> {
    let specifiers = [ImportDeclarationSpecifier::new_import_namespace_specifier(
        program.span,
        BindingIdentifier::new(program.span, ATOMIC_CLASSES_IDENT, ast_builder),
        ast_builder,
    )];

    let style_this_import_source =
        transformer.virtual_import(VirtualImport::AtomicProgram, program_filepath)?;

    let style_this_import = Statement::new_import_declaration(
        program.span,
        Some(ArenaVec::from_iter_in(specifiers, ast_builder)),
        StringLiteral::new(
            program.span,
            Str::from_str_in(&style_this_import_source, ast_builder),
            None,
            ast_builder,
        ),
        None,
        None,
        ImportOrExportKind::Value,
        ast_builder,
    );

    let insert_pos = program
        .body
        .iter()
        .position(|stmt| !matches!(stmt, Statement::ImportDeclaration(_)))
        .unwrap_or(0);

    program.body.insert(insert_pos, style_this_import);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn prefixes_are_unique() {
        // aliases of the same property share a prefix
        const ALIASES: &[&str] = &["font-width"];
        let mut seen = HashSet::new();
        for (_, prefix) in ATOMIC_PREFIXES.iter().filter(|(property, _)| !ALIASES.contains(property)) {
            assert!(seen.insert(*prefix), "duplicate atomic prefix '{prefix}'");
        }
        assert_eq!(atomic_prefix("font-width"), atomic_prefix("font-stretch"));
        assert!(ATOMIC_PREFIXES.len() > 100);
    }

    #[test]
    fn class_name_is_prefixed_hash() {
        assert_eq!(atomic_prefix("margin"), Some("m"));
        assert_eq!(atomic_prefix(" Padding-Top "), Some("pt"));
        assert_eq!(
            generate_atomic_class_name("margin: 8px"),
            Some(format!("m-{}", generate_atomic_hash("margin: 8px")))
        );
        assert_eq!(generate_atomic_class_name("margin: 8px").unwrap(), "m-EY4CD");
        assert_eq!(generate_atomic_class_name("color: red").unwrap(), "c-TwPQN");
        assert_eq!(generate_atomic_class_name("--custom: 1"), None);
    }

    #[test]
    fn class_name_edge_cases() {
        let generate_atomic_class_name = |decl| generate_atomic_class_name(decl).unwrap();
        // property is matched case-insensitively, but the hash covers the exact declaration
        assert!(generate_atomic_class_name("MARGIN: 8px").starts_with("m-"));
        assert!(generate_atomic_class_name("margin: 8px !important").starts_with("m-"));
        assert!(generate_atomic_class_name("min-width: 0").starts_with("min-w-"));
        assert!(
            generate_atomic_class_name("grid-template-areas:\n  \"a b\"\n  \"c d\"")
                .starts_with("grid-areas-")
        );
        // surrounding whitespace doesn't affect the class
        assert_eq!(
            generate_atomic_class_name("  margin: 8px  "),
            generate_atomic_class_name("margin: 8px")
        );
        assert_ne!(
            generate_atomic_class_name("margin: 8px"),
            generate_atomic_class_name("margin: 9px")
        );
        for decl in ["margin: 8px", "background: url(a:b)", "content: ':'"] {
            let class = generate_atomic_class_name(decl);
            let hash = &class[class.len() - 5..];
            assert_eq!(&class[class.len() - 6..class.len() - 5], "-");
            assert!(hash.chars().next().unwrap().is_ascii_uppercase());
        }
        assert!(generate_atomic_class_name("background: url(a:b)").starts_with("bg-"));
    }

    #[test]
    fn dedupe_joins_fallbacks() {
        let result = dedupe_atomic_declarations(
            [
                "display: -webkit-box",
                "Width: 100%",
                "width: -webkit-fill-available",
                "color: red",
                "display: flex",
                "margin-top: 1px",
                "margin-top: 2px",
                "margin: 0",
                "margin-left: 1px",
                "margin: 2px",
                "font-stretch: 50%",
                "font-width: 50%",
                "color: blue",
            ]
            .map(String::from)
            .to_vec(),
        );
        assert_eq!(
            result,
            vec![
                "Width: 100%; width: -webkit-fill-available",
                "display: -webkit-box; display: flex",
                "margin: 0; margin: 2px",
                "font-stretch: 50%; font-width: 50%",
                "color: red; color: blue",
            ]
        );
    }

    #[test]
    fn dedupe_doesnt_join_fallbacks_reset_by_a_shorthand() {
        // `margin` resets `margin-left: 1px`, so it's no fallback of `margin-left: 2px`
        let result = dedupe_atomic_declarations(
            ["margin-left: 1px", "margin: 0", "margin-left: 2px"].map(String::from).to_vec(),
        );
        assert_eq!(result, vec!["margin: 0", "margin-left: 2px"]);
    }

    #[test]
    fn dedupe_drops_longhands_followed_by_their_shorthand() {
        let result = dedupe_atomic_declarations(
            [
                "margin-inline-start: 1px",
                "border-top-color: red",
                "margin-top: 2px",
                "border-radius: 4px",
                "margin: 0",
                "margin-bottom: 8px",
                "border: 0",
            ]
            .map(String::from)
            .to_vec(),
        );
        assert_eq!(result, vec!["border-radius: 4px", "margin: 0", "margin-bottom: 8px", "border: 0"]);
    }

    #[test]
    fn shorthand_table_is_consistent() {
        for (shorthand, longhands) in ATOMIC_SHORTHANDS.iter() {
            assert!(atomic_prefix(shorthand).is_some(), "'{shorthand}' has no prefix");
            for longhand in longhands {
                assert!(atomic_prefix(longhand).is_some(), "'{longhand}' has no prefix");
                // a longhand must win against its shorthand in the atomic CSS
                assert!(property_rank(longhand) > property_rank(shorthand), "'{longhand}' ranks below '{shorthand}'");
                // transitive, so de-duping only has to look up the shorthand
                for nested in ATOMIC_SHORTHANDS.get(longhand).into_iter().flatten() {
                    assert!(longhands.contains(nested), "'{shorthand}' is missing '{nested}' of '{longhand}'");
                }
            }
            // shorthands it fully overrides (`border-image` of `border`) are dropped too
            for (nested, nested_longhands) in ATOMIC_SHORTHANDS.iter() {
                if nested != shorthand && nested_longhands.iter().all(|longhand| longhands.contains(longhand)) {
                    assert!(longhands.contains(nested), "'{shorthand}' is missing '{nested}'");
                }
            }
        }
    }

    /// Longhands reset by shorthands that lightningcss doesn't know about, per the specs (if a
    /// browser implements them), and logical longhands sharing their value with reset physical ones.
    const SPEC_LONGHANDS: &[(&str, &str)] = &[
        (
            "border-radius",
            "border-start-start-radius border-start-end-radius border-end-start-radius border-end-end-radius",
        ),
        ("overflow", "overflow-inline overflow-block"),
        (
            "font",
            "font-width font-variant-ligatures font-variant-alternates font-variant-numeric \
             font-variant-east-asian font-variant-position font-variant-emoji font-kerning \
             font-size-adjust font-feature-settings font-variation-settings font-optical-sizing \
             font-language-override",
        ),
        (
            "font-variant",
            "font-variant-ligatures font-variant-caps font-variant-alternates font-variant-numeric \
             font-variant-east-asian font-variant-position font-variant-emoji",
        ),
        (
            "border",
            "border-image-source border-image-slice border-image-width border-image-outset border-image-repeat",
        ),
        ("columns", "column-width column-count column-height column-wrap"),
        ("white-space", "white-space-collapse text-wrap-mode white-space-trim"),
        ("text-wrap", "text-wrap-mode text-wrap-style"),
        ("vertical-align", "alignment-baseline baseline-shift baseline-source"),
        ("transition", "transition-behavior"),
        ("animation", "animation-range-start animation-range-end"),
        ("animation-range", "animation-range-start animation-range-end"),
    ];

    fn reset_longhands(shorthand: &str) -> Vec<String> {
        use lightningcss::properties::PropertyId;

        let known = PropertyId::from(shorthand).longhands().into_iter().flatten();
        let spec = SPEC_LONGHANDS.iter().filter(|(name, _)| *name == shorthand);
        known
            .map(|longhand| longhand.name().to_string())
            .chain(spec.flat_map(|(_, longhands)| longhands.split_whitespace().map(String::from)))
            .collect()
    }

    /// Longhands of atomized shorthands must be atomized too. Unlayered (per-file) ones would win
    /// against later shorthands, and `mergeStyles` couldn't drop them.
    #[test]
    fn shorthand_table_covers_longhands() {
        for property in ATOMIC_PREFIXES.keys() {
            let listed = ATOMIC_SHORTHANDS.get(property).cloned().unwrap_or_default();
            for longhand in reset_longhands(property) {
                assert!(listed.contains(&longhand.as_str()), "'{property}' is missing '{longhand}'");
            }
        }
    }

    /// Shorthands of atomized longhands must be atomized too, unlayered ones would win against
    /// later longhands.
    #[test]
    fn shorthands_of_atomized_longhands_are_atomized() {
        for longhand in ATOMIC_PREFIXES.keys() {
            // shorthands are named by a subset of their longhands' segments
            // (`border-inline-width` of `border-inline-start-width`)
            let segments: Vec<&str> = longhand.split('-').collect();
            let named = (0..1 << (segments.len() - 1)).map(|mask: u32| {
                let mut name = segments[0].to_string();
                for (i, segment) in segments[1..].iter().enumerate() {
                    if mask >> i & 1 == 1 {
                        name = format!("{name}-{segment}");
                    }
                }
                name
            });
            let spec = SPEC_LONGHANDS.iter().map(|(shorthand, _)| shorthand.to_string());
            for shorthand in named.chain(spec) {
                // no browser supports `caret`
                if shorthand == "caret" || !reset_longhands(&shorthand).contains(&longhand.to_string()) {
                    continue;
                }
                assert!(atomic_prefix(&shorthand).is_some(), "'{shorthand}' of '{longhand}' has no prefix");
            }
        }
    }

    #[test]
    fn shorthands_sort_before_longhands() {
        let decls = ["margin-top: 1px", "margin: 0", "top: 0", "inset: 0", "flex-direction: row", "flex-flow: row"]
            .map(String::from);
        let classes = decls.clone().map(|d| generate_atomic_class_name(&d).unwrap());
        let mut entries: Vec<(&String, &String)> = decls.iter().zip(classes.iter()).collect();
        sort_atomic_rules(&mut entries);
        let order: Vec<&str> = entries.iter().map(|(d, _)| d.as_str()).collect();
        let pos = |d: &str| order.iter().position(|o| *o == d).unwrap();
        assert!(pos("margin: 0") < pos("margin-top: 1px"));
        assert!(pos("inset: 0") < pos("top: 0"));
        assert!(pos("flex-flow: row") < pos("flex-direction: row"));
    }

    #[test]
    fn rank_layers_are_declared_up_to_the_highest_rank() {
        let decls = ["margin-top: 1px", "border-top-width: 2px", "margin: 0"].map(String::from);
        let class = |decl| generate_atomic_class_name(decl).unwrap();
        assert_eq!(
            rank_layered_atomic_css(&decls),
            format!(
                "@layer r0, r1, r2;\n\
                 @layer r0 {{\n.{} {{ margin: 0 }}\n}}\n\
                 @layer r1 {{\n.{} {{ margin-top: 1px }}\n}}\n\
                 @layer r2 {{\n.{} {{ border-top-width: 2px }}\n}}",
                class("margin: 0"),
                class("margin-top: 1px"),
                class("border-top-width: 2px"),
            )
        );
        assert_eq!(rank_layered_atomic_css(&[]), "");
    }
}
