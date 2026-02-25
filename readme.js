#!/usr/bin/env node
// MAINTAIN: Before updating this file, audit what exists:
//   1. ls c:/clients/pullman/*.js
//   2. ls c:/clients/pullman/library/
//   3. Run each facet — does it load from library/?
//   4. Document what EXISTS, not what you remember
// Author: pullman gen-0
// Created: 2026-02-22
// Updated: 2026-02-24

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const REPO = __dirname;
const LIB = path.join(REPO, 'library');

// Helper: check if a facet has a library doc
function facetStatus(filename) {
  return fs.existsSync(path.join(LIB, filename)) ? 'filled' : 'TBD';
}

// Helper: load a library file or show fallback
function loadFacet(filename, fallback) {
  const fp = path.join(LIB, filename);
  if (fs.existsSync(fp)) {
    console.log(fs.readFileSync(fp, 'utf8'));
  } else {
    console.log(fallback);
  }
  process.exit(0);
}

// DEFAULT: Helpful orientation (progressive disclosure)
if (args.length === 0) {
  const s = facetStatus;
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
  node readme.js --spec             PULP code specification [${s('spec.md')}]
  node readme.js --pulp-schema      pulp.dbf table structure [${s('pulp-schema.md')}]
  node readme.js --pemail-schema    pemail.dbf table structure [${s('pemail-schema.md')}]
  node readme.js --roles            Role taxonomy [${s('roles.md')}]
  node readme.js --portability      Identity across companies [${s('portability.md')}]
  node readme.js --email-window     Email send UI flow [${s('email-window.md')}] (verified)
  node readme.js --scale             Data scale — record counts, datasets [${s('scale.md')}]
  node readme.js --registry          External lookup, privacy, public data [${s('registry.md')}]

## More
  node readme.js --library          Library index
  node readme.js --json             Structured data
  node readme.js --tools            TOOLS.md
  node readme.js --connections      Declared couplets

## Questions?
  DM pullman`);
  process.exit(0);
}

// --spec: PULP code specification
if (args.includes('--spec')) {
  loadFacet('spec.md', '# PULP Code Specification — TBD\nAwaiting source data analysis.');
}

// --pulp-schema: pulp.dbf table structure
if (args.includes('--pulp-schema')) {
  loadFacet('pulp-schema.md', '# PULP Schema — TBD\nNeed to examine actual DBF structure.');
}

// --pemail-schema: pemail.dbf table structure
if (args.includes('--pemail-schema')) {
  loadFacet('pemail-schema.md', '# PEMAIL Schema — TBD\nNeed to examine actual DBF structure.');
}

// --roles: Role taxonomy
if (args.includes('--roles')) {
  loadFacet('roles.md', '# Role Taxonomy — TBD\nNeed to confirm from pulp.dbf field values.');
}

// --portability: Identity across companies
if (args.includes('--portability')) {
  loadFacet('portability.md', '# Identity Portability — TBD\nNeed to analyze cross-dataset patterns.');
}

// --email-window: Email send UI flow
if (args.includes('--email-window')) {
  loadFacet('email-window.md', '# Email Window Flow — TBD\nNeed to trace al.prg source code.');
}

// --scale: Data scale — record counts, datasets
if (args.includes('--scale')) {
  loadFacet('scale.md', '# PULP Data Scale — TBD\nNeed to count records and datasets from source.');
}

// --registry: External lookup, privacy, public data
if (args.includes('--registry')) {
  loadFacet('registry.md', '# PULP Registry — TBD\nHow would people be looked up externally?\nIf ProduceStandards.org has a /registry/ section, what data is public?\nWhat\'s the query path? How does privacy work (people ≠ companies)?\n\nThis facet is awaiting requirements.');
}

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

  // Build facet status dynamically
  const facets = {};
  const facetFiles = {
    spec: 'spec.md',
    'pulp-schema': 'pulp-schema.md',
    'pemail-schema': 'pemail-schema.md',
    roles: 'roles.md',
    portability: 'portability.md',
    'email-window': 'email-window.md',
    scale: 'scale.md',
    registry: 'registry.md'
  };
  for (const [k, v] of Object.entries(facetFiles)) {
    facets[k] = facetStatus(v);
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

Options:
  (none)            Quick orientation — what I do, data stats, facets
  --spec            PULP code specification
  --pulp-schema     pulp.dbf table structure
  --pemail-schema   pemail.dbf table structure
  --roles           Role taxonomy
  --portability     Identity across companies
  --email-window    Email send UI flow
  --scale           Data scale — record counts, datasets
  --registry        External lookup, privacy, public data
  --library         Library index (all documents)
  --json            Structured data for programmatic use
  --tools           Full TOOLS.md content
  --connections     Declared connection couplets
  --help            This help message`);
  process.exit(0);
}

// Fallback
console.log(`Unknown option: ${args.join(' ')}. Try --help`);
