const {
  useState: _ueS,
  useEffect: _ueE
} = React;
window.BzrCode = function Code({
  sample,
  theme = 'dark',
  limeRole = 'functions'
}) {
  return React.createElement("div", {
    className: "code",
    "data-theme": theme,
    "data-lime-role": limeRole
  }, sample.lines.map((toks, i) => React.createElement("div", {
    key: i,
    className: `line ${i + 1 === sample.cur ? 'cur' : ''}`
  }, React.createElement("span", {
    className: "gutter"
  }, i + 1), React.createElement("span", {
    className: "src"
  }, toks.map(([type, text], j) => React.createElement("span", {
    key: j,
    className: `tok-${type}`
  }, text))))));
};
window.BzrEditor = function Editor({
  sample,
  variant,
  limeRole
}) {
  return React.createElement("div", {
    className: `pane ${variant.mode === 'light' ? 'light' : ''}`,
    style: {
      '--bg': variant.bg,
      '--dim': variant.fgDim,
      background: variant.bg
    }
  }, React.createElement("div", {
    className: "pane-chrome"
  }, React.createElement("div", {
    className: "dots"
  }, React.createElement("span", {
    className: "dot sample"
  }), React.createElement("span", {
    className: "dot"
  }), React.createElement("span", {
    className: "dot"
  })), React.createElement("div", {
    className: "tab-row"
  }, React.createElement("span", {
    className: "tab active"
  }, sample.name), React.createElement("span", {
    className: "tab"
  }, "README.md"), React.createElement("span", {
    className: "tab"
  }, "PORTS.md")), React.createElement("span", {
    className: "pane-meta"
  }, sample.lang, " \xB7 ", variant.label)), React.createElement(BzrCode, {
    sample: sample,
    theme: variant.mode,
    limeRole: limeRole
  }), React.createElement("div", {
    className: "code-footer"
  }, React.createElement("span", null, "\u25CF preview \xB7 ", variant.label), React.createElement("span", null, "ln ", sample.cur, ", col 24"), React.createElement("span", null, "spaces: 2"), React.createElement("span", null, "lime: ", limeRole), React.createElement("span", {
    style: {
      marginLeft: 'auto'
    }
  }, "\u2726 catch the stars")));
};
const {
  Fragment: _BzrFrag
} = React;
window.BzrStarshipTerminal = function StarshipTerminal({
  variant
}) {
  const s = variant.syntax;
  const fg = variant.fg;
  const dim = variant.fgDim;
  const dim2 = variant.fgDim;
  const blue = s.info;
  const cyan = s.rgx;
  const red = s.error;
  const green = s.ok;
  const amber = s.warn;
  const violet = s.hint;
  const limeBg = variant.accent;
  const voidBg = variant.bg2;
  const smokeBg = variant.bg3;
  const limeFg = window.BZR_CONTRAST[variant.id] || '#0E0E0E';
  const dirFg = s.info;
  const branchFg = variant.mode === 'light' ? variant.fg : variant.accentText;
  const styles = {
    pane: {
      background: variant.bg,
      color: fg
    },
    row: {
      whiteSpace: 'pre',
      display: 'block'
    },
    pwrap: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: 2,
      marginTop: 6,
      fontFamily: 'var(--mono)',
      fontSize: 13
    },
    chunk: {
      display: 'inline-flex',
      alignItems: 'center',
      height: 22,
      padding: '0 9px',
      fontWeight: 600,
      fontFamily: 'var(--mono)',
      fontSize: 12.5,
      lineHeight: '22px'
    },
    wedgeR: (from, to) => ({
      width: 0,
      height: 0,
      borderTop: '11px solid transparent',
      borderBottom: '11px solid transparent',
      borderLeft: `9px solid ${from}`,
      background: to,
      marginRight: 0
    }),
    starLine: {
      color: variant.accentSoft,
      fontWeight: 700,
      fontFamily: 'var(--mono)',
      fontSize: 13,
      marginTop: 2,
      marginBottom: 8,
      letterSpacing: 0
    },
    cmd: {
      color: fg
    }
  };
  const Prompt = ({
    branch = 'main',
    git = '',
    cmd,
    dur,
    dir = '~/projects/bench',
    warn = false,
    ok = false,
    runtime
  }) => React.createElement(_BzrFrag, null, React.createElement("div", {
    style: styles.pwrap
  }, React.createElement("span", {
    style: {
      ...styles.chunk,
      background: limeBg,
      color: limeFg
    }
  }, "\xA0bzr\xA0"), React.createElement("span", {
    style: styles.wedgeR(limeBg, voidBg)
  }), React.createElement("span", {
    style: {
      ...styles.chunk,
      background: voidBg,
      color: dirFg,
      fontWeight: 500
    }
  }, "\xA0", dir, "\xA0"), React.createElement("span", {
    style: styles.wedgeR(voidBg, smokeBg)
  }), branch && React.createElement("span", {
    style: {
      ...styles.chunk,
      background: smokeBg,
      color: branchFg,
      fontWeight: 500
    }
  }, "\xA0 ", branch, ' '), git && React.createElement("span", {
    style: {
      ...styles.chunk,
      background: smokeBg,
      color: warn ? amber : ok ? green : amber,
      fontWeight: 500
    }
  }, git, " "), runtime && React.createElement("span", {
    style: {
      ...styles.chunk,
      background: smokeBg,
      color: blue,
      fontWeight: 500
    }
  }, runtime, " "), dur && React.createElement("span", {
    style: {
      ...styles.chunk,
      background: smokeBg,
      color: amber,
      fontWeight: 500
    }
  }, "\u23F1 ", dur, " "), React.createElement("span", {
    style: styles.wedgeR(smokeBg, 'transparent')
  })), React.createElement("div", {
    style: styles.starLine
  }, React.createElement("span", null, "\u2726"), " ", React.createElement("span", {
    style: styles.cmd
  }, cmd)));
  return React.createElement("div", {
    className: `pane ${variant.mode === 'light' ? 'light' : ''}`,
    style: {
      '--bg': variant.bg,
      '--dim': variant.fgDim
    }
  }, React.createElement("div", {
    className: "pane-chrome"
  }, React.createElement("div", {
    className: "dots"
  }, React.createElement("span", {
    className: "dot"
  }), React.createElement("span", {
    className: "dot"
  }), React.createElement("span", {
    className: "dot"
  })), React.createElement("div", {
    className: "tab-row"
  }, React.createElement("span", {
    className: "tab active"
  }, "zsh - bench - 132x42"), React.createElement("span", {
    className: "tab"
  }, "logs")), React.createElement("span", {
    className: "pane-meta"
  }, "starship \xB7 ", variant.label)), React.createElement("div", {
    className: "term",
    style: styles.pane
  }, React.createElement(Prompt, {
    branch: "main",
    git: "~2 ?1",
    cmd: "git status -sb"
  }), React.createElement("div", {
    style: {
      ...styles.row,
      color: dim
    }
  }, "## main...origin/main"), React.createElement("div", {
    style: {
      ...styles.row,
      color: amber
    }
  }, " M src/Orbit.tsx"), React.createElement("div", {
    style: {
      ...styles.row,
      color: amber
    }
  }, " M bench/oscilloscope.py"), React.createElement("div", {
    style: {
      ...styles.row,
      color: dim2
    }
  }, "?? notes/2026-05-bench.md"), React.createElement(Prompt, {
    branch: "main",
    git: "~2 ?1",
    cmd: "cargo build --release",
    dur: "4.81s"
  }), React.createElement("div", {
    style: styles.row
  }, React.createElement("span", {
    style: {
      color: green,
      fontWeight: 600
    }
  }, "   Compiling "), React.createElement("span", null, "bizarre-sampler "), React.createElement("span", {
    style: {
      color: dim
    }
  }, "v0.2.0")), React.createElement("div", {
    style: styles.row
  }, React.createElement("span", {
    style: {
      color: amber,
      fontWeight: 600
    }
  }, "   warning"), React.createElement("span", null, ": unused variable: "), React.createElement("span", {
    style: {
      color: violet
    }
  }, "`epoch`"), React.createElement("span", {
    style: {
      color: dim
    }
  }, " -> src/orbit.rs:42:9")), React.createElement("div", {
    style: styles.row
  }, React.createElement("span", {
    style: {
      color: green,
      fontWeight: 600
    }
  }, "    Finished "), React.createElement("span", {
    style: {
      color: dim
    }
  }, "release [optimized] in 4.81s")), React.createElement(Prompt, {
    branch: "main",
    git: "~2 ?1",
    cmd: React.createElement(React.Fragment, null, "curl -s ", React.createElement("span", {
      style: {
        color: amber
      }
    }, "https://api.bizarre.industries/orbits/iss"), " | jq ."),
    runtime: "rs 1.78"
  }), React.createElement("div", {
    style: {
      ...styles.row,
      color: dim
    }
  }, '{'), React.createElement("div", {
    style: styles.row
  }, React.createElement("span", {
    style: {
      color: cyan
    }
  }, '  "id"'), React.createElement("span", {
    style: {
      color: dim
    }
  }, ": "), React.createElement("span", {
    style: {
      color: amber
    }
  }, "\"25544\""), React.createElement("span", {
    style: {
      color: dim
    }
  }, ",")), React.createElement("div", {
    style: styles.row
  }, React.createElement("span", {
    style: {
      color: cyan
    }
  }, '  "epoch"'), React.createElement("span", {
    style: {
      color: dim
    }
  }, ": "), React.createElement("span", {
    style: {
      color: amber
    }
  }, "\"2026-05-07T03:14:00Z\""), React.createElement("span", {
    style: {
      color: dim
    }
  }, ",")), React.createElement("div", {
    style: styles.row
  }, React.createElement("span", {
    style: {
      color: cyan
    }
  }, '  "a_km"'), React.createElement("span", {
    style: {
      color: dim
    }
  }, ": "), React.createElement("span", {
    style: {
      color: blue
    }
  }, "6791.2"), React.createElement("span", {
    style: {
      color: dim
    }
  }, ",")), React.createElement("div", {
    style: styles.row
  }, React.createElement("span", {
    style: {
      color: cyan
    }
  }, '  "sample"'), React.createElement("span", {
    style: {
      color: dim
    }
  }, ": "), React.createElement("span", {
    style: {
      color: green,
      fontWeight: 600
    }
  }, "true")), React.createElement("div", {
    style: {
      ...styles.row,
      color: dim
    }
  }, '}'), React.createElement(Prompt, {
    branch: "theme/syntax",
    git: "+5",
    ok: true,
    cmd: "npm test",
    dur: "2.4s",
    runtime: "node 22"
  }), React.createElement("div", {
    style: {
      ...styles.row,
      color: green,
      fontWeight: 600
    }
  }, "sample command: npm test"), React.createElement("div", {
    style: {
      ...styles.row,
      color: dim
    }
  }, "sample coverage: json, toml, plist, xml, shell, lua"), React.createElement("div", {
    style: styles.pwrap
  }, React.createElement("span", {
    style: {
      ...styles.chunk,
      background: limeBg,
      color: limeFg
    }
  }, "\xA0bzr\xA0"), React.createElement("span", {
    style: styles.wedgeR(limeBg, voidBg)
  }), React.createElement("span", {
    style: {
      ...styles.chunk,
      background: voidBg,
      color: dirFg,
      fontWeight: 500
    }
  }, "\xA0~/themes/bizarre\xA0"), React.createElement("span", {
    style: styles.wedgeR(voidBg, smokeBg)
  }), React.createElement("span", {
    style: {
      ...styles.chunk,
      background: smokeBg,
      color: branchFg,
      fontWeight: 500
    }
  }, "\xA0 theme/regen "), React.createElement("span", {
    style: {
      ...styles.chunk,
      background: smokeBg,
      color: green,
      fontWeight: 500
    }
  }, "+5 "), React.createElement("span", {
    style: styles.wedgeR(smokeBg, 'transparent')
  })), React.createElement("div", {
    style: styles.starLine
  }, React.createElement("span", null, "\u2726"), " ", React.createElement("span", {
    className: "blink",
    style: {
      background: fg,
      width: 8,
      height: 16,
      display: 'inline-block',
      verticalAlign: '-3px'
    }
  }))));
};
const P = window.BZR_PALETTE;
const VARIANTS = P.variantOrder.map(id => ({
  id,
  ...P.variants[id]
}));
const SYNTAX_LEGEND = [["pl", "plain", "text"], ["p", "punctuation", "() , ;"], ["op", "operator", "+ -> ?:"], ["kw-ctrl", "control", "if/for/return"], ["kw-decl", "declaration", "const/fn/class"], ["kw-mod", "modifier", "pub/async/static"], ["s", "string", "\"signal\""], ["tmpl", "template", "`x=${v}`"], ["esc", "escape", "${...} \\n"], ["rgx", "regex", "/[a-z]+/"], ["n", "number", "3.14"], ["bool", "bool/null", "true/None"], ["const", "constant", "MAX_INT"], ["t", "type", "Vec3"], ["tprim", "primitive", "u32"], ["f", "function", "render()"], ["method", "method", ".send()"], ["prop", "property", ".opts"], ["param", "parameter", "(x, y)"], ["v", "variable", "value"], ["this", "self/this", "self"], ["b", "builtin", "print"], ["ns", "namespace", "std::io"], ["d", "decorator", "@cache"], ["pre", "preprocessor", "#include"], ["c", "comment", "// note"], ["cdoc", "doc-comment", "/** */"], ["tag", "jsx tag", "<div>"], ["attr", "jsx attr", "className"]];
const TERMINAL_TARGETS = [{
  shot: 'terminal-alacritty',
  name: 'Alacritty',
  file: 'terminals/alacritty/bizarre-void.toml',
  variant: 'void',
  cmd: 'alacritty --config-file bizarre-void.toml'
}, {
  shot: 'terminal-kitty',
  name: 'Kitty',
  file: 'terminals/kitty/bizarre-void-hicontrast.conf',
  variant: 'void-hicontrast',
  cmd: 'kitty +kitten themes Bizarre Void Hi-Contrast'
}, {
  shot: 'terminal-ghostty',
  name: 'Ghostty',
  file: 'terminals/ghostty/bizarre-workshop',
  variant: 'workshop',
  cmd: 'theme = bizarre-workshop'
}, {
  shot: 'terminal-iterm2',
  name: 'iTerm2',
  file: 'terminals/iterm2/bizarre-paper.itermcolors',
  variant: 'paper',
  cmd: 'open bizarre-paper.itermcolors'
}, {
  shot: 'terminal-wezterm',
  name: 'WezTerm',
  file: 'terminals/wezterm/bizarre.lua',
  variant: 'void',
  cmd: 'color_scheme = Bizarre Void'
}, {
  shot: 'terminal-windows-terminal',
  name: 'Windows Terminal',
  file: 'terminals/windows-terminal/schemes.json',
  variant: 'void',
  cmd: 'colorScheme: Bizarre Void'
}, {
  shot: 'terminal-tmux',
  name: 'tmux',
  file: 'terminals/tmux/bizarre.tmux.conf',
  variant: 'void',
  cmd: 'set -g @bizarre-variant void'
}, {
  shot: 'terminal-zellij',
  name: 'Zellij',
  file: 'terminals/zellij/bizarre.kdl',
  variant: 'void',
  cmd: 'theme "bizarre-void"'
}];
const TERMINAL_BACKLOG_TARGETS = [{
  shot: 'terminal-foot',
  name: 'Foot',
  file: 'terminals/foot/bizarre-void.ini',
  variant: 'void',
  cmd: 'include=bizarre-void.ini'
}, {
  shot: 'terminal-konsole',
  name: 'Konsole',
  file: 'terminals/konsole/bizarre-void-hicontrast.colorscheme',
  variant: 'void-hicontrast',
  cmd: 'ColorScheme=Bizarre Void Hi-Contrast'
}, {
  shot: 'terminal-rio',
  name: 'Rio',
  file: 'terminals/rio/bizarre-workshop.toml',
  variant: 'workshop',
  cmd: 'rio --config bizarre-workshop.toml'
}, {
  shot: 'terminal-hyper',
  name: 'Hyper',
  file: 'terminals/hyper/bizarre-paper.js',
  variant: 'paper',
  cmd: 'module.exports.config'
}, {
  shot: 'terminal-terminator',
  name: 'Terminator',
  file: 'terminals/terminator/bizarre-bone.config',
  variant: 'bone',
  cmd: 'profile bizarre-bone'
}, {
  shot: 'terminal-tilix',
  name: 'Tilix',
  file: 'terminals/tilix/bizarre-void.dconf',
  variant: 'void',
  cmd: 'dconf load'
}, {
  shot: 'terminal-xfce',
  name: 'XFCE Terminal',
  file: 'terminals/xfce-terminal/bizarre-void-hicontrast.theme',
  variant: 'void-hicontrast',
  cmd: 'ColorPalette'
}, {
  shot: 'terminal-gnome',
  name: 'GNOME Terminal',
  file: 'terminals/gnome-terminal/bizarre.sh',
  variant: 'void',
  cmd: './bizarre.sh bizarre-void'
}, {
  shot: 'terminal-black-box',
  name: 'Black Box',
  file: 'terminals/black-box/bizarre-paper.json',
  variant: 'paper',
  cmd: 'palette json'
}];
const VSCODE_TARGETS = VARIANTS.map(v => ({
  shot: 'vscode-' + v.id,
  name: v.label,
  file: 'editors/vscode/themes/bizarre-' + v.id + '-color-theme.json',
  variant: v.id
}));
const EDITOR_TARGETS = [{
  shot: 'editor-zed',
  name: 'Zed',
  file: 'editors/zed/themes/bizarre.json',
  variant: 'void',
  lang: 'TS'
}, {
  shot: 'editor-jetbrains',
  name: 'JetBrains',
  file: 'editors/jetbrains/bizarre-void-hicontrast.icls',
  variant: 'void-hicontrast',
  lang: 'Kotlin'
}, {
  shot: 'editor-sublime',
  name: 'Sublime Text',
  file: 'editors/sublime/bizarre-workshop.sublime-color-scheme',
  variant: 'workshop',
  lang: 'Rust'
}, {
  shot: 'editor-vim',
  name: 'Vim',
  file: 'editors/vim/colors/bizarre-paper.vim',
  variant: 'paper',
  lang: 'VimL'
}, {
  shot: 'editor-neovim',
  name: 'Neovim',
  file: 'editors/neovim/colors/bizarre-bone.vim',
  variant: 'bone',
  lang: 'Lua'
}, {
  shot: 'editor-base16',
  name: 'Base16',
  file: 'editors/neovim-base16/bizarre-void.yaml',
  variant: 'void',
  lang: 'YAML'
}];
const EDITOR_BACKLOG_TARGETS = [{
  shot: 'editor-emacs',
  name: 'Emacs',
  file: 'editors/emacs/bizarre-void-theme.el',
  variant: 'void',
  lang: 'Elisp'
}, {
  shot: 'editor-helix',
  name: 'Helix',
  file: 'editors/helix/bizarre-void-hicontrast.toml',
  variant: 'void-hicontrast',
  lang: 'TOML'
}, {
  shot: 'editor-lapce',
  name: 'Lapce',
  file: 'editors/lapce/bizarre-workshop.toml',
  variant: 'workshop',
  lang: 'TOML'
}, {
  shot: 'editor-kate',
  name: 'Kate',
  file: 'editors/kate/bizarre-paper.theme',
  variant: 'paper',
  lang: 'JSON'
}, {
  shot: 'editor-notepad-plus-plus',
  name: 'Notepad++',
  file: 'editors/notepad-plus-plus/bizarre-bone.xml',
  variant: 'bone',
  lang: 'XML'
}, {
  shot: 'editor-nova',
  name: 'Nova',
  file: 'editors/nova/bizarre-void.json',
  variant: 'void',
  lang: 'JSON'
}, {
  shot: 'editor-visual-studio',
  name: 'Visual Studio',
  file: 'editors/visual-studio/bizarre-void-hicontrast.vstheme',
  variant: 'void-hicontrast',
  lang: 'XML'
}, {
  shot: 'editor-cursor',
  name: 'Cursor',
  file: 'editors/cursor/README.md',
  variant: 'void',
  lang: 'VS Code reuse'
}, {
  shot: 'editor-android-studio',
  name: 'Android Studio',
  file: 'editors/android-studio/README.md',
  variant: 'void',
  lang: 'JetBrains reuse'
}];
const SHELL_TARGETS = [{
  shot: 'shell-bash',
  name: 'Bash',
  file: 'shells/banner/bizarre.bash',
  variant: 'void',
  cmd: 'source shells/banner/bizarre.bash'
}, {
  shot: 'shell-zsh',
  name: 'Zsh',
  file: 'shells/banner/bizarre.zsh',
  variant: 'void',
  cmd: 'source shells/banner/bizarre.zsh'
}, {
  shot: 'shell-fish',
  name: 'Fish',
  file: 'shells/banner/bizarre.fish',
  variant: 'void',
  cmd: 'source shells/banner/bizarre.fish'
}, {
  shot: 'shell-powershell',
  name: 'PowerShell',
  file: 'shells/banner/bizarre.ps1',
  variant: 'void',
  cmd: '. ./shells/banner/bizarre.ps1'
}, {
  shot: 'prompt-starship',
  name: 'Starship',
  file: 'prompt/starship.toml',
  variant: 'void',
  cmd: 'starship init zsh'
}];
const TOOL_TARGETS = [{
  shot: 'tool-aerospace',
  name: 'AeroSpace',
  file: 'tools/aerospace/aerospace.toml',
  variant: 'void',
  key: 'focused border',
  value: P.brand.signalLime
}, {
  shot: 'tool-forklift',
  name: 'ForkLift',
  file: 'tools/forklift/Bizarre.json',
  variant: 'void',
  key: 'selection',
  value: P.variants.void.sel
}, {
  shot: 'tool-jujutsu',
  name: 'Jujutsu',
  file: 'tools/jujutsu/config.toml',
  variant: 'void',
  key: 'working-copy change id',
  value: P.brand.signalLime
}, {
  shot: 'tool-starship',
  name: 'Starship',
  file: 'prompt/starship.toml',
  variant: 'void',
  key: 'prompt block',
  value: P.brand.signalLime
}];
const CLI_TARGETS = [{
  name: 'bat',
  file: 'tools/bat/themes/bizarre-void.tmTheme',
  variant: 'void',
  key: 'syntax',
  value: 'TextMate'
}, {
  name: 'btop',
  file: 'tools/btop/bizarre-void-hicontrast.theme',
  variant: 'void-hicontrast',
  key: 'graphs',
  value: 'theme[]'
}, {
  name: 'delta',
  file: 'tools/delta/bizarre.gitconfig',
  variant: 'void',
  key: 'diff',
  value: 'feature'
}, {
  name: 'dircolors',
  file: 'tools/dircolors/bizarre.dircolors',
  variant: 'void',
  key: 'LS_COLORS',
  value: 'ansi256'
}, {
  name: 'fzf',
  file: 'tools/fzf/bizarre.sh',
  variant: 'void',
  key: 'picker',
  value: '24-bit'
}, {
  name: 'lazygit',
  file: 'tools/lazygit/config.yml',
  variant: 'void',
  key: 'panes',
  value: 'yaml'
}, {
  name: 'yazi',
  file: 'tools/yazi/flavors/bizarre-void-hicontrast.yazi/flavor.toml',
  variant: 'void-hicontrast',
  key: 'flavor',
  value: 'toml'
}, {
  name: 'eza',
  file: 'tools/eza/bizarre.sh',
  variant: 'void',
  key: 'files',
  value: 'EZA_COLORS'
}, {
  name: 'atuin',
  file: 'tools/atuin/themes/bizarre-paper.toml',
  variant: 'paper',
  key: 'history',
  value: 'Meanings'
}, {
  name: 'bottom',
  file: 'tools/bottom/bizarre-bone.toml',
  variant: 'bone',
  key: 'monitor',
  value: 'styles'
}, {
  name: 'k9s',
  file: 'tools/k9s/skins/bizarre-void.yaml',
  variant: 'void',
  key: 'cluster',
  value: 'skin'
}, {
  name: 'ranger',
  file: 'tools/ranger/colorschemes/bizarre_void_hicontrast.py',
  variant: 'void-hicontrast',
  key: 'files',
  value: 'python'
}, {
  name: 'vivid',
  file: 'tools/vivid/themes/bizarre-workshop.yml',
  variant: 'workshop',
  key: 'ls',
  value: 'yaml'
}];
const APP_TARGETS = [{
  name: 'Raycast',
  file: 'apps/raycast/bizarre-void.json',
  variant: 'void',
  key: 'format',
  value: 'json'
}, {
  name: 'Alfred',
  file: 'apps/alfred/bizarre-void-hicontrast.alfredappearance',
  variant: 'void-hicontrast',
  key: 'format',
  value: 'appearance'
}, {
  name: 'Obsidian',
  file: 'apps/obsidian/bizarre-workshop.css',
  variant: 'workshop',
  key: 'format',
  value: 'css'
}, {
  name: 'Logseq',
  file: 'apps/logseq/bizarre-paper.css',
  variant: 'paper',
  key: 'format',
  value: 'css'
}, {
  name: 'Slack',
  file: 'apps/slack/bizarre-sidebar-themes.txt',
  variant: 'void',
  key: 'format',
  value: 'sidebar'
}, {
  name: 'Discord',
  file: 'apps/discord/betterdiscord/bizarre-void.theme.css',
  variant: 'void',
  key: 'adapter',
  value: 'BetterDiscord'
}, {
  name: 'Telegram',
  file: 'apps/telegram/bizarre-void-hicontrast.tdesktop-theme',
  variant: 'void-hicontrast',
  key: 'format',
  value: 'tdesktop'
}, {
  name: 'Spotify',
  file: 'apps/spotify/spicetify/color.ini',
  variant: 'void',
  key: 'adapter',
  value: 'Spicetify'
}, {
  name: 'qutebrowser',
  file: 'apps/qutebrowser/bizarre-paper.py',
  variant: 'paper',
  key: 'format',
  value: 'python'
}];
const WEB_TARGETS = [{
  name: 'Firefox',
  file: 'web/firefox/bizarre-void/manifest.json',
  variant: 'void',
  key: 'format',
  value: 'manifest'
}, {
  name: 'Chrome',
  file: 'web/chrome/bizarre-void-hicontrast/manifest.json',
  variant: 'void-hicontrast',
  key: 'format',
  value: 'manifest'
}, {
  name: 'Arc',
  file: 'web/arc/boosts/bizarre-workshop.css',
  variant: 'workshop',
  key: 'format',
  value: 'Boost CSS'
}, {
  name: 'Vivaldi',
  file: 'web/vivaldi/bizarre-paper/theme.json',
  variant: 'paper',
  key: 'format',
  value: 'theme json'
}, {
  name: 'Userstyles',
  file: 'web/userstyles/bizarre-bone.user.css',
  variant: 'bone',
  key: 'adapter',
  value: 'Stylus'
}, {
  name: 'Startpages',
  file: 'web/startpages/bizarre-void.html',
  variant: 'void',
  key: 'format',
  value: 'html'
}, {
  name: 'Docs sites',
  file: 'web/documentation-sites/bizarre-void-hicontrast.css',
  variant: 'void-hicontrast',
  key: 'format',
  value: 'css'
}];
const DESIGN_DOCS_TARGETS = [{
  name: 'Figma',
  file: 'design/figma/bizarre.tokens.json',
  variant: 'void',
  key: 'format',
  value: 'tokens'
}, {
  name: 'Sketch',
  file: 'design/sketch/bizarre.sketchpalette',
  variant: 'void',
  key: 'format',
  value: 'palette'
}, {
  name: 'Insomnia',
  file: 'devtools/insomnia/bizarre.js',
  variant: 'void',
  key: 'format',
  value: 'js'
}, {
  name: 'Postman',
  file: 'devtools/postman/bizarre-paper.css',
  variant: 'paper',
  key: 'adapter',
  value: 'userstyle'
}, {
  name: 'HTTPie',
  file: 'devtools/httpie/bizarre.py',
  variant: 'void',
  key: 'format',
  value: 'pygments'
}, {
  name: 'TablePlus',
  file: 'devtools/tableplus/bizarre-void.json',
  variant: 'void',
  key: 'format',
  value: 'json'
}, {
  name: 'DBeaver',
  file: 'devtools/dbeaver/bizarre-void-hicontrast.epf',
  variant: 'void-hicontrast',
  key: 'format',
  value: 'epf'
}, {
  name: 'GitHub assets',
  file: 'devtools/github-readme-assets/bizarre-badge.svg',
  variant: 'void',
  key: 'format',
  value: 'svg'
}, {
  name: 'MkDocs',
  file: 'docs-sites/mkdocs/bizarre-paper.css',
  variant: 'paper',
  key: 'format',
  value: 'css'
}, {
  name: 'Docusaurus',
  file: 'docs-sites/docusaurus/bizarre-bone.css',
  variant: 'bone',
  key: 'format',
  value: 'css'
}, {
  name: 'Sphinx',
  file: 'docs-sites/sphinx/bizarre/theme.toml',
  variant: 'void',
  key: 'format',
  value: 'theme.toml'
}, {
  name: 'LaTeX',
  file: 'docs-sites/latex/bizarre.sty',
  variant: 'void',
  key: 'format',
  value: 'sty'
}, {
  name: 'Typst',
  file: 'docs-sites/typst/bizarre.typ',
  variant: 'void',
  key: 'format',
  value: 'typ'
}, {
  name: 'Beamer',
  file: 'docs-sites/beamer/beamerthemebizarre.sty',
  variant: 'void',
  key: 'format',
  value: 'sty'
}, {
  name: 'reveal.js',
  file: 'docs-sites/reveal.js/bizarre-bone.css',
  variant: 'bone',
  key: 'format',
  value: 'css'
}];
const WM_TARGETS = [{
  name: 'Hyprland',
  file: 'wm/hyprland/bizarre-void.conf',
  variant: 'void',
  key: 'format',
  value: 'hyprlang'
}, {
  name: 'Sway',
  file: 'wm/sway/bizarre-void-hicontrast.conf',
  variant: 'void-hicontrast',
  key: 'format',
  value: 'config'
}, {
  name: 'i3',
  file: 'wm/i3/bizarre-workshop.conf',
  variant: 'workshop',
  key: 'format',
  value: 'config'
}, {
  name: 'Waybar',
  file: 'wm/waybar/bizarre-paper.css',
  variant: 'paper',
  key: 'format',
  value: 'css'
}, {
  name: 'Polybar',
  file: 'wm/polybar/bizarre-bone.ini',
  variant: 'bone',
  key: 'format',
  value: 'ini'
}, {
  name: 'SketchyBar',
  file: 'wm/sketchybar/bizarre.sh',
  variant: 'void',
  key: 'format',
  value: 'shell'
}, {
  name: 'yabai',
  file: 'wm/yabai/bizarre.sh',
  variant: 'void',
  key: 'format',
  value: 'shell'
}, {
  name: 'rofi',
  file: 'wm/rofi/bizarre-workshop.rasi',
  variant: 'workshop',
  key: 'format',
  value: 'rasi'
}, {
  name: 'wofi',
  file: 'wm/wofi/bizarre-paper.css',
  variant: 'paper',
  key: 'format',
  value: 'css'
}];
const MINI_WORDMARK = ['BIZARRE', 'INDUSTRIES'];
const WORDMARK = {
  "bizarre": ["██████╗ ██╗███████╗ █████╗ ██████╗ ██████╗ ███████╗", "██╔══██╗██║╚══███╔╝██╔══██╗██╔══██╗██╔══██╗██╔════╝", "██████╔╝██║  ███╔╝ ███████║██████╔╝██████╔╝█████╗  ", "██╔══██╗██║ ███╔╝  ██╔══██║██╔══██╗██╔══██╗██╔══╝  ", "██████╔╝██║███████╗██║  ██║██║  ██║██║  ██║███████╗", "╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝"],
  "industries": ["██╗███╗   ██╗██████╗ ██╗   ██╗███████╗████████╗██████╗ ██╗███████╗███████╗", "██║████╗  ██║██╔══██╗██║   ██║██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝██╔════╝", "██║██╔██╗ ██║██║  ██║██║   ██║███████╗   ██║   ██████╔╝██║█████╗  ███████╗", "██║██║╚██╗██║██║  ██║██║   ██║╚════██║   ██║   ██╔══██╗██║██╔══╝  ╚════██║", "██║██║ ╚████║██████╔╝╚██████╔╝███████║   ██║   ██║  ██║██║███████╗███████║", "╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝╚══════╝"]
};
function variantById(id) {
  return {
    id,
    ...P.variants[id]
  };
}
function cardStyle(v) {
  return {
    '--bg': v.bg,
    '--fgc': v.fg,
    '--dim': v.fgDim,
    '--accent': v.accent,
    '--accent-text': v.accentText,
    '--info': v.syntax.info,
    background: v.bg,
    color: v.fg
  };
}
function TerminalConfigCard({
  target
}) {
  const v = variantById(target.variant);
  return React.createElement("div", {
    className: 'config-card ' + (v.mode === 'light' ? 'light' : ''),
    "data-config-shot": target.shot,
    style: cardStyle(v)
  }, React.createElement("div", {
    className: "config-title"
  }, React.createElement("strong", null, target.name), React.createElement("code", null, target.file)), React.createElement("div", {
    className: "mini-ansi"
  }, Object.entries(v.ansi).map(([name, hex]) => React.createElement("span", {
    className: "ansi-chip",
    key: name,
    title: name + ' ' + hex,
    style: {
      background: hex
    }
  }))), React.createElement("div", {
    className: "config-prompt"
  }, React.createElement("span", {
    className: "path"
  }, "~/themes"), " ", React.createElement("span", {
    className: "cmd"
  }, "\u2726"), " ", target.cmd, React.createElement("br", null), React.createElement("span", {
    style: {
      color: v.fgDim
    }
  }, "ansi 16 \xB7 accent ", v.accent)));
}
function MiniVscodeCode({
  variant
}) {
  const s = variant.syntax;
  return React.createElement("div", {
    className: "mini-code"
  }, React.createElement("div", null, React.createElement("span", {
    style: {
      color: s.kwDecl
    }
  }, "export const"), " ", React.createElement("span", {
    style: {
      color: variant.accentText
    }
  }, "palette"), " ", React.createElement("span", {
    style: {
      color: s.op
    }
  }, "="), " ", React.createElement("span", {
    style: {
      color: s.punct
    }
  }, '{')), React.createElement("div", null, "\xA0\xA0", React.createElement("span", {
    style: {
      color: s.prop
    }
  }, "accent"), React.createElement("span", {
    style: {
      color: s.punct
    }
  }, ":"), " ", React.createElement("span", {
    style: {
      color: s.string
    }
  }, "'", variant.accent, "'"), React.createElement("span", {
    style: {
      color: s.punct
    }
  }, ",")), React.createElement("div", null, "\xA0\xA0", React.createElement("span", {
    style: {
      color: s.fn
    }
  }, "renderTheme"), React.createElement("span", {
    style: {
      color: s.punct
    }
  }, "("), React.createElement("span", {
    style: {
      color: s.param
    }
  }, "surface"), React.createElement("span", {
    style: {
      color: s.punct
    }
  }, ")"), " ", React.createElement("span", {
    style: {
      color: s.punct
    }
  }, '{')), React.createElement("div", null, "\xA0\xA0\xA0\xA0", React.createElement("span", {
    style: {
      color: s.kwCtrl
    }
  }, "return"), " ", React.createElement("span", {
    style: {
      color: s.builtin
    }
  }, "paint"), React.createElement("span", {
    style: {
      color: s.punct
    }
  }, "("), React.createElement("span", {
    style: {
      color: s.param
    }
  }, "surface"), React.createElement("span", {
    style: {
      color: s.punct
    }
  }, ")")), React.createElement("div", null, "\xA0\xA0", React.createElement("span", {
    style: {
      color: s.punct
    }
  }, '}')), React.createElement("div", null, React.createElement("span", {
    style: {
      color: s.punct
    }
  }, '}'), React.createElement("span", {
    style: {
      color: s.punct
    }
  }, ";")));
}
function VscodeConfigCard({
  target
}) {
  const v = variantById(target.variant);
  return React.createElement("div", {
    className: 'config-card ' + (v.mode === 'light' ? 'light' : ''),
    "data-config-shot": target.shot,
    style: cardStyle(v)
  }, React.createElement("div", {
    className: "config-title"
  }, React.createElement("strong", null, target.name), React.createElement("code", null, target.file)), React.createElement("div", {
    className: "vscode-window",
    style: {
      background: v.bg
    }
  }, React.createElement("div", {
    className: "vscode-bar"
  }, React.createElement("span", {
    className: "vscode-dot active"
  }), React.createElement("span", {
    className: "vscode-dot"
  }), React.createElement("span", {
    className: "vscode-dot"
  }), React.createElement("span", {
    style: {
      marginLeft: 'auto'
    }
  }, "VS Code")), React.createElement("div", {
    className: "vscode-body"
  }, React.createElement("div", {
    className: "vscode-activity"
  }, React.createElement("span", {
    className: "vscode-icon file on"
  }), React.createElement("span", {
    className: "vscode-icon search"
  }), React.createElement("span", {
    className: "vscode-icon branch"
  }), React.createElement("span", {
    className: "vscode-icon gear"
  })), React.createElement("div", {
    className: "vscode-side"
  }, React.createElement("div", {
    className: "active"
  }, "themes"), React.createElement("div", null, "bizarre"), React.createElement("div", null, "palette.js"), React.createElement("div", null, "showcase")), React.createElement("div", {
    className: "vscode-editor"
  }, React.createElement(MiniVscodeCode, {
    variant: v
  }))), React.createElement("div", {
    className: "vscode-status"
  }, React.createElement("span", null, v.label), React.createElement("span", null, v.mode))));
}
function EditorConfigCard({
  target
}) {
  const v = variantById(target.variant);
  return React.createElement("div", {
    className: 'config-card ' + (v.mode === 'light' ? 'light' : ''),
    "data-config-shot": target.shot,
    style: cardStyle(v)
  }, React.createElement("div", {
    className: "config-title"
  }, React.createElement("strong", null, target.name), React.createElement("code", null, target.file)), React.createElement("div", {
    className: "tool-body"
  }, React.createElement("div", null, React.createElement("span", {
    className: "key"
  }, "variant"), ": ", React.createElement("span", {
    className: "value"
  }, v.label)), React.createElement("div", null, React.createElement("span", {
    className: "key"
  }, "language"), ": ", React.createElement("span", {
    className: "value"
  }, target.lang)), React.createElement("div", null, React.createElement("span", {
    className: "key"
  }, "background"), ": ", v.bg), React.createElement("div", null, React.createElement("span", {
    className: "key"
  }, "foreground"), ": ", v.fg), React.createElement("div", null, React.createElement("span", {
    className: "key"
  }, "function"), ": ", React.createElement("span", {
    className: "value"
  }, v.syntax.fn)), React.createElement("div", null, React.createElement("span", {
    className: "key"
  }, "string"), ": ", v.syntax.string)), React.createElement("div", {
    className: "tool-strip"
  }, [v.bg2, v.bg3, v.syntax.kwCtrl, v.syntax.string, v.accent].map(hex => React.createElement("span", {
    key: hex,
    style: {
      background: hex
    }
  }))));
}
function ShellConfigCard({
  target
}) {
  const v = variantById(target.variant);
  const isPrompt = target.name === 'Starship';
  return React.createElement("div", {
    className: 'config-card shell-card ' + (v.mode === 'light' ? 'light' : ''),
    "data-config-shot": target.shot,
    style: cardStyle(v)
  }, React.createElement("div", {
    className: "config-title"
  }, React.createElement("strong", null, target.name), React.createElement("code", null, target.file)), React.createElement("div", {
    className: "shell-body"
  }, MINI_WORDMARK.map(line => React.createElement(React.Fragment, {
    key: line
  }, React.createElement("span", {
    className: "brand"
  }, line), '\n')), React.createElement("span", {
    className: "muted"
  }, "BZR / ", isPrompt ? 'PROMPT' : 'SHELL', " / V0.2"), '\n\n', React.createElement("span", {
    className: "quote"
  }, isPrompt ? '✦ ~/themes  main +5' : 'CATCH THE STARS.'), '\n', React.createElement("span", {
    className: "muted"
  }, target.cmd)));
}
function ToolConfigCard({
  target
}) {
  const v = variantById(target.variant);
  return React.createElement("div", {
    className: 'config-card ' + (v.mode === 'light' ? 'light' : ''),
    "data-config-shot": target.shot,
    style: cardStyle(v)
  }, React.createElement("div", {
    className: "config-title"
  }, React.createElement("strong", null, target.name), React.createElement("code", null, target.file)), React.createElement("div", {
    className: "tool-body"
  }, React.createElement("div", null, React.createElement("span", {
    className: "key"
  }, target.key), ": ", React.createElement("span", {
    className: "value"
  }, target.value)), React.createElement("div", null, React.createElement("span", {
    className: "key"
  }, "surface"), ": ", v.bg), React.createElement("div", null, React.createElement("span", {
    className: "key"
  }, "border"), ": ", v.border), React.createElement("div", null, React.createElement("span", {
    className: "key"
  }, "text"), ": ", v.fg), React.createElement("div", null, React.createElement("span", {
    className: "key"
  }, "status"), ": ", v.syntax.ok, " / ", v.syntax.warn, " / ", v.syntax.error)), React.createElement("div", {
    className: "tool-strip"
  }, [v.bg, v.bg2, v.bg3, v.fg, v.accent].map(hex => React.createElement("span", {
    key: hex,
    style: {
      background: hex
    }
  }))));
}
function CliConfigCard({
  target
}) {
  const v = variantById(target.variant);
  return React.createElement("div", {
    className: 'config-card cli-card ' + (v.mode === 'light' ? 'light' : ''),
    style: cardStyle(v)
  }, React.createElement("div", {
    className: "config-title"
  }, React.createElement("strong", null, target.name), React.createElement("code", null, target.file)), React.createElement("div", {
    className: "tool-body"
  }, React.createElement("div", null, React.createElement("span", {
    className: "key"
  }, target.key), ": ", React.createElement("span", {
    className: "value"
  }, target.value)), React.createElement("div", null, React.createElement("span", {
    className: "key"
  }, "accent"), ": ", React.createElement("span", {
    className: "value"
  }, v.accent)), React.createElement("div", null, React.createElement("span", {
    className: "key"
  }, "surface"), ": ", v.bg)), React.createElement("div", {
    className: "tool-strip"
  }, [v.bg, v.bg2, v.border, v.syntax.info, v.accent].map(hex => React.createElement("span", {
    key: hex,
    style: {
      background: hex
    }
  }))));
}
window.BzrShowcase = function Showcase() {
  const samples = window.BZR_SAMPLES;
  const sample = samples.ts;
  const limeRole = 'functions';
  const shown = [P.variants.void, P.variants.paper, P.variants['void-hicontrast'], P.variants.workshop, P.variants.bone].map((v, i) => ({
    id: ['void', 'paper', 'void-hicontrast', 'workshop', 'bone'][i],
    ...v
  }));
  return React.createElement("div", {
    className: "showcase"
  }, React.createElement("header", {
    className: "hero",
    "data-shot": "hero"
  }, React.createElement("div", {
    className: "eyebrow"
  }, React.createElement("span", {
    className: "star"
  }, "\u2726"), React.createElement("span", null, "BIZARRE INDUSTRIES"), React.createElement("span", {
    className: "pill"
  }, "THEMES / V0.2"), React.createElement("span", {
    className: "pill"
  }, "MAY 2026 SNAPSHOT"), React.createElement("span", {
    className: "pill"
  }, "EDITOR + TERMINAL SYSTEM")), React.createElement("div", {
    className: "hero-grid"
  }, React.createElement("div", null, React.createElement("h1", {
    className: "h1"
  }, React.createElement("span", {
    className: "stack"
  }, React.createElement("span", {
    className: "lime"
  }, "YOUR"), " EDITOR."), React.createElement("span", {
    className: "stack"
  }, "YOUR ", React.createElement("span", {
    className: "gray"
  }, "TERMINAL.")), React.createElement("span", {
    className: "stack"
  }, "ONE ", React.createElement("span", {
    className: "lime"
  }, "LIME"), "."))), React.createElement("div", null, React.createElement("p", {
    className: "lede"
  }, "Bizarre Industries themes use one canonical palette across editors, terminals, prompts, shells, and desktop tools. GitHub Monaspace carries the interface: Neon for code, Xenon for display, Krypton for labels, Argon for prose."), React.createElement("dl", {
    className: "hero-meta"
  }, React.createElement("div", null, React.createElement("dt", null, "brand accent"), React.createElement("dd", null, "Signal Lime \xB7 ", P.brand.signalLime)), React.createElement("div", null, React.createElement("dt", null, "paper accents"), React.createElement("dd", null, "Lime Ink \xB7 ", P.brand.limeInk, " / Lime Text \xB7 ", P.brand.limeText)), React.createElement("div", null, React.createElement("dt", null, "type"), React.createElement("dd", null, "Monaspace Neon \xB7 Xenon \xB7 Krypton")), React.createElement("div", null, React.createElement("dt", null, "variants"), React.createElement("dd", null, "5 palettes \xB7 generated configs"))))), React.createElement("div", {
    className: "slogan-strip"
  }, React.createElement("span", null, "BZR / 002"), React.createElement("span", {
    className: "lime"
  }, "CATCH THE STARS."), React.createElement("span", null, "SCROLL"))), React.createElement("section", {
    className: "section",
    "data-shot": "palette-ansi"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("span", {
    className: "section-num"
  }, "\xA7 01 / PALETTE"), React.createElement("h2", {
    className: "section-title"
  }, "Two limes. One brand."), React.createElement("span", {
    className: "section-sub"
  }, "dark \xB7 light \xB7 ansi")), React.createElement("div", {
    className: "lime-pair"
  }, React.createElement("div", {
    className: "lime-card",
    style: {
      '--surface-muted': P.variants.void.fgDim,
      background: P.variants.void.bg,
      color: P.variants.void.fg
    }
  }, React.createElement("div", {
    className: "lime-swatch",
    style: {
      background: P.brand.signalLime
    }
  }), React.createElement("div", null, React.createElement("div", {
    className: "lime-meta"
  }, "DARK \xB7 BRAND HERO"), React.createElement("div", {
    className: "lime-name",
    style: {
      color: P.brand.signalLime
    }
  }, "Signal Lime"), React.createElement("div", {
    className: "lime-hex"
  }, P.brand.signalLime), React.createElement("div", {
    className: "lime-desc"
  }, "Hero accent for dark surfaces, prompt blocks, function names, cursor stars, and active focus rings."))), React.createElement("div", {
    className: "lime-card",
    style: {
      '--surface-muted': P.variants.paper.fgDim,
      background: P.variants.paper.bg,
      color: P.variants.paper.fg,
      borderColor: 'rgba(14,14,14,.12)'
    }
  }, React.createElement("div", {
    className: "lime-swatch",
    style: {
      background: P.brand.limeInk
    }
  }), React.createElement("div", null, React.createElement("div", {
    className: "lime-meta"
  }, "LIGHT \xB7 FILL + TEXT"), React.createElement("div", {
    className: "lime-name",
    style: {
      color: P.brand.limeText
    }
  }, "Lime Ink / Lime Text"), React.createElement("div", {
    className: "lime-hex"
  }, P.brand.limeInk, " / ", P.brand.limeText), React.createElement("div", {
    className: "lime-desc"
  }, "Lime Ink carries fills and graphics; Lime Text keeps foreground accents readable on paper and bone.")))), React.createElement("div", {
    className: "section-head",
    style: {
      marginTop: 56
    }
  }, React.createElement("span", {
    className: "section-num"
  }, "\xA7 01.B / ANSI"), React.createElement("h2", {
    className: "section-title"
  }, "Conventional ANSI, tuned to Bizarre."), React.createElement("span", {
    className: "section-sub"
  }, "8 normal \xB7 8 bright")), React.createElement("div", {
    className: "ansi-dual"
  }, ['void', 'paper'].map(id => {
    const v = P.variants[id];
    return React.createElement("div", {
      className: "ansi-half",
      key: id
    }, React.createElement("div", {
      className: "ansi-half-label"
    }, v.label), React.createElement("div", {
      className: "ansi-grid"
    }, Object.entries(v.ansi).map(([nm, hex]) => React.createElement("div", {
      key: nm,
      className: "ansi-cell",
      style: {
        background: hex,
        color: window.BZR_TEXT_ON[hex] || '#fff'
      }
    }, React.createElement("span", {
      className: "nm"
    }, nm), React.createElement("span", {
      className: "hex"
    }, hex)))));
  }))), React.createElement("section", {
    className: "section",
    "data-shot": "syntax"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("span", {
    className: "section-num"
  }, "\xA7 02 / SYNTAX"), React.createElement("h2", {
    className: "section-title"
  }, "29 token roles. Each earns a hue."), React.createElement("span", {
    className: "section-sub"
  }, "control vs decl \xB7 param vs prop \xB7 template vs string")), React.createElement("div", {
    className: "legend-grid"
  }, SYNTAX_LEGEND.map(([role, name, ex]) => React.createElement(React.Fragment, {
    key: role
  }, React.createElement("div", {
    className: "legend-card legend-dark"
  }, React.createElement("div", {
    className: "code",
    "data-theme": "dark",
    "data-lime-role": limeRole,
    style: {
      padding: 0
    }
  }, React.createElement("span", {
    className: `tok-${role}`,
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 16,
      fontWeight: 600
    }
  }, ex)), React.createElement("div", {
    className: "legend-name"
  }, name), React.createElement("div", {
    className: "legend-key"
  }, role)), React.createElement("div", {
    className: "legend-card legend-light"
  }, React.createElement("div", {
    className: "code",
    "data-theme": "light",
    "data-lime-role": limeRole,
    style: {
      padding: 0
    }
  }, React.createElement("span", {
    className: `tok-${role}`,
    style: {
      fontFamily: 'var(--mono)',
      fontSize: 16,
      fontWeight: 600
    }
  }, ex)), React.createElement("div", {
    className: "legend-name"
  }, name), React.createElement("div", {
    className: "legend-key"
  }, role)))))), React.createElement("section", {
    className: "section"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("span", {
    className: "section-num"
  }, "\xA7 03 / STATEMENT"), React.createElement("h2", {
    className: "section-title"
  }, "The wordmark is Lime."), React.createElement("span", {
    className: "section-sub"
  }, "brand \xB7 type \xB7 accent")), React.createElement("p", {
    className: "big-type"
  }, "BZR", React.createElement("span", {
    className: "lime"
  }, "."), React.createElement("br", null), React.createElement("span", {
    className: "out"
  }, "CATCH"), " THE ", React.createElement("span", {
    className: "lime"
  }, "STARS"), React.createElement("span", {
    className: "lime"
  }, "."))), React.createElement("section", {
    className: "section",
    "data-shot": "variants"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("span", {
    className: "section-num"
  }, "\xA7 04 / VARIANTS"), React.createElement("h2", {
    className: "section-title"
  }, "Five generated palettes."), React.createElement("span", {
    className: "section-sub"
  }, "dark \xB7 light \xB7 high contrast")), React.createElement("div", {
    className: "variant-grid"
  }, VARIANTS.map(v => React.createElement("div", {
    className: "variant-card",
    key: v.id,
    style: {
      '--bg': v.bg,
      '--fgc': v.fg,
      '--dim': v.fgDim
    }
  }, React.createElement("div", {
    className: "variant-swatch"
  }, React.createElement("div", {
    className: "variant-name",
    style: {
      color: v.accentText
    }
  }, v.label), React.createElement("div", {
    className: "variant-sub"
  }, v.sub)), React.createElement("div", {
    className: "variant-strip"
  }, [v.bg, v.bg2, v.bg3, v.fg, v.accent, v.syntax.info].map(hex => React.createElement("span", {
    key: hex,
    style: {
      background: hex
    }
  }))))))), React.createElement("section", {
    className: "section",
    "data-shot": "terminal-colors"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("span", {
    className: "section-num"
  }, "\xA7 05 / TERMINAL COLORS"), React.createElement("h2", {
    className: "section-title"
  }, "Core terminal configs use the palette."), React.createElement("span", {
    className: "section-sub"
  }, "alacritty \xB7 kitty \xB7 ghostty \xB7 iterm2 \xB7 wezterm \xB7 windows terminal \xB7 tmux \xB7 zellij")), React.createElement("div", {
    className: "config-grid"
  }, TERMINAL_TARGETS.map(target => React.createElement(TerminalConfigCard, {
    key: target.shot,
    target: target
  })))), React.createElement("section", {
    className: "section",
    "data-shot": "terminal-backlog"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("span", {
    className: "section-num"
  }, "\xA7 05.B / TERMINALS"), React.createElement("h2", {
    className: "section-title"
  }, "Additional shipped terminal ports."), React.createElement("span", {
    className: "section-sub"
  }, "foot \xB7 konsole \xB7 rio \xB7 hyper \xB7 terminator \xB7 tilix \xB7 xfce terminal \xB7 gnome terminal \xB7 black box")), React.createElement("div", {
    className: "config-grid"
  }, TERMINAL_BACKLOG_TARGETS.map(target => React.createElement(TerminalConfigCard, {
    key: target.shot,
    target: target
  })))), React.createElement("section", {
    className: "section",
    "data-shot": "vscode-themes"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("span", {
    className: "section-num"
  }, "\xA7 06 / VS CODE"), React.createElement("h2", {
    className: "section-title"
  }, "All VS Code variants."), React.createElement("span", {
    className: "section-sub"
  }, "activity bar \xB7 editor \xB7 status bar")), React.createElement("div", {
    className: "config-grid vscode-grid"
  }, VSCODE_TARGETS.map(target => React.createElement(VscodeConfigCard, {
    key: target.shot,
    target: target
  })))), React.createElement("section", {
    className: "section",
    "data-shot": "editor-themes"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("span", {
    className: "section-num"
  }, "\xA7 07 / EDITORS"), React.createElement("h2", {
    className: "section-title"
  }, "Editor ports beyond VS Code."), React.createElement("span", {
    className: "section-sub"
  }, "zed \xB7 jetbrains \xB7 sublime \xB7 vim \xB7 neovim \xB7 base16")), React.createElement("div", {
    className: "config-grid editor-grid"
  }, EDITOR_TARGETS.map(target => React.createElement(EditorConfigCard, {
    key: target.shot,
    target: target
  })))), React.createElement("section", {
    className: "section",
    "data-shot": "editor-backlog"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("span", {
    className: "section-num"
  }, "\xA7 07.B / EDITORS"), React.createElement("h2", {
    className: "section-title"
  }, "Additional shipped editor ports."), React.createElement("span", {
    className: "section-sub"
  }, "emacs \xB7 helix \xB7 lapce \xB7 kate \xB7 notepad++ \xB7 nova \xB7 cursor \xB7 visual studio \xB7 android studio")), React.createElement("div", {
    className: "config-grid editor-grid"
  }, EDITOR_BACKLOG_TARGETS.map(target => React.createElement(EditorConfigCard, {
    key: target.shot,
    target: target
  })))), React.createElement("section", {
    className: "section",
    "data-shot": "shells"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("span", {
    className: "section-num"
  }, "\xA7 08 / SHELLS"), React.createElement("h2", {
    className: "section-title"
  }, "Shell banners and prompt."), React.createElement("span", {
    className: "section-sub"
  }, "bash \xB7 zsh \xB7 fish \xB7 powershell \xB7 starship")), React.createElement("div", {
    className: "config-grid shell-grid"
  }, SHELL_TARGETS.map(target => React.createElement(ShellConfigCard, {
    key: target.shot,
    target: target
  })))), React.createElement("section", {
    className: "section",
    "data-shot": "tools"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("span", {
    className: "section-num"
  }, "\xA7 09 / TOOLS"), React.createElement("h2", {
    className: "section-title"
  }, "Desktop and workflow tools."), React.createElement("span", {
    className: "section-sub"
  }, "aerospace \xB7 forklift \xB7 jujutsu \xB7 starship")), React.createElement("div", {
    className: "config-grid tool-grid"
  }, TOOL_TARGETS.map(target => React.createElement(ToolConfigCard, {
    key: target.shot,
    target: target
  })))), React.createElement("section", {
    className: "section",
    "data-shot": "cli-tui"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("span", {
    className: "section-num"
  }, "\xA7 10 / CLI + TUI"), React.createElement("h2", {
    className: "section-title"
  }, "Shipped CLI and TUI ports."), React.createElement("span", {
    className: "section-sub"
  }, "bat \xB7 btop \xB7 delta \xB7 dircolors \xB7 fzf \xB7 lazygit \xB7 yazi \xB7 eza \xB7 atuin \xB7 bottom \xB7 k9s \xB7 ranger \xB7 vivid")), React.createElement("div", {
    className: "config-grid cli-grid"
  }, CLI_TARGETS.map(target => React.createElement(CliConfigCard, {
    key: target.name,
    target: target
  })))), React.createElement("section", {
    className: "section",
    "data-shot": "desktop-apps"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("span", {
    className: "section-num"
  }, "\xA7 11 / APPS"), React.createElement("h2", {
    className: "section-title"
  }, "Desktop app adapters."), React.createElement("span", {
    className: "section-sub"
  }, "raycast \xB7 alfred \xB7 obsidian \xB7 logseq \xB7 slack \xB7 discord \xB7 telegram \xB7 spotify \xB7 qutebrowser")), React.createElement("div", {
    className: "config-grid cli-grid"
  }, APP_TARGETS.map(target => React.createElement(CliConfigCard, {
    key: target.name,
    target: target
  })))), React.createElement("section", {
    className: "section",
    "data-shot": "browser-web"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("span", {
    className: "section-num"
  }, "\xA7 12 / WEB"), React.createElement("h2", {
    className: "section-title"
  }, "Browser and web ports."), React.createElement("span", {
    className: "section-sub"
  }, "firefox \xB7 chrome \xB7 arc \xB7 vivaldi \xB7 userstyles \xB7 startpages \xB7 documentation sites")), React.createElement("div", {
    className: "config-grid cli-grid"
  }, WEB_TARGETS.map(target => React.createElement(CliConfigCard, {
    key: target.name,
    target: target
  })))), React.createElement("section", {
    className: "section",
    "data-shot": "design-devtools-docs"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("span", {
    className: "section-num"
  }, "\xA7 13 / DESIGN + DOCS"), React.createElement("h2", {
    className: "section-title"
  }, "Design, devtool, and docs ports."), React.createElement("span", {
    className: "section-sub"
  }, "figma \xB7 sketch \xB7 insomnia \xB7 postman \xB7 httpie \xB7 tableplus \xB7 dbeaver \xB7 docs frameworks")), React.createElement("div", {
    className: "config-grid cli-grid"
  }, DESIGN_DOCS_TARGETS.map(target => React.createElement(CliConfigCard, {
    key: target.name,
    target: target
  })))), React.createElement("section", {
    className: "section",
    "data-shot": "window-managers"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("span", {
    className: "section-num"
  }, "\xA7 14 / WINDOW MANAGERS"), React.createElement("h2", {
    className: "section-title"
  }, "OS and window manager ports."), React.createElement("span", {
    className: "section-sub"
  }, "hyprland \xB7 sway \xB7 i3 \xB7 waybar \xB7 polybar \xB7 sketchybar \xB7 yabai \xB7 rofi \xB7 wofi")), React.createElement("div", {
    className: "config-grid cli-grid"
  }, WM_TARGETS.map(target => React.createElement(CliConfigCard, {
    key: target.name,
    target: target
  })))), shown.map((v, idx) => React.createElement("section", {
    key: v.id,
    className: `section ${v.mode === 'light' ? 'light-section' : ''}`
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("span", {
    className: "section-num"
  }, "\xA7 ", String(idx + 15).padStart(2, '0'), " / ", v.mode.toUpperCase()), React.createElement("h2", {
    className: "section-title"
  }, v.label), React.createElement("span", {
    className: "section-sub"
  }, v.sub)), React.createElement("div", {
    className: "pair"
  }, React.createElement(BzrEditor, {
    sample: sample,
    variant: v,
    limeRole: limeRole
  }), React.createElement(BzrStarshipTerminal, {
    variant: v
  })))), React.createElement("section", {
    className: "section",
    "data-shot": "shell-banner"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("span", {
    className: "section-num"
  }, "\xA7 20 / SHELL BANNER"), React.createElement("h2", {
    className: "section-title"
  }, "First shell of the day."), React.createElement("span", {
    className: "section-sub"
  }, "zsh \xB7 bash \xB7 fish \xB7 powershell")), React.createElement("div", {
    className: "banner-pane"
  }, WORDMARK.bizarre.map(line => React.createElement("div", {
    className: "bzr",
    key: line
  }, line)), React.createElement("div", null, "\xA0"), WORDMARK.industries.map(line => React.createElement("div", {
    className: "gray",
    key: line
  }, line)), React.createElement("div", null, "\xA0"), React.createElement("div", {
    className: "meta"
  }, "  BZR / SHELL / V0.2 / MAY 2026   ", React.createElement("span", {
    className: "star"
  }, "\u2726"), "   host: bench"), React.createElement("div", null, "\xA0"), React.createElement("div", {
    className: "quote"
  }, "  The hands knew it before the plan did."), React.createElement("div", null, "\xA0"), React.createElement("div", {
    className: "slogan"
  }, "  CATCH THE STARS."))), React.createElement("footer", {
    className: "foot"
  }, React.createElement("span", null, "BZR / THEMES / V0.2"), React.createElement("span", {
    className: "star-line"
  }), React.createElement("span", {
    className: "lime"
  }, "\u2726 CATCH THE STARS.")));
};
function App() {
  return React.createElement(window.BzrShowcase, null);
}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App, null));
