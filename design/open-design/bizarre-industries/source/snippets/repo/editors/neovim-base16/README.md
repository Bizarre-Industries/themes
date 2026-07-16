# Bizarre Industries — Base16 / tinted-theming

`BZR / BASE16 / V0.2`

Base16 scheme files for the [tinted-theming](https://github.com/tinted-theming) ecosystem. The fixed string and function slots follow Base16; the last three chromatic slots keep Bizarre's documented emphasis.

## Slot mapping

| Slot | Bizarre role |
|---|---|
| base00–02 | background ramp |
| base03–05 | WCAG-readable muted foreground (fgDim; intentionally converged) |
| base06–07 | primary/high foreground |
| base08 | errors |
| base09 | numbers |
| base0A | Lime Glow/Lime Text emphasis |
| base0B | strings |
| base0C | regex |
| base0D | functions |
| base0E | decorators |
| base0F | types |

## Use

Drop a scheme into your tinted-theming workflow or feed it to a compatible Base16 generator:

```bash
flavours apply bizarre-void
# or
tinty install
tinty apply bizarre-void
```

CATCH THE STARS.
