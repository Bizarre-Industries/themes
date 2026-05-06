# BIZARRE INDUSTRIES — Editor & Terminal Themes

`BZR / DOTFILES / V0.1 / APR 2026`

A complete theming bundle for code editors, terminal emulators, and shells — all derived from the [Bizarre Industries design system](https://bizarre.industries) and **CATCH THE STARS.**

## What's in here

```
.
├── PALETTE.md            ← the single source of truth
├── showcase/             ← interactive HTML preview (open showcase/index.html)
│
├── editors/
│   ├── vscode/           ← VS Code extension (5 variants)
│   ├── sublime/          ← .sublime-color-scheme + .sublime-theme
│   ├── jetbrains/        ← IntelliJ / PyCharm / WebStorm (.icls)
│   ├── zed/              ← Zed (.json)
│   ├── neovim/           ← pure Lua colorscheme + plugin
│   ├── neovim-base16/    ← base16 / tinted-theming compatible
│   └── vim/              ← classic Vim (.vim)
│
├── terminals/
│   ├── kitty/            ← .conf
│   ├── wezterm/          ← .lua
│   ├── alacritty/        ← .toml
│   ├── iterm2/           ← .itermcolors (5 variants)
│   ├── ghostty/          ← .conf
│   ├── windows-terminal/ ← schema fragment for settings.json
│   └── tmux/             ← .tmux.conf statusline
│
├── shells/
│   ├── banner/           ← BIZARRE INDUSTRIES launch banner
│   │   ├── bizarre.zsh
│   │   ├── bizarre.bash
│   │   ├── bizarre.fish
│   │   └── bizarre.ps1
│   └── manifesto.txt     ← rotating quote pool
│
└── prompt/
    └── starship.toml     ← powerline-style ✦ prompt
```

## Install (cherry-pick what you use)

```bash
# Banner — first shell of the day shows BIZARRE INDUSTRIES + slogan
echo 'source ~/dotfiles/bizarre/shells/banner/bizarre.zsh' >> ~/.zshrc

# Starship prompt
cp prompt/starship.toml ~/.config/starship.toml

# Kitty
cp terminals/kitty/bizarre-void.conf ~/.config/kitty/themes/

# Alacritty
mkdir -p ~/.config/alacritty/themes
cp terminals/alacritty/*.toml ~/.config/alacritty/themes/

# Neovim (Lua plugin)
ln -s "$PWD/editors/neovim" ~/.config/nvim/pack/bizarre/start/bizarre.nvim
# then in init.lua: vim.cmd.colorscheme('bizarre-void')

# tmux
echo 'source-file ~/dotfiles/bizarre/terminals/tmux/bizarre.tmux.conf' >> ~/.tmux.conf

# VS Code (local install, no marketplace)
ln -s "$PWD/editors/vscode" ~/.vscode/extensions/bizarre-industries.bizarre-themes

# iTerm2
open terminals/iterm2/bizarre-void.itermcolors

# Windows Terminal — paste the schemas[] entries from terminals/windows-terminal/schemas.json
```

## Variants

Five flavors. All ship for every editor and terminal:

| Variant | Mood |
|---|---|
| **Bizarre Void** | the default — pure void, lime accent |
| **Bizarre Void Hi-Contrast** | pure black, max lime — projector / OLED |
| **Bizarre Workshop** | warmer dark, less pure void — long sessions |
| **Bizarre Paper** | the default light — warm off-white, acid-lime-ink |
| **Bizarre Bone** | softer light, warmer neutrals |

## The brand

> Three non-negotiables:
> 1. The mark appears in **Signal Lime** and **Void Gray**, or monochrome. Never other colors.
> 2. The slogan is **CATCH THE STARS** — never stacked with the mark, always standing alone.
> 3. The voice is **second-person, promotion-focused, never anti-establishment**.

Lime is reserved for **function names** in code (the structural hero) and **diagnostics** (errors, cursor, breakpoints) in editors. Strings are gray. Comments are italic ash. Numbers are warn-amber. Types are info-blue. Constants are magenta. The brand 60-30-10 holds: most of the screen is void or paper, the rest is ash, and a sparse 10% is lime where it earns it.

CATCH THE STARS.
