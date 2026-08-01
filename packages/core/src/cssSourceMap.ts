import type { CssSourceMapData } from "./compiler.js";

export interface SourceMapSegment {
  generatedLine: number;
  generatedColumn: number;
  originalLine: number;
  originalColumn: number;
  source: string;
}

export interface SourceMap {
  version: number;
  file?: string;
  sources: string[];
  sourcesContent: string[];
  names: string[];
  mappings: string;
}

/**
 * Generate a CSS source map that maps generated CSS classes back to original source locations
 */
export function generateCssSourceMap(
  cssContent: string,
  sourcemapData: CssSourceMapData,
  originalFilepath: string,
  originalSource: string,
  generatedFilepath?: string,
): SourceMap {
  const segments: SourceMapSegment[] = [];

  // For each CSS class, find its position in the generated CSS and map it back
  for (const entry of sourcemapData) {
    const selector = `.${entry.className}`;
    const position = findSelectorInCss(cssContent, selector);

    if (position) {
      // Calculate line and column from byte offset in original source
      const originalPos = getLineAndColumn(originalSource, entry.start);

      segments.push({
        generatedLine: position.line,
        generatedColumn: position.column,
        originalLine: originalPos.line,
        originalColumn: originalPos.column,
        source: originalFilepath,
      });
    }
  }

  // Convert segments to VLQ mappings
  const mappings = segmentsToVLQ(segments);

  return {
    version: 3,
    file: generatedFilepath,
    sources: [originalFilepath],
    sourcesContent: [originalSource],
    names: [],
    mappings,
  };
}

function findSelectorInCss(
  css: string,
  selector: string,
): { line: number; column: number } | null {
  const index = css.indexOf(selector);
  if (index === -1) return null;

  const beforeSelector = css.substring(0, index);
  const line = (beforeSelector.match(/\n/g) || []).length;
  const lastNewline = beforeSelector.lastIndexOf("\n");
  const column = index - lastNewline - 1;

  return { line, column };
}

function getLineAndColumn(
  source: string,
  offset: number,
): { line: number; column: number } {
  const beforeOffset = source.substring(0, offset);
  const line = (beforeOffset.match(/\n/g) || []).length;
  const lastNewline = beforeOffset.lastIndexOf("\n");
  const column = offset - lastNewline - 1;

  return { line, column: Math.max(0, column) };
}

/**
 * Convert segments to VLQ-encoded mappings string
 * This is a simplified implementation - for production, consider using a library
 */
function segmentsToVLQ(segments: SourceMapSegment[]): string {
  if (segments.length === 0) return "";

  // Sort segments by generated position
  segments.sort((a, b) => {
    if (a.generatedLine !== b.generatedLine) {
      return a.generatedLine - b.generatedLine;
    }
    return a.generatedColumn - b.generatedColumn;
  });

  const lines: string[] = [];
  let currentLine = 0;
  let previousGeneratedColumn = 0;
  let previousOriginalLine = 0;
  let previousOriginalColumn = 0;
  let previousSourceIndex = 0;

  for (const segment of segments) {
    // Add empty line segments for skipped lines
    while (currentLine < segment.generatedLine) {
      lines.push("");
      currentLine++;
      previousGeneratedColumn = 0;
    }

    // Encode this segment
    const values = [
      segment.generatedColumn - previousGeneratedColumn,
      0 - previousSourceIndex, // source index (always 0 for us)
      segment.originalLine - previousOriginalLine,
      segment.originalColumn - previousOriginalColumn,
    ];

    lines[currentLine] =
      (lines[currentLine] ? lines[currentLine] + "," : "") +
      values.map(encodeVLQ).join("");

    previousGeneratedColumn = segment.generatedColumn;
    previousOriginalLine = segment.originalLine;
    previousOriginalColumn = segment.originalColumn;
    previousSourceIndex = 0;
  }

  return lines.join(";");
}

/**
 * Encode a value as VLQ (Variable Length Quantity)
 */
function encodeVLQ(value: number): string {
  const VLQ_BASE_SHIFT = 5;
  const VLQ_BASE = 1 << VLQ_BASE_SHIFT;
  const VLQ_BASE_MASK = VLQ_BASE - 1;
  const VLQ_CONTINUATION_BIT = VLQ_BASE;

  const BASE64_CHARS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  // Convert to sign-magnitude representation
  let encoded = value < 0 ? ((-value) << 1) | 1 : value << 1;

  let result = "";
  do {
    let digit = encoded & VLQ_BASE_MASK;
    encoded >>>= VLQ_BASE_SHIFT;

    if (encoded > 0) {
      digit |= VLQ_CONTINUATION_BIT;
    }

    result += BASE64_CHARS[digit];
  } while (encoded > 0);

  return result;
}
