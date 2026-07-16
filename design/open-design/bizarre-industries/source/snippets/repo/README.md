# BIZARRE INDUSTRIES - Editor, Terminal, Shell, And Tool Themes

`BZR / THEMES / V0.2 / MAY 2026`

A generated theming bundle for editors, terminals, shells, prompts, window managers, and desktop tools. One palette, five variants, GitHub Monaspace typography, and one rule: CATCH THE STARS.

![Bizarre theme showcase hero](showcase/assets/generated/hero.png)

## Static GitHub Catalog

The tracked images below are the current GitHub-facing catalog. [showcase/index.html](showcase/index.html) is a fixed capture source for those images, not an interactive product. Interactive theme controls are reserved for a future Bizarre Industries website deployment.

![Bizarre generated variants](showcase/assets/generated/variants.png)

![Bizarre syntax roles](showcase/assets/generated/syntax.png)

![Bizarre palette and ANSI](showcase/assets/generated/palette-ansi.png)

## Open Design Design System

The repo-canonical Open Design package lives at [design/open-design/bizarre-industries/](design/open-design/bizarre-industries/). Bizarre Void is its default binding, and its previews expose all five artifact-level CSS modes; the other four are not presented as native Open Design picker modes.

The package preserves full repository evidence, including this README byte-for-byte, while promoting the operating rules into its normative `DESIGN.md`. `palette.js` remains authoritative. Generate the package with `npm run generate:open-design` and verify it with `npm run check:open-design`.

Open Design's local install links this stable repository path. The package is published and agent-managed generated output, so do not edit it through Open Design or treat it as a second palette source. Preserve any existing catalog system until a backup and migration are explicitly confirmed.

## Optional Native Captures

Native application screenshots are not part of the tracked catalog until they are deliberately recaptured against the current generated inputs. A fully provisioned macOS environment can run `npm run render:local` to publish an atomic four-image set and input-fingerprinted local manifest; `npm run check:local` then verifies both freshness and image hashes. Neither command runs in CI.

## Generated Coverage Cards

Every shipped target gets a generated preview card in `showcase/assets/generated/`. Each card names the real repository artifact and the exact variant it previews.

![Bizarre terminal color configs](showcase/assets/generated/terminal-colors.png)

![Bizarre additional terminal ports](showcase/assets/generated/terminal-backlog.png)

![Bizarre VS Code themes](showcase/assets/generated/vscode-themes.png)

![Bizarre editor theme configs](showcase/assets/generated/editor-themes.png)

![Bizarre additional editor ports](showcase/assets/generated/editor-backlog.png)

![Bizarre shell banners and prompt](showcase/assets/generated/shells.png)

![Bizarre desktop and workflow tools](showcase/assets/generated/tools.png)

![Bizarre CLI and TUI tool ports](showcase/assets/generated/cli-tui.png)

![Bizarre desktop app adapters](showcase/assets/generated/desktop-apps.png)

![Bizarre browser and web ports](showcase/assets/generated/browser-web.png)

![Bizarre design devtool and docs ports](showcase/assets/generated/design-devtools-docs.png)

![Bizarre OS and window manager ports](showcase/assets/generated/window-managers.png)

![Bizarre shell banner](showcase/assets/generated/shell-banner.png)

## Install Examples

Existing config files are preserved. Commands that install full behavior-bearing examples use `cp -n`; when a destination already exists, merge only the documented theme keys manually.

`npm test` runs the portable validator set and reports unavailable optional native validators as explicit skips. `npm run validate:strict` treats those missing validators as failures; a fully provisioned strict run requires Emacs, Fish, PowerShell (`pwsh`), Neovim, and Vim in addition to the portable toolchain.

```bash
# Install the locked Node dependencies (Node ^20.17.0 or >=22.9.0)
npm ci

# Generate every config from palette.js
npm run generate

# Verify contracts, generated files, and portable validators
npm test

# Require the complete optional native validator toolchain
npm run validate:strict

# Browser-render the static catalog (one-time browser bootstrap required)
npx playwright install chromium
npm run render:showcase

# Native application captures are always opt-in
npm run render:local
npm run check:local

# Starship prompt
mkdir -p ~/.config
cp -n prompt/starship.toml ~/.config/starship.toml
# If ~/.config/starship.toml already exists, keep it and manually merge the Bizarre palette, format, and modules.

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
mkdir -p ~/.config/nvim/pack/bizarre/start
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

# Emacs
mkdir -p ~/.emacs.d/themes
cp editors/emacs/*-theme.el ~/.emacs.d/themes/

# Helix
mkdir -p ~/.config/helix/themes
cp editors/helix/*.toml ~/.config/helix/themes/

# Lapce
mkdir -p ~/.local/share/lapce-stable/themes
cp editors/lapce/*.toml ~/.local/share/lapce-stable/themes/

# Kate
mkdir -p ~/.local/share/org.kde.syntax-highlighting/themes
cp editors/kate/*.theme ~/.local/share/org.kde.syntax-highlighting/themes/

# Notepad++
# copy editors/notepad-plus-plus/*.xml into the Notepad++ themes directory

# Nova
# import or copy editors/nova/*.json into Nova's extension/theme workspace

# Cursor
# use the VS Code extension in editors/vscode; see editors/cursor/README.md

# Visual Studio
# import editors/visual-studio/*.vstheme through Visual Studio theme tooling

# Android Studio
# use the JetBrains schemes in editors/jetbrains; see editors/android-studio/README.md

# tmux
tmux_line='source-file ~/dotfiles/bizarre/terminals/tmux/bizarre.tmux.conf'
grep -qxF "$tmux_line" ~/.tmux.conf 2>/dev/null || printf '%s\n' "$tmux_line" >> ~/.tmux.conf

# VS Code
ln -s "$PWD/editors/vscode" ~/.vscode/extensions/bizarre-industries.bizarre-themes

# iTerm2
open terminals/iterm2/bizarre-void.itermcolors

# Zellij
mkdir -p ~/.config/zellij/themes
cp terminals/zellij/bizarre.kdl ~/.config/zellij/themes/

# Windows Terminal
# paste terminals/windows-terminal/schemes.json schemes into settings.json

# Foot
mkdir -p ~/.config/foot/themes
cp terminals/foot/*.ini ~/.config/foot/themes/

# Konsole
mkdir -p ~/.local/share/konsole
cp terminals/konsole/*.colorscheme ~/.local/share/konsole/

# Rio
mkdir -p ~/.config/rio/themes
cp terminals/rio/*.toml ~/.config/rio/themes/

# Hyper
# merge one terminals/hyper/bizarre-*.js config object into ~/.hyper.js

# Terminator
# merge one terminals/terminator/bizarre-*.config profile into ~/.config/terminator/config

# Tilix
# import one terminals/tilix/bizarre-*.dconf with dconf load

# XFCE Terminal
mkdir -p ~/.local/share/xfce4/terminal/colorschemes
cp terminals/xfce-terminal/*.theme ~/.local/share/xfce4/terminal/colorschemes/

# GNOME Terminal
bash terminals/gnome-terminal/bizarre.sh bizarre-void

# Black Box
# import or adapt terminals/black-box/*.json through Black Box palette settings

# Shell banners
echo "source $PWD/shells/banner/bizarre.bash" >> ~/.bashrc
echo "source $PWD/shells/banner/bizarre.zsh" >> ~/.zshrc
echo "source $PWD/shells/banner/bizarre.fish" >> ~/.config/fish/config.fish
# PowerShell: dot-source shells/banner/bizarre.ps1 from your profile

# AeroSpace
mkdir -p ~/.config/aerospace
cp -n tools/aerospace/aerospace.toml ~/.config/aerospace/aerospace.toml
# If the destination exists, preserve it and manually merge the theme keys; the example also contains keybindings and routing behavior.

# ForkLift
# import tools/forklift/Bizarre.json through ForkLift theme preferences

# Jujutsu
mkdir -p ~/.config/jj
cp -n tools/jujutsu/config.toml ~/.config/jj/config.toml
# If the destination exists, preserve it and manually merge the colors; the example also contains defaults and aliases.

# bat
mkdir -p "$(bat --config-dir)/themes"
cp tools/bat/themes/*.tmTheme "$(bat --config-dir)/themes/"
bat cache --build

# btop
mkdir -p ~/.config/btop/themes
cp tools/btop/*.theme ~/.config/btop/themes/
# then set color_theme = "bizarre-void" in ~/.config/btop/btop.conf

# delta
# add tools/delta/bizarre.gitconfig to your ~/.gitconfig [include] path
# then set [delta] features = bizarre-void

# dircolors
eval "$(dircolors tools/dircolors/bizarre.dircolors)"

# fzf
source tools/fzf/bizarre.sh

# lazygit
# merge tools/lazygit/config.yml into ~/.config/lazygit/config.yml

# Yazi
mkdir -p ~/.config/yazi/flavors
cp -R tools/yazi/flavors/*.yazi ~/.config/yazi/flavors/
# then set [flavor] dark = "bizarre-void" in ~/.config/yazi/theme.toml

# eza
source tools/eza/bizarre.sh

# Atuin
mkdir -p ~/.config/atuin/themes
cp tools/atuin/themes/*.toml ~/.config/atuin/themes/
# then set [theme] name = "bizarre-void" in ~/.config/atuin/config.toml

# bottom
# merge one tools/bottom/bizarre-*.toml into ~/.config/bottom/bottom.toml

# K9s
mkdir -p ~/.config/k9s/skins
cp tools/k9s/skins/*.yaml ~/.config/k9s/skins/
# then set skin: bizarre-void in ~/.config/k9s/config.yaml

# ranger
mkdir -p ~/.config/ranger/colorschemes
cp tools/ranger/colorschemes/*.py ~/.config/ranger/colorschemes/
# then set colorscheme bizarre_void in ~/.config/ranger/rc.conf

# vivid
mkdir -p ~/.config/vivid/themes
cp tools/vivid/themes/*.yml ~/.config/vivid/themes/
# then export LS_COLORS="$(vivid generate bizarre-void)"

# Raycast
# import apps/raycast/*.json through Raycast theme preferences

# Alfred
# import apps/alfred/*.alfredappearance through Alfred appearance preferences

# Obsidian
# copy apps/obsidian/*.css into your vault .obsidian/themes directory

# Logseq
# copy one apps/logseq/bizarre-*.css into custom.css or merge its variables

# Slack
# paste one line from apps/slack/bizarre-sidebar-themes.txt into Slack sidebar theme settings

# Discord
# BetterDiscord adapter: copy apps/discord/betterdiscord/*.theme.css into the BetterDiscord themes folder

# Telegram
# import apps/telegram/*.tdesktop-theme through Telegram Desktop theme settings

# Spotify
# Spicetify adapter: copy apps/spotify/spicetify/color.ini and user.css into a Spicetify theme directory

# qutebrowser
# source one apps/qutebrowser/bizarre-*.py from qutebrowser config.py

# Firefox
# load web/firefox/bizarre-void/manifest.json as a temporary extension or package it for signing

# Chrome
# load web/chrome/bizarre-void as an unpacked extension theme

# Arc
# paste one web/arc/boosts/bizarre-*.css file into Arc Boost code

# Vivaldi
# compress one web/vivaldi/bizarre-*/theme.json as theme ZIP contents, then import it

# Userstyles
# import one web/userstyles/bizarre-*.user.css into a Stylus-compatible manager

# Startpages
# point your browser homepage to one web/startpages/bizarre-*.html file

# Documentation sites
# merge one web/documentation-sites/bizarre-*.css file into your docs site CSS

# Figma
# import design/figma/bizarre.tokens.json into your token workflow

# Sketch
# import design/sketch/bizarre.sketchpalette with Sketch Palettes-compatible tooling

# Insomnia
# load devtools/insomnia/bizarre.js through Insomnia theme plugin workflow

# Postman
# userstyle adapter: merge one devtools/postman/bizarre-*.css file through a userstyle manager

# HTTPie
# use devtools/httpie/bizarre.py as a Pygments style module

# TablePlus
# import or adapt one devtools/tableplus/bizarre-*.json file through TablePlus theme tooling

# DBeaver
# import one devtools/dbeaver/bizarre-*.epf preference file into a compatible workspace

# GitHub README assets
# reference devtools/github-readme-assets/bizarre-badge.svg from README media

# MkDocs
# add one docs-sites/mkdocs/bizarre-*.css file to extra_css in mkdocs.yml

# Docusaurus
# import one docs-sites/docusaurus/bizarre-*.css file from custom.css

# Sphinx
# copy docs-sites/sphinx/bizarre into your Sphinx theme path

# LaTeX, Typst, Beamer, reveal.js
# merge files from docs-sites/latex, docs-sites/typst, docs-sites/beamer, and docs-sites/reveal.js

# Hyprland
# source one wm/hyprland/bizarre-*.conf file from hyprland.conf

# Sway
# include one wm/sway/bizarre-*.conf file from config

# i3
# include one wm/i3/bizarre-*.conf file from config

# Waybar
# import one wm/waybar/bizarre-*.css file from style.css

# Polybar
# include one wm/polybar/bizarre-*.ini file from config.ini

# SketchyBar
# source wm/sketchybar/bizarre.sh from your bar setup

# yabai
# source wm/yabai/bizarre.sh from yabairc

# rofi
# copy one wm/rofi/bizarre-*.rasi file into ~/.config/rofi/themes/

# wofi
# import one wm/wofi/bizarre-*.css file from style.css
```

## Current Coverage

| Family | Targets |
|---|---|
| Editors | VS Code, Zed, JetBrains, Sublime Text, Vim, Neovim, Neovim Base16, Emacs, Helix, Lapce, Kate, Notepad++, Nova, Cursor, Visual Studio, Android Studio |
| Terminals | Alacritty, Kitty, WezTerm, iTerm2, Ghostty, Windows Terminal, tmux, Zellij, Foot, Konsole, Rio, Hyper, Terminator, Tilix, XFCE Terminal, GNOME Terminal, Black Box |
| Shells and prompt | Bash, Zsh, Fish, PowerShell, Starship |
| CLI/TUI | bat, btop, delta, dircolors, fzf, lazygit, yazi, eza, atuin, bottom, k9s, ranger, vivid |
| Desktop apps | Raycast, Alfred, Obsidian, Logseq, Slack, Discord, Telegram, Spotify, qutebrowser |
| Browser and web | Firefox, Chrome, Arc, Vivaldi, userstyles, startpages, documentation sites |
| Design and devtools | Figma, Sketch, Insomnia, Postman, HTTPie, TablePlus, DBeaver, GitHub README assets |
| Docs and content | MkDocs, Docusaurus, Sphinx, LaTeX, Typst, Beamer, reveal.js |
| OS and window managers | Hyprland, Sway, i3, Waybar, Polybar, SketchyBar, yabai, rofi, wofi |
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

Signal Lime is the dark hero accent. Light variants keep Lime Ink for fills and graphics and use Lime Text for readable foreground accents.

## License

MIT © 2026 Bizarre Industries. See [LICENSE](LICENSE).
