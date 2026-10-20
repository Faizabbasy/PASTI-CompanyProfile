# FAST — landing page brief (source of truth)

Product: **FAST — Flexible Advanced Scheduling Technology**. FCP (Framework Code Product) by PASTI Technology, PT Hidup Pasti Bahagia.
Tagline: **Your Production. Your Rules.**
Route: `/fast`, under the navbar group **Frameworks** (with OPEN, SHIFTLY, e-CORPORATE).

Primary source: `FAST_FCP_Product_Book.docx` (owner, 2026-10-19). Only the **Product Blueprint** part is treated as public positioning. The FSD part is a confidential client-project document: it is used for capability evidence only, never copied as-is.

## Owner decisions (2026-10-19)
1. **Published 2026-10-19** (owner: “publish aja”) — navbar, footer, sitemap, indexable. *Previously:* **Not public yet.** The page is built but stays unlisted. It has `noindex`, is not in the sitemap and not in the footer. The navbar entry exists but is switched off (`hidden: true` in `useNavigation.ts`). Flip it when the owner approves publication.
2. **Placement:** navbar Frameworks → FAST, next to OPEN / SHIFTLY / e-CORPORATE.
3. **No ERP vendor names** (no "SAP"). Say "ERP / source systems".
4. **Logo:** temporary text wordmark until an official FAST logo file is supplied.
5. **Unverified capabilities are hidden.** They stay in `useFast().capabilities` with an explicit status (`specification_only`, `implementation_status_to_verify`, `needs_confirmation`). Only `implemented` items render. No blanket "configurable by agreement" label.
6. **Visuals:** reconstructed product UI with neutral sample data. **No FSD screenshot is published.**
7. **Copy:** full English. **Structure:** 12 content sections (the brief's 17 were merged).

## Never on the page
- AI / ML, autonomous scheduling, "optimization", real-time, live/direct source-system or MES connectivity, mobile app.
- Superiority claims ("best", "most advanced"). Invented numbers (cost, OEE, lead time, accuracy).
- Client names, people, contract numbers. Industry-specific terms from the source client (SMV, greige, polymer groups, twist, named textile processes). Per-company colours, sync times, working hours or thresholds.

## Capability classification
| Capability | Status | Rendered |
|---|---|---|
| Scheduling Board / interactive Gantt (resource timeline, unscheduled queue, auto + manual, forward/backward, hour/day/week, validation, conflicts, locked operations) | implemented | yes |
| Constraint validation, hard/soft toggle per global / plant / scenario | implemented | yes |
| Constraints: planning horizon, due date, earliest start, operation sequence, material readiness, resource availability, prevent overlapping operations, priority order, factory calendar, work shift, skill matrix, manpower availability, partial schedule results | implemented | yes |
| Constraints: resource eligibility, resource capacity, respect pinned/firm schedule, setup time, changeover sequence | specification_only (COMING SOON in source) | no |
| Material readiness (BOM, inventory, PO/ETA, WIP, ongoing and scheduled orders; Fully / Partially Available, Expected On Time, Material Shortage) | implemented | yes |
| Process-time parameters incl. changeover (concept only) | implemented (read-only config) | yes, concept only |
| Skill matrix, operators, absences, suggested operator | implemented | yes |
| Scenario simulation (Active, Draft, Simulation, What-if, KPI comparison, scenario objectives) | implemented | yes, no "optimization" wording |
| Rescheduling drafts | implemented | yes |
| Progress tracking / plan vs actual (health + execution status, synced) | implemented | yes, no "real-time" |
| Exception Center (categories + Critical/High/Medium/Low/Info) | implemented | yes, no thresholds |
| Capacity & bottleneck dashboard, executive dashboard, reports + CSV export | implemented | yes |
| OTD / schedule adherence / order tracking dashboards (REP-11..17) | specification_only | no |
| Multi-company / multi-plant, roles & permissions, scoped data, organisation audit log, factory calendar, resource unavailability | implemented | yes |
| Overlapping production | implementation_status_to_verify | no |
| Actual production confirmation | implementation_status_to_verify | no |
| Overlap parameters, workforce source of truth, calendar precedence, override rights | needs_confirmation | no |

## Page structure (12 sections + global header/footer)
01 Hero · 02 Why scheduling gets complex · 03 A framework, not a blank page · 04 How FAST works · 05 Scheduling Board (signature, the only desktop pin) · 06 Constraint-aware scheduling (+ advanced production logic) · 07 Production readiness · 08 Scenario simulation & rescheduling · 09 Plan vs actual + Exception Center · 10 Management visibility · 11 Integration & enterprise operations · 12 Why FAST + Request a Demo (WhatsApp hand-off, like e-CORPORATE).

Copy and data: `app/composables/useFast.ts`. Components: `app/components/fast/`.
