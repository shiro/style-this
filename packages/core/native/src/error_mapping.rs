use oxc_ast::ast::Program;
use oxc_codegen::{Codegen, CodegenOptions};
use std::path::PathBuf;
use wasm_bindgen::prelude::*;

/// Maps the stack frames of the code evaluated from `eval_program` to its source with a sourcemap,
/// the eval program's nodes keep their spans in the source (`eval_program.source_text`).
pub fn resolve_err(
    err: &JsValue,
    program_filepath: &str,
    eval_program: &Program<'_>,
    eval_program_js: &str,
) {
    use itertools::Itertools;

    let Some(stack) = js_sys::Reflect::get(err, &JsValue::from_str("stack"))
        .ok()
        .and_then(|stack| stack.as_string())
    else {
        return;
    };

    // the eval program starts in the line after the wrapper's `// start`
    let Some(start_line) = eval_program_js
        .lines()
        .position(|line| line.trim() == "// start")
        .map(|line| line + 1)
    else {
        return;
    };

    let eval_code = Codegen::new()
        .with_options(CodegenOptions {
            source_map_path: Some(PathBuf::from(program_filepath)),
            ..CodegenOptions::default()
        })
        .build(eval_program);
    let Some(sourcemap) = eval_code.map else {
        return;
    };
    let eval_code_lines = eval_code.code.lines().count();

    let stack = stack
        .lines()
        .map(|line| {
            let Some((name, row, col)) = eval_frame(line) else {
                return line.to_string();
            };
            // V8 positions are 1-based, frames in the wrapper or the code appended to the eval program
            // aren't mapped
            let Some(row) = row.checked_sub(start_line + 1).filter(|row| *row < eval_code_lines) else {
                return line.to_string();
            };
            // the closest mapped position before it, lines of synthesized code have none
            let position = (row as u32, col.saturating_sub(1) as u32);
            let Some(token) = sourcemap
                .get_tokens()
                .take_while(|token| (token.get_dst_line(), token.get_dst_col()) <= position)
                .last()
            else {
                return line.to_string();
            };
            let (row, col) = (token.get_src_line() + 1, token.get_src_col() + 1);
            format!("    at {name} ({program_filepath}:{row}:{col})")
        })
        .join("\n");

    let _ = js_sys::Reflect::set(err, &JsValue::from_str("stack"), &JsValue::from_str(&stack));
}

/// The function name and position in the eval program of a stack frame of code the compiler
/// evaluated, e.g.
/// `at fn (eval at <anonymous> (/app/node_modules/@style-this/core/dist/compiler.cjs:600:16), <anonymous>:24:11)`.
fn eval_frame(frame: &str) -> Option<(&str, usize, usize)> {
    let frame = frame.trim().strip_prefix("at ")?;
    // frames without a function name aren't wrapped in parentheses
    let (name, frame) = match frame.split_once(" (eval at ") {
        Some((name, frame)) => (name, frame.strip_suffix(')')?),
        None => ("eval", frame.strip_prefix("eval at ")?),
    };
    let (eval_site, position) = frame.rsplit_once("), <anonymous>:")?;

    // the eval site's location is `<path>:<row>:<col>`
    let eval_site_path = eval_site.rsplitn(3, ':').nth(2)?;
    if !eval_site_path
        .replace('\\', "/")
        .ends_with("/core/dist/compiler.cjs")
    {
        return None;
    }

    let (row, col) = position.split_once(':')?;
    // V8 names the anonymous wrapper function `eval`
    let name = if name == "eval" { "<anonymous>" } else { name };
    Some((name, row.parse().ok()?, col.parse().ok()?))
}

/// 1-based row and column of the byte `offset` in `source`. Columns are in UTF-16 code units like
/// the ones of JS (e.g. stack traces).
pub fn get_pos_from_offset(source: &str, offset: usize) -> (usize, usize) {
    let mut row = 1;
    let mut col = 1;

    for (i, ch) in source.char_indices() {
        if i >= offset {
            break;
        }

        if ch == '\n' {
            row += 1;
            col = 1;
        } else {
            col += ch.len_utf16();
        }
    }

    (row, col)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn eval_frame_of_installed_compilers() {
        for compiler in [
            "/app/node_modules/@style-this/core/dist/compiler.cjs",
            "/app/node_modules/.pnpm/@style-this+core@0.6.1/node_modules/@style-this/core/dist/compiler.cjs",
            r"C:\app\node_modules\@style-this\core\dist\compiler.cjs",
        ] {
            let eval_site = format!("eval at <anonymous> ({compiler}:600:16), <anonymous>:24:11");
            assert_eq!(
                eval_frame(&format!("    at getColor ({eval_site})")),
                Some(("getColor", 24, 11))
            );
            assert_eq!(
                eval_frame(&format!("    at eval ({eval_site})")),
                Some(("<anonymous>", 24, 11))
            );
            assert_eq!(
                eval_frame(&format!("    at {eval_site}")),
                Some(("<anonymous>", 24, 11))
            );
        }
    }

    #[test]
    fn eval_frame_ignores_other_frames() {
        assert_eq!(
            eval_frame("    at getColor (/app/src/dep.tsx:4:9)"),
            None
        );
        assert_eq!(
            eval_frame(
                "    at /app/node_modules/@style-this/core/dist/compiler.cjs:600:16"
            ),
            None
        );
        assert_eq!(
            eval_frame(
                "    at fn (eval at run (/app/node_modules/lib/index.js:1:1), <anonymous>:3:5)"
            ),
            None
        );
        assert_eq!(
            eval_frame(
                "    at fn (eval at run (/app/node_modules/lib/my-compiler.cjs:1:1), <anonymous>:3:5)"
            ),
            None
        );
    }
}
