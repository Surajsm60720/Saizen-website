#!/usr/bin/env node
/**
 * Compare the site's displayed app version with APP_VERSION in the Saizen app
 * and bump lib/app-version.ts when the app is ahead.
 *
 * Does not touch feature copy or add a changelog.
 */
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const RAW_URL =
  'https://raw.githubusercontent.com/Surajsm60720/Saizen/main/apps/web/src/lib/version.ts';
const SITE_FILE = resolve(process.cwd(), 'lib/app-version.ts');
const VERSION_RE = /export const APP_VERSION = ['"](\d+(?:\.\d+)*)['"]/;

function parseVersion(version) {
  return version.split('.').map((part) => {
    if (!/^\d+$/.test(part)) {
      throw new Error(`Invalid version segment in "${version}"`);
    }
    return Number(part);
  });
}

/** Positive when `left` is newer than `right`. */
function compareVersions(left, right) {
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    const delta = (left[i] ?? 0) - (right[i] ?? 0);
    if (delta !== 0) return delta;
  }
  return 0;
}

function setOutput(key, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

const siteSource = readFileSync(SITE_FILE, 'utf8');
const siteMatch = siteSource.match(VERSION_RE);
if (!siteMatch) {
  console.error(`Could not read APP_VERSION from ${SITE_FILE}`);
  process.exit(1);
}

const siteVersion = siteMatch[1];
const response = await fetch(RAW_URL);
if (!response.ok) {
  console.error(`Failed to fetch ${RAW_URL}: ${response.status} ${response.statusText}`);
  process.exit(1);
}

const remoteMatch = (await response.text()).match(VERSION_RE);
if (!remoteMatch) {
  console.error('Could not parse APP_VERSION from the Saizen app');
  process.exit(1);
}

const appVersion = remoteMatch[1];
const order = compareVersions(parseVersion(appVersion), parseVersion(siteVersion));

if (order < 0) {
  console.log(`Site is at v${siteVersion}, ahead of the app at v${appVersion}. Leaving it.`);
  setOutput('changed', 'false');
  setOutput('version', siteVersion);
  process.exit(0);
}

if (order === 0) {
  console.log(`Site already shows v${siteVersion}.`);
  setOutput('changed', 'false');
  setOutput('version', siteVersion);
  process.exit(0);
}

const next = siteSource.replace(VERSION_RE, `export const APP_VERSION = '${appVersion}'`);
if (next === siteSource) {
  console.error('Version replace did not change the file');
  process.exit(1);
}

writeFileSync(SITE_FILE, next);
console.log(`Bumped site version v${siteVersion} → v${appVersion}`);
setOutput('changed', 'true');
setOutput('version', appVersion);
