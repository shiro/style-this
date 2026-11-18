export interface SvelteProcessed {
  codeToTransform: string;
  normalizedFilepath: string;
}

export function isSvelteFile(filepath: string): boolean {
  return filepath.endsWith(".svelte");
}

/** The path a file is transformed and cached under, Svelte files are transformed as their script. */
export function normalizeFilepath(filepath: string): string {
  return filepath.replace(/\.svelte$/, ".ts");
}

export function extractSvelteScript(code: string, filepath: string): SvelteProcessed | null {
  if (!isSvelteFile(filepath)) return null;

  const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (!scriptMatch) return null; // Svelte file but no script block

  return {
    codeToTransform: scriptMatch[1],
    normalizedFilepath: normalizeFilepath(filepath),
  };
}

export function rewrapSvelteScript(originalCode: string, transformedCode: string): string {
  return originalCode.replace(
    /<script[^>]*>([\s\S]*?)<\/script>/,
    `<script>${transformedCode}</script>`,
  );
}
