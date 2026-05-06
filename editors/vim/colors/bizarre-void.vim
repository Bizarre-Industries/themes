" Bizarre Void — Bizarre Industries
" CATCH THE STARS.
" Vim colorscheme — works in Neovim's compat mode and classic Vim 8+

set background=#5B9FFF
hi clear
if exists("syntax_on") | syntax reset | endif
let g:colors_name = "bizarre-void"
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

call s:H('Normal', '#E4E4E4', '#0E0E0E', '')
call s:H('NormalNC', '#E4E4E4', '#0E0E0E', '')
call s:H('CursorLine', '', '#1A1A1A', '')
call s:H('CursorLineNr', '#C6FF24', '#0E0E0E', 'bold')
call s:H('LineNr', '#545454', '#0E0E0E', '')
call s:H('SignColumn', '', '#0E0E0E', '')
call s:H('Visual', '', '#2B2B2B', '')
call s:H('Search', '#0E0E0E', '#C6FF24', '')
call s:H('IncSearch', '#0E0E0E', '#E8FF8A', 'bold')
call s:H('CurSearch', '#0E0E0E', '#E8FF8A', 'bold')
call s:H('MatchParen', '#C6FF24', '', 'bold,underline')
call s:H('Pmenu', '#E4E4E4', '#1A1A1A', '')
call s:H('PmenuSel', '#0E0E0E', '#C6FF24', 'bold')
call s:H('PmenuSbar', '', '#2B2B2B', '')
call s:H('PmenuThumb', '', '#545454', '')
call s:H('StatusLine', '#E4E4E4', '#1A1A1A', '')
call s:H('StatusLineNC', '#7A7A7A', '#1A1A1A', '')
call s:H('TabLine', '#7A7A7A', '#1A1A1A', '')
call s:H('TabLineFill', '', '#1A1A1A', '')
call s:H('TabLineSel', '#0E0E0E', '#C6FF24', 'bold')
call s:H('VertSplit', '#3D3D3D', '#0E0E0E', '')
call s:H('Folded', '#7A7A7A', '#1A1A1A', '')
call s:H('FoldColumn', '#545454', '#0E0E0E', '')
call s:H('SpecialKey', '#2B2B2B', '', '')
call s:H('NonText', '#2B2B2B', '', '')
call s:H('Whitespace', '#2B2B2B', '', '')
call s:H('EndOfBuffer', '#0E0E0E', '#0E0E0E', '')
call s:H('Title', '#C6FF24', '', 'bold')
call s:H('Directory', '#5B9FFF', '', 'bold')
call s:H('ErrorMsg', '#F0525B', '', 'bold')
call s:H('WarningMsg', '#E8A33D', '', '')
call s:H('Question', '#C6FF24', '', '')
call s:H('ModeMsg', '#E4E4E4', '', 'bold')
call s:H('MoreMsg', '#3FB950', '', '')
call s:H('WildMenu', '#0E0E0E', '#C6FF24', '')
call s:H('Cursor', '#0E0E0E', '#C6FF24', '')
call s:H('lCursor', '#0E0E0E', '#C6FF24', '')
call s:H('Comment', '#7A7A7A', '', 'italic')
call s:H('Constant', '#D88AE0', '', '')
call s:H('String', '#B8B8B8', '', '')
call s:H('Character', '#B8B8B8', '', '')
call s:H('Number', '#E8A33D', '', '')
call s:H('Boolean', '#E8A33D', '', '')
call s:H('Float', '#E8A33D', '', '')
call s:H('Identifier', '#E4E4E4', '', '')
call s:H('Function', '#C6FF24', '', '')
call s:H('Statement', '#E8FF8A', '', '')
call s:H('Conditional', '#E8FF8A', '', '')
call s:H('Repeat', '#E8FF8A', '', '')
call s:H('Label', '#E8FF8A', '', '')
call s:H('Operator', '#7A7A7A', '', '')
call s:H('Keyword', '#E8FF8A', '', '')
call s:H('Exception', '#F0525B', '', '')
call s:H('PreProc', '#D88AE0', '', '')
call s:H('Include', '#E8FF8A', '', 'italic')
call s:H('Define', '#E8FF8A', '', 'italic')
call s:H('Macro', '#D88AE0', '', 'italic')
call s:H('Type', '#5B9FFF', '', '')
call s:H('StorageClass', '#E8FF8A', '', 'italic')
call s:H('Structure', '#5B9FFF', '', '')
call s:H('Typedef', '#5B9FFF', '', 'italic')
call s:H('Special', '#7AD9D9', '', '')
call s:H('SpecialChar', '#7AD9D9', '', '')
call s:H('Tag', '#5B9FFF', '', '')
call s:H('Delimiter', '#7A7A7A', '', '')
call s:H('Underlined', '#5B9FFF', '', 'underline')
call s:H('Error', '#F0525B', '', 'bold')
call s:H('Todo', '#0E0E0E', '#C6FF24', 'bold')
call s:H('DiffAdd', '#3FB950', '#0E0E0E', '')
call s:H('DiffChange', '#E8A33D', '#0E0E0E', '')
call s:H('DiffDelete', '#F0525B', '#0E0E0E', '')
call s:H('DiffText', '#E4E4E4', '#1A1A1A', 'bold')

" CATCH THE STARS.
