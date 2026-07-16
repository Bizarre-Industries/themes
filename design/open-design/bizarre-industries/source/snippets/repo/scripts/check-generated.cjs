#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const result = spawnSync(process.execPath, [path.join(root, 'scripts/generate.cjs'), '--check'], {
  cwd: root,
  stdio: 'inherit',
});

if (result.error) {
  console.error(`Failed to run generated-file check: ${result.error.message}`);
  process.exit(1);
}

if (typeof result.status !== 'number') {
  const detail = result.signal ? ` (terminated by ${result.signal})` : '';
  console.error(`Generated-file check exited without a status${detail}.`);
  process.exit(1);
}

process.exit(result.status);
