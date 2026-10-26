import type { CmsPermission } from '#shared/utils/cmsPermissions'

// Admin CMS sidebar (Step 1 brief). `permission` hides an entry from roles
// that lack it — visibility only; the routes are gated server-side too.
// Home is deliberately absent: the homepage stays code-managed (Step 2).

export interface AdminNavLink {
  label: string
  to: string
}

export interface AdminNavGroup {
  label: string
  to: string
  permission?: CmsPermission
  children?: AdminNavLink[]
}

export function useAdminNav(): AdminNavGroup[] {
  return [
    { label: 'Dashboard', to: '/admin' },
    {
      label: 'Pages',
      to: '/admin/pages',
      children: [
        { label: 'Technology', to: '/admin/pages/technology' },
        { label: 'Creative', to: '/admin/pages/creative' },
        { label: 'About', to: '/admin/pages/about' },
        { label: 'Contact', to: '/admin/pages/contact' }
      ]
    },
    {
      label: 'Products',
      to: '/admin/products',
      children: [
        { label: 'OPEN', to: '/admin/products/open' },
        { label: 'SHIFTLY', to: '/admin/products/shiftly' },
        { label: 'e-CORPORATE', to: '/admin/products/e-corporate' },
        { label: 'FAST', to: '/admin/products/fast' },
        { label: 'DORA', to: '/admin/products/dora' },
        { label: 'MATRIX', to: '/admin/products/matrix' }
      ]
    },
    {
      label: 'Work',
      to: '/admin/work',
      children: [
        { label: 'Work page', to: '/admin/work' },
        { label: 'Projects', to: '/admin/work/projects' },
        { label: 'Case Studies', to: '/admin/work/case-studies' }
      ]
    },
    {
      label: 'Insights',
      to: '/admin/insights',
      children: [
        { label: 'Insights page', to: '/admin/insights' },
        { label: 'Articles', to: '/admin/insights/articles' },
        { label: 'Categories', to: '/admin/insights/categories' }
      ]
    },
    {
      label: 'Shared Content',
      to: '/admin/shared',
      children: [
        { label: 'Clients', to: '/admin/shared/clients' },
        { label: 'Testimonials', to: '/admin/shared/testimonials' },
        { label: 'FAQs', to: '/admin/shared/faqs' },
        { label: 'Global CTAs', to: '/admin/shared/ctas' }
      ]
    },
    { label: 'Media', to: '/admin/media' },
    { label: 'SEO', to: '/admin/seo' },
    { label: 'Users', to: '/admin/users', permission: 'users.manage' }
  ]
}
