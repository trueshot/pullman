# PULP Code Specification — Draft

**Status:** Working draft from source code analysis
**Date:** 2026-02-24
**Authority:** Core Pullman

---

## What Is a PULP Code?

A PULP code is a numeric identifier (up to 6 digits) assigned to a person
in the produce industry. It is portable — the same PULP ID follows a person
across datasets and companies.

## Format
- **Type:** Numeric string, up to 6 characters
- **Range:** Starts at 100000 (observed), incremented by PLPTRACK counter
- **Uniqueness:** Global across all datasets (not per-dataset)

## Record Structure (PULP.DBF)

| Field | Type | Width | Description |
|-------|------|-------|-------------|
| NAME | c | 40 | Contact name |
| DATASET | c | 8 | Source dataset |
| ID_NO | c | 6 | Company account code (= PLUG code) |
| PULP | c | 6 | Person identifier |
| EMAIL | c | 65 | Primary email |
| DOMAIN | c | 45 | Email domain |

## Associated Table: PEMAIL.DBF

| Field | Type | Width | Description |
|-------|------|-------|-------------|
| DATASET | c | 8 | Source dataset |
| PULP | c | 6 | Person identifier |
| LABEL | c | 15 | Email label (Main, Work, Home) |
| EMAIL | c | 65 | Email address |

## Cross-System Relationships

```
THEARAP.id_no ──────→ PULP.id_no     (company link)
PULP.pulp     ──────→ PEMAIL.pulp    (person's emails)
PULP.id_no    ══════  PLUG code      (same value)
```

PULP.id_no IS the PLUG code. This is the cross-system join between
people (PULP) and companies (PLUG).

## Identity Model

A person is identified by their PULP code. When the same person exists
in multiple datasets (e.g., works with multiple trading partners),
they share the same PULP code but may have different ID_NO values
(because ID_NO is the company's code in each dataset's namespace).

```
PULP 100121 = Chas Barber
  farmwey  dataset → ID_NO TRUESH (TrueShot in FarmWey's namespace)
  freshpro dataset → ID_NO TRUE   (TrueShot in FreshPro's namespace)
  trueshot dataset → ID_NO TRUES  (TrueShot in their own namespace)
```

## Data Scale
- **PULP records:** 3,144
- **PEMAIL records:** 4,017
- **CHAS records:** 6,645 (PLUG code assignments)
- **Datasets:** Multiple (farmwey, freshpro, trueshot, willis, etc.)

## CHAS.DBF — PLUG Code Assignment Table

| Field | Type | Width | Description |
|-------|------|-------|-------------|
| PLUG | n | 5 | PLUG code (numeric) |
| DATASET | c | 8 | Source dataset |
| ID_NO | c | 6 | Company account code |
| UPDATED | l | 1 | Verified against THEARAP |

Maps dataset+id_no to PLUG codes. Verified by upchas.prg against THEARAP.

## Open Questions
- Role taxonomy: Where are roles stored? Not in PULP.DBF fields.
- PULP ID reuse: Is cross-dataset sharing always intentional?
- Name handling: No formal first/last name separation.
- Deduplication: No built-in dedup in addper.prg.
