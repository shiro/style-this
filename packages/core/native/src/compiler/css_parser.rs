use lightningcss::rules::CssRule;
use lightningcss::stylesheet::{ParserOptions, StyleSheet};
use std::collections::HashSet;

/// Result of parsing a CSS block
#[derive(Debug, Clone)]
pub struct ParseCssResult {
    /// Statements that can be atomized (simple top-level declarations)
    pub atomizable: HashSet<String>,
    /// Remaining CSS that cannot be atomized (media queries, nested rules, etc.)
    pub non_atomizable: Option<String>,
}

pub fn parse_css(css: &str) -> ParseCssResult {
    // STRATEGY:
    // 1. Split CSS into top-level segments (declarations and blocks) by tracking brace depth
    //    This handles multi-line declarations correctly (preserves newlines).
    // 2. For each top-level declaration, validate it with lightningcss.
    // 3. Build atomizable/non-atomizable sets, then reconstruct non-atomizable CSS
    //    by line-by-line filtering to preserve original formatting.
    //
    // WHY NOT use lightningcss to parse the whole wrapped CSS?
    // - lightningcss normalizes CSS: `color: red` -> `RGBA(...)`, `margin: 10px` -> `Margin { top: ... }`
    // - We need to preserve ORIGINAL TEXT for proper formatting and special values like calc()
    // - lightningcss also puts bare declarations in NestedDeclarationsRule, not declarations
    // - POTENTIAL FUTURE: Use lightningcss's source Location (line/column) to extract ranges
    //   from original source, but this requires mapping byte offsets carefully.

    let segments = split_top_level_segments(css);
    let mut atomizable = HashSet::new();
    let mut non_atomizable_ranges = Vec::new();

    for segment in segments {
        match segment {
            TopLevelSegment::Declaration(decl_text) => {
                if is_valid_declaration(&decl_text) {
                    let normalized = decl_text.trim_end_matches(';');
                    atomizable.insert(normalized.to_string());
                } else {
                    non_atomizable_ranges.push(decl_text);
                }
            }
            TopLevelSegment::Block(block_text) => {
                non_atomizable_ranges.push(block_text);
            }
            TopLevelSegment::Empty => {}
        }
    }

    let non_atomizable = if non_atomizable_ranges.is_empty() {
        None
    } else {
        Some(reconstruct_non_atomizable(css, &atomizable))
    };

    ParseCssResult {
        atomizable,
        non_atomizable,
    }
}

/// Represents a top-level CSS segment
enum TopLevelSegment {
    /// A CSS declaration (e.g., "color: red;" or multi-line)
    Declaration(String),
    /// A block (e.g., "@media { ... }")
    Block(String),
    /// Empty or whitespace-only
    Empty,
}

/// Split CSS into top-level segments (declarations and blocks) while preserving structure
fn split_top_level_segments(css: &str) -> Vec<TopLevelSegment> {
    let mut segments = Vec::new();
    let mut current_segment = String::new();
    let mut brace_depth = 0;
    let mut in_declaration = false;
    let mut in_string = false;
    let mut string_char = ' '; // ' or "

    let chars: Vec<char> = css.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        let ch = chars[i];

        // Handle string boundaries
        if (ch == '\'' || ch == '"') && (i == 0 || chars[i - 1] != '\\') {
            if in_string && ch == string_char {
                in_string = false;
            } else if !in_string {
                in_string = true;
                string_char = ch;
            }
            current_segment.push(ch);
            i += 1;
            continue;
        }

        // Skip brace/semicolon tracking if we're inside a string
        if in_string {
            current_segment.push(ch);
            i += 1;
            continue;
        }

        match ch {
            '{' => {
                brace_depth += 1;
                current_segment.push(ch);

                if brace_depth == 1 {
                    if in_declaration
                        && !current_segment[..current_segment.len() - 1]
                            .trim()
                            .is_empty()
                    {
                        let decl = current_segment[..current_segment.len() - 1].to_string();
                        if !decl.trim().is_empty() {
                            segments.push(TopLevelSegment::Declaration(decl));
                        }
                    }
                    current_segment.clear();
                    current_segment.push('{');
                    in_declaration = false;
                }
            }
            '}' => {
                current_segment.push(ch);
                brace_depth -= 1;

                if brace_depth == 0 {
                    let block = current_segment.trim().to_string();
                    if !block.is_empty() {
                        segments.push(TopLevelSegment::Block(block));
                    }
                    current_segment.clear();
                }
            }
            ';' => {
                current_segment.push(ch);

                if brace_depth == 0 {
                    let decl = current_segment.trim().to_string();
                    if !decl.is_empty() {
                        segments.push(TopLevelSegment::Declaration(decl));
                    }
                    current_segment.clear();
                    in_declaration = false;
                }
            }
            '\n' | '\r' => {
                current_segment.push(ch);
                in_declaration = brace_depth == 0;
            }
            _ => {
                current_segment.push(ch);
                if brace_depth == 0 && !ch.is_whitespace() {
                    in_declaration = true;
                }
            }
        }

        i += 1;
    }

    if !current_segment.trim().is_empty() {
        if brace_depth > 0 {
            segments.push(TopLevelSegment::Block(current_segment.trim().to_string()));
        } else if in_declaration {
            segments.push(TopLevelSegment::Declaration(
                current_segment.trim().to_string(),
            ));
        }
    }

    segments
}

/// Check if a declaration is valid (no CSS variables, etc.)
fn is_valid_declaration(decl_text: &str) -> bool {
    let trimmed = decl_text.trim();

    if !trimmed.ends_with(';') {
        return false;
    }

    if trimmed.contains("var(") {
        return false;
    }

    let without_semi = if trimmed.ends_with(';') {
        &trimmed[..trimmed.len() - 1]
    } else {
        trimmed
    };

    let wrapped = format!("a {{ {} }}", without_semi);

    let stylesheet = match StyleSheet::parse(
        &wrapped,
        ParserOptions {
            filename: "inline.css".to_string(),
            error_recovery: false,
            warnings: None,
            css_modules: None,
            source_index: 0,
            flags: Default::default(),
        },
    ) {
        Ok(sheet) => sheet,
        Err(_) => return false,
    };

    if stylesheet.rules.0.len() != 1 {
        return false;
    }

    match &stylesheet.rules.0[0] {
        CssRule::Style(style_rule) => style_rule.rules.0.is_empty(),
        _ => false,
    }
}

/// Reconstruct non-atomizable content from the original CSS, excluding atomizable declarations
fn reconstruct_non_atomizable(css: &str, atomizable: &HashSet<String>) -> String {
    let mut result = Vec::new();
    let mut brace_depth = 0;
    let mut current_line = String::new();
    let mut in_string = false;
    let mut string_char = ' '; // ' or "

    for ch in css.chars() {
        current_line.push(ch);

        // Handle string boundaries
        if (ch == '\'' || ch == '"') {
            if in_string && ch == string_char {
                in_string = false;
            } else if !in_string {
                in_string = true;
                string_char = ch;
            }
        }

        // Only track braces outside of strings
        if !in_string {
            if ch == '{' {
                brace_depth += 1;
            } else if ch == '}' {
                brace_depth -= 1;
            }
        }

        if ch == '\n' {
            let trimmed = current_line.trim();

            if brace_depth > 0 {
                result.push(current_line.clone());
            } else if trimmed.ends_with(';') {
                let decl = if trimmed.ends_with(';') {
                    &trimmed[..trimmed.len() - 1]
                } else {
                    trimmed
                };

                if !atomizable.contains(decl) {
                    result.push(current_line.clone());
                }
            } else if !trimmed.is_empty() {
                let is_in_atomizable = atomizable.iter().any(|a| a.starts_with(trimmed));
                if !is_in_atomizable {
                    result.push(current_line.clone());
                }
            } else if !result.is_empty() {
                result.push(current_line.clone());
            }

            current_line.clear();
        }
    }

    if !current_line.is_empty() {
        let trimmed = current_line.trim();
        if !trimmed.is_empty() && brace_depth > 0 {
            result.push(current_line);
        } else if !trimmed.is_empty() && trimmed.ends_with(';') {
            let decl = if trimmed.ends_with(';') {
                &trimmed[..trimmed.len() - 1]
            } else {
                trimmed
            };
            if !atomizable.contains(decl) {
                result.push(current_line);
            }
        }
    }

    let mut output = result.join("");
    if css.ends_with('\n') && !output.ends_with('\n') {
        output.push('\n');
    }

    output
}

#[cfg(test)]
mod tests {
    use super::*;
    use indoc::indoc;

    #[test]
    fn test_full() {
        let input = indoc! {"
            color: red;
            invalid-something;
            @media (max-width: 600px) {
                .btn { color: blue; }
            }
            background: something-random-but-valid;
            margin-top: var(--mt);
            margin-bottom: calc( 100% - 20px );
        "};
        let expected = Some(indoc! {"
            invalid-something;
            @media (max-width: 600px) {
                .btn { color: blue; }
            }
            margin-top: var(--mt);
        "});
        let expected_atomics = HashSet::from([
            "color: red".to_string(),
            "background: something-random-but-valid".to_string(),
            "margin-bottom: calc( 100% - 20px )".to_string(),
        ]);

        let result = parse_css(input);

        assert_eq!(result.non_atomizable.as_deref(), expected);
        assert_eq!(result.atomizable, expected_atomics);
    }

    #[test]
    fn media_query() {
        let input = indoc! {"
            @media (max-width: 500px) {
                background: blue;
            }
        "};
        let expected = Some(indoc! {"
            @media (max-width: 500px) {
                background: blue;
            }
        "});
        let expected_atomics = HashSet::from([]);

        let result = parse_css(input);

        assert_eq!(result.non_atomizable.as_deref(), expected);
        assert_eq!(result.atomizable, expected_atomics);
    }

    #[test]
    fn test_atomic_hash_deterministic() {
        use crate::compiler::atomic::generate_atomic_hash;

        // Test that same input produces same output
        let hash1 = generate_atomic_hash("color: red");
        let hash2 = generate_atomic_hash("color: red");
        assert_eq!(hash1, hash2, "Same input should produce same hash");

        // Test that different input produces different output
        let hash3 = generate_atomic_hash("background: blue");
        assert_ne!(
            hash1, hash3,
            "Different input should produce different hash"
        );

        // Test hardcoded expected output
        assert_eq!(hash1, "tMpWo", "color: red should hash to tMpWo");
        assert_eq!(hash3, "i1jU1", "background: blue should hash to i1jU1");
    }

    #[test]
    fn multiline_css_grid() {
        let input = indoc! {"
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-areas:
                \"header header header\"
                \"sidebar main main\"
                \"footer footer footer\";
            gap: 16px;
        "};
        let expected_atomics = HashSet::from([
            "display: grid".to_string(),
            "grid-template-columns: repeat(3, 1fr)".to_string(),
            indoc! {"
                grid-template-areas:
                    \"header header header\"
                    \"sidebar main main\"
                    \"footer footer footer\""
            }
            .to_string(),
            "gap: 16px".to_string(),
        ]);
        let expected_non_atomizable = None;

        let result = parse_css(input);

        assert_eq!(result.atomizable, expected_atomics);
        assert_eq!(result.non_atomizable, expected_non_atomizable);
    }

    #[test]
    fn content_with_braces_in_string() {
        // Test that braces inside string values don't confuse the tokenizer
        let input = indoc! {"
            content: 'something { nice';
        "};
        let expected_atomics = HashSet::from(["content: 'something { nice'".to_string()]);
        let expected_non_atomizable = None;

        let result = parse_css(input);

        assert_eq!(result.atomizable, expected_atomics);
        assert_eq!(result.non_atomizable, expected_non_atomizable);
    }

    #[test]
    fn content_with_braces_in_double_quotes() {
        // Test with double quotes and braces
        let input = indoc! {r#"
            content: "before { after }";
            color: red;
        "#};
        let expected_atomics = HashSet::from([
            r#"content: "before { after }""#.to_string(),
            "color: red".to_string(),
        ]);
        let expected_non_atomizable = None;

        let result = parse_css(input);

        assert_eq!(result.atomizable, expected_atomics);
        assert_eq!(result.non_atomizable, expected_non_atomizable);
    }
}
