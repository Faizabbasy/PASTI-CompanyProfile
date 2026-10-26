import type { ContentStatus } from '#shared/utils/cmsPermissions'

// Step 1 dummy content — NOT connected to the real site composables. Entity
// labels mirror existing pages/products; every copy field is placeholder.
// No Home entry: the homepage is not CMS-managed.

export interface DummyContentItem {
  id: string
  entityType: 'page' | 'product' | 'work' | 'insight' | 'shared'
  label: string
  title: string
  excerpt: string
  status: ContentStatus
  pendingReview: boolean
  updatedAt: string
  updatedBy: 'admin' | 'editor'
}

const LOREM = 'Lorem ipsum dolor sit amet'

export const DUMMY_CONTENT: readonly DummyContentItem[] = [
  { id: 'page-technology', entityType: 'page', label: 'Technology', title: LOREM, excerpt: LOREM, status: 'draft', pendingReview: true, updatedAt: '2026-10-22T08:40:00Z', updatedBy: 'editor' },
  { id: 'page-creative', entityType: 'page', label: 'Creative', title: LOREM, excerpt: LOREM, status: 'published', pendingReview: false, updatedAt: '2026-10-21T15:05:00Z', updatedBy: 'admin' },
  { id: 'page-about', entityType: 'page', label: 'About', title: LOREM, excerpt: LOREM, status: 'draft', pendingReview: false, updatedAt: '2026-10-21T11:30:00Z', updatedBy: 'editor' },
  { id: 'page-contact', entityType: 'page', label: 'Contact', title: LOREM, excerpt: LOREM, status: 'published', pendingReview: false, updatedAt: '2026-10-20T10:00:00Z', updatedBy: 'admin' },
  { id: 'product-open', entityType: 'product', label: 'OPEN', title: LOREM, excerpt: LOREM, status: 'published', pendingReview: false, updatedAt: '2026-10-22T07:55:00Z', updatedBy: 'admin' },
  { id: 'product-shiftly', entityType: 'product', label: 'SHIFTLY', title: LOREM, excerpt: LOREM, status: 'draft', pendingReview: true, updatedAt: '2026-10-21T16:20:00Z', updatedBy: 'editor' },
  { id: 'product-ecorporate', entityType: 'product', label: 'e-CORPORATE', title: LOREM, excerpt: LOREM, status: 'published', pendingReview: false, updatedAt: '2026-10-19T13:10:00Z', updatedBy: 'admin' },
  { id: 'product-fast', entityType: 'product', label: 'FAST', title: LOREM, excerpt: LOREM, status: 'draft', pendingReview: false, updatedAt: '2026-10-18T09:00:00Z', updatedBy: 'editor' },
  { id: 'product-dora', entityType: 'product', label: 'DORA', title: LOREM, excerpt: LOREM, status: 'published', pendingReview: false, updatedAt: '2026-10-18T08:30:00Z', updatedBy: 'admin' },
  { id: 'product-matrix', entityType: 'product', label: 'MATRIX', title: LOREM, excerpt: LOREM, status: 'archived', pendingReview: false, updatedAt: '2026-10-15T12:00:00Z', updatedBy: 'admin' },
  { id: 'work-dummy-1', entityType: 'work', label: 'Project (dummy 1)', title: LOREM, excerpt: LOREM, status: 'draft', pendingReview: true, updatedAt: '2026-10-22T10:02:00Z', updatedBy: 'editor' },
  { id: 'work-dummy-2', entityType: 'work', label: 'Project (dummy 2)', title: LOREM, excerpt: LOREM, status: 'archived', pendingReview: false, updatedAt: '2026-10-10T12:00:00Z', updatedBy: 'admin' },
  { id: 'insight-dummy-1', entityType: 'insight', label: 'Article (dummy 1)', title: LOREM, excerpt: LOREM, status: 'published', pendingReview: false, updatedAt: '2026-10-17T14:45:00Z', updatedBy: 'admin' },
  { id: 'insight-dummy-2', entityType: 'insight', label: 'Article (dummy 2)', title: LOREM, excerpt: LOREM, status: 'draft', pendingReview: false, updatedAt: '2026-10-22T06:15:00Z', updatedBy: 'editor' },
  { id: 'shared-faq-dummy', entityType: 'shared', label: 'FAQ (dummy)', title: LOREM, excerpt: LOREM, status: 'draft', pendingReview: false, updatedAt: '2026-10-20T09:20:00Z', updatedBy: 'editor' }
]

export interface DummyMediaItem {
  id: string
  filename: string
  mime: string
  sizeKb: number
  uploadedAt: string
  uploadedBy: 'admin' | 'editor'
}

export const DUMMY_MEDIA: readonly DummyMediaItem[] = [
  { id: 'media-1', filename: 'placeholder-01.webp', mime: 'image/webp', sizeKb: 184, uploadedAt: '2026-10-22T09:40:00Z', uploadedBy: 'editor' },
  { id: 'media-2', filename: 'placeholder-02.jpg', mime: 'image/jpeg', sizeKb: 412, uploadedAt: '2026-10-21T14:05:00Z', uploadedBy: 'admin' },
  { id: 'media-3', filename: 'placeholder-03.png', mime: 'image/png', sizeKb: 96, uploadedAt: '2026-10-20T11:22:00Z', uploadedBy: 'editor' },
  { id: 'media-4', filename: 'placeholder-brief.pdf', mime: 'application/pdf', sizeKb: 730, uploadedAt: '2026-10-19T08:10:00Z', uploadedBy: 'admin' }
]
