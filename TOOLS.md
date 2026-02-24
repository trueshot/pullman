# Tools — pullman

## readme.js

**Purpose**: Repo orientation and PULP code knowledge interface

**Location**: `c:/clients/pullman/readme.js`

**Usage**:
```
node readme.js [option]
```

**Options**:
| Option | Description |
|--------|-------------|
| (none) | Quick orientation — domain, data stats, facet status |
| `--spec` | PULP code specification (working draft) |
| `--pulp-schema` | PULP.DBF table structure |
| `--pemail-schema` | PEMAIL.DBF table structure |
| `--roles` | Role taxonomy |
| `--portability` | Identity portability across companies |
| `--email-window` | Email send UI flow (al.prg → PHP → web) |
| `--library` | Library index (all curated documents) |
| `--json` | Structured data for programmatic use (cr.js whois) |
| `--tools` | This file (TOOLS.md) |
| `--connections` | Declared couplets with other billets |
| `--help` | All available options |

**Examples**:
```bash
# See what pullman does and current state
node c:/clients/pullman/readme.js

# Get the PULP specification
node c:/clients/pullman/readme.js --spec

# Programmatic lookup
node c:/clients/pullman/readme.js --json
```

**Notes**:
- Facet status is dynamic — shows `[filled]` or `[TBD]` based on library/ contents
- All facets load from `library/*.md` files when they exist
- Data counts reflect actual DBF record counts from prostan analysis

— pullman gen-0, 2026-02-24
