# BIZARRE INDUSTRIES — shell banner

`BZR / SHELL / V0.1`

Drops the wordmark (Signal Lime) + INDUSTRIES (Void Gray) + a rotating manifesto line + `CATCH THE STARS.` into the top of your shell.

By default: shows on the **first shell of the day**. Set `BIZARRE_BANNER=1` to force every shell, `=0` to silence.

## Install

```bash
# zsh
echo 'source ~/dotfiles/bizarre/shells/banner/bizarre.zsh' >> ~/.zshrc

# bash
echo 'source ~/dotfiles/bizarre/shells/banner/bizarre.bash' >> ~/.bashrc

# fish
echo 'source ~/dotfiles/bizarre/shells/banner/bizarre.fish' >> ~/.config/fish/config.fish

# PowerShell
Add-Content $PROFILE '. "$HOME\dotfiles\bizarre\shells\banner\bizarre.ps1"'
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

  BZR / SHELL / V0.1 / APR 2026   ✦   host: bench

  The hands knew it before the plan did.

  CATCH THE STARS.
```

The wordmark uses 24-bit truecolor (`#C6FF24` Signal Lime). INDUSTRIES is rendered in Void Gray. Add manifesto lines to `shells/manifesto.txt` — one per line.

The daily-show stamp is at `${XDG_CACHE_HOME:-~/.cache}/bizarre-banner.stamp`. Delete to re-trigger.
