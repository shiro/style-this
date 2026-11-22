export function isSvelteFile(filepath: string): boolean {
  return filepath.endsWith(".svelte");
}

/** The code a Svelte file is transformed as, `null` if it has no script. */
export function extractSvelteScript(code: string): string | null {
  const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  return scriptMatch ? scriptMatch[1] : null;
}

export function rewrapSvelteScript(originalCode: string, transformedCode: string): string {
  return originalCode.replace(
    /<script[^>]*>([\s\S]*?)<\/script>/,
    `<script>${transformedCode}</script>`,
  );
}
