# Bizarre Industries — Starship prompt

`BZR / PROMPT / V0.2`

Powerline-style. Lime hero block holds `bzr`, void capsule holds the path, smoke capsule holds git. Last line is a single `✦` (Signal Lime Glow) — type starts after the star.

## Install

```bash
mkdir -p ~/.config
cp -n prompt/starship.toml ~/.config/starship.toml
```

If `~/.config/starship.toml` already exists, `cp -n` leaves it untouched. Manually merge the Bizarre `format`, `palette`, `[palettes.bizarre]`, and module sections you want into the existing config; do not replace an established Starship configuration wholesale.

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
