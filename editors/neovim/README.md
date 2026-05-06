# Bizarre Industries — Neovim

`BZR / NVIM / V0.1`

## Install (dotfiles)

```bash
ln -s "$PWD/editors/neovim" ~/.config/nvim/pack/bizarre/start/bizarre.nvim
```

Then in `init.lua`:

```lua
vim.cmd.colorscheme('bizarre-void') -- or -workshop, -paper, -bone, -hicontrast
```

## Variants

`bizarre-void` · `bizarre-void-hicontrast` · `bizarre-workshop` · `bizarre-paper` · `bizarre-bone`

Treesitter, LSP semantic tokens, telescope, nvim-tree, gitsigns, cmp, indent-blankline, notify all themed.

CATCH THE STARS.
