/**
 * /dora — DORA, Document Recognition & Analysis (FCP by PASTI Technology).
 * Brief + audit: docs/dora/00-dora-landing-page-brief.md.
 *
 * Source: DORA_FCP_Product_Book.docx (owner, 2026-10-19, confidential
 * blueprint). Copy is an English rendering of its positioning and of the
 * capabilities its UI shows — no OCR engine, accuracy, speed, SLA, limits,
 * SSO/MFA, audit-trail or API claims, no AI wording, no vendor names.
 *
 * Items the source leaves open stay in `register` with an explicit status
 * and are never rendered (owner decision 2026-10-19). Every document, value
 * and number below is synthetic, illustrative sample data — none comes from
 * the source screenshots.
 */
export type DoraStatus = 'core' | 'configurable' | 'demo_only' | 'design_recommendation' | 'open_decision' | 'needs_confirmation'

export interface DoraRegisterItem {
  name: string
  source: string
  status: DoraStatus
}

/** -1 recognising · 0 queue · 1 compare · 2 flag · 3 correct · 4 decide */
export type VerifyStep = -1 | 0 | 1 | 2 | 3 | 4

export interface DoraField {
  key: 'docNo' | 'date' | 'subject' | 'name'
  label: string
  /** What recognition returned. */
  ocr: string
  /** The value after review (equal to `ocr` unless corrected). */
  value: string
  /** Illustrative confidence, percent. */
  conf: number
  /** Lower confidence — highlighted for review at step 2. */
  review?: boolean
}

export function useDora() {
  const seo = {
    title: 'DORA — Document Recognition & OCR Verification | PASTI',
    description:
      'DORA is a configurable document recognition and analysis framework for OCR-enabled digitization, structured field extraction, human verification, search, and export.'
  }

  // Internal register (docs/dora/00). Only `core` / `configurable` render.
  const register: DoraRegisterItem[] = [
    { name: 'Document intake (PDF, JPG, PNG, TIFF, multi-page)', source: '§5 F-03 BR-01', status: 'core' },
    { name: 'OCR & text recognition', source: '§5 F-04', status: 'core' },
    { name: 'Document classification (auto-detect or chosen)', source: '§5 F-05', status: 'core' },
    { name: 'Structured field extraction per template', source: '§5 F-04 §7.1', status: 'core' },
    { name: 'Confidence shown per field', source: '§5 F-06 BR-04', status: 'core' },
    { name: 'Visual field-location marker', source: '§5 F-06 F-07', status: 'core' },
    { name: 'Field review & correction', source: 'F-07', status: 'core' },
    { name: 'Verification queue & status', source: '§5 F-06', status: 'core' },
    { name: 'Verification decision', source: 'F-08 BR-09', status: 'configurable' },
    { name: 'Document search & filters', source: 'F-09', status: 'core' },
    { name: 'Export CSV / Excel / JSON', source: 'F-10', status: 'core' },
    { name: 'Operational dashboard', source: 'F-02 §11', status: 'core' },
    { name: 'Role baseline (5 personas)', source: '§3.1 §9', status: 'configurable' },
    { name: 'Integration boundaries', source: '§10', status: 'needs_confirmation' },
    { name: 'Admin functions', source: 'F-11', status: 'needs_confirmation' },
    { name: 'API endpoints', source: 'F-12', status: 'needs_confirmation' },
    { name: 'Audit trail events', source: '§9.1', status: 'design_recommendation' },
    { name: 'Masking, retention, deletion', source: '§9.2 §12', status: 'open_decision' },
    { name: 'OCR engine, language, threshold, accuracy target', source: '§15.1 #2', status: 'open_decision' },
    { name: 'Max 5 files per upload, 20 pages per document', source: 'BR-02 UI-04', status: 'demo_only' },
    { name: '~5–7 s per scanned page; 300 DPI guidance', source: 'UI-04', status: 'demo_only' },
    { name: 'Red below 80% confidence', source: 'BR-05', status: 'demo_only' }
  ]

  const subnav = [
    { id: 'overview', label: 'Overview' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'ocr', label: 'OCR' },
    { id: 'verification', label: 'Verification' },
    { id: 'search', label: 'Search' },
    { id: 'integration', label: 'Integration' }
  ]

  // ---- Synthetic sample letter (owner D3) ----------------------------------
  const sample = {
    file: 'surat-contoh-0001.pdf',
    type: 'Official letter',
    fields: [
      { key: 'docNo', label: 'Document No.', ocr: '000.1/OO01/CONTOH/X/2026', value: '000.1/0001/CONTOH/X/2026', conf: 71, review: true },
      { key: 'date', label: 'Date', ocr: '2026-10-12', value: '2026-10-12', conf: 97 },
      { key: 'subject', label: 'Subject', ocr: 'Permohonan Data Contoh', value: 'Permohonan Data Contoh', conf: 94 },
      { key: 'name', label: 'Name', ocr: 'NAMA CONTOH', value: 'NAMA CONTOH', conf: 95 }
    ] as DoraField[]
  }

  // ---- 01 Hero --------------------------------------------------------------
  const hero = {
    eyebrow: 'Framework Code Product',
    full: 'Document Recognition & Analysis',
    body: 'DORA is a configurable document-recognition framework that helps organizations digitize documents, extract structured fields, review OCR results, and make document data searchable and usable in business workflows.',
    facts: ['OCR-enabled digitization', 'Human-in-the-loop review', 'Search & export']
  }

  // ---- 02 Problem -----------------------------------------------------------
  const problem = {
    eyebrow: 'The document problem',
    headline: 'The data is in the document. Getting it out is still manual.',
    lede: 'PDFs and scans arrive every day. Someone still has to read them, type the values, check them and find them again later.',
    items: [
      { name: 'Read by hand', body: 'PDFs and scanned images still need a person to read them before the data can be used.' },
      { name: 'Typed again', body: 'The same values are re-entered from documents into systems, one file at a time.' },
      { name: 'OCR misreads', body: 'Text recognition can confuse characters, especially on scanned pages.' },
      { name: 'Unchecked values', body: 'Extracted data has to be validated before anyone relies on it.' },
      { name: 'Every type differs', body: 'Letters, forms and reports each follow their own layout.' },
      { name: 'Every field differs', body: 'What matters in one document type is irrelevant in the next.' },
      { name: 'Every workflow differs', body: 'Each organization reviews and approves documents by its own SOP.' },
      { name: 'Hard to find again', body: 'Filed documents and their values need to be searchable later.' }
    ]
  }

  // ---- 03 What DORA is ------------------------------------------------------
  const core = {
    eyebrow: 'What DORA is',
    headline: 'A product core, configured around your documents.',
    lede: 'DORA is a Framework Code Product: a reusable document-recognition core, configured to each organization’s document types, business fields, verification workflow and SOP.',
    modules: ['Document intake', 'OCR & recognition', 'Field extraction', 'Verification workspace', 'Search & export', 'Operational dashboard'],
    config: ['Document types', 'Field templates', 'Extraction fields', 'Verification statuses', 'Confidence handling', 'Search filters', 'Export formats', 'Roles & permissions', 'Integration boundaries'],
    not: 'DORA is not assumed to replace your ERP, DMS or main archive without an agreed integration scope.',
    path: [
      { name: 'Understand', out: 'Requirement baseline' },
      { name: 'Design', out: 'Functional blueprint' },
      { name: 'Customize', out: 'Configured DORA' },
      { name: 'Develop', out: 'Approved extensions' },
      { name: 'Integrate', out: 'Integration specification' },
      { name: 'Deploy', out: 'Release & handover' }
    ]
  }

  // ---- 04 How DORA works ----------------------------------------------------
  const flow = {
    eyebrow: 'How DORA works',
    headline: 'From sign-in to search, one traceable path.',
    lede: 'Ten steps take a document from upload to usable data. People and system each own their part.',
    steps: [
      { name: 'Sign in', actor: 'User', body: 'Authorized users sign in to the workspace their role allows.', result: 'A session scoped to the user’s access.' },
      { name: 'Upload', actor: 'Operator', body: 'Files are selected with a document type, or with auto-detection.', result: 'Files accepted or rejected by validation.' },
      { name: 'Intake validation', actor: 'System', body: 'File type and batch rules are checked before processing.', result: 'Valid files queue; invalid ones get a reason.' },
      { name: 'OCR / recognition', actor: 'System', body: 'Text is read and fields are identified.', result: 'Extracted text and fields, with confidence where available.' },
      { name: 'Classification', actor: 'System / User', body: 'The document type is identified or applied.', result: 'A document type that can still be corrected.' },
      { name: 'Verification queue', actor: 'Verifier', body: 'Documents waiting for review are opened from the queue.', result: 'Preview, fields and status side by side.' },
      { name: 'Review & correction', actor: 'Verifier', body: 'Fields are compared with the source image and corrected if needed.', result: 'Checked and corrected field values.' },
      { name: 'Decision', actor: 'Verifier', body: 'Verification is completed according to the workflow.', result: 'A final status, as configured.' },
      { name: 'Search & export', actor: 'Business user', body: 'Permitted users find documents and export their data.', result: 'Search results or an export file.' },
      { name: 'Monitor', actor: 'Admin / Manager', body: 'Volume, queues and quality metrics are followed.', result: 'Operational status in view.' }
    ]
  }

  // ---- 05 OCR & extraction --------------------------------------------------
  const extraction = {
    eyebrow: 'OCR & structured extraction',
    headline: 'From page to fields.',
    lede: 'DORA turns unstructured document content into structured field data, based on the document templates configured for your organization.',
    caps: [
      { name: 'Document intake', body: 'PDF, JPG, PNG and TIFF files, including multi-page documents, enter the flow after validation.' },
      { name: 'OCR & text recognition', body: 'Text is read from digital documents and from scanned images.' },
      { name: 'Document classification', body: 'The type is detected automatically or chosen at upload — and can be corrected during verification.' },
      { name: 'Structured field extraction', body: 'Values such as document number, date, subject and name are extracted by the template for that type.' },
      { name: 'Confidence indication', body: 'Each extracted field carries a confidence indication, so reviewers know where to look first.' }
    ],
    note: 'Fields depend on the configured document type. Templates, required fields and confidence handling are defined during implementation.'
  }

  // ---- 06 Verification ------------------------------------------------------
  const verify = {
    eyebrow: 'Human-in-the-loop verification',
    headline: 'Automation with human control.',
    lede: 'OCR output is reviewed, not assumed correct. Every extracted field sits next to its place on the source page — checked, corrected and decided by a person.',
    steps: [
      { name: 'Open from the queue', body: 'A document waiting for verification opens with preview, type and status.' },
      { name: 'Compare', body: 'Select a field to see exactly where it sits on the page.' },
      { name: 'Flag', body: 'Lower-confidence fields are highlighted for a closer look.' },
      { name: 'Correct', body: 'The reviewer fixes the value; it is saved and shown when reopened.' },
      { name: 'Decide', body: 'Verification is completed — the status follows your workflow.' }
    ],
    note: 'Markers appear where field mapping is configured. The confidence method and review rules are agreed per implementation.'
  }

  // ---- 07 Search & export ---------------------------------------------------
  const search = {
    eyebrow: 'Search & export',
    headline: 'Find the document. Use the data.',
    lede: 'Extracted values become searchable. Find documents by text, file name or field value, narrow them with filters, and export the result for the next step in your process.',
    filters: ['Full text', 'File name', 'Field value', 'Document type', 'Status', 'Date range', 'Configured business field'],
    query: 'CONTOH',
    results: [
      { file: 'surat-contoh-0001.pdf', type: 'Official letter', status: 'Verified', date: '2026-10-12', field: 'Document No.', value: '000.1/0001/CONTOH/X/2026' },
      { file: 'surat-contoh-0002.pdf', type: 'Official letter', status: 'Waiting verification', date: '2026-10-13', field: 'Subject', value: 'Undangan Rapat Contoh' },
      { file: 'formulir-contoh-014.png', type: 'Other', status: 'Verified', date: '2026-10-14', field: 'Name', value: 'NAMA CONTOH' },
      { file: 'laporan-unit-contoh.pdf', type: 'Other', status: 'Waiting verification', date: '2026-10-15', field: 'Full text', value: '…ringkasan kegiatan unit contoh…' }
    ],
    formats: ['CSV', 'Excel', 'JSON'] as const,
    note: 'Export columns, limits and permissions are defined per implementation.'
  }

  // ---- 08 Dashboard ---------------------------------------------------------
  const dashboard = {
    eyebrow: 'Operational dashboard',
    headline: 'Know what is processed, waiting and stuck.',
    lede: 'Volume, the verification queue, quality and recent documents in one view — so operations see where documents are before the queue grows.',
    // Illustrative values (owner D4) — not product metrics.
    processed: { docs: '128', pages: '904 pages' },
    waiting: { docs: '17', split: 'Verified 104 · Rejected 7' },
    quality: { value: '91%', label: 'avg. field confidence' },
    volume: [6, 9, 7, 11, 8, 4, 3, 10, 12, 9, 13, 11, 6, 9],
    recent: [
      { file: 'surat-contoh-0002.pdf', type: 'Official letter', status: 'Waiting verification', pages: 2 },
      { file: 'formulir-contoh-014.png', type: 'Other', status: 'Verified', pages: 1 },
      { file: 'laporan-unit-contoh.pdf', type: 'Other', status: 'Waiting verification', pages: 12 }
    ],
    widgets: ['Processed documents', 'Waiting verification', 'Quality & confidence', '14-day volume', 'Attention queue', 'Recent documents'],
    note: 'KPI definitions, aggregation and refresh are agreed per implementation.'
  }

  // ---- 09 Configurable document model --------------------------------------
  const model = {
    eyebrow: 'Configurable document model',
    headline: 'Different documents. Different fields. One configurable core.',
    lede: 'Each document type carries its own template — fields, required flags, validation, confidence handling, statuses, review path, search and export fields. Types are configured with you, not assumed to be prebuilt.',
    types: [
      {
        id: 'a',
        name: 'Official letter',
        fields: [
          { name: 'Document No.', required: true, rule: 'Pattern' },
          { name: 'Date', required: true, rule: 'Date format' },
          { name: 'Subject', required: true, rule: 'Length' },
          { name: 'Name', required: false, rule: 'Text' }
        ],
        statuses: ['Waiting verification'],
        outcomes: ['Verified', 'Rejected'],
        path: 'Single review',
        search: ['Document No.', 'Subject', 'Name'],
        export: ['File name', 'Document No.', 'Date', 'Subject', 'Name']
      },
      {
        id: 'b',
        name: 'Application form',
        fields: [
          { name: 'Reference No.', required: true, rule: 'Pattern' },
          { name: 'Applicant', required: true, rule: 'Text' },
          { name: 'Application date', required: true, rule: 'Date format' },
          { name: 'Category', required: false, rule: 'List value' },
          { name: 'Remarks', required: false, rule: 'Length' }
        ],
        statuses: ['Waiting verification', 'In review'],
        outcomes: ['Verified', 'Returned'],
        path: 'Review, then approval',
        search: ['Reference No.', 'Applicant', 'Category'],
        export: ['Reference No.', 'Applicant', 'Application date', 'Category']
      },
      {
        id: 'c',
        name: 'Internal report',
        fields: [
          { name: 'Report No.', required: true, rule: 'Pattern' },
          { name: 'Period', required: true, rule: 'Date range' },
          { name: 'Unit', required: false, rule: 'List value' }
        ],
        statuses: ['Waiting verification'],
        outcomes: ['Verified'],
        path: 'Single review',
        search: ['Full text', 'Report No.', 'Unit'],
        export: ['Report No.', 'Period', 'Unit', 'Full text']
      }
    ],
    note: 'Sample configurations. Document types and templates are defined with you during discovery.'
  }

  // ---- 10 Governance --------------------------------------------------------
  const governance = {
    eyebrow: 'Access, privacy & governance',
    headline: 'Access follows role and scope.',
    lede: 'Who can upload, correct, decide, search and export is set per role and data scope. Sensitive data is handled according to your organization’s policy.',
    roles: [
      { name: 'Administrator', body: 'Manages access and configuration.', can: ['Access & configuration', 'Dashboard'] },
      { name: 'Operator / Uploader', body: 'Uploads documents and follows their status.', can: ['Upload', 'Document status'] },
      { name: 'Verifier / Reviewer', body: 'Reviews and corrects extracted fields, and completes verification by workflow.', can: ['Verification queue', 'Field correction', 'Verification decision'] },
      { name: 'Viewer / Business user', body: 'Searches and views documents and fields within their scope.', can: ['Search', 'View documents & fields'] },
      { name: 'Integration client', body: 'Exchanges data with DORA through an agreed integration, where one is defined.', can: ['Agreed integration'] }
    ],
    principles: [
      'Access follows role and data scope.',
      'Field correction is limited to permitted roles.',
      'Verification decisions are limited to authorized roles.',
      'Search, preview and export follow the same scope.'
    ],
    policy: 'Sensitive data needs access control. Masking, retention, deletion and export rules follow your organization’s policy and applicable regulation.',
    note: 'Role baseline. Final permissions are agreed per implementation.'
  }

  // ---- 11 Integration -------------------------------------------------------
  const integration = {
    eyebrow: 'Integration & enterprise fit',
    headline: 'Built to sit inside your landscape.',
    lede: 'Designed to integrate with enterprise systems through agreed data contracts and integration boundaries.',
    boundaries: [
      { name: 'Document repository / storage', body: 'Retrieve or store files and results.' },
      { name: 'Business application · ERP · DMS', body: 'Receive extracted fields or status.' },
      { name: 'Identity provider', body: 'Central identity and role mapping.' },
      { name: 'API consumer', body: 'Submit documents, query results or status.' },
      { name: 'Notification channel', body: 'Queue or failure notifications.' }
    ],
    contract: [
      'Source of truth for files, metadata and fields',
      'Field names, types, formats and mapping',
      'Authentication and authorization between systems',
      'Retry, timeout, duplicate and error handling',
      'Sync timing, monitoring, reconciliation and ownership'
    ],
    note: 'Possible boundaries, scoped per project. DORA is not assumed to replace ERP, DMS or archive systems.'
  }

  // ---- 12 Why DORA + 13 demo ------------------------------------------------
  const why = {
    eyebrow: 'Why DORA',
    headline: 'Documents in. Verified data out.',
    items: [
      { name: 'OCR-enabled digitization', body: 'Digital and scanned documents become text.' },
      { name: 'Structured field extraction', body: 'Values land in fields, by template.' },
      { name: 'Human-in-the-loop review', body: 'People check what OCR returns.' },
      { name: 'Visual verification', body: 'Each field is shown on the source page.' },
      { name: 'Searchable output', body: 'Text and field values can be found again.' },
      { name: 'CSV · Excel · JSON export', body: 'Data leaves in a usable format.' },
      { name: 'Configurable document model', body: 'Types and fields fit your documents.' },
      { name: 'FCP customization approach', body: 'A proven core, shaped to your SOP.' }
    ]
  }

  const demo = {
    eyebrow: 'Request a demo',
    headline: 'Make Your Documents Work Like Data.',
    body: 'Discuss how DORA can be configured around your document types, extraction fields, verification workflow, and business process.',
    volumes: ['Under 1,000 per month', '1,000 – 10,000 per month', 'Over 10,000 per month', 'Not sure yet'],
    processes: ['Manual reading & data entry', 'Scanning without extraction', 'OCR without a review step', 'Other'],
    challenges: ['Manual data entry', 'OCR errors & validation', 'Many document types', 'Finding documents again', 'Getting data into other systems', 'Other'],
    next: ['Discovery', 'Blueprint', 'Configuration & build', 'Integration', 'SIT & UAT', 'Deployment & handover']
  }

  return { seo, register, subnav, sample, hero, problem, core, flow, extraction, verify, search, dashboard, model, governance, integration, why, demo }
}
