#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const palette = require('../palette.js');

const root = path.resolve(__dirname, '..');
const check = process.argv.includes('--check');
const dirty = [];

const ansiOrder = [
  ['black', 'black'],
  ['red', 'red'],
  ['green', 'green'],
  ['yellow', 'yellow'],
  ['blue', 'blue'],
  ['magenta', 'magenta'],
  ['cyan', 'cyan'],
  ['white', 'white'],
  ['brBlack', 'bright black'],
  ['brRed', 'bright red'],
  ['brGreen', 'bright green'],
  ['brYellow', 'bright yellow'],
  ['brBlue', 'bright blue'],
  ['brMagenta', 'bright magenta'],
  ['brCyan', 'bright cyan'],
  ['brWhite', 'bright white'],
];

const syntaxRoles = [
  ['pl', 'plain', 'plain', 'text'],
  ['p', 'punct', 'punctuation', '() , ;'],
  ['op', 'op', 'operator', '+ -> ?:'],
  ['kw-ctrl', 'kwCtrl', 'control', 'if/for/return'],
  ['kw-decl', 'kwDecl', 'declaration', 'const/fn/class'],
  ['kw-mod', 'kwMod', 'modifier', 'pub/async/static'],
  ['s', 'string', 'string', '"signal"'],
  ['tmpl', 'tmpl', 'template', '`x=${v}`'],
  ['esc', 'esc', 'escape', '${...} \\n'],
  ['rgx', 'rgx', 'regex', '/[a-z]+/'],
  ['n', 'num', 'number', '3.14'],
  ['bool', 'bool', 'bool/null', 'true/None'],
  ['const', 'constant', 'constant', 'MAX_INT'],
  ['t', 'type', 'type', 'Vec3'],
  ['tprim', 'tprim', 'primitive', 'u32'],
  ['f', 'fn', 'function', 'render()'],
  ['method', 'method', 'method', '.send()'],
  ['prop', 'prop', 'property', '.opts'],
  ['param', 'param', 'parameter', '(x, y)'],
  ['v', 'variable', 'variable', 'value'],
  ['this', 'self', 'self/this', 'self'],
  ['b', 'builtin', 'builtin', 'print'],
  ['ns', 'ns', 'namespace', 'std::io'],
  ['d', 'decorator', 'decorator', '@cache'],
  ['pre', 'pre', 'preprocessor', '#include'],
  ['c', 'comment', 'comment', '// note'],
  ['cdoc', 'docComment', 'doc-comment', '/** */'],
  ['tag', 'tag', 'jsx tag', '<div>'],
  ['attr', 'attr', 'jsx attr', 'className'],
];

const variants = palette.variantOrder.map((id) => ({ id, ...palette.variants[id] }));
const shellWordmark = {
  bizarre: [
    '██████╗ ██╗███████╗ █████╗ ██████╗ ██████╗ ███████╗',
    '██╔══██╗██║╚══███╔╝██╔══██╗██╔══██╗██╔══██╗██╔════╝',
    '██████╔╝██║  ███╔╝ ███████║██████╔╝██████╔╝█████╗  ',
    '██╔══██╗██║ ███╔╝  ██╔══██║██╔══██╗██╔══██╗██╔══╝  ',
    '██████╔╝██║███████╗██║  ██║██║  ██║██║  ██║███████╗',
    '╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝',
  ],
  industries: [
    '██╗███╗   ██╗██████╗ ██╗   ██╗███████╗████████╗██████╗ ██╗███████╗███████╗',
    '██║████╗  ██║██╔══██╗██║   ██║██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝██╔════╝',
    '██║██╔██╗ ██║██║  ██║██║   ██║███████╗   ██║   ██████╔╝██║█████╗  ███████╗',
    '██║██║╚██╗██║██║  ██║██║   ██║╚════██║   ██║   ██╔══██╗██║██╔══╝  ╚════██║',
    '██║██║ ╚████║██████╔╝╚██████╔╝███████║   ██║   ██║  ██║██║███████╗███████║',
    '╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝╚══════╝',
  ],
};

function out(file, content) {
  const full = path.join(root, file);
  const normalized = `${content.replace(/\s+$/u, '')}\n`;
  if (check) {
    const current = fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : null;
    if (current !== normalized) dirty.push(file);
    return;
  }
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, normalized);
}

function remove(file) {
  const full = path.join(root, file);
  if (check) {
    if (fs.existsSync(full)) dirty.push(file);
    return;
  }
  if (fs.existsSync(full)) fs.unlinkSync(full);
}

function maybeRemoveMemoryAgents() {
  const file = path.join(root, 'AGENTS.md');
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, 'utf8').trim();
  if (!/^<[^>]+-mem-context>/u.test(text) || !/<\/[^>]+-mem-context>$/u.test(text)) return;
  if (check) dirty.push('AGENTS.md');
  else fs.unlinkSync(file);
}

function q(value) {
  return JSON.stringify(value);
}

function noHash(hex) {
  return hex.replace(/^#/u, '');
}

function rgb(hex) {
  const raw = noHash(hex);
  return [0, 2, 4].map((i) => parseInt(raw.slice(i, i + 2), 16));
}

function ansiEsc(hex) {
  return `\\e[38;2;${rgb(hex).join(';')}m`;
}

function real(hex) {
  return (parseInt(hex, 16) / 255).toFixed(8);
}

function plistColor(hex) {
  const [r, g, b] = rgb(hex).map((n) => real(n.toString(16).padStart(2, '0')));
  return `\t<dict>
\t\t<key>Color Space</key><string>sRGB</string>
\t\t<key>Red Component</key><real>${r}</real>
\t\t<key>Green Component</key><real>${g}</real>
\t\t<key>Blue Component</key><real>${b}</real>
\t\t<key>Alpha Component</key><real>1</real>
\t</dict>`;
}

function xmlEscape(value) {
  return value.replace(/&/gu, '&amp;').replace(/"/gu, '&quot;').replace(/</gu, '&lt;').replace(/>/gu, '&gt;');
}

function titleSlug(id) {
  return `bizarre-${id}`;
}

function colorList(v) {
  return ansiOrder.map(([key]) => v.ansi[key]);
}

function fgFor(bg) {
  const [r, g, b] = rgb(bg).map((n) => n / 255);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.55 ? '#0E0E0E' : '#F9F8F2';
}

function vscodeTheme(v) {
  const s = v.syntax;
  const a = v.ansi;
  const hc = v.id === 'void-hicontrast';
  return {
    name: v.label,
    type: v.mode,
    semanticHighlighting: true,
    colors: {
      'editor.background': v.bg,
      'editor.foreground': v.fg,
      'editor.lineHighlightBackground': v.line,
      'editor.lineHighlightBorder': '#00000000',
      'editor.selectionBackground': v.sel,
      'editor.selectionHighlightBackground': `${v.sel}99`,
      'editor.inactiveSelectionBackground': v.bg2,
      'editor.findMatchBackground': `${v.accent}33`,
      'editor.findMatchBorder': v.accent,
      'editor.findMatchHighlightBackground': `${v.accent}22`,
      'editor.hoverHighlightBackground': v.bg2,
      'editor.rangeHighlightBackground': v.bg2,
      'editorCursor.foreground': v.cursor,
      'editorWhitespace.foreground': v.bg3,
      'editorIndentGuide.background1': v.bg3,
      'editorIndentGuide.activeBackground1': v.fgGhost,
      'editorRuler.foreground': v.bg3,
      'editorLineNumber.foreground': v.fgGhost,
      'editorLineNumber.activeForeground': v.accent,
      'editorBracketMatch.background': '#00000000',
      'editorBracketMatch.border': v.accent,
      'editorError.foreground': s.error,
      'editorWarning.foreground': s.warn,
      'editorInfo.foreground': s.info,
      'editorGutter.modifiedBackground': s.warn,
      'editorGutter.addedBackground': s.ok,
      'editorGutter.deletedBackground': s.error,
      'diffEditor.insertedTextBackground': `${s.ok}22`,
      'diffEditor.removedTextBackground': `${s.error}22`,
      'editorGroupHeader.tabsBackground': v.bg2,
      'editorGroupHeader.tabsBorder': v.border,
      'editorGroup.border': v.border,
      'tab.activeBackground': v.bg,
      'tab.activeForeground': v.fg,
      'tab.inactiveBackground': v.bg2,
      'tab.inactiveForeground': v.fgFaint,
      'tab.activeBorderTop': v.accent,
      'tab.border': v.border,
      'tab.hoverBackground': v.bg3,
      'activityBar.background': v.bg2,
      'activityBar.foreground': v.fgDim,
      'activityBar.inactiveForeground': v.fgGhost,
      'activityBar.border': v.border,
      'activityBar.activeBorder': v.accent,
      'activityBarBadge.background': v.accent,
      'activityBarBadge.foreground': fgFor(v.accent),
      'sideBar.background': v.bg2,
      'sideBar.foreground': v.fgDim,
      'sideBar.border': v.border,
      'sideBarTitle.foreground': v.fgDim,
      'sideBarSectionHeader.background': v.bg2,
      'sideBarSectionHeader.foreground': v.fgFaint,
      'sideBarSectionHeader.border': v.border,
      'list.activeSelectionBackground': v.bg3,
      'list.activeSelectionForeground': v.fg,
      'list.inactiveSelectionBackground': v.bg2,
      'list.inactiveSelectionForeground': v.fgDim,
      'list.hoverBackground': v.bg2,
      'list.focusBackground': v.bg3,
      'list.highlightForeground': v.accent,
      'statusBar.background': v.bg2,
      'statusBar.foreground': v.fgDim,
      'statusBar.border': v.border,
      'statusBar.debuggingBackground': s.warn,
      'statusBar.debuggingForeground': fgFor(s.warn),
      'statusBar.noFolderBackground': v.bg3,
      'statusBarItem.remoteBackground': v.accent,
      'statusBarItem.remoteForeground': fgFor(v.accent),
      'statusBarItem.hoverBackground': v.bg3,
      'titleBar.activeBackground': v.bg2,
      'titleBar.activeForeground': v.fgDim,
      'titleBar.inactiveBackground': v.bg2,
      'titleBar.inactiveForeground': v.fgGhost,
      'titleBar.border': v.border,
      'panel.background': v.bg,
      'panel.border': v.border,
      'panelTitle.activeBorder': v.accent,
      'panelTitle.activeForeground': v.fg,
      'panelTitle.inactiveForeground': v.fgFaint,
      'terminal.background': v.bg,
      'terminal.foreground': v.fg,
      'terminalCursor.background': v.bg,
      'terminalCursor.foreground': v.cursor,
      'terminal.selectionBackground': v.sel,
      'terminal.ansiBlack': a.black,
      'terminal.ansiRed': a.red,
      'terminal.ansiGreen': a.green,
      'terminal.ansiYellow': a.yellow,
      'terminal.ansiBlue': a.blue,
      'terminal.ansiMagenta': a.magenta,
      'terminal.ansiCyan': a.cyan,
      'terminal.ansiWhite': a.white,
      'terminal.ansiBrightBlack': a.brBlack,
      'terminal.ansiBrightRed': a.brRed,
      'terminal.ansiBrightGreen': a.brGreen,
      'terminal.ansiBrightYellow': a.brYellow,
      'terminal.ansiBrightBlue': a.brBlue,
      'terminal.ansiBrightMagenta': a.brMagenta,
      'terminal.ansiBrightCyan': a.brCyan,
      'terminal.ansiBrightWhite': a.brWhite,
      'input.background': v.bg2,
      'input.foreground': v.fg,
      'input.border': v.border,
      'input.placeholderForeground': v.fgGhost,
      'inputOption.activeBorder': v.accent,
      'inputValidation.errorBackground': `${s.error}33`,
      'inputValidation.errorBorder': s.error,
      'inputValidation.warningBackground': `${s.warn}33`,
      'inputValidation.warningBorder': s.warn,
      'inputValidation.infoBackground': `${s.info}33`,
      'inputValidation.infoBorder': s.info,
      'dropdown.background': v.bg2,
      'dropdown.foreground': v.fg,
      'dropdown.border': v.border,
      'button.background': v.accent,
      'button.foreground': fgFor(v.accent),
      'button.hoverBackground': v.accentSoft,
      'button.secondaryBackground': v.bg3,
      'button.secondaryForeground': v.fg,
      'badge.background': v.accent,
      'badge.foreground': fgFor(v.accent),
      'scrollbar.shadow': '#00000000',
      'scrollbarSlider.background': `${v.bg3}AA`,
      'scrollbarSlider.hoverBackground': `${v.fgGhost}AA`,
      'scrollbarSlider.activeBackground': `${v.accent}55`,
      'notifications.background': v.bg2,
      'notifications.foreground': v.fg,
      'notifications.border': v.border,
      'notificationLink.foreground': v.accent,
      'peekView.border': v.accent,
      'peekViewEditor.background': v.bg2,
      'peekViewResult.background': v.bg2,
      'peekViewTitle.background': v.bg2,
      'gitDecoration.modifiedResourceForeground': s.warn,
      'gitDecoration.deletedResourceForeground': s.error,
      'gitDecoration.untrackedResourceForeground': s.ok,
      'gitDecoration.ignoredResourceForeground': v.fgGhost,
      'gitDecoration.conflictingResourceForeground': s.error,
      'gitDecoration.addedResourceForeground': s.ok,
      'breadcrumb.background': v.bg,
      'breadcrumb.foreground': v.fgFaint,
      'breadcrumb.focusForeground': v.fg,
      'breadcrumb.activeSelectionForeground': v.accent,
      'menu.background': v.bg2,
      'menu.foreground': v.fg,
      'menu.selectionBackground': v.bg3,
      'menu.selectionForeground': v.fg,
      'menu.border': v.border,
      'pickerGroup.foreground': v.accent,
      'pickerGroup.border': v.border,
      'textLink.foreground': v.accent,
      'textLink.activeForeground': v.accentSoft,
      focusBorder: v.accent,
      foreground: v.fg,
      descriptionForeground: v.fgFaint,
      errorForeground: s.error,
      'icon.foreground': v.fgDim,
      'minimap.findMatchHighlight': v.accent,
      'minimap.errorHighlight': s.error,
      'minimap.warningHighlight': s.warn,
      'minimapSlider.background': `${v.bg3}88`,
      'minimapSlider.hoverBackground': `${v.fgGhost}88`,
      'minimapSlider.activeBackground': `${v.accent}55`,
    },
    tokenColors: textMateRules(s),
    semanticTokenColors: semanticRules(s),
    $schema: 'vscode://schemas/color-theme',
    ...(hc ? { highContrast: true } : {}),
  };
}

function textMateRules(s) {
  return [
    rule('Comment', ['comment', 'punctuation.definition.comment', 'string.comment'], s.comment, 'italic'),
    rule('Documentation', ['comment.block.documentation'], s.docComment, 'italic'),
    rule('Variables', ['variable', 'support.variable', 'meta.definition.variable'], s.variable),
    rule('Parameters', ['variable.parameter'], s.param, 'italic'),
    rule('Properties', ['variable.other.property', 'support.variable.property'], s.prop),
    rule('Self', ['variable.language', 'variable.language.this', 'variable.language.self'], s.self, 'italic'),
    rule('Keywords control', ['keyword.control', 'keyword.operator.expression'], s.kwCtrl),
    rule('Keywords declaration', ['storage.type', 'storage.modifier', 'keyword.declaration'], s.kwDecl),
    rule('Keywords modifier', ['storage.modifier.async', 'storage.modifier.static'], s.kwMod, 'italic'),
    rule('Operators', ['keyword.operator', 'punctuation.separator'], s.op),
    rule('Punctuation', ['punctuation', 'meta.brace'], s.punct),
    rule('Strings', ['string', 'punctuation.definition.string'], s.string),
    rule('Templates', ['string.template', 'punctuation.definition.template-expression'], s.tmpl),
    rule('Escapes', ['constant.character.escape', 'constant.other.placeholder'], s.esc, 'bold'),
    rule('Regex', ['string.regexp'], s.rgx, 'italic'),
    rule('Numbers', ['constant.numeric'], s.num),
    rule('Booleans', ['constant.language.boolean', 'constant.language.null'], s.bool, 'bold'),
    rule('Constants', ['constant', 'variable.other.constant'], s.constant, 'bold'),
    rule('Types', ['entity.name.type', 'support.type', 'entity.name.class', 'entity.name.struct'], s.type),
    rule('Primitive types', ['support.type.primitive'], s.tprim, 'italic'),
    rule('Functions', ['entity.name.function', 'support.function', 'meta.function-call'], s.fn),
    rule('Methods', ['entity.name.function.member', 'support.function.method'], s.method),
    rule('Builtins', ['support.constant', 'support.class', 'support.type.builtin'], s.builtin),
    rule('Namespaces', ['entity.name.namespace', 'support.module'], s.ns),
    rule('Decorators', ['meta.decorator', 'entity.name.function.decorator'], s.decorator, 'italic'),
    rule('Preprocessor', ['meta.preprocessor', 'keyword.control.directive'], s.pre),
    rule('Tags', ['entity.name.tag'], s.tag),
    rule('Attributes', ['entity.other.attribute-name'], s.attr),
    rule('Invalid', ['invalid', 'invalid.illegal'], s.error, 'bold'),
    rule('Markup heading', ['markup.heading'], s.fn, 'bold'),
    rule('Markup link', ['markup.underline.link'], s.info, 'underline'),
    rule('Markup bold', ['markup.bold'], s.plain, 'bold'),
    rule('Markup italic', ['markup.italic'], s.plain, 'italic'),
    rule('Diff inserted', ['markup.inserted'], s.ok),
    rule('Diff deleted', ['markup.deleted'], s.error),
    rule('Diff changed', ['markup.changed'], s.warn),
  ];
}

function rule(name, scope, foreground, fontStyle) {
  return { name, scope, settings: { foreground, ...(fontStyle ? { fontStyle } : {}) } };
}

function semanticRules(s) {
  return {
    variable: s.variable,
    parameter: { foreground: s.param, italic: true },
    property: s.prop,
    function: s.fn,
    method: s.method,
    class: s.type,
    struct: s.type,
    interface: s.type,
    enum: s.type,
    enumMember: s.constant,
    type: s.type,
    typeParameter: { foreground: s.type, italic: true },
    namespace: s.ns,
    keyword: s.kwCtrl,
    string: s.string,
    number: s.num,
    regexp: { foreground: s.rgx, italic: true },
    decorator: { foreground: s.decorator, italic: true },
    comment: { foreground: s.comment, italic: true },
  };
}

function generateVSCode() {
  out('editors/vscode/package.json', JSON.stringify({
    name: 'bizarre-themes',
    displayName: 'Bizarre Industries',
    description: 'CATCH THE STARS. Editor themes for people already doing the work.',
    version: '0.2.0',
    publisher: 'bizarre-industries',
    engines: { vscode: '^1.70.0' },
    categories: ['Themes'],
    contributes: {
      themes: variants.map((v) => ({
        label: v.label,
        uiTheme: v.id === 'void-hicontrast' ? 'hc-black' : v.mode === 'dark' ? 'vs-dark' : 'vs',
        path: `./themes/${titleSlug(v.id)}-color-theme.json`,
      })),
    },
  }, null, 2));

  for (const v of variants) {
    out(`editors/vscode/themes/${titleSlug(v.id)}-color-theme.json`, JSON.stringify(vscodeTheme(v), null, 2));
  }
  out('editors/vscode/themes/bizarre-color-theme.json', JSON.stringify(vscodeTheme(variants[0]), null, 2));
}

function zedTheme(v) {
  const s = v.syntax;
  return {
    name: v.label,
    appearance: v.mode,
    style: {
      background: v.bg,
      'background.appearance': 'opaque',
      'editor.background': v.bg,
      'editor.foreground': v.fg,
      'editor.gutter.background': v.bg,
      'editor.subheader.background': v.bg2,
      'editor.active_line.background': v.line,
      'editor.highlighted_line.background': v.line,
      'editor.line_number': v.fgGhost,
      'editor.active_line_number': v.accent,
      'editor.invisible': v.bg3,
      'editor.wrap_guide': v.bg3,
      'editor.active_wrap_guide': v.fgGhost,
      border: v.border,
      'border.variant': v.bg2,
      'border.focused': v.accent,
      'border.selected': v.accent,
      'border.transparent': '#00000000',
      'elevated_surface.background': v.bg2,
      'surface.background': v.bg,
      'panel.background': v.bg2,
      'panel.focused_border': v.accent,
      'pane.focused_border': v.accent,
      'scrollbar.thumb.background': `${v.bg3}AA`,
      'scrollbar.thumb.hover_background': `${v.fgGhost}AA`,
      'scrollbar.thumb.border': '#00000000',
      'status_bar.background': v.bg2,
      'title_bar.background': v.bg2,
      'title_bar.inactive_background': v.bg2,
      'toolbar.background': v.bg,
      'tab_bar.background': v.bg2,
      'tab.inactive_background': v.bg2,
      'tab.active_background': v.bg,
      'search.match_background': `${v.accent}33`,
      text: v.fg,
      'text.muted': v.fgFaint,
      'text.placeholder': v.fgGhost,
      'text.disabled': v.fgGhost,
      'text.accent': v.accent,
      icon: v.fgDim,
      'icon.muted': v.fgFaint,
      'icon.disabled': v.fgGhost,
      'icon.accent': v.accent,
      'element.background': v.bg2,
      'element.hover': v.bg3,
      'element.active': v.bg3,
      'element.selected': v.bg3,
      'drop_target.background': `${v.accent}33`,
      cursor: v.cursor,
      players: [
        { cursor: v.accent, selection: v.sel, background: v.accent },
        { cursor: s.info, selection: `${s.info}33`, background: s.info },
        { cursor: s.hint, selection: `${s.hint}33`, background: s.hint },
      ],
      conflict: s.error,
      created: s.ok,
      deleted: s.error,
      error: s.error,
      hidden: v.fgGhost,
      hint: s.hint,
      ignored: v.fgGhost,
      info: s.info,
      modified: s.warn,
      predictive: v.fgFaint,
      renamed: s.warn,
      success: s.ok,
      unreachable: v.fgGhost,
      warning: s.warn,
      syntax: {
        attribute: { color: s.attr, font_style: 'italic' },
        boolean: { color: s.bool },
        comment: { color: s.comment, font_style: 'italic' },
        'comment.doc': { color: s.docComment, font_style: 'italic' },
        constant: { color: s.constant },
        constructor: { color: s.type },
        embedded: { color: s.plain },
        emphasis: { color: s.plain, font_style: 'italic' },
        'emphasis.strong': { color: s.plain, font_weight: 700 },
        enum: { color: s.type },
        function: { color: s.fn },
        hint: { color: v.fgFaint },
        keyword: { color: s.kwCtrl },
        label: { color: s.kwMod, font_style: 'italic' },
        link_text: { color: s.info, font_style: 'italic' },
        link_uri: { color: s.info },
        number: { color: s.num },
        operator: { color: s.op },
        predictive: { color: v.fgFaint, font_style: 'italic' },
        preproc: { color: s.pre },
        primary: { color: s.plain },
        property: { color: s.prop },
        punctuation: { color: s.punct },
        'punctuation.bracket': { color: v.fgDim },
        'punctuation.delimiter': { color: s.punct },
        string: { color: s.string },
        'string.escape': { color: s.esc },
        'string.regex': { color: s.rgx, font_style: 'italic' },
        'string.special': { color: s.tmpl },
        tag: { color: s.tag },
        'text.literal': { color: s.rgx },
        title: { color: s.fn, font_weight: 700 },
        type: { color: s.type },
        'type.builtin': { color: s.tprim, font_style: 'italic' },
        variable: { color: s.variable },
        variant: { color: s.constant },
      },
      terminal: {
        background: v.bg,
        foreground: v.fg,
        bright_foreground: v.ansi.brWhite,
        dim_foreground: v.fgFaint,
        ansi: colorList(v),
      },
    },
  };
}

function generateZed() {
  out('editors/zed/themes/bizarre.json', JSON.stringify({
    $schema: 'https://zed.dev/schema/themes/v0.2.0.json',
    name: 'Bizarre Industries',
    author: 'bizarre-industries',
    themes: variants.map(zedTheme),
  }, null, 2));
}

function sublimeScheme(v) {
  const s = v.syntax;
  return {
    name: v.label,
    author: 'Bizarre Industries',
    variables: {
      background: v.bg,
      foreground: v.fg,
      caret: v.cursor,
      accent: v.accent,
      selection: v.sel,
      line: v.line,
      border: v.border,
    },
    globals: {
      background: 'var(background)',
      foreground: 'var(foreground)',
      caret: 'var(caret)',
      selection: 'var(selection)',
      line_highlight: 'var(line)',
      gutter: 'var(background)',
      gutter_foreground: v.fgGhost,
      invisibles: v.bg3,
      accent: 'var(accent)',
    },
    rules: [
      subRule('Comment', 'comment', s.comment, 'italic'),
      subRule('Doc Comment', 'comment.block.documentation', s.docComment, 'italic'),
      subRule('String', 'string', s.string),
      subRule('Template', 'string.template', s.tmpl),
      subRule('Escape', 'constant.character.escape', s.esc, 'bold'),
      subRule('Regex', 'string.regexp', s.rgx, 'italic'),
      subRule('Number', 'constant.numeric', s.num),
      subRule('Bool', 'constant.language.boolean, constant.language.null', s.bool, 'bold'),
      subRule('Constant', 'constant, variable.other.constant, entity.name.constant', s.constant, 'bold'),
      subRule('Keyword control', 'keyword.control', s.kwCtrl),
      subRule('Keyword decl', 'storage.type, keyword.declaration', s.kwDecl),
      subRule('Modifier', 'storage.modifier', s.kwMod, 'italic'),
      subRule('Operator', 'keyword.operator', s.op),
      subRule('Punctuation', 'punctuation', s.punct),
      subRule('Function', 'entity.name.function, support.function', s.fn),
      subRule('Method', 'meta.function-call entity.name.function, entity.name.function.member, variable.function', s.method),
      subRule('Type', 'entity.name.type, entity.name.class, support.type, support.class', s.type),
      subRule('Primitive', 'storage.type.primitive, support.type.primitive', s.tprim, 'italic'),
      subRule('Property', 'variable.other.property, variable.other.object.property', s.prop),
      subRule('Parameter', 'variable.parameter', s.param, 'italic'),
      subRule('Namespace', 'entity.name.namespace', s.ns),
      subRule('Self/this', 'variable.language.this, variable.language.self', s.self, 'italic'),
      subRule('Decorator', 'meta.decorator, punctuation.decorator', s.decorator, 'italic'),
      subRule('Preprocessor', 'meta.preprocessor, keyword.other.preprocessor', s.pre),
      subRule('Tag', 'entity.name.tag, meta.tag', s.tag),
      subRule('Attribute', 'entity.other.attribute-name', s.attr),
      subRule('Markup heading', 'markup.heading', v.accent, 'bold'),
      subRule('Inserted', 'markup.inserted', s.ok),
      subRule('Deleted', 'markup.deleted', s.error),
      subRule('Changed', 'markup.changed', s.warn),
      subRule('Invalid', 'invalid', s.error, 'bold'),
    ],
  };
}

function subRule(name, scope, foreground, font_style) {
  return { name, scope, foreground, ...(font_style ? { font_style } : {}) };
}

function generateSublime() {
  for (const v of variants) {
    out(`editors/sublime/${titleSlug(v.id)}.sublime-color-scheme`, JSON.stringify(sublimeScheme(v), null, 2));
  }
}

function luaPalette(v) {
  const s = v.syntax;
  const term = colorList(v).map((hex, i) => `[${i}] = '${hex}'`).join(', ');
  return `-- Palette: ${titleSlug(v.id)}
return {
  mode = '${v.mode}',
  bg = '${v.bg}', bg2 = '${v.bg2}', bg3 = '${v.bg3}', bg4 = '${v.bg4}', border = '${v.border}',
  fg = '${v.fg}', fg2 = '${v.fgDim}', fg3 = '${v.fgFaint}', fg4 = '${v.fgGhost}',
  accent = '${v.accent}', accent2 = '${v.accentSoft}',
  keyword = '${s.kwCtrl}', string = '${s.string}', number = '${s.num}',
  func = '${s.fn}', type = '${s.type}', constant = '${s.constant}',
  regex = '${s.rgx}', comment = '${s.comment}',
  danger = '${s.error}', warn = '${s.warn}', success = '${s.ok}', info = '${s.info}',
  selBg = '${v.sel}', lineHL = '${v.line}',
  term = { ${term} },
}`;
}

function vimColors(v) {
  const p = {
    bg: v.bg, bg2: v.bg2, bg3: v.bg3, border: v.border, fg: v.fg, fg2: v.fgDim, fg3: v.fgFaint,
    fg4: v.fgGhost, accent: v.accent, accent2: v.accentSoft, selBg: v.sel, lineHL: v.line,
    ...v.syntax,
  };
  const calls = [
    ['Normal', p.plain, p.bg, ''],
    ['NormalNC', p.plain, p.bg, ''],
    ['CursorLine', '', p.lineHL, ''],
    ['CursorLineNr', p.accent, p.bg, 'bold'],
    ['LineNr', p.fg4, p.bg, ''],
    ['SignColumn', '', p.bg, ''],
    ['Visual', '', p.selBg, ''],
    ['Search', fgFor(p.accent), p.accent, ''],
    ['IncSearch', fgFor(p.accent2), p.accent2, 'bold'],
    ['CurSearch', fgFor(p.accent2), p.accent2, 'bold'],
    ['MatchParen', p.accent, '', 'bold,underline'],
    ['Pmenu', p.fg, p.bg2, ''],
    ['PmenuSel', fgFor(p.accent), p.accent, 'bold'],
    ['PmenuSbar', '', p.bg3, ''],
    ['PmenuThumb', '', p.fg4, ''],
    ['StatusLine', p.fg, p.bg2, ''],
    ['StatusLineNC', p.fg3, p.bg2, ''],
    ['TabLine', p.fg3, p.bg2, ''],
    ['TabLineFill', '', p.bg2, ''],
    ['TabLineSel', fgFor(p.accent), p.accent, 'bold'],
    ['VertSplit', p.border, p.bg, ''],
    ['Folded', p.fg3, p.bg2, ''],
    ['FoldColumn', p.fg4, p.bg, ''],
    ['SpecialKey', p.bg3, '', ''],
    ['NonText', p.bg3, '', ''],
    ['Whitespace', p.bg3, '', ''],
    ['EndOfBuffer', p.bg, p.bg, ''],
    ['Title', p.accent, '', 'bold'],
    ['Directory', p.info, '', 'bold'],
    ['ErrorMsg', p.error, '', 'bold'],
    ['WarningMsg', p.warn, '', ''],
    ['Question', p.accent, '', ''],
    ['ModeMsg', p.fg, '', 'bold'],
    ['MoreMsg', p.ok, '', ''],
    ['WildMenu', fgFor(p.accent), p.accent, ''],
    ['Cursor', fgFor(p.accent), p.accent, ''],
    ['lCursor', fgFor(p.accent), p.accent, ''],
    ['Comment', p.comment, '', 'italic'],
    ['Constant', p.constant, '', ''],
    ['String', p.string, '', ''],
    ['Character', p.string, '', ''],
    ['Number', p.num, '', ''],
    ['Boolean', p.bool, '', ''],
    ['Float', p.num, '', ''],
    ['Identifier', p.variable, '', ''],
    ['Function', p.fn, '', ''],
    ['Statement', p.kwCtrl, '', ''],
    ['Conditional', p.kwCtrl, '', ''],
    ['Repeat', p.kwCtrl, '', ''],
    ['Label', p.kwCtrl, '', ''],
    ['Operator', p.op, '', ''],
    ['Keyword', p.kwDecl, '', ''],
    ['Exception', p.error, '', ''],
    ['PreProc', p.pre, '', ''],
    ['Include', p.kwMod, '', 'italic'],
    ['Define', p.kwMod, '', 'italic'],
    ['Macro', p.pre, '', 'italic'],
    ['Type', p.type, '', ''],
    ['StorageClass', p.kwMod, '', 'italic'],
    ['Structure', p.type, '', ''],
    ['Typedef', p.type, '', 'italic'],
    ['Special', p.rgx, '', ''],
    ['SpecialChar', p.rgx, '', ''],
    ['Tag', p.tag, '', ''],
    ['Delimiter', p.punct, '', ''],
    ['Underlined', p.info, '', 'underline'],
    ['Error', p.error, '', 'bold'],
    ['Todo', fgFor(p.accent), p.accent, 'bold'],
    ['DiffAdd', p.ok, p.bg, ''],
    ['DiffChange', p.warn, p.bg, ''],
    ['DiffDelete', p.error, p.bg, ''],
    ['DiffText', p.fg, p.bg2, 'bold'],
  ].map(([group, fg, bg, attr]) => `call s:H('${group}', '${fg}', '${bg}', '${attr}')`).join('\n');
  return `" ${v.label} - Bizarre Industries
" CATCH THE STARS.
" Vim colorscheme - works in Neovim compat mode and Vim 8+

set background=${v.mode}
hi clear
if exists("syntax_on") | syntax reset | endif
let g:colors_name = "${titleSlug(v.id)}"
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

${calls}

" CATCH THE STARS.`;
}

function generateVimNeovim() {
  for (const v of variants) {
    out(`editors/neovim/lua/bizarre/palettes/${v.id}.lua`, luaPalette(v));
    out(`editors/neovim/colors/${titleSlug(v.id)}.vim`, `" ${titleSlug(v.id)} - Bizarre Industries\nlua require('bizarre').load('${titleSlug(v.id)}')`);
    out(`editors/vim/colors/${titleSlug(v.id)}.vim`, vimColors(v));
  }
  out('editors/neovim/lua/bizarre/init.lua', neovimInit());
  out('editors/neovim/lua/bizarre/highlights.lua', neovimHighlights());
  out('editors/neovim/lua/bizarre/terminal.lua', neovimTerminal());
}

function neovimInit() {
  const variantLines = variants.map((v) => `  ['${titleSlug(v.id)}']${' '.repeat(Math.max(1, 22 - titleSlug(v.id).length))}= require('bizarre.palettes.${v.id}'),`).join('\n');
  return `-- Bizarre Industries - Neovim colorscheme
-- CATCH THE STARS.
local M = {}

M.variants = {
${variantLines}
}

function M.load(name)
  name = name or 'bizarre-void'
  local p = M.variants[name]
  if not p then
    vim.notify('[bizarre] unknown variant: ' .. tostring(name), vim.log.levels.ERROR)
    return
  end
  if vim.g.colors_name then vim.cmd('hi clear') end
  if vim.fn.exists('syntax_on') then vim.cmd('syntax reset') end
  vim.o.termguicolors = true
  vim.o.background = p.mode
  vim.g.colors_name = name
  require('bizarre.highlights').apply(p)
  require('bizarre.terminal').apply(p)
end

return M`;
}

function neovimTerminal() {
  return `-- Bizarre Industries - terminal ANSI colors
local M = {}

function M.apply(p)
  for i = 0, 15 do
    vim.g['terminal_color_' .. i] = p.term[i]
  end
end

return M`;
}

function neovimHighlights() {
  return `-- Bizarre Industries - highlight groups
local M = {}

local function set(groups)
  for group, spec in pairs(groups) do
    vim.api.nvim_set_hl(0, group, spec)
  end
end

function M.apply(p)
  set({
    Normal = { fg = p.fg, bg = p.bg },
    NormalFloat = { fg = p.fg, bg = p.bg2 },
    NormalNC = { fg = p.fg, bg = p.bg },
    FloatBorder = { fg = p.border, bg = p.bg2 },
    FloatTitle = { fg = p.accent, bg = p.bg2, bold = true },
    SignColumn = { bg = p.bg },
    LineNr = { fg = p.fg4 },
    CursorLineNr = { fg = p.accent, bold = true },
    CursorLine = { bg = p.lineHL },
    CursorColumn = { bg = p.lineHL },
    ColorColumn = { bg = p.bg2 },
    Cursor = { fg = p.bg, bg = p.accent },
    lCursor = { fg = p.bg, bg = p.accent },
    TermCursor = { fg = p.bg, bg = p.accent },
    Visual = { bg = p.selBg },
    VisualNOS = { bg = p.selBg },
    Search = { fg = p.bg, bg = p.accent },
    IncSearch = { fg = p.bg, bg = p.accent2, bold = true },
    CurSearch = { fg = p.bg, bg = p.accent2, bold = true },
    Substitute = { fg = p.bg, bg = p.warn },
    MatchParen = { fg = p.accent, bold = true, underline = true },
    NonText = { fg = p.bg3 },
    Whitespace = { fg = p.bg3 },
    SpecialKey = { fg = p.bg3 },
    Conceal = { fg = p.fg3 },
    EndOfBuffer = { fg = p.bg },
    Folded = { fg = p.fg3, bg = p.bg2 },
    FoldColumn = { fg = p.fg4, bg = p.bg },
    VertSplit = { fg = p.border, bg = p.bg },
    WinSeparator = { fg = p.border, bg = p.bg },

    Pmenu = { fg = p.fg, bg = p.bg2 },
    PmenuSel = { fg = p.bg, bg = p.accent, bold = true },
    PmenuSbar = { bg = p.bg3 },
    PmenuThumb = { bg = p.fg4 },
    PmenuKind = { fg = p.type, bg = p.bg2 },
    PmenuKindSel = { fg = p.bg, bg = p.accent, bold = true },
    PmenuExtra = { fg = p.fg3, bg = p.bg2 },
    PmenuExtraSel = { fg = p.bg, bg = p.accent },
    WildMenu = { fg = p.bg, bg = p.accent },
    Question = { fg = p.accent },
    MoreMsg = { fg = p.success },
    ModeMsg = { fg = p.fg, bold = true },
    ErrorMsg = { fg = p.danger, bold = true },
    WarningMsg = { fg = p.warn },
    Title = { fg = p.accent, bold = true },
    Directory = { fg = p.type, bold = true },

    StatusLine = { fg = p.fg, bg = p.bg2 },
    StatusLineNC = { fg = p.fg3, bg = p.bg2 },
    TabLine = { fg = p.fg3, bg = p.bg2 },
    TabLineFill = { bg = p.bg2 },
    TabLineSel = { fg = p.bg, bg = p.accent, bold = true },
    WinBar = { fg = p.fg2, bg = p.bg },
    WinBarNC = { fg = p.fg3, bg = p.bg },

    DiffAdd = { fg = p.success, bg = p.bg },
    DiffChange = { fg = p.warn, bg = p.bg },
    DiffDelete = { fg = p.danger, bg = p.bg },
    DiffText = { fg = p.fg, bg = p.bg2, bold = true },

    SpellBad = { sp = p.danger, undercurl = true },
    SpellCap = { sp = p.warn, undercurl = true },
    SpellLocal = { sp = p.info, undercurl = true },
    SpellRare = { sp = p.constant, undercurl = true },

    Comment = { fg = p.comment, italic = true },
    SpecialComment = { fg = p.fg3, italic = true },
    Constant = { fg = p.constant },
    String = { fg = p.string },
    Character = { fg = p.string },
    Number = { fg = p.number },
    Boolean = { fg = p.number },
    Float = { fg = p.number },
    Identifier = { fg = p.fg },
    Function = { fg = p.func },
    Statement = { fg = p.keyword },
    Conditional = { fg = p.keyword },
    Repeat = { fg = p.keyword },
    Label = { fg = p.keyword },
    Operator = { fg = p.fg3 },
    Keyword = { fg = p.keyword },
    Exception = { fg = p.danger },
    PreProc = { fg = p.constant },
    Include = { fg = p.keyword, italic = true },
    Define = { fg = p.keyword, italic = true },
    Macro = { fg = p.constant, italic = true },
    PreCondit = { fg = p.constant },
    Type = { fg = p.type },
    StorageClass = { fg = p.keyword, italic = true },
    Structure = { fg = p.type },
    Typedef = { fg = p.type, italic = true },
    Special = { fg = p.regex },
    SpecialChar = { fg = p.regex },
    Tag = { fg = p.type },
    Delimiter = { fg = p.fg3 },
    Debug = { fg = p.warn },
    Underlined = { fg = p.info, underline = true },
    Ignore = { fg = p.fg4 },
    Error = { fg = p.danger, bold = true },
    Todo = { fg = p.bg, bg = p.accent, bold = true },

    ['@variable'] = { fg = p.fg },
    ['@variable.builtin'] = { fg = p.constant, italic = true },
    ['@variable.parameter'] = { fg = p.fg },
    ['@variable.member'] = { fg = p.fg },
    ['@constant'] = { fg = p.constant },
    ['@constant.builtin'] = { fg = p.constant },
    ['@constant.macro'] = { fg = p.constant, italic = true },
    ['@module'] = { fg = p.type },
    ['@label'] = { fg = p.keyword },
    ['@string'] = { fg = p.string },
    ['@string.escape'] = { fg = p.regex },
    ['@string.regexp'] = { fg = p.regex },
    ['@string.special'] = { fg = p.regex },
    ['@character'] = { fg = p.string },
    ['@character.special'] = { fg = p.regex },
    ['@number'] = { fg = p.number },
    ['@boolean'] = { fg = p.number },
    ['@float'] = { fg = p.number },
    ['@function'] = { fg = p.func },
    ['@function.builtin'] = { fg = p.func, italic = true },
    ['@function.call'] = { fg = p.func },
    ['@function.macro'] = { fg = p.constant, italic = true },
    ['@function.method'] = { fg = p.func },
    ['@function.method.call'] = { fg = p.func },
    ['@constructor'] = { fg = p.type },
    ['@operator'] = { fg = p.fg3 },
    ['@keyword'] = { fg = p.keyword },
    ['@keyword.function'] = { fg = p.keyword, italic = true },
    ['@keyword.operator'] = { fg = p.keyword },
    ['@keyword.return'] = { fg = p.keyword, italic = true },
    ['@keyword.import'] = { fg = p.keyword, italic = true },
    ['@keyword.exception'] = { fg = p.danger },
    ['@keyword.conditional'] = { fg = p.keyword },
    ['@keyword.repeat'] = { fg = p.keyword },
    ['@keyword.coroutine'] = { fg = p.keyword, italic = true },
    ['@type'] = { fg = p.type },
    ['@type.builtin'] = { fg = p.type, italic = true },
    ['@type.definition'] = { fg = p.type },
    ['@attribute'] = { fg = p.constant, italic = true },
    ['@property'] = { fg = p.fg },
    ['@punctuation'] = { fg = p.fg3 },
    ['@punctuation.delimiter'] = { fg = p.fg3 },
    ['@punctuation.bracket'] = { fg = p.fg2 },
    ['@punctuation.special'] = { fg = p.keyword },
    ['@comment'] = { fg = p.comment, italic = true },
    ['@comment.todo'] = { fg = p.bg, bg = p.accent, bold = true },
    ['@comment.note'] = { fg = p.bg, bg = p.info, bold = true },
    ['@comment.warning'] = { fg = p.bg, bg = p.warn, bold = true },
    ['@comment.error'] = { fg = p.bg, bg = p.danger, bold = true },
    ['@tag'] = { fg = p.type },
    ['@tag.attribute'] = { fg = p.number, italic = true },
    ['@tag.delimiter'] = { fg = p.fg3 },
    ['@markup.heading'] = { fg = p.func, bold = true },
    ['@markup.strong'] = { fg = p.fg, bold = true },
    ['@markup.italic'] = { fg = p.fg, italic = true },
    ['@markup.strikethrough'] = { fg = p.fg3, strikethrough = true },
    ['@markup.underline'] = { fg = p.fg, underline = true },
    ['@markup.quote'] = { fg = p.fg3, italic = true },
    ['@markup.math'] = { fg = p.regex },
    ['@markup.link'] = { fg = p.info, underline = true },
    ['@markup.link.label'] = { fg = p.info },
    ['@markup.link.url'] = { fg = p.info, underline = true },
    ['@markup.raw'] = { fg = p.regex },
    ['@markup.raw.block'] = { fg = p.regex, bg = p.bg2 },
    ['@markup.list'] = { fg = p.keyword },
    ['@markup.list.checked'] = { fg = p.success },
    ['@markup.list.unchecked'] = { fg = p.fg3 },
    ['@diff.plus'] = { fg = p.success },
    ['@diff.minus'] = { fg = p.danger },
    ['@diff.delta'] = { fg = p.warn },

    ['@lsp.type.class'] = { fg = p.type },
    ['@lsp.type.decorator'] = { fg = p.constant, italic = true },
    ['@lsp.type.enum'] = { fg = p.type },
    ['@lsp.type.enumMember'] = { fg = p.constant },
    ['@lsp.type.function'] = { fg = p.func },
    ['@lsp.type.interface'] = { fg = p.type },
    ['@lsp.type.macro'] = { fg = p.constant, italic = true },
    ['@lsp.type.method'] = { fg = p.func },
    ['@lsp.type.namespace'] = { fg = p.type },
    ['@lsp.type.parameter'] = { fg = p.fg },
    ['@lsp.type.property'] = { fg = p.fg },
    ['@lsp.type.struct'] = { fg = p.type },
    ['@lsp.type.type'] = { fg = p.type },
    ['@lsp.type.typeParameter'] = { fg = p.type, italic = true },
    ['@lsp.type.variable'] = { fg = p.fg },
    ['@lsp.mod.readonly'] = { fg = p.constant },
    ['@lsp.mod.deprecated'] = { fg = p.fg3, strikethrough = true },

    DiagnosticError = { fg = p.danger },
    DiagnosticWarn = { fg = p.warn },
    DiagnosticInfo = { fg = p.info },
    DiagnosticHint = { fg = p.accent },
    DiagnosticOk = { fg = p.success },
    DiagnosticVirtualTextError = { fg = p.danger, bg = p.bg2 },
    DiagnosticVirtualTextWarn = { fg = p.warn, bg = p.bg2 },
    DiagnosticVirtualTextInfo = { fg = p.info, bg = p.bg2 },
    DiagnosticVirtualTextHint = { fg = p.accent, bg = p.bg2 },
    DiagnosticUnderlineError = { sp = p.danger, undercurl = true },
    DiagnosticUnderlineWarn = { sp = p.warn, undercurl = true },
    DiagnosticUnderlineInfo = { sp = p.info, undercurl = true },
    DiagnosticUnderlineHint = { sp = p.accent, undercurl = true },

    GitSignsAdd = { fg = p.success },
    GitSignsChange = { fg = p.warn },
    GitSignsDelete = { fg = p.danger },
    GitSignsAddNr = { fg = p.success },
    GitSignsChangeNr = { fg = p.warn },
    GitSignsDeleteNr = { fg = p.danger },

    TelescopeBorder = { fg = p.border, bg = p.bg2 },
    TelescopePromptBorder = { fg = p.accent, bg = p.bg2 },
    TelescopePromptTitle = { fg = p.bg, bg = p.accent, bold = true },
    TelescopePreviewTitle = { fg = p.bg, bg = p.type, bold = true },
    TelescopeResultsTitle = { fg = p.fg2, bg = p.bg2 },
    TelescopeNormal = { fg = p.fg, bg = p.bg2 },
    TelescopeMatching = { fg = p.accent, bold = true },
    TelescopeSelection = { fg = p.fg, bg = p.bg3, bold = true },

    NvimTreeNormal = { fg = p.fg2, bg = p.bg2 },
    NvimTreeRootFolder = { fg = p.accent, bold = true },
    NvimTreeFolderName = { fg = p.fg },
    NvimTreeOpenedFolderName = { fg = p.fg, bold = true },
    NvimTreeFolderIcon = { fg = p.warn },
    NvimTreeIndentMarker = { fg = p.bg3 },
    NvimTreeGitDirty = { fg = p.warn },
    NvimTreeGitNew = { fg = p.success },
    NvimTreeGitDeleted = { fg = p.danger },

    CmpItemAbbrMatch = { fg = p.accent, bold = true },
    CmpItemAbbrMatchFuzzy = { fg = p.accent2, bold = true },
    CmpItemAbbrDeprecated = { fg = p.fg4, strikethrough = true },
    CmpItemKindFunction = { fg = p.func },
    CmpItemKindMethod = { fg = p.func },
    CmpItemKindClass = { fg = p.type },
    CmpItemKindInterface = { fg = p.type },
    CmpItemKindKeyword = { fg = p.keyword },
    CmpItemKindVariable = { fg = p.fg },
    CmpItemKindConstant = { fg = p.constant },
    CmpItemKindSnippet = { fg = p.regex },
    CmpItemKindText = { fg = p.string },
    CmpItemKindModule = { fg = p.type },
    CmpItemKindFile = { fg = p.fg },
    CmpItemKindFolder = { fg = p.warn },

    IblIndent = { fg = p.bg3 },
    IblScope = { fg = p.fg4 },

    NotifyERRORBorder = { fg = p.danger },
    NotifyWARNBorder = { fg = p.warn },
    NotifyINFOBorder = { fg = p.info },
    NotifyDEBUGBorder = { fg = p.fg3 },
    NotifyTRACEBorder = { fg = p.constant },
    NotifyERRORTitle = { fg = p.danger, bold = true },
    NotifyWARNTitle = { fg = p.warn, bold = true },
    NotifyINFOTitle = { fg = p.info, bold = true },
  })
end

return M`;
}

function base16(v) {
  const s = v.syntax;
  return `scheme: "${v.label}"
author: "Bizarre Industries"
base00: "${noHash(v.bg)}"
base01: "${noHash(v.bg2)}"
base02: "${noHash(v.bg3)}"
base03: "${noHash(v.fgGhost)}"
base04: "${noHash(v.fgFaint)}"
base05: "${noHash(v.fg)}"
base06: "${noHash(v.fgDim)}"
base07: "${noHash(v.ansi.brWhite)}"
base08: "${noHash(s.error)}"
base09: "${noHash(s.num)}"
base0A: "${noHash(s.warn)}"
base0B: "${noHash(s.fn)}"
base0C: "${noHash(s.rgx)}"
base0D: "${noHash(s.info)}"
base0E: "${noHash(s.constant)}"
base0F: "${noHash(s.param)}"`;
}

function generateBase16() {
  for (const v of variants) out(`editors/neovim-base16/${titleSlug(v.id)}.yaml`, base16(v));
}

function jetbrains(v) {
  const s = v.syntax;
  const colorOptions = [
    ['CARET_COLOR', v.cursor],
    ['CARET_ROW_COLOR', v.line],
    ['SELECTION_BACKGROUND', v.sel],
    ['SELECTION_FOREGROUND', fgFor(v.sel)],
    ['CONSOLE_BACKGROUND_KEY', v.bg],
    ['GUTTER_BACKGROUND', v.bg],
    ['INDENT_GUIDE', v.bg3],
    ['SELECTED_INDENT_GUIDE', v.fgGhost],
    ['LINE_NUMBERS_COLOR', v.fgGhost],
    ['LINE_NUMBER_ON_CARET_ROW_COLOR', v.accent],
    ['VISUAL_INDENT_GUIDE', v.bg3],
    ['WHITESPACES', v.bg3],
    ['ANNOTATIONS_COLOR', v.fgFaint],
    ['NOTIFICATION_INFORMATION_BACKGROUND', v.bg2],
    ['NOTIFICATION_WARNING_BACKGROUND', v.bg2],
    ['NOTIFICATION_ERROR_BACKGROUND', v.bg2],
    ['CONSOLE_BLACK_OUTPUT', v.ansi.black],
    ['CONSOLE_RED_OUTPUT', v.ansi.red],
    ['CONSOLE_GREEN_OUTPUT', v.ansi.green],
    ['CONSOLE_YELLOW_OUTPUT', v.ansi.yellow],
    ['CONSOLE_BLUE_OUTPUT', v.ansi.blue],
    ['CONSOLE_MAGENTA_OUTPUT', v.ansi.magenta],
    ['CONSOLE_CYAN_OUTPUT', v.ansi.cyan],
    ['CONSOLE_GRAY_OUTPUT', v.ansi.white],
    ['CONSOLE_DARKGRAY_OUTPUT', v.ansi.brBlack],
    ['CONSOLE_RED_BRIGHT_OUTPUT', v.ansi.brRed],
    ['CONSOLE_GREEN_BRIGHT_OUTPUT', v.ansi.brGreen],
    ['CONSOLE_YELLOW_BRIGHT_OUTPUT', v.ansi.brYellow],
    ['CONSOLE_BLUE_BRIGHT_OUTPUT', v.ansi.brBlue],
    ['CONSOLE_MAGENTA_BRIGHT_OUTPUT', v.ansi.brMagenta],
    ['CONSOLE_CYAN_BRIGHT_OUTPUT', v.ansi.brCyan],
    ['CONSOLE_WHITE_OUTPUT', v.ansi.brWhite],
  ].map(([name, hex]) => `    <option name="${name}" value="${noHash(hex)}" />`).join('\n');
  const attr = (name, opts) => {
    const lines = [];
    if (opts.fg) lines.push(`        <option name="FOREGROUND" value="${noHash(opts.fg)}" />`);
    if (opts.bg) lines.push(`        <option name="BACKGROUND" value="${noHash(opts.bg)}" />`);
    if (opts.effectType) lines.push(`        <option name="EFFECT_TYPE" value="${opts.effectType}" />`);
    if (opts.effectColor) lines.push(`        <option name="EFFECT_COLOR" value="${noHash(opts.effectColor)}" />`);
    if (opts.font) lines.push(`        <option name="FONT_TYPE" value="${opts.font}" />`);
    return `    <option name="${name}">
      <value>
${lines.join('\n')}
      </value>
    </option>`;
  };
  const attrSpecs = [
    ['TEXT', { fg: s.plain, bg: v.bg, font: '0' }],
    ['DEFAULT_TEXT', { fg: s.plain, bg: v.bg, font: '0' }],
    ['DEFAULT_KEYWORD', { fg: s.kwCtrl, font: '0' }],
    ['KEYWORD', { fg: s.kwCtrl, font: '0' }],
    ['DEFAULT_IDENTIFIER', { fg: s.variable, font: '0' }],
    ['DEFAULT_CONSTANT', { fg: s.constant, font: '0' }],
    ['CONSTANT', { fg: s.constant, font: '1' }],
    ['DEFAULT_NUMBER', { fg: s.num, font: '0' }],
    ['NUMBER', { fg: s.num, font: '0' }],
    ['DEFAULT_STRING', { fg: s.string, font: '0' }],
    ['STRING', { fg: s.string, font: '0' }],
    ['DEFAULT_VALID_STRING_ESCAPE', { fg: s.esc, font: '0' }],
    ['VALID_STRING_ESCAPE', { fg: s.esc, font: '1' }],
    ['DEFAULT_INVALID_STRING_ESCAPE', { fg: s.error, font: '0' }],
    ['DEFAULT_OPERATION_SIGN', { fg: s.op, font: '0' }],
    ['OPERATION_SIGN', { fg: s.op, font: '0' }],
    ['DEFAULT_PARENTHS', { fg: s.punct, font: '0' }],
    ['DEFAULT_BRACKETS', { fg: s.punct, font: '0' }],
    ['DEFAULT_BRACES', { fg: s.punct, font: '0' }],
    ['DEFAULT_DOT', { fg: s.punct, font: '0' }],
    ['DOT', { fg: s.punct, font: '0' }],
    ['DEFAULT_SEMICOLON', { fg: s.punct, font: '0' }],
    ['SEMICOLON', { fg: s.punct, font: '0' }],
    ['DEFAULT_COMMA', { fg: s.punct, font: '0' }],
    ['COMMA', { fg: s.punct, font: '0' }],
    ['DEFAULT_CLASS_NAME', { fg: s.type, font: '0' }],
    ['CLASS_NAME', { fg: s.type, font: '0' }],
    ['DEFAULT_INTERFACE_NAME', { fg: s.type, font: '2' }],
    ['DEFAULT_CLASS_REFERENCE', { fg: s.type, font: '0' }],
    ['DEFAULT_FUNCTION_DECLARATION', { fg: s.fn, font: '1' }],
    ['FUNCTION_DECLARATION', { fg: s.fn, font: '1' }],
    ['DEFAULT_FUNCTION_CALL', { fg: s.fn, font: '0' }],
    ['FUNCTION_CALL', { fg: s.fn, font: '0' }],
    ['DEFAULT_INSTANCE_METHOD', { fg: s.method, font: '0' }],
    ['INSTANCE_METHOD', { fg: s.method, font: '0' }],
    ['DEFAULT_INSTANCE_FIELD', { fg: s.prop, font: '0' }],
    ['INSTANCE_FIELD', { fg: s.prop, font: '0' }],
    ['DEFAULT_STATIC_METHOD', { fg: s.method, font: '2' }],
    ['DEFAULT_STATIC_FIELD', { fg: s.constant, font: '0' }],
    ['DEFAULT_LOCAL_VARIABLE', { fg: s.variable, font: '0' }],
    ['LOCAL_VARIABLE', { fg: s.variable, font: '0' }],
    ['DEFAULT_PARAMETER', { fg: s.param, font: '0' }],
    ['PARAMETER', { fg: s.param, font: '2' }],
    ['DEFAULT_REASSIGNED_LOCAL_VARIABLE', { fg: s.variable, effectType: 'BOLD_DOTTED_LINE', effectColor: v.fgFaint, font: '0' }],
    ['DEFAULT_REASSIGNED_PARAMETER', { fg: s.param, effectType: 'BOLD_DOTTED_LINE', effectColor: v.fgFaint, font: '0' }],
    ['DEFAULT_GLOBAL_VARIABLE', { fg: s.constant, font: '2' }],
    ['DEFAULT_LINE_COMMENT', { fg: s.comment, font: '2' }],
    ['LINE_COMMENT', { fg: s.comment, font: '2' }],
    ['DEFAULT_BLOCK_COMMENT', { fg: s.comment, font: '2' }],
    ['BLOCK_COMMENT', { fg: s.comment, font: '2' }],
    ['DEFAULT_DOC_COMMENT', { fg: s.docComment, font: '2' }],
    ['DOC_COMMENT', { fg: s.docComment, font: '2' }],
    ['DEFAULT_DOC_COMMENT_TAG', { fg: s.attr, font: '1' }],
    ['DEFAULT_DOC_COMMENT_TAG_VALUE', { fg: s.param, font: '0' }],
    ['DEFAULT_DOC_COMMENT_MARKUP', { fg: s.docComment, font: '2' }],
    ['METADATA', { fg: s.decorator, font: '2' }],
    ['DEFAULT_METADATA', { fg: s.decorator, font: '2' }],
    ['DEFAULT_LABEL', { fg: s.kwMod, font: '2' }],
    ['DEFAULT_PREDEFINED_SYMBOL', { fg: s.builtin, font: '0' }],
    ['BAD_CHARACTER', { fg: fgFor(s.error), bg: s.error, font: '1' }],
    ['TODO_DEFAULT_ATTRIBUTES', { fg: fgFor(v.accent), bg: v.accent, font: '1' }],
    ['SEARCH_RESULT_ATTRIBUTES', { fg: fgFor(v.accentSoft), bg: v.accentSoft, font: '0' }],
    ['WRITE_SEARCH_RESULT_ATTRIBUTES', { fg: fgFor(v.accent), bg: v.accent, font: '1' }],
    ['TEXT_SEARCH_RESULT_ATTRIBUTES', { fg: fgFor(v.accentSoft), bg: v.accentSoft, font: '0' }],
    ['IDENTIFIER_UNDER_CARET_ATTRIBUTES', { effectType: 'ROUNDED_BOX', effectColor: v.accent, font: '0' }],
    ['WRITE_IDENTIFIER_UNDER_CARET_ATTRIBUTES', { effectType: 'ROUNDED_BOX', effectColor: v.accent, font: '0' }],
    ['FOLLOWED_HYPERLINK_ATTRIBUTES', { fg: s.info, effectType: 'LINE_UNDERSCORE', effectColor: s.info, font: '0' }],
    ['HYPERLINK_ATTRIBUTES', { fg: s.info, effectType: 'LINE_UNDERSCORE', effectColor: s.info, font: '0' }],
    ['XML_TAG_NAME', { fg: s.tag, font: '0' }],
    ['XML_ATTRIBUTE_NAME', { fg: s.attr, font: '0' }],
    ['XML_ATTRIBUTE_VALUE', { fg: s.string, font: '0' }],
    ['HTML_TAG_NAME', { fg: s.tag, font: '0' }],
    ['HTML_ATTRIBUTE_NAME', { fg: s.attr, font: '0' }],
    ['HTML_ATTRIBUTE_VALUE', { fg: s.string, font: '0' }],
    ['CONSOLE_RED_OUTPUT', { fg: s.error, font: '0' }],
    ['CONSOLE_GREEN_OUTPUT', { fg: s.ok, font: '0' }],
    ['CONSOLE_YELLOW_OUTPUT', { fg: s.warn, font: '0' }],
    ['CONSOLE_BLUE_OUTPUT', { fg: s.info, font: '0' }],
    ['CONSOLE_MAGENTA_OUTPUT', { fg: s.hint, font: '0' }],
    ['CONSOLE_CYAN_OUTPUT', { fg: s.rgx, font: '0' }],
    ['CONSOLE_GRAY_OUTPUT', { fg: v.fgDim, font: '0' }],
    ['DIFF_INSERTED', { fg: s.ok, bg: v.bg2, font: '0' }],
    ['DIFF_DELETED', { fg: s.error, bg: v.bg2, font: '0' }],
    ['DIFF_MODIFIED', { fg: s.warn, bg: v.bg2, font: '0' }],
    ['DEFAULT_TEMPLATE_LANGUAGE_COLOR', { bg: v.bg2, font: '0' }],
  ];
  const attrs = attrSpecs.map(([name, opts]) => attr(name, opts)).join('\n');
  return `<scheme name="${xmlEscape(v.label)}" version="142" parent_scheme="${v.mode === 'dark' ? 'Darcula' : 'Default'}">
  <metaInfo>
    <property name="created">2026-05-07T00:00:00</property>
    <property name="ide">idea</property>
    <property name="ideVersion">2026.1</property>
    <property name="modified">2026-05-07T00:00:00</property>
    <property name="originalScheme">${xmlEscape(v.label)}</property>
  </metaInfo>
  <option name="LINE_SPACING" value="1.2" />
  <option name="EDITOR_FONT_SIZE" value="14" />
  <option name="EDITOR_FONT_NAME" value="${xmlEscape(palette.fonts.mono_family)}" />
  <colors>
${colorOptions}
  </colors>
  <attributes>
${attrs}
  </attributes>
</scheme>`;
}

function generateJetBrains() {
  for (const v of variants) out(`editors/jetbrains/${titleSlug(v.id)}.icls`, jetbrains(v));
}

function alacritty(v, alias = false) {
  const a = v.ansi;
  return `# ${alias ? 'Bizarre' : v.label} - Alacritty
[colors.primary]
background = "${v.bg}"
foreground = "${v.fg}"

[colors.cursor]
text = "${fgFor(v.cursor)}"
cursor = "${v.cursor}"

[colors.selection]
text = "${fgFor(v.sel)}"
background = "${v.sel}"

[colors.normal]
black = "${a.black}"
red = "${a.red}"
green = "${a.green}"
yellow = "${a.yellow}"
blue = "${a.blue}"
magenta = "${a.magenta}"
cyan = "${a.cyan}"
white = "${a.white}"

[colors.bright]
black = "${a.brBlack}"
red = "${a.brRed}"
green = "${a.brGreen}"
yellow = "${a.brYellow}"
blue = "${a.brBlue}"
magenta = "${a.brMagenta}"
cyan = "${a.brCyan}"
white = "${a.brWhite}"

[font]
normal = { family = "${palette.fonts.mono_family}" }`;
}

function kitty(v, alias = false) {
  const a = colorList(v);
  return `# ${alias ? 'Bizarre' : v.label} - Kitty
font_family ${palette.fonts.mono_family}
foreground ${v.fg}
background ${v.bg}
selection_foreground ${fgFor(v.sel)}
selection_background ${v.sel}
cursor ${v.cursor}
cursor_text_color ${fgFor(v.cursor)}
url_color ${v.syntax.info}
active_tab_foreground ${fgFor(v.accent)}
active_tab_background ${v.accent}
inactive_tab_foreground ${v.fgDim}
inactive_tab_background ${v.bg2}
tab_bar_background ${v.bg}
${a.map((hex, i) => `color${i} ${hex}`).join('\n')}`;
}

function ghostty(v) {
  return `# ${v.label} - Ghostty
font-family = ${palette.fonts.mono_family}
background = ${noHash(v.bg)}
foreground = ${noHash(v.fg)}
cursor-color = ${noHash(v.cursor)}
selection-background = ${noHash(v.sel)}
selection-foreground = ${noHash(fgFor(v.sel))}
${colorList(v).map((hex, i) => `palette = ${i}=${hex}`).join('\n')}`;
}

function plist(v) {
  const keys = colorList(v).map((hex, i) => `\t<key>Ansi ${i} Color</key>\n${plistColor(hex)}`);
  keys.push(`\t<key>Background Color</key>\n${plistColor(v.bg)}`);
  keys.push(`\t<key>Foreground Color</key>\n${plistColor(v.fg)}`);
  keys.push(`\t<key>Cursor Color</key>\n${plistColor(v.cursor)}`);
  keys.push(`\t<key>Cursor Text Color</key>\n${plistColor(fgFor(v.cursor))}`);
  keys.push(`\t<key>Selection Color</key>\n${plistColor(v.sel)}`);
  keys.push(`\t<key>Selected Text Color</key>\n${plistColor(fgFor(v.sel))}`);
  keys.push(`\t<key>Bold Color</key>\n${plistColor(v.fg)}`);
  keys.push(`\t<key>Link Color</key>\n${plistColor(v.syntax.info)}`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
${keys.join('\n')}
</dict>
</plist>`;
}

function windowsTerminal() {
  return JSON.stringify({
    schemes: variants.map((v) => ({
      name: v.label,
      background: v.bg,
      foreground: v.fg,
      cursorColor: v.cursor,
      selectionBackground: v.sel,
      black: v.ansi.black,
      red: v.ansi.red,
      green: v.ansi.green,
      yellow: v.ansi.yellow,
      blue: v.ansi.blue,
      purple: v.ansi.magenta,
      cyan: v.ansi.cyan,
      white: v.ansi.white,
      brightBlack: v.ansi.brBlack,
      brightRed: v.ansi.brRed,
      brightGreen: v.ansi.brGreen,
      brightYellow: v.ansi.brYellow,
      brightBlue: v.ansi.brBlue,
      brightPurple: v.ansi.brMagenta,
      brightCyan: v.ansi.brCyan,
      brightWhite: v.ansi.brWhite,
    })),
  }, null, 2);
}

function weztermScheme(v) {
  return `  [${q(v.label)}] = {
    foreground = ${q(v.fg)},
    background = ${q(v.bg)},
    cursor_bg = ${q(v.cursor)},
    cursor_fg = ${q(fgFor(v.cursor))},
    cursor_border = ${q(v.cursor)},
    selection_bg = ${q(v.sel)},
    selection_fg = ${q(fgFor(v.sel))},
    scrollbar_thumb = ${q(v.bg4)},
    split = ${q(v.border)},
    ansi = { ${colorList(v).slice(0, 8).map(q).join(', ')} },
    brights = { ${colorList(v).slice(8).map(q).join(', ')} },
  }`;
}

function generateTerminals() {
  for (const v of variants) {
    out(`terminals/alacritty/${titleSlug(v.id)}.toml`, alacritty(v));
    out(`terminals/kitty/${titleSlug(v.id)}.conf`, kitty(v));
    out(`terminals/ghostty/${titleSlug(v.id)}`, ghostty(v));
    out(`terminals/iterm2/${titleSlug(v.id)}.itermcolors`, plist(v));
  }
  out('terminals/alacritty/bizarre.toml', alacritty(variants[0], true));
  out('terminals/kitty/bizarre.conf', kitty(variants[0], true));
  out('terminals/windows-terminal/schemes.json', windowsTerminal());
  out('terminals/wezterm/bizarre.lua', `-- Bizarre Industries - WezTerm color schemes
-- CATCH THE STARS.
return {
${variants.map(weztermScheme).join(',\n')}
}`);
  out('terminals/zellij/bizarre.kdl', `// Bizarre Industries - Zellij themes
// CATCH THE STARS.
themes {
${variants.map((v) => `    "${titleSlug(v.id)}" {
        fg "${v.fg}"
        bg "${v.bg}"
        black "${v.ansi.black}"
        red "${v.ansi.red}"
        green "${v.ansi.green}"
        yellow "${v.ansi.yellow}"
        blue "${v.ansi.blue}"
        magenta "${v.ansi.magenta}"
        cyan "${v.ansi.cyan}"
        white "${v.ansi.white}"
        orange "${v.ansi.brYellow}"
    }`).join('\n')}
}`);
  out('terminals/tmux/bizarre.tmux.conf', tmux(variants[0]));
}

function tmux(v) {
  const stanza = (variant, commented = false) => {
    const prefix = commented ? '# ' : '';
    return `${prefix}# -- ${variant.label} --
${prefix}set -g status-style "bg=${variant.bg},fg=${variant.fg}"
${prefix}set -g status-left  "#[bg=${variant.accent},fg=${fgFor(variant.accent)},bold] BZR ✦ #S #[bg=${variant.bg},fg=${variant.accent}]"
${prefix}set -g status-right "#[fg=${variant.border}]✦ #[fg=${variant.fg}]%H:%M #[fg=${variant.border}]✦ #[fg=${variant.fg}]%a %b %d "
${prefix}set -g status-left-length 40
${prefix}set -g status-right-length 60
${prefix}set -g window-status-format         "#[fg=${variant.border}] #I:#W "
${prefix}set -g window-status-current-format "#[bg=${variant.border},fg=${variant.accent},bold] #I:#W "
${prefix}set -g window-status-separator ""
${prefix}set -g pane-border-style        "fg=${variant.border}"
${prefix}set -g pane-active-border-style "fg=${variant.accent}"
${prefix}set -g message-style "bg=${variant.accent},fg=${fgFor(variant.accent)},bold"
${prefix}set -g message-command-style "bg=${variant.border},fg=${variant.fg}"
${prefix}set -g mode-style "bg=${variant.accent},fg=${fgFor(variant.accent)}"
${prefix}set -g clock-mode-colour "${variant.accent}"
${prefix}set -g copy-mode-match-style "bg=${variant.accent},fg=${fgFor(variant.accent)}"
${prefix}set -g copy-mode-current-match-style "bg=${variant.syntax.warn},fg=${fgFor(variant.syntax.warn)}"`;
  };
  return `# Bizarre Industries - tmux statusline
# CATCH THE STARS.
#
# Source from ~/.tmux.conf:
#   source-file ~/dotfiles/bizarre/terminals/tmux/bizarre.tmux.conf
#
# Switch variant by changing @bizarre-variant below.

set -g @bizarre-variant "${v.id}"

${stanza(v)}

${variants.filter((variant) => variant.id !== v.id).map((variant) => `# Uncomment to use ${variant.label}:
${stanza(variant, true)}`).join('\n\n')}`;
}

function starship(v) {
  return `# Bizarre Industries - Starship prompt
# CATCH THE STARS.
#
# Powerline-style:
#   [bzr][~/path][branch?][status?] ✦
#
# Install: cp prompt/starship.toml ~/.config/starship.toml

format = """
[](${v.accent})\\
[ bzr ](bg:${v.accent} fg:${fgFor(v.accent)} bold)\\
[](fg:${v.accent} bg:${v.bg2})\\
[ $directory](bg:${v.bg2} fg:${v.syntax.info})\\
[](fg:${v.bg2} bg:${v.bg3})\\
$git_branch\\
$git_status\\
[](fg:${v.bg3} bg:none)\\
$fill\\
$cmd_duration\\
$status\\
$python\\
$nodejs\\
$rust\\
$golang\\
$lua\\
$time\\
$line_break\\
[✦ ](fg:${v.accentSoft} bold)
"""

add_newline = true
palette = "bizarre"

[palettes.bizarre]
lime = "${v.accent}"
glow = "${v.accentSoft}"
gray = "${v.fgFaint}"
ash = "${v.fgGhost}"
fg = "${v.fg}"
void = "${v.bg}"
void2 = "${v.bg2}"
void3 = "${v.bg3}"
void4 = "${v.bg4}"
blue = "${v.syntax.info}"
amber = "${v.syntax.warn}"
red = "${v.syntax.error}"
green = "${v.syntax.ok}"
cyan = "${v.syntax.rgx}"
magenta = "${v.syntax.hint}"

[fill]
symbol = " "
style = "bg:none"

[directory]
style = "bg:${v.bg2} fg:${v.syntax.info} bold"
format = "[$path]($style)[$read_only]($read_only_style) "
truncation_length = 4
truncation_symbol = "…/"
read_only = " "
read_only_style = "bg:${v.bg2} fg:${v.syntax.error}"

[directory.substitutions]
"~" = "~"
"Documents" = "docs"
"Downloads" = "dl"
"Music" = "♪"
"Pictures" = "pix"

[git_branch]
symbol = " "
style = "bg:${v.bg3} fg:${v.accent}"
format = "[ $symbol$branch(:$remote_branch) ]($style)"

[git_status]
style = "bg:${v.bg3} fg:${v.syntax.warn}"
format = '([$all_status$ahead_behind ]($style))'
conflicted = "[≢$count](bg:${v.bg3} fg:${v.syntax.error}) "
ahead = "↑\${count} "
behind = "↓\${count} "
diverged = "↑\${ahead_count}↓\${behind_count} "
up_to_date = ""
untracked = "[?$count](bg:${v.bg3} fg:${v.fgFaint}) "
stashed = "[*$count](bg:${v.bg3} fg:${v.syntax.hint}) "
modified = "[~$count](bg:${v.bg3} fg:${v.syntax.warn}) "
staged = "[+$count](bg:${v.bg3} fg:${v.syntax.ok}) "
renamed = "[»$count](bg:${v.bg3} fg:${v.syntax.info}) "
deleted = "[✗$count](bg:${v.bg3} fg:${v.syntax.error}) "

[cmd_duration]
min_time = 2_000
style = "fg:${v.syntax.warn}"
format = "[ ⏱ $duration]($style) "

[status]
style = "fg:${v.syntax.error} bold"
symbol = "✗ "
success_symbol = ""
not_executable_symbol = "!"
not_found_symbol = "?"
sigint_symbol = "!"
signal_symbol = "!"
disabled = false
format = "[$symbol$status]($style) "

[time]
disabled = false
style = "fg:${v.fgFaint}"
format = "[ ✦ $time ]($style)"
time_format = "%R"

[character]
success_symbol = ""
error_symbol = ""

# Language / runtime modules.
[python]
symbol = "py "
style = "fg:${v.syntax.info}"
format = '[$symbol($version )(\\($virtualenv\\) )]($style)'

[nodejs]
symbol = "node "
style = "fg:${v.syntax.ok}"
format = '[$symbol($version )]($style)'

[rust]
symbol = "rs "
style = "fg:${v.syntax.warn}"
format = '[$symbol($version )]($style)'

[golang]
symbol = "go "
style = "fg:${v.syntax.rgx}"
format = '[$symbol($version )]($style)'

[lua]
symbol = "lua "
style = "fg:${v.syntax.info}"
format = '[$symbol($version )]($style)'

[hostname]
ssh_only = true
style = "fg:${v.accent} bold"
format = "[@$hostname ]($style)"

[username]
show_always = false
style_user = "fg:${v.fg}"
style_root = "fg:${v.syntax.error} bold"
format = "[$user]($style)"`;
}

function aerospace(v) {
  return `# Bizarre Industries - AeroSpace window manager config
# CATCH THE STARS.
#
# Drop into ~/.config/aerospace/aerospace.toml
# AeroSpace v0.14+

# Startup
after-login-command = []
after-startup-command = [
    'exec-and-forget borders active_color=0xff${noHash(v.accent)} inactive_color=0xff${noHash(v.border)} width=2.0',
]

# Normalization keeps tiling predictable.
enable-normalization-flatten-containers = true
enable-normalization-opposite-orientation-for-nested-containers = true
accordion-padding = 30
default-root-container-layout = 'tiles'
default-root-container-orientation = 'auto'
on-focused-monitor-changed = ['move-mouse monitor-lazy-center']

# Gaps, bench whitespace.
[gaps]
inner.horizontal = 8
inner.vertical   = 8
outer.left       = 8
outer.bottom     = 8
outer.top        = 8
outer.right      = 8

# Workspaces, named after brand vocabulary.
# 1 BENCH, 2 CODE, 3 ORBIT, 4 SIGNAL, 5 STARS, 6 BURN, 7 SPARE.
[workspace-to-monitor-force-assignment]
'1' = 'main'
'2' = 'main'
'3' = 'secondary'
'4' = 'secondary'

# Mode: main.
[mode.main.binding]
alt-h = 'focus left'
alt-j = 'focus down'
alt-k = 'focus up'
alt-l = 'focus right'

alt-shift-h = 'move left'
alt-shift-j = 'move down'
alt-shift-k = 'move up'
alt-shift-l = 'move right'

alt-1 = 'workspace 1'
alt-2 = 'workspace 2'
alt-3 = 'workspace 3'
alt-4 = 'workspace 4'
alt-5 = 'workspace 5'
alt-6 = 'workspace 6'
alt-7 = 'workspace 7'
alt-shift-1 = 'move-node-to-workspace 1'
alt-shift-2 = 'move-node-to-workspace 2'
alt-shift-3 = 'move-node-to-workspace 3'
alt-shift-4 = 'move-node-to-workspace 4'

alt-tab = 'workspace-back-and-forth'
alt-slash = 'layout tiles horizontal vertical'
alt-comma = 'layout accordion horizontal vertical'

alt-f = 'fullscreen'
alt-shift-f = 'layout floating tiling'

# Resize mode leaves main bindings untouched.
alt-shift-semicolon = 'mode resize'

[mode.resize.binding]
h = 'resize width -50'
j = 'resize height +50'
k = 'resize height -50'
l = 'resize width +50'
enter = 'mode main'
esc = 'mode main'

# App rules keep tools in the right workspace.
[[on-window-detected]]
if.app-id = 'com.googlecode.iterm2'
run = 'move-node-to-workspace 6'

[[on-window-detected]]
if.app-id = 'com.mitchellh.ghostty'
run = 'move-node-to-workspace 6'

[[on-window-detected]]
if.app-id = 'com.microsoft.VSCode'
run = 'move-node-to-workspace 2'

[[on-window-detected]]
if.app-id = 'dev.zed.Zed'
run = 'move-node-to-workspace 2'

[[on-window-detected]]
if.app-id = 'company.thebrowser.Browser'
run = 'move-node-to-workspace 3'

[[on-window-detected]]
if.app-id = 'com.apple.Safari'
run = 'move-node-to-workspace 3'

# Floating windows, utilities and inspectors.
[[on-window-detected]]
if.app-id = 'com.apple.systempreferences'
run = 'layout floating'

[[on-window-detected]]
if.app-id = 'com.apple.calculator'
run = 'layout floating'

# JankyBorders companion.
# brew install FelixKratz/formulae/borders
# Install JankyBorders separately. Active border is Signal Lime; inactive is the variant border.`;
}

function jujutsu(v) {
  const s = v.syntax;
  return `# Bizarre Industries - Jujutsu colors
# CATCH THE STARS.
#
# Drop into ~/.config/jj/config.toml or merge with an existing config.
# Tested with jj v0.16+.

[ui]
color = "always"
pager = ":builtin"
diff-editor = ":builtin"
default-command = "log"

[ui.movement]
edit = false

# Color rules, semantic rather than decorative.
# Lime is reserved for the working-copy marker, @, and the current branch.
[colors]
"working_copy"             = { fg = "${fgFor(v.accent)}", bg = "${v.accent}", bold = true }
"working_copy change_id"   = { fg = "${fgFor(v.accent)}", bg = "${v.accent}", bold = true }
"working_copy commit_id"   = { fg = "${fgFor(v.accent)}", bg = "${v.accent}" }
"working_copy description" = "${v.fg}"
"working_copy author"      = "${s.ns}"
"working_copy timestamp"   = "${v.fgFaint}"
"working_copy bookmarks"   = { fg = "${v.accent}", bold = true }

"change_id"     = "${s.constant}"
"commit_id"     = "${s.rgx}"
"author"        = "${s.info}"
"timestamp"     = "${v.fgFaint}"
"description"   = "${v.fg}"
"bookmarks"     = "${s.warn}"
"tags"          = "${s.string}"
"git_refs"      = "${s.self}"
"divergent"     = { fg = "${s.error}", bold = true }
"conflict"      = { fg = "${s.error}", bg = "${v.bg3}", bold = true }
"empty"         = "${v.fgFaint}"

# diff
"diff added"           = "${s.ok}"
"diff added token"     = { fg = "${fgFor(s.ok)}", bg = "${s.ok}", bold = true }
"diff removed"         = "${s.error}"
"diff removed token"   = { fg = "${fgFor(s.error)}", bg = "${s.error}", bold = true }
"diff modified"        = "${s.warn}"
"diff context"         = "${v.fgDim}"
"diff file_header"     = { fg = "${v.accent}", bold = true }
"diff hunk_header"     = "${s.ns}"

# status / warnings
"error"         = { fg = "${s.error}", bold = true }
"warning"       = "${s.warn}"
"hint"          = "${s.hint}"
"normal"        = "${v.fg}"

# operation log
"operation id"          = "${s.rgx}"
"operation user"        = "${s.info}"
"operation time"        = "${v.fgFaint}"
"operation current"     = { fg = "${fgFor(v.accent)}", bg = "${v.accent}", bold = true }

# Custom log template.
# Use: jj log -T bizarre
[templates]
bizarre = '''
if(root,
  format_root_commit(self),
  label(if(current_working_copy, "working_copy"),
    concat(
      if(current_working_copy, "✦ ", "  "),
      format_short_change_id_with_hidden_and_divergent_info(self),
      " ",
      format_short_signature(author),
      " ",
      format_timestamp(committer.timestamp()),
      if(bookmarks, " " ++ bookmarks.join(" ")),
      if(tags, " " ++ tags.join(" ")),
      if(working_copies, " " ++ working_copies),
      if(conflict, label("conflict", " ⚠ conflict")),
      if(empty, label("empty", " (empty)")),
      "\\n",
      "  ",
      if(empty, label("empty", description.first_line()), description.first_line()),
      "\\n",
    )
  )
)
'''

# Aliases that match the brand voice.
[aliases]
ship   = ["git", "push"]
catch  = ["new"]
stars  = ["log", "-T", "bizarre", "-r", "ancestors(@, 12)"]
bench  = ["status"]`;
}

function forklift(v) {
  const s = v.syntax;
  return JSON.stringify({
    $schema: 'https://binarynights.com/schemas/forklift-theme-v4.json',
    name: 'Bizarre',
    author: 'Bizarre Industries',
    version: '0.2',
    description: 'CATCH THE STARS. Signal Lime accent on Void backgrounds.',
    appearance: v.mode,
    background: v.bg,
    backgroundAlternate: v.bg2,
    foreground: v.fg,
    foregroundSecondary: v.fgDim,
    selection: v.sel,
    selectionInactive: v.bg3,
    selectionForeground: v.accent,
    border: v.border,
    scrollbar: v.bg4,
    toolbar: { background: v.bg2, foreground: v.fg, accent: v.accent, buttonHover: v.bg3, buttonActive: v.accent, buttonActiveText: fgFor(v.accent), separator: v.bg3 },
    tabs: { background: v.bg, tabBackground: v.bg2, tabBackgroundActive: v.bg, tabForeground: v.fgDim, tabForegroundActive: v.accent, tabIndicator: v.accent, newTabButton: v.fgFaint },
    pathBar: { background: v.bg2, foreground: v.fg, separator: v.fgFaint, current: v.accent },
    fileList: { headerBackground: v.bg2, headerForeground: v.fgDim, headerSeparator: v.bg3, rowBackground: v.bg, rowBackgroundAlt: v.bg2, rowHover: v.bg3, rowSelected: v.sel, rowSelectedInactive: v.bg3, gridLine: v.border },
    fileColors: {
      directory: s.info,
      directoryAlias: v.ansi.brBlue,
      directoryEmpty: v.fgFaint,
      executable: v.accent,
      archive: s.warn,
      image: s.hint,
      video: s.self,
      audio: s.rgx,
      code: s.prop,
      document: v.fg,
      text: s.ns,
      config: s.warn,
      package: s.rgx,
      hidden: v.fgGhost,
      symlink: s.ns,
      broken: s.error,
      extensions: {
        ts: s.info, tsx: s.info, js: s.esc, jsx: s.esc, py: v.ansi.brBlue, rs: s.rgx,
        go: s.type, lua: s.info, c: s.ns, cpp: s.ns, h: s.pre, md: v.accent, txt: v.fg,
        toml: s.warn, yaml: s.warn, yml: s.warn, json: s.esc, kdl: s.hint,
        sh: s.method, zsh: s.method, fish: s.method, vim: s.ok, png: s.hint,
        jpg: s.hint, svg: s.self, zip: s.warn, tar: s.warn, gz: s.warn,
      },
    },
    preview: { background: v.bg, foreground: v.fg, border: v.border, headerBackground: v.bg2, metaBackground: v.bg2, metaForeground: v.fgDim, metaKey: v.fgFaint, metaValue: v.fg, syntaxAccent: v.accent },
    git: { untracked: s.warn, modified: s.warn, staged: s.ok, added: s.ok, deleted: s.error, renamed: s.info, conflict: s.error, ignored: v.fgGhost, branchIndicator: v.accent },
    statusBar: { background: v.bg2, foreground: v.fgDim, accent: v.accent, separator: v.bg3, warn: s.warn, error: s.error, ok: s.ok },
    terminal: { background: v.bg, foreground: v.fg, cursor: v.cursor, selection: v.sel, ansi: {
      black: v.ansi.black, red: v.ansi.red, green: v.ansi.green, yellow: v.ansi.yellow, blue: v.ansi.blue, magenta: v.ansi.magenta, cyan: v.ansi.cyan, white: v.ansi.white,
      brightBlack: v.ansi.brBlack, brightRed: v.ansi.brRed, brightGreen: v.ansi.brGreen, brightYellow: v.ansi.brYellow, brightBlue: v.ansi.brBlue, brightMagenta: v.ansi.brMagenta, brightCyan: v.ansi.brCyan, brightWhite: v.ansi.brWhite,
    } },
  }, null, 2);
}

function generateTools() {
  const v = variants[0];
  out('prompt/starship.toml', starship(v));
  out('tools/aerospace/aerospace.toml', aerospace(v));
  out('tools/jujutsu/config.toml', jujutsu(v));
  out('tools/forklift/Bizarre.json', forklift(v));
  generateShells(v);
}

function generateShells(v) {
  const lime = ansiEsc(v.accent);
  const glow = ansiEsc(v.accentSoft);
  const gray = ansiEsc(v.fgFaint);
  const fg = ansiEsc(v.fg);
  out('shells/banner/bizarre.bash', shellBash(lime, glow, gray, fg));
  out('shells/banner/bizarre.zsh', shellZsh(lime, glow, gray, fg));
  out('shells/banner/bizarre.fish', shellFish(v));
  out('shells/banner/bizarre.ps1', shellPs1(v));
}

function bannerLines(varPrefix = '') {
  return [
    ...shellWordmark.bizarre.map((line) => `${varPrefix}printf '%s%s ${line}%s\\n' "$lime" "$b" "$r"`),
    `${varPrefix}printf '\\n'`,
    ...shellWordmark.industries.map((line) => `${varPrefix}printf '%s ${line}%s\\n' "$gray" "$r"`),
  ].join('\n');
}

function fishBannerLines() {
  return [
    ...shellWordmark.bizarre.map((line) => `  printf '%s%s ${line}%s\\n' $lime $b $r`),
    '  echo',
    ...shellWordmark.industries.map((line) => `  printf '%s ${line}%s\\n' $gray $r`),
  ].join('\n');
}

function psBannerLines() {
  return [
    ...shellWordmark.bizarre.map((line) => `  Write-Host "$lime$b ${line}$r"`),
    '  Write-Host ""',
    ...shellWordmark.industries.map((line) => `  Write-Host "$gray ${line}$r"`),
  ].join('\n');
}

function shellBash(lime, glow, gray, fg) {
  return `#!/usr/bin/env bash
# Bizarre Industries - shell banner (bash)
# CATCH THE STARS.

[[ $- != *i* ]] && return

_BZR_DIR="$( cd -- "$( dirname -- "\${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
_BZR_ROOT="$( cd -- "$_BZR_DIR/../.." &> /dev/null && pwd )"
_BZR_MANIFESTO="$_BZR_ROOT/shells/manifesto.txt"
_BZR_STAMP="\${XDG_CACHE_HOME:-$HOME/.cache}/bizarre-banner.stamp"

_bzr_should_show() {
  [[ "$BIZARRE_BANNER" == "0" ]] && return 1
  [[ "$BIZARRE_BANNER" == "1" ]] && return 0
  local today
  today="$(date +%Y-%m-%d)"
  if [[ -r "$_BZR_STAMP" ]] && [[ "$(cat "$_BZR_STAMP")" == "$today" ]]; then return 1; fi
  mkdir -p "$(dirname "$_BZR_STAMP")" 2>/dev/null
  echo "$today" > "$_BZR_STAMP"
  return 0
}

bizarre_banner() {
  local lime=$'${lime}'
  local glow=$'${glow}'
  local gray=$'${gray}'
  local fg=$'${fg}'
  local dim=$'\\e[2m'
  local b=$'\\e[1m'
  local r=$'\\e[0m'
  printf '\\n'
${bannerLines('  ')}
  printf '\\n'
  local month_year
  month_year=$(date +'%b %Y' | tr '[:lower:]' '[:upper:]')
  printf '  %s%sBZR / SHELL / V0.2 / %s%s   %s%s✦%s   %shost: %s%s\\n' "$dim" "$gray" "$month_year" "$r" "$glow" "$b" "$r" "$gray" "$(hostname -s)" "$r"
  if [[ -r "$_BZR_MANIFESTO" ]]; then
    local count line
    count=$(wc -l < "$_BZR_MANIFESTO")
    if (( count > 0 )); then
      line=$(sed -n "$((RANDOM % count + 1))p" "$_BZR_MANIFESTO")
      printf '\\n  %s%s%s%s\\n' "$fg" "$b" "$line" "$r"
    fi
  fi
  printf '\\n  %s%sCATCH THE STARS.%s\\n\\n' "$lime" "$b" "$r"
}

if _bzr_should_show; then bizarre_banner; fi`;
}

function shellZsh(lime, glow, gray, fg) {
  return shellBash(lime, glow, gray, fg)
    .replace('#!/usr/bin/env bash', '#!/usr/bin/env zsh')
    .replace('shell banner (bash)', 'shell banner (zsh)')
    .replace('[[ $- != *i* ]] && return', '[[ $- != *i* ]] && return')
    .replace('_BZR_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"', '_BZR_DIR="${${(%):-%x}:A:h}"')
    .replace('_BZR_ROOT="$( cd -- "$_BZR_DIR/../.." &> /dev/null && pwd )"', '_BZR_ROOT="${_BZR_DIR:h:h}"');
}

function shellFish(v) {
  const [lr, lg, lb] = rgb(v.accent);
  const [gr, gg, gb] = rgb(v.accentSoft);
  const [ar, ag, ab] = rgb(v.fgFaint);
  const [fr, fg, fb] = rgb(v.fg);
  return `# Bizarre Industries - shell banner (fish)
# CATCH THE STARS.

status is-interactive; or exit

set -l _bzr_dir (status dirname)
set -l _bzr_root (realpath "$_bzr_dir/../..")
set -l _bzr_manifesto "$_bzr_root/shells/manifesto.txt"
set -l _bzr_cache (test -n "$XDG_CACHE_HOME"; and echo $XDG_CACHE_HOME; or echo "$HOME/.cache")
set -l _bzr_stamp "$_bzr_cache/bizarre-banner.stamp"

function _bzr_should_show --argument-names stamp --inherit-variable BIZARRE_BANNER
  if test "$BIZARRE_BANNER" = "0"; return 1; end
  if test "$BIZARRE_BANNER" = "1"; return 0; end
  set -l today (date +%Y-%m-%d)
  if test -r "$stamp"; and test (cat "$stamp") = "$today"; return 1; end
  mkdir -p (dirname "$stamp") 2>/dev/null
  echo $today > "$stamp"
  return 0
end

function bizarre_banner --argument-names manifesto
  set -l lime (printf '\\e[38;2;${lr};${lg};${lb}m')
  set -l glow (printf '\\e[38;2;${gr};${gg};${gb}m')
  set -l gray (printf '\\e[38;2;${ar};${ag};${ab}m')
  set -l fg (printf '\\e[38;2;${fr};${fg};${fb}m')
  set -l dim (printf '\\e[2m')
  set -l b (printf '\\e[1m')
  set -l r (printf '\\e[0m')
  echo
${fishBannerLines()}
  echo
  set -l month_year (date +'%b %Y' | tr '[:lower:]' '[:upper:]')
  printf '  %s%sBZR / SHELL / V0.2 / %s%s   %s%s✦%s   %shost: %s%s\\n' $dim $gray $month_year $r $glow $b $r $gray (hostname -s) $r
  if test -r "$manifesto"
    set -l lines (cat "$manifesto")
    set -l n (count $lines)
    if test $n -gt 0
      set -l idx (random 1 $n)
      printf '\\n  %s%s%s%s\\n' $fg $b $lines[$idx] $r
    end
  end
  printf '\\n  %s%sCATCH THE STARS.%s\\n\\n' $lime $b $r
end

if _bzr_should_show "$_bzr_stamp"
  bizarre_banner "$_bzr_manifesto"
end`;
}

function shellPs1(v) {
  return `# Bizarre Industries - shell banner (PowerShell)
# CATCH THE STARS.

if (-not [Environment]::UserInteractive -and -not $Host.Name.Contains("ConsoleHost")) { return }

$_BzrDir = Split-Path -Parent $PSCommandPath
$_BzrRoot = Resolve-Path (Join-Path $_BzrDir "..\\..")
$_BzrManifesto = Join-Path $_BzrRoot "shells\\manifesto.txt"
$_BzrCache = if ($env:XDG_CACHE_HOME) { $env:XDG_CACHE_HOME } else { Join-Path $HOME ".cache" }
$_BzrStamp = Join-Path $_BzrCache "bizarre-banner.stamp"

function _Bzr-ShouldShow {
  if ($env:BIZARRE_BANNER -eq '0') { return $false }
  if ($env:BIZARRE_BANNER -eq '1') { return $true }
  $today = (Get-Date).ToString('yyyy-MM-dd')
  if ((Test-Path $_BzrStamp) -and ((Get-Content $_BzrStamp -Raw).Trim() -eq $today)) { return $false }
  if (-not (Test-Path $_BzrCache)) { New-Item -ItemType Directory -Path $_BzrCache -Force | Out-Null }
  Set-Content -Path $_BzrStamp -Value $today -NoNewline
  return $true
}

function Bizarre-Banner {
  $e = [char]27
  $lime = "$e[38;2;${rgb(v.accent).join(';')}m"
  $glow = "$e[38;2;${rgb(v.accentSoft).join(';')}m"
  $gray = "$e[38;2;${rgb(v.fgFaint).join(';')}m"
  $fg = "$e[38;2;${rgb(v.fg).join(';')}m"
  $dim = "$e[2m"
  $b = "$e[1m"
  $r = "$e[0m"
  Write-Host ""
${psBannerLines()}
  $monthYear = (Get-Date).ToString('MMM yyyy').ToUpper()
  Write-Host ""
  Write-Host "  $dim${'$'}{gray}BZR / SHELL / V0.2 / $monthYear$r   $glow$b✦$r   ${'$'}{gray}host: $env:COMPUTERNAME$r"
  if (Test-Path $_BzrManifesto) {
    $lines = Get-Content $_BzrManifesto | Where-Object { $_ -ne '' }
    if ($lines.Count -gt 0) {
      Write-Host ""
      Write-Host "  $fg$b$($lines | Get-Random)$r"
    }
  }
  Write-Host ""
  Write-Host "  $lime${'$'}{b}CATCH THE STARS.$r"
  Write-Host ""
}

if (_Bzr-ShouldShow) { Bizarre-Banner }`;
}

function syntaxCss() {
  const sections = ['dark', 'light'].map((mode) => {
    const s = palette.syntax[mode];
    return `.code[data-theme="${mode}"] { color: ${s.plain}; }
${syntaxRoles.map(([cls, key]) => `.code[data-theme="${mode}"] .tok-${cls} { color: ${s[key]};${styleFor(cls)} }`).join('\n')}`;
  }).join('\n\n');
  return `/* Bizarre Industries - syntax token colors. Generated from palette.js. */
${sections}

.code[data-lime-role="functions"] .tok-f,
.code[data-lime-role="functions"] .tok-method { color: var(--lime-active); }
.code[data-lime-role="keywords"] .tok-kw-ctrl,
.code[data-lime-role="keywords"] .tok-kw-decl { color: var(--lime-active); }
.code[data-lime-role="strings"] .tok-s,
.code[data-lime-role="strings"] .tok-tmpl { color: var(--lime-active); }
.code[data-lime-role="comments"] .tok-c { color: var(--lime-active); }
.code[data-lime-role="types"] .tok-t,
.code[data-lime-role="types"] .tok-tprim { color: var(--lime-active); }`;
}

function styleFor(cls) {
  if (['kw-mod', 'rgx', 'param', 'this', 'd', 'c', 'cdoc', 'tprim'].includes(cls)) return ' font-style: italic;';
  if (['kw-decl', 'esc', 'bool', 'const', 'b', 'pre'].includes(cls)) return ' font-weight: 600;';
  return '';
}

function tokensCss() {
  const v = variants[0];
  return `/* Bizarre Industries - design tokens. Generated from palette.js. */
:root {
  --bzr-lime: ${palette.brand.signalLime};
  --bzr-lime-ink: ${palette.brand.limeInk};
  --bzr-lime-glow: ${palette.brand.limeGlow};
  --bzr-gray: ${palette.brand.voidGray};
  --bzr-void: ${v.bg};
  --bzr-void-2: ${v.bg2};
  --bzr-void-3: ${v.bg3};
  --bzr-void-4: ${v.bg4};
  --bzr-paper: ${palette.variants.paper.bg};
  --bzr-bone: ${palette.variants.bone.bg};
  --bzr-success: ${palette.status.dark.ok};
  --bzr-warn: ${palette.status.dark.warn};
  --bzr-danger: ${palette.status.dark.error};
  --bzr-info: ${palette.status.dark.info};
  --bzr-font-display: ${palette.fonts.display};
  --bzr-font-body: ${palette.fonts.prose};
  --bzr-font-mono: ${palette.fonts.mono};
  --bzr-font-label: ${palette.fonts.label};
}`;
}

function colorsAndTypeCss() {
  return `/* Bizarre Industries - typography compatibility layer. Generated from palette.js. */
:root {
  --bzr-font-display: ${palette.fonts.display};
  --bzr-font-stencil: ${palette.fonts.display};
  --bzr-font-body: ${palette.fonts.prose};
  --bzr-font-mono: ${palette.fonts.mono};
}

body { font-family: var(--bzr-font-body); }
h1, h2, h3, .ff-display { font-family: var(--bzr-font-display); }
.ff-stencil { font-family: var(--bzr-font-stencil); }
.ff-body { font-family: var(--bzr-font-body); }
.ff-mono, code, pre { font-family: var(--bzr-font-mono); }`;
}

function showcaseCss() {
  return `:root {
  --void-1: ${palette.variants.void.bg};
  --void-2: ${palette.variants.void.bg2};
  --void-3: ${palette.variants.void.bg3};
  --void-4: ${palette.variants.void.bg4};
  --void-5: ${palette.brand.voidGray};
  --void-6: ${palette.variants.void.fgFaint};
  --paper: ${palette.variants.paper.bg};
  --ink: ${palette.variants.paper.fg};
  --lime: ${palette.brand.signalLime};
  --lime-glow: ${palette.brand.limeGlow};
  --lime-ink: ${palette.brand.limeInk};
  --fg: ${palette.variants.void.fg};
  --fg-dim: ${palette.variants.void.fgDim};
  --grid: rgba(198, 255, 36, 0.05);
  --hairline: rgba(255, 255, 255, 0.08);
  --hairline-light: rgba(14, 14, 14, 0.10);
  --mono: ${palette.fonts.mono};
  --display: ${palette.fonts.display};
  --label: ${palette.fonts.label};
  --prose: ${palette.fonts.prose};
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--void-1); color: var(--fg); font-family: var(--mono); }
body {
  background:
    linear-gradient(var(--grid) 1px, transparent 1px) 0 0 / 64px 64px,
    linear-gradient(90deg, var(--grid) 1px, transparent 1px) 0 0 / 64px 64px,
    var(--void-1);
  min-height: 100vh;
  padding-bottom: 120px;
}
.hero { padding: 72px 64px 48px; border-bottom: 1px solid var(--hairline); }
.hero-grid { display: grid; grid-template-columns: 1fr 0.9fr; gap: 56px; align-items: end; }
.eyebrow, .section-num, .section-sub, .hero-meta, .slogan-strip, .pane-chrome, .code-footer, .pane-meta, .foot { font-family: var(--label); letter-spacing: 0.12em; text-transform: uppercase; }
.eyebrow { color: var(--void-6); display: flex; gap: 12px; align-items: center; margin-bottom: 32px; font-size: 11px; flex-wrap: wrap; }
.pill { border: 1px solid var(--hairline); border-radius: 2px; padding: 3px 8px; color: var(--fg-dim); }
.star, .lime { color: var(--lime); }
.h1 { font-family: var(--display); font-size: clamp(48px, 7vw, 96px); line-height: 0.94; margin: 0; font-weight: 700; letter-spacing: 0; }
.h1 .stack { display: block; }
.h1 .gray { color: var(--void-5); }
.lede { color: var(--fg-dim); line-height: 1.6; font-size: 17px; margin: 0 0 24px; max-width: 620px; }
.hero-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 32px; font-size: 11px; }
.hero-meta dt { color: var(--void-6); margin-bottom: 5px; }
.hero-meta dd { color: var(--fg); margin: 0; }
.slogan-strip { margin-top: 56px; border-top: 1px solid var(--hairline); border-bottom: 1px solid var(--hairline); padding: 16px 0; display: flex; justify-content: space-between; color: var(--void-6); font-size: 12px; }
.section { padding: 88px 64px 24px; }
.section-head { display: grid; grid-template-columns: auto 1fr auto; gap: 24px; align-items: end; border-bottom: 1px solid var(--hairline); padding-bottom: 16px; margin-bottom: 32px; }
.section-num { color: var(--lime); font-size: 11px; }
.section-title { font-family: var(--display); font-size: 30px; margin: 0; font-weight: 650; letter-spacing: 0; }
.section-sub { color: var(--void-6); font-size: 11px; text-align: right; }
.lime-pair, .ansi-dual, .pair, .variant-grid { display: grid; gap: 24px; }
.lime-pair { grid-template-columns: 1fr 1fr; }
.lime-card { border: 1px solid var(--hairline); border-radius: 6px; padding: 22px; display: grid; grid-template-columns: 88px 1fr; gap: 18px; min-height: 190px; }
.lime-swatch { width: 88px; height: 88px; border-radius: 4px; }
.lime-meta, .ansi-half-label, .legend-key { font-family: var(--label); font-size: 10px; color: var(--void-6); letter-spacing: 0.12em; text-transform: uppercase; }
.lime-name { font-family: var(--display); font-size: 30px; line-height: 1; margin: 8px 0; }
.lime-hex { font-family: var(--mono); color: var(--fg-dim); }
.lime-desc { color: var(--fg-dim); line-height: 1.5; margin-top: 12px; }
.ansi-dual { grid-template-columns: 1fr 1fr; }
.ansi-grid { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid var(--hairline); border-radius: 6px; overflow: hidden; }
.ansi-cell { min-height: 68px; padding: 8px; display: flex; flex-direction: column; justify-content: end; font-family: var(--label); font-size: 9px; }
.ansi-cell .hex { opacity: 0.78; font-family: var(--mono); }
.legend-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px; }
.legend-card { border: 1px solid var(--hairline); border-radius: 6px; padding: 12px; min-height: 92px; }
.legend-dark { background: var(--void-2); }
.legend-light { background: var(--paper); color: var(--ink); border-color: var(--hairline-light); }
.legend-name { margin-top: 12px; color: var(--fg-dim); font-size: 12px; }
.legend-light .legend-name { color: #545454; }
.big-type { font-family: var(--display); font-size: clamp(56px, 11vw, 150px); line-height: 0.88; margin: 0; letter-spacing: 0; }
.big-type .out { color: var(--void-5); }
.variant-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
.variant-card { border: 1px solid var(--hairline); border-radius: 6px; overflow: hidden; background: var(--bg); color: var(--fgc); }
.variant-swatch { height: 140px; display: grid; align-content: end; padding: 16px; background: var(--bg); }
.variant-name { font-family: var(--display); font-size: 18px; }
.variant-sub { color: var(--dim); font-size: 12px; margin-top: 6px; }
.variant-strip { display: grid; grid-template-columns: repeat(6, 1fr); height: 36px; }
.pair { grid-template-columns: 1.12fr 0.88fr; align-items: stretch; }
.pane { background: var(--bg, #1A1A1A); border: 1px solid var(--hairline); border-radius: 6px; overflow: hidden; display: flex; flex-direction: column; min-height: 520px; }
.pane.light { border-color: var(--hairline-light); }
.pane-chrome { display: flex; gap: 10px; align-items: center; padding: 10px 14px; background: rgba(0,0,0,.25); border-bottom: 1px solid var(--hairline); font-size: 10px; }
.pane.light .pane-chrome { background: rgba(0,0,0,.04); border-bottom-color: var(--hairline-light); }
.dots { display: flex; gap: 6px; }
.dot { width: 11px; height: 11px; border-radius: 50%; background: var(--void-4); }
.dot.live { background: var(--lime); }
.tab-row { display: flex; gap: 4px; min-width: 0; }
.tab { padding: 5px 10px; border-radius: 3px; color: var(--void-6); white-space: nowrap; }
.tab.active { color: var(--fg); border: 1px solid var(--hairline); background: rgba(255,255,255,.04); }
.pane.light .tab.active { color: var(--ink); border-color: var(--hairline-light); background: rgba(0,0,0,.04); }
.pane-meta { margin-left: auto; color: var(--void-6); font-size: 10px; white-space: nowrap; }
.code { font-family: var(--mono); font-size: 13px; line-height: 1.65; padding: 18px 0; flex: 1; overflow: hidden; font-feature-settings: "calt" 1, "liga" 0; }
.code .line { display: grid; grid-template-columns: 48px 1fr; column-gap: 14px; padding-right: 18px; }
.code .gutter { color: var(--void-5); text-align: right; user-select: none; font-size: 11px; padding-top: 1px; }
.code .line.cur { background: rgba(198,255,36,.05); }
.code-footer { border-top: 1px solid var(--hairline); padding: 8px 14px; display: flex; gap: 18px; color: var(--void-6); font-size: 10px; background: rgba(0,0,0,.2); }
.term { font-family: var(--mono); font-size: 12.5px; line-height: 1.55; padding: 18px 20px; flex: 1; overflow: hidden; white-space: pre; }
.term .blink { animation: blink 1.1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }
.banner-pane { background: var(--void-2); border: 1px solid var(--hairline); border-radius: 6px; padding: 28px; font-family: var(--mono); line-height: 1.24; font-size: 13px; overflow: hidden; white-space: pre; font-variant-ligatures: none; font-feature-settings: "liga" 0, "calt" 0; }
.banner-pane .bzr { color: var(--lime); font-weight: 700; }
.banner-pane .gray { color: var(--void-6); }
.banner-pane .meta { color: var(--void-6); }
.banner-pane .quote { color: var(--fg); font-weight: 700; }
.banner-pane .slogan { color: var(--lime); font-weight: 700; }
.config-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.config-grid.vscode-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
.config-grid.editor-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.config-grid.shell-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
.config-grid.tool-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.config-card { border: 1px solid var(--hairline); border-radius: 6px; overflow: hidden; min-height: 218px; background: var(--bg); color: var(--fgc); display: flex; flex-direction: column; }
.config-card.light { border-color: var(--hairline-light); }
.config-title { padding: 14px 14px 10px; border-bottom: 1px solid var(--hairline); font-family: var(--label); font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; min-width: 0; }
.config-card.light .config-title { border-bottom-color: var(--hairline-light); }
.config-title strong { display: block; color: var(--accent); font-family: var(--display); font-size: 17px; line-height: 1.1; font-weight: 650; letter-spacing: 0; text-transform: none; }
.config-title code { display: block; margin-top: 8px; color: inherit; opacity: .62; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: var(--mono); font-size: 10px; letter-spacing: 0; text-transform: none; }
.mini-ansi { display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; padding: 14px; }
.ansi-chip { height: 34px; border-radius: 3px; border: 1px solid rgba(0,0,0,.16); box-shadow: inset 0 0 0 1px rgba(255,255,255,.05); }
.config-prompt { margin: auto 14px 14px; padding: 12px; border: 1px solid var(--hairline); border-radius: 4px; background: rgba(0,0,0,.16); font-size: 10.5px; line-height: 1.55; white-space: normal; overflow-wrap: anywhere; }
.config-card.light .config-prompt { border-color: var(--hairline-light); background: rgba(0,0,0,.035); }
.config-prompt .path { color: var(--info); }
.config-prompt .cmd { color: var(--accent); font-weight: 700; }
.vscode-window { margin: 12px; border: 1px solid var(--hairline); border-radius: 5px; overflow: hidden; display: flex; flex-direction: column; min-height: 244px; }
.config-card.light .vscode-window { border-color: var(--hairline-light); }
.vscode-bar { height: 26px; display: flex; align-items: center; gap: 6px; padding: 0 9px; font-family: var(--label); font-size: 9px; color: var(--dim); border-bottom: 1px solid var(--hairline); }
.config-card.light .vscode-bar { border-bottom-color: var(--hairline-light); }
.vscode-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--dim); opacity: .55; }
.vscode-dot.active { background: var(--accent); opacity: 1; }
.vscode-body { display: grid; grid-template-columns: 28px 82px 1fr; flex: 1; min-height: 180px; }
.vscode-activity { display: grid; grid-template-rows: repeat(5, 28px); justify-items: center; padding-top: 6px; border-right: 1px solid var(--hairline); }
.config-card.light .vscode-activity { border-right-color: var(--hairline-light); }
.vscode-icon { position: relative; width: 15px; height: 15px; opacity: .62; margin-top: 7px; color: var(--dim); }
.vscode-icon.on { color: var(--accent); opacity: 1; }
.vscode-icon.file { border: 1px solid currentColor; border-radius: 1px; }
.vscode-icon.file::after { content: ""; position: absolute; right: -1px; top: -1px; width: 5px; height: 5px; border-left: 1px solid currentColor; border-bottom: 1px solid currentColor; background: var(--bg); }
.vscode-icon.search { border: 2px solid currentColor; border-radius: 50%; width: 13px; height: 13px; }
.vscode-icon.search::after { content: ""; position: absolute; right: -4px; bottom: -3px; width: 7px; height: 2px; background: currentColor; transform: rotate(45deg); transform-origin: left center; }
.vscode-icon.branch::before { content: ""; position: absolute; left: 6px; top: 2px; width: 2px; height: 11px; background: currentColor; }
.vscode-icon.branch::after { content: ""; position: absolute; left: 3px; top: 2px; width: 8px; height: 8px; border: 2px solid currentColor; border-left: 0; border-bottom: 0; border-radius: 0 6px 0 0; }
.vscode-icon.gear { border: 2px solid currentColor; border-radius: 50%; }
.vscode-icon.gear::after { content: ""; position: absolute; inset: 4px; border-radius: 50%; background: currentColor; }
.vscode-side { padding: 9px; border-right: 1px solid var(--hairline); font-size: 10px; color: var(--dim); line-height: 1.7; overflow: hidden; }
.config-card.light .vscode-side { border-right-color: var(--hairline-light); }
.vscode-side .active { color: var(--accent); font-weight: 700; }
.vscode-editor { overflow: hidden; }
.mini-code { font-family: var(--mono); font-size: 10.5px; line-height: 1.75; padding: 10px 12px; white-space: nowrap; }
.mini-code div { overflow: hidden; text-overflow: ellipsis; }
.vscode-status { height: 24px; display: flex; gap: 10px; align-items: center; justify-content: space-between; padding: 0 9px; font-family: var(--label); font-size: 9px; color: var(--dim); border-top: 1px solid var(--hairline); }
.config-card.light .vscode-status { border-top-color: var(--hairline-light); }
.shell-card { min-height: 260px; }
.shell-body { padding: 14px; font-size: 11px; line-height: 1.32; white-space: pre; overflow: hidden; flex: 1; font-variant-ligatures: none; font-feature-settings: "liga" 0, "calt" 0; }
.shell-body .brand { color: var(--accent); font-weight: 700; }
.shell-body .muted { color: var(--dim); }
.shell-body .quote { color: var(--fgc); font-weight: 700; }
.tool-body { padding: 14px; font-size: 11px; line-height: 1.7; overflow: hidden; flex: 1; }
.tool-body .key { color: var(--info); }
.tool-body .value { color: var(--accent); font-weight: 700; }
.tool-strip { display: grid; grid-template-columns: repeat(5, 1fr); height: 32px; margin-top: auto; }
.foot { display: flex; gap: 18px; align-items: center; padding: 80px 64px 0; color: var(--void-6); }
.star-line { flex: 1; height: 1px; background: var(--hairline); }
@media (max-width: 900px) {
  .hero, .section, .foot { padding-left: 20px; padding-right: 20px; }
  .hero-grid, .pair, .lime-pair, .ansi-dual { grid-template-columns: 1fr; }
  .legend-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .variant-grid { grid-template-columns: 1fr; }
  .config-grid, .config-grid.vscode-grid, .config-grid.editor-grid, .config-grid.shell-grid, .config-grid.tool-grid { grid-template-columns: 1fr; }
  .section-head { grid-template-columns: 1fr; }
}`;
}

function showcasePanes() {
  return `const { useState: _ueS, useEffect: _ueE } = React;

window.BzrCode = function Code({ sample, theme = 'dark', limeRole = 'functions' }) {
  return (
    <div className="code" data-theme={theme} data-lime-role={limeRole}>
      {sample.lines.map((toks, i) => (
        <div key={i} className={\`line \${i + 1 === sample.cur ? 'cur' : ''}\`}>
          <span className="gutter">{i + 1}</span>
          <span className="src">
            {toks.map(([type, text], j) => <span key={j} className={\`tok-\${type}\`}>{text}</span>)}
          </span>
        </div>
      ))}
    </div>
  );
};

window.BzrEditor = function Editor({ sample, variant, limeRole }) {
  return (
    <div className={\`pane \${variant.mode === 'light' ? 'light' : ''}\`} style={{ '--bg': variant.bg, background: variant.bg }}>
      <div className="pane-chrome">
        <div className="dots"><span className="dot live"></span><span className="dot"></span><span className="dot"></span></div>
        <div className="tab-row">
          <span className="tab active">{sample.name}</span>
          <span className="tab">README.md</span>
          <span className="tab">PORTS.md</span>
        </div>
        <span className="pane-meta">{sample.lang} · {variant.label}</span>
      </div>
      <BzrCode sample={sample} theme={variant.mode} limeRole={limeRole} />
      <div className="code-footer">
        <span className="live">● {variant.label}</span>
        <span>ln {sample.cur}, col 24</span>
        <span>spaces: 2</span>
        <span>lime: {limeRole}</span>
        <span style={{ marginLeft: 'auto' }}>✦ catch the stars</span>
      </div>
    </div>
  );
};`;
}

function showcaseTerminal() {
  return `const { Fragment: _BzrFrag } = React;

window.BzrStarshipTerminal = function StarshipTerminal({ variant }) {
  const s = variant.syntax;
  const fg = variant.fg;
  const dim = variant.fgFaint;
  const dim2 = variant.fgGhost;
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
  const styles = {
    pane: { background: variant.bg, color: fg },
    row: { whiteSpace: 'pre', display: 'block' },
    pwrap: { display: 'flex', alignItems: 'center', marginBottom: 2, marginTop: 6, fontFamily: 'var(--mono)', fontSize: 13 },
    chunk: { display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 9px', fontWeight: 600, fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: '22px' },
    wedgeR: (from, to) => ({ width: 0, height: 0, borderTop: '11px solid transparent', borderBottom: '11px solid transparent', borderLeft: \`9px solid \${from}\`, background: to, marginRight: 0 }),
    starLine: { color: variant.accentSoft, fontWeight: 700, fontFamily: 'var(--mono)', fontSize: 13, marginTop: 2, marginBottom: 8, letterSpacing: 0 },
    cmd: { color: fg },
  };
  const Prompt = ({ branch = 'main', git = '', cmd, dur, dir = '~/projects/bench', warn = false, ok = false, runtime }) => (
    <_BzrFrag>
      <div style={styles.pwrap}>
        <span style={{ ...styles.chunk, background: limeBg, color: limeFg }}>&nbsp;bzr&nbsp;</span>
        <span style={styles.wedgeR(limeBg, voidBg)}></span>
        <span style={{ ...styles.chunk, background: voidBg, color: dirFg, fontWeight: 500 }}>&nbsp;{dir}&nbsp;</span>
        <span style={styles.wedgeR(voidBg, smokeBg)}></span>
        {branch && <span style={{ ...styles.chunk, background: smokeBg, color: variant.accent, fontWeight: 500 }}>&nbsp; {branch}{' '}</span>}
        {git && <span style={{ ...styles.chunk, background: smokeBg, color: warn ? amber : ok ? green : amber, fontWeight: 500 }}>{git} </span>}
        {runtime && <span style={{ ...styles.chunk, background: smokeBg, color: blue, fontWeight: 500 }}>{runtime} </span>}
        {dur && <span style={{ ...styles.chunk, background: smokeBg, color: amber, fontWeight: 500 }}>⏱ {dur} </span>}
        <span style={styles.wedgeR(smokeBg, 'transparent')}></span>
      </div>
      <div style={styles.starLine}><span>✦</span> <span style={styles.cmd}>{cmd}</span></div>
    </_BzrFrag>
  );
  return (
    <div className={\`pane \${variant.mode === 'light' ? 'light' : ''}\`} style={{ '--bg': variant.bg }}>
      <div className="pane-chrome">
        <div className="dots"><span className="dot"></span><span className="dot"></span><span className="dot"></span></div>
        <div className="tab-row"><span className="tab active">zsh - bench - 132x42</span><span className="tab">logs</span></div>
        <span className="pane-meta">starship · {variant.label}</span>
      </div>
      <div className="term" style={styles.pane}>
        <Prompt branch="main" git="~2 ?1" cmd="git status -sb" />
        <div style={{ ...styles.row, color: dim }}>## main...origin/main</div>
        <div style={{ ...styles.row, color: amber }}> M src/Orbit.tsx</div>
        <div style={{ ...styles.row, color: amber }}> M bench/oscilloscope.py</div>
        <div style={{ ...styles.row, color: dim2 }}>?? notes/2026-05-bench.md</div>
        <Prompt branch="main" git="~2 ?1" cmd="cargo build --release" dur="4.81s" />
        <div style={styles.row}><span style={{ color: green, fontWeight: 600 }}>   Compiling </span><span>bizarre-sampler </span><span style={{ color: dim }}>v0.2.0</span></div>
        <div style={styles.row}><span style={{ color: amber, fontWeight: 600 }}>   warning</span><span>: unused variable: </span><span style={{ color: violet }}>\`epoch\`</span><span style={{ color: dim }}> -> src/orbit.rs:42:9</span></div>
        <div style={styles.row}><span style={{ color: green, fontWeight: 600 }}>    Finished </span><span style={{ color: dim }}>release [optimized] in 4.81s</span></div>
        <Prompt branch="main" git="~2 ?1" cmd={<>curl -s <span style={{ color: amber }}>https://api.bizarre.industries/orbits/iss</span> | jq .</>} runtime="rs 1.78" />
        <div style={{ ...styles.row, color: dim }}>{'{'}</div>
        <div style={styles.row}><span style={{ color: cyan }}>{'  "id"'}</span><span style={{ color: dim }}>: </span><span style={{ color: amber }}>"25544"</span><span style={{ color: dim }}>,</span></div>
        <div style={styles.row}><span style={{ color: cyan }}>{'  "epoch"'}</span><span style={{ color: dim }}>: </span><span style={{ color: amber }}>"2026-05-07T03:14:00Z"</span><span style={{ color: dim }}>,</span></div>
        <div style={styles.row}><span style={{ color: cyan }}>{'  "a_km"'}</span><span style={{ color: dim }}>: </span><span style={{ color: blue }}>6791.2</span><span style={{ color: dim }}>,</span></div>
        <div style={styles.row}><span style={{ color: cyan }}>{'  "live"'}</span><span style={{ color: dim }}>: </span><span style={{ color: green, fontWeight: 600 }}>true</span></div>
        <div style={{ ...styles.row, color: dim }}>{'}'}</div>
        <Prompt branch="theme/syntax" git="+5" ok cmd="npm test" dur="2.4s" runtime="node 22" />
        <div style={{ ...styles.row, color: green, fontWeight: 600 }}>generated: clean</div>
        <div style={{ ...styles.row, color: dim }}>validation: json, toml, plist, xml, shell, lua</div>
        <div style={styles.pwrap}>
          <span style={{ ...styles.chunk, background: limeBg, color: limeFg }}>&nbsp;bzr&nbsp;</span>
          <span style={styles.wedgeR(limeBg, voidBg)}></span>
          <span style={{ ...styles.chunk, background: voidBg, color: dirFg, fontWeight: 500 }}>&nbsp;~/themes/bizarre&nbsp;</span>
          <span style={styles.wedgeR(voidBg, smokeBg)}></span>
          <span style={{ ...styles.chunk, background: smokeBg, color: variant.accent, fontWeight: 500 }}>&nbsp; theme/regen </span>
          <span style={{ ...styles.chunk, background: smokeBg, color: green, fontWeight: 500 }}>+5 </span>
          <span style={styles.wedgeR(smokeBg, 'transparent')}></span>
        </div>
        <div style={styles.starLine}><span>✦</span> <span className="blink" style={{ background: fg, width: 8, height: 16, display: 'inline-block', verticalAlign: '-3px' }}></span></div>
      </div>
    </div>
  );
};`;
}

function showcaseMain() {
  return `const { useState: _Sus, useMemo: _Smm, useEffect: _Sue } = React;

const P = window.BZR_PALETTE;
const VARIANTS = P.variantOrder.map((id) => ({ id, ...P.variants[id] }));
const SYNTAX_LEGEND = ${JSON.stringify(syntaxRoles.map(([role, , name, ex]) => [role, name, ex]))};
const TERMINAL_TARGETS = [
  { shot: 'terminal-alacritty', name: 'Alacritty', file: 'terminals/alacritty/bizarre-void.toml', variant: 'void', cmd: 'alacritty --config-file bizarre-void.toml' },
  { shot: 'terminal-kitty', name: 'Kitty', file: 'terminals/kitty/bizarre-void.conf', variant: 'void-hicontrast', cmd: 'kitty +kitten themes Bizarre Void' },
  { shot: 'terminal-ghostty', name: 'Ghostty', file: 'terminals/ghostty/bizarre-workshop', variant: 'workshop', cmd: 'theme = bizarre-workshop' },
  { shot: 'terminal-iterm2', name: 'iTerm2', file: 'terminals/iterm2/bizarre-paper.itermcolors', variant: 'paper', cmd: 'open bizarre-paper.itermcolors' },
  { shot: 'terminal-wezterm', name: 'WezTerm', file: 'terminals/wezterm/bizarre.lua', variant: 'bone', cmd: 'color_scheme = Bizarre Bone' },
  { shot: 'terminal-windows-terminal', name: 'Windows Terminal', file: 'terminals/windows-terminal/schemes.json', variant: 'void', cmd: 'colorScheme: Bizarre Void' },
  { shot: 'terminal-tmux', name: 'tmux', file: 'terminals/tmux/bizarre.tmux.conf', variant: 'workshop', cmd: 'source-file bizarre.tmux.conf' },
  { shot: 'terminal-zellij', name: 'Zellij', file: 'terminals/zellij/bizarre.kdl', variant: 'paper', cmd: 'theme "bizarre-paper"' },
];
const VSCODE_TARGETS = VARIANTS.map((v) => ({
  shot: 'vscode-' + v.id,
  name: v.label,
  file: 'editors/vscode/themes/bizarre-' + v.id + '-color-theme.json',
  variant: v.id,
}));
const EDITOR_TARGETS = [
  { shot: 'editor-zed', name: 'Zed', file: 'editors/zed/themes/bizarre.json', variant: 'void', lang: 'TS' },
  { shot: 'editor-jetbrains', name: 'JetBrains', file: 'editors/jetbrains/bizarre-void.icls', variant: 'void-hicontrast', lang: 'Kotlin' },
  { shot: 'editor-sublime', name: 'Sublime Text', file: 'editors/sublime/bizarre-workshop.sublime-color-scheme', variant: 'workshop', lang: 'Rust' },
  { shot: 'editor-vim', name: 'Vim', file: 'editors/vim/colors/bizarre-paper.vim', variant: 'paper', lang: 'VimL' },
  { shot: 'editor-neovim', name: 'Neovim', file: 'editors/neovim/colors/bizarre-bone.vim', variant: 'bone', lang: 'Lua' },
  { shot: 'editor-base16', name: 'Base16', file: 'editors/neovim-base16/bizarre-void.yaml', variant: 'void', lang: 'YAML' },
];
const SHELL_TARGETS = [
  { shot: 'shell-bash', name: 'Bash', file: 'shells/banner/bizarre.bash', variant: 'void', cmd: 'source shells/banner/bizarre.bash' },
  { shot: 'shell-zsh', name: 'Zsh', file: 'shells/banner/bizarre.zsh', variant: 'void-hicontrast', cmd: 'source shells/banner/bizarre.zsh' },
  { shot: 'shell-fish', name: 'Fish', file: 'shells/banner/bizarre.fish', variant: 'workshop', cmd: 'source shells/banner/bizarre.fish' },
  { shot: 'shell-powershell', name: 'PowerShell', file: 'shells/banner/bizarre.ps1', variant: 'paper', cmd: '. ./shells/banner/bizarre.ps1' },
  { shot: 'prompt-starship', name: 'Starship', file: 'prompt/starship.toml', variant: 'bone', cmd: 'starship init zsh' },
];
const TOOL_TARGETS = [
  { shot: 'tool-aerospace', name: 'AeroSpace', file: 'tools/aerospace/aerospace.toml', variant: 'void', key: 'focused border', value: P.brand.signalLime },
  { shot: 'tool-forklift', name: 'ForkLift', file: 'tools/forklift/Bizarre.json', variant: 'paper', key: 'selection', value: P.brand.limeInk },
  { shot: 'tool-jujutsu', name: 'Jujutsu', file: 'tools/jujutsu/config.toml', variant: 'workshop', key: 'change id', value: P.brand.signalLime },
  { shot: 'tool-starship', name: 'Starship', file: 'prompt/starship.toml', variant: 'bone', key: 'prompt block', value: P.brand.limeInk },
];
const MINI_WORDMARK = ['BIZARRE', 'INDUSTRIES'];
const WORDMARK = ${JSON.stringify(shellWordmark, null, 2)};

function variantById(id) {
  return { id, ...P.variants[id] };
}

function cardStyle(v) {
  return { '--bg': v.bg, '--fgc': v.fg, '--dim': v.fgDim, '--accent': v.accent, '--info': v.syntax.info, background: v.bg, color: v.fg };
}

function TerminalConfigCard({ target }) {
  const v = variantById(target.variant);
  return (
    <div className={'config-card ' + (v.mode === 'light' ? 'light' : '')} data-config-shot={target.shot} style={cardStyle(v)}>
      <div className="config-title"><strong>{target.name}</strong><code>{target.file}</code></div>
      <div className="mini-ansi">{Object.entries(v.ansi).map(([name, hex]) => <span className="ansi-chip" key={name} title={name + ' ' + hex} style={{ background: hex }}></span>)}</div>
      <div className="config-prompt"><span className="path">~/themes</span> <span className="cmd">✦</span> {target.cmd}<br/><span style={{ color: v.fgFaint }}>ansi 16 · accent {v.accent}</span></div>
    </div>
  );
}

function MiniVscodeCode({ variant }) {
  const s = variant.syntax;
  return (
    <div className="mini-code">
      <div><span style={{ color: s.kwDecl }}>export const</span> <span style={{ color: variant.accent }}>palette</span> <span style={{ color: s.op }}>=</span> <span style={{ color: s.punct }}>{'{'}</span></div>
      <div>&nbsp;&nbsp;<span style={{ color: s.prop }}>accent</span><span style={{ color: s.punct }}>:</span> <span style={{ color: s.string }}>'{variant.accent}'</span><span style={{ color: s.punct }}>,</span></div>
      <div>&nbsp;&nbsp;<span style={{ color: s.fn }}>renderTheme</span><span style={{ color: s.punct }}>(</span><span style={{ color: s.param }}>surface</span><span style={{ color: s.punct }}>)</span> <span style={{ color: s.punct }}>{'{'}</span></div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: s.kwCtrl }}>return</span> <span style={{ color: s.builtin }}>paint</span><span style={{ color: s.punct }}>(</span><span style={{ color: s.param }}>surface</span><span style={{ color: s.punct }}>)</span></div>
      <div>&nbsp;&nbsp;<span style={{ color: s.punct }}>{'}'}</span></div>
      <div><span style={{ color: s.punct }}>{'}'}</span><span style={{ color: s.punct }}>;</span></div>
    </div>
  );
}

function VscodeConfigCard({ target }) {
  const v = variantById(target.variant);
  return (
    <div className={'config-card ' + (v.mode === 'light' ? 'light' : '')} data-config-shot={target.shot} style={cardStyle(v)}>
      <div className="config-title"><strong>{target.name}</strong><code>{target.file}</code></div>
      <div className="vscode-window" style={{ background: v.bg }}>
        <div className="vscode-bar"><span className="vscode-dot active"></span><span className="vscode-dot"></span><span className="vscode-dot"></span><span style={{ marginLeft: 'auto' }}>VS Code</span></div>
        <div className="vscode-body">
          <div className="vscode-activity"><span className="vscode-icon file on"></span><span className="vscode-icon search"></span><span className="vscode-icon branch"></span><span className="vscode-icon gear"></span></div>
          <div className="vscode-side"><div className="active">themes</div><div>bizarre</div><div>palette.js</div><div>showcase</div></div>
          <div className="vscode-editor"><MiniVscodeCode variant={v} /></div>
        </div>
        <div className="vscode-status"><span>{v.label}</span><span>{v.mode}</span></div>
      </div>
    </div>
  );
}

function EditorConfigCard({ target }) {
  const v = variantById(target.variant);
  return (
    <div className={'config-card ' + (v.mode === 'light' ? 'light' : '')} data-config-shot={target.shot} style={cardStyle(v)}>
      <div className="config-title"><strong>{target.name}</strong><code>{target.file}</code></div>
      <div className="tool-body">
        <div><span className="key">variant</span>: <span className="value">{v.label}</span></div>
        <div><span className="key">language</span>: <span className="value">{target.lang}</span></div>
        <div><span className="key">background</span>: {v.bg}</div>
        <div><span className="key">foreground</span>: {v.fg}</div>
        <div><span className="key">function</span>: <span className="value">{v.syntax.fn}</span></div>
        <div><span className="key">string</span>: {v.syntax.string}</div>
      </div>
      <div className="tool-strip">{[v.bg2, v.bg3, v.syntax.kwCtrl, v.syntax.string, v.accent].map((hex) => <span key={hex} style={{ background: hex }}></span>)}</div>
    </div>
  );
}

function ShellConfigCard({ target }) {
  const v = variantById(target.variant);
  const isPrompt = target.name === 'Starship';
  return (
    <div className={'config-card shell-card ' + (v.mode === 'light' ? 'light' : '')} data-config-shot={target.shot} style={cardStyle(v)}>
      <div className="config-title"><strong>{target.name}</strong><code>{target.file}</code></div>
      <div className="shell-body">
        {MINI_WORDMARK.map((line) => <React.Fragment key={line}><span className="brand">{line}</span>{'\\n'}</React.Fragment>)}
        <span className="muted">BZR / {isPrompt ? 'PROMPT' : 'SHELL'} / V0.2</span>{'\\n\\n'}
        <span className="quote">{isPrompt ? '✦ ~/themes  main +5' : 'CATCH THE STARS.'}</span>{'\\n'}
        <span className="muted">{target.cmd}</span>
      </div>
    </div>
  );
}

function ToolConfigCard({ target }) {
  const v = variantById(target.variant);
  return (
    <div className={'config-card ' + (v.mode === 'light' ? 'light' : '')} data-config-shot={target.shot} style={cardStyle(v)}>
      <div className="config-title"><strong>{target.name}</strong><code>{target.file}</code></div>
      <div className="tool-body">
        <div><span className="key">{target.key}</span>: <span className="value">{target.value}</span></div>
        <div><span className="key">surface</span>: {v.bg}</div>
        <div><span className="key">border</span>: {v.border}</div>
        <div><span className="key">text</span>: {v.fg}</div>
        <div><span className="key">status</span>: {v.syntax.ok} / {v.syntax.warn} / {v.syntax.error}</div>
      </div>
      <div className="tool-strip">{[v.bg, v.bg2, v.bg3, v.fg, v.accent].map((hex) => <span key={hex} style={{ background: hex }}></span>)}</div>
    </div>
  );
}

window.BzrShowcase = function Showcase({ tweaksProp }) {
  const t = tweaksProp || (window.useTweaks ? window.useTweaks(window.BZR_TWEAK_DEFAULTS)[0] : window.BZR_TWEAK_DEFAULTS);
  const samples = window.BZR_SAMPLES;
  const sample = samples[t.sampleLang || 'ts'];
  const limeRole = t.limeRole || 'functions';
  const visible = t.activeVariant || 'pairs';
  const shown = visible === 'pairs'
    ? [P.variants.void, P.variants.paper, P.variants['void-hicontrast'], P.variants.workshop, P.variants.bone].map((v, i) => ({ id: ['void','paper','void-hicontrast','workshop','bone'][i], ...v }))
    : visible === 'all'
      ? VARIANTS
      : VARIANTS.filter((v) => v.id === visible);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--lime-active', P.brand.signalLime);
    document.documentElement.style.setProperty('--lime', P.brand.signalLime);
    document.documentElement.style.setProperty('--lime-glow', P.brand.limeGlow);
    document.documentElement.style.setProperty('--lime-ink', P.brand.limeInk);
  }, []);

  return (
    <div className="showcase">
      <header className="hero" data-shot="hero">
        <div className="eyebrow">
          <span className="star">✦</span>
          <span>BIZARRE INDUSTRIES</span>
          <span className="pill">THEMES / V0.2</span>
          <span className="pill">MAY 2026</span>
          <span className="pill">EVERY EDITOR. EVERY TERMINAL.</span>
        </div>
        <div className="hero-grid">
          <div>
            <h1 className="h1">
              <span className="stack"><span className="lime">EVERY</span> EDITOR.</span>
              <span className="stack">EVERY <span className="gray">TERMINAL.</span></span>
              <span className="stack">ONE <span className="lime">LIME</span>.</span>
            </h1>
          </div>
          <div>
            <p className="lede">Bizarre Industries themes use one canonical palette across editors, terminals, prompts, shells, and desktop tools. GitHub Monaspace carries the interface: Neon for code, Xenon for display, Krypton for labels, Argon for prose.</p>
            <dl className="hero-meta">
              <div><dt>brand accent</dt><dd>Signal Lime · {P.brand.signalLime}</dd></div>
              <div><dt>paper accent</dt><dd>Lime Ink · {P.brand.limeInk}</dd></div>
              <div><dt>type</dt><dd>Monaspace Neon · Xenon · Krypton</dd></div>
              <div><dt>variants</dt><dd>5 palettes · generated configs</dd></div>
            </dl>
          </div>
        </div>
        <div className="slogan-strip"><span>BZR / 002</span><span className="lime">CATCH THE STARS.</span><span>SCROLL</span></div>
      </header>

      <section className="section" data-shot="palette-ansi">
        <div className="section-head">
          <span className="section-num">§ 01 / PALETTE</span>
          <h2 className="section-title">Two limes. One brand.</h2>
          <span className="section-sub">dark · light · ansi</span>
        </div>
        <div className="lime-pair">
          <div className="lime-card" style={{ background: P.variants.void.bg, color: P.variants.void.fg }}>
            <div className="lime-swatch" style={{ background: P.brand.signalLime }}></div>
            <div><div className="lime-meta">DARK · BRAND HERO</div><div className="lime-name" style={{ color: P.brand.signalLime }}>Signal Lime</div><div className="lime-hex">{P.brand.signalLime}</div><div className="lime-desc">Hero accent for dark surfaces, prompt blocks, function names, cursor stars, and active focus rings.</div></div>
          </div>
          <div className="lime-card" style={{ background: P.variants.paper.bg, color: P.variants.paper.fg, borderColor: 'rgba(14,14,14,.12)' }}>
            <div className="lime-swatch" style={{ background: P.brand.limeInk }}></div>
            <div><div className="lime-meta">LIGHT · INK</div><div className="lime-name" style={{ color: P.brand.limeInk }}>Lime Ink</div><div className="lime-hex">{P.brand.limeInk}</div><div className="lime-desc">Darkened lime for readable type on paper and bone without losing brand recognition.</div></div>
          </div>
        </div>
        <div className="section-head" style={{ marginTop: 56 }}>
          <span className="section-num">§ 01.B / ANSI</span>
          <h2 className="section-title">Conventional ANSI, tuned to Bizarre.</h2>
          <span className="section-sub">8 normal · 8 bright</span>
        </div>
        <div className="ansi-dual">
          {['void', 'paper'].map((id) => {
            const v = P.variants[id];
            return <div className="ansi-half" key={id}><div className="ansi-half-label">{v.label}</div><div className="ansi-grid">{Object.entries(v.ansi).map(([nm, hex]) => <div key={nm} className="ansi-cell" style={{ background: hex, color: window.BZR_TEXT_ON[hex] || '#fff' }}><span className="nm">{nm}</span><span className="hex">{hex}</span></div>)}</div></div>;
          })}
        </div>
      </section>

      <section className="section" data-shot="syntax">
        <div className="section-head">
          <span className="section-num">§ 02 / SYNTAX</span>
          <h2 className="section-title">29 token roles. Each earns a hue.</h2>
          <span className="section-sub">control vs decl · param vs prop · template vs string</span>
        </div>
        <div className="legend-grid">
          {SYNTAX_LEGEND.map(([role, name, ex]) => (
            <React.Fragment key={role}>
              <div className="legend-card legend-dark"><div className="code" data-theme="dark" data-lime-role={limeRole} style={{ padding: 0 }}><span className={\`tok-\${role}\`} style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 600 }}>{ex}</span></div><div className="legend-name">{name}</div><div className="legend-key">{role}</div></div>
              <div className="legend-card legend-light"><div className="code" data-theme="light" data-lime-role={limeRole} style={{ padding: 0 }}><span className={\`tok-\${role}\`} style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 600 }}>{ex}</span></div><div className="legend-name">{name}</div><div className="legend-key">{role}</div></div>
            </React.Fragment>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head"><span className="section-num">§ 03 / STATEMENT</span><h2 className="section-title">The wordmark is Lime.</h2><span className="section-sub">brand · type · accent</span></div>
        <p className="big-type">BZR<span className="lime">.</span><br/><span className="out">CATCH</span> THE <span className="lime">STARS</span><span className="lime">.</span></p>
      </section>

      <section className="section" data-shot="variants">
        <div className="section-head"><span className="section-num">§ 04 / VARIANTS</span><h2 className="section-title">Five generated palettes.</h2><span className="section-sub">dark · light · high contrast</span></div>
        <div className="variant-grid">
          {VARIANTS.map((v) => <div className="variant-card" key={v.id} style={{ '--bg': v.bg, '--fgc': v.fg, '--dim': v.fgDim }}><div className="variant-swatch"><div className="variant-name" style={{ color: v.accent }}>{v.label}</div><div className="variant-sub">{v.sub}</div></div><div className="variant-strip">{[v.bg, v.bg2, v.bg3, v.fg, v.accent, v.syntax.info].map((hex) => <span key={hex} style={{ background: hex }}></span>)}</div></div>)}
        </div>
      </section>

      <section className="section" data-shot="terminal-colors">
        <div className="section-head"><span className="section-num">§ 05 / TERMINAL COLORS</span><h2 className="section-title">Every terminal config gets the palette.</h2><span className="section-sub">alacritty · kitty · ghostty · iterm2 · wezterm · windows terminal · tmux · zellij</span></div>
        <div className="config-grid">
          {TERMINAL_TARGETS.map((target) => <TerminalConfigCard key={target.shot} target={target} />)}
        </div>
      </section>

      <section className="section" data-shot="vscode-themes">
        <div className="section-head"><span className="section-num">§ 06 / VS CODE</span><h2 className="section-title">All VS Code variants.</h2><span className="section-sub">activity bar · editor · status bar</span></div>
        <div className="config-grid vscode-grid">
          {VSCODE_TARGETS.map((target) => <VscodeConfigCard key={target.shot} target={target} />)}
        </div>
      </section>

      <section className="section" data-shot="editor-themes">
        <div className="section-head"><span className="section-num">§ 07 / EDITORS</span><h2 className="section-title">Editor ports beyond VS Code.</h2><span className="section-sub">zed · jetbrains · sublime · vim · neovim · base16</span></div>
        <div className="config-grid editor-grid">
          {EDITOR_TARGETS.map((target) => <EditorConfigCard key={target.shot} target={target} />)}
        </div>
      </section>

      <section className="section" data-shot="shells">
        <div className="section-head"><span className="section-num">§ 08 / SHELLS</span><h2 className="section-title">Shell banners and prompt.</h2><span className="section-sub">bash · zsh · fish · powershell · starship</span></div>
        <div className="config-grid shell-grid">
          {SHELL_TARGETS.map((target) => <ShellConfigCard key={target.shot} target={target} />)}
        </div>
      </section>

      <section className="section" data-shot="tools">
        <div className="section-head"><span className="section-num">§ 09 / TOOLS</span><h2 className="section-title">Desktop and workflow tools.</h2><span className="section-sub">aerospace · forklift · jujutsu · starship</span></div>
        <div className="config-grid tool-grid">
          {TOOL_TARGETS.map((target) => <ToolConfigCard key={target.shot} target={target} />)}
        </div>
      </section>

      {shown.map((v, idx) => (
        <section key={v.id} className={\`section \${v.mode === 'light' ? 'light-section' : ''}\`}>
          <div className="section-head"><span className="section-num">§ {String(idx + 10).padStart(2, '0')} / {v.mode.toUpperCase()}</span><h2 className="section-title">{v.label}</h2><span className="section-sub">{v.sub}</span></div>
          <div className="pair"><BzrEditor sample={sample} variant={v} limeRole={limeRole} /><BzrStarshipTerminal variant={v} /></div>
        </section>
      ))}

      <section className="section" data-shot="shell-banner">
        <div className="section-head"><span className="section-num">§ 20 / SHELL BANNER</span><h2 className="section-title">First shell of the day.</h2><span className="section-sub">zsh · bash · fish · powershell</span></div>
        <div className="banner-pane">
          {WORDMARK.bizarre.map((line) => <div className="bzr" key={line}>{line}</div>)}
          <div>&nbsp;</div>
          {WORDMARK.industries.map((line) => <div className="gray" key={line}>{line}</div>)}
          <div>&nbsp;</div>
          <div className="meta">  BZR / SHELL / V0.2 / MAY 2026   <span className="star">✦</span>   host: bench</div>
          <div>&nbsp;</div>
          <div className="quote">  {t.bannerLine || 'The hands knew it before the plan did.'}</div>
          <div>&nbsp;</div>
          <div className="slogan">  CATCH THE STARS.</div>
        </div>
      </section>

      <footer className="foot"><span>BZR / THEMES / V0.2</span><span className="star-line"></span><span className="lime">✦ CATCH THE STARS.</span></footer>
    </div>
  );
};`;
}

function showcaseIndex() {
  const paletteJson = JSON.stringify({
    brand: palette.brand,
    fonts: palette.fonts,
    syntax: palette.syntax,
    ansi: palette.ansi,
    variants: palette.variants,
    variantOrder: palette.variantOrder,
  });
  const textOn = {};
  for (const v of variants) for (const hex of [v.bg, v.bg2, v.bg3, v.bg4, v.fg, v.accent, v.accentSoft, ...colorList(v)]) textOn[hex] = fgFor(hex);
  const contrast = Object.fromEntries(variants.map((v) => [v.id, fgFor(v.accent)]));
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Bizarre Industries Themes v0.2</title>
<link rel="preconnect" href="https://cdn.jsdelivr.net" />
<style>
@font-face{font-family:'Monaspace Neon';font-weight:400;font-style:normal;src:url('https://cdn.jsdelivr.net/gh/githubnext/monaspace@v1.101/fonts/webfonts/MonaspaceNeon-Regular.woff2') format('woff2')}
@font-face{font-family:'Monaspace Neon';font-weight:600;font-style:normal;src:url('https://cdn.jsdelivr.net/gh/githubnext/monaspace@v1.101/fonts/webfonts/MonaspaceNeon-SemiBold.woff2') format('woff2')}
@font-face{font-family:'Monaspace Neon';font-weight:700;font-style:normal;src:url('https://cdn.jsdelivr.net/gh/githubnext/monaspace@v1.101/fonts/webfonts/MonaspaceNeon-Bold.woff2') format('woff2')}
@font-face{font-family:'Monaspace Neon';font-weight:400;font-style:italic;src:url('https://cdn.jsdelivr.net/gh/githubnext/monaspace@v1.101/fonts/webfonts/MonaspaceNeon-Italic.woff2') format('woff2')}
@font-face{font-family:'Monaspace Xenon';font-weight:600;font-style:normal;src:url('https://cdn.jsdelivr.net/gh/githubnext/monaspace@v1.101/fonts/webfonts/MonaspaceXenon-SemiBold.woff2') format('woff2')}
@font-face{font-family:'Monaspace Krypton';font-weight:500;font-style:normal;src:url('https://cdn.jsdelivr.net/gh/githubnext/monaspace@v1.101/fonts/webfonts/MonaspaceKrypton-Medium.woff2') format('woff2')}
@font-face{font-family:'Monaspace Argon';font-weight:400;font-style:normal;src:url('https://cdn.jsdelivr.net/gh/githubnext/monaspace@v1.101/fonts/webfonts/MonaspaceArgon-Regular.woff2') format('woff2')}
</style>
<link rel="stylesheet" href="tokens.css" />
<link rel="stylesheet" href="showcase.css" />
<link rel="stylesheet" href="syntax.css" />
</head>
<body>
<div id="root"></div>
<script>
window.BZR_PALETTE = ${paletteJson};
window.BZR_TEXT_ON = ${JSON.stringify(textOn)};
window.BZR_CONTRAST = ${JSON.stringify(contrast)};
window.BZR_TWEAK_DEFAULTS = { accent: "${palette.brand.signalLime}", accentGlow: "${palette.brand.limeGlow}", accentLight: "${palette.brand.limeInk}", limeRole: "functions", sampleLang: "ts", activeVariant: "pairs", bannerLine: "The hands knew it before the plan did." };
</script>
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" crossorigin="anonymous"></script>
<script src="samples.js"></script>
<script type="text/babel">
${showcasePanes()}
</script>
<script type="text/babel">
${showcaseTerminal()}
</script>
<script type="text/babel">
${showcaseMain()}
</script>
<script type="text/babel">
function App() {
  const [t, setT] = window.useTweaks ? window.useTweaks(window.BZR_TWEAK_DEFAULTS) : [window.BZR_TWEAK_DEFAULTS, () => {}];
  const TP = window.TweaksPanel, TS = window.TweakSelect, Section = window.TweakSection;
  return (
    <>
      <window.BzrShowcase tweaksProp={t} />
      {TP && <TP title="Tweaks">
        <Section title="Lime role"><TS label="Accent maps to" value={t.limeRole} options={[{value:'functions',label:'Functions'},{value:'keywords',label:'Keywords'},{value:'strings',label:'Strings'},{value:'types',label:'Types'},{value:'comments',label:'Comments'}]} onChange={v => setT('limeRole', v)} /></Section>
        <Section title="Code sample"><TS label="Language" value={t.sampleLang} options={[{value:'ts',label:'TypeScript'},{value:'py',label:'Python'},{value:'rs',label:'Rust'},{value:'go',label:'Go'},{value:'lua',label:'Lua'},{value:'sh',label:'Shell'},{value:'c',label:'C'}]} onChange={v => setT('sampleLang', v)} /></Section>
        <Section title="Variant focus"><TS label="Show" value={t.activeVariant} options={[{value:'pairs',label:'Dark + Light pairs'},{value:'all',label:'All variants'},...window.BZR_PALETTE.variantOrder.map(id => ({value:id,label:window.BZR_PALETTE.variants[id].label}))]} onChange={v => setT('activeVariant', v)} /></Section>
      </TP>}
    </>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
</script>
</body>
</html>`;
}

function generateShowcase() {
  out('showcase/index.html', showcaseIndex());
  remove(['showcase/Bizarre', 'html'].join(' Code' + 'x.'));
  out('showcase/tokens.css', tokensCss());
  out('showcase/colors_and_type.css', colorsAndTypeCss());
  out('showcase/syntax.css', syntaxCss());
  out('showcase/showcase.css', showcaseCss());
  out('showcase/showcase-panes.jsx', showcasePanes());
  out('showcase/showcase-terminal.jsx', showcaseTerminal());
  out('showcase/showcase-main.jsx', showcaseMain());
}

function paletteDoc() {
  return `# BIZARRE INDUSTRIES - Theme Palette Spec

Canonical color assignments. Every generated editor, terminal, shell, prompt, and tool config derives from [palette.js](palette.js).

\`BZR / THEMES / V0.2 / MAY 2026\`

## Brand Anchors

| Token | Hex | Role |
|---|---:|---|
| Signal Lime | \`${palette.brand.signalLime}\` | hero accent on dark |
| Lime Glow | \`${palette.brand.limeGlow}\` | secondary accent and hover |
| Lime Ink | \`${palette.brand.limeInk}\` | readable accent on light |
| Acid Lime | \`${palette.brand.acidLime}\` | optional saturated punch |
| Void Gray | \`${palette.brand.voidGray}\` | structural neutral |

## Variants

| Variant | Mode | Background | Foreground | Border | Accent |
|---|---|---:|---:|---:|---:|
${variants.map((v) => `| ${v.label} | ${v.mode} | \`${v.bg}\` | \`${v.fg}\` | \`${v.border}\` | \`${v.accent}\` |`).join('\n')}

## Syntax Roles

| Role | Dark | Light |
|---|---:|---:|
${syntaxRoles.map(([, key, name]) => `| ${name} | \`${palette.syntax.dark[key]}\` | \`${palette.syntax.light[key]}\` |`).join('\n')}

## ANSI 16

### Dark

| Slot | Name | Hex |
|---:|---|---:|
${ansiOrder.map(([key, name], i) => `| ${i} | ${name} | \`${palette.ansi.dark[key]}\` |`).join('\n')}

### Light

| Slot | Name | Hex |
|---:|---|---:|
${ansiOrder.map(([key, name], i) => `| ${i} | ${name} | \`${palette.ansi.light[key]}\` |`).join('\n')}

CATCH THE STARS.`;
}

function readme() {
  return `# BIZARRE INDUSTRIES - Editor, Terminal, Shell, And Tool Themes

\`BZR / THEMES / V0.2 / MAY 2026\`

A generated theming bundle for editors, terminals, shells, prompts, window managers, and desktop tools. One palette, five variants, GitHub Monaspace typography, and one rule: CATCH THE STARS.

![Bizarre theme showcase hero](showcase/assets/generated/hero.png)

## Showcase

Open [showcase/index.html](showcase/index.html) locally for the interactive preview. The README images below are rendered from that same showcase.

![Bizarre generated variants](showcase/assets/generated/variants.png)

![Bizarre syntax roles](showcase/assets/generated/syntax.png)

![Bizarre palette and ANSI](showcase/assets/generated/palette-ansi.png)

## Config Screenshots

Every shipped target gets a generated preview card in \`showcase/assets/generated/\`. These family sheets are rendered from [showcase/index.html](showcase/index.html).

![Bizarre terminal color configs](showcase/assets/generated/terminal-colors.png)

![Bizarre VS Code themes](showcase/assets/generated/vscode-themes.png)

![Bizarre editor theme configs](showcase/assets/generated/editor-themes.png)

![Bizarre shell banners and prompt](showcase/assets/generated/shells.png)

![Bizarre desktop and workflow tools](showcase/assets/generated/tools.png)

![Bizarre shell banner](showcase/assets/generated/shell-banner.png)

## Per-Target Screenshots

### Terminals

| Alacritty | Kitty | Ghostty | iTerm2 |
|---|---|---|---|
| ![Alacritty colors](showcase/assets/generated/terminal-colors-alacritty.png) | ![Kitty colors](showcase/assets/generated/terminal-colors-kitty.png) | ![Ghostty colors](showcase/assets/generated/terminal-colors-ghostty.png) | ![iTerm2 colors](showcase/assets/generated/terminal-colors-iterm2.png) |

| WezTerm | Windows Terminal | tmux | Zellij |
|---|---|---|---|
| ![WezTerm colors](showcase/assets/generated/terminal-colors-wezterm.png) | ![Windows Terminal colors](showcase/assets/generated/terminal-colors-windows-terminal.png) | ![tmux colors](showcase/assets/generated/terminal-tmux.png) | ![Zellij colors](showcase/assets/generated/terminal-zellij.png) |

### VS Code

| Void | Void Hi-Contrast | Workshop | Paper | Bone |
|---|---|---|---|---|
| ![VS Code Void](showcase/assets/generated/vscode-void.png) | ![VS Code Void Hi-Contrast](showcase/assets/generated/vscode-void-hicontrast.png) | ![VS Code Workshop](showcase/assets/generated/vscode-workshop.png) | ![VS Code Paper](showcase/assets/generated/vscode-paper.png) | ![VS Code Bone](showcase/assets/generated/vscode-bone.png) |

### Editors

| Zed | JetBrains | Sublime Text |
|---|---|---|
| ![Zed theme](showcase/assets/generated/editor-zed.png) | ![JetBrains theme](showcase/assets/generated/editor-jetbrains.png) | ![Sublime Text theme](showcase/assets/generated/editor-sublime.png) |

| Vim | Neovim | Base16 |
|---|---|---|
| ![Vim theme](showcase/assets/generated/editor-vim.png) | ![Neovim theme](showcase/assets/generated/editor-neovim.png) | ![Base16 theme](showcase/assets/generated/editor-base16.png) |

### Shells And Prompt

| Bash | Zsh | Fish | PowerShell | Starship |
|---|---|---|---|---|
| ![Bash banner](showcase/assets/generated/shell-bash.png) | ![Zsh banner](showcase/assets/generated/shell-zsh.png) | ![Fish banner](showcase/assets/generated/shell-fish.png) | ![PowerShell banner](showcase/assets/generated/shell-powershell.png) | ![Starship prompt](showcase/assets/generated/prompt-starship.png) |

### Tools

| AeroSpace | ForkLift | Jujutsu | Starship |
|---|---|---|---|
| ![AeroSpace config](showcase/assets/generated/tool-aerospace.png) | ![ForkLift config](showcase/assets/generated/tool-forklift.png) | ![Jujutsu config](showcase/assets/generated/tool-jujutsu.png) | ![Starship tool preview](showcase/assets/generated/tool-starship.png) |

## Install Examples

\`\`\`bash
# Generate every config from palette.js
npm run generate

# Render README screenshots
npm run render:showcase

# Verify generated files are current
npm test

# Starship prompt
cp prompt/starship.toml ~/.config/starship.toml

# Kitty
cp terminals/kitty/bizarre-void.conf ~/.config/kitty/themes/

# Alacritty
mkdir -p ~/.config/alacritty/themes
cp terminals/alacritty/*.toml ~/.config/alacritty/themes/

# Ghostty
cp terminals/ghostty/bizarre-void ~/.config/ghostty/themes/

# WezTerm
mkdir -p ~/.config/wezterm
cp terminals/wezterm/bizarre.lua ~/.config/wezterm/bizarre.lua
# then in wezterm.lua: return require('bizarre')

# Neovim
ln -s "$PWD/editors/neovim" ~/.config/nvim/pack/bizarre/start/bizarre.nvim
# then in init.lua: vim.cmd.colorscheme('bizarre-void')

# Vim
mkdir -p ~/.vim/colors
cp editors/vim/colors/*.vim ~/.vim/colors/

# Zed
mkdir -p ~/.config/zed/themes
cp editors/zed/themes/bizarre.json ~/.config/zed/themes/

# JetBrains
# import editors/jetbrains/bizarre-void.icls from Settings > Editor > Color Scheme

# Sublime Text
mkdir -p "$HOME/Library/Application Support/Sublime Text/Packages/User"
cp editors/sublime/*.sublime-color-scheme "$HOME/Library/Application Support/Sublime Text/Packages/User/"

# tmux
echo 'source-file ~/dotfiles/bizarre/terminals/tmux/bizarre.tmux.conf' >> ~/.tmux.conf

# VS Code
ln -s "$PWD/editors/vscode" ~/.vscode/extensions/bizarre-industries.bizarre-themes

# iTerm2
open terminals/iterm2/bizarre-void.itermcolors

# Zellij
mkdir -p ~/.config/zellij/themes
cp terminals/zellij/bizarre.kdl ~/.config/zellij/themes/

# Windows Terminal
# paste terminals/windows-terminal/schemes.json schemes into settings.json

# Shell banners
echo "source $PWD/shells/banner/bizarre.bash" >> ~/.bashrc
echo "source $PWD/shells/banner/bizarre.zsh" >> ~/.zshrc
echo "source $PWD/shells/banner/bizarre.fish" >> ~/.config/fish/config.fish
# PowerShell: dot-source shells/banner/bizarre.ps1 from your profile

# AeroSpace
mkdir -p ~/.config/aerospace
cp tools/aerospace/aerospace.toml ~/.config/aerospace/aerospace.toml

# ForkLift
# import tools/forklift/Bizarre.json through ForkLift theme preferences

# Jujutsu
mkdir -p ~/.config/jj
cp tools/jujutsu/config.toml ~/.config/jj/config.toml
\`\`\`

## Current Coverage

| Family | Targets |
|---|---|
| Editors | VS Code, Zed, JetBrains, Sublime Text, Vim, Neovim, Neovim Base16 |
| Terminals | Alacritty, Kitty, WezTerm, iTerm2, Ghostty, Windows Terminal, tmux, Zellij |
| Shells and prompt | Bash, Zsh, Fish, PowerShell, Starship |
| Tools | AeroSpace, ForkLift, Jujutsu |

## Variants

| Variant | Mood |
|---|---|
${variants.map((v) => `| ${v.label} | ${v.sub} |`).join('\n')}

## Source Of Truth

- Palette: [palette.js](palette.js)
- Palette spec: [PALETTE.md](PALETTE.md)
- Port roadmap: [PORTS.md](PORTS.md)

Signal Lime is reserved for functions, cursors, focus rings, and active command surfaces. Light variants use Lime Ink where raw Signal Lime would fail as text.`;
}

function portsDoc() {
  const shipped = [
    ['Editors', 'VS Code, Zed, JetBrains, Sublime Text, Vim, Neovim, Neovim Base16'],
    ['Terminals', 'Alacritty, Kitty, WezTerm, iTerm2, Ghostty, Windows Terminal, tmux, Zellij'],
    ['Shells and prompts', 'Bash, Zsh, Fish, PowerShell, Starship'],
    ['Desktop and tools', 'AeroSpace, ForkLift, Jujutsu'],
  ];
  const backlog = [
    ['Editors', 'Emacs, Helix, Lapce, Kate, Notepad++, Nova, Cursor, Visual Studio, Xcode, Android Studio'],
    ['Terminals', 'Foot, Konsole, Rio, Hyper, Terminator, Tilix, XFCE Terminal, GNOME Terminal, Black Box'],
    ['Shells and CLI/TUI', 'bat, btop, delta, dircolors, fzf, lazygit, yazi, eza, atuin, bottom, k9s, ranger, vivid'],
    ['Desktop apps', 'Raycast, Alfred, Obsidian, Logseq, Slack, Discord, Telegram, Spotify, qutebrowser'],
    ['Browser and web', 'Firefox, Chrome, Arc, Vivaldi, userstyles, startpages, documentation sites'],
    ['Design and devtools', 'Figma, Sketch, Insomnia, Postman, HTTPie, TablePlus, DBeaver, GitHub readme assets'],
    ['Docs and content', 'MkDocs, Docusaurus, Sphinx, LaTeX, Typst, Beamer, reveal.js'],
    ['OS and window managers', 'Hyprland, Sway, i3, Waybar, Polybar, SketchyBar, yabai, rofi, wofi'],
  ];
  return `# Bizarre Theme Ports

\`BZR / PORTS / V0.2 / MAY 2026\`

Catppuccin-scale coverage is the benchmark. This repo now ships generated configs for existing Bizarre targets and tracks future ports here instead of mixing roadmap decisions into the README.

Sources:
- [Catppuccin ports](https://catppuccin.com/ports/)
- [Catppuccin repositories](https://github.com/orgs/catppuccin/repositories?type=all)

## Shipped

| Family | Targets |
|---|---|
${shipped.map(([family, targets]) => `| ${family} | ${targets} |`).join('\n')}

## Planned Backlog

| Family | Candidate ports |
|---|---|
${backlog.map(([family, targets]) => `| ${family} | ${targets} |`).join('\n')}

## Port Rules

- Every port must use [palette.js](palette.js), not hand-picked colors.
- Every generated file must be covered by \`npm run check:generated\`.
- Every install example must point to a real file in this repo.
- Each new family needs one screenshot or realistic preview before README promotion.
- Monaspace Neon is default mono; Xenon, Krypton, and Argon support display, labels, and prose.`;
}

function generateDocs() {
  out('PALETTE.md', paletteDoc());
  out('README.md', readme());
  out('PORTS.md', portsDoc());
}

function generateAll() {
  maybeRemoveMemoryAgents();
  generateVSCode();
  generateZed();
  generateSublime();
  generateVimNeovim();
  generateBase16();
  generateJetBrains();
  generateTerminals();
  generateTools();
  generateShowcase();
  generateDocs();
}

generateAll();

if (check && dirty.length) {
  console.error('generated files are stale:');
  for (const file of dirty) console.error(`- ${file}`);
  process.exit(1);
}

if (check) console.log('generated files are current');
else console.log('generated files updated');
