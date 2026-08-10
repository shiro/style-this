// This code runs as a side effect during module load, preventing tree-shaking
(function () {
  if (typeof __style_this_atomic_init === 'undefined') {
    (globalThis as any).__style_this_atomic_init = true;
  }
})();

export const __style_this_atomic_marker = true;

throw new Error(
  '@style-this/core/atomic should not be imported directly. ' +
  'The transformer converts this import into a virtual module.'
);
