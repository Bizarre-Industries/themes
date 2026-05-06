" Bizarre Bone — Bizarre Industries
" CATCH THE STARS.
" Vim colorscheme — works in Neovim's compat mode and classic Vim 8+

set background=#3068AA
hi clear
if exists("syntax_on") | syntax reset | endif
let g:colors_name = "bizarre-bone"
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

call s:H('Normal', '#2B2B2B', '#F5F2EA', '')
call s:H('NormalNC', '#2B2B2B', '#F5F2EA', '')
call s:H('CursorLine', '', '#EFEBDF', '')
call s:H('CursorLineNr', '#6B8A0E', '#F5F2EA', 'bold')
call s:H('LineNr', '#A8A8A8', '#F5F2EA', '')
call s:H('SignColumn', '', '#F5F2EA', '')
call s:H('Visual', '', '#E0DCCE', '')
call s:H('Search', '#F5F2EA', '#6B8A0E', '')
call s:H('IncSearch', '#F5F2EA', '#9BC73C', 'bold')
call s:H('CurSearch', '#F5F2EA', '#9BC73C', 'bold')
call s:H('MatchParen', '#6B8A0E', '', 'bold,underline')
call s:H('Pmenu', '#2B2B2B', '#EFEBDF', '')
call s:H('PmenuSel', '#F5F2EA', '#6B8A0E', 'bold')
call s:H('PmenuSbar', '', '#E0DCCE', '')
call s:H('PmenuThumb', '', '#A8A8A8', '')
call s:H('StatusLine', '#2B2B2B', '#EFEBDF', '')
call s:H('StatusLineNC', '#7A7A7A', '#EFEBDF', '')
call s:H('TabLine', '#7A7A7A', '#EFEBDF', '')
call s:H('TabLineFill', '', '#EFEBDF', '')
call s:H('TabLineSel', '#F5F2EA', '#6B8A0E', 'bold')
call s:H('VertSplit', '#D0CABC', '#F5F2EA', '')
call s:H('Folded', '#7A7A7A', '#EFEBDF', '')
call s:H('FoldColumn', '#A8A8A8', '#F5F2EA', '')
call s:H('SpecialKey', '#E0DCCE', '', '')
call s:H('NonText', '#E0DCCE', '', '')
call s:H('Whitespace', '#E0DCCE', '', '')
call s:H('EndOfBuffer', '#F5F2EA', '#F5F2EA', '')
call s:H('Title', '#6B8A0E', '', 'bold')
call s:H('Directory', '#3068AA', '', 'bold')
call s:H('ErrorMsg', '#C13039', '', 'bold')
call s:H('WarningMsg', '#A87330', '', '')
call s:H('Question', '#6B8A0E', '', '')
call s:H('ModeMsg', '#2B2B2B', '', 'bold')
call s:H('MoreMsg', '#2A8439', '', '')
call s:H('WildMenu', '#F5F2EA', '#6B8A0E', '')
call s:H('Cursor', '#F5F2EA', '#6B8A0E', '')
call s:H('lCursor', '#F5F2EA', '#6B8A0E', '')
call s:H('Comment', '#7A7A7A', '', 'italic')
call s:H('Constant', '#9558A0', '', '')
call s:H('String', '#545454', '', '')
call s:H('Character', '#545454', '', '')
call s:H('Number', '#A87330', '', '')
call s:H('Boolean', '#A87330', '', '')
call s:H('Float', '#A87330', '', '')
call s:H('Identifier', '#2B2B2B', '', '')
call s:H('Function', '#6B8A0E', '', '')
call s:H('Statement', '#6B8A0E', '', '')
call s:H('Conditional', '#6B8A0E', '', '')
call s:H('Repeat', '#6B8A0E', '', '')
call s:H('Label', '#6B8A0E', '', '')
call s:H('Operator', '#7A7A7A', '', '')
call s:H('Keyword', '#6B8A0E', '', '')
call s:H('Exception', '#C13039', '', '')
call s:H('PreProc', '#9558A0', '', '')
call s:H('Include', '#6B8A0E', '', 'italic')
call s:H('Define', '#6B8A0E', '', 'italic')
call s:H('Macro', '#9558A0', '', 'italic')
call s:H('Type', '#3068AA', '', '')
call s:H('StorageClass', '#6B8A0E', '', 'italic')
call s:H('Structure', '#3068AA', '', '')
call s:H('Typedef', '#3068AA', '', 'italic')
call s:H('Special', '#4A9595', '', '')
call s:H('SpecialChar', '#4A9595', '', '')
call s:H('Tag', '#3068AA', '', '')
call s:H('Delimiter', '#7A7A7A', '', '')
call s:H('Underlined', '#3068AA', '', 'underline')
call s:H('Error', '#C13039', '', 'bold')
call s:H('Todo', '#F5F2EA', '#6B8A0E', 'bold')
call s:H('DiffAdd', '#2A8439', '#F5F2EA', '')
call s:H('DiffChange', '#A87330', '#F5F2EA', '')
call s:H('DiffDelete', '#C13039', '#F5F2EA', '')
call s:H('DiffText', '#2B2B2B', '#EFEBDF', 'bold')

" CATCH THE STARS.
