# Using Bizarre Industries

Use tokens.css first. It is the normative 56-token Open Design contract and resolves to Bizarre Void by default.

Load assets/bizarre-tokens.css after tokens.css when an artifact needs source-level brand roles, syntax and ANSI colors, status roles, cursor behavior, or any non-default artifact mode. Its location under the manifest-declared assets directory keeps it available through Open Design's static and pull-file interfaces. Apply exactly one supported selector to the artifact root:

```html
<main data-bizarre-theme="void-hicontrast">...</main>
```

Supported values are `void`, `void-hicontrast`, `workshop`, `paper`, and `bone`. These are artifact-level CSS modes; Open Design selects the system as a whole and uses Void as its default rather than exposing an internal mode picker.

Use tailwind-v4.css only as an adapter over tokens.css. Do not bind artifacts directly to arbitrary generated editor, terminal, application, or website-port variables.

This package is agent-managed generated output. Do not edit it in Open Design, do not edit generated ports, and do not edit palette.js through this package. Change approved canonical sources, regenerate, and run the repository checks.
