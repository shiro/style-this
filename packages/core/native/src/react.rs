use crate::{styled_component_transformer::StyledComponentTransformer, *};

pub fn react_prepass<'alloc>(
    ast_builder: &AstBuilder<'alloc>,
    filepath: String,
    program: &mut Program<'alloc>,
    skip_jsx: bool,
) {
    let mut transformer = StyledComponentTransformer::new(ast_builder, skip_jsx, filepath, "className");
    transformer.visit_program(program);
}
