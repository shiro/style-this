# Atomic CSS with Media Queries and Nested Selectors Test

This test verifies that atomic CSS mode correctly handles:

1. **Media Queries**: Declarations inside `@media` blocks are extracted as atomic classes
2. **Nested Selectors**: Declarations inside nested selectors (with template expressions) are extracted
3. **Complex CSS Structures**: Proper handling of mixed static and dynamic CSS
4. **Per-File CSS Preservation**: The full CSS structure is preserved in the per-file CSS

## Test Structure

- **Entry CSS (innerStyle)**: Basic declarations that are atomized
  - `background: red`
  - `padding: 10px`

- **Entry CSS (outerStyle)**: Complex CSS with:
  - Top-level declaration: `width: 100%`
  - Nested selector with dynamic reference: `${innerStyle} { background: coral; }`
  - Media query with nested selector: `@media (max-width: 500px) { ${innerStyle} { background: blue; } }`

## Expected Output

### Transformed Code (entry.tsx)
The CSS variables are replaced with imports from the `.style-this.js` module:
- `const innerStyle = _styleThisClasses._styleThis_innerStyle;`
- `const outerStyle = _styleThisClasses._styleThis_outerStyle;`

### Per-File CSS (entry.tsx.css)
**Full CSS content with media queries and nested selectors preserved:**
```css
.innerStyle-oty7sd {
  background: red;
  padding: 10px;
}
.outerStyle-mvwhqz {
  width: 100%;
  .innerStyle-oty7sd {
    background: coral;
  }
  @media (max-width: 500px) {
    .innerStyle-oty7sd {
      background: blue;
    }
  }
}
```

The template expression `.${innerStyle}` is correctly resolved to `.innerStyle-oty7sd` (the class name).

### Atomic CSS Bundle (entry.tsx.atomic.css)
All extracted atomic declarations bundled as individual rules:
```css
.KSBUt { background:red }
.PIOC5 { background:coral }
.XVNih { padding:10px }
.c8bRZ { width:100% }
.fXUi7 { background:blue }
```

### Style This Module
Exports class references that include both the marker class and the atomic classes:
- `export const _styleThis_innerStyle = "innerStyle-oty7sd KSBUt XVNih";`
- `export const _styleThis_outerStyle = "outerStyle-mvwhqz c8bRZ PIOC5 fXUi7";`

## Key Features Verified

✓ Media queries are parsed and declarations extracted
✓ Nested selectors with dynamic references are handled
✓ Multiple levels of nesting work correctly
✓ Atomic class generation is deterministic
✓ Complex CSS structures don't cause parsing errors
✓ **Per-file CSS preserves the full CSS structure (same as non-atomic mode)**
✓ **Clean design: atomic mode enhances rather than replaces CSS generation**
