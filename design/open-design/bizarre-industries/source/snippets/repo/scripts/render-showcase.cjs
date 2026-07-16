#!/usr/bin/env node

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const showcaseDir = path.join(root, 'showcase');
const outDir = path.join(showcaseDir, 'assets/generated');
const manifestFile = path.join(outDir, 'manifest.json');
const pageFile = path.join(showcaseDir, 'index.html');
const showcaseInputs = [
  'colors_and_type.css',
  'index.html',
  'samples.js',
  'showcase.js',
  'showcase-main.jsx',
  'showcase-panes.jsx',
  'showcase-terminal.jsx',
  'showcase.css',
  'syntax.css',
  'tokens.css',
];

const shots = [
  ['[data-shot="hero"]', 'hero.png'],
  ['[data-shot="palette-ansi"]', 'palette-ansi.png'],
  ['[data-shot="variants"]', 'variants.png'],
  ['[data-shot="syntax"]', 'syntax.png'],
  ['[data-shot="terminal-colors"]', 'terminal-colors.png'],
  ['[data-shot="terminal-backlog"]', 'terminal-backlog.png'],
  ['[data-shot="vscode-themes"]', 'vscode-themes.png'],
  ['[data-shot="editor-themes"]', 'editor-themes.png'],
  ['[data-shot="editor-backlog"]', 'editor-backlog.png'],
  ['[data-shot="shells"]', 'shells.png'],
  ['[data-shot="tools"]', 'tools.png'],
  ['[data-shot="cli-tui"]', 'cli-tui.png'],
  ['[data-shot="desktop-apps"]', 'desktop-apps.png'],
  ['[data-shot="browser-web"]', 'browser-web.png'],
  ['[data-shot="design-devtools-docs"]', 'design-devtools-docs.png'],
  ['[data-shot="window-managers"]', 'window-managers.png'],
  ['[data-shot="shell-banner"]', 'shell-banner.png'],
  ['[data-config-shot="terminal-alacritty"]', 'terminal-colors-alacritty.png'],
  ['[data-config-shot="terminal-kitty"]', 'terminal-colors-kitty.png'],
  ['[data-config-shot="terminal-ghostty"]', 'terminal-colors-ghostty.png'],
  ['[data-config-shot="terminal-iterm2"]', 'terminal-colors-iterm2.png'],
  ['[data-config-shot="terminal-wezterm"]', 'terminal-colors-wezterm.png'],
  ['[data-config-shot="terminal-windows-terminal"]', 'terminal-colors-windows-terminal.png'],
  ['[data-config-shot="terminal-tmux"]', 'terminal-tmux.png'],
  ['[data-config-shot="terminal-zellij"]', 'terminal-zellij.png'],
  ['[data-config-shot="vscode-void"]', 'vscode-void.png'],
  ['[data-config-shot="vscode-void-hicontrast"]', 'vscode-void-hicontrast.png'],
  ['[data-config-shot="vscode-workshop"]', 'vscode-workshop.png'],
  ['[data-config-shot="vscode-paper"]', 'vscode-paper.png'],
  ['[data-config-shot="vscode-bone"]', 'vscode-bone.png'],
  ['[data-config-shot="editor-zed"]', 'editor-zed.png'],
  ['[data-config-shot="editor-jetbrains"]', 'editor-jetbrains.png'],
  ['[data-config-shot="editor-sublime"]', 'editor-sublime.png'],
  ['[data-config-shot="editor-vim"]', 'editor-vim.png'],
  ['[data-config-shot="editor-neovim"]', 'editor-neovim.png'],
  ['[data-config-shot="editor-base16"]', 'editor-base16.png'],
  ['[data-config-shot="shell-bash"]', 'shell-bash.png'],
  ['[data-config-shot="shell-zsh"]', 'shell-zsh.png'],
  ['[data-config-shot="shell-fish"]', 'shell-fish.png'],
  ['[data-config-shot="shell-powershell"]', 'shell-powershell.png'],
  ['[data-config-shot="prompt-starship"]', 'prompt-starship.png'],
  ['[data-config-shot="tool-aerospace"]', 'tool-aerospace.png'],
  ['[data-config-shot="tool-forklift"]', 'tool-forklift.png'],
  ['[data-config-shot="tool-jujutsu"]', 'tool-jujutsu.png'],
  ['[data-config-shot="tool-starship"]', 'tool-starship.png'],
].map(([selector, file]) => ({ selector, file }));

const localShots = [
  'local-vscode.png',
  'local-iterm2.png',
  'local-zsh-banner.png',
  'local-starship.png',
];
const protectedLocalShots = new Set(localShots);

function portable(file) {
  return file.split(path.sep).join('/');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function inputState() {
  const inputFiles = [
    path.join(root, 'palette.js'),
    path.join(root, 'package.json'),
    path.join(root, 'package-lock.json'),
    __filename,
    ...showcaseInputs.map((file) => path.join(showcaseDir, file)),
  ];
  const inputs = [...new Set(inputFiles.map((file) => path.resolve(file)))]
    .sort()
    .map((file) => {
      if (!fs.existsSync(file)) throw new Error(`showcase render input is missing: ${portable(path.relative(root, file))}`);
      return {
        file: portable(path.relative(root, file)),
        sha256: sha256(fs.readFileSync(file)),
      };
    });
  const fingerprint = crypto.createHash('sha256');
  for (const input of inputs) fingerprint.update(input.file).update('\0').update(input.sha256).update('\n');
  return { inputs, inputFingerprint: fingerprint.digest('hex') };
}

function readManifest() {
  if (!fs.existsSync(manifestFile)) return null;
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) throw new Error('expected a JSON object');
    return manifest;
  } catch (error) {
    throw new Error(`cannot parse ${portable(path.relative(root, manifestFile))}: ${error.message}`);
  }
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function verifyShowcase() {
  const problems = [];
  let manifest;
  try {
    manifest = readManifest();
  } catch (error) {
    return [error.message];
  }
  if (!manifest) return [`missing ${portable(path.relative(root, manifestFile))}; run npm run render:showcase`];
  if (manifest.version !== 3) problems.push(`unsupported showcase manifest version: ${manifest.version}`);

  let currentInputs;
  try {
    currentInputs = inputState();
  } catch (error) {
    problems.push(error.message);
    return problems;
  }
  if (manifest.inputFingerprint !== currentInputs.inputFingerprint || !sameJson(manifest.inputs, currentInputs.inputs)) {
    problems.push('showcase render inputs changed; run npm run render:showcase');
  }

  const expectedInventory = shots.map(({ selector, file }) => ({ selector, file }));
  const screenshotRecords = Array.isArray(manifest.screenshots) ? manifest.screenshots : [];
  const storedInventory = screenshotRecords.map((record) => ({
    selector: record && typeof record === 'object' ? record.selector : null,
    file: record && typeof record === 'object' ? record.file : null,
  }));
  if (!sameJson(storedInventory, expectedInventory)) {
    problems.push('showcase screenshot inventory changed; run npm run render:showcase');
  }

  const validRecords = screenshotRecords.filter((record) => record && typeof record === 'object' && typeof record.file === 'string');
  const recordByFile = new Map(validRecords.map((record) => [record.file, record]));
  if (validRecords.length !== screenshotRecords.length) problems.push('showcase manifest contains an invalid screenshot record');
  if (recordByFile.size !== validRecords.length) problems.push('showcase manifest contains duplicate screenshot paths');
  for (const { file } of shots) {
    const screenshotFile = path.join(outDir, file);
    const record = recordByFile.get(file);
    if (!record || !/^[0-9a-f]{64}$/u.test(record.sha256 || '')) {
      problems.push(`showcase manifest is missing a valid hash for ${file}`);
    } else if (!fs.existsSync(screenshotFile)) {
      problems.push(`missing showcase screenshot: ${file}`);
    } else if (sha256(fs.readFileSync(screenshotFile)) !== record.sha256) {
      problems.push(`showcase screenshot changed: ${file}; run npm run render:showcase`);
    }
  }

  if (fs.existsSync(outDir)) {
    const expectedFiles = new Set([...shots.map(({ file }) => file), ...localShots]);
    const unexpected = fs.readdirSync(outDir)
      .filter((file) => file.endsWith('.png') && !expectedFiles.has(file))
      .sort();
    for (const file of unexpected) problems.push(`unexpected browser-rendered showcase screenshot: ${file}`);
  }

  return problems;
}

async function capture(page, selector, file, stagingDir) {
  await page.waitForSelector(selector, { state: 'visible' });
  const locator = page.locator(selector);
  const count = await locator.count();
  if (count !== 1) throw new Error(`${selector} matched ${count} elements; expected exactly one`);
  await locator.scrollIntoViewIfNeeded();
  await locator.screenshot({ path: path.join(stagingDir, file), animations: 'disabled' });
}

function atomicCopy(source, target) {
  const temporary = `${target}.tmp-${process.pid}`;
  try {
    fs.copyFileSync(source, temporary);
    fs.renameSync(temporary, target);
  } finally {
    fs.rmSync(temporary, { force: true });
  }
}

function removeObsoleteScreenshots(previous, currentFiles, directory = outDir) {
  for (const record of previous && Array.isArray(previous.screenshots) ? previous.screenshots : []) {
    if (!record || typeof record !== 'object' || typeof record.file !== 'string' || currentFiles.has(record.file)) continue;
    if (path.basename(record.file) !== record.file || !record.file.endsWith('.png')) continue;
    if (protectedLocalShots.has(record.file)) continue;
    if (!/^[0-9a-f]{64}$/u.test(record.sha256 || '')) continue;
    const screenshotFile = path.join(directory, record.file);
    let stat;
    try {
      stat = fs.lstatSync(screenshotFile);
    } catch (error) {
      if (error && error.code === 'ENOENT') continue;
      throw error;
    }
    if (stat.isFile() && sha256(fs.readFileSync(screenshotFile)) === record.sha256) fs.rmSync(screenshotFile);
  }
}

function commitRender(stagingDir, state) {
  const screenshots = shots.map(({ selector, file }) => ({
    selector,
    file,
    sha256: sha256(fs.readFileSync(path.join(stagingDir, file))),
  }));
  const manifest = {
    version: 3,
    inputFingerprint: state.inputFingerprint,
    inputs: state.inputs,
    screenshots,
  };

  let previous = null;
  try {
    previous = readManifest();
  } catch {
    // A successful render replaces an unreadable old manifest after all captures exist.
  }

  fs.mkdirSync(outDir, { recursive: true });
  for (const { file } of shots) atomicCopy(path.join(stagingDir, file), path.join(outDir, file));

  const currentFiles = new Set(shots.map(({ file }) => file));
  removeObsoleteScreenshots(previous, currentFiles);

  const temporaryManifest = `${manifestFile}.tmp-${process.pid}`;
  try {
    fs.writeFileSync(temporaryManifest, `${JSON.stringify(manifest, null, 2)}\n`);
    fs.renameSync(temporaryManifest, manifestFile);
  } finally {
    fs.rmSync(temporaryManifest, { force: true });
  }
}

async function renderShowcase() {
  const before = inputState();
  const stagingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-showcase-'));
  let browser;
  try {
    const { chromium } = require('playwright');
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1100 },
      deviceScaleFactor: 1,
      offline: true,
    });
    const page = await context.newPage();
    await page.goto(pathToFileURL(pageFile).href, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
    });
    for (const { selector, file } of shots) await capture(page, selector, file, stagingDir);

    const after = inputState();
    if (before.inputFingerprint !== after.inputFingerprint) {
      throw new Error('showcase render inputs changed during capture; no repository files were updated');
    }
    commitRender(stagingDir, after);
  } finally {
    if (browser) await browser.close();
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }

  for (const { file } of shots) console.log(`rendered showcase/assets/generated/${file}`);
  console.log('rendered showcase/assets/generated/manifest.json');
}

async function main() {
  const args = process.argv.slice(2);
  const unknown = args.filter((arg) => arg !== '--check');
  if (unknown.length) throw new Error(`unknown argument${unknown.length === 1 ? '' : 's'}: ${unknown.join(', ')}`);

  if (args.includes('--check')) {
    const problems = verifyShowcase();
    if (problems.length) {
      console.error('showcase verification failed');
      for (const problem of problems) console.error(`- ${problem}`);
      process.exitCode = 1;
      return;
    }
    console.log(`showcase verification passed (${shots.length} screenshots, ${inputState().inputs.length} inputs)`);
    return;
  }

  await renderShowcase();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}

module.exports = { inputState, localShots, removeObsoleteScreenshots, shots, verifyShowcase };
