use crate::error_mapping::get_pos_from_offset;
use oxc_parser::ParserReturn;
use thiserror::Error;
use wasm_bindgen::prelude::*;

#[derive(Error, Debug)]
pub enum TransformError {
    #[error("failed to parse program: {message}")]
    RawParseFailed {
        message: String,
        filepath: String,
        row: usize,
        column: usize,
    },
    #[error("failed to determine program type from extension '{filepath}'")]
    UknownExtension {
        filepath: String,
        row: usize,
        column: usize,
    },
    #[error("failed to run program '{filepath}'{}", program.as_ref().map(|p| format!("\n{p}")).unwrap_or_default())]
    EvaluationFailed {
        filepath: String,
        program: Option<String>,
        cause: JsValue,
    },
    #[error("failed to read file '{filepath}'")]
    ReadFileError { filepath: String, cause: JsValue },
    #[error("failed to resolve the virtual module imports of '{filepath}'")]
    ResolveVirtualImportFailed { filepath: String, cause: JsValue },
    #[error("failed to evaluate import '{filepath}', '?raw' is the only supported query")]
    UnsupportedImportQuery { filepath: String },
    #[error("tried to access dynamic variable '{variable}'")]
    AccessDynamicVariableError {
        variable: String,
        filepath: String,
        row: usize,
        column: usize,
    },
    #[error("'{tag}' templates can't be destructured")]
    DestructuredTemplateError {
        tag: String,
        filepath: String,
        row: usize,
        column: usize,
    },
    #[error("'import {name} = require(...)' isn't supported, use an ES import instead")]
    ImportRequireError {
        name: String,
        filepath: String,
        row: usize,
        column: usize,
    },
    #[error("invalid option '{option}', expected {expected}")]
    InvalidOption {
        option: &'static str,
        expected: &'static str,
    },
}

impl TransformError {
    /// Located at the first error of the failed parse of `code`.
    pub fn parse_failed(filepath: String, code: &str, ast: &ParserReturn) -> Self {
        let error = ast.errors.first();
        let offset = error
            .and_then(|error| error.labels.iter().flatten().next())
            .map_or(0, |label| label.offset());
        let (row, column) = get_pos_from_offset(code, offset);
        Self::RawParseFailed {
            filepath,
            message: error.map_or_else(|| "failed to parse".to_string(), |error| error.message.to_string()),
            row,
            column,
        }
    }
}

impl From<TransformError> for JsValue {
    fn from(from: TransformError) -> Self {
        (&from).into()
    }
}

impl From<&TransformError> for JsValue {
    fn from(from: &TransformError) -> Self {
        let err = js_sys::Error::new(&from.to_string());

        // stack trace points to wasm wrapper, delete it
        js_sys::Reflect::set(&err, &JsValue::from_str("stack"), &JsValue::UNDEFINED).unwrap();

        // set cause property for variants that have one
        match from {
            TransformError::EvaluationFailed {
                filepath, cause, ..
            } => {
                js_sys::Reflect::set(&err, &JsValue::from_str("cause"), cause).unwrap();
                // errors of the evaluated code without a location are located in the evaluated file
                js_sys::Reflect::set(
                    &err,
                    &JsValue::from_str("filepath"),
                    &JsValue::from_str(filepath),
                )
                .unwrap();
            }
            TransformError::ReadFileError { cause, .. }
            | TransformError::ResolveVirtualImportFailed { cause, .. } => {
                js_sys::Reflect::set(&err, &JsValue::from_str("cause"), cause).unwrap();
            }
            TransformError::RawParseFailed {
                filepath,
                row,
                column,
                ..
            }
            | TransformError::UknownExtension {
                filepath,
                row,
                column,
            }
            | TransformError::AccessDynamicVariableError {
                filepath,
                row,
                column,
                ..
            }
            | TransformError::DestructuredTemplateError {
                filepath,
                row,
                column,
                ..
            }
            | TransformError::ImportRequireError {
                filepath,
                row,
                column,
                ..
            } => {
                let message = from.to_string();
                let stack_trace =
                    format!("{message}\n    at <anonymous> ({filepath}:{row}:{column})",);
                js_sys::Reflect::set(
                    &err,
                    &JsValue::from_str("stack"),
                    &JsValue::from_str(&stack_trace),
                )
                .unwrap();
            }
            TransformError::UnsupportedImportQuery { .. }
            | TransformError::InvalidOption { .. } => {}
        };

        err.into()
    }
}
