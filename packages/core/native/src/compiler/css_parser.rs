use super::atomic::{atomic_prefix, declaration_property};
use lightningcss::rules::CssRule;
use lightningcss::stylesheet::{ParserOptions, StyleSheet};

/// Result of parsing a CSS block
#[derive(Debug, Clone)]
pub struct ParseCssResult {
    /// Statements that can be atomized (simple top-level declarations), in source order
    pub atomizable: Vec<String>,
    /// Remaining CSS that cannot be atomized (media queries, nested rules, etc.)
    pub non_atomizable: Option<String>,
}

pub fn parse_css(css: &str) -> ParseCssResult {
    // STRATEGY:
    // 1. Split CSS into top-level segments (declarations and blocks) by tracking brace depth,
    //    each segment is a slice of the original CSS, so multi-line declarations stay intact.
    // 2. For each top-level declaration, validate it with lightningcss.
    // 3. Join the segments that can't be atomized to get the non-atomizable CSS.
    //
    // WHY NOT use lightningcss to parse the whole wrapped CSS?
    // - lightningcss normalizes CSS: `color: red` -> `RGBA(...)`, `margin: 10px` -> `Margin { top: ... }`
    // - We need to preserve ORIGINAL TEXT for proper formatting and special values like calc()
    // - lightningcss also puts bare declarations in NestedDeclarationsRule, not declarations

    let mut atomizable: Vec<String> = Vec::new();
    let mut non_atomizable: Vec<&str> = Vec::new();

    let stripped = strip_comments(css);

    for segment in split_top_level_segments(&stripped) {
        match segment {
            TopLevelSegment::Declaration(decl_text) if is_atomizable_declaration(decl_text) => {
                let normalized = decl_text.trim().trim_end_matches(';').to_string();
                atomizable.retain(|existing| existing != &normalized);
                atomizable.push(normalized);
            }
            TopLevelSegment::Declaration(text) | TopLevelSegment::Block(text) => {
                non_atomizable.push(text);
            }
        }
    }

    let non_atomizable = (!non_atomizable.is_empty()).then(|| {
        let mut output = non_atomizable
            .into_iter()
            .map(strip_leading_lines)
            .collect::<Vec<_>>()
            .join("\n");
        if css.ends_with('\n') {
            output.push('\n');
        }
        output
    });

    ParseCssResult {
        atomizable,
        non_atomizable,
    }
}

/// Represents a top-level CSS segment, a slice of the original CSS
enum TopLevelSegment<'a> {
    /// A CSS declaration (e.g., "color: red;" or multi-line)
    Declaration(&'a str),
    /// A block including its prelude (e.g., "@media (...) { ... }" or "&:hover { ... }")
    Block(&'a str),
}

/// Strips surrounding whitespace, but keeps the indentation of the first line.
fn strip_leading_lines(text: &str) -> &str {
    let text = text.trim_end();
    let content_start = text.len() - text.trim_start().len();
    let line_start = text[..content_start]
        .rfind('\n')
        .map(|idx| idx + 1)
        .unwrap_or(0);
    &text[line_start..]
}

/// Replaces comments with whitespace, so `;` and braces inside them don't split segments.
/// Newlines are kept so line numbers stay the same, unterminated comments run to the end.
fn strip_comments(css: &str) -> String {
    let mut output = String::with_capacity(css.len());
    let mut chars = css.chars().peekable();
    let mut string_char: Option<char> = None;
    let mut escaped = false;

    while let Some(ch) = chars.next() {
        if let Some(quote) = string_char {
            if ch == quote && !escaped {
                string_char = None;
            }
            escaped = ch == '\\' && !escaped;
            output.push(ch);
            continue;
        }

        match ch {
            '\'' | '"' if !escaped => string_char = Some(ch),
            '/' if !escaped && chars.peek() == Some(&'*') => {
                chars.next();
                output.push_str("  ");
                let mut prev = ' ';
                for ch in chars.by_ref() {
                    output.push(if ch == '\n' { '\n' } else { ' ' });
                    if prev == '*' && ch == '/' {
                        break;
                    }
                    prev = ch;
                }
                escaped = false;
                continue;
            }
            // an unquoted url is a single token, `/*` in it is part of the url, e.g. `url(//a/*.png)`
            '(' if !escaped && ends_with_url_function_name(&output) => {
                output.push(ch);
                while let Some(ch) = chars.next_if(|ch| ch.is_whitespace()) {
                    output.push(ch);
                }
                if !matches!(chars.peek(), Some('\'' | '"')) {
                    let mut url_escaped = false;
                    for ch in chars.by_ref() {
                        output.push(ch);
                        if ch == ')' && !url_escaped {
                            break;
                        }
                        url_escaped = ch == '\\' && !url_escaped;
                    }
                }
                continue;
            }
            _ => {}
        }

        escaped = ch == '\\' && !escaped;
        output.push(ch);
    }

    output
}

fn ends_with_url_function_name(css: &str) -> bool {
    let Some(name_start) = css.len().checked_sub(3).filter(|&idx| css.is_char_boundary(idx)) else {
        return false;
    };
    css[name_start..].eq_ignore_ascii_case("url")
        && !css[..name_start].ends_with(|ch: char| {
            ch.is_ascii_alphanumeric() || !ch.is_ascii() || matches!(ch, '-' | '_' | '\\')
        })
}

/// Split CSS into top-level segments (declarations and blocks), `;` and braces inside parentheses
/// are part of the value, e.g. `url(data:image/png;base64,...)`.
fn split_top_level_segments(css: &str) -> Vec<TopLevelSegment<'_>> {
    let mut segments = Vec::new();
    let mut segment_start = 0;
    let mut brace_depth = 0;
    let mut paren_depth = 0usize;
    let mut string_char: Option<char> = None;
    let mut escaped = false;

    for (idx, ch) in css.char_indices() {
        let was_escaped = escaped;
        escaped = ch == '\\' && !escaped;

        if let Some(quote) = string_char {
            if ch == quote && !was_escaped {
                string_char = None;
            }
            continue;
        }

        match ch {
            '\'' | '"' if !was_escaped => string_char = Some(ch),
            '(' if !was_escaped => paren_depth += 1,
            ')' if !was_escaped => paren_depth = paren_depth.saturating_sub(1),
            '{' if paren_depth == 0 => brace_depth += 1,
            '}' if paren_depth == 0 => {
                brace_depth -= 1;
                if brace_depth == 0 {
                    segments.push(TopLevelSegment::Block(&css[segment_start..=idx]));
                    segment_start = idx + 1;
                }
            }
            ';' if brace_depth == 0 && paren_depth == 0 => {
                segments.push(TopLevelSegment::Declaration(&css[segment_start..=idx]));
                segment_start = idx + 1;
            }
            _ => {}
        }
    }

    let rest = &css[segment_start..];
    if brace_depth > 0 {
        segments.push(TopLevelSegment::Block(rest));
    } else {
        segments.push(TopLevelSegment::Declaration(rest));
    }

    // empty declarations, e.g. from `;;` or `};`
    segments.retain(|segment| {
        !matches!(segment, TopLevelSegment::Declaration(text) if text.trim().trim_end_matches(';').is_empty())
    });

    segments
}

/// Check if a declaration is a single valid declaration without `!important`, of a property with
/// an atomic prefix. The `;` is optional, since the last declaration of a template may omit it.
/// Layers reverse the cascade of `!important` declarations, layered (atomic) ones would beat the
/// unlayered ones of nested rules that are meant to override them.
/// Properties without a prefix (custom, vendor-prefixed, ...) can't be de-duped by `mergeStyles`,
/// so atomic ones would be ordered by class name instead of by the order they're applied in.
fn is_atomizable_declaration(decl_text: &str) -> bool {
    let trimmed = decl_text.trim();
    let without_semi = trimmed.strip_suffix(';').unwrap_or(trimmed);

    if atomic_prefix(declaration_property(without_semi)).is_none() {
        return false;
    }

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
        CssRule::Style(style_rule) => {
            style_rule.rules.0.is_empty() && style_rule.declarations.important_declarations.is_empty()
        }
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashSet;
    use indoc::indoc;

    #[test]
    fn test_full() {
        let input = indoc! {"
            color: red;
            invalid-something;
            background: var(--bg) !important;
            --accent: red ! IMPORTANT;
            @media (max-width: 600px) {
                .btn { color: blue; }
            }
            background: something-random-but-valid;
            margin-top: var(--mt);
            padding: var(--var1-abc)px var(--var2-abc, 2px);
            --accent: var(--brand);
            -webkit-line-clamp: 2;
            margin-bottom: calc( 100% - 20px );
        "};
        let expected = Some(indoc! {"
            invalid-something;
            background: var(--bg) !important;
            --accent: red ! IMPORTANT;
            @media (max-width: 600px) {
                .btn { color: blue; }
            }
            --accent: var(--brand);
            -webkit-line-clamp: 2;
        "});
        let expected_atomics = HashSet::from([
            "color: red".to_string(),
            "background: something-random-but-valid".to_string(),
            "margin-top: var(--mt)".to_string(),
            "padding: var(--var1-abc)px var(--var2-abc, 2px)".to_string(),
            "margin-bottom: calc( 100% - 20px )".to_string(),
        ]);

        let result = parse_css(input);

        assert_eq!(result.non_atomizable.as_deref(), expected);
        assert_eq!(HashSet::from_iter(result.atomizable), expected_atomics);
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
        let expected_atomics: HashSet<String> = HashSet::from([]);

        let result = parse_css(input);

        assert_eq!(result.non_atomizable.as_deref(), expected);
        assert_eq!(HashSet::from_iter(result.atomizable), expected_atomics);
    }

    #[test]
    fn trailing_nested_rule_keeps_closing_brace() {
        // templates are trimmed, so the closing brace is the last character without a newline
        let input = "color: red;\n&:hover {\n  color: blue;\n}";
        let result = parse_css(input);

        assert_eq!(result.atomizable, vec!["color: red".to_string()]);
        assert_eq!(
            result.non_atomizable.as_deref(),
            Some("&:hover {\n  color: blue;\n}")
        );

        let input = "color: red;\n@media (max-width: 500px) {\n  .a {\n    color: blue;\n  }\n}";
        let result = parse_css(input);

        assert_eq!(
            result.non_atomizable.as_deref(),
            Some("@media (max-width: 500px) {\n  .a {\n    color: blue;\n  }\n}")
        );
    }

    #[test]
    fn last_declaration_without_semicolon() {
        let result = parse_css("color: red");
        assert_eq!(result.atomizable, vec!["color: red".to_string()]);
        assert_eq!(result.non_atomizable, None);

        let result = parse_css("&:hover {\n  color: blue;\n}\nmargin-top: 1px /* ; */");
        assert_eq!(result.atomizable, vec!["margin-top: 1px".to_string()]);
        assert_eq!(
            result.non_atomizable.as_deref(),
            Some("&:hover {\n  color: blue;\n}")
        );
    }

    #[test]
    fn empty_declarations_are_dropped() {
        let result = parse_css("color: red;;\n  ;\n&:hover {\n  color: blue;\n};");
        assert_eq!(result.atomizable, vec!["color: red".to_string()]);
        assert_eq!(
            result.non_atomizable.as_deref(),
            Some("&:hover {\n  color: blue;\n}")
        );
    }

    #[test]
    fn multiline_declarations_next_to_blocks() {
        let input = indoc! {"
            grid-template-columns:
              minmax(0, 1fr)
              auto;
            transition:
              color 0.2s,
              background 0.2s;
            &:hover {
              color: blue;
            }
            margin-top:
              var(--mt);
        "};
        let result = parse_css(input);

        assert_eq!(
            result.atomizable,
            vec![
                "grid-template-columns:\n  minmax(0, 1fr)\n  auto".to_string(),
                "transition:\n  color 0.2s,\n  background 0.2s".to_string(),
                "margin-top:\n  var(--mt)".to_string(),
            ]
        );
        assert_eq!(
            result.non_atomizable.as_deref(),
            Some(indoc! {"
                &:hover {
                  color: blue;
                }
            "})
        );
    }

    #[test]
    fn comments_are_ignored() {
        let result = parse_css("\n    /* overflow-x: scroll; */\n");
        assert!(result.atomizable.is_empty());
        assert_eq!(result.non_atomizable, None);

        let input = indoc! {"
            color: red; /* a; } { */
            /* multi
               line; */
            &:hover {
                /* color: green; */
                color: blue;
            }
            content: '/* not a comment */';
            background: url(//cdn/a/*.png);
            cursor: URL( a\\)/*.png ), auto;
        "};
        let result = parse_css(input);

        assert_eq!(
            result.atomizable,
            vec![
                "color: red".to_string(),
                "content: '/* not a comment */'".to_string(),
                "background: url(//cdn/a/*.png)".to_string(),
                r"cursor: URL( a\)/*.png ), auto".to_string(),
            ]
        );
        let non_atomizable = result.non_atomizable.unwrap();
        assert!(!non_atomizable.contains("/*") && !non_atomizable.contains("*/"));
        assert!(non_atomizable.contains("color: blue;"));
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

        assert_eq!(HashSet::from_iter(result.atomizable), expected_atomics);
        assert_eq!(result.non_atomizable, expected_non_atomizable);
    }

    #[test]
    fn strings_and_escapes() {
        let input = indoc! {r#"
            content: 'something { nice';
            content: "a \" ; }" '\';';
            content: "\\";
            font-family: '\\'; /* ; */
            color: red;
            &:hover {
              color: blue;
            }
        "#};
        let result = parse_css(input);

        assert_eq!(
            result.atomizable,
            vec![
                "content: 'something { nice'".to_string(),
                r#"content: "a \" ; }" '\';'"#.to_string(),
                r#"content: "\\""#.to_string(),
                r"font-family: '\\'".to_string(),
                "color: red".to_string(),
            ]
        );
        assert_eq!(
            result.non_atomizable.as_deref(),
            Some(indoc! {"
                &:hover {
                  color: blue;
                }
            "})
        );
    }

    #[test]
    fn semicolons_and_braces_in_parentheses() {
        let input = indoc! {r"
            background: url(data:image/png;base64,iVBORw0KGgo=);
            background-image: url(data:image/svg+xml;utf8,<svg><style>a{fill:red}</style></svg>);
            cursor: url(a\)b;c.png), auto;
            &:hover {
              background-image: url(data:image/png;base64,AAAA);
            }
            color: red;
        "};
        let result = parse_css(input);

        assert_eq!(
            result.atomizable,
            vec![
                "background: url(data:image/png;base64,iVBORw0KGgo=)".to_string(),
                "background-image: url(data:image/svg+xml;utf8,<svg><style>a{fill:red}</style></svg>)"
                    .to_string(),
                r"cursor: url(a\)b;c.png), auto".to_string(),
                "color: red".to_string(),
            ]
        );
        assert_eq!(
            result.non_atomizable.as_deref(),
            Some(indoc! {"
                &:hover {
                  background-image: url(data:image/png;base64,AAAA);
                }
            "})
        );
    }
}
