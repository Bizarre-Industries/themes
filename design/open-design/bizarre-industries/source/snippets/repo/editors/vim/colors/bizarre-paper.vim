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
call s:H('CursorLineNr', '#4A7409', '#F9F8F2', 'bold')
call s:H('LineNr', '#3D3D3D', '#F9F8F2', '')
call s:H('SignColumn', '', '#F9F8F2', '')
call s:H('Visual', '', '#DCEFA8', '')
call s:H('Search', '#0E0E0E', '#5F8A0F', '')
call s:H('IncSearch', '#F9F8F2', '#4A7409', 'bold')
call s:H('CurSearch', '#F9F8F2', '#4A7409', 'bold')
call s:H('MatchParen', '#4A7409', '', 'bold,underline')
call s:H('Pmenu', '#1F1F1F', '#F2F0EA', '')
call s:H('PmenuSel', '#0E0E0E', '#5F8A0F', 'bold')
call s:H('PmenuSbar', '', '#E6E3DA', '')
call s:H('PmenuThumb', '', '#A8A395', '')
call s:H('StatusLine', '#1F1F1F', '#F2F0EA', '')
call s:H('StatusLineNC', '#3D3D3D', '#F2F0EA', '')
call s:H('TabLine', '#3D3D3D', '#F2F0EA', '')
call s:H('TabLineFill', '', '#F2F0EA', '')
call s:H('TabLineSel', '#0E0E0E', '#5F8A0F', 'bold')
call s:H('VertSplit', '#D8D4C7', '#F9F8F2', '')
call s:H('Folded', '#3D3D3D', '#F2F0EA', '')
call s:H('FoldColumn', '#A8A395', '#F9F8F2', '')
call s:H('SpecialKey', '#E6E3DA', '', '')
call s:H('NonText', '#E6E3DA', '', '')
call s:H('Whitespace', '#E6E3DA', '', '')
call s:H('EndOfBuffer', '#F9F8F2', '#F9F8F2', '')
call s:H('Title', '#4A7409', '', 'bold')
call s:H('Directory', '#1F4FB0', '', 'bold')
call s:H('ErrorMsg', '#AC2468', '', 'bold')
call s:H('WarningMsg', '#97460D', '', '')
call s:H('Question', '#4A7409', '', '')
call s:H('ModeMsg', '#1F1F1F', '', 'bold')
call s:H('MoreMsg', '#36691B', '', '')
call s:H('WildMenu', '#0E0E0E', '#5F8A0F', '')
call s:H('Cursor', '#0E0E0E', '#5F8A0F', '')
call s:H('lCursor', '#0E0E0E', '#5F8A0F', '')
call s:H('Comment', '#726D60', '', 'italic')
call s:H('Constant', '#2F5DC2', '', '')
call s:H('String', '#9F4A0E', '', '')
call s:H('Character', '#9F4A0E', '', '')
call s:H('Number', '#1F4FB0', '', '')
call s:H('Boolean', '#1B4099', '', '')
call s:H('Float', '#1F4FB0', '', '')
call s:H('Identifier', '#1A1A1A', '', '')
call s:H('Function', '#4A7409', '', '')
call s:H('Statement', '#B8276F', '', '')
call s:H('Conditional', '#B8276F', '', '')
call s:H('Repeat', '#B8276F', '', '')
call s:H('Label', '#B8276F', '', '')
call s:H('Operator', '#0F6E6E', '', '')
call s:H('Keyword', '#7E2A9A', '', '')
call s:H('Exception', '#AC2468', '', '')
call s:H('PreProc', '#603F94', '', '')
call s:H('Include', '#603F94', '', 'italic')
call s:H('Define', '#603F94', '', 'italic')
call s:H('Macro', '#603F94', '', 'italic')
call s:H('Type', '#0F6E6E', '', '')
call s:H('StorageClass', '#603F94', '', 'italic')
call s:H('Structure', '#0F6E6E', '', '')
call s:H('Typedef', '#0F6E6E', '', 'italic')
call s:H('Special', '#A55A1B', '', '')
call s:H('SpecialChar', '#A55A1B', '', '')
call s:H('Tag', '#B8276F', '', '')
call s:H('Delimiter', '#726D61', '', '')
call s:H('Underlined', '#1F4FB0', '', 'underline')
call s:H('Error', '#AC2468', '', 'bold')
call s:H('Todo', '#0E0E0E', '#5F8A0F', 'bold')
call s:H('DiffAdd', '#36691B', '#F9F8F2', '')
call s:H('DiffChange', '#97460D', '#F9F8F2', '')
call s:H('DiffDelete', '#AC2468', '#F9F8F2', '')
call s:H('DiffText', '#1F1F1F', '#F2F0EA', 'bold')

" CATCH THE STARS.
