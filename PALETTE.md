# BIZARRE INDUSTRIES — Theme Palette Spec

Canonical color assignments. Every editor/terminal theme in this repo derives from this table.

`BZR / THEMES / V0.1 / APR 2026`

---

## Brand anchors

| Token | Hex | Role |
|---|---|---|
| `lime` | `#C6FF24` | Signal Lime — hero accent on dark |
| `lime-glow` | `#E8FF8A` | Lime Glow — secondary accent, hover |
| `lime-ink` | `#5E7A00` | Acid Lime — accent on light (WCAG AA) |
| `void` | `#0E0E0E` | Deep Void — primary dark bg |
| `void-2` | `#1A1A1A` | Midnight — elevated dark |
| `void-3` | `#2B2B2B` | Smoke — card / panel dark |
| `void-4` | `#3D3D3D` | Iron — border on dark |
| `gray` / `ash-700` | `#545454` | Void Gray — structural |
| `ash-500` | `#7A7A7A` | mid neutral |
| `ash-300` | `#B8B8B8` | high neutral |
| `ash-100` | `#E4E4E4` | near-white neutral |
| `paper` | `#F9F8F2` | warm off-white, primary light bg |
| `bone` | `#F5F2EA` | warm neutral surface |
| `snow` | `#FFFFFF` | pure white |

## Semantic / accent (extending the brand minimally for syntax legibility)

| Token | Hex | Role |
|---|---|---|
| `success` | `#3FB950` | success / added / git-add |
| `warn` | `#E8A33D` | warn / modified / numbers |
| `danger` | `#F0525B` | danger / removed / errors |
| `info` | `#5B9FFF` | info / paths / namespaces |
| `cyan` | `#7AD9D9` | regex, escape sequences |
| `magenta` | `#D88AE0` | constants, decorators |
| `lime-ink-2` | `#9BC73C` | mid-lime for darker surfaces (functions on light themes) |

These are tuned to feel adjacent to the void/ash neutrals — slightly desaturated, never candy.

---

## Lime role

**Lime is reserved for the hero of code: function names + diagnostic markers.**

Reasoning: keywords are too dense (would saturate the page); strings are too frequent (would dilute the brand); comments would invert hierarchy. Function definitions and call-sites are sparse, structural, and what you scan for. Lime there feels like a header light hitting the right thing.

Diagnostics (errors, cursor, breakpoints) also use lime/danger/warn — the only other place lime appears.

## Syntax roles → color

| Role | Dark (Void) | Light (Paper) |
|---|---|---|
| Background | `#0E0E0E` | `#F9F8F2` |
| Foreground (default text) | `#E4E4E4` | `#1F1F1F` |
| Comment | `#7A7A7A` *italic* | `#7A7A7A` *italic* |
| Keyword (`if`, `return`, `class`, `def`) | `#E8FF8A` | `#5E7A00` |
| Storage type modifier (`const`, `let`, `static`) | `#E8FF8A` *italic* | `#5E7A00` *italic* |
| String | `#B8B8B8` | `#545454` |
| String escape / regex | `#7AD9D9` | `#3F8C8C` |
| Number / boolean / null | `#E8A33D` | `#A06C1A` |
| **Function name (def + call)** | `#C6FF24` **lime hero** | `#5E7A00` |
| Type / class name | `#5B9FFF` | `#2C5FA0` |
| Constant / decorator | `#D88AE0` | `#8C4A95` |
| Variable / property / parameter | `#E4E4E4` | `#1F1F1F` |
| Operator / punctuation | `#7A7A7A` | `#7A7A7A` |
| Tag (HTML/JSX) | `#5B9FFF` | `#2C5FA0` |
| Attribute | `#E8A33D` | `#A06C1A` |
| Markup heading | `#C6FF24` | `#5E7A00` |
| Markup link | `#5B9FFF` | `#2C5FA0` |
| Diff added | `#3FB950` | `#2A8439` |
| Diff removed | `#F0525B` | `#C13039` |
| Error / invalid | `#F0525B` | `#C13039` |
| Warning | `#E8A33D` | `#A06C1A` |
| Cursor | `#C6FF24` | `#5E7A00` |
| Selection bg | `#2B2B2B` | `#E4E4E4` |
| Find match bg | `rgba(198,255,36,0.20)` | `rgba(94,122,0,0.18)` |
| Line highlight | `#1A1A1A` | `#F5F2EA` |
| Indent guide | `#2B2B2B` | `#E4E4E4` |
| Bracket match | `#C6FF24` underline | `#5E7A00` underline |

## Bracket pair colorization (subtle, brand neutrals)

Cycles through 6 muted tones, no rainbow:

1. `#E4E4E4` (paper)
2. `#7A7A7A` (ash-500)
3. `#5B9FFF` (info)
4. `#E8A33D` (warn)
5. `#D88AE0` (magenta)
6. `#7AD9D9` (cyan)

Light mode darkens each by ~30%.

---

## ANSI 16-color palette (terminal)

Conventional ANSI semantics preserved (green is green, red is red) — but every color is tuned to Bizarre's neutral register so it sits next to lime without clashing.

### Dark variants (Void, Hi-Contrast, Workshop)

| ANSI | Name | Hex |
|---|---|---|
| 0 | black | `#1A1A1A` |
| 1 | red | `#F0525B` |
| 2 | green | `#9BC73C` |
| 3 | yellow | `#E8A33D` |
| 4 | blue | `#5B9FFF` |
| 5 | magenta | `#D88AE0` |
| 6 | cyan | `#7AD9D9` |
| 7 | white | `#E4E4E4` |
| 8 | bright black | `#3D3D3D` |
| 9 | bright red | `#FF6B73` |
| 10 | **bright green** (lime hero) | `#C6FF24` |
| 11 | bright yellow | `#FFC25A` |
| 12 | bright blue | `#7FB7FF` |
| 13 | bright magenta | `#E8A8EE` |
| 14 | bright cyan | `#9DE5E5` |
| 15 | bright white | `#F9F8F2` |

ANSI 10 (bright_green) is Signal Lime. Conventional `ls` colors stay green; `tput setaf 10` lights up the brand.

### Light variants (Paper, Bone)

Same hue assignments, ink-shifted:

| ANSI | Name | Hex |
|---|---|---|
| 0 | black | `#1F1F1F` |
| 1 | red | `#C13039` |
| 2 | green | `#5E7A00` |
| 3 | yellow | `#A06C1A` |
| 4 | blue | `#2C5FA0` |
| 5 | magenta | `#8C4A95` |
| 6 | cyan | `#3F8C8C` |
| 7 | white | `#545454` |
| 8 | bright black | `#7A7A7A` |
| 9 | bright red | `#E04050` |
| 10 | bright green | `#5E7A00` |
| 11 | bright yellow | `#C28225` |
| 12 | bright blue | `#3D78C7` |
| 13 | bright magenta | `#A55EAF` |
| 14 | bright cyan | `#4FA3A3` |
| 15 | bright white | `#0E0E0E` |

---

## Variant deltas

| Variant | Background | Foreground | Border | Accent |
|---|---|---|---|---|
| **Bizarre Void** (default dark) | `#0E0E0E` | `#E4E4E4` | `#3D3D3D` | `#C6FF24` |
| **Bizarre Void Hi-Contrast** | `#000000` | `#F9F8F2` | `#545454` | `#C6FF24` (more usage) |
| **Bizarre Workshop** (warm dark) | `#1A1815` | `#E4E2DA` | `#3D3A33` | `#C6FF24` (slightly muted) |
| **Bizarre Paper** (default light) | `#F9F8F2` | `#1F1F1F` | `#E4E4E4` | `#5E7A00` |
| **Bizarre Bone** (warm light) | `#F5F2EA` | `#2B2B2B` | `#D8D4C8` | `#5E7A00` (softer) |

CATCH THE STARS.
