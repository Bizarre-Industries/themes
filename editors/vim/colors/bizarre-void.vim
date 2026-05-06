" Bizarre Void - Bizarre Industries
" CATCH THE STARS.
" Vim colorscheme - works in Neovim compat mode and Vim 8+

set background=dark
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
call s:H('Visual', '', '#2B3A0E', '')
call s:H('Search', '#0E0E0E', '#C6FF24', '')
call s:H('IncSearch', '#0E0E0E', '#E8FF8A', 'bold')
call s:H('MatchParen', '#C6FF24', '', 'bold,underline')
call s:H('Pmenu', '#E4E4E4', '#1A1A1A', '')
call s:H('PmenuSel', '#0E0E0E', '#C6FF24', 'bold')
call s:H('StatusLine', '#E4E4E4', '#1A1A1A', '')
call s:H('StatusLineNC', '#7A7A7A', '#1A1A1A', '')
call s:H('TabLineSel', '#0E0E0E', '#C6FF24', 'bold')
call s:H('VertSplit', '#3D3D3D', '#0E0E0E', '')
call s:H('Folded', '#7A7A7A', '#1A1A1A', '')
call s:H('Title', '#C6FF24', '', 'bold')
call s:H('Directory', '#7BB3FF', '', 'bold')
call s:H('ErrorMsg', '#FF6F77', '', 'bold')
call s:H('WarningMsg', '#FFB85C', '', '')
call s:H('Question', '#C6FF24', '', '')
call s:H('Cursor', '#0E0E0E', '#C6FF24', '')
call s:H('Comment', '#6F6F6F', '', 'italic')
call s:H('Constant', '#9DD0FF', '', '')
call s:H('String', '#E8A33D', '', '')
call s:H('Number', '#7BB3FF', '', '')
call s:H('Boolean', '#5B9FFF', '', '')
call s:H('Identifier', '#E4E4E4', '', '')
call s:H('Function', '#C6FF24', '', '')
call s:H('Statement', '#FF8FCF', '', '')
call s:H('Conditional', '#FF8FCF', '', '')
call s:H('Repeat', '#FF8FCF', '', '')
call s:H('Operator', '#9DEAEA', '', '')
call s:H('Keyword', '#D88AE0', '', '')
call s:H('Exception', '#FF6F77', '', '')
call s:H('PreProc', '#B989E5', '', '')
call s:H('Include', '#B989E5', '', 'italic')
call s:H('Type', '#7AD9D9', '', '')
call s:H('StorageClass', '#B989E5', '', 'italic')
call s:H('Special', '#FF9E3D', '', '')
call s:H('Tag', '#FF8FCF', '', '')
call s:H('Delimiter', '#7A7A7A', '', '')
call s:H('Underlined', '#7BB3FF', '', 'underline')
call s:H('Error', '#FF6F77', '', 'bold')
call s:H('Todo', '#0E0E0E', '#C6FF24', 'bold')
call s:H('DiffAdd', '#5BD06B', '#0E0E0E', '')
call s:H('DiffChange', '#FFB85C', '#0E0E0E', '')
call s:H('DiffDelete', '#FF6F77', '#0E0E0E', '')
call s:H('DiffText', '#E4E4E4', '#1A1A1A', 'bold')

" CATCH THE STARS.
