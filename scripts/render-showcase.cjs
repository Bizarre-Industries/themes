#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'showcase/assets/generated');
const pageUrl = 'file://' + path.join(root, 'showcase/index.html');

async function screenshot(locator, file) {
  await locator.scrollIntoViewIfNeeded();
  await locator.screenshot({ path: path.join(outDir, file), animations: 'disabled' });
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  await page.goto(pageUrl, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
  });

  const shots = [
    ['[data-shot="hero"]', 'hero.png'],
    ['[data-shot="palette-ansi"]', 'palette-ansi.png'],
    ['[data-shot="variants"]', 'variants.png'],
    ['[data-shot="syntax"]', 'syntax.png'],
    ['[data-shot="terminal-colors"]', 'terminal-colors.png'],
    ['[data-shot="vscode-themes"]', 'vscode-themes.png'],
    ['[data-shot="editor-themes"]', 'editor-themes.png'],
    ['[data-shot="editor-backlog"]', 'editor-backlog.png'],
    ['[data-shot="shells"]', 'shells.png'],
    ['[data-shot="tools"]', 'tools.png'],
    ['[data-shot="cli-tui"]', 'cli-tui.png'],
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
  ];

  for (const [selector, file] of shots) await screenshot(page.locator(selector), file);
  await browser.close();
  for (const [, file] of shots) console.log(`rendered showcase/assets/generated/${file}`);
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
