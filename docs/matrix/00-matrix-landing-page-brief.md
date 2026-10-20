# MATRIX — landing page brief (source of truth)

**Product:** MATRIX — Material Tracking, Inventory & Resource eXecution. It is an FCP by PASTI Technology (PT Hidup Pasti Bahagia).
**Concept:** Integrated Inventory & Material Management.
**Headline:** Material certainty is operational certainty.
**Route:** `/matrix`, in the navbar group **Frameworks**. It is public from launch.

**Primary source:** `MATRIX_Product_Book_by_PASTI_Technology.docx` (owner, 2026-10-19).
- The book says MATRIX is a *proposed* brand for the IIMS solution in a **confidential** technical & commercial proposal written for one client.
- Only product-level capabilities are used.
- Client context, screenshots and sample values are never published.

## Owner decisions (2026-10-19)
1. **Public immediately.** The page is indexable and appears in navbar Frameworks, the footer platform links and the sitemap.
2. **Industry-neutral.** "Operations-critical inventory". No industry is named and the client's sector is not mentioned.
3. **Colour.** PASTI navy + yellow, with no product accent token.
   - Stock states have their own semantic colours and **always carry a text label**:
     - net available: yellow
     - reserved: steel blue `#3E7A99`
     - quarantine: hatched grey-blue
     - damaged: `#C2412D`
   - The global `cyan` token is Yellow, so don't use it here.
4. **Sample data.**
   - Generic industrial catalogue items (ball valve, seal kit, pressure gauge…) with `MTX-` codes.
   - Neutral warehouse names ("Central Warehouse", "Yard B").
   - **Roles instead of people.**
   - **No currency values.**
   - Every figure is labelled "Illustrative".
5. **Structure.** 12 sections. Reporting is merged into Traceability & Governance, and Why MATRIX is merged into Request a Demo.
6. Full English copy, a temporary text wordmark (`MatrixMark`), and a WhatsApp demo form with no fake backend.

## Never on the page
- **Client identity and proposal details.**
  - The client's name and logo.
  - The field, block and region.
  - The proposal number.
  - Any screenshot, including cropped or blurred ones.
  - Person names, `MAT-` / `KRB-` codes, receipt or request IDs.
  - Rp values, WITA timestamps.
- **Unconfirmed baseline claims:**
  - RFID
  - offline-first mobile
  - source-code handover
  - implementation duration
  - backup/deployment guarantees
  - out-of-the-box ERP compatibility
- **Automation claims:**
  - automatic purchasing or auto-replenishment
  - automatic disposal
  - AI or predictive features
  - real-time
  - "zero stock-outs"
- **Outcome claims:** quantified outcomes. The source itself says results depend on configuration, data quality and implementation.

## Capability classification
Only `core` and `configurable` items are rendered. The rest stay in `useMatrix().register`.

| Capability | Source | Status |
|---|---|---|
| Stock on hand: on-hand / reserved / quarantine / damaged / net available, location, search | §4 | core |
| Inspection receipts not posted on-hand until confirmed | §3 | core |
| Material 360 + movement ledger | §5 | core |
| Critical availability (requirement, shortfall, lead time, condition review) | §6 | core |
| Replenishment recommendation **under review** | §6 | core (never automatic) |
| Aging & surplus, criticality guard, disposition evidence | §7 | core (review-gated) |
| Receiving & inspection, putaway, material request, picking & issue, transfer & return, stock count | §8–9 | core |
| Warehouse Explorer | §10 | core |
| Audit trail, reporting catalog | §10–11 | core |
| RBAC, maker-checker, approval authority, SoD, rejection reason, decision evidence | §11 | core |
| Roles, KPI definitions | §14 | configurable |
| ERP interface, interface monitoring, data migration, controlled cutover | §11, §13 | configurable (scoped by blueprint) |
| Implementation phases | §13 | configurable (not a contractual schedule) |
| Equipment & spare parts, document management, notifications | §12 | proposal_specific (not rendered) |
| Backup procedure, controlled deployment | §11 | needs_confirmation (not rendered) |
| RFID, offline-first mobile, source-code handover, duration | §13, §15 | needs_confirmation (never rendered) |
| Client names, places, codes, people, values | screenshots | client_specific / sample_data (never rendered) |

## Page structure (12 sections + global header/footer)
1. Hero
2. The Material Visibility Problem
3. What MATRIX Is
4. Material Intelligence
5. Material 360 (signature; the only desktop pin)
6. Availability to Action
7. Aging, Surplus & Deadstock
8. Warehouse Execution
9. Warehouse Explorer
10. Traceability & Governance
11. Integration & Implementation
12. Why MATRIX + Request a Demo

**Where things live:**
- Copy and data: `app/composables/useMatrix.ts`.
- Components: `app/components/matrix/`.
