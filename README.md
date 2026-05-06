# BIZARRE INDUSTRIES - Editor, Terminal, Shell, And Tool Themes

`BZR / THEMES / V0.2 / MAY 2026`

A generated theming bundle for editors, terminals, shells, prompts, window managers, and desktop tools. One palette, five variants, GitHub Monaspace typography, and one rule: CATCH THE STARS.

![Bizarre theme showcase hero](showcase/assets/generated/hero.png)

## Showcase

Open [showcase/index.html](showcase/index.html) locally for the interactive preview. The README images below are rendered from that same showcase and from local app captures.

![Bizarre generated variants](showcase/assets/generated/variants.png)

![Bizarre syntax roles](showcase/assets/generated/syntax.png)

![Bizarre palette and ANSI](showcase/assets/generated/palette-ansi.png)

## Applied Local Screenshots

These are real local captures using one installed target per category, with temporary profiles and generated configs applied directly.

| Editor | Terminal |
|---|---|
| ![Bizarre Void applied in VS Code](showcase/assets/generated/local-vscode.png) | ![Bizarre Void applied in iTerm2](showcase/assets/generated/local-iterm2.png) |

| Shell | Prompt / Tool |
|---|---|
| ![Bizarre Zsh banner applied in iTerm2](showcase/assets/generated/local-zsh-banner.png) | ![Bizarre Starship prompt applied in iTerm2](showcase/assets/generated/local-starship.png) |

## Generated Coverage Cards

Every shipped target still gets a generated preview card in `showcase/assets/generated/`. These family sheets are rendered from [showcase/index.html](showcase/index.html) and show coverage without installing every app.

![Bizarre terminal color configs](showcase/assets/generated/terminal-colors.png)

![Bizarre VS Code themes](showcase/assets/generated/vscode-themes.png)

![Bizarre editor theme configs](showcase/assets/generated/editor-themes.png)

![Bizarre shell banners and prompt](showcase/assets/generated/shells.png)

![Bizarre desktop and workflow tools](showcase/assets/generated/tools.png)

![Bizarre shell banner](showcase/assets/generated/shell-banner.png)

## Install Examples

```bash
# Generate every config from palette.js
npm run generate

# Render README screenshots
npm run render:showcase

# Verify generated files are current
npm test

# Starship prompt
cp prompt/starship.toml ~/.config/starship.toml

# Kitty
cp terminals/kitty/bizarre-void.conf ~/.config/kitty/themes/

# Alacritty
mkdir -p ~/.config/alacritty/themes
cp terminals/alacritty/*.toml ~/.config/alacritty/themes/

# Ghostty
cp terminals/ghostty/bizarre-void ~/.config/ghostty/themes/

# WezTerm
mkdir -p ~/.config/wezterm
cp terminals/wezterm/bizarre.lua ~/.config/wezterm/bizarre.lua
# then in wezterm.lua: return require('bizarre')

# Neovim
ln -s "$PWD/editors/neovim" ~/.config/nvim/pack/bizarre/start/bizarre.nvim
# then in init.lua: vim.cmd.colorscheme('bizarre-void')

# Vim
mkdir -p ~/.vim/colors
cp editors/vim/colors/*.vim ~/.vim/colors/

# Zed
mkdir -p ~/.config/zed/themes
cp editors/zed/themes/bizarre.json ~/.config/zed/themes/

# JetBrains
# import editors/jetbrains/bizarre-void.icls from Settings > Editor > Color Scheme

# Sublime Text
mkdir -p "$HOME/Library/Application Support/Sublime Text/Packages/User"
cp editors/sublime/*.sublime-color-scheme "$HOME/Library/Application Support/Sublime Text/Packages/User/"

# tmux
echo 'source-file ~/dotfiles/bizarre/terminals/tmux/bizarre.tmux.conf' >> ~/.tmux.conf

# VS Code
ln -s "$PWD/editors/vscode" ~/.vscode/extensions/bizarre-industries.bizarre-themes

# iTerm2
open terminals/iterm2/bizarre-void.itermcolors

# Zellij
mkdir -p ~/.config/zellij/themes
cp terminals/zellij/bizarre.kdl ~/.config/zellij/themes/

# Windows Terminal
# paste terminals/windows-terminal/schemes.json schemes into settings.json

# Shell banners
echo "source $PWD/shells/banner/bizarre.bash" >> ~/.bashrc
echo "source $PWD/shells/banner/bizarre.zsh" >> ~/.zshrc
echo "source $PWD/shells/banner/bizarre.fish" >> ~/.config/fish/config.fish
# PowerShell: dot-source shells/banner/bizarre.ps1 from your profile

# AeroSpace
mkdir -p ~/.config/aerospace
cp tools/aerospace/aerospace.toml ~/.config/aerospace/aerospace.toml

# ForkLift
# import tools/forklift/Bizarre.json through ForkLift theme preferences

# Jujutsu
mkdir -p ~/.config/jj
cp tools/jujutsu/config.toml ~/.config/jj/config.toml
```

## Current Coverage

| Family | Targets |
|---|---|
| Editors | VS Code, Zed, JetBrains, Sublime Text, Vim, Neovim, Neovim Base16 |
| Terminals | Alacritty, Kitty, WezTerm, iTerm2, Ghostty, Windows Terminal, tmux, Zellij |
| Shells and prompt | Bash, Zsh, Fish, PowerShell, Starship |
| Tools | AeroSpace, ForkLift, Jujutsu |

## Variants

| Variant | Mood |
|---|---|
| Bizarre Void | pure void · lime accent · the default |
| Bizarre Void Hi-Contrast | pure black · max lime · OLED / projector |
| Bizarre Workshop | warm dark · lower contrast · long sessions |
| Bizarre Paper | warm off-white · lime ink · the default light |
| Bizarre Bone | softer light · warmer neutrals |

## Source Of Truth

- Palette: [palette.js](palette.js)
- Palette spec: [PALETTE.md](PALETTE.md)
- Port roadmap: [PORTS.md](PORTS.md)

Signal Lime is reserved for functions, cursors, focus rings, and active command surfaces. Light variants use Lime Ink where raw Signal Lime would fail as text.
