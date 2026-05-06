-- ANSI colors for :terminal
local M = {}
function M.apply(p)
  vim.g.terminal_color_0  = p.term[0]
  vim.g.terminal_color_1  = p.term[1]
  vim.g.terminal_color_2  = p.term[2]
  vim.g.terminal_color_3  = p.term[3]
  vim.g.terminal_color_4  = p.term[4]
  vim.g.terminal_color_5  = p.term[5]
  vim.g.terminal_color_6  = p.term[6]
  vim.g.terminal_color_7  = p.term[7]
  vim.g.terminal_color_8  = p.term[8]
  vim.g.terminal_color_9  = p.term[9]
  vim.g.terminal_color_10 = p.term[10]
  vim.g.terminal_color_11 = p.term[11]
  vim.g.terminal_color_12 = p.term[12]
  vim.g.terminal_color_13 = p.term[13]
  vim.g.terminal_color_14 = p.term[14]
  vim.g.terminal_color_15 = p.term[15]
end
return M
