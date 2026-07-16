# Bizarre Industries Design Language and Cross-Platform System

**Status:** Approved architecture; written specification awaiting final review

**Date:** 2026-07-12

**Canonical repository:** `https://github.com/Bizarre-Industries/design-system`

**Downstream themes repository:** `https://github.com/Bizarre-Industries/themes`

## 1. Purpose

Create the complete Bizarre Industries visual identity, brand language, and cross-platform design system for web, iOS, Android, desktop, embedded systems, hardware, graphics, and media.

The system must make Bizarre Industries unmistakable across software and physical products while respecting the native behavior of every supported platform. It must be comprehensive enough that a product team does not invent missing brand primitives, component states, interaction rules, accessibility behavior, or production guidance.

The existing `themes` repository remains a downstream third-party theme and adapter project. It consumes a pinned release from the canonical `design-system` repository and does not independently define the official Bizarre Industries language.

## 2. Permanent Brand Decisions

- The company-level identity is **Bizarre Industries**.
- **Signal Lime** is the only brand accent.
- Functional status colors may communicate success, information, warning, error, or critical state, but they are never alternate product accents.
- **CATCH THE STARS** is the permanent company tagline, without trailing punctuation.
- The current identity may be refined but must not be replaced or made unrecognizable.
- Preserve the existing star motif, industrial/editorial character, Signal Lime, company name, and recognizable mark proportions.
- Products share one master identity. They may differ through composition, typography, imagery, density, motion, and platform behavior, not through independent accent colors or sub-brand visual systems.

## 3. Identity Expressions

### 3.1 Precision Signal

Precision Signal is the canonical identity system. It is engineered, modular, and exact. It defines the master symbol, wordmark, responsive lockups, clear space, optical corrections, minimum sizes, and production geometry.

It must work in:

- application icons and favicons;
- small embedded displays;
- operating-system surfaces;
- hardware engraving and molding;
- printed manuals and packaging;
- large-format environmental graphics;
- video, broadcast, and motion graphics.

### 3.2 Editorial Monument

Editorial Monument is the approved expressive layer for campaigns, graphics, launches, and media. It uses oversized slab typography, asymmetric grids, hard cropping, sparse fields, and strong negative space. It may amplify the identity but may not redraw the master symbol or alter the permanent tagline.

### 3.3 Workshop Stamp

Workshop Stamp is the approved physical provenance layer for hardware, packaging, inspection marks, serial systems, manufacturing labels, and service documentation. It uses production-safe one-color and constrained-process variants derived from the master identity.

## 4. System Architecture

The canonical repository owns the language and publishes platform-native bindings:

```text
approved brand decisions
        ↓
canonical DTCG tokens and asset manifests
        ↓
semantic and component contracts
        ↓
framework-native adapters
        ↓
native packages, documentation, and reference products
        ↓
cross-platform conformance tests
        ↓
themes consumes a pinned release
```

Authority flows in one direction. A platform binding may report a missing capability upstream, but it may not silently introduce a new shared brand primitive.

## 5. Framework-Overlay Principle

Bizarre Industries does not build replacement UI runtimes when a mature native or accessibility-focused framework already provides the required behavior.

Every platform package must:

1. use the platform's established controls, layout, input, navigation, accessibility, localization, and lifecycle systems;
2. apply Bizarre personality through tokens, styles, modifiers, composition, assets, and narrowly scoped wrappers;
3. preserve expected native behavior unless a documented product requirement justifies a change;
4. expose the underlying framework capabilities rather than hiding them behind an incompatible universal abstraction;
5. document where platform differences are intentional;
6. avoid forking upstream framework internals;
7. pin supported upstream versions and test upgrades before release.

The shared design contract standardizes outcomes and identity, not identical implementation code.

## 6. Platform Foundations

### 6.1 Web

- Use semantic HTML, modern CSS, and browser platform behavior as the base.
- Use React Aria Components for complex accessible React interactions where it provides the required behavior and internationalization.
- Publish framework-neutral CSS and token packages independently from React.
- `@bizarre/react` is an adapter and styling layer, not a proprietary widget runtime.
- Do not apply global resets that break host applications; use cascade layers and scoped foundations.

### 6.2 Apple: BizarreUI

`BizarreUI` is a Swift Package built directly on SwiftUI. It must feel like SwiftUI with a strong Bizarre personality, never like a web interface transplanted onto Apple platforms.

It uses:

- native SwiftUI controls and containers;
- `ButtonStyle`, `ToggleStyle`, `LabelStyle`, `TextFieldStyle`, and other style protocols;
- environment values and modifiers for tokens, density, motion, and theme;
- native navigation, sheets, menus, commands, toolbars, focus, accessibility, localization, pointer, keyboard, and Dynamic Type behavior;
- narrow AppKit or UIKit interop only where SwiftUI cannot meet a documented requirement.

Wrappers may add Bizarre composition or safer defaults, but they must retain the native control semantics and expose normal SwiftUI customization points.

### 6.3 Android

- Build on Jetpack Compose and current Material 3 components.
- Extend or wrap Material theming and composables with Bizarre semantic values, shapes, typography, states, and behavior.
- Preserve Compose semantics, TalkBack behavior, system back, predictive navigation, window insets, adaptive layouts, and platform input behavior.
- Avoid a fully custom control stack when a styled Material or Foundation component meets the contract.

### 6.4 Desktop

- macOS uses `BizarreUI` on SwiftUI with narrow AppKit interop.
- Windows uses WinUI controls and theming through a Bizarre adapter.
- Linux and cross-platform native tools use Qt Quick Controls through a Bizarre style package when Qt is the host framework.
- Compose Multiplatform may use the Compose Bizarre layer when it is already the host application's framework.
- The design system supports the host framework; it does not require applications to migrate runtimes solely for visual consistency.

### 6.5 Embedded Systems

- LVGL is the primary low-resource embedded reference framework.
- The Bizarre LVGL package extends LVGL themes, styles, states, widgets, input, display density, and per-display theming.
- Qt Quick is the reference for richer embedded Linux and automotive-class interfaces.
- Generated C/C++ tokens remain available for approved systems that cannot use either framework.
- Constrained devices receive explicit capability profiles rather than pretending every animation, font, color, or component is available.

### 6.6 Graphics and Media

- Publish templates and adapters for established production tools instead of creating a proprietary editor.
- Graphics packages include print, presentation, social, diagram, data-visualization, signage, and editorial templates.
- Media packages include title, lower-third, transition, caption, ident, safe-area, color, and audio guidance for common motion and editing workflows.
- Exported assets remain tool-neutral where possible: SVG, PDF, PNG, OpenType/WOFF2, WAV, JSON, CSS, and documented timing curves.

### 6.7 Hardware

Hardware guidance overlays standard industrial-design and manufacturing workflows. It defines identity placement, CMF, lighting, displays, markings, control labeling, packaging, service graphics, regulatory coexistence, and production tolerances. It does not prescribe a single CAD package.

## 7. Token Architecture

The source token format follows a pinned published Design Tokens Community Group contract. Tool-specific exports are generated adapters.

### 7.1 Primitive tokens

Raw approved values for:

- color and color spaces;
- typography and font axes;
- dimensions and spacing;
- geometry and radii;
- stroke and borders;
- opacity;
- elevation and shadow;
- duration and easing;
- breakpoints and density;
- z-order;
- audio and haptic references where applicable.

### 7.2 Semantic tokens

Purpose-based roles including:

- canvas, panel, raised, sunken, overlay, scrim, and inverse surfaces;
- primary, secondary, muted, disabled, inverse, link, and selected text;
- default, strong, subtle, focus, selected, and destructive borders;
- primary, secondary, quiet, and destructive actions in every state;
- navigation, field, selection, data-visualization, media, telemetry, and status roles;
- focus, keyboard, rotary, touch, pointer, and forced-color behavior.

### 7.3 Component tokens

Only values that are genuinely component-specific. Component tokens alias semantic or primitive tokens and may not duplicate arbitrary raw values without a documented exception.

### 7.4 Platform bindings

Generated, typed outputs for CSS, TypeScript, Swift, Kotlin, C/C++, Qt, graphics, media, and design tools.

## 8. Theme Hierarchy

- **Void:** primary dark mode and strongest default Bizarre expression.
- **Paper:** primary light mode.
- **Void Hi-Contrast:** required accessibility and difficult-display mode.
- **Workshop:** optional warm dark mode for prolonged technical work.
- **Bone:** optional low-glare light mode for editorial and long-session contexts.

Every first-party component supports and is certified for Void, Paper, and Void Hi-Contrast. Workshop and Bone are mandatory at the semantic-token layer and progressively certified per platform.

Signal Lime remains the only brand accent in all modes. Light modes use distinct graphic/fill, readable foreground, and on-accent roles rather than forcing one lime value into incompatible contexts.

## 9. Typography

- Monaspace Xenon: display headlines and major brand statements.
- Monaspace Krypton: labels, navigation, instrumentation, and metadata.
- Monaspace Neon: code, terminal, telemetry, and technical values.
- A separately selected and licensed proportional family: UI body copy, documentation, safety text, localization, and dense mobile layouts.
- Monaspace Argon: optional editorial and technical prose expression, not the universal body face.
- Monaspace Radon: non-normative until a distributable licensed asset is approved and packaged.

The typography specification must define named styles, sizes, line heights, tracking, weights, variable-font behavior, numeric settings, line length, responsive scaling, Dynamic Type mapping, Android font scaling, localization, fallback, truncation, and safety-critical use.

## 10. Visual Language

- Geometry is predominantly square and rectangular with controlled radii where ergonomics require them.
- Avoid generic friendly-SaaS softness, glass ornament, arbitrary gradients, and decorative sci-fi neon.
- Iconography uses a documented optical grid, consistent stroke families, squared terminals, and optional star-derived directional cuts.
- Imagery favors real materials, machinery, infrastructure, prototypes, light, scale, and human work.
- Illustration favors schematics, exploded views, maps, technical diagrams, and editorial abstraction.
- Motion uses decisive lock, align, reveal, scan, and controlled acceleration/deceleration. Avoid playful bounce, elastic overshoot, and ornamental continuous motion.
- Every motion pattern has a reduced-motion equivalent.
- Data visualization uses neutral structure; Signal Lime identifies the selected or decisive series. Functional colors retain stable meanings.
- A permanent sonic mnemonic and functional sound families may be developed, but safety alerts remain distinct from branding.

## 11. Brand Guidelines Deliverables

The complete guidelines include:

- master symbol, wordmark, badge, and responsive lockups;
- clear space, minimum size, optical corrections, and prohibited uses;
- full-color, monochrome, reversed, engraving, embossing, and low-resolution forms;
- permanent tagline lockups, punctuation, localization, and motion rules;
- product naming and co-branding;
- iconography, imagery, illustration, data visualization, and diagrams;
- typography and editorial composition;
- voice, tone, terminology, capitalization, errors, warnings, and safety copy;
- motion, sonic, haptic, and lighting identity;
- print, packaging, environmental, hardware, and regulatory coexistence;
- production files, manifests, licenses, and usage examples.

## 12. Product Components and Patterns

The system covers:

- actions, links, fields, selection controls, and command controls;
- navigation, tabs, sidebars, menus, breadcrumbs, and search;
- dialogs, sheets, popovers, notifications, and inline feedback;
- tables, trees, lists, cards, inspectors, and dense data surfaces;
- charts, gauges, timelines, maps, telemetry, and status displays;
- media players, transport controls, captions, and production timelines;
- embedded controls and physical-input mappings;
- empty, loading, offline, degraded, warning, error, and recovery states;
- consumer, technical, administrative, and safety-critical application shells.

Each contract defines anatomy, variants, sizes, states, behavior, content, accessibility, responsive rules, platform differences, theming, examples, and anti-patterns.

## 13. Accessibility and Safety

WCAG 2.2 AA is the minimum web and first-party product target, not a claim automatically granted by token contrast.

Required verification includes:

- text and non-text contrast;
- keyboard access, focus order, visible focus, and unobscured focus;
- target sizing and alternative input;
- 200 percent text resizing and narrow-viewport reflow;
- screen-reader semantics and state announcements;
- VoiceOver and TalkBack;
- switch, keyboard, pointer, touch, rotary, gamepad, and hardware buttons where supported;
- forced colors, increased contrast, reduced transparency, and reduced motion;
- localization, bidirectional text, font scaling, and truncation resilience;
- offline, degraded, timeout, and recovery behavior;
- safety alert hierarchy, acknowledgment, persistence, and non-color cues.

Safety-critical behavior overrides decorative brand expression. The system documents this explicitly rather than allowing teams to improvise exceptions.

## 14. Reference Product Suite

### 14.1 Bizarre Mission Control

A responsive web and desktop technical application validating information density, command workflows, data visualization, navigation, keyboard use, and accessibility.

### 14.2 Bizarre Field Unit

A paired iOS and Android application validating native navigation, touch, offline behavior, camera and media, notifications, platform accessibility, and adaptive layout.

### 14.3 Bizarre Instrument

An embedded interface and physical product validating constrained displays, rotary and button input, sunlight and night modes, boot and degraded states, alerts, markings, CMF, lighting, packaging, and service documentation.

All three use one realistic scenario and compatible data model. Graphics and media outputs for the same product family validate launch, documentation, presentation, editorial, motion, and sonic identity.

## 15. Repository Shape

```text
design-system/
├── brand/
├── foundations/
├── tokens/
├── components/
│   ├── web/
│   ├── apple/
│   ├── android/
│   ├── windows/
│   ├── qt/
│   └── embedded/
├── graphics/
├── media/
├── hardware/
├── accessibility/
├── reference/
├── packages/
├── docs/
└── governance/
```

The monorepo may contain several independently published packages, but all releases are tested against one compatibility manifest.

## 16. Published Deliverables

- `@bizarre/tokens`: canonical tokens, TypeScript types, and schemas.
- `@bizarre/css`: scoped CSS foundations and theme variables.
- `@bizarre/react`: React Aria-based Bizarre adapters and compositions.
- `BizarreUI`: SwiftUI-native Swift Package for Apple platforms.
- `industries.bizarre:ui`: Jetpack Compose and Material 3 overlay.
- Bizarre WinUI resources and styles.
- Bizarre Qt Quick Controls style package.
- Bizarre LVGL theme and styles.
- Generated C/C++ tokens and constrained-device assets.
- `@bizarre/icons`: source and platform icon exports.
- `@bizarre/graphics`: print, presentation, diagram, and visualization assets.
- `@bizarre/media`: motion, caption, ident, audio, and production assets.
- Figma library and generated token imports.
- Hardware production, CMF, marking, packaging, and regulatory templates.
- Versioned documentation and compatibility matrix.

## 17. Governance and Release Policy

- Semantic versioning and generated changelogs.
- Explicit token and component deprecation windows.
- No silent removal or semantic reassignment.
- Automated license and provenance manifests.
- Tracked or explicitly allowlisted source evidence only.
- No arbitrary untracked local files in published artifacts.
- Platform packages pin supported upstream framework versions.
- Framework upgrades require conformance, accessibility, and visual-regression checks.
- Generated outputs are reproducible and atomically published.
- The compatibility matrix states certified framework, OS, tool, display, and device profiles.

## 18. Themes Repository Boundary and Migration

The `themes` repository remains a third-party customization system built over the official language.

Migration requirements:

1. Fix Open Design evidence collection so only committed or explicitly allowlisted evidence is publishable.
2. Preserve Xcode support and interactive showcase controls; their current removals are not approved product decisions.
3. Preserve existing theme users through compatibility aliases and a documented transition.
4. Pin a released `@bizarre/tokens` version.
5. Generate the local palette compatibility facade from the pinned release.
6. Document fidelity losses for third-party targets rather than inventing unsupported brand substitutions.
7. Keep third-party adapter validation independent from canonical product-component certification.

## 19. Delivery Sequence

1. Repository and governance foundation.
2. Identity refinement.
3. Canonical token architecture.
4. Typography, iconography, content, and localization.
5. Web system and Mission Control.
6. BizarreUI, Android system, and Field Unit.
7. Embedded, Qt, desktop, hardware, and Instrument.
8. Graphics, motion, sonic, and media identity.
9. Third-party theme migration.
10. Cross-platform certification and compatibility publication.

Each phase receives its own approved implementation plan and acceptance gate. No phase invents shared primitives locally.

## 20. Acceptance Criteria

The system is ready for a public v1 only when:

- the master identity and production assets are approved;
- canonical source tokens generate every claimed platform binding;
- Void, Paper, and Void Hi-Contrast pass required component certification;
- the three reference products demonstrate realistic end-to-end workflows;
- required accessibility and input checks pass on certified platforms;
- hardware and media guidance has production-tested examples;
- framework overlays preserve native behavior and expose documented extension points;
- every published package has version, license, provenance, changelog, and compatibility data;
- `themes` consumes a pinned canonical release without retaining an independent brand authority;
- no published artifact contains ignored, transient, credential, or unrelated local workspace evidence.

## 21. Explicit Non-Goals

- A universal custom UI runtime shared across every platform.
- Pixel-identical controls that ignore platform conventions.
- Independent product accent colors or visual sub-brands.
- Replacing mature native framework behavior for branding alone.
- Treating contrast tests as complete accessibility certification.
- Allowing third-party theme limitations to redefine the official language.
