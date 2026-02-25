#!/usr/bin/env node
// MAINTAIN: Before updating this file, audit what exists:
//   1. ls c:/clients/pullman/*.js
//   2. ls c:/clients/pullman/library/
//   3. Run each facet — does it load from library/?
//   4. Document what EXISTS, not what you remember
// Author: pullman gen-0
// Created: 2026-02-22
// Updated: 2026-02-25 — facet standard (--facet- prefix, trust states, --facets flag)

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const REPO = __dirname;
const LIB = path.join(REPO, 'library');

// ============================================================================
// Facet Registry — single source of truth for all domain facets
// ============================================================================
const FACETS = [
  { name: 'spec',           file: 'spec.md',           trust: 'unverified', desc: 'PULP code specification' },
  { name: 'pulp-schema',    file: 'pulp-schema.md',    trust: 'unverified', desc: 'pulp.dbf table structure' },
  { name: 'pemail-schema',  file: 'pemail-schema.md',  trust: 'unverified', desc: 'pemail.dbf table structure' },
  { name: 'roles',          file: 'roles.md',          trust: 'unverified', desc: 'Role taxonomy' },
  { name: 'portability',    file: 'portability.md',    trust: 'unverified', desc: 'Identity across companies' },
  { name: 'email-window',   file: 'email-window.md',   trust: 'verified',   desc: 'Email send UI flow' },
  { name: 'send-pipeline',  file: 'send-pipeline.md',  trust: 'unverified', desc: 'Green button → PDF → email delivery chain' },
  { name: 'scale',          file: 'scale.md',          trust: 'unverified', desc: 'Data scale — record counts, datasets' },
  { name: 'registry',       file: 'registry.md',       trust: 'tbd',        desc: 'External lookup, privacy, public data' },
];

// Helper: check if a facet file exists
function facetExists(filename) {
  return fs.existsSync(path.join(LIB, filename));
}

// Helper: load a library file with trust state prefix, or show fallback
function loadFacet(facet) {
  const fp = path.join(LIB, facet.file);
  if (fs.existsSync(fp)) {
    const content = fs.readFileSync(fp, 'utf8');
    // Prepend trust state to first line
    const lines = content.split('\n');
    if (lines[0].startsWith('#')) {
      lines[0] = `(${facet.trust}) ${lines[0].replace(/^#+ /, '')}`;
    } else {
      lines.unshift(`(${facet.trust})`);
    }
    console.log(lines.join('\n'));
  } else {
    console.log(`(${facet.trust}) ${facet.desc} — TBD`);
  }
  process.exit(0);
}

// Find a facet by name (supports --facet-X and --X aliases)
function findFacet(arg) {
  const name = arg.replace(/^--facet-/, '').replace(/^--/, '');
  return FACETS.find(f => f.name === name);
}

// ============================================================================
// --facets: List all facets with trust states
// ============================================================================
if (args.includes('--facets')) {
  console.log('pullman — PULP Code Authority\n');
  for (const f of FACETS) {
    const status = facetExists(f.file) ? f.trust : 'empty';
    const pad = ' '.repeat(Math.max(0, 22 - f.name.length));
    console.log(`  --facet-${f.name}${pad}(${status})  ${f.desc}`);
  }
  process.exit(0);
}

// ============================================================================
// DEFAULT: Helpful orientation (progressive disclosure)
// ============================================================================
if (args.length === 0) {
  console.log(`# PULP Code Authority — pullman

PULP codes standardize people/contact identification for the produce industry.
Part of the GULP/PLUG/PULP trilogy:

  GULP (items)     — gulfport   — production-ready
  PLUG (companies) — greenville — production-ready
  PULP (people)    — pullman    — working draft

Maker: proctor (Identifier Codes Pyramid)

## Data (source: c:\\clients\\prostan)
  PULP.DBF:  3,144 people records
  PEMAIL.DBF: 4,017 email records
  CHAS.DBF:  6,645 PLUG code assignments
  Cross-system join: PULP.id_no = PLUG code

## Facets
  node readme.js --facets             List all facets with trust states
${FACETS.map(f => {
  const status = facetExists(f.file) ? f.trust : 'empty';
  return `  node readme.js --facet-${f.name}${' '.repeat(Math.max(0, 14 - f.name.length))}${f.desc} (${status})`;
}).join('\n')}

## More
  node readme.js --library          Library index
  node readme.js --json             Structured data
  node readme.js --tools            TOOLS.md
  node readme.js --connections      Declared couplets

## Questions?
  DM pullman`);
  process.exit(0);
}

// ============================================================================
// Facet dispatch — handles both --facet-X and --X (alias)
// ============================================================================
for (const arg of args) {
  const facet = findFacet(arg);
  if (facet) {
    loadFacet(facet);
  }
}

// ============================================================================
// Functional flags (not facets)
// ============================================================================

// --library: Library index
if (args.includes('--library')) {
  const indexPath = path.join(LIB, 'INDEX.md');
  if (fs.existsSync(indexPath)) {
    console.log(fs.readFileSync(indexPath, 'utf8'));
  } else {
    console.log('# Library Contents\n');
    if (fs.existsSync(LIB)) {
      const files = fs.readdirSync(LIB).filter(f =>
        !fs.statSync(path.join(LIB, f)).isDirectory()
      );
      files.forEach(f => console.log(`  ${f}`));
      const dirs = fs.readdirSync(LIB).filter(f =>
        fs.statSync(path.join(LIB, f)).isDirectory()
      );
      dirs.forEach(d => console.log(`  ${d}/`));
    } else {
      console.log('  No library/ directory yet.');
    }
  }
  process.exit(0);
}

// --json: Structured data (cr.js whois calls this)
if (args.includes('--json')) {
  const connFile = path.join(REPO, 'connections.json');
  let connections = [];
  if (fs.existsSync(connFile)) {
    try { connections = JSON.parse(fs.readFileSync(connFile, 'utf8')); }
    catch(e) { connections = []; }
  }

  const facets = {};
  for (const f of FACETS) {
    facets[f.name] = { file: f.file, trust: f.trust, exists: facetExists(f.file) };
  }

  console.log(JSON.stringify({
    repo: 'pullman',
    domain: 'PULP Code Authority — people/contact standardization',
    billet: 'pullmanPulpCodes',
    holder: 'pullman',
    maker: 'proctor',
    island: 'core-pullman',
    facets: facets,
    data: {
      pulp_records: 3144,
      pemail_records: 4017,
      chas_records: 6645,
      source: 'c:/clients/prostan',
      cross_join: 'PULP.id_no = PLUG code (THEARAP.id_no)'
    },
    connections: connections,
    tools: ['readme.js'],
    status: 'ok'
  }, null, 2));
  process.exit(0);
}

// --tools: Full TOOLS.md
if (args.includes('--tools')) {
  const toolsPath = path.join(REPO, 'TOOLS.md');
  if (fs.existsSync(toolsPath)) {
    console.log(fs.readFileSync(toolsPath, 'utf8'));
  } else {
    console.log('No TOOLS.md yet. Tools: readme.js');
  }
  process.exit(0);
}

// --connections: Declared couplets
if (args.includes('--connections')) {
  const connFile = path.join(REPO, 'connections.json');
  let connections = [];
  if (fs.existsSync(connFile)) {
    try { connections = JSON.parse(fs.readFileSync(connFile, 'utf8')); }
    catch(e) { connections = []; }
  }
  console.log(JSON.stringify({
    billet: 'pullmanPulpCodes',
    connections: connections
  }, null, 2));
  process.exit(0);
}

// --help
if (args.includes('--help')) {
  console.log(`Usage: node readme.js [options]

Facets (domain knowledge):
  --facets              List all facets with trust states
${FACETS.map(f => `  --facet-${f.name}${' '.repeat(Math.max(0, 16 - f.name.length))}${f.desc}`).join('\n')}

  Old names (--spec, --pulp-schema, etc.) still work as aliases.

Functional:
  (none)            Quick orientation — what I do, data stats, facets
  --library         Library index (all documents)
  --json            Structured data for programmatic use
  --tools           Full TOOLS.md content
  --connections     Declared connection couplets
  --help            This help message`);
  process.exit(0);
}

// Fallback
console.log(`Unknown option: ${args.join(' ')}. Try --help`);
