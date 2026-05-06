" Bizarre Void Hi-Contrast — Bizarre Industries
" CATCH THE STARS.
" Vim colorscheme — works in Neovim's compat mode and classic Vim 8+

set background=#7FB7FF
hi clear
if exists("syntax_on") | syntax reset | endif
let g:colors_name = "bizarre-void-hicontrast"
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

call s:H('Normal', '#F9F8F2', '#000000', '')
call s:H('NormalNC', '#F9F8F2', '#000000', '')
call s:H('CursorLine', '', '#0E0E0E', '')
call s:H('CursorLineNr', '#C6FF24', '#000000', 'bold')
call s:H('LineNr', '#7A7A7A', '#000000', '')
call s:H('SignColumn', '', '#000000', '')
call s:H('Visual', '', '#1F1F1F', '')
call s:H('Search', '#000000', '#C6FF24', '')
call s:H('IncSearch', '#000000', '#E8FF8A', 'bold')
call s:H('CurSearch', '#000000', '#E8FF8A', 'bold')
call s:H('MatchParen', '#C6FF24', '', 'bold,underline')
call s:H('Pmenu', '#F9F8F2', '#0E0E0E', '')
call s:H('PmenuSel', '#000000', '#C6FF24', 'bold')
call s:H('PmenuSbar', '', '#1F1F1F', '')
call s:H('PmenuThumb', '', '#7A7A7A', '')
call s:H('StatusLine', '#F9F8F2', '#0E0E0E', '')
call s:H('StatusLineNC', '#B8B8B8', '#0E0E0E', '')
call s:H('TabLine', '#B8B8B8', '#0E0E0E', '')
call s:H('TabLineFill', '', '#0E0E0E', '')
call s:H('TabLineSel', '#000000', '#C6FF24', 'bold')
call s:H('VertSplit', '#545454', '#000000', '')
call s:H('Folded', '#B8B8B8', '#0E0E0E', '')
call s:H('FoldColumn', '#7A7A7A', '#000000', '')
call s:H('SpecialKey', '#1F1F1F', '', '')
call s:H('NonText', '#1F1F1F', '', '')
call s:H('Whitespace', '#1F1F1F', '', '')
call s:H('EndOfBuffer', '#000000', '#000000', '')
call s:H('Title', '#C6FF24', '', 'bold')
call s:H('Directory', '#7FB7FF', '', 'bold')
call s:H('ErrorMsg', '#FF6B73', '', 'bold')
call s:H('WarningMsg', '#FFC25A', '', '')
call s:H('Question', '#C6FF24', '', '')
call s:H('ModeMsg', '#F9F8F2', '', 'bold')
call s:H('MoreMsg', '#5FD06F', '', '')
call s:H('WildMenu', '#000000', '#C6FF24', '')
call s:H('Cursor', '#000000', '#C6FF24', '')
call s:H('lCursor', '#000000', '#C6FF24', '')
call s:H('Comment', '#B8B8B8', '', 'italic')
call s:H('Constant', '#E8A8EE', '', '')
call s:H('String', '#E4E4E4', '', '')
call s:H('Character', '#E4E4E4', '', '')
call s:H('Number', '#FFC25A', '', '')
call s:H('Boolean', '#FFC25A', '', '')
call s:H('Float', '#FFC25A', '', '')
call s:H('Identifier', '#F9F8F2', '', '')
call s:H('Function', '#C6FF24', '', '')
call s:H('Statement', '#C6FF24', '', '')
call s:H('Conditional', '#C6FF24', '', '')
call s:H('Repeat', '#C6FF24', '', '')
call s:H('Label', '#C6FF24', '', '')
call s:H('Operator', '#B8B8B8', '', '')
call s:H('Keyword', '#C6FF24', '', '')
call s:H('Exception', '#FF6B73', '', '')
call s:H('PreProc', '#E8A8EE', '', '')
call s:H('Include', '#C6FF24', '', 'italic')
call s:H('Define', '#C6FF24', '', 'italic')
call s:H('Macro', '#E8A8EE', '', 'italic')
call s:H('Type', '#7FB7FF', '', '')
call s:H('StorageClass', '#C6FF24', '', 'italic')
call s:H('Structure', '#7FB7FF', '', '')
call s:H('Typedef', '#7FB7FF', '', 'italic')
call s:H('Special', '#9DE5E5', '', '')
call s:H('SpecialChar', '#9DE5E5', '', '')
call s:H('Tag', '#7FB7FF', '', '')
call s:H('Delimiter', '#B8B8B8', '', '')
call s:H('Underlined', '#7FB7FF', '', 'underline')
call s:H('Error', '#FF6B73', '', 'bold')
call s:H('Todo', '#000000', '#C6FF24', 'bold')
call s:H('DiffAdd', '#5FD06F', '#000000', '')
call s:H('DiffChange', '#FFC25A', '#000000', '')
call s:H('DiffDelete', '#FF6B73', '#000000', '')
call s:H('DiffText', '#F9F8F2', '#0E0E0E', 'bold')

" CATCH THE STARS.
