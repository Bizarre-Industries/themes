# Bizarre Industries — Neovim

`BZR / NVIM / V0.2`

## Install (dotfiles)

```bash
mkdir -p ~/.config/nvim/pack/bizarre/start
ln -s "$PWD/editors/neovim" ~/.config/nvim/pack/bizarre/start/bizarre.nvim
```

If `bizarre.nvim` already exists at that destination, leave it in place or remove it deliberately before creating a replacement link.

Then in `init.lua`:

```lua
vim.cmd.colorscheme('bizarre-void') -- or -workshop, -paper, -bone, -hicontrast
```

## Variants

`bizarre-void` · `bizarre-void-hicontrast` · `bizarre-workshop` · `bizarre-paper` · `bizarre-bone`

Treesitter, LSP semantic tokens, telescope, nvim-tree, gitsigns, cmp, indent-blankline, notify all themed.

CATCH THE STARS.
