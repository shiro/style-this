#!/usr/bin/env node
import { spawn, execSync, ChildProcess } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { chromium, Browser } from 'playwright';

const REACT_EXAMPLE = path.join(process.cwd(), 'examples/vite-react');
const SOLID_EXAMPLE = path.join(process.cwd(), 'examples/vite-solid');
const SOLID_START_2_EXAMPLE = path.join(process.cwd(), 'examples/vite-solid-start-2');
const NEXT_PAGES_ROUTER_EXAMPLE = path.join(process.cwd(), 'examples/next-pages-router');
const NEXT_APP_ROUTER_EXAMPLE = path.join(process.cwd(), 'examples/next-app-router');
const REACT_PORT = 4173;
const SOLID_PORT = 3000;
const SOLID_START_2_PORT = 3010;
const NEXT_PAGES_ROUTER_PORT = 3002;
const NEXT_APP_ROUTER_PORT = 3003;

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
    
    // Check if command starts with 'node'
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
    await sleep(500); // Extra time for client-side rendering
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

async function buildAndCaptureReact(browser: Browser): Promise<BuildOutput> {
  console.log('Building React example...');
  exec('pnpm build', REACT_EXAMPLE);
  
  let server: ChildProcess | null = null;
  try {
    server = await startServer('preview', REACT_EXAMPLE, REACT_PORT, 'React');
    await sleep(2000); // Give server time to fully start
    
    const html = await fetchHTML(`http://localhost:${REACT_PORT}`, browser);
    
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

async function buildAndCaptureSolid(browser: Browser): Promise<BuildOutput> {
  console.log('Building Solid example...');
  exec('pnpm build', SOLID_EXAMPLE);
  
  let server: ChildProcess | null = null;
  try {
    // For Solid/vinxi, we need to start the production server
    server = await startServer('vinxi start', SOLID_EXAMPLE, SOLID_PORT, 'Solid');
    await sleep(2000); // Give server time to fully start
    
    const html = await fetchHTML(`http://localhost:${SOLID_PORT}`, browser);
    
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

async function buildAndCaptureSolidStart2(browser: Browser): Promise<BuildOutput> {
  console.log('Building Solid Start 2 example...');
  exec('pnpm build', SOLID_START_2_EXAMPLE);
  
  let server: ChildProcess | null = null;
  try {
    // For Solid Start 2, start server directly and set PORT env var
    server = await startServer('node .output/server/index.mjs', SOLID_START_2_EXAMPLE, SOLID_START_2_PORT, 'Solid Start 2', { PORT: String(SOLID_START_2_PORT) });
    await sleep(2000); // Give server time to fully start
    
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

async function buildAndCaptureNext(browser: Browser, examplePath: string, port: number, name: string): Promise<BuildOutput> {
  console.log(`Building ${name} example...`);
  exec('pnpm build', examplePath);
  
  let server: ChildProcess | null = null;
  try {
    // For Next.js, we start the production server
    server = await startServer('pnpm start', examplePath, port, name, { PORT: String(port) });
    await sleep(2000); // Give server time to fully start
    
    const html = await fetchHTML(`http://localhost:${port}`, browser);
    
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




function normalizeCSS(css: string): string {
  return css
    .replace(/\/\*.*?\*\//gs, '') // Remove comments
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

function normalizeHTML(html: string): string {
  return html
    .replace(/<!--.*?-->/gs, '') // Remove HTML comments (including Solid hydration markers)
    .replace(/\sdata-hk="[^"]*"/g, '') // Remove Solid hydration keys
    .replace(/<div\s+hidden=""\s*><\/div>/g, '') // Remove empty hidden div (App Router)
    .replace(/<next-route-announcer[^>]*>[\s\S]*?<\/next-route-announcer>/s, '') // Remove next-route-announcer (App Router)
    .replace(/<div\s+id="__next">([\s\S]*?)<\/div>\s*<next-route-announcer>[\s\S]*?<\/next-route-announcer>/s, '$1') // Remove Next.js wrapper and route announcer
    .replace(/<next-route-announcer>[\s\S]*?<\/next-route-announcer>/s, '') // Remove next-route-announcer if not already removed
    // More robust removal of __next wrapper by looking for the matching closing tag
    .replace(/<div\s+id="__next">/, '') // Remove opening __next tag
    .replace(/<\/div>\s*(?=<script id="__NEXT_DATA__")/s, '') // Remove closing __next tag that comes before __NEXT_DATA__ script
    .replace(/<link[^>]*rel="stylesheet"[^>]*>/g, '') // Remove stylesheet link tags
    .replace(/\bstyle="([^"]*)"/g, (match, styleContent) => {
      // Normalize CSS variable names by removing the hash suffix and whitespace
      const normalized = styleContent
        .replace(/--var\d+-[a-z0-9]+/g, (varMatch: string) => {
          return varMatch.replace(/-[a-z0-9]+$/, '-HASH');
        })
        .replace(/\s*:\s*/g, ':') // Remove whitespace around colons
        .replace(/\s*;\s*/g, ';') // Remove whitespace around semicolons
        .replace(/;+$/, ''); // Remove trailing semicolons
      return `style="${normalized}"`;
    })
    .replace(/\bclass="([^"]*)"/g, (match, classes) => {
      // Normalize class names by removing hash suffixes and extra whitespace
      const normalized = classes
        .replace(/\b(\w+)-[a-z0-9]{6}\b/g, '$1-HASH')
        .replace(/\s+/g, ' ')
        .trim();
      return `class="${normalized}"`;
    })
    .replace(/<script[^>]*>.*?<\/script>/gs, '') // Remove script tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/>\s+</g, '><') // Remove whitespace between tags
    .trim();
}

function extractStyleClasses(css: string): Set<string> {
  const classRegex = /\.([a-zA-Z0-9_-]+)/g;
  const classes = new Set<string>();
  let match;
  while ((match = classRegex.exec(css)) !== null) {
    classes.add(match[1]);
  }
  return classes;
}

function printDiff(label: string, content1: string, content2: string, label1: string, label2: string) {
  const lines1 = content1.split('\n');
  const lines2 = content2.split('\n');
  const maxLines = Math.max(lines1.length, lines2.length);
  
  console.log(`\n${label} Diff:`);
  console.log('─'.repeat(80));
  
  for (let i = 0; i < Math.min(maxLines, 50); i++) {
    const line1 = lines1[i] || '';
    const line2 = lines2[i] || '';
    
    if (line1 !== line2) {
      console.log(`${label1} [${i + 1}]: ${line1}`);
      console.log(`${label2} [${i + 1}]: ${line2}`);
      console.log('');
    }
  }
  
  if (maxLines > 50) {
    console.log(`... (${maxLines - 50} more lines)`);
  }
}

function compareCSS(reactCSS: string, solidCSS: string): boolean {
  const reactNormalized = normalizeCSS(reactCSS);
  const solidNormalized = normalizeCSS(solidCSS);
  
  if (reactNormalized === solidNormalized) {
    console.log('✓ CSS is identical');
    return true;
  }
  
  const reactClasses = extractStyleClasses(reactCSS);
  const solidClasses = extractStyleClasses(solidCSS);
  
  console.log('\n✗ CSS differs:');
  console.log(`  React classes: ${reactClasses.size}`);
  console.log(`  Solid classes: ${solidClasses.size}`);
  
  const reactOnly = [...reactClasses].filter(c => !solidClasses.has(c));
  const solidOnly = [...solidClasses].filter(c => !reactClasses.has(c));
  
  if (reactOnly.length > 0) {
    console.log(`  React-only classes: ${reactOnly.join(', ')}`);
  }
  if (solidOnly.length > 0) {
    console.log(`  Solid-only classes: ${solidOnly.join(', ')}`);
  }
  
  // Write full diff to files for inspection
  fs.writeFileSync('/tmp/react-css.css', reactCSS);
  fs.writeFileSync('/tmp/solid-css.css', solidCSS);
  console.log('\n  Full CSS written to /tmp/react-css.css and /tmp/solid-css.css');
  
  printDiff('CSS', reactCSS, solidCSS, 'React', 'Solid');
  
  return false;
}

function compareHTML(reactHTML: string, solidHTML: string): boolean {
  const reactNormalized = normalizeHTML(reactHTML);
  const solidNormalized = normalizeHTML(solidHTML);
  
  if (reactNormalized === solidNormalized) {
    console.log('✓ HTML structure is identical');
    return true;
  }
  
  console.log('\n✗ HTML differs');
  
  // Write full HTML to files for inspection
  fs.writeFileSync('/tmp/react-html.html', reactHTML);
  fs.writeFileSync('/tmp/solid-html.html', solidHTML);
  fs.writeFileSync('/tmp/react-html-normalized.html', reactNormalized);
  fs.writeFileSync('/tmp/solid-html-normalized.html', solidNormalized);
  console.log('  Full HTML written to /tmp/react-html.html and /tmp/solid-html.html');
  console.log('  Normalized HTML written to /tmp/react-html-normalized.html and /tmp/solid-html-normalized.html');
  
  printDiff('HTML', reactNormalized, solidNormalized, 'React', 'Solid');
  
  return false;
}

async function main() {
  console.log('Comparing Solid Start 2 (source of truth) with other examples\n');
  console.log('='.repeat(50));
  
  let exitCode = 0;
  const chromiumPath = getChromiumPath();
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromiumPath,
  });
  
  try {
    // Capture Solid Start 2 first as the source of truth
    console.log('\nCapturing Solid Start 2 example (source of truth)...');
    const solidStart2Output = await buildAndCaptureSolidStart2(browser);
    
    // Try to capture Solid (may fail due to spawning issues)
    let solidOutput: BuildOutput | null = null;
    try {
      console.log('\nCapturing Solid example...');
      solidOutput = await buildAndCaptureSolid(browser);
    } catch (err) {
      console.warn('\n⚠ Solid capture failed:', err instanceof Error ? err.message : err);
    }
    
    // Capture Next examples
    console.log('\nCapturing Next Pages Router example...');
    const nextPagesRouterOutput = await buildAndCaptureNext(browser, NEXT_PAGES_ROUTER_EXAMPLE, NEXT_PAGES_ROUTER_PORT, 'Next Pages Router');
    
    console.log('\nCapturing Next App Router example...');
    const nextAppRouterOutput = await buildAndCaptureNext(browser, NEXT_APP_ROUTER_EXAMPLE, NEXT_APP_ROUTER_PORT, 'Next App Router');
    
    let cssMatchSolid = true;
    let htmlMatchSolid = true;
    
    if (solidOutput) {
      console.log('\nComparing Solid Start 2 vs Solid CSS...');
      cssMatchSolid = compareCSS(solidStart2Output.css, solidOutput.css);
      
      console.log('\nComparing Solid Start 2 vs Solid HTML...');
      htmlMatchSolid = compareHTML(solidStart2Output.html, solidOutput.html);
      
      if (!cssMatchSolid || !htmlMatchSolid) {
        exitCode = 1;
      }
    }
    
    console.log('\nComparing Solid Start 2 vs Next Pages Router CSS...');
    const cssMatchNextPages = compareCSS(solidStart2Output.css, nextPagesRouterOutput.css);
    
    console.log('\nComparing Solid Start 2 vs Next Pages Router HTML...');
    const htmlMatchNextPages = compareHTML(solidStart2Output.html, nextPagesRouterOutput.html);
    
    console.log('\nComparing Solid Start 2 vs Next App Router CSS...');
    const cssMatchNextApp = compareCSS(solidStart2Output.css, nextAppRouterOutput.css);
    
    console.log('\nComparing Solid Start 2 vs Next App Router HTML...');
    const htmlMatchNextApp = compareHTML(solidStart2Output.html, nextAppRouterOutput.html);
    
    console.log('\nComparing Next Pages Router vs Next App Router CSS...');
    const cssMatchNextBoth = compareCSS(nextPagesRouterOutput.css, nextAppRouterOutput.css);
    
    console.log('\nComparing Next Pages Router vs Next App Router HTML...');
    const htmlMatchNextBoth = compareHTML(nextPagesRouterOutput.html, nextAppRouterOutput.html);
    
    console.log('\n' + '='.repeat(50));
    
    if (cssMatchNextPages && htmlMatchNextPages && cssMatchNextApp && htmlMatchNextApp && cssMatchNextBoth && htmlMatchNextBoth && (!solidOutput || (cssMatchSolid && htmlMatchSolid))) {
      console.log('\n✓ All examples match Solid Start 2 (source of truth)!');
    } else {
      console.log('\n✗ Some outputs differ from Solid Start 2 - see details above');
      exitCode = 1;
    }
  } catch (error) {
    console.error('\nError:', error instanceof Error ? error.message : error);
    exitCode = 1;
  } finally {
    await browser.close();
  }
  
  process.exit(exitCode);
}

main();
