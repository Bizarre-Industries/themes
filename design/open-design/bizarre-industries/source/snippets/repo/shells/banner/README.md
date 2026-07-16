# BIZARRE INDUSTRIES — shell banner

`BZR / SHELL / V0.2`

Drops the wordmark (Signal Lime) + INDUSTRIES (Void Gray) + a rotating manifesto line + `CATCH THE STARS.` into the top of your shell.

By default: shows on the **first shell of the day**. Set `BIZARRE_BANNER=1` to force every shell, `=0` to silence.

## Install

```bash
# zsh
line='source ~/dotfiles/bizarre/shells/banner/bizarre.zsh'
grep -qxF "$line" ~/.zshrc 2>/dev/null || printf '%s\n' "$line" >> ~/.zshrc

# bash
line='source ~/dotfiles/bizarre/shells/banner/bizarre.bash'
grep -qxF "$line" ~/.bashrc 2>/dev/null || printf '%s\n' "$line" >> ~/.bashrc

# fish
mkdir -p ~/.config/fish
line='source ~/dotfiles/bizarre/shells/banner/bizarre.fish'
grep -qxF "$line" ~/.config/fish/config.fish 2>/dev/null || printf '%s\n' "$line" >> ~/.config/fish/config.fish
```

```powershell
# PowerShell
$line = '. "$HOME\dotfiles\bizarre\shells\banner\bizarre.ps1"'
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $PROFILE) | Out-Null
if (-not (Test-Path $PROFILE) -or -not (Select-String -Path $PROFILE -SimpleMatch $line -Quiet)) {
  Add-Content -Path $PROFILE -Value $line
}
```

## What you get

```

 ██████╗ ██╗███████╗ █████╗ ██████╗ ██████╗ ███████╗
 ██╔══██╗██║╚══███╔╝██╔══██╗██╔══██╗██╔══██╗██╔════╝
 ██████╔╝██║  ███╔╝ ███████║██████╔╝██████╔╝█████╗
 ██╔══██╗██║ ███╔╝  ██╔══██║██╔══██╗██╔══██╗██╔══╝
 ██████╔╝██║███████╗██║  ██║██║  ██║██║  ██║███████╗
 ╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝

 ██╗███╗   ██╗██████╗ ██╗   ██╗███████╗████████╗██████╗ ██╗███████╗███████╗
 ██║████╗  ██║██╔══██╗██║   ██║██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝██╔════╝
 ██║██╔██╗ ██║██║  ██║██║   ██║███████╗   ██║   ██████╔╝██║█████╗  ███████╗
 ██║██║╚██╗██║██║  ██║██║   ██║╚════██║   ██║   ██╔══██╗██║██╔══╝  ╚════██║
 ██║██║ ╚████║██████╔╝╚██████╔╝███████║   ██║   ██║  ██║██║███████╗███████║
 ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝╚══════╝

  BZR / SHELL / V0.2 / APR 2026   ✦   host: bench

  The hands knew it before the plan did.

  CATCH THE STARS.
```

The wordmark uses 24-bit truecolor (`#C6FF24` Signal Lime). INDUSTRIES is rendered in Void Gray. Add manifesto lines to `shells/manifesto.txt` — one per line.

The daily-show stamp is at `${XDG_CACHE_HOME:-~/.cache}/bizarre-banner.stamp`. Delete to re-trigger.
