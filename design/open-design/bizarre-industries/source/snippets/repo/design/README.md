# Bizarre Design Exports

Figma uses generated design token JSON. Sketch uses a Sketch Palette JSON file. Both derive from palette.js and include every Bizarre variant.

## Open Design

The repo-canonical Open Design package lives at `design/open-design/bizarre-industries/`. It binds Bizarre Void as the default and exposes all five artifact-level CSS modes without claiming that Open Design has an internal mode picker.

Generation preserves full repository evidence, including the root README byte-for-byte, while keeping `palette.js` authoritative. Run `npm run generate:open-design` to publish the local package and `npm run check:open-design` to verify its hash-owned contents.

Open Design's local install links the stable repository path; it does not make Open Design an editable palette source. Preserve any existing catalog system until its backup and migration are explicitly confirmed.
