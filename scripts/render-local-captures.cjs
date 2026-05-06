#!/usr/bin/env node

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'showcase/assets/generated');
const capture = { x: 80, y: 80, width: 1280, height: 760 };
const terminalContent = { x: 80, y: 146, width: 1280, height: 694 };
const vscodeContent = { x: 80, y: 150, width: 1280, height: 690 };

function log(message) {
  console.log(message);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    ...options,
  });
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || '').trim();
    throw new Error(`${command} ${args.join(' ')} failed${detail ? `: ${detail}` : ''}`);
  }
  return result.stdout || '';
}

function exists(command) {
  return spawnSync('sh', ['-lc', `command -v ${shellQuote(command)}`], { stdio: 'ignore' }).status === 0;
}

function appInstalled(name) {
  return fs.existsSync(`/Applications/${name}.app`);
}

function shellQuote(value) {
  return `'${String(value).replace(/'/gu, `'\\''`)}'`;
}

function osa(script) {
  const file = path.join(os.tmpdir(), `bizarre-capture-${process.pid}-${Date.now()}.applescript`);
  fs.writeFileSync(file, script);
  try {
    return run('osascript', [file]);
  } finally {
    fs.rmSync(file, { force: true });
  }
}

function rgb16FromComponent(value) {
  return Math.max(0, Math.min(65535, Math.round(value * 65535)));
}

function itermColor(value) {
  return `{${rgb16FromComponent(value['Red Component'])}, ${rgb16FromComponent(value['Green Component'])}, ${rgb16FromComponent(value['Blue Component'])}}`;
}

function itermColors() {
  const plist = path.join(root, 'terminals/iterm2/bizarre-void.itermcolors');
  return JSON.parse(run('plutil', ['-convert', 'json', '-o', '-', plist]));
}

function itermColorAssignments(colors) {
  const map = [
    ['background color', 'Background Color'],
    ['bold color', 'Bold Color'],
    ['cursor color', 'Cursor Color'],
    ['cursor text color', 'Cursor Text Color'],
    ['foreground color', 'Foreground Color'],
    ['selected text color', 'Selected Text Color'],
    ['selection color', 'Selection Color'],
    ['ANSI black color', 'Ansi 0 Color'],
    ['ANSI red color', 'Ansi 1 Color'],
    ['ANSI green color', 'Ansi 2 Color'],
    ['ANSI yellow color', 'Ansi 3 Color'],
    ['ANSI blue color', 'Ansi 4 Color'],
    ['ANSI magenta color', 'Ansi 5 Color'],
    ['ANSI cyan color', 'Ansi 6 Color'],
    ['ANSI white color', 'Ansi 7 Color'],
    ['ANSI bright black color', 'Ansi 8 Color'],
    ['ANSI bright red color', 'Ansi 9 Color'],
    ['ANSI bright green color', 'Ansi 10 Color'],
    ['ANSI bright yellow color', 'Ansi 11 Color'],
    ['ANSI bright blue color', 'Ansi 12 Color'],
    ['ANSI bright magenta color', 'Ansi 13 Color'],
    ['ANSI bright cyan color', 'Ansi 14 Color'],
    ['ANSI bright white color', 'Ansi 15 Color'],
  ];
  return map.map(([property, key]) => `set ${property} to ${itermColor(colors[key])}`).join('\n        ');
}

function terminalCapture(command, output, title, delay = 1.4) {
  if (!appInstalled('iTerm')) {
    log(`skip ${output}: iTerm2 not installed`);
    return false;
  }

  const colors = itermColors();
  const script = `
tell application "iTerm2"
  activate
  set captureWindow to (create window with default profile)
  tell current session of captureWindow
    set name to ${JSON.stringify(title)}
    ${itermColorAssignments(colors)}
    write text ${JSON.stringify(command)}
  end tell
end tell
delay 0.5
tell application "System Events"
  tell process "iTerm2"
    set frontmost to true
    set position of front window to {${capture.x}, ${capture.y}}
    set size of front window to {${capture.width}, ${capture.height}}
  end tell
end tell
delay ${delay}
do shell script "/usr/sbin/screencapture -x -R${terminalContent.x},${terminalContent.y},${terminalContent.width},${terminalContent.height} " & quoted form of ${JSON.stringify(path.join(outDir, output))}
tell application "iTerm2"
  try
    tell current session of captureWindow to write text "exit"
  end try
  delay 0.2
  try
    close captureWindow
  end try
end tell
`;
  osa(script);
  log(`rendered showcase/assets/generated/${output}`);
  return true;
}

function zsh(body, interactive = false) {
  return `/bin/zsh ${interactive ? '-ic' : '-lc'} ${shellQuote(body)}`;
}

function renderTerminal() {
  const body = `
cd ${shellQuote(root)}
printf '\\033[H\\033[2J\\033[3J'
printf '\\033[1;38;5;10mBizarre Void applied in iTerm2\\033[0m\\n'
printf '\\033[38;5;8mSource: terminals/iterm2/bizarre-void.itermcolors\\033[0m\\n\\n'
for i in {0..15}; do
  printf '\\033[48;5;%sm\\033[38;5;15m %02d \\033[0m ' "$i" "$i"
  if (( ($i + 1) % 8 == 0 )); then printf '\\n\\n'; fi
done
printf '\\033[38;5;10mbright green = Signal Lime\\033[0m  '
printf '\\033[38;5;12mblue\\033[0m  '
printf '\\033[38;5;13mmagenta\\033[0m  '
printf '\\033[38;5;11mamber\\033[0m\\n\\n'
printf 'palette.js -> terminals/iterm2/bizarre-void.itermcolors -> iTerm2 session\\n'
`;
  terminalCapture(zsh(body), 'local-iterm2.png', 'Bizarre Local Capture - iTerm2');
}

function renderShell() {
  const body = `
cd ${shellQuote(root)}
printf '\\033[H\\033[2J\\033[3J'
export BIZARRE_BANNER=1
source ${shellQuote(path.join(root, 'shells/banner/bizarre.zsh'))}
`;
  terminalCapture(zsh(body, true), 'local-zsh-banner.png', 'Bizarre Local Capture - Zsh Banner', 2);
}

function promptWorkspace(tempRoot) {
  const dir = path.join(tempRoot, 'prompt-workspace');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'panel.ts'), 'export const signal = "CATCH THE STARS";\n');
  run('git', ['init', '-q', '-b', 'bizarre-theme-regeneration'], { cwd: dir });
  return dir;
}

function renderStarship(tempRoot) {
  if (!exists('starship')) {
    log('skip local-starship.png: starship not installed');
    return;
  }

  const workspace = promptWorkspace(tempRoot);
  const body = `
cd ${shellQuote(workspace)}
printf '\\033[H\\033[2J\\033[3J'
printf '\\033[1;38;5;10mBizarre Starship prompt\\033[0m\\n'
printf '\\033[38;5;8mSource: prompt/starship.toml, rendered by local starship\\033[0m\\n\\n'
TERM=xterm-256color STARSHIP_CONFIG=${shellQuote(path.join(root, 'prompt/starship.toml'))} starship prompt --status=0 --cmd-duration=3162 --path ${shellQuote(workspace)} | perl -pe 's/%\\{//g; s/%\\}//g'
printf '\\n\\033[38;5;8mtool category: prompt / workflow surface\\033[0m\\n'
`;
  terminalCapture(zsh(body), 'local-starship.png', 'Bizarre Local Capture - Starship');
}

function sleep(seconds) {
  spawnSync('sleep', [String(seconds)], { stdio: 'ignore' });
}

function stopVsCodeUserData(userData) {
  spawnSync('pkill', ['-f', userData], { stdio: 'ignore' });
}

function writeVsCodeWorkspace(tempRoot) {
  const workspace = path.join(tempRoot, 'vscode-workspace');
  const userData = path.join(tempRoot, 'vscode-user');
  const extensions = path.join(tempRoot, 'vscode-extensions');
  const extensionTarget = path.join(extensions, 'bizarre-industries.bizarre-themes-0.2.0');
  fs.mkdirSync(path.join(userData, 'User'), { recursive: true });
  fs.mkdirSync(workspace, { recursive: true });
  fs.mkdirSync(extensions, { recursive: true });
  fs.cpSync(path.join(root, 'editors/vscode'), extensionTarget, { recursive: true });
  fs.writeFileSync(path.join(userData, 'User/settings.json'), `${JSON.stringify({
    'workbench.colorTheme': 'Bizarre Void',
    'workbench.startupEditor': 'none',
    'workbench.commandCenter': false,
    'workbench.editor.showTabs': true,
    'workbench.activityBar.location': 'default',
    'workbench.secondarySideBar.defaultVisibility': 'hidden',
    'workbench.sideBar.location': 'left',
    'workbench.statusBar.visible': true,
    'editor.fontFamily': 'Monaspace Neon, Menlo, SFMono-Regular, monospace',
    'editor.fontLigatures': false,
    'editor.fontSize': 15,
    'editor.lineHeight': 23,
    'editor.minimap.enabled': true,
    'editor.semanticHighlighting.enabled': true,
    'editor.renderValidationDecorations': 'off',
    'editor.renderWhitespace': 'selection',
    'problems.decorations.enabled': false,
    'typescript.validate.enable': false,
    'javascript.validate.enable': false,
    'window.zoomLevel': 0,
    'security.workspace.trust.enabled': false,
    'extensions.ignoreRecommendations': true,
    'telemetry.telemetryLevel': 'off',
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(userData, 'User/keybindings.json'), `${JSON.stringify([
    { key: 'cmd+alt+b', command: 'workbench.action.closeAuxiliaryBar' },
    { key: 'cmd+alt+s', command: 'workbench.action.closeSidebar' },
  ], null, 2)}\n`);
  const demo = path.join(workspace, 'bizarre-theme-demo.ts');
  fs.writeFileSync(demo, `type Variant = 'void' | 'workshop' | 'paper' | 'bone';

const palette = {
  brand: 'BIZARRE INDUSTRIES',
  accent: '#C6FF24',
  variant: 'void' satisfies Variant,
};

const targets = ['editor', 'terminal', 'shell', 'tool'] as const;

export function renderThemeLine(index: number) {
  const target = targets[index % targets.length];
  return \`\${palette.brand} / \${target} / \${palette.accent}\`;
}

console.log(renderThemeLine(0));
`);
  return { userData, extensions, workspace, demo };
}

function renderVsCode(tempRoot) {
  if (!exists('code')) {
    log('skip local-vscode.png: VS Code CLI not installed');
    return;
  }

  const local = writeVsCodeWorkspace(tempRoot);
  const args = [
    '--user-data-dir',
    local.userData,
    '--extensions-dir',
    local.extensions,
    '--disable-workspace-trust',
    '--skip-release-notes',
    '--skip-welcome',
    '--disable-experiments',
    '--disable-layout-restore',
    '--disable-extension',
    'GitHub.copilot-chat',
    '--disable-extension',
    'TypeScriptTeam.jsts-chat-features',
    '--disable-extension',
    'vscode.mermaid-chat-features',
    '--disable-extension',
    'vscode.prompt',
    '--new-window',
    local.demo,
  ];
  const child = spawn('code', args, { cwd: root, detached: true, stdio: 'ignore' });
  child.unref();

  const outputPath = path.join(outDir, 'local-vscode.png');
  const script = `
set foundWindow to missing value
set foundProcess to missing value
repeat 50 times
  delay 0.2
  tell application "System Events"
    repeat with codeProcess in (processes whose name is "Code")
      tell codeProcess
        repeat with candidateWindow in windows
          try
            if (name of candidateWindow contains "bizarre-theme-demo.ts") then
              set foundWindow to candidateWindow
              set foundProcess to codeProcess
              exit repeat
            end if
          end try
        end repeat
      end tell
      if foundWindow is not missing value then exit repeat
    end repeat
  end tell
  if foundWindow is not missing value then exit repeat
end repeat
if foundWindow is missing value then error "VS Code capture window not found"
tell application "System Events"
  tell foundProcess
    set frontmost to true
    perform action "AXRaise" of foundWindow
    set position of foundWindow to {${capture.x}, ${capture.y}}
    set size of foundWindow to {${capture.width}, ${capture.height}}
    delay 0.5
    key code 53
    delay 0.4
    key code 53
    delay 0.4
    keystroke "b" using {command down, option down}
    delay 0.4
    keystroke "s" using {command down, option down}
  end tell
end tell
delay 1.4
do shell script "/usr/sbin/screencapture -x -R${vscodeContent.x},${vscodeContent.y},${vscodeContent.width},${vscodeContent.height} " & quoted form of ${JSON.stringify(outputPath)}
tell application "System Events"
  tell foundProcess
    try
      click button 1 of foundWindow
    end try
  end tell
end tell
`;
  try {
    osa(script);
    log('rendered showcase/assets/generated/local-vscode.png');
  } catch (error) {
    throw error;
  } finally {
    stopVsCodeUserData(local.userData);
  }
}

function main() {
  if (process.platform !== 'darwin') {
    log('skip local captures: macOS required');
    return;
  }

  fs.mkdirSync(outDir, { recursive: true });
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bizarre-local-captures-'));
  try {
    renderVsCode(tempRoot);
    renderTerminal();
    renderShell();
    renderStarship(tempRoot);
  } finally {
    spawnSync('pkill', ['-f', tempRoot], { stdio: 'ignore' });
    sleep(0.3);
    try {
      fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 8, retryDelay: 200 });
    } catch (error) {
      console.warn(`warn cleanup ${tempRoot}: ${error.message}`);
    }
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
