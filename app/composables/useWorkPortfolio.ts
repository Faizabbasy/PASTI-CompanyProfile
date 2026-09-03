export interface WorkProject {
  index: string
  title: string
  client: string
  image: string
  date: string
  brief: string
  result: string
  isDummy?: boolean
}

/**
 * Work page (/work) portfolio entries. Unlike the homepage's `useSelectedWork`
 * (image-only promo cards), these carry real Brief/Result copy scraped verbatim
 * from pastipeople.id/portfolio — that page currently lists exactly 3 projects,
 * so those 3 are `primary` and shown by default.
 *
 * `more` are dummy/placeholder entries (lorem ipsum brief/result, per explicit
 * request) revealed via the "View more" toggle — real client project images
 * already approved for the homepage grid, but no official Brief/Result copy
 * exists for them yet. Replace `brief`/`result` once the client confirms real
 * copy; `isDummy` gates a visible "placeholder copy" tag on the card so it's
 * never mistaken for approved content.
 *
 * Indonesia Exim Bank has no dedicated project image anywhere in the repo
 * (confirmed: every asset in .docs/image/SW*.PNG is already a duplicate of one
 * of the 6 homepage images) — per explicit instruction, it reuses the first
 * Selected Work image (IKEA Indonesia) as a temporary placeholder visual.
 */
export function useWorkPortfolio() {
  const primary: WorkProject[] = [
    {
      index: '01',
      title: 'Indonesia Exim Bank',
      client: 'Indonesia Exim Bank',
      image: '/images/selected-work/ikea-indonesia.png',
      date: 'July 2022',
      brief: 'Melakukan re-engineering sistem fund request internal dengan aspek: Pembaharuan UI/UX, Update teknologi, penambahan fitur.',
      result: 'System is now in use by the client internally.'
    },
    {
      index: '02',
      title: 'PT. Jasa Marga Persero',
      client: 'PT. Jasa Marga Persero',
      image: '/images/selected-work/jm-click.png',
      date: 'December 2022',
      brief: 'Melakukan re-engineering sistem fund request internal dengan aspek: Pembaharuan UI/UX, Update teknologi, penambahan fitur.',
      result: 'System is now in use by the client internally.'
    },
    {
      index: '03',
      title: 'Universitas Pertamina',
      client: 'Universitas Pertamina',
      image: '/images/selected-work/pertamina.png',
      date: 'November 2022',
      brief: 'Create customize Customer Relations Management (CRM) System for the university. The system hopefully can help Universitas Pertamina.',
      result: 'The system running until right now if you wanna try. You can chat all social media platform Universitas Pertamina.'
    }
  ]

  const more: WorkProject[] = [
    {
      index: '04',
      title: 'IKEA Indonesia',
      client: 'IKEA Indonesia',
      image: '/images/selected-work/ikea-indonesia.png',
      date: 'Placeholder',
      brief: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      result: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      isDummy: true
    },
    {
      index: '05',
      title: 'PowerHours',
      client: 'PowerHours',
      image: '/images/selected-work/powerhours.png',
      date: 'Placeholder',
      brief: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      result: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      isDummy: true
    },
    {
      index: '06',
      title: 'HDI Healthy Lifestyle',
      client: 'HDI Healthy Lifestyle',
      image: '/images/selected-work/hdi-healthy-lifestyle.png',
      date: 'Placeholder',
      brief: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
      result: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.',
      isDummy: true
    }
  ]

  return { primary, more }
}
