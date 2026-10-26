<script setup lang="ts">
import gsap from 'gsap'

// /contact hero (2026-10-16): headline + direct channels on the left, the
// WhatsApp brief form on the right (stacked below `desktop`). Page-hero
// system as /work: surface-light ground, BaseHeroMarker, .hero-title masked
// word rise, .hero-lede, m-center on phones. Channels are numbered rows —
// PASTI Yellow marks the hovered row (state marker, never a fill).
// Page wording: useContactPage (legacy code or published CMS). Shared
// contact data (number, email, address, entity, socials): useContact — the
// one shared source, never CMS-managed from here.
const { hero, channels: copy } = useContactPage()
const { contact, socials, whatsappLink } = useContact()
const { setState } = useCustomCursor()

const stageRef = ref<HTMLElement | null>(null)
const headingWords = hero.headline.replace(/\.$/, '').split(/\s+/)

const channels = computed(() =>
  [
    { key: 'whatsapp', label: copy.whatsapp.label, value: contact.whatsappDisplay, href: whatsappLink, action: copy.whatsapp.action },
    contact.email && { key: 'email', label: copy.email.label, value: contact.email, href: `mailto:${contact.email}`, action: copy.email.action },
    contact.address && { key: 'office', label: copy.office.label, value: contact.address, href: contact.mapsUrl, action: copy.office.action }
  ].filter((c): c is { key: string; label: string; value: string; href: string | null; action: string } => !!c)
)

const ext = (href: string | null) =>
  href && !href.startsWith('mailto:') ? { target: '_blank', rel: 'noopener noreferrer' } : {}

useGsapContext(() => {
  const stage = stageRef.value
  if (!stage) return
  const words = stage.querySelectorAll<HTMLElement>('[data-ct-word]')
  const fades = stage.querySelectorAll<HTMLElement>('[data-ct-fade]')
  const rows = stage.querySelectorAll<HTMLElement>('[data-ct-row]')
  const card = stage.querySelector<HTMLElement>('[data-ct-card]')!
  const mm = gsap.matchMedia()

  mm.add(reducedMotionQuery.reduce, () => {
    gsap.set([...words, ...fades, ...rows, card], { clearProps: 'all' })
  })

  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(words, { yPercent: 115 })
    gsap.set(fades, { autoAlpha: 0, y: 16 })
    gsap.set(rows, { autoAlpha: 0, x: -24 })
    gsap.set(card, { autoAlpha: 0, y: 60 })
    gsap
      .timeline({ delay: 0.2 })
      .to(words, { yPercent: 0, duration: motionTier.cinematicMax * 0.75, ease: approvedEase.gsapPrimary, stagger: 0.07 })
      .to(fades, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.08 }, 0.35)
      .to(card, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin + 0.2, ease: approvedEase.gsapCinematic }, 0.3)
      .to(rows, { autoAlpha: 1, x: 0, duration: motionTier.standardMax, ease: approvedEase.gsapStandard, stagger: 0.07 }, 0.55)
  })
})
</script>

<template>
  <section ref="stageRef" class="surface-light relative isolate overflow-hidden pb-20 pt-28 desktop:pb-28 desktop:pt-36" style="--lift-x: 20%; --lift-y: 10%">
    <BaseGridLines tone="light" />
    <BaseContainer class="relative z-10">
      <div class="grid gap-14 desktop:grid-cols-12 desktop:gap-10">
        <div class="m-center desktop:col-span-5">
          <div data-ct-fade><BaseHeroMarker label="Contact" :meta="hero.eyebrow" /></div>
          <h1 class="hero-title mt-6 desktop:mt-8" :aria-label="hero.headline">
            <span aria-hidden="true">
              <span v-for="(w, i) in headingWords" :key="i" class="ct-mask mr-[0.22em] inline-block last:mr-0"><span data-ct-word class="inline-block">{{ w }}<span v-if="i === headingWords.length - 1" class="text-pastiYellow-500">.</span></span></span>
            </span>
          </h1>
          <p data-ct-fade class="hero-lede m-center mt-6">{{ hero.body }}</p>

          <!-- Direct channels. -->
          <ul class="mt-12 border-t border-[color:rgba(3,60,89,0.14)] text-left">
            <li v-for="(c, i) in channels" :key="c.key" data-ct-row class="border-b border-[color:rgba(3,60,89,0.14)]">
              <component
                :is="c.href ? 'a' : 'div'"
                :href="c.href ?? undefined"
                v-bind="ext(c.href)"
                class="ct-row group grid grid-cols-[2.25rem_1fr_auto] items-center gap-x-3 py-5"
                @mouseenter="c.href && setState('link')"
                @mouseleave="setState('default')"
              >
                <span class="font-display text-token-metadata font-semibold tabular-nums tracking-[0.08em] text-[color:rgba(3,60,89,0.55)]">{{ String(i + 1).padStart(2, '0') }}</span>
                <span class="min-w-0">
                  <span class="flex items-center gap-2 font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.6)]">
                    <span aria-hidden="true" class="ct-dot h-1.5 w-1.5 rounded-full bg-[color:rgba(3,60,89,0.25)] transition-colors duration-300" />{{ c.label }}
                  </span>
                  <span class="mt-1 block font-display font-bold tracking-[-0.01em] text-slateNavy" :class="c.key === 'office' ? 'text-[16px] leading-snug' : 'break-all text-[19px] tablet:text-[22px]'">{{ c.value }}</span>
                  <span v-if="c.href" class="mt-1 block text-[13px] font-semibold text-[color:rgba(3,60,89,0.6)] transition-colors duration-300 group-hover:text-slateNavy">{{ c.action }}</span>
                </span>
                <span v-if="c.href" aria-hidden="true" class="grid h-11 w-11 place-items-center rounded-full border border-[color:rgba(3,60,89,0.18)] text-slateNavy transition-[background-color,border-color,transform] duration-500 ease-editorial group-hover:-rotate-45 group-hover:border-pastiYellow-500 group-hover:bg-pastiYellow-500">
                  <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
                </span>
              </component>
            </li>
          </ul>

          <div v-if="socials.length" data-ct-fade class="m-center-row mt-6 flex items-center gap-3">
            <a
              v-for="s in socials"
              :key="s.key"
              :href="s.url!"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="s.label"
              class="grid h-11 w-11 place-items-center rounded-full border border-[color:rgba(3,60,89,0.18)] p-3 text-slateNavy transition-colors duration-300 hover:border-slateNavy"
            ><LayoutSocialIcon :name="s.key" /></a>
          </div>

          <p data-ct-fade class="mt-8 font-display text-token-metadata font-semibold uppercase tracking-[0.12em] text-[color:rgba(3,60,89,0.55)]">{{ contact.entity }}</p>
        </div>

        <div data-ct-card class="desktop:col-span-6 desktop:col-start-7">
          <ContactForm />
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.ct-mask {
  overflow: hidden;
  padding-bottom: 0.06em;
  margin-bottom: -0.06em;
  vertical-align: top;
}
.ct-row:hover .ct-dot,
.ct-row:focus-visible .ct-dot {
  background-color: #fbba00;
}
</style>
