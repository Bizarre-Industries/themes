" Bizarre Paper - Bizarre Industries
" CATCH THE STARS.
" Vim colorscheme - works in Neovim compat mode and Vim 8+

set background=light
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

call s:H('Normal', '#1A1A1A', '#F9F8F2', '')
call s:H('NormalNC', '#1A1A1A', '#F9F8F2', '')
call s:H('CursorLine', '', '#F2F0EA', '')
call s:H('CursorLineNr', '#5F8A0F', '#F9F8F2', 'bold')
call s:H('LineNr', '#A8A395', '#F9F8F2', '')
call s:H('SignColumn', '', '#F9F8F2', '')
call s:H('Visual', '', '#DCEFA8', '')
call s:H('Search', '#F9F8F2', '#5F8A0F', '')
call s:H('IncSearch', '#0E0E0E', '#9FCC1F', 'bold')
call s:H('MatchParen', '#5F8A0F', '', 'bold,underline')
call s:H('Pmenu', '#1F1F1F', '#F2F0EA', '')
call s:H('PmenuSel', '#F9F8F2', '#5F8A0F', 'bold')
call s:H('StatusLine', '#1F1F1F', '#F2F0EA', '')
call s:H('StatusLineNC', '#7A7568', '#F2F0EA', '')
call s:H('TabLineSel', '#F9F8F2', '#5F8A0F', 'bold')
call s:H('VertSplit', '#D8D4C7', '#F9F8F2', '')
call s:H('Folded', '#7A7568', '#F2F0EA', '')
call s:H('Title', '#5F8A0F', '', 'bold')
call s:H('Directory', '#1F4FB0', '', 'bold')
call s:H('ErrorMsg', '#B8276F', '', 'bold')
call s:H('WarningMsg', '#9F4A0E', '', '')
call s:H('Question', '#5F8A0F', '', '')
call s:H('Cursor', '#F9F8F2', '#5F8A0F', '')
call s:H('Comment', '#9A9482', '', 'italic')
call s:H('Constant', '#2F5DC2', '', '')
call s:H('String', '#9F4A0E', '', '')
call s:H('Number', '#1F4FB0', '', '')
call s:H('Boolean', '#1B4099', '', '')
call s:H('Identifier', '#1A1A1A', '', '')
call s:H('Function', '#5F8A0F', '', '')
call s:H('Statement', '#B8276F', '', '')
call s:H('Conditional', '#B8276F', '', '')
call s:H('Repeat', '#B8276F', '', '')
call s:H('Operator', '#0F6E6E', '', '')
call s:H('Keyword', '#7E2A9A', '', '')
call s:H('Exception', '#B8276F', '', '')
call s:H('PreProc', '#603F94', '', '')
call s:H('Include', '#603F94', '', 'italic')
call s:H('Type', '#0F6E6E', '', '')
call s:H('StorageClass', '#603F94', '', 'italic')
call s:H('Special', '#A85C1B', '', '')
call s:H('Tag', '#B8276F', '', '')
call s:H('Delimiter', '#8A8576', '', '')
call s:H('Underlined', '#1F4FB0', '', 'underline')
call s:H('Error', '#B8276F', '', 'bold')
call s:H('Todo', '#F9F8F2', '#5F8A0F', 'bold')
call s:H('DiffAdd', '#3F7A1F', '#F9F8F2', '')
call s:H('DiffChange', '#9F4A0E', '#F9F8F2', '')
call s:H('DiffDelete', '#B8276F', '#F9F8F2', '')
call s:H('DiffText', '#1F1F1F', '#F2F0EA', 'bold')

" CATCH THE STARS.
