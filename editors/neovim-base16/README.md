# Bizarre Industries — base16 / tinted-theming

`BZR / BASE16 / V0.1`

base16 spec files for the [tinted-theming](https://github.com/tinted-theming) ecosystem.

## Slot mapping (Bizarre's interpretation)

base16 ships with conventional roles. Lime is base0D (functions), keywords go to base0A (yellow slot — Lime Glow on dark, Acid Lime Ink on light) since base0E is pinned to magenta in the spec.

| slot | role | Bizarre |
|---|---|---|
| base00–07 | bg → fg ramp | void/midnight/smoke/ash → paper |
| base08 | variables | danger red |
| base09 | numbers | warn amber |
| base0A | classes (we use for keywords) | lime glow / acid lime ink |
| base0B | strings | ash gray (de-emphasized — brand rule) |
| base0C | regex | cyan |
| base0D | functions | **Signal Lime / Acid Lime Ink — the hero** |
| base0E | keywords (we use for constants/decorators) | magenta |
| base0F | deprecated (we use for types) | info blue |

## Use

Drop into your tinted-theming workflow, or feed to any base16 generator:

```bash
flavours apply bizarre-void
# or
tinty install
tinty apply bizarre-void
```

CATCH THE STARS.
