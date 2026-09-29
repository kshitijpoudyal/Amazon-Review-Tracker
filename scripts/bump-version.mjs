#!/usr/bin/env node
// Bumps the minor number in src/utils/version.ts (e.g. 2.101 -> 2.102).
// Invoked by .husky/pre-push before a push to main.

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const versionFilePath = join(__dirname, '..', 'src', 'utils', 'version.ts');

const contents = readFileSync(versionFilePath, 'utf8');
const match = contents.match(/APP_VERSION = '(\d+)\.(\d+)'/);

if (!match) {
  console.error(`bump-version: couldn't find APP_VERSION in ${versionFilePath}`);
  process.exit(1);
}

const major = match[1];
const nextMinor = Number(match[2]) + 1;
const nextVersion = `${major}.${nextMinor}`;

const updated = contents.replace(/APP_VERSION = '\d+\.\d+'/, `APP_VERSION = '${nextVersion}'`);
writeFileSync(versionFilePath, updated);

console.log(nextVersion);
