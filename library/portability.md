# Identity Portability

## The Problem
Same person can appear in different datasets with the same or different PULP ID.

## Observed Pattern
From PULP.JSN:
```
Chas Barber | farmwey  | id_no=TRUESH | pulp=100121
Chas Barber | freshpro | id_no=TRUE   | pulp=100121
Chas Barber | trueshot | id_no=TRUES  | pulp=100121
```

**Same PULP ID (100121) across 3 datasets** — but different ID_NO values
because ID_NO is the company's code in that dataset's namespace.

## How It Works
- PULP ID is global (assigned by PLPTRACK counter, not per-dataset)
- A person keeps their PULP ID across datasets
- ID_NO varies because each dataset has its own company codes
- DATASET scopes the company (ID_NO) not the person (PULP)

## Implications
- PULP ID is the portable identity — it follows the person
- ID_NO + DATASET identifies which company in which context
- Same person at multiple companies = multiple PULP records with same PULP ID but different ID_NO

## Open Questions
- Is PULP ID reuse always intentional? Or can collisions occur?
- What's the process for recognizing "same person, new company"?
- How does the system handle name changes?
