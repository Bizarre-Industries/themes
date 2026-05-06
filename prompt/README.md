# Bizarre Industries — Starship prompt

`BZR / PROMPT / V0.1`

Powerline-style. Lime hero block holds `bzr`, void capsule holds the path, smoke capsule holds git. Last line is a single `✦` (Signal Lime Glow) — type starts after the star.

## Install

```bash
cp prompt/starship.toml ~/.config/starship.toml
```

Then in your shell rc, ensure starship is initialized AFTER the Bizarre banner:

```bash
# zsh
eval "$(starship init zsh)"
```

## Layout

```
 bzr  ~/projects/dumb-thing  main +1 ?2  ⏱ 4s  py 3.12      14:32
✦
```

CATCH THE STARS.
