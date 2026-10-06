#!/usr/bin/env node
/**
 * Write Wealth-Bridge/.env.local from the public env block in apphosting.yaml.
 *
 * `next build` prerenders pages that initialise the Firebase client, so a bare
 * CI runner with no NEXT_PUBLIC_FIREBASE_* values fails on /dashboard. Those
 * values are public client configuration and are already committed in
 * apphosting.yaml, so CI derives them from there instead of duplicating them
 * into GitHub secrets — one source of truth, nothing new to rotate.
 *
 * Entries declared with `secret:` (e.g. OPENAI_API_KEY) are deliberately
 * skipped: they are never needed to build, only at runtime.
 *
 * Refuses to overwrite an existing .env.local unless --force is passed, so
 * running it locally cannot clobber a developer's file.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'Wealth-Bridge', 'apphosting.yaml');
const target = join(root, 'Wealth-Bridge', '.env.local');
const force = process.argv.includes('--force');

if (!existsSync(source)) {
  console.error(`apphosting.yaml not found at ${source}`);
  process.exit(1);
}

if (existsSync(target) && !force) {
  console.log(`${target} already exists; leaving it alone (pass --force to overwrite).`);
  process.exit(0);
}

const yaml = readFileSync(source, 'utf8');

// The env block is a flat list of `- variable: NAME` followed by either
// `value: ...` or `secret: ...`. Parsed directly to avoid a YAML dependency.
const lines = yaml.split(/\r?\n/);
const pairs = [];
let current = null;

for (const line of lines) {
  const variable = line.match(/^\s*-\s*variable:\s*(\S+)\s*$/);
  if (variable) {
    current = { name: variable[1], value: null, isSecret: false };
    pairs.push(current);
    continue;
  }
  if (!current) continue;

  const value = line.match(/^\s*value:\s*(.*?)\s*$/);
  if (value) {
    current.value = value[1].replace(/^["']|["']$/g, '');
    continue;
  }
  if (/^\s*secret:\s*\S+/.test(line)) current.isSecret = true;
}

const usable = pairs.filter((p) => !p.isSecret && p.value !== null);
const skipped = pairs.filter((p) => p.isSecret);

if (usable.length === 0) {
  console.error('No usable env values found in apphosting.yaml — refusing to write an empty file.');
  process.exit(1);
}

const body = [
  '# Generated from apphosting.yaml by scripts/apphosting-env.mjs — do not edit.',
  '# Public client configuration only; secrets are injected at runtime.',
  ...usable.map((p) => `${p.name}=${p.value}`),
  '',
].join('\n');

writeFileSync(target, body, 'utf8');
console.log(`Wrote ${usable.length} public variables to ${target}`);
if (skipped.length) {
  console.log(`Skipped ${skipped.length} secret-backed variable(s): ${skipped.map((p) => p.name).join(', ')}`);
}
