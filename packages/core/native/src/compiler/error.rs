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
    #[error("tried to access dynamic variable '{variable}'")]
    AccessDynamicVariableError {
        variable: String,
        filepath: String,
        row: usize,
        column: usize,
    },
}

impl From<TransformError> for JsValue {
    fn from(from: TransformError) -> Self {
        let err = js_sys::Error::new(&from.to_string());

        // stack trace points to wasm wrapper, delete it
        js_sys::Reflect::set(&err, &JsValue::from_str("stack"), &JsValue::UNDEFINED).unwrap();

        // set cause property for variants that have one
        match &from {
            TransformError::EvaluationFailed { cause, .. }
            | TransformError::ReadFileError { cause, .. } => {
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
        };

        err.into()
    }
}
