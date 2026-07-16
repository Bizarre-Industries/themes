# BIZARRE INDUSTRIES - Theme Palette Spec

Canonical color assignments. Every generated editor, terminal, shell, prompt, and tool config derives from [palette.js](palette.js).

`BZR / THEMES / V0.2 / MAY 2026`

## Brand Anchors

| Token | Hex | Role |
|---|---:|---|
| Signal Lime | `#C6FF24` | hero accent on dark |
| Lime Glow | `#E8FF8A` | secondary accent and hover |
| Lime Ink | `#5F8A0F` | fills, cursors, borders, and graphics on light surfaces |
| Lime Text | `#4A7409` | WCAG AA foreground accent on light primary and secondary surfaces |
| Acid Lime | `#A8FF00` | optional saturated punch |
| Void Gray | `#545454` | structural neutral |

## Variants

| Variant | Mode | Background | Foreground | Border | Accent fill | Accent text |
|---|---|---:|---:|---:|---:|---:|
| Bizarre Void | dark | `#0E0E0E` | `#E4E4E4` | `#3D3D3D` | `#C6FF24` | `#C6FF24` |
| Bizarre Void Hi-Contrast | dark | `#000000` | `#F9F8F2` | `#545454` | `#C6FF24` | `#C6FF24` |
| Bizarre Workshop | dark | `#1A1815` | `#E4E2DA` | `#3D3A33` | `#C6FF24` | `#C6FF24` |
| Bizarre Paper | light | `#F9F8F2` | `#1F1F1F` | `#D8D4C7` | `#5F8A0F` | `#4A7409` |
| Bizarre Bone | light | `#F5F2EA` | `#2B2B2B` | `#DDD8CB` | `#5F8A0F` | `#4A7409` |

## Syntax Roles

| Role | Dark | Light |
|---|---:|---:|
| plain | `#E4E4E4` | `#1A1A1A` |
| punctuation | `#828282` | `#726D61` |
| operator | `#9DEAEA` | `#0F6E6E` |
| control | `#FF8FCF` | `#B8276F` |
| declaration | `#D88AE0` | `#7E2A9A` |
| modifier | `#B989E5` | `#603F94` |
| string | `#E8A33D` | `#9F4A0E` |
| template | `#FFC36B` | `#AD5418` |
| escape | `#FFE08A` | `#7A6308` |
| regex | `#FF9E3D` | `#A55A1B` |
| number | `#7BB3FF` | `#1F4FB0` |
| bool/null | `#5B9FFF` | `#1B4099` |
| constant | `#9DD0FF` | `#2F5DC2` |
| type | `#7AD9D9` | `#0F6E6E` |
| primitive | `#7AD9D9` | `#0F6E6E` |
| function | `#C6FF24` | `#4A7409` |
| method | `#A8E658` | `#4A7409` |
| property | `#C6E58B` | `#597629` |
| parameter | `#FFB07A` | `#A0480E` |
| variable | `#E4E4E4` | `#1A1A1A` |
| self/this | `#FF8FCF` | `#B8276F` |
| builtin | `#E8A33D` | `#9F4A0E` |
| namespace | `#9DEAEA` | `#0F6E6E` |
| decorator | `#FF8FCF` | `#B8276F` |
| preprocessor | `#B989E5` | `#603F94` |
| comment | `#828282` | `#726D60` |
| doc-comment | `#9AB585` | `#597629` |
| jsx tag | `#FF8FCF` | `#B8276F` |
| jsx attr | `#C6FF24` | `#4A7409` |

## ANSI 16

### Dark

| Slot | Name | Hex |
|---:|---|---:|
| 0 | black | `#1A1A1A` |
| 1 | red | `#F0525B` |
| 2 | green | `#3FB950` |
| 3 | yellow | `#E8A33D` |
| 4 | blue | `#5B9FFF` |
| 5 | magenta | `#D88AE0` |
| 6 | cyan | `#7AD9D9` |
| 7 | white | `#E4E4E4` |
| 8 | bright black | `#3D3D3D` |
| 9 | bright red | `#FF6F77` |
| 10 | bright green | `#C6FF24` |
| 11 | bright yellow | `#FFB85C` |
| 12 | bright blue | `#7BB3FF` |
| 13 | bright magenta | `#E8A8EE` |
| 14 | bright cyan | `#9DEAEA` |
| 15 | bright white | `#FFFFFF` |

### Light

| Slot | Name | Hex |
|---:|---|---:|
| 0 | black | `#1A1A1A` |
| 1 | red | `#C13039` |
| 2 | green | `#3F7A1F` |
| 3 | yellow | `#9F4A0E` |
| 4 | blue | `#1F4FB0` |
| 5 | magenta | `#7E2A9A` |
| 6 | cyan | `#0F6E6E` |
| 7 | white | `#545454` |
| 8 | bright black | `#726D61` |
| 9 | bright red | `#C63947` |
| 10 | bright green | `#4A7409` |
| 11 | bright yellow | `#94631C` |
| 12 | bright blue | `#386EB6` |
| 13 | bright magenta | `#95559F` |
| 14 | bright cyan | `#397777` |
| 15 | bright white | `#0E0E0E` |

CATCH THE STARS.
