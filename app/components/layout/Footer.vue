<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// A string `:is="'NuxtLink'"` is not resolved at runtime (components are
// auto-imported, not globally registered) — it rendered a dead <NuxtLink>
// element instead of an <a>. Resolve the component itself.
const RouterLink = resolveComponent('NuxtLink')

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// FOOTER — full company-profile footer (owner-directed rebuild, 2026-09-30).
// Keeps the spec §9 information (logo, direct contact, Navigate / Services /
// Platforms, legal row) and adds a closing band using the client-approved
// Final CTA copy (useFinalCta), a Contact column and social profiles.
// Contact facts / social URLs that haven't been supplied are null in
// useFooter: those rows are omitted and those icons render dimmed +
// non-interactive — no placeholder copy, no invented URLs.
const { navLinks, serviceLinks, platformLinks, contact, socials } = useFooter()
const { eyebrowLine, headingLine } = useFinalCta()
const { link: whatsappLink } = useWhatsapp()
const { playTo } = useSectionCurtain()

const year = new Date().getFullYear()
// "Let's build what matters" → last word carries the Yellow accent.
const headingWords = headingLine.split(' ')
const headingLead = headingWords.slice(0, -1).join(' ')
const headingAccent = headingWords[headingWords.length - 1]

const footerRef = ref<HTMLElement | null>(null)
const wordmarkRef = ref<HTMLElement | null>(null)
const dotRef = ref<HTMLElement | null>(null)
const dotRingRef = ref<HTMLElement | null>(null)
const socialRefs = socials.map(() => ref<HTMLElement | null>(null))
socialRefs.forEach((r) => useMagnetic(r, { strength: 0.4 }))
const topRef = ref<HTMLElement | null>(null)
useMagnetic(topRef, { strength: 0.35 })

useScrollReveal(footerRef, { y: 16, children: '.footer-reveal', stagger: 0.08 })

const { setState } = useCustomCursor()

const cornerRefs = ref<HTMLElement[]>([])

useGsapContext(() => {
  const footer = footerRef.value
  if (!footer) return
  const corners = cornerRefs.value
  const rules = footer.querySelectorAll<HTMLElement>('[data-foot-rule]')
  const icons = footer.querySelectorAll<HTMLElement>('[data-foot-social]')
  const headWords = footer.querySelectorAll<HTMLElement>('[data-foot-word]')
  const wordmark = wordmarkRef.value
  const dot = dotRef.value
  const ring = dotRingRef.value

  const mm = gsap.matchMedia()

  mm.add(reducedMotionQuery.reduce, () => {
    gsap.set(corners, { scaleX: 1, scaleY: 1 })
    gsap.set(rules, { scaleX: 1 })
    gsap.set(icons, { autoAlpha: 1, scale: 1 })
    gsap.set(headWords, { yPercent: 0 })
    if (wordmark) gsap.set(wordmark, { yPercent: 0 })
    if (dot) gsap.set(dot, { scale: 1 })
  })

  mm.add(reducedMotionQuery.noPreference, () => {
    // Signal — Final Resolved State (04-homepage-spec.md §9): four corner
    // lines converge once, then stay static.
    gsap.set(corners, { scaleX: 0, scaleY: 0 })
    gsap.set(rules, { scaleX: 0, transformOrigin: 'left center' })
    gsap.set(icons, { autoAlpha: 0, scale: 0.6 })
    gsap.set(headWords, { yPercent: 115 })
    if (dot) gsap.set(dot, { scale: 0 })

    const intro = gsap.timeline({ scrollTrigger: { trigger: footer, start: 'top 78%', once: true } })
    intro
      .to(headWords, { yPercent: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.07 })
      .to(icons, { autoAlpha: 1, scale: 1, duration: motionTier.standardMax, ease: approvedEase.gsapPrimary, stagger: 0.06 }, '-=0.45')
      .to(rules, { scaleX: 1, duration: motionTier.cinematicMax, ease: approvedEase.gsapCinematic, stagger: 0.12 }, '-=0.5')
      .to(corners, { scaleX: 1, scaleY: 1, duration: spatialDuration.cinematic, ease: spatialEase.settle, stagger: motionStagger.loose }, '<')

    // Giant wordmark rises out of the bottom edge as the footer arrives;
    // the logo's Yellow dot lands last with a single Signal ring.
    const rise = wordmark
      ? gsap.fromTo(wordmark, { yPercent: 38 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: footer, start: 'top bottom', end: 'bottom bottom', scrub: true } })
      : null
    const land = dot
      ? gsap.timeline({ scrollTrigger: { trigger: wordmark ?? footer, start: 'top 92%', once: true } })
          .to(dot, { scale: 1, duration: motionTier.cinematicMin, ease: approvedEase.gsapPrimary })
          .fromTo(ring, { scale: 0.6, autoAlpha: 0.9 }, { scale: 2.6, autoAlpha: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard }, '-=0.35')
      : null

    return () => {
      intro.kill()
      rise?.scrollTrigger?.kill()
      rise?.kill()
      land?.scrollTrigger?.kill()
      land?.kill()
    }
  })
})
</script>

<template>
  <footer ref="footerRef" data-header-theme="dark" class="surface-dark relative overflow-hidden border-t border-navy-900 pb-0 pt-20 md:pt-28">
    <!-- No ambient glow (04-homepage-spec.md §9): quality comes from grid,
         spacing, typography, contrast, separators and microinteraction. -->
    <span
      v-for="corner in ['tl', 'tr', 'bl', 'br']"
      :key="corner"
      ref="cornerRefs"
      aria-hidden="true"
      class="pointer-events-none absolute h-10 w-10 border-navy-500/20"
      :class="{
        'left-6 top-6 origin-top-left border-l border-t': corner === 'tl',
        'right-6 top-6 origin-top-right border-r border-t': corner === 'tr',
        'bottom-6 left-6 origin-bottom-left border-b border-l': corner === 'bl',
        'bottom-6 right-6 origin-bottom-right border-b border-r': corner === 'br'
      }"
    />
    <BaseGridLines tone="dark" edge="top" />

    <BaseContainer class="relative z-10">
      <!-- Closing band: approved Final CTA copy + direct actions + socials. -->
      <div class="grid grid-cols-1 items-end gap-12 desktop:grid-cols-12 desktop:gap-8">
        <div class="desktop:col-span-7">
          <p class="footer-reveal inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.6)]">
            <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />{{ eyebrowLine }}
          </p>
          <h2 class="mt-5 font-display text-[length:clamp(44px,6.4vw,104px)] font-extrabold leading-[0.95] tracking-[-0.04em] text-pureWhite">
            <template v-for="(w, i) in headingLead.split(' ')" :key="`w-${i}`"><span class="foot-mask"><span data-foot-word class="inline-block">{{ w }}</span></span>{{ ' ' }}</template>
            <span class="foot-mask"><span data-foot-word class="inline-block text-pastiYellow-500">{{ headingAccent }}.</span></span>
          </h2>
        </div>

        <div class="flex flex-col gap-8 desktop:col-span-5 desktop:items-end">
          <div class="footer-reveal flex flex-wrap items-center gap-3">
            <a
              :href="whatsappLink"
              target="_blank"
              rel="noopener noreferrer"
              class="group relative flex items-center gap-4 overflow-hidden rounded-[14px] bg-pastiYellow-500 py-2.5 pl-6 pr-2.5 font-display text-[15px] font-bold text-slateNavy"
              @mouseenter="setState('contact')"
              @mouseleave="setState('default')"
            >
              <span aria-hidden="true" class="absolute inset-0 origin-left scale-x-0 bg-pureWhite transition-transform duration-500 ease-editorial group-hover:scale-x-100" />
              <span class="relative z-10">Chat on WhatsApp</span>
              <span class="relative z-10 grid h-10 w-10 place-items-center rounded-[10px] bg-slateNavy text-pastiYellow-500 transition-transform duration-300 ease-editorial group-hover:rotate-[-45deg]">
                <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </span>
            </a>
            <a
              v-if="contact.email"
              :href="`mailto:${contact.email}`"
              class="rounded-[14px] border border-[color:rgba(255,255,255,0.2)] px-6 py-[18px] font-display text-[15px] font-bold text-pureWhite transition-colors duration-300 ease-editorial hover:border-pureWhite"
              @mouseenter="setState('contact')"
              @mouseleave="setState('default')"
            >
              {{ contact.email }}
            </a>
          </div>

          <div class="flex flex-col gap-3 desktop:items-end">
            <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.5)]">Follow PASTI</p>
            <ul class="flex flex-wrap items-center gap-2.5">
              <li v-for="(s, i) in socials" :key="s.key">
                <div :ref="(el) => { socialRefs[i]!.value = s.url ? (el as HTMLElement | null) : null }" data-foot-social class="inline-block">
                  <a
                    v-if="s.url"
                    :href="s.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    :aria-label="`PASTI on ${s.label}`"
                    class="group/soc relative grid h-12 w-12 place-items-center overflow-hidden rounded-full border border-[color:rgba(255,255,255,0.18)] text-pureWhite transition-colors duration-300 ease-editorial hover:border-pastiYellow-500 hover:text-slateNavy"
                    @mouseenter="setState('link')"
                    @mouseleave="setState('default')"
                  >
                    <span aria-hidden="true" class="absolute inset-0 scale-0 rounded-full bg-pastiYellow-500 transition-transform duration-500 ease-editorial group-hover/soc:scale-100" />
                    <span class="relative h-5 w-5"><LayoutSocialIcon :name="s.key" /></span>
                  </a>
                  <span
                    v-else
                    role="img"
                    :aria-label="`${s.label} — coming soon`"
                    :title="`${s.label} — coming soon`"
                    class="grid h-12 w-12 cursor-default place-items-center rounded-full border border-dashed border-[color:rgba(255,255,255,0.14)] text-[color:rgba(255,255,255,0.35)]"
                  >
                    <span class="h-5 w-5"><LayoutSocialIcon :name="s.key" /></span>
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <span data-foot-rule aria-hidden="true" class="mt-16 block h-px bg-[color:rgba(255,255,255,0.12)] md:mt-20" />

      <!-- Information columns. -->
      <div class="grid grid-cols-2 gap-x-8 gap-y-12 py-14 md:grid-cols-12 md:py-16">
        <div class="footer-reveal col-span-2 flex flex-col gap-6 md:col-span-3">
          <div class="w-fit origin-left scale-[1.5]">
            <LayoutLogo inverted />
          </div>
          <p class="mt-3 max-w-[16rem] font-display text-body-lg font-medium leading-snug text-navy-200">{{ contact.positioning }}</p>
          <p class="flex items-center gap-3 text-body-sm text-navy-400">
            <LayoutBrandMark :height="11" />
            <span aria-hidden="true" class="h-3.5 w-px bg-navy-700" />
            {{ contact.entity }}
          </p>
        </div>

        <nav class="footer-reveal flex flex-col md:col-span-2 md:gap-3.5" aria-label="Footer navigation">
          <p class="foot-label mb-1 md:mb-0">Navigate</p>
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="foot-link group"
            @mouseenter="setState('link')"
            @mouseleave="setState('default')"
          >
            <span class="foot-link-dash" aria-hidden="true" />{{ link.label }}
          </NuxtLink>
        </nav>

        <nav class="footer-reveal flex flex-col md:col-span-3 md:gap-3.5" aria-label="Services">
          <p class="foot-label mb-1 md:mb-0">Services</p>
          <NuxtLink
            v-for="link in serviceLinks"
            :key="link.label"
            :to="link.to"
            class="foot-link group"
            @mouseenter="setState('link')"
            @mouseleave="setState('default')"
          >
            <span class="foot-link-dash" aria-hidden="true" />{{ link.label }}
          </NuxtLink>
        </nav>

        <nav class="footer-reveal flex flex-col gap-3.5 md:col-span-2" aria-label="Platforms">
          <p class="foot-label">Platforms</p>
          <component
            :is="link.comingSoon ? 'span' : RouterLink"
            v-for="link in platformLinks"
            :key="link.to"
            :to="link.comingSoon ? undefined : link.to"
            :aria-disabled="link.comingSoon ? 'true' : undefined"
            :title="link.comingSoon ? `${link.label} — coming soon` : undefined"
            class="group inline-flex w-fit flex-col items-start gap-1.5 font-display text-body-md font-medium text-paper"
            :class="link.comingSoon ? 'cursor-default' : 'hover:text-cobalt'"
            @mouseenter="link.comingSoon ? undefined : setState('link')"
            @mouseleave="setState('default')"
          >
            <span class="inline-flex items-center gap-1.5" :class="link.comingSoon ? 'opacity-60' : ''">
              <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-cobalt" aria-hidden="true" />
              {{ link.label }}
            </span>
            <span v-if="link.comingSoon" class="ml-3 rounded-token-sm border border-navy-700 px-1.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.08em] text-navy-400">Coming soon</span>
          </component>
        </nav>

        <div class="footer-reveal col-span-2 flex flex-col gap-5 md:col-span-2">
          <p class="foot-label">Contact</p>
          <div>
            <p class="foot-meta">Direct line</p>
            <a
              :href="whatsappLink"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-1 inline-block font-display text-body-md font-semibold tabular-nums text-paper transition-colors duration-150 ease-editorial hover:text-pastiYellow-500"
              @mouseenter="setState('link')"
              @mouseleave="setState('default')"
            >{{ contact.whatsappDisplay }}</a>
          </div>
          <div v-if="contact.email">
            <p class="foot-meta">Email</p>
            <a :href="`mailto:${contact.email}`" class="mt-1 inline-block break-all font-display text-body-md font-semibold text-paper hover:text-pastiYellow-500">{{ contact.email }}</a>
          </div>
          <div v-if="contact.address">
            <p class="foot-meta">Office</p>
            <component
              :is="contact.mapsUrl ? 'a' : 'p'"
              :href="contact.mapsUrl ?? undefined"
              :target="contact.mapsUrl ? '_blank' : undefined"
              :rel="contact.mapsUrl ? 'noopener noreferrer' : undefined"
              class="mt-1 block text-body-sm leading-relaxed text-navy-200"
              :class="contact.mapsUrl ? 'hover:text-pastiYellow-500' : ''"
            >{{ contact.address }}</component>
          </div>
          <div v-if="contact.hours">
            <p class="foot-meta">Hours</p>
            <p class="mt-1 text-body-sm text-navy-200">{{ contact.hours }}</p>
          </div>
        </div>
      </div>

      <span data-foot-rule aria-hidden="true" class="block h-px bg-[color:rgba(255,255,255,0.12)]" />

      <!-- Legal row. -->
      <div class="footer-reveal flex flex-col-reverse gap-6 py-8 text-body-sm text-navy-400 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {{ year }} {{ contact.entity }}. All rights reserved.</p>
        <div class="flex items-center gap-6">
          <p class="hidden text-navy-500 md:block">Technology + Creative under one roof by PASTI</p>
          <div ref="topRef" class="inline-block">
            <button
              type="button"
              class="group/top relative grid h-12 w-12 place-items-center overflow-hidden rounded-full border border-[color:rgba(255,255,255,0.2)] text-pureWhite"
              aria-label="Back to top"
              @click="playTo('y:0')"
              @mouseenter="setState('link')"
              @mouseleave="setState('default')"
            >
              <span aria-hidden="true" class="absolute inset-0 origin-bottom scale-y-0 bg-pureWhite transition-transform duration-500 ease-editorial group-hover/top:scale-y-100" />
              <svg viewBox="0 0 16 16" class="relative h-4 w-4 -rotate-90 transition-colors duration-300 group-hover/top:text-slateNavy" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
            </button>
          </div>
        </div>
      </div>
    </BaseContainer>

    <!-- Giant wordmark rising out of the bottom edge (Large Type as Graphic):
         the letters stay a quiet ghost, only the logo's Yellow dot is live. -->
    <div aria-hidden="true" class="pointer-events-none relative -mt-[4vw] h-[clamp(120px,27vw,400px)] select-none overflow-hidden">
      <div ref="wordmarkRef" class="container-page relative">
        <div class="relative w-full" style="aspect-ratio: 1205 / 527">
          <LayoutBrandMark :dot="false" class="!block h-full w-full opacity-[0.13]" />
          <span class="absolute" style="left: 87.8%; top: 9.3%; width: 9.38%; height: 21.44%">
            <span ref="dotRingRef" class="absolute inset-0 rounded-full border-2 border-pastiYellow-500 opacity-0" />
            <span ref="dotRef" class="absolute inset-0 rounded-full bg-pastiYellow-500" />
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.foot-mask {
  display: inline-block;
  overflow: clip;
  vertical-align: top;
  margin: -0.2em;
  padding: 0.2em;
}
.foot-label {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.45);
}
.foot-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
}
.foot-link {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  /* 44px thumb target on touch screens; tight rhythm from md up. */
  min-height: 44px;
  font-family: var(--font-display);
  font-weight: 500;
  color: rgb(255 255 255 / 0.78);
  transition: color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.foot-link:hover,
.foot-link:focus-visible {
  color: #fff;
}
.foot-link-dash {
  display: inline-block;
  height: 1px;
  width: 0;
  margin-right: 0;
  background: #fbba00;
  transition:
    width 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    margin-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.foot-link:active {
  color: #fbba00;
}
@media (min-width: 768px) {
  .foot-link {
    min-height: 0;
  }
}
.foot-link:hover .foot-link-dash,
.foot-link:focus-visible .foot-link-dash {
  width: 14px;
  margin-right: 8px;
}
</style>
