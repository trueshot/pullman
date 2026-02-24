# PULP.DBF Schema

**Records:** 3,144 | **Record Length:** 171

| Field | Type | Width | Description |
|-------|------|-------|-------------|
| NAME | c(40) | 40 | Contact name |
| DATASET | c(8) | 8 | Source dataset (left-padded to 8 chars) |
| ID_NO | c(6) | 6 | Company account code = PLUG code |
| PULP | c(6) | 6 | Unique person ID (from PLPTRACK counter) |
| EMAIL | c(65) | 65 | Primary email address |
| DOMAIN | c(45) | 45 | Email domain extracted from EMAIL |

## Keys and Indexes
- **X1PULP index:** dataset + id_no (seek by company within dataset)
- **Unique person key:** dataset + id_no + pulp

## PLPTRACK.DBF (Sequence Generator)
- 1 record, 1 field: NEXTPULP n(6)
- Incremented by addper.prg on each person add
- PULP IDs are global (not per-dataset)

## PULPTMP.DBF (Staging Table)
- 1,891 records
- Same as PULP minus EMAIL and DOMAIN fields
- Used during batch processing

## Cross-System Join
**PULP.id_no IS the PLUG code** (THEARAP.id_no).
Chain: THEARAP.id_no → PULP.id_no → PEMAIL.pulp

## Source Files
- **Location:** c:\clients\prostan\PULP.DBF
- **JSON export:** c:\clients\prostan\PULP.JSN (via pulp2jsn.prg)
