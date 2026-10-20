# DORA — landing page brief (source of truth)

**Product:** DORA — Document Recognition & Analysis. It is an FCP (Framework Code Product) from PASTI Technology, PT Hidup Pasti Bahagia.
**Headline:** Turn Documents Into Structured, Verifiable Data.
**Route:** `/dora`. In the navbar it sits under **Frameworks**, next to OPEN, SHIFTLY, e-CORPORATE and FAST.

**Primary source:** `DORA_FCP_Product_Book.docx` (from the owner, 2026-10-19). It is marked *Confidential – Project Use Only* and is a v1.0 blueprint "for validation and development".
- Only its positioning and its capabilities shown in the UI are treated as public.
- Its Functional Specification, UAT and Open Decisions are used as **evidence**, never copied.

## Owner decisions (2026-10-19)
1. **Published 2026-10-19** (owner: “publish aja”) — navbar, footer, sitemap, indexable. *Previously:* **The page is built but unlisted.** It carries `noindex`, stays out of the sitemap and the footer, and its navbar child has `hidden: true` in `useNavigation.ts`. Flip that flag when publication is approved.
2. **Accent colour.** The DORA product UI uses a true cyan. It is scoped to this page as the Tailwind token `doraCyan`, used for markers, scan lines and status signals.
   - `DEFAULT` is used **on dark surfaces only**.
   - `deep` is used for non-text strokes on white paper.
   - **Neither is ever used as text on white.**
   - PASTI Yellow stays the brand accent: the full stops and the primary CTA.
   - The global `cyan` token is **not** cyan. It aliases Yellow `#FBBA00`, so do not use it here.
3. **Sample document.** It is a synthetic official letter from "INSTANSI CONTOH". Its fields are Nomor / Tanggal / Perihal / Nama, all with obviously synthetic values. It has no NIK, no vehicle number, no address and no real institution.
4. **Numbers.** Any figure in a mock UI is a neutral illustrative value labelled "Illustrative". Never use the source's demo values and never state the 80% confidence threshold.
5. **Copy.** Full English.
6. **Logo.** A temporary text wordmark (`DoraMark`) until an official logo arrives. Never use "PILOT" or "FCB" (both appear in the source screenshots' footer).
7. **Demo form.** A WhatsApp hand-off, as on the FAST and e-CORPORATE pages. There is no fake backend.

## Never on the page
- **Raw screenshots.** None of the five source screenshots, not even cropped or blurred.
  - UI-05 uses real government letterhead (Kemenhub / Ditjen Hubdat → Kapolda Metro Jaya), a NIK, a name, a vehicle number and an address.
  - UI-03 shows the file "RFQ-OCR … CONFIDENTIAL.pdf".
  - UI-01 shows a superadmin login email.
- **Demo-only values.**
  - 5 files per upload
  - 20 pages per document
  - 5–7 s per scanned page
  - 300 DPI
  - "red below 80%"
  - the dashboard and confidence numbers from the screenshots
- **Open decisions and unverified items.**
  - OCR engine / vendor, languages, accuracy %, confidence threshold
  - speed or SLA
  - production limits, file size, concurrency
  - SSO / MFA, encryption, audit trail as active, API availability / rate limits
  - backup / RPO / RTO, deployment model
- **Claim words.** "AI-powered", "99%", "instant", "zero manual review", "automatic approval", "any document", "plug-and-play" ERP/DMS, vendor names.

## Capability classification
Only `core` and `configurable` items are rendered. Everything else stays in `useDora().register` with its status.

| Capability | Source | Status |
|---|---|---|
| Document intake: PDF / JPG / PNG / TIFF, multi-page | §5, F-03, BR-01 | core |
| OCR & text recognition (digital + scanned) | §5, F-04 | core |
| Document classification: auto-detect **or** chosen; correctable at verification | §5, F-05 | core |
| Structured field extraction per template | §5, F-04, §7.1 | core (fields configurable) |
| Confidence shown per field | §5, F-06, BR-04 | core (method/threshold open) |
| Visual field-location marker on the source image | §5, F-06/07, UAT-07 | core ("where field mapping is configured") |
| Field review & correction | F-07 | core |
| Verification queue & status | §5, F-06 | core |
| Verification decision | F-08, BR-09 | configurable (workflow-defined) |
| Search: full text, file name, field value, type, status, date, business field | F-09 | core |
| Export: CSV / Excel / JSON | F-10 | core (columns/limits/permission open) |
| Dashboard: processed, waiting, quality, 14-day volume, attention, recent | F-02, §11 | core (KPI formulas open) |
| Roles: Admin / Operator / Verifier / Viewer / Integration client | §3.1, §9 | configurable (baseline) |
| Integration boundaries: repository, business app / ERP / DMS, IdP, API consumers, notifications | §10 | needs_confirmation, rendered only as *possible boundaries via agreed data contracts* |
| Admin functions, API endpoints | F-11, F-12 | needs_confirmation, not rendered |
| Audit trail events | §9.1 | design_recommendation, not rendered |
| Masking / retention / deletion | §9.2 | open_decision, rendered only as "follows your organization's policy" |
| Upload limits, processing speed, DPI, 80% hint | BR-02, BR-05, UI-04 | demo_only, not rendered |

## Page structure (13 sections + global header/footer)
- 01 Hero
- 02 The Document Problem
- 03 What DORA Is
- 04 How DORA Works
- 05 OCR & Structured Extraction
- 06 Human-in-the-Loop Verification (signature; the only desktop pin)
- 07 Search & Export
- 08 Operational Dashboard
- 09 Configurable Document Model
- 10 Access, Privacy & Governance
- 11 Integration & Enterprise Fit
- 12 Why DORA
- 13 Request a Demo

**Where things live:**
- Copy and data: `app/composables/useDora.ts`
- Components: `app/components/dora/`
- Reveal and scroll helpers, shared with FAST: `useFastReveal`, `useFastScroll`
