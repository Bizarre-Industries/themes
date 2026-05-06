" Bizarre Workshop — Bizarre Industries
" CATCH THE STARS.
" Vim colorscheme — works in Neovim's compat mode and classic Vim 8+

set background=#6EA8E8
hi clear
if exists("syntax_on") | syntax reset | endif
let g:colors_name = "bizarre-workshop"
if !has('gui_running') && !has('termguicolors') && &t_Co < 256
  finish
endif
if has('termguicolors') | set termguicolors | endif

function! s:H(group, fg, bg, attr)
  let cmd = 'highlight ' . a:group
  if a:fg !=# '' | let cmd .= ' guifg=' . a:fg | endif
  if a:bg !=# '' | let cmd .= ' guibg=' . a:bg | endif
  if a:attr !=# '' | let cmd .= ' gui=' . a:attr . ' cterm=' . a:attr | endif
  execute cmd
endfunction

call s:H('Normal', '#E4E2DA', '#1A1815', '')
call s:H('NormalNC', '#E4E2DA', '#1A1815', '')
call s:H('CursorLine', '', '#252320', '')
call s:H('CursorLineNr', '#B5E81F', '#1A1815', 'bold')
call s:H('LineNr', '#545249', '#1A1815', '')
call s:H('SignColumn', '', '#1A1815', '')
call s:H('Visual', '', '#33302B', '')
call s:H('Search', '#1A1815', '#B5E81F', '')
call s:H('IncSearch', '#1A1815', '#D4EE7A', 'bold')
call s:H('CurSearch', '#1A1815', '#D4EE7A', 'bold')
call s:H('MatchParen', '#B5E81F', '', 'bold,underline')
call s:H('Pmenu', '#E4E2DA', '#252320', '')
call s:H('PmenuSel', '#1A1815', '#B5E81F', 'bold')
call s:H('PmenuSbar', '', '#33302B', '')
call s:H('PmenuThumb', '', '#545249', '')
call s:H('StatusLine', '#E4E2DA', '#252320', '')
call s:H('StatusLineNC', '#7A786F', '#252320', '')
call s:H('TabLine', '#7A786F', '#252320', '')
call s:H('TabLineFill', '', '#252320', '')
call s:H('TabLineSel', '#1A1815', '#B5E81F', 'bold')
call s:H('VertSplit', '#3D3A33', '#1A1815', '')
call s:H('Folded', '#7A786F', '#252320', '')
call s:H('FoldColumn', '#545249', '#1A1815', '')
call s:H('SpecialKey', '#33302B', '', '')
call s:H('NonText', '#33302B', '', '')
call s:H('Whitespace', '#33302B', '', '')
call s:H('EndOfBuffer', '#1A1815', '#1A1815', '')
call s:H('Title', '#B5E81F', '', 'bold')
call s:H('Directory', '#6EA8E8', '', 'bold')
call s:H('ErrorMsg', '#E8525B', '', 'bold')
call s:H('WarningMsg', '#D89538', '', '')
call s:H('Question', '#B5E81F', '', '')
call s:H('ModeMsg', '#E4E2DA', '', 'bold')
call s:H('MoreMsg', '#4CB058', '', '')
call s:H('WildMenu', '#1A1815', '#B5E81F', '')
call s:H('Cursor', '#1A1815', '#B5E81F', '')
call s:H('lCursor', '#1A1815', '#B5E81F', '')
call s:H('Comment', '#7A786F', '', 'italic')
call s:H('Constant', '#C68DD0', '', '')
call s:H('String', '#B8B6AE', '', '')
call s:H('Character', '#B8B6AE', '', '')
call s:H('Number', '#E8A33D', '', '')
call s:H('Boolean', '#E8A33D', '', '')
call s:H('Float', '#E8A33D', '', '')
call s:H('Identifier', '#E4E2DA', '', '')
call s:H('Function', '#B5E81F', '', '')
call s:H('Statement', '#D4EE7A', '', '')
call s:H('Conditional', '#D4EE7A', '', '')
call s:H('Repeat', '#D4EE7A', '', '')
call s:H('Label', '#D4EE7A', '', '')
call s:H('Operator', '#7A786F', '', '')
call s:H('Keyword', '#D4EE7A', '', '')
call s:H('Exception', '#E8525B', '', '')
call s:H('PreProc', '#C68DD0', '', '')
call s:H('Include', '#D4EE7A', '', 'italic')
call s:H('Define', '#D4EE7A', '', 'italic')
call s:H('Macro', '#C68DD0', '', 'italic')
call s:H('Type', '#6EA8E8', '', '')
call s:H('StorageClass', '#D4EE7A', '', 'italic')
call s:H('Structure', '#6EA8E8', '', '')
call s:H('Typedef', '#6EA8E8', '', 'italic')
call s:H('Special', '#7BC9C9', '', '')
call s:H('SpecialChar', '#7BC9C9', '', '')
call s:H('Tag', '#6EA8E8', '', '')
call s:H('Delimiter', '#7A786F', '', '')
call s:H('Underlined', '#6EA8E8', '', 'underline')
call s:H('Error', '#E8525B', '', 'bold')
call s:H('Todo', '#1A1815', '#B5E81F', 'bold')
call s:H('DiffAdd', '#4CB058', '#1A1815', '')
call s:H('DiffChange', '#D89538', '#1A1815', '')
call s:H('DiffDelete', '#E8525B', '#1A1815', '')
call s:H('DiffText', '#E4E2DA', '#252320', 'bold')

" CATCH THE STARS.
