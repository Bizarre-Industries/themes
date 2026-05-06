# Bizarre Theme Ports

`BZR / PORTS / V0.2 / MAY 2026`

Catppuccin-scale coverage is the benchmark. This repo now ships generated configs for existing Bizarre targets and tracks future ports here instead of mixing roadmap decisions into the README.

Sources:
- [Catppuccin ports](https://catppuccin.com/ports/)
- [Catppuccin repositories](https://github.com/orgs/catppuccin/repositories?type=all)

## Shipped

| Family | Targets |
|---|---|
| Editors | VS Code, Zed, JetBrains, Sublime Text, Vim, Neovim, Neovim Base16, Emacs, Helix, Lapce, Kate, Notepad++, Nova, Cursor, Visual Studio, Xcode, Android Studio |
| Terminals | Alacritty, Kitty, WezTerm, iTerm2, Ghostty, Windows Terminal, tmux, Zellij, Foot, Konsole, Rio, Hyper, Terminator, Tilix, XFCE Terminal, GNOME Terminal, Black Box |
| Shells and prompts | Bash, Zsh, Fish, PowerShell, Starship |
| CLI/TUI | bat, btop, delta, dircolors, fzf, lazygit, yazi, eza, atuin, bottom, k9s, ranger, vivid |
| Desktop apps | Raycast, Alfred, Obsidian, Logseq, Slack, Discord, Telegram, Spotify, qutebrowser |
| Desktop and tools | AeroSpace, ForkLift, Jujutsu |

## Planned Backlog

| Family | Candidate ports |
|---|---|
| Browser and web | Firefox, Chrome, Arc, Vivaldi, userstyles, startpages, documentation sites |
| Design and devtools | Figma, Sketch, Insomnia, Postman, HTTPie, TablePlus, DBeaver, GitHub readme assets |
| Docs and content | MkDocs, Docusaurus, Sphinx, LaTeX, Typst, Beamer, reveal.js |
| OS and window managers | Hyprland, Sway, i3, Waybar, Polybar, SketchyBar, yabai, rofi, wofi |

## Port Rules

- Every port must use [palette.js](palette.js), not hand-picked colors.
- Every generated file must be covered by `npm run check:generated`.
- Every install example must point to a real file in this repo.
- Each new family needs one screenshot or realistic preview before README promotion.
- Monaspace Neon is default mono; Xenon, Krypton, and Argon support display, labels, and prose.
