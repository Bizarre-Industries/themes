-- Bizarre Industries - terminal ANSI colors
local M = {}

function M.apply(p)
  for i = 0, 15 do
    vim.g['terminal_color_' .. i] = p.term[i]
  end
end

return M
