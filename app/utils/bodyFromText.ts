import type { BodyBlock } from '#shared/utils/insightsSchema'

// "Tempel dari teks" in the article body editor: turns pasted plain text or
// Markdown (e.g. a draft from docs/insights/drafts) into body blocks.
//   blank line            → new block
//   ## / ### heading      → heading (the two biggest levels used → H2 / H3);
//                           a lone top heading before any text is the
//                           article title and is dropped
//   > quote (+ "— name")  → quote with attribution
//   - item / 1. item      → bullet / numbered list
//   --- / ***             → divider
//   ![alt](src)           → image
//   | a | b | table       → bullet list "a: b" (header row dropped)
//   anything else         → paragraph (lines joined)
// **bold** / *italic* are kept (the article page renders them); links keep
// their text only; HTML is dropped. Nothing is validated here —
// the editor's normal checks run on save.
export function bodyFromText(input: string): BodyBlock[] {
  const lines = input.replace(/\r\n?/g, '\n').split('\n')
  type Raw = { kind: 'h'; depth: number; text: string } | Exclude<BodyBlock, { type: 'heading' }>
  const out: Raw[] = []
  let para: string[] = []
  let list: { style: 'bullet' | 'numbered'; items: string[] } | null = null
  let quote: string[] | null = null
  let table = false

  const clean = (s: string) =>
    s
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/__([^_]+)__/g, '**$1**')
      .replace(/\s+/g, ' ')
      .trim()
  const flush = () => {
    if (para.length) {
      const text = clean(para.join(' '))
      if (text) out.push({ type: 'paragraph', text })
    }
    if (list?.items.length) out.push({ type: 'list', style: list.style, items: list.items.map(clean).filter(Boolean) })
    if (quote?.length) {
      let attribution = ''
      const last = quote[quote.length - 1]!
      const m = last.match(/^[—–-]{1,2}\s*(.+)$/)
      if (m && quote.length > 1) {
        attribution = clean(m[1]!)
        quote.pop()
      }
      const text = clean(quote.join(' ')).replace(/^["“]|["”]$/g, '')
      if (text) out.push({ type: 'quote', text, attribution })
    }
    para = []
    list = null
    quote = null
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) { flush(); continue }
    if (/^\|/.test(line)) {
      // Table: header + separator skipped, each row → "cell: cell, cell" item.
      const cells = line.replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) { if (list) list.items.pop(); continue }
      if (!list || list.style !== 'bullet' || !table) { flush(); list = { style: 'bullet', items: [] }; table = true }
      list.items.push(cells.length > 1 ? `${cells[0]}: ${cells.slice(1).join(', ')}` : cells[0]!)
      continue
    }
    table = false
    let m: RegExpMatchArray | null
    if ((m = line.match(/^(#{1,6})\s+(.+?)\s*#*$/))) {
      flush()
      out.push({ kind: 'h', depth: m[1]!.length, text: clean(m[2]!).replace(/^\*\*(.+)\*\*$/, '$1') })
      continue
    }
    if (/^(\*\s*\*\s*\*|-\s*-\s*-|_\s*_\s*_)[\s*_-]*$/.test(line)) { flush(); out.push({ type: 'divider' }); continue }
    if ((m = line.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/))) {
      flush()
      out.push({ type: 'image', src: m[2]!, alt: m[1] ?? '', caption: m[3] ?? '' })
      continue
    }
    if ((m = line.match(/^>\s?(.*)$/))) {
      if (!quote) { flush(); quote = [] }
      if (m[1]) quote.push(m[1])
      continue
    }
    if ((m = line.match(/^(?:[-*+•])\s+(.+)$/)) || (m = line.match(/^(\d+)[.)]\s+(.+)$/))) {
      const numbered = /^\d/.test(line)
      const style = numbered ? 'numbered' : 'bullet'
      if (!list || list.style !== style) { flush(); list = { style, items: [] } }
      list.items.push(numbered ? m[2]! : m[1]!)
      continue
    }
    if (list && /^\s{2,}/.test(raw)) { list.items[list.items.length - 1] += ` ${line}`; continue }
    if (list || quote) flush()
    para.push(line)
  }
  flush()

  // Headings: drop a lone title heading at the very top, then map the two
  // largest remaining levels onto H2 / H3.
  const heads = out.filter((b): b is Extract<Raw, { kind: 'h' }> => 'kind' in b)
  if (heads.length && out[0] === heads[0]) {
    const top = heads[0]!.depth
    if (heads.filter((h) => h.depth === top).length === 1 && heads.length > 1) out.shift()
  }
  const depths = [...new Set(out.filter((b) => 'kind' in b).map((b) => (b as { depth: number }).depth))].sort((a, b) => a - b)
  return out.map((b) => ('kind' in b ? { type: 'heading', level: depths.indexOf(b.depth) === 0 ? 2 : 3, text: b.text } : b)) as BodyBlock[]
}
