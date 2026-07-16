# Bizarre Industries Design System

> BZR / THEMES / V0.2 / MAY 2026

This is the normative, agent-managed Open Design contract promoted from the repository README and canonical sources. The full root README remains verbatim evidence at `source/snippets/repo/README.md`; this file promotes its operating rules without replacing or concatenating that source.

## Identity

A generated theming bundle for editors, terminals, shells, prompts, window managers, and desktop tools. One palette, five variants, GitHub Monaspace typography, and one rule: CATCH THE STARS.

The visual language is industrial, editorial, and code-first: Xenon slab display type, Neon code, Argon prose, Krypton labels, thin hairlines, restrained radii, and directional lime accents. Do not add gradients, glass effects, soft consumer-app ornament, or an invented illustration language.

## Static GitHub Catalog

The tracked images below are the current GitHub-facing catalog. [showcase/index.html](source/snippets/repo/showcase/index.html) is a fixed capture source for those images, not an interactive product. Interactive theme controls are reserved for a future Bizarre Industries website deployment.

The Open Design previews are package views. They do not turn the static GitHub catalog into the future Bizarre Industries website or change that public-experience boundary.

## Five Artifact Modes

One palette generates five variants. Void is the default Open Design binding; the other four are artifact-level CSS modes selected with `data-bizarre-theme`.

| Variant | Mood |
|---|---|
| Bizarre Void | pure void · lime accent · the default |
| Bizarre Void Hi-Contrast | pure black · max lime · OLED / projector |
| Bizarre Workshop | warm dark · lower contrast · long sessions |
| Bizarre Paper | warm off-white · lime ink · the default light |
| Bizarre Bone | softer light · warmer neutrals |

Signal Lime is the dark-surface hero accent. Paper and Bone use Lime Ink for fills and graphics, Lime Text for readable foreground emphasis, and a separately contrast-selected text-on-accent value.

## Open Design Preview Contract

- Page Background: `#0E0E0E`
- Foreground: `#E4E4E4`
- Primary Brand: `#C6FF24`
- Muted: `#7A7A7A`
- Border: `#3D3D3D`
- Surface: `#1A1A1A`

## Typography

- Display: `'Monaspace Xenon', 'Monaspace Neon', 'Menlo', monospace`
- Body: `'Monaspace Argon', 'Monaspace Neon', ui-monospace, monospace`
- Mono: `'Monaspace Neon', 'Menlo', 'SFMono-Regular', monospace`
- Labels and eyebrows: Monaspace Krypton.
- Hand annotations: 'Monaspace Radon', 'Monaspace Neon', monospace. Radon is unavailable as a packaged font asset (`asset-status: unavailable`) and must not be fetched or invented.

## Optional Native Captures

Native application screenshots are not part of the tracked catalog until they are deliberately recaptured against the current generated inputs. A fully provisioned macOS environment can run `npm run render:local` to publish an atomic four-image set and input-fingerprinted local manifest; `npm run check:local` then verifies both freshness and image hashes. Neither command runs in CI.

Generated coverage cards and current browser showcase images are evidence of real repository artifacts. They are not independent component APIs or token authorities.

## Installation Safety

Existing config files are preserved. Commands that install full behavior-bearing examples use `cp -n`; when a destination already exists, merge only the documented theme keys manually.

Never overwrite an existing behavior-bearing user configuration merely to apply the visual system. Preserve the file and merge only the documented theme keys.

## Generator Governance

- Palette: [palette.js](source/snippets/repo/palette.js)
- Palette spec: [PALETTE.md](source/snippets/repo/PALETTE.md)
- Port roadmap: [PORTS.md](source/snippets/repo/PORTS.md)

Signal Lime is the dark hero accent. Light variants keep Lime Ink for fills and graphics and use Lime Text for readable foreground accents.

`palette.js` is authoritative for brand, type, syntax, ANSI, status, and variant values. Run `npm run generate` to regenerate adapters and `npm test` to validate contracts. The Open Design package is generated output: do not edit it through Open Design, do not treat generated ports as separate authorities, and do not reverse-sync package edits into `palette.js`.

Implementers use Node ^20.17.0 or >=22.9.0 and install the locked dependency set with `npm ci`. Browser-rendering the static catalog requires the one-time `npx playwright install chromium` bootstrap; optional native captures remain local-only and do not run in CI.

## License

MIT © 2026 Bizarre Industries. See [LICENSE](source/snippets/repo/LICENSE).

Preserve the repository MIT license and all copied third-party font license material.
