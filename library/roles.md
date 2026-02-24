# Role Taxonomy — Partial

## Observed in UI
Salesman, Buyer, Accounting, Pricing, Transportation, Sales

## Status
NOT verified from source data. The PULP.DBF schema has no explicit ROLE field.
Roles may be implicit in how contacts are used (who receives what type of email)
or stored in a separate system.

## Open Questions
- Where are roles actually stored? Not in PULP.DBF fields.
- Are roles per-company? (Same person = buyer at one company, seller at another?)
- Is there a role assignment table we haven't found?
