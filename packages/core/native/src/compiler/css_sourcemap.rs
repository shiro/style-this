use super::types::CssVariableIdentifier;
use oxc_sourcemap::{SourceMap, SourceMapBuilder};
use oxc_span::Span;

/// Generates a CSS source map from CSS variable identifiers
pub fn generate_css_sourcemap(
    css_content: &str,
    css_variables: &[CssVariableIdentifier],
    original_filepath: &str,
    original_source: &str,
) -> Option<SourceMap> {
    if css_variables.is_empty() {
        return None;
    }

    let mut builder = SourceMapBuilder::default();
    let source_id = builder.add_source_and_content(original_filepath, original_source);

    // Track current line and column in generated CSS
    let mut current_line = 0;
    let mut current_column = 0;

    // Parse CSS content to find each rule and map it back to source
    for css_var in css_variables {
        // Find the selector in the generated CSS
        let selector = if css_var.class_name.starts_with("_Global") {
            // Global styles don't have a class selector
            continue;
        } else {
            format!(".{}", css_var.class_name)
        };

        // Find where this selector appears in the CSS
        if let Some(pos) = find_selector_position(css_content, &selector, current_column) {
            // Get line and column from the original source span
            let original_line = get_line_from_offset(original_source, css_var.span.start);
            let original_column = get_column_from_offset(original_source, css_var.span.start);

            // Add a token mapping for the selector
            builder.add_token(
                pos.line,
                pos.column,
                original_line,
                original_column,
                Some(source_id),
                None,
            );

            current_line = pos.line;
            current_column = pos.column;
        }
    }

    Some(builder.into_sourcemap())
}

struct Position {
    line: u32,
    column: u32,
}

/// Find the position of a selector in CSS content
fn find_selector_position(css_content: &str, selector: &str, start_offset: u32) -> Option<Position> {
    let start_byte_offset = start_offset as usize;
    let search_content = &css_content[start_byte_offset.min(css_content.len())..];
    
    if let Some(offset) = search_content.find(selector) {
        let absolute_offset = start_byte_offset + offset;
        let before_content = &css_content[..absolute_offset];
        
        let line = before_content.chars().filter(|&c| c == '\n').count() as u32;
        let column = before_content
            .rfind('\n')
            .map(|last_newline| absolute_offset - last_newline - 1)
            .unwrap_or(absolute_offset) as u32;
        
        Some(Position { line, column })
    } else {
        None
    }
}

/// Get line number from byte offset
fn get_line_from_offset(source: &str, offset: u32) -> u32 {
    let offset = offset as usize;
    if offset > source.len() {
        return 0;
    }
    
    source[..offset].chars().filter(|&c| c == '\n').count() as u32
}

/// Get column number from byte offset
fn get_column_from_offset(source: &str, offset: u32) -> u32 {
    let offset = offset as usize;
    if offset > source.len() {
        return 0;
    }
    
    source[..offset]
        .rfind('\n')
        .map(|last_newline| offset - last_newline - 1)
        .unwrap_or(offset) as u32
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_line_column_calculation() {
        let source = "line 0\nline 1\nline 2";
        assert_eq!(get_line_from_offset(source, 0), 0);
        assert_eq!(get_line_from_offset(source, 7), 1);
        assert_eq!(get_column_from_offset(source, 7), 0);
        assert_eq!(get_column_from_offset(source, 10), 3);
    }
}
