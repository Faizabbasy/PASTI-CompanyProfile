export interface AboutStat {
  numericValue: number
  suffix: string
  label: string
  icon: string
}

export interface AboutService {
  index: string
  title: string
  body: string
}

/**
 * About page content, copied verbatim from pastipeople.id/elementor-279/ (the
 * live PASTI site's About page) per the client's explicit instruction to match
 * that page's content exactly — including its still-placeholder WordPress-template
 * copy (zeroed-out stats, the templated "Benefit of the socie where we are oper
 * ate success" service description repeated across all six services). None of
 * this is invented here; it is quoted as-is from the live site. The source page's
 * team grid (generic placeholder names like "Brandon Copper") is intentionally
 * omitted from this page per the client — Our Services stands alone, no team section.
 * Visual presentation (typography scale, layout rhythm, section structure) follows
 * this project's Cuberto-derived design system, not pastipeople.id's own WordPress
 * theme — only the copy is matched 1:1.
 *
 * Stats values (165/254/2M/145) are a client-supplied update replacing the
 * source page's zeroed-out "0+" placeholders — real numbers, not invented.
 * Icons mirror useWhyPasti.ts's approach (generic symbolic line icons) recolored
 * to PASTI's navy/yellow palette rather than the purple/blue gradient shown in
 * the client's reference image.
 */
export function useAbout() {
  const eyebrow = 'About us'
  const heading = 'Live out your life.'
  const introHeading = 'Unlocking the Power of Technology and Creativity'
  const introBody =
    'At PT. Hidup Pasti Bahagia, we are dedicated to providing you with exceptional services that cater to your business needs. With our expertise and commitment to excellence, we offer three core services designed to propel your business.'

  const ICON_PEOPLE =
    '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 11a3 3 0 100-6 3 3 0 000 6zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 8.5c1.1.3 2 1.3 2 2.5s-.9 2.2-2 2.5M18 14.2c1.7.5 3 2 3 3.8" /></svg>'

  const ICON_ROCKET =
    '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.5 2 4 5 4 8.5 0 1.7-.4 3-1 4.2l-3-1.2-3 1.2c-.6-1.2-1-2.5-1-4.2C8 8 9.5 5 12 3zM9.5 15.5L7 18M14.5 15.5L17 18M10.5 11a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0z" /></svg>'

  const ICON_BADGE =
    '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3l2.1 1.5 2.5-.4 1 2.3 2.3 1-.4 2.5L21 12l-1.5 2.1.4 2.5-2.3 1-1 2.3-2.5-.4L12 21l-2.1-1.5-2.5.4-1-2.3-2.3-1 .4-2.5L3 12l1.5-2.1-.4-2.5 2.3-1 1-2.3 2.5.4L12 3z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 8.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3 1-2z" /></svg>'

  const ICON_COFFEE =
    '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 9h11v5a4 4 0 01-4 4H9a4 4 0 01-4-4V9zM16 10h1.5a2.2 2.2 0 010 4.4H16M8 6.5c0-.7.5-1 .8-1.5M12 6.5c0-.7.5-1 .8-1.5" /></svg>'

  const stats: AboutStat[] = [
    { numericValue: 165, suffix: '+', label: 'Support Given', icon: ICON_PEOPLE },
    { numericValue: 254, suffix: '+', label: 'Project Done', icon: ICON_ROCKET },
    { numericValue: 2, suffix: 'M+', label: 'Get Awards', icon: ICON_BADGE },
    { numericValue: 145, suffix: '+', label: 'Cup of Coffee', icon: ICON_COFFEE }
  ]

  const servicesHeading = 'Best Services'
  const servicesSubheading = 'Our Services'
  const serviceDescription = 'Benefit of the socie where we are oper ate success'
  const services: AboutService[] = [
    { index: '01', title: 'Great Design', body: serviceDescription },
    { index: '02', title: 'Best Support', body: serviceDescription },
    { index: '03', title: 'Quick Response', body: serviceDescription },
    { index: '04', title: 'Finest Quality', body: serviceDescription },
    { index: '05', title: 'Time Saving', body: serviceDescription },
    { index: '06', title: 'Real Solutions', body: serviceDescription }
  ]

  const companyName = 'PT. Hidup Pasti Bahagia'
  const companyTagline =
    'We deliver efficient IT solutions and impactfull digital marketing, ensuring rapid and effective results for your business.'

  return {
    eyebrow,
    heading,
    introHeading,
    introBody,
    stats,
    servicesHeading,
    servicesSubheading,
    services,
    companyName,
    companyTagline
  }
}
