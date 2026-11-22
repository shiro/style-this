export function isSvelteFile(filepath: string): boolean {
  return filepath.endsWith(".svelte");
}

// comments, `<svelte:head>` (may contain non-component scripts) and styles are matched to skip the scripts in them,
// attribute values may contain `>`, e.g. `generics="T extends Record<string, unknown>"`
const SCRIPT_REGEX =
  /<!--[\s\S]*?-->|<(svelte:head|style)\b[\s\S]*?<\/\1\s*>|<script(?<attributes>(?:\s+[^\s=>"'/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>"']+))?)*)\s*>(?<content>[\s\S]*?)<\/script\s*>/g;
const MODULE_ATTRIBUTE_REGEX = /\s(?:module(?=[\s=]|$)|context\s*=\s*["']?module\b)/;
const INSTANCE_SCRIPT_SEPARATOR = "/* __styleThis__svelteInstanceScript */";

type SvelteScript = { start: number; end: number; content: string };

/** The content ranges of the module and instance scripts, Svelte allows one of each. */
function findSvelteScripts(code: string) {
  let module: SvelteScript | undefined;
  let instance: SvelteScript | undefined;
  for (const match of code.matchAll(SCRIPT_REGEX)) {
    const { attributes, content } = match.groups ?? {};
    if (content === undefined) continue;
    const end = match.index + match[0].lastIndexOf("</script");
    const script = { start: end - content.length, end, content };
    if (MODULE_ATTRIBUTE_REGEX.test(attributes)) module ??= script;
    else instance ??= script;
  }
  return { module, instance };
}

/**
 * The code a Svelte file is transformed as, `null` if it has no script. Both scripts share the module's scope, so
 * they're transformed as one program: the module script, followed by the instance script.
 */
export function extractSvelteScript(code: string): string | null {
  const { module, instance } = findSvelteScripts(code);
  if (module && instance) return `${module.content}\n${INSTANCE_SCRIPT_SEPARATOR}\n${instance.content}`;
  return (module ?? instance)?.content ?? null;
}

export function rewrapSvelteScript(originalCode: string, transformedCode: string): string {
  const { module, instance } = findSvelteScripts(originalCode);
  const replacements: [SvelteScript, string][] = [];
  if (module && instance) {
    const separatorIndex = transformedCode.indexOf(INSTANCE_SCRIPT_SEPARATOR);
    if (separatorIndex === -1) throw new Error("the transformed Svelte script lost the instance script separator");
    replacements.push(
      [module, transformedCode.slice(0, separatorIndex)],
      [instance, transformedCode.slice(separatorIndex + INSTANCE_SCRIPT_SEPARATOR.length)],
    );
  } else {
    const script = module ?? instance;
    if (!script) return originalCode;
    replacements.push([script, transformedCode]);
  }

  // replace from the end so the earlier positions stay valid
  replacements.sort(([a], [b]) => b.start - a.start);
  let code = originalCode;
  for (const [{ start, end }, content] of replacements) code = code.slice(0, start) + content + code.slice(end);
  return code;
}
