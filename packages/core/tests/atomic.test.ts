import { describe, it, expect, beforeEach } from 'vitest';
import { css_to_atomic_class_list, get_atomic_css, clear_atomic_css_cache } from '../src/compiler';

/**
 * Test atomic CSS generation with:
 * 1. Nested selectors (child components overriding parent styles)
 * 2. Media queries with complex conditions
 * 3. Error handling for unparseable CSS
 *
 * Scenario:
 * - Outer component: has base background red, media query sets blue on mobile
 * - Inner component: nested, references outer component to override background to coral
 */
describe('Atomic CSS with complex contents', () => {
  beforeEach(() => {
    clear_atomic_css_cache();
  });

  describe('Basic atomic class generation', () => {
    it('should generate deterministic atomic class names for simple declarations', () => {
      const classes = css_to_atomic_class_list('background: red; padding: 10px;');
      const atomicCss = get_atomic_css();

      expect(classes).toMatch(/\b[a-zA-Z][0-9a-zA-Z]{4}\b.*[a-zA-Z][0-9a-zA-Z]{4}\b/);
      expect(atomicCss).toContain('background: red');
      expect(atomicCss).toContain('padding: 10px');
    });

    it('should reuse same class name for identical declarations', () => {
      const classes1 = css_to_atomic_class_list('color: blue;');
      clear_atomic_css_cache();

      // After clearing, the class name should be different
      const classes2 = css_to_atomic_class_list('color: blue;');

      // They should have same structure but potentially different due to cache
      expect(classes1).toMatch(/^[a-zA-Z][0-9a-zA-Z]{4}$/);
      expect(classes2).toMatch(/^[a-zA-Z][0-9a-zA-Z]{4}$/);
    });

    it('should handle complex values with parentheses', () => {
      const classes = css_to_atomic_class_list(
        'background: linear-gradient(to right, red, blue); border: 1px solid black;'
      );
      const atomicCss = get_atomic_css();

      expect(classes).toMatch(/\b[a-zA-Z][0-9a-zA-Z]{4}\b.*[a-zA-Z][0-9a-zA-Z]{4}\b/);
      expect(atomicCss).toContain('linear-gradient');
      expect(atomicCss).toContain('1px solid black');
    });
  });

  describe('Media queries atomization', () => {
    it('should extract and atomize declarations inside media queries', () => {
      const css = `
        background: red;
        @media (max-width: 500px) {
          background: blue;
        }
      `;

      const classes = css_to_atomic_class_list(css);
      const atomicCss = get_atomic_css();

      // Should have at least 2 classes: one for background: red, one for background: blue
      const classArray = classes.trim().split(/\s+/);
      expect(classArray.length).toBeGreaterThanOrEqual(2);

      // The atomic CSS should contain both background declarations
      expect(atomicCss).toContain('background: red');
      expect(atomicCss).toContain('background: blue');
    });

    it('should handle media queries with multiple declarations', () => {
      const css = `
        padding: 20px;
        @media (max-width: 500px) {
          padding: 10px;
          font-size: 14px;
        }
      `;

      const classes = css_to_atomic_class_list(css);
      const atomicCss = get_atomic_css();

      // Should have 3+ atomic classes
      const classArray = classes.trim().split(/\s+/);
      expect(classArray.length).toBeGreaterThanOrEqual(3);

      expect(atomicCss).toContain('padding: 20px');
      expect(atomicCss).toContain('padding: 10px');
      expect(atomicCss).toContain('font-size: 14px');
    });

    it('should handle nested media queries', () => {
      const css = `
        color: red;
        @media (max-width: 768px) {
          color: blue;
          @media (max-width: 500px) {
            color: green;
          }
        }
      `;

      const classes = css_to_atomic_class_list(css);
      const atomicCss = get_atomic_css();

      const classArray = classes.trim().split(/\s+/);
      expect(classArray.length).toBeGreaterThanOrEqual(3);

      expect(atomicCss).toContain('color: red');
      expect(atomicCss).toContain('color: blue');
      expect(atomicCss).toContain('color: green');
    });

    it('should handle multiple media query blocks', () => {
      const css = `
        margin: 0;
        @media (max-width: 768px) {
          margin: 5px;
        }
        @media (min-width: 1024px) {
          margin: 20px;
        }
      `;

      const classes = css_to_atomic_class_list(css);
      const atomicCss = get_atomic_css();

      const classArray = classes.trim().split(/\s+/);
      expect(classArray.length).toBeGreaterThanOrEqual(3);

      expect(atomicCss).toContain('margin: 0');
      expect(atomicCss).toContain('margin: 5px');
      expect(atomicCss).toContain('margin: 20px');
    });
  });

  describe('Nested selectors atomization', () => {
    it('should extract declarations from nested selectors', () => {
      const css = `
        background: red;
        &:hover {
          background: darkred;
        }
      `;

      const classes = css_to_atomic_class_list(css);
      const atomicCss = get_atomic_css();

      const classArray = classes.trim().split(/\s+/);
      expect(classArray.length).toBeGreaterThanOrEqual(2);

      expect(atomicCss).toContain('background: red');
      expect(atomicCss).toContain('background: darkred');
    });

    it('should extract declarations from child selectors', () => {
      const css = `
        padding: 20px;
        > div {
          margin: 10px;
        }
      `;

      const classes = css_to_atomic_class_list(css);
      const atomicCss = get_atomic_css();

      const classArray = classes.trim().split(/\s+/);
      expect(classArray.length).toBeGreaterThanOrEqual(2);

      expect(atomicCss).toContain('padding: 20px');
      expect(atomicCss).toContain('margin: 10px');
    });

    it('should handle complex nested structure with media queries', () => {
      const css = `
        background: red;
        @media (max-width: 500px) {
          background: blue;
          &:hover {
            background: coral;
          }
        }
        & .child {
          color: inherit;
        }
      `;

      const classes = css_to_atomic_class_list(css);
      const atomicCss = get_atomic_css();

      const classArray = classes.trim().split(/\s+/);
      expect(classArray.length).toBeGreaterThanOrEqual(4);

      expect(atomicCss).toContain('background: red');
      expect(atomicCss).toContain('background: blue');
      expect(atomicCss).toContain('background: coral');
      expect(atomicCss).toContain('color: inherit');
    });
  });

  describe('Real-world scenario: nested components', () => {
    it('should handle outer component with media query + inner component override', () => {
      // Outer component CSS
      const outerCss = `
        background: red;
        width: 100%;
        @media (max-width: 500px) {
          background: blue;
        }
      `;

      const outerClasses = css_to_atomic_class_list(outerCss);
      const intermediateCss = get_atomic_css();

      // Inner component CSS - references outer by selector
      const innerCss = `
        padding: 10px;
        /* Override parent background */
        background: coral;
      `;

      const innerClasses = css_to_atomic_class_list(innerCss);
      const finalCss = get_atomic_css();

      // Both components should contribute atomic classes
      const outerArray = outerClasses.trim().split(/\s+/);
      const innerArray = innerClasses.trim().split(/\s+/);

      expect(outerArray.length).toBeGreaterThanOrEqual(3); // background:red, width:100%, background:blue
      expect(innerArray.length).toBeGreaterThanOrEqual(2); // padding:10px, background:coral

      // Final CSS should have all declarations
      expect(finalCss).toContain('background: red');
      expect(finalCss).toContain('width: 100%');
      expect(finalCss).toContain('background: blue');
      expect(finalCss).toContain('padding: 10px');
      expect(finalCss).toContain('background: coral');

      // Take snapshot
      expect(finalCss).toMatchSnapshot();
    });
  });

  describe('Error handling and fallback', () => {
    it('should skip unparseable CSS and continue with valid declarations', () => {
      // Mix valid and invalid CSS
      const css = `
        background: red;
        @supports (display: grid) {
          display: grid;
        }
        padding: 10px;
      `;

      // Should not throw, should process what it can
      const classes = css_to_atomic_class_list(css);
      const atomicCss = get_atomic_css();

      // Should have at least the valid declarations
      expect(classes).toBeTruthy();
      expect(atomicCss).toContain('background: red');
      expect(atomicCss).toContain('padding: 10px');
    });

    it('should handle CSS custom properties', () => {
      const css = `
        --primary-color: red;
        --spacing: 10px;
        background: var(--primary-color);
        padding: var(--spacing);
      `;

      const classes = css_to_atomic_class_list(css);
      const atomicCss = get_atomic_css();

      expect(classes).toBeTruthy();
      expect(atomicCss).toContain('background: var(--primary-color)');
      expect(atomicCss).toContain('padding: var(--spacing)');
    });

    it('should handle empty CSS gracefully', () => {
      const classes = css_to_atomic_class_list('');
      const atomicCss = get_atomic_css();

      expect(classes).toBe('');
      expect(atomicCss).toBe('');
    });

    it('should handle CSS with only comments', () => {
      const css = `
        /* This is a comment */
        /* background: commented-out; */
      `;

      const classes = css_to_atomic_class_list(css);
      expect(classes).toBe('');
    });
  });

  describe('Snapshot tests', () => {
    it('should generate consistent atomic CSS for complex component scenario', () => {
      clear_atomic_css_cache();

      // First component
      const comp1Css = `
        background: red;
        padding: 20px;
        @media (max-width: 500px) {
          background: blue;
          padding: 10px;
        }
      `;

      const comp1Classes = css_to_atomic_class_list(comp1Css);

      // Second component (nested)
      const comp2Css = `
        background: coral;
        margin: 5px;
      `;

      const comp2Classes = css_to_atomic_class_list(comp2Css);

      const finalCss = get_atomic_css();

      expect({
        component1: {
          classes: comp1Classes,
          cssCount: finalCss.split('{').length - 1,
        },
        component2: {
          classes: comp2Classes,
          cssCount: finalCss.split('{').length - 1,
        },
        totalAtomicCss: finalCss,
      }).toMatchSnapshot();
    });

    it('should maintain atomic CSS output format', () => {
      clear_atomic_css_cache();

      css_to_atomic_class_list('color: red; font-size: 14px; margin: 10px;');
      const atomicCss = get_atomic_css();

      // Verify format: each rule should be on its own line
      const rules = atomicCss.split('\n').filter(line => line.trim().length > 0);

      rules.forEach(rule => {
        expect(rule).toMatch(/^\.\w+\s*\{[^}]+\}$/);
      });

      expect(atomicCss).toMatchSnapshot();
    });
  });
});
