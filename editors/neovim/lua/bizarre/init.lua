-- Bizarre Industries — Neovim colorscheme
-- CATCH THE STARS.
local M = {}

M.variants = {
  ['bizarre-void']             = require('bizarre.palettes.void'),
  ['bizarre-void-hicontrast']  = require('bizarre.palettes.void-hicontrast'),
  ['bizarre-workshop']         = require('bizarre.palettes.workshop'),
  ['bizarre-paper']            = require('bizarre.palettes.paper'),
  ['bizarre-bone']             = require('bizarre.palettes.bone'),
}

function M.load(name)
  name = name or 'bizarre-void'
  local p = M.variants[name]
  if not p then
    vim.notify('[bizarre] unknown variant: ' .. tostring(name), vim.log.levels.ERROR)
    return
  end
  if vim.g.colors_name then vim.cmd('hi clear') end
  if vim.fn.exists('syntax_on') then vim.cmd('syntax reset') end
  vim.o.termguicolors = true
  vim.o.background = p.mode
  vim.g.colors_name = name
  require('bizarre.highlights').apply(p)
  require('bizarre.terminal').apply(p)
end

return M
