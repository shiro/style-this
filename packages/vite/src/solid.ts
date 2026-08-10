const solidMock = `
export const template = () => () => {};
export const spread = () => {};
export const mergeProps = () => {};
export function use(fn, element, arg) {
  // return untrack(() => fn(element, arg));
}
`;

export function initializeSolidMocks(mocks: Map<string, string>) {
  mocks.set("solid-js/web", solidMock);
}
