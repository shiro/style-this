import { describe, it, expect } from 'vitest';
import { joinStyles, mergeStyles } from '../src/index';
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
      expect(mergeStyles('m-aaaaa', 'm-bbbbb')).toBe('m-bbbbb');
    });

    it('later class wins within a single argument', () => {
      expect(mergeStyles('m-aaaaa m-bbbbb')).toBe('m-bbbbb');
    });

    it('winner takes the position of the last occurrence', () => {
      expect(mergeStyles('m-aaaaa p-aaaaa', 'm-bbbbb')).toBe('p-aaaaa m-bbbbb');
    });

    it('de-dupes across many args', () => {
      expect(mergeStyles('p-aaaaa', 'p-bbbbb', 'p-ccccc', 'p-ddddd', 'p-eeeee')).toBe('p-eeeee');
    });

    it('de-dupes multiple properties independently', () => {
      expect(
        mergeStyles('m-aaaaa p-aaaaa c-aaaaa', 'p-bbbbb', 'c-bbbbb m-bbbbb', 'p-ccccc')
      ).toBe('c-bbbbb m-bbbbb p-ccccc');
    });

    it('re-adding an earlier class moves it to the end and wins again', () => {
      expect(mergeStyles('m-aaaaa', 'm-bbbbb', 'm-aaaaa')).toBe('m-aaaaa');
    });

    it('identical atomic classes collapse', () => {
      expect(mergeStyles('m-aaaaa', 'm-aaaaa')).toBe('m-aaaaa');
    });

    it.each(prefixes.map((p) => [p]))('de-dupes prefix "%s"', (prefix) => {
      expect(mergeStyles(`${prefix}-aaaaa`, `${prefix}-Bbbbb`)).toBe(`${prefix}-Bbbbb`);
    });
  });

  describe('different properties', () => {
    it('shorthand and longhand are kept', () => {
      expect(mergeStyles('m-aaaaa', 'mt-bbbbb', 'mb-ccccc')).toBe('m-aaaaa mt-bbbbb mb-ccccc');
    });

    it('prefixes sharing a start are kept', () => {
      expect(mergeStyles('bg-aaaaa', 'bgc-bbbbb', 'bgcl-ccccc', 'b-ddddd', 'bt-eeeee')).toBe(
        'bg-aaaaa bgc-bbbbb bgcl-ccccc b-ddddd bt-eeeee'
      );
    });

    it('multi-segment prefixes are distinct from their segments', () => {
      expect(mergeStyles('min-w-aaaaa', 'w-bbbbb', 'max-w-ccccc')).toBe(
        'min-w-aaaaa w-bbbbb max-w-ccccc'
      );
      expect(mergeStyles('gap-aaaaa', 'gap-x-bbbbb', 'gap-y-ccccc')).toBe(
        'gap-aaaaa gap-x-bbbbb gap-y-ccccc'
      );
    });
  });

  describe('hash format', () => {
    it('handles hashes containing dashes and underscores', () => {
      expect(mergeStyles('m-a-_bc', 'm-Z_-9-')).toBe('m-Z_-9-');
    });

    it('handles multi-segment prefixes with dashes in the hash', () => {
      expect(mergeStyles('min-w-a-_bc gap-x-Z9-_a', 'min-w-bbbbb', 'gap-x-ccccc')).toBe(
        'min-w-bbbbb gap-x-ccccc'
      );
    });

    it('a hash starting with a prefix-like segment still resolves the right prefix', () => {
      // "min-w-m-abc": prefix "min-w", hash "m-abc"
      expect(mergeStyles('min-w-m-abc', 'm-xxxxx', 'min-w-yyyyy')).toBe('m-xxxxx min-w-yyyyy');
    });

    it('requires the hash to start with a letter', () => {
      expect(mergeStyles('m-1abcd', 'm-2abcd')).toBe('m-1abcd m-2abcd');
      expect(mergeStyles('m--abcd', 'm-_abcd')).toBe('m--abcd m-_abcd');
    });

    it('requires a 5 char hash', () => {
      expect(mergeStyles('m-abc', 'm-def')).toBe('m-abc m-def');
      expect(mergeStyles('m-abcdef', 'm-ghijkl')).toBe('m-abcdef m-ghijkl');
      expect(mergeStyles('m-', 'm-')).toBe('m-');
    });

    it('requires a dash separator', () => {
      expect(mergeStyles('mxaaaaa', 'mxbbbbb')).toBe('mxaaaaa mxbbbbb');
      expect(mergeStyles('m_aaaaa', 'm_bbbbb')).toBe('m_aaaaa m_bbbbb');
    });

    it('is case sensitive for prefixes', () => {
      expect(mergeStyles('M-aaaaa', 'M-bbbbb')).toBe('M-aaaaa M-bbbbb');
    });

    it('ignores a bare separator + hash', () => {
      expect(mergeStyles('-aaaaa', '-bbbbb')).toBe('-aaaaa -bbbbb');
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
      expect(mergeStyles('btn-large', 'btn-small', 'foo-abcde', 'foo-fghij')).toBe(
        'btn-large btn-small foo-abcde foo-fghij'
      );
    });

    it('de-dupes exact duplicates, keeping the last position', () => {
      expect(mergeStyles('a b c', 'a')).toBe('b c a');
      expect(mergeStyles('Button-abc123 kG3jH', 'kG3jH Button-abc123')).toBe('kG3jH Button-abc123');
    });

    it('mixes atomic and non-atomic classes', () => {
      expect(
        mergeStyles(
          'Button-abc123 kG3jH m-aaaaa p-aaaaa something',
          'Override-def456 T5iL9 p-bbbbb something'
        )
      ).toBe('Button-abc123 kG3jH m-aaaaa Override-def456 T5iL9 p-bbbbb something');
    });
  });

  describe('input handling', () => {
    it('returns an empty string with no args', () => {
      expect(mergeStyles()).toBe('');
    });

    it('ignores falsy values', () => {
      expect(mergeStyles(undefined, null, false, '')).toBe('');
      expect(mergeStyles('m-aaaaa', undefined, null, false, '', 'p-aaaaa')).toBe('m-aaaaa p-aaaaa');
    });

    it('supports conditional usage', () => {
      const active = false;
      const disabled = true;
      expect(mergeStyles('c-aaaaa', active && 'c-bbbbb', disabled && 'c-ccccc')).toBe('c-ccccc');
    });

    it('normalizes all kinds of whitespace', () => {
      expect(mergeStyles('  m-aaaaa\n\tp-aaaaa  ', ' \n ', '\tm-bbbbb\r\n')).toBe('p-aaaaa m-bbbbb');
    });

    it('returns a single class untouched', () => {
      expect(mergeStyles('m-aaaaa')).toBe('m-aaaaa');
      expect(mergeStyles('foo')).toBe('foo');
    });

    it('accepts many args', () => {
      const args = Array.from({ length: 100 }, (_, i) => `p-a${String(i).padStart(4, '0')} x${i}`);
      const result = mergeStyles(...args).split(' ');
      expect(result).toHaveLength(101);
      expect(result.at(-2)).toBe('p-a0099');
      expect(result.filter((c) => c.startsWith('p-'))).toEqual(['p-a0099']);
    });
  });
});

describe('joinStyles', () => {
  it('joins args without de-duping', () => {
    expect(joinStyles('m-aaaaa', 'm-bbbbb', 'a', 'a')).toBe('m-aaaaa m-bbbbb a a');
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
