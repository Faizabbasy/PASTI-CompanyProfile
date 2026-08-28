export interface FaqItem {
  index: string
  question: string
  answer: string
}

/**
 * FAQ questions and answers, per .docs/PASTI_Cuberto_Template_Content_Mapping.docx
 * sections 13 — FAQ: REPLACE TEMPLATE QUESTIONS and 14 — FAQ ANSWERS / PASTI COPY.
 *
 * Three question cells and two answer cells are truncated mid-word/mid-sentence in
 * the source doc itself (no ellipsis marker — e.g. question 2 ends at "...does
 * PASTI", answer 2 ends at "...system mainte"). The full, contextually correct
 * copy below was confirmed directly by the client rather than guessed.
 */
export function useFaq() {
  const items: FaqItem[] = [
    {
      index: '01',
      question: 'What can PASTI help your business build?',
      answer:
        'PASTI works across technology and creative services, from digital systems, AI, enterprise platforms and mobile apps to campaigns, content, production, branding and UI/UX.'
    },
    {
      index: '02',
      question: 'What technology services does PASTI provide?',
      answer:
        'Our technology services include technology development, AI solutions, enterprise platforms, mobile apps and MVPs, cybersecurity and system maintenance.'
    },
    {
      index: '03',
      question: 'Can PASTI build custom technology solutions?',
      answer:
        'Yes. PASTI develops customized solutions based on business requirements, including enterprise platforms, mobile apps and other digital systems.'
    },
    {
      index: '04',
      question: 'Can PASTI help build an MVP?',
      answer:
        'Yes. Our mobile app and MVP capability can help teams validate ideas, launch products and evolve them as the business grows.'
    },
    {
      index: '05',
      question: 'Can PASTI support long-term?',
      answer:
        'Yes. PASTI provides system maintenance and SLA support to help maintain continuity, performance and reliability after launch.'
    },
    {
      index: '06',
      question: 'How does PASTI work with clients?',
      answer:
        "We start with the business challenge, define the right direction, build the solution and continue supporting it based on the project's needs."
    },
    {
      index: '07',
      question: 'Can PASTI build secure digital solutions?',
      answer:
        'Security is part of our technology capability, including secure architecture, encryption, penetration testing and data governance.'
    }
  ]

  return { items }
}
