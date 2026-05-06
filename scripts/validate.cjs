#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const TOML = require('@iarna/toml');
const palette = require('../palette.js');

const root = path.resolve(__dirname, '..');
const failures = [];

function rel(file) {
  return path.relative(root, file);
}

function fail(label, error) {
  failures.push(`${label}: ${error.message || error}`);
}

function files(dir, predicate) {
  const base = path.join(root, dir);
  if (!fs.existsSync(base)) return [];
  const out = [];
  for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
    const file = path.join(base, entry.name);
    if (entry.isDirectory()) out.push(...files(rel(file), predicate));
    else if (predicate(file)) out.push(file);
  }
  return out;
}

function run(command, args, label, optional = false) {
  const probe = spawnSync('sh', ['-lc', `command -v ${command}`], { stdio: 'ignore' });
  if (probe.status !== 0) {
    if (!optional) failures.push(`${label}: ${command} not found`);
    else console.log(`skip ${label}: ${command} not installed`);
    return;
  }

  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) {
    failures.push(`${label}: ${(result.stderr || result.stdout || '').trim()}`);
  } else {
    console.log(label);
  }
}

for (const file of [
  'editors/vscode/package.json',
  ...files('editors/vscode/themes', (file) => file.endsWith('.json')).map(rel),
  ...files('editors/sublime', (file) => file.endsWith('.sublime-color-scheme')).map(rel),
  'editors/zed/themes/bizarre.json',
  'terminals/windows-terminal/schemes.json',
  'tools/forklift/Bizarre.json',
]) {
  try {
    JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
    console.log(`json ${file}`);
  } catch (error) {
    fail(`json ${file}`, error);
  }
}

for (const file of [
  'prompt/starship.toml',
  'tools/aerospace/aerospace.toml',
  'tools/jujutsu/config.toml',
  ...files('terminals/alacritty', (file) => file.endsWith('.toml')).map(rel),
]) {
  try {
    TOML.parse(fs.readFileSync(path.join(root, file), 'utf8'));
    console.log(`toml ${file}`);
  } catch (error) {
    fail(`toml ${file}`, error);
  }
}

for (const file of files('terminals/iterm2', (file) => file.endsWith('.itermcolors')).map(rel)) {
  run('plutil', ['-lint', file], `plist ${file}`);
}

for (const file of files('editors/jetbrains', (file) => file.endsWith('.icls')).map(rel)) {
  run('xmllint', ['--noout', file], `xml ${file}`);
}

run('bash', ['-n', 'shells/banner/bizarre.bash'], 'bash banner');
run('zsh', ['-n', 'shells/banner/bizarre.zsh'], 'zsh banner');
run('fish', ['-n', 'shells/banner/bizarre.fish'], 'fish banner', true);
run('pwsh', ['-NoProfile', '-Command', "$null = [scriptblock]::Create((Get-Content -Raw 'shells/banner/bizarre.ps1'))"], 'powershell banner', true);

run('nvim', ['--headless', '-u', 'NONE', '-c', "lua assert(loadfile('terminals/wezterm/bizarre.lua'))", '-c', 'qa'], 'lua wezterm', true);
for (const file of files('editors/neovim/lua/bizarre', (file) => file.endsWith('.lua')).map(rel)) {
  run('nvim', ['--headless', '-u', 'NONE', '-c', `lua assert(loadfile('${file}'))`, '-c', 'qa'], `lua ${file}`, true);
}

for (const id of palette.variantOrder) {
  run('nvim', ['--headless', '-u', 'NONE', '-c', 'set rtp+=editors/neovim', '-c', `colorscheme bizarre-${id}`, '-c', 'qa'], `nvim colorscheme bizarre-${id}`, true);
}

for (const file of files('editors/vim/colors', (file) => file.endsWith('.vim')).map(rel)) {
  run('vim', ['-Nu', 'NONE', '-n', '-es', '-S', file, '-c', 'qa'], `vim ${file}`, true);
}

if (failures.length) {
  console.error('\nvalidation failed');
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}

console.log('\nvalidation passed');
