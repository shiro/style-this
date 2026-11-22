mod cache;
mod cache_registry;
mod compiler;
mod css_parser;
mod dependency_tracker;
mod error;
mod evaluator;
mod invalidation;
mod transformer;
mod types;
mod visitor;
pub mod atomic;

// Re-exports for public API
pub use error::TransformError;
pub use evaluator::evaluate_program;
pub(crate) use evaluator::resolve_virtual_modules_with_error;
pub use transformer::Transformer;

// Internal imports
