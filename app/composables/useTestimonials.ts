export interface Testimonial {
  name: string
  role: string
  quote: string
  rating: number
}

/**
 * Client testimonials — approved-for-publication quotes supplied directly by
 * the client (not sourced from the content mapping doc, which has no
 * testimonial field). Per the doc's placement rule, this component must stay
 * hidden entirely rather than invent quotes; now that real ones exist, it's
 * populated. Profile photos aren't available yet, so cards render an
 * initials avatar instead of an invented/placeholder image — swap in real
 * photos here once supplied.
 */
export function useTestimonials() {
  const testimonials: Testimonial[] = [
    {
      name: 'Rizki Aprianto',
      role: 'Head of Sales Perdana',
      rating: 5,
      quote:
        "Throughout our engagement and collaboration with Pasti People, I've consistently been impressed by their exceptional level of precision and attention to detail. This is particularly evident and highly valuable in their development of complex custom system cycles, where their accuracy has been absolutely crucial to the success of our projects."
    },
    {
      name: 'Yodi Izharivan',
      role: 'Senior Research Fellow at Bank BSI',
      rating: 5,
      quote:
        'Collaborating with Pasti People on the UI/UX development for BSI Insight was an outstanding experience. From the initial brief to final delivery, their team demonstrated a deep understanding of our needs, responded quickly to feedback, and provided smart, solution-driven inputs throughout the process.'
    },
    {
      name: 'Banu Wimbadi',
      role: 'Founder Perdana Consulting',
      rating: 5,
      quote:
        "Collaborating with Pasti People on our system development projects has proven to be highly valuable. Their ability to deliver practical, real-world solutions—paired with user-friendly systems that are easily understood even by non-technical clients—has resulted in a high level of client satisfaction. Pasti People demonstrates both technical expertise and a deep understanding of user needs"
    },
    {
      name: 'Calvin Kim',
      role: 'CMO of Dingo Korea',
      rating: 5,
      quote:
        'The systems developed by Pasti People are not only technically sound but also easy to implement and adopt. Their structured approach and clear communication make the entire process smooth and efficient for all stakeholders involved'
    }
  ]

  return { testimonials }
}
