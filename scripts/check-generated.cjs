#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const result = spawnSync(process.execPath, [path.join(root, 'scripts/generate.cjs'), '--check'], {
  cwd: root,
  stdio: 'inherit',
});

process.exit(result.status || 0);
