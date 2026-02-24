# PEMAIL.DBF Schema

**Records:** 4,017 | **Record Length:** 95

| Field | Type | Width | Description |
|-------|------|-------|-------------|
| DATASET | c(8) | 8 | Source dataset (left-padded to 8 chars) |
| PULP | c(6) | 6 | Reference to PULP person ID |
| LABEL | c(15) | 15 | Email type/label (Main, Work, Home, etc.) |
| EMAIL | c(65) | 65 | Email address |

## Keys and Indexes
- **X1PEMAIL index:** dataset + pulp (seek by person within dataset)
- One person can have multiple email addresses with different labels

## PEMAILTM.DBF (Staging Table)
- 2,431 records
- Same as PEMAIL + extra ID_NO c(6) field
- Used during batch processing / data migration

## Label Values (observed)
- Main, Work, Home, work (inconsistent casing)
- Empty string (some records have no label)

## Source Files
- **Location:** c:\clients\prostan\PEMAIL.DBF
- **JSON export:** c:\clients\prostan\PEMAIL.JSN (via pmailjsn.prg)
