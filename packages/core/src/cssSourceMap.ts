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
  const generatedPosition = positionOfByteOffset(cssContent);
  const originalPosition = positionOfByteOffset(originalSource);

  // map the start of each declaration's rule back to the declaration
  const segments = sourcemapData.map((entry): SourceMapSegment => {
    const generated = generatedPosition(entry.cssOffset);
    const original = originalPosition(entry.start);
    return {
      generatedLine: generated.line,
      generatedColumn: generated.column,
      originalLine: original.line,
      originalColumn: original.column,
      source: originalFilepath,
    };
  });

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

/** Line and (UTF-16) column of UTF-8 byte offsets in `text` */
function positionOfByteOffset(text: string): (offset: number) => { line: number; column: number } {
  const bytes = new TextEncoder().encode(text);
  const decoder = new TextDecoder();
  const lineStarts = [0];
  bytes.forEach((byte, index) => {
    if (byte === 0x0a) lineStarts.push(index + 1);
  });

  return (offset) => {
    // the last line starting at or before the offset
    let line = 0;
    let high = lineStarts.length - 1;
    while (line < high) {
      const middle = (line + high + 1) >> 1;
      if (lineStarts[middle] <= offset) line = middle;
      else high = middle - 1;
    }
    return { line, column: decoder.decode(bytes.subarray(lineStarts[line], offset)).length };
  };
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
