use crate::*;

pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

pub fn binding_pattern_kind_get_idents<'a>(kind: &BindingPatternKind<'a>) -> HashSet<String> {
    let mut idents = HashSet::new();
    match kind {
        BindingPatternKind::BindingIdentifier(binding_identifier) => {
            idents.insert(binding_identifier.name.to_string());
        }
        BindingPatternKind::ObjectPattern(object_pattern) => {
            let local_idents = object_pattern
                .properties
                .iter()
                .map(|v| binding_pattern_kind_get_idents(&v.value.kind))
                .fold(HashSet::new(), |mut acc, hashset| {
                    acc.extend(hashset);
                    acc
                });
            idents.extend(local_idents);

            if let Some(rest) = &object_pattern.rest {
                idents.extend(binding_pattern_kind_get_idents(&rest.argument.kind));
            }
        }
        BindingPatternKind::ArrayPattern(array_pattern) => {
            let local_idents = array_pattern
                .elements
                .iter()
                .filter_map(|element| element.as_ref())
                .map(|element| binding_pattern_kind_get_idents(&element.kind))
                .fold(HashSet::new(), |mut acc, hashset| {
                    acc.extend(hashset);
                    acc
                });
            idents.extend(local_idents);

            if let Some(rest) = &array_pattern.rest {
                idents.extend(binding_pattern_kind_get_idents(&rest.argument.kind));
            }
        }
        BindingPatternKind::AssignmentPattern(assignment_pattern) => {
            idents.extend(binding_pattern_kind_get_idents(
                &assignment_pattern.left.kind,
            ));
        }
    };
    idents
}

pub fn generate_random_id(length: usize) -> String {
    (0..length)
        .map(|_| {
            let chars = b"abcdefghijklmnopqrstuvwxyz0123456789";
            let idx = (js_sys::Math::random() * chars.len() as f64) as usize;
            chars[idx] as char
        })
        .collect()
}
