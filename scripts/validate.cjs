#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const TOML = require('@iarna/toml');
const YAML = require('yaml');
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
  ...files('editors/kate', (file) => file.endsWith('.theme')).map(rel),
  ...files('editors/nova', (file) => file.endsWith('.json')).map(rel),
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
  ...files('editors/helix', (file) => file.endsWith('.toml')).map(rel),
  ...files('editors/lapce', (file) => file.endsWith('.toml')).map(rel),
  'tools/aerospace/aerospace.toml',
  'tools/jujutsu/config.toml',
  ...files('tools/atuin', (file) => file.endsWith('.toml')).map(rel),
  ...files('tools/bottom', (file) => file.endsWith('.toml')).map(rel),
  ...files('tools/yazi', (file) => file.endsWith('.toml')).map(rel),
  ...files('terminals/alacritty', (file) => file.endsWith('.toml')).map(rel),
]) {
  try {
    TOML.parse(fs.readFileSync(path.join(root, file), 'utf8'));
    console.log(`toml ${file}`);
  } catch (error) {
    fail(`toml ${file}`, error);
  }
}

for (const file of [
  ...files('editors/neovim-base16', (file) => file.endsWith('.yaml')).map(rel),
  ...files('tools/k9s', (file) => file.endsWith('.yaml')).map(rel),
  ...files('tools/lazygit', (file) => file.endsWith('.yml') || file.endsWith('.yaml')).map(rel),
  ...files('tools/vivid', (file) => file.endsWith('.yml') || file.endsWith('.yaml')).map(rel),
]) {
  try {
    YAML.parse(fs.readFileSync(path.join(root, file), 'utf8'));
    console.log(`yaml ${file}`);
  } catch (error) {
    fail(`yaml ${file}`, error);
  }
}

for (const file of [
  ...files('terminals/iterm2', (file) => file.endsWith('.itermcolors')).map(rel),
  ...files('editors/xcode', (file) => file.endsWith('.xccolortheme')).map(rel),
  ...files('tools/bat', (file) => file.endsWith('.tmTheme')).map(rel),
  ...files('tools/yazi', (file) => file.endsWith('.xml')).map(rel),
]) {
  run('plutil', ['-lint', file], `plist ${file}`);
}

for (const file of [
  ...files('editors/jetbrains', (file) => file.endsWith('.icls')).map(rel),
  ...files('editors/notepad-plus-plus', (file) => file.endsWith('.xml')).map(rel),
  ...files('editors/visual-studio', (file) => file.endsWith('.vstheme')).map(rel),
]) {
  run('xmllint', ['--noout', file], `xml ${file}`);
}

for (const file of files('editors/emacs', (file) => file.endsWith('.el')).map(rel)) {
  run('emacs', ['-Q', '--batch', '-l', file, '--eval', '(message "theme loaded")'], `emacs ${file}`, true);
}

run('bash', ['-n', 'shells/banner/bizarre.bash'], 'bash banner');
run('zsh', ['-n', 'shells/banner/bizarre.zsh'], 'zsh banner');
run('bash', ['-n', 'tools/fzf/bizarre.sh'], 'bash fzf');
run('bash', ['-n', 'tools/eza/bizarre.sh'], 'bash eza');
run('fish', ['-n', 'shells/banner/bizarre.fish'], 'fish banner', true);
run('pwsh', ['-NoProfile', '-Command', "$null = [scriptblock]::Create((Get-Content -Raw 'shells/banner/bizarre.ps1'))"], 'powershell banner', true);

for (const file of files('tools/btop', (file) => file.endsWith('.theme')).map(rel)) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  const bad = text.split('\n').filter((line) => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith('#') && !/^theme\[[a-z_]+\]="(?:#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{2})"$/u.test(trimmed);
  });
  if (bad.length) fail(`btop ${file}`, `invalid theme lines: ${bad.join(', ')}`);
  else console.log(`btop ${file}`);
}

for (const file of files('tools/dircolors', (file) => file.endsWith('.dircolors')).map(rel)) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  const bad = text.split('\n').filter((line) => {
    const trimmed = line.trim();
    return trimmed
      && !trimmed.startsWith('#')
      && !/^TERM\s+\S+$/u.test(trimmed)
      && !/^([*.A-Za-z0-9_.-]+)\s+[0-9;]+$/u.test(trimmed);
  });
  if (bad.length) fail(`dircolors ${file}`, `invalid lines: ${bad.join(', ')}`);
  else console.log(`dircolors ${file}`);
}

for (const file of files('tools/ranger', (file) => file.endsWith('.py')).map(rel)) {
  run('python3', ['-m', 'py_compile', file], `python ${file}`);
}

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
