# Excel → Odoo Migration Checklist (v3)

40 items · 5 phases · field-tested across 5 manufacturing go-lives in Bangladesh.

By Mehedi Hasan — Odoo Functional Consultant & Business Analyst
https://mhasan.me/lab/0008-excel-odoo-migration-checklist

Priority legend:  [CRIT] Critical · [MUST] Must-do · [NICE] Nice-to-have

---

## Phase 01 — Inventory of truth  (~1 week)

Find every spreadsheet, Access database, and WhatsApp group where data lives.
If you skip this, you'll discover the "real" master list two weeks after go-live.

- [ ] 01. [CRIT] List every system, sheet and folder where business data currently lives — include the "shadow" spreadsheets on people's laptops.  (Owner: BA + Ops Lead)
- [ ] 02. [MUST] For each source, name the human owner — not the department.  (Owner: BA)
- [ ] 03. [MUST] Snapshot row counts and last-modified dates per sheet.  (Owner: Data Lead)
- [ ] 04. [CRIT] Flag duplicate masters (two customer lists, three product catalogs). Decide which is canonical first.  (Owner: BA + Finance)
- [ ] 05. [MUST] Identify all external feeds (banks, customs, marketplace, EDI).  (Owner: IT)
- [ ] 06. [MUST] Document the data dictionary in business language, not column names.  (Owner: BA)
- [ ] 07. [NICE] Confirm legal data retention requirements per object class.  (Owner: Legal / Finance)
- [ ] 08. [CRIT] Freeze the source spreadsheets in a "before" backup folder.  (Owner: IT)

## Phase 02 — Cleanse & normalize  (~2 weeks)

Most migration disasters live here. A person has to make decisions, line by line.

- [ ] 09. [CRIT] De-duplicate customer master on tax ID + normalized name.  (Owner: Sales + Finance)
- [ ] 10. [CRIT] Standardize units of measure across the product master.  (Owner: Ops)
- [ ] 11. [MUST] Validate currency codes against ISO-4217.  (Owner: Finance)
- [ ] 12. [MUST] Resolve "unknown vendor" / "misc supplier" catch-all entries.  (Owner: Procurement)
- [ ] 13. [CRIT] Decide the cut-off rule for open vs. closed transactions — get finance to sign it in writing.  (Owner: Finance)
- [ ] 14. [MUST] Flag and isolate non-ASCII data that breaks downstream tools.  (Owner: Data Lead)
- [ ] 15. [MUST] Scrub PII from non-production environments.  (Owner: IT)
- [ ] 16. [CRIT] Enrich missing GL codes against the new chart of accounts.  (Owner: Finance)

## Phase 03 — Map & transform  (~1.5 weeks)

Spend disproportionate time on the mapping. The transform script is the easy part.

- [ ] 17. [CRIT] Build source → target field map for every object you'll migrate.  (Owner: BA + Tech)
- [ ] 18. [MUST] Define default values for every required Odoo field with no source.  (Owner: BA)
- [ ] 19. [CRIT] Decide opening balance strategy: per-customer, per-account, per-product.  (Owner: Finance)
- [ ] 20. [MUST] Map taxes, fiscal positions and analytic tags.  (Owner: Finance)
- [ ] 21. [MUST] Lock the external ID convention (__import__.<source>.<id>).  (Owner: Tech)
- [ ] 22. [MUST] Translate UoM conversions where source & target differ.  (Owner: Ops)
- [ ] 23. [NICE] Pre-compute lot/serial assignments for inventory on hand.  (Owner: Warehouse)
- [ ] 24. [MUST] Document one-way fields (no rollback path) prominently.  (Owner: BA)

## Phase 04 — Load & reconcile  (~1 week, ×2 dry runs)

Two full dry runs, minimum. The first will fail in interesting ways.

- [ ] 25. [CRIT] Load order: company → COA → partners → products → BOMs → stock → open docs.  (Owner: Tech)
- [ ] 26. [CRIT] Run dry run #1 against a copy of production config.  (Owner: Tech)
- [ ] 27. [MUST] Reconcile counts: source rows vs. target records, per object.  (Owner: Data Lead)
- [ ] 28. [CRIT] Reconcile sums: open AR, AP, stock value to the rupee/dollar.  (Owner: Finance)
- [ ] 29. [MUST] Spot-check 20 random records per object with the source owner.  (Owner: BA + Owners)
- [ ] 30. [MUST] Document the time-to-load per object for the cutover plan.  (Owner: Tech)
- [ ] 31. [CRIT] Run dry run #2 with the actual cutover team and timing.  (Owner: PM)
- [ ] 32. [MUST] Capture every error message into a known-issue log.  (Owner: Tech)

## Phase 05 — Cutover & sign-off  (~1 weekend)

Go-live is logistics, not engineering. Print the runbook. Print the rollback.

- [ ] 33. [MUST] Communicate the freeze window to operations 14 days in advance.  (Owner: PM)
- [ ] 34. [CRIT] Take the final source snapshot at T-0; lock write access.  (Owner: IT)
- [ ] 35. [CRIT] Execute the load runbook, signing each step in real time.  (Owner: Tech)
- [ ] 36. [CRIT] Reconcile balances against pre-cutover figures.  (Owner: Finance)
- [ ] 37. [MUST] Run the smoke-test script: 10 happy-path transactions, all modules.  (Owner: BA)
- [ ] 38. [CRIT] Get written sign-off from each module owner before re-opening operations.  (Owner: PM)
- [ ] 39. [MUST] Post the rollback playbook somewhere physical and visible.  (Owner: PM)
- [ ] 40. [NICE] Schedule a 7-day, 30-day and 90-day reconciliation review.  (Owner: BA + Finance)

---

Summary: 40 items — 12 Critical, 21 Must-do, 7 Nice-to-have.

Licence: free to copy, adapt, and use on your own ERP projects.
Source: https://mhasan.me/lab/0008-excel-odoo-migration-checklist
