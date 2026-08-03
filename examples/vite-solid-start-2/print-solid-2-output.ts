#!/usr/bin/env node
import { spawn, execSync, ChildProcess } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { chromium, Browser } from 'playwright';

const SOLID_START_2_EXAMPLE = path.join(process.cwd(), '.');
const SOLID_START_2_PORT = 3010;

interface BuildOutput {
  html: string;
  css: string;
}

function exec(command: string, cwd: string): string {
  return execSync(command, { cwd, encoding: 'utf-8', stdio: 'pipe' });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getChromiumPath(): string | undefined {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
    return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  }
  
  try {
    return execSync('which chromium', { encoding: 'utf-8' }).trim();
  } catch {
    return undefined;
  }
}

async function startServer(command: string, cwd: string, port: number, name: string, env?: Record<string, string>): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    console.log(`Starting ${name} server on port ${port}...`);
    
    const isNodeCommand = command.startsWith('node');
    const [cmd, ...args] = isNodeCommand ? command.split(' ') : ['pnpm', ...command.split(' ')];
    
    const serverEnv = { ...process.env, ...env };
    
    const proc = spawn(cmd, args, {
      cwd,
      stdio: 'pipe',
      shell: true,
      env: serverEnv,
    });

    let started = false;
    const timeout = setTimeout(() => {
      if (!started) {
        proc.kill();
        reject(new Error(`${name} server failed to start within timeout`));
      }
    }, 30000);

    proc.stdout?.on('data', (data) => {
      const output = data.toString();
      if (output.includes(`${port}`) || output.includes('ready') || output.includes('Local:') || output.includes('started server') || output.includes('Listening on')) {
        if (!started) {
          started = true;
          clearTimeout(timeout);
          resolve(proc);
        }
      }
    });

    proc.stderr?.on('data', (data) => {
      const output = data.toString();
      if (output.includes(`${port}`) || output.includes('ready') || output.includes('Local:') || output.includes('started server') || output.includes('Listening on')) {
        if (!started) {
          started = true;
          clearTimeout(timeout);
          resolve(proc);
        }
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

async function fetchHTML(url: string, browser: Browser): Promise<string> {
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await sleep(500);
    const html = await page.content();
    return html;
  } finally {
    await page.close();
  }
}

function extractCSS(html: string): string {
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const styles: string[] = [];
  let match;
  while ((match = styleRegex.exec(html)) !== null) {
    styles.push(match[1]);
  }
  return styles.join('\n');
}

function extractBodyContent(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1] : html;
}

async function buildAndCaptureSolidStart2(browser: Browser, atomic: boolean): Promise<BuildOutput> {
  console.log('Building Solid Start 2 example...');
  const env = atomic ? { ATOMIC: '1' } : {};
  exec('pnpm build', SOLID_START_2_EXAMPLE);
  
  let server: ChildProcess | null = null;
  try {
    server = await startServer('node .output/server/index.mjs', SOLID_START_2_EXAMPLE, SOLID_START_2_PORT, 'Solid Start 2', { PORT: String(SOLID_START_2_PORT), ...env });
    await sleep(2000);
    
    const html = await fetchHTML(`http://localhost:${SOLID_START_2_PORT}`, browser);
    
    const css = extractCSS(html);
    const bodyContent = extractBodyContent(html);
    
    return { html: bodyContent, css };
  } finally {
    if (server) {
      server.kill();
      await sleep(500);
    }
  }
}

async function main() {
  const atomic = process.env.ATOMIC === '1';
  console.log(`\nPrinting Solid Start 2 output (atomic: ${atomic})\n`);
  console.log('='.repeat(80));
  
  const chromiumPath = getChromiumPath();
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromiumPath,
  });
  
  try {
    const output = await buildAndCaptureSolidStart2(browser, atomic);
    
    console.log('\n=== CSS ===');
    console.log(output.css);
    
    console.log('\n=== HTML ===');
    console.log(output.html);
    
    // Write to files for inspection
    fs.writeFileSync('/tmp/solid-2-css.css', output.css);
    fs.writeFileSync('/tmp/solid-2-html.html', output.html);
    console.log('\n=== Files written ===');
    console.log('/tmp/solid-2-css.css');
    console.log('/tmp/solid-2-html.html');
  } catch (error) {
    console.error('\nError:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await browser.close();
  }
  
  process.exit(0);
}

main();
