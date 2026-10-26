import { DUMMY_CONTENT, type DummyContentItem } from '../../data/cmsDummy'

// The only path from CMS content to /api/public: published items only,
// through an explicit field whitelist (no editor, review or internal flags).
export interface PublicContentItem {
  id: string
  entityType: DummyContentItem['entityType']
  label: string
  title: string
  excerpt: string
  updatedAt: string
}

export function listPublishedContent(): PublicContentItem[] {
  return DUMMY_CONTENT.filter((c) => c.status === 'published').map(toPublicContent)
}

export function getPublishedContent(id: string): PublicContentItem | null {
  const item = DUMMY_CONTENT.find((c) => c.id === id)
  return item && item.status === 'published' ? toPublicContent(item) : null
}

function toPublicContent(c: DummyContentItem): PublicContentItem {
  return { id: c.id, entityType: c.entityType, label: c.label, title: c.title, excerpt: c.excerpt, updatedAt: c.updatedAt }
}
