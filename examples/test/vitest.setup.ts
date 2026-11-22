/// <reference types="node" />
import { execSync } from "child_process";
import { existsSync, readdirSync, readFileSync, statSync, rmSync } from "fs";
import { join, relative, resolve } from "path";
import { expect } from "vitest";

const MONOREPO_ROOT_DIR = resolve(import.meta.dirname, "../..");

export function runBuild(
  exampleDir: string,
  command: string = "pnpm build",
  envVars?: Record<string, string>
) {
  try {
    execSync(command, {
      cwd: exampleDir,
      stdio: "pipe",
      env: { ...process.env, NODE_ENV: "production", ...envVars },
    });
  } catch (error) {
    console.error(`Build failed for ${exampleDir}:`, error);
    throw error;
  }
}

export function cleanBuildDir(buildDir: string): void {
  if (existsSync(buildDir)) {
    rmSync(buildDir, { recursive: true });
  }
}

/**
 * Walks buildDir recursively and calls expect(content).toMatchFileSnapshot()
 * for every file, mirroring the directory structure under snapshotDir.
 * Binary files are stored as "[Binary file - N bytes]".
 * This produces real files in __snapshots__/ instead of .snap files.
 *
 * @param excludePatterns - Array of glob patterns to exclude from snapshots
 */
export async function assertBuildOutputMatchesSnapshot(
  buildDir: string,
  snapshotDir: string,
  excludePatterns?: string[]
): Promise<void> {
  if (!existsSync(buildDir)) {
    throw new Error(`Build directory does not exist: ${buildDir}`);
  }
  await walkAndAssert(buildDir, buildDir, snapshotDir, excludePatterns);
}

async function walkAndAssert(
  dir: string,
  baseDir: string,
  snapshotDir: string,
  excludePatterns?: string[]
): Promise<void> {
  const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const rel = relative(baseDir, fullPath);
    
    // Check if this path matches any exclude pattern
    if (excludePatterns && shouldExclude(rel, excludePatterns)) {
      continue;
    }
    
    if (entry.isDirectory()) {
      await walkAndAssert(fullPath, baseDir, snapshotDir, excludePatterns);
    } else {
      const snapshotFile = join(snapshotDir, rel);
      let content: string;
      try {
        content = readFileSync(fullPath, "utf-8");
        // frameworks (e.g. SolidStart) embed absolute paths in their output, in sourcemaps these
        // also shift the mapping columns of the affected sources
        if (content.includes(MONOREPO_ROOT_DIR)) {
          if (entry.name.endsWith(".map")) {
            content = JSON.stringify({ ...JSON.parse(content), mappings: "<depends on project path>" });
          }
          content = content.replaceAll(MONOREPO_ROOT_DIR, "");
        }
      } catch {
        content = `[Binary file - ${statSync(fullPath).size} bytes]`;
      }
      await expect(content).toMatchFileSnapshot(snapshotFile);
    }
  }
}

function shouldExclude(filePath: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    // Convert glob pattern to regex
    const regex = new RegExp(
      "^" +
        pattern
          .replace(/\./g, "\\.")
          .replace(/\*/g, "[^/]*")
          .replace(/\?/g, ".") +
        "$"
    );
    return regex.test(filePath);
  });
}
