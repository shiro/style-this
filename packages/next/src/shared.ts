import type { CssCachEntry } from "@style-this/core/compiler";
import { writeFileSync, mkdirSync } from "fs";
import * as path from "path";

export const cssFiles = new Map<string, CssCachEntry>();
export const dependencyStore = new Map<string, string[]>();

// Store CSS output so we can write it to files later
export const cssOutput = new Map<string, { content: string; filepath: string }>();

export function storeCSSOutput(cssFilepath: string, content: string) {
  cssOutput.set(cssFilepath, { content, filepath: cssFilepath });
}

export function writeCSSFiles() {
  for (const [key, { content, filepath }] of cssOutput.entries()) {
    try {
      // Ensure directory exists
      const dir = path.dirname(filepath);
      mkdirSync(dir, { recursive: true });
      
      // Write the CSS file
      writeFileSync(filepath, content, 'utf-8');
    } catch (error) {
      console.warn(`Failed to write CSS file ${filepath}:`, error);
    }
  }
}
