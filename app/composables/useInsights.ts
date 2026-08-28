export interface InsightArticle {
  index: string
  title: string
}

/**
 * Insights article titles, per .docs/PASTI_Cuberto_Template_Content_Mapping.docx
 * section 08 — INSIGHTS. Titles are used only as a content footprint per the
 * placement rule "Insights must use real PASTI articles. The mapping table gives
 * the content footprint, not fake publication history."
 *
 * Article 01's "REPLACE WITH" cell and the CTA cell are both truncated mid-word in
 * the source doc (no ellipsis marker) — "Building Digital Products That Actuall"
 * and "Visit insi". Their full text ("...Actually Work" / "Visit insights") was
 * confirmed directly by the client rather than guessed.
 *
 * No real PASTI article assets (thumbnail, publish date, author, category, reading
 * time) exist yet. Per the doc's content-safety rule, none of that metadata is
 * invented here — cards render title-only with an empty placeholder visual, same
 * approach as Trust's client logos and Selected Work's project imagery. Swap in
 * real article data (and extend this interface with real metadata fields) once
 * PASTI's actual published articles are provided.
 */
export function useInsights() {
  const articles: InsightArticle[] = [
    { index: '01', title: 'Building Digital Products That Actually Work' },
    { index: '02', title: 'What Businesses Should Know Before Going Digital' },
    { index: '03', title: 'Technology, Creativity and the Future of Business' }
  ]

  return { articles }
}
