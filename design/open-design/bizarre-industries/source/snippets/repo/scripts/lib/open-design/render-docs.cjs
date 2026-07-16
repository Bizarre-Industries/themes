'use strict';

const {
  contractSummary,
  designTokenRecords,
  renderDesignTokensJson,
  renderTokensCss,
} = require('./render-tokens.cjs');
const { OD_SCHEMA_TOKENS } = require('./model.cjs');

const FONT_ENTRIES = Object.freeze([
  ['Monaspace Argon', 'argon', 400],
  ['Monaspace Argon', 'argon', 600],
  ['Monaspace Argon', 'argon', 700],
  ['Monaspace Krypton', 'krypton', 400],
  ['Monaspace Krypton', 'krypton', 600],
  ['Monaspace Krypton', 'krypton', 700],
  ['Monaspace Neon', 'neon', 400],
  ['Monaspace Neon', 'neon', 600],
  ['Monaspace Neon', 'neon', 700],
  ['Monaspace Xenon', 'xenon', 400],
  ['Monaspace Xenon', 'xenon', 600],
  ['Monaspace Xenon', 'xenon', 700],
].map(([family, slug, weight]) => Object.freeze({
  family,
  file: `fonts/monaspace-${slug}-latin-${weight}-normal.woff2`,
  weight,
  style: 'normal',
})));

const PREVIEW_PAGES = Object.freeze([
  ['overview', 'overview', 'Overview'],
  ['variants', 'variants', 'Variants'],
  ['colors', 'colors', 'Colors'],
  ['syntax-ansi', 'syntax-ansi', 'Syntax and ANSI'],
  ['typography', 'typography', 'Typography'],
  ['spacing', 'spacing', 'Spacing'],
  ['components', 'components', 'Components'],
  ['coverage', 'coverage', 'Coverage'],
  ['app', 'app', 'App Preview'],
].map(([file, role, title]) => Object.freeze({
  path: `preview/${file}.html`,
  role,
  title,
})));

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function validateModel(model) {
  const requiredModes = ['void', 'void-hicontrast', 'workshop', 'paper', 'bone'];
  if (!model || typeof model !== 'object' || Array.isArray(model)
    || model.defaultMode !== 'void' || !model.modes
    || JSON.stringify(Object.keys(model.modes)) !== JSON.stringify(requiredModes)) {
    throw new TypeError('documentation renderer requires the five-mode Open Design model');
  }
  return model;
}

function renderManifest({ model }) {
  validateModel(model);
  return json({
    schemaVersion: 'od-design-system-project/v1',
    id: 'bizarre-industries',
    name: 'Bizarre Industries',
    category: 'Developer Tools',
    description: 'One generated theme system for editors, terminals, shells, prompts, tools, and future Bizarre Industries product surfaces.',
    source: {
      type: 'github',
      url: 'https://github.com/Bizarre-Industries/themes',
      branch: 'main',
    },
    files: {
      design: 'DESIGN.md',
      tokens: 'tokens.css',
      designTokens: 'design-tokens.json',
      tailwind: 'tailwind-v4.css',
      components: 'components.html',
    },
    assetsDir: 'assets',
    previewDir: 'preview',
    usage: 'USAGE.md',
    componentsManifest: 'components.manifest.json',
    importMode: 'hybrid',
    craft: {
      applies: ['color', 'type'],
      suggested: [],
      exemptions: [],
    },
    fonts: FONT_ENTRIES,
    preview: {
      dir: 'preview',
      pages: PREVIEW_PAGES,
    },
    sourceFiles: {
      scanned: 'source/scanned-files.json',
      evidence: 'source/evidence.md',
      tokens: 'source/tokens.source.json',
      report: 'source/token-contract.report.json',
      snippets: 'source/snippets/INDEX.json',
    },
  });
}

function renderMetadata() {
  return json({
    title: 'Bizarre Industries',
    category: 'Developer Tools',
    surface: 'web',
    status: 'published',
    artifactMode: 'agent-managed',
    projectId: 'ds-bizarre-industries',
  });
}

function readmeText(readme) {
  if (Buffer.isBuffer(readme) || readme instanceof Uint8Array) {
    return Buffer.from(readme).toString('utf8').replace(/\r\n?/gu, '\n');
  }
  if (typeof readme === 'string') return readme.replace(/\r\n?/gu, '\n');
  throw new TypeError('renderDesignMd requires root README bytes or text');
}

function section(text, heading) {
  const marker = `## ${heading}\n`;
  const start = text.indexOf(marker);
  if (start < 0) throw new Error(`README.md is missing required section: ${heading}`);
  const bodyStart = start + marker.length;
  const next = text.indexOf('\n## ', bodyStart);
  return text.slice(bodyStart, next < 0 ? text.length : next).trim();
}

function proseParagraph(sectionText, label) {
  const paragraph = sectionText.split(/\n\s*\n/gu)
    .find((candidate) => candidate.trim() && !candidate.trim().startsWith('!['));
  if (!paragraph) throw new Error(`README.md is missing required prose: ${label}`);
  return paragraph.trim();
}

function requireMatch(text, pattern, label) {
  const match = text.match(pattern);
  if (!match) throw new Error(`README.md is missing required claim: ${label}`);
  return match[1] || match[0];
}

function evidenceLinks(markdown) {
  return markdown.replace(/\]\((?![a-z]+:|#|source\/)([^)]+)\)/giu,
    (_match, target) => `](source/snippets/repo/${target})`);
}

function renderDesignMd({ model, readme }) {
  validateModel(model);
  const source = readmeText(readme);
  const snapshot = requireMatch(source, /^`([^`\n]+)`$/mu, 'version snapshot');
  const identity = requireMatch(
    source,
    /^(A generated theming bundle[^\n]*CATCH THE STARS\.)$/mu,
    'identity and motto',
  );
  const publicBoundary = evidenceLinks(
    proseParagraph(section(source, 'Static GitHub Catalog'), 'catalog boundary'),
  );
  const nativeCaptures = proseParagraph(section(source, 'Optional Native Captures'), 'native captures');
  const installSafety = proseParagraph(section(source, 'Install Examples'), 'install safety');
  const sourceOfTruth = evidenceLinks(section(source, 'Source Of Truth'));
  const license = evidenceLinks(proseParagraph(section(source, 'License'), 'license'));
  const variantSection = section(source, 'Variants');
  const variantRows = Object.values(model.modes).map(({ label }) => {
    const row = variantSection.split('\n').find((line) => line.startsWith(`| ${label} |`));
    if (!row) throw new Error(`README.md is missing required variant: ${label}`);
    return row;
  });
  const handStack = model.modes.void.bizarre['--bzr-font-hand'];
  if (typeof handStack !== 'string' || handStack.length === 0) {
    throw new Error('Open Design model is missing the Monaspace Radon fallback stack');
  }
  const nodeVersion = requireMatch(
    source,
    /Install the locked Node dependencies \((Node [^)]+)\)/u,
    'Node runtime requirement',
  );
  for (const command of [
    'npm ci',
    'npm run generate',
    'npm test',
    'npx playwright install chromium',
  ]) {
    if (!source.includes(command)) throw new Error(`README.md is missing required workflow: ${command}`);
  }

  const voidTokens = model.modes.void.od;

  return `# Bizarre Industries Design System

> ${snapshot}

This is the normative, agent-managed Open Design contract promoted from the repository README and canonical sources. The full root README remains verbatim evidence at \`source/snippets/repo/README.md\`; this file promotes its operating rules without replacing or concatenating that source.

## Identity

${identity}

The visual language is industrial, editorial, and code-first: Xenon slab display type, Neon code, Argon prose, Krypton labels, thin hairlines, restrained radii, and directional lime accents. Do not add gradients, glass effects, soft consumer-app ornament, or an invented illustration language.

## Static GitHub Catalog

${publicBoundary}

The Open Design previews are package views. They do not turn the static GitHub catalog into the future Bizarre Industries website or change that public-experience boundary.

## Five Artifact Modes

One palette generates five variants. Void is the default Open Design binding; the other four are artifact-level CSS modes selected with \`data-bizarre-theme\`.

| Variant | Mood |
|---|---|
${variantRows.join('\n')}

Signal Lime is the dark-surface hero accent. Paper and Bone use Lime Ink for fills and graphics, Lime Text for readable foreground emphasis, and a separately contrast-selected text-on-accent value.

## Open Design Preview Contract

- Page Background: \`${voidTokens['--bg']}\`
- Foreground: \`${voidTokens['--fg']}\`
- Primary Brand: \`${voidTokens['--accent']}\`
- Muted: \`${voidTokens['--muted']}\`
- Border: \`${voidTokens['--border']}\`
- Surface: \`${voidTokens['--surface']}\`

## Typography

- Display: \`${voidTokens['--font-display']}\`
- Body: \`${voidTokens['--font-body']}\`
- Mono: \`${voidTokens['--font-mono']}\`
- Labels and eyebrows: Monaspace Krypton.
- Hand annotations: ${handStack}. Radon is unavailable as a packaged font asset (\`asset-status: unavailable\`) and must not be fetched or invented.

## Optional Native Captures

${nativeCaptures}

Generated coverage cards and current browser showcase images are evidence of real repository artifacts. They are not independent component APIs or token authorities.

## Installation Safety

${installSafety}

Never overwrite an existing behavior-bearing user configuration merely to apply the visual system. Preserve the file and merge only the documented theme keys.

## Generator Governance

${sourceOfTruth}

\`palette.js\` is authoritative for brand, type, syntax, ANSI, status, and variant values. Run \`npm run generate\` to regenerate adapters and \`npm test\` to validate contracts. The Open Design package is generated output: do not edit it through Open Design, do not treat generated ports as separate authorities, and do not reverse-sync package edits into \`palette.js\`.

Implementers use ${nodeVersion} and install the locked dependency set with \`npm ci\`. Browser-rendering the static catalog requires the one-time \`npx playwright install chromium\` bootstrap; optional native captures remain local-only and do not run in CI.

## License

${license}

Preserve the repository MIT license and all copied third-party font license material.
`;
}

function renderUsageMd() {
  return `# Using Bizarre Industries

Use tokens.css first. It is the normative 56-token Open Design contract and resolves to Bizarre Void by default.

Load assets/bizarre-tokens.css after tokens.css when an artifact needs source-level brand roles, syntax and ANSI colors, status roles, cursor behavior, or any non-default artifact mode. Its location under the manifest-declared assets directory keeps it available through Open Design's static and pull-file interfaces. Apply exactly one supported selector to the artifact root:

\`\`\`html
<main data-bizarre-theme="void-hicontrast">...</main>
\`\`\`

Supported values are \`void\`, \`void-hicontrast\`, \`workshop\`, \`paper\`, and \`bone\`. These are artifact-level CSS modes; Open Design selects the system as a whole and uses Void as its default rather than exposing an internal mode picker.

Use tailwind-v4.css only as an adapter over tokens.css. Do not bind artifacts directly to arbitrary generated editor, terminal, application, or website-port variables.

This package is agent-managed generated output. Do not edit it in Open Design, do not edit generated ports, and do not edit palette.js through this package. Change approved canonical sources, regenerate, and run the repository checks.
`;
}

function rawCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function renderEvidenceMd({ entries }) {
  if (!Array.isArray(entries)) throw new TypeError('renderEvidenceMd requires evidence entries');
  const sorted = [...entries].sort((left, right) => rawCompare(left.sourcePath, right.sourcePath));
  const counts = new Map();
  for (const entry of sorted) {
    counts.set(entry.classification, (counts.get(entry.classification) || 0) + 1);
  }
  const classifications = [...counts].sort(([left], [right]) => rawCompare(left, right));
  const readme = sorted.find((entry) => entry.sourcePath === 'README.md');
  if (!readme || readme.packagePath !== 'source/snippets/repo/README.md') {
    throw new Error('evidence entries must preserve the full root README');
  }

  return `# Repository Source Evidence

- Repository: \`https://github.com/Bizarre-Industries/themes\` (\`main\`)
- Snapshot identity: deterministic per-file SHA-256 inventory below; transient Git revision and status metadata are not embedded
- Included entries: ${sorted.length}
- Full root README: preserved byte-for-byte at \`source/snippets/repo/README.md\`
- Normative source: \`palette.js\`; generated adapters remain translation evidence

## Classification Counts

| Classification | Files |
|---|---:|
${classifications.map(([name, count]) => `| ${name} | ${count} |`).join('\n')}

## Inventory

${sorted.map((entry) => `- \`${entry.sourcePath}\` -> \`${entry.packagePath}\` (${entry.classification}, ${entry.kind}, ${entry.bytes} bytes, SHA-256 \`${entry.sha256}\`)`).join('\n')}
`;
}

function layerSummary(total) {
  return { total, sourceBacked: total, fallback: 0, alias: 0 };
}

function parseRenderedRoot(css, expectedValues) {
  const errors = [];
  const rootMatches = [...css.matchAll(/(?:^|\n):root\s*\{([^{}]*)\}/gu)];
  if (rootMatches.length !== 1) {
    errors.push(`tokens.css must contain exactly one :root block; found ${rootMatches.length}`);
  }
  const body = rootMatches[0] ? rootMatches[0][1] : '';
  const declarations = [...body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]*);/giu)]
    .map((match) => ({ name: match[1], value: match[2].trim() }));
  const names = declarations.map(({ name }) => name);
  const nameSet = new Set(names);
  const schemaSet = new Set(OD_SCHEMA_TOKENS);

  if (declarations.length !== OD_SCHEMA_TOKENS.length) {
    errors.push(`tokens.css :root must declare exactly 56 tokens; found ${declarations.length}`);
  }
  if (nameSet.size !== names.length) {
    const duplicates = [...new Set(names.filter((name, index) => names.indexOf(name) !== index))];
    errors.push(`tokens.css :root contains duplicate tokens: ${duplicates.join(', ')}`);
  }
  const missing = OD_SCHEMA_TOKENS.filter((name) => !nameSet.has(name));
  const extra = [...nameSet].filter((name) => !schemaSet.has(name));
  if (missing.length > 0) errors.push(`tokens.css :root is missing tokens: ${missing.join(', ')}`);
  if (extra.length > 0) errors.push(`tokens.css :root contains undeclared tokens: ${extra.join(', ')}`);
  if (names.length === OD_SCHEMA_TOKENS.length
    && names.some((name, index) => name !== OD_SCHEMA_TOKENS[index])) {
    errors.push('tokens.css :root token order does not match TOKEN_SCHEMA');
  }

  const values = {};
  for (const { name, value } of declarations) {
    values[name] = value;
    if (value === '') errors.push(`${name} has an empty value in tokens.css :root`);
    if (schemaSet.has(name) && String(expectedValues[name]) !== value) {
      errors.push(`${name} does not match the rendered model value`);
    }
    for (const reference of value.matchAll(/var\(\s*(--[a-z0-9-]+)\b/giu)) {
      if (!schemaSet.has(reference[1]) || !nameSet.has(reference[1])) {
        errors.push(`${name} references undeclared token ${reference[1]}`);
      }
    }
  }

  return {
    values,
    declaredNames: new Set(OD_SCHEMA_TOKENS.filter((name) => nameSet.has(name))),
    selfCheck: { ok: errors.length === 0, errors, warnings: [] },
  };
}

function gradeForScore(score) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'usable';
  if (score >= 40) return 'needs-review';
  return 'needs-rebuild';
}

function renderTokenContractReport(model) {
  validateModel(model);
  const renderedCss = renderTokensCss(model);
  const validation = parseRenderedRoot(renderedCss, model.modes.void.od);
  const records = designTokenRecords(model).map((record) => ({
    name: record.name,
    layer: record.layer,
    value: Object.hasOwn(validation.values, record.name)
      ? validation.values[record.name]
      : record.value,
    confidence: record.confidence,
    reason: record.reason,
    sources: record.sources,
  }));
  // Keep the structured token file and report on the same canonical token order.
  const designTokens = JSON.parse(renderDesignTokensJson(model));
  if (designTokens.tokens.length !== records.length
    || designTokens.tokens.some((record, index) => record.name !== records[index].name)) {
    validation.selfCheck.ok = false;
    validation.selfCheck.errors.push('design token records disagree with tokens.css order');
  }
  const errorPenalty = validation.selfCheck.errors.length * 25;
  const score = validation.selfCheck.ok ? 100 : Math.max(0, 100 - errorPenalty);
  const summary = {
    ...contractSummary(),
    declaredTokens: validation.declaredNames.size,
    sourceBackedTokens: validation.declaredNames.size,
    score,
    grade: gradeForScore(score),
    recommendRebuild: !validation.selfCheck.ok,
  };

  return json({
    schemaVersion: 1,
    contract: 'TOKEN_SCHEMA',
    summary,
    layers: {
      'A1-identity': layerSummary(8),
      'A1-structure': layerSummary(18),
      A2: layerSummary(26),
      'B-slot': layerSummary(4),
    },
    selfCheck: validation.selfCheck,
    tokens: records,
  });
}

module.exports = {
  renderDesignMd,
  renderEvidenceMd,
  renderManifest,
  renderMetadata,
  renderTokenContractReport,
  renderUsageMd,
};
