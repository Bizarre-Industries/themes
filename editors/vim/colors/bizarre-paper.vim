" Bizarre Paper — Bizarre Industries
" CATCH THE STARS.
" Vim colorscheme — works in Neovim's compat mode and classic Vim 8+

set background=#2C5FA0
hi clear
if exists("syntax_on") | syntax reset | endif
let g:colors_name = "bizarre-paper"
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

call s:H('Normal', '#1F1F1F', '#F9F8F2', '')
call s:H('NormalNC', '#1F1F1F', '#F9F8F2', '')
call s:H('CursorLine', '', '#F5F2EA', '')
call s:H('CursorLineNr', '#5E7A00', '#F9F8F2', 'bold')
call s:H('LineNr', '#B8B8B8', '#F9F8F2', '')
call s:H('SignColumn', '', '#F9F8F2', '')
call s:H('Visual', '', '#E4E4E4', '')
call s:H('Search', '#F9F8F2', '#5E7A00', '')
call s:H('IncSearch', '#F9F8F2', '#9BC73C', 'bold')
call s:H('CurSearch', '#F9F8F2', '#9BC73C', 'bold')
call s:H('MatchParen', '#5E7A00', '', 'bold,underline')
call s:H('Pmenu', '#1F1F1F', '#F5F2EA', '')
call s:H('PmenuSel', '#F9F8F2', '#5E7A00', 'bold')
call s:H('PmenuSbar', '', '#E4E4E4', '')
call s:H('PmenuThumb', '', '#B8B8B8', '')
call s:H('StatusLine', '#1F1F1F', '#F5F2EA', '')
call s:H('StatusLineNC', '#7A7A7A', '#F5F2EA', '')
call s:H('TabLine', '#7A7A7A', '#F5F2EA', '')
call s:H('TabLineFill', '', '#F5F2EA', '')
call s:H('TabLineSel', '#F9F8F2', '#5E7A00', 'bold')
call s:H('VertSplit', '#D8D4C8', '#F9F8F2', '')
call s:H('Folded', '#7A7A7A', '#F5F2EA', '')
call s:H('FoldColumn', '#B8B8B8', '#F9F8F2', '')
call s:H('SpecialKey', '#E4E4E4', '', '')
call s:H('NonText', '#E4E4E4', '', '')
call s:H('Whitespace', '#E4E4E4', '', '')
call s:H('EndOfBuffer', '#F9F8F2', '#F9F8F2', '')
call s:H('Title', '#5E7A00', '', 'bold')
call s:H('Directory', '#2C5FA0', '', 'bold')
call s:H('ErrorMsg', '#C13039', '', 'bold')
call s:H('WarningMsg', '#A06C1A', '', '')
call s:H('Question', '#5E7A00', '', '')
call s:H('ModeMsg', '#1F1F1F', '', 'bold')
call s:H('MoreMsg', '#2A8439', '', '')
call s:H('WildMenu', '#F9F8F2', '#5E7A00', '')
call s:H('Cursor', '#F9F8F2', '#5E7A00', '')
call s:H('lCursor', '#F9F8F2', '#5E7A00', '')
call s:H('Comment', '#7A7A7A', '', 'italic')
call s:H('Constant', '#8C4A95', '', '')
call s:H('String', '#545454', '', '')
call s:H('Character', '#545454', '', '')
call s:H('Number', '#A06C1A', '', '')
call s:H('Boolean', '#A06C1A', '', '')
call s:H('Float', '#A06C1A', '', '')
call s:H('Identifier', '#1F1F1F', '', '')
call s:H('Function', '#5E7A00', '', '')
call s:H('Statement', '#5E7A00', '', '')
call s:H('Conditional', '#5E7A00', '', '')
call s:H('Repeat', '#5E7A00', '', '')
call s:H('Label', '#5E7A00', '', '')
call s:H('Operator', '#7A7A7A', '', '')
call s:H('Keyword', '#5E7A00', '', '')
call s:H('Exception', '#C13039', '', '')
call s:H('PreProc', '#8C4A95', '', '')
call s:H('Include', '#5E7A00', '', 'italic')
call s:H('Define', '#5E7A00', '', 'italic')
call s:H('Macro', '#8C4A95', '', 'italic')
call s:H('Type', '#2C5FA0', '', '')
call s:H('StorageClass', '#5E7A00', '', 'italic')
call s:H('Structure', '#2C5FA0', '', '')
call s:H('Typedef', '#2C5FA0', '', 'italic')
call s:H('Special', '#3F8C8C', '', '')
call s:H('SpecialChar', '#3F8C8C', '', '')
call s:H('Tag', '#2C5FA0', '', '')
call s:H('Delimiter', '#7A7A7A', '', '')
call s:H('Underlined', '#2C5FA0', '', 'underline')
call s:H('Error', '#C13039', '', 'bold')
call s:H('Todo', '#F9F8F2', '#5E7A00', 'bold')
call s:H('DiffAdd', '#2A8439', '#F9F8F2', '')
call s:H('DiffChange', '#A06C1A', '#F9F8F2', '')
call s:H('DiffDelete', '#C13039', '#F9F8F2', '')
call s:H('DiffText', '#1F1F1F', '#F5F2EA', 'bold')

" CATCH THE STARS.
