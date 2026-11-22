import { describe, it, expect } from 'vitest';
import { joinStyles, mergeInlineStyles, mergeStyles } from '../src/index';
import atomicPrefixes from '../src/atomicPrefixes.json';

const prefixes = Object.values(atomicPrefixes);

describe('atomicPrefixes', () => {
  it('has unique prefixes', () => {
    expect(new Set(prefixes).size).toBe(prefixes.length);
  });

  it('has unique, lowercase properties', () => {
    const properties = Object.keys(atomicPrefixes);
    expect(new Set(properties).size).toBe(properties.length);
    for (const property of properties) expect(property).toBe(property.toLowerCase());
  });

  it('only uses class-name safe prefixes', () => {
    for (const prefix of prefixes) expect(prefix).toMatch(/^[a-z]+(-[a-z]+)*$/);
  });

  it.each([
    ['margin', 'm'],
    ['margin-top', 'mt'],
    ['padding', 'p'],
    ['padding-left', 'pl'],
    ['background', 'bg'],
    ['background-color', 'bgc'],
    ['color', 'c'],
    ['display', 'd'],
    ['border', 'b'],
    ['border-radius', 'r'],
  ])('maps %s to %s', (property, prefix) => {
    expect((atomicPrefixes as Record<string, string>)[property]).toBe(prefix);
  });
});

describe('mergeStyles', () => {
  describe('same prefix de-duping', () => {
    it('later class wins', () => {
      expect(mergeStyles('m-Aaaaa', 'm-Bbbbb')).toBe('m-Bbbbb');
    });

    it('later class wins within a single argument', () => {
      expect(mergeStyles('m-Aaaaa m-Bbbbb')).toBe('m-Bbbbb');
    });

    it('winner takes the position of the last occurrence', () => {
      expect(mergeStyles('m-Aaaaa p-Aaaaa', 'm-Bbbbb')).toBe('p-Aaaaa m-Bbbbb');
    });

    it('de-dupes across many args', () => {
      expect(mergeStyles('p-Aaaaa', 'p-Bbbbb', 'p-Ccccc', 'p-Ddddd', 'p-Eeeee')).toBe('p-Eeeee');
    });

    it('de-dupes multiple properties independently', () => {
      expect(
        mergeStyles('m-Aaaaa p-Aaaaa c-Aaaaa', 'p-Bbbbb', 'c-Bbbbb m-Bbbbb', 'p-Ccccc')
      ).toBe('c-Bbbbb m-Bbbbb p-Ccccc');
    });

    it('re-adding an earlier class moves it to the end and wins again', () => {
      expect(mergeStyles('m-Aaaaa', 'm-Bbbbb', 'm-Aaaaa')).toBe('m-Aaaaa');
    });

    it('identical atomic classes collapse', () => {
      expect(mergeStyles('m-Aaaaa', 'm-Aaaaa')).toBe('m-Aaaaa');
    });

    it.each(prefixes.map((p) => [p]))('de-dupes prefix "%s"', (prefix) => {
      expect(mergeStyles(`${prefix}-Aaaaa`, `${prefix}-Bbbbb`)).toBe(`${prefix}-Bbbbb`);
    });
  });

  describe('different properties', () => {
    it('shorthand and later longhands are kept', () => {
      expect(mergeStyles('m-Aaaaa', 'mt-Bbbbb', 'mb-Ccccc')).toBe('m-Aaaaa mt-Bbbbb mb-Ccccc');
    });

    it('longhands followed by their shorthand are dropped', () => {
      expect(mergeStyles('mt-Aaaaa ms-Aaaaa p-Aaaaa', 'r-Bbbbb', 'm-Ccccc mb-Ccccc', 'b-Ddddd')).toBe(
        'p-Aaaaa r-Bbbbb m-Ccccc mb-Ccccc b-Ddddd'
      );
    });

    it('prefixes sharing a start are kept', () => {
      expect(mergeStyles('bg-Aaaaa', 'bgc-Bbbbb', 'bgcl-Ccccc', 'b-Ddddd', 'bt-Eeeee')).toBe(
        'bg-Aaaaa bgc-Bbbbb bgcl-Ccccc b-Ddddd bt-Eeeee'
      );
    });

    it('multi-segment prefixes are distinct from their segments', () => {
      expect(mergeStyles('min-w-Aaaaa', 'w-Bbbbb', 'max-w-Ccccc')).toBe(
        'min-w-Aaaaa w-Bbbbb max-w-Ccccc'
      );
      expect(mergeStyles('gap-Aaaaa', 'gap-x-Bbbbb', 'gap-y-Ccccc')).toBe(
        'gap-Aaaaa gap-x-Bbbbb gap-y-Ccccc'
      );
    });
  });

  describe('hash format', () => {
    it('handles hashes containing dashes and underscores', () => {
      expect(mergeStyles('m-A-_bc', 'm-Z_-9-')).toBe('m-Z_-9-');
    });

    it('handles multi-segment prefixes with dashes in the hash', () => {
      expect(mergeStyles('min-w-A-_bc gap-x-Z9-_a', 'min-w-Bbbbb', 'gap-x-Ccccc')).toBe(
        'min-w-Bbbbb gap-x-Ccccc'
      );
    });

    it('requires the hash to start with an uppercase letter', () => {
      expect(mergeStyles('bg-light', 'bg-white')).toBe('bg-light bg-white');
      expect(mergeStyles('m-1abcd', 'm-2abcd')).toBe('m-1abcd m-2abcd');
      expect(mergeStyles('m--abcd', 'm-_abcd')).toBe('m--abcd m-_abcd');
    });

    it('requires a 5 char hash', () => {
      expect(mergeStyles('m-Abc', 'm-Def')).toBe('m-Abc m-Def');
      expect(mergeStyles('m-Abcdef', 'm-Ghijkl')).toBe('m-Abcdef m-Ghijkl');
      expect(mergeStyles('m-', 'm-')).toBe('m-');
    });

    it('requires class name safe hash chars', () => {
      expect(mergeStyles('m-Ab.cd', 'm-Ab:cd')).toBe('m-Ab.cd m-Ab:cd');
    });

    it('requires a dash separator', () => {
      expect(mergeStyles('mxAaaaa', 'mxBbbbb')).toBe('mxAaaaa mxBbbbb');
      expect(mergeStyles('m_Aaaaa', 'm_Bbbbb')).toBe('m_Aaaaa m_Bbbbb');
    });

    it('is case sensitive for prefixes', () => {
      expect(mergeStyles('M-Aaaaa', 'M-Bbbbb')).toBe('M-Aaaaa M-Bbbbb');
    });

    it('ignores a bare separator + hash', () => {
      expect(mergeStyles('-Aaaaa', '-Bbbbb')).toBe('-Aaaaa -Bbbbb');
    });
  });

  describe('non-atomic classes', () => {
    it('keeps bare hashes of unsupported properties', () => {
      expect(mergeStyles('kG3jH', 'T5iL9')).toBe('kG3jH T5iL9');
    });

    it('keeps component classes', () => {
      expect(mergeStyles('Button-abc123', 'Link-def456')).toBe('Button-abc123 Link-def456');
    });

    it('keeps classes with unknown prefixes', () => {
      expect(mergeStyles('btn-large', 'btn-small', 'foo-Abcde', 'foo-Fghij')).toBe(
        'btn-large btn-small foo-Abcde foo-Fghij'
      );
    });

    it('de-dupes exact duplicates, keeping the last position', () => {
      expect(mergeStyles('a b c', 'a')).toBe('b c a');
      expect(mergeStyles('Button-abc123 kG3jH', 'kG3jH Button-abc123')).toBe('kG3jH Button-abc123');
    });

    it('mixes atomic and non-atomic classes', () => {
      expect(
        mergeStyles(
          'Button-abc123 kG3jH m-Aaaaa p-Aaaaa something',
          'Override-def456 T5iL9 p-Bbbbb something'
        )
      ).toBe('Button-abc123 kG3jH m-Aaaaa Override-def456 T5iL9 p-Bbbbb something');
    });
  });

  describe('input handling', () => {
    it('returns an empty string with no args', () => {
      expect(mergeStyles()).toBe('');
    });

    it('ignores falsy values', () => {
      expect(mergeStyles(undefined, null, false, '')).toBe('');
      expect(mergeStyles('m-Aaaaa', undefined, null, false, '', 'p-Aaaaa')).toBe('m-Aaaaa p-Aaaaa');
    });

    it('supports conditional usage', () => {
      const active = false;
      const disabled = true;
      expect(mergeStyles('c-Aaaaa', active && 'c-Bbbbb', disabled && 'c-Ccccc')).toBe('c-Ccccc');
    });

    it('normalizes all kinds of whitespace', () => {
      expect(mergeStyles('  m-Aaaaa\n\tp-Aaaaa  ', ' \n ', '\tm-Bbbbb\r\n')).toBe('p-Aaaaa m-Bbbbb');
    });

    it('returns a single class untouched', () => {
      expect(mergeStyles('m-Aaaaa')).toBe('m-Aaaaa');
      expect(mergeStyles('foo')).toBe('foo');
    });

    it('accepts many args', () => {
      const args = Array.from({ length: 100 }, (_, i) => `p-A${String(i).padStart(4, '0')} x${i}`);
      const result = mergeStyles(...args).split(' ');
      expect(result).toHaveLength(101);
      expect(result.at(-2)).toBe('p-A0099');
      expect(result.filter((c) => c.startsWith('p-'))).toEqual(['p-A0099']);
    });
  });
});

describe('joinStyles', () => {
  it('joins args without de-duping', () => {
    expect(joinStyles('m-Aaaaa', 'm-Bbbbb', 'a', 'a')).toBe('m-Aaaaa m-Bbbbb a a');
  });

  it('ignores falsy values', () => {
    expect(joinStyles(undefined, 'a', null, false, '', 'b')).toBe('a b');
    expect(joinStyles()).toBe('');
  });

  it('keeps class lists as-is', () => {
    expect(joinStyles('Button-abc123 kG3jH', 'Override-def456')).toBe(
      'Button-abc123 kG3jH Override-def456'
    );
  });
});

describe('mergeInlineStyles', () => {
  it('merges object styles, the style prop wins', () => {
    expect(mergeInlineStyles({ '--a': 1, '--b': 'x' }, { '--b': 'y', color: 'red' })).toEqual({
      '--a': 1,
      '--b': 'y',
      color: 'red',
    });
  });

  it('handles a missing style prop', () => {
    expect(mergeInlineStyles({ '--a': 1 }, undefined)).toEqual({ '--a': 1 });
    expect(mergeInlineStyles({ '--a': 1 }, null)).toEqual({ '--a': 1 });
  });

  it('prepends the variables to string styles, skipping nullish values', () => {
    expect(mergeInlineStyles({ '--a': 1, '--b': undefined, '--c': 'x' }, 'color: red')).toBe(
      '--a:1;--c:x;color: red'
    );
  });
});
