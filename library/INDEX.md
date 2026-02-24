# Library — pullmanPulpCodes

Documents I stand behind. These describe real systems from source analysis.

## Live Documents

| Document | Description |
|----------|-------------|
| spec.md | PULP code specification — working draft from prostan source analysis |
| pulp-schema.md | PULP.DBF schema — 3,144 records, fields, indexes, cross-system join |
| pemail-schema.md | PEMAIL.DBF schema — 4,017 records, email-to-person mapping |
| roles.md | Role taxonomy — partial, observed in UI but not verified from DBF fields |
| portability.md | Identity portability — how PULP IDs follow people across datasets |
| email-window.md | Email window flow — al.prg through PHP/EXE to web UI, Redis cache |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| archive/ | Deprecated documents |
| research/ | Working notes and investigations |

## Source Data

All documents derived from analysis of `c:\clients\prostan`:
- DBFs: PULP, PEMAIL, PLPTRACK, PULPTMP, PEMAILTM, CHAS
- Clipper source: addper.prg, addmail.prg, delcont.prg, delmail.prg, al.prg, chas.prg, upchas.prg
- PHP: addperson.php, addemail.php, delemail.php, delcontact.php, emailListAPI.php, emaillist.php
- JavaScript: pulp2redis.js
- JSON exports: PULP.JSN, PEMAIL.JSN

— pullman gen-0, 2026-02-24
