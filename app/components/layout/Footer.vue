<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 15 —
// FOOTER / PLATFORM LINKS.
const { navLinks, serviceLinks, platformLinks, contact } = useFooter()
const { email } = useFinalCta()
const { link: whatsappLink } = useWhatsapp()
const { playTo } = useSectionCurtain()

const year = new Date().getFullYear()

const footerRef = ref<HTMLElement | null>(null)
useScrollReveal(footerRef, { y: 16, children: '.footer-reveal', stagger: 0.08 })

const { setState } = useCustomCursor()

const cornerRefs = ref<HTMLElement[]>([])

// Signal — Final Resolved State (04-homepage-spec.md §9): "The Signal
// finishes active. It resolves structural." Four thin corner lines
// converge once toward the footer's 12-column composition, then remain
// completely static — neutral/slate color (not Cobalt, not an "active"
// interaction color), one-shot, no loop, no pulse after completion. This
// reads as Frame → Resolve → Lock the Composition, not "point to center."
useGsapContext(() => {
  const footer = footerRef.value
  const corners = cornerRefs.value
  if (!footer || !corners.length) return

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.set(corners, { scaleX: 0, scaleY: 0 })

    const anim = gsap.to(corners, {
      scaleX: 1,
      scaleY: 1,
      duration: spatialDuration.cinematic,
      ease: spatialEase.settle,
      stagger: motionStagger.loose,
      scrollTrigger: { trigger: footer, start: 'top 75%', once: true }
    })

    return () => anim.kill()
  })

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(corners, { scaleX: 1, scaleY: 1 })
  })
})
</script>

<template>
  <footer ref="footerRef" data-header-theme="dark" class="surface-dark relative overflow-hidden border-t border-navy-900 pb-0 pt-16 md:pt-20">
    <!-- No ambient glow (04-homepage-spec.md §9, locked, no exception): the
         previous low-opacity Yellow glow blob is removed entirely, not
         recolored or reduced further. Footer quality comes from grid,
         spacing, typography, contrast, separator, microinteraction, and
         Signal resolution instead. -->

    <!-- Corner-line convergence: 4 lines converging toward the footer's
         12-column composition, then locking static — Frame → Resolve →
         Lock the Composition, matching WhatWeDo/Services corner-brackets'
         structural-blueprint language. -->
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

    <!-- Structure, not ambience: the 12-column grid with top-edge ticks (the
         same "grid uncovered" cue as What We Build's curtain), and one static
         ghost wordmark bled off the bottom edge — Large Type as Graphic, ~4%.
         No glow, no motion; the logo lockup above stays the largest *live*
         mass, so the footer closes rather than performs (spec §9). -->
    <BaseGridLines tone="dark" edge="top" />

    <BaseContainer class="relative z-10">
      <div class="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
        <div class="footer-reveal flex flex-col gap-7 md:col-span-4">
          <div class="w-fit origin-left scale-[1.6] md:scale-[1.9]">
            <LayoutLogo inverted />
          </div>
          <p class="mt-2 max-w-xs font-display text-body-lg font-medium leading-snug text-navy-200">{{ contact.positioning }}</p>

          <!-- Contact moment (spec §9): one compact, direct action — the real
               WhatsApp line every other CTA already uses. Not a banner. -->
          <div class="flex flex-wrap items-center gap-3">
            <a
              :href="whatsappLink"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-button bg-cobalt px-5 py-3 font-display text-sm font-semibold text-pureWhite transition-colors duration-150 ease-editorial hover:bg-cyan hover:text-slateNavy"
              @mouseenter="setState('contact')"
              @mouseleave="setState('default')"
            >
              Chat on WhatsApp <span aria-hidden="true">→</span>
            </a>
            <NuxtLink
              v-if="email"
              :to="`mailto:${email}`"
              class="btn-outline border-navy-700 text-paper hover:border-paper"
              @mouseenter="setState('contact')"
              @mouseleave="setState('default')"
            >
              {{ email }}
            </NuxtLink>
          </div>
        </div>

        <nav class="footer-reveal flex flex-col gap-4 border-navy-800 md:col-span-2 md:col-start-6 md:border-l md:pl-8">
          <p class="eyebrow text-navy-500">Navigate</p>
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="group inline-flex w-fit items-center gap-2 font-display text-body-md font-medium text-navy-200 transition-all duration-150 ease-editorial hover:translate-x-1 hover:text-cobalt focus-visible:translate-x-1 focus-visible:text-cobalt"
            @mouseenter="setState('link')"
            @mouseleave="setState('default')"
          >
            {{ link.label }}
            <span
              aria-hidden="true"
              class="inline-block -translate-x-1 opacity-0 transition-all duration-150 ease-editorial group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
            >→</span>
          </NuxtLink>
        </nav>

        <nav class="footer-reveal flex flex-col gap-4 border-navy-800 md:col-span-3 md:col-start-8 md:border-l md:pl-8">
          <p class="eyebrow text-navy-500">Services</p>
          <NuxtLink
            v-for="link in serviceLinks"
            :key="link.label"
            :to="link.to"
            class="group inline-flex w-fit items-center gap-2 font-display text-body-md font-medium text-navy-200 transition-all duration-150 ease-editorial hover:translate-x-1 hover:text-cobalt focus-visible:translate-x-1 focus-visible:text-cobalt"
            @mouseenter="setState('link')"
            @mouseleave="setState('default')"
          >
            {{ link.label }}
            <span
              aria-hidden="true"
              class="inline-block -translate-x-1 opacity-0 transition-all duration-150 ease-editorial group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
            >→</span>
          </NuxtLink>
        </nav>

        <!-- Platform link dots: Yellow → Cobalt (04-homepage-spec.md §9,
             locked, no exception) — platform ownership alone doesn't
             justify a Yellow signature moment here. -->
        <nav class="footer-reveal flex flex-col gap-4 border-navy-800 md:col-span-2 md:col-start-11 md:border-l md:pl-8">
          <p class="eyebrow text-navy-500">Platforms</p>
          <component
            :is="link.comingSoon ? 'span' : 'NuxtLink'"
            v-for="link in platformLinks"
            :key="link.to"
            :to="link.comingSoon ? undefined : link.to"
            :aria-disabled="link.comingSoon ? 'true' : undefined"
            :title="link.comingSoon ? `${link.label} — coming soon` : undefined"
            class="group inline-flex w-fit flex-col items-start gap-1.5 font-display text-body-md font-medium text-paper transition-all duration-150 ease-editorial"
            :class="link.comingSoon ? 'cursor-default' : 'hover:translate-x-1 hover:text-cobalt focus-visible:translate-x-1 focus-visible:text-cobalt'"
            @mouseenter="link.comingSoon ? undefined : setState('link')"
            @mouseleave="setState('default')"
          >
            <span class="inline-flex items-center gap-1.5" :class="link.comingSoon ? 'opacity-60' : ''">
              <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-cobalt transition-transform duration-150 ease-editorial group-hover:scale-125 group-focus-visible:scale-125" aria-hidden="true" />
              {{ link.label }}
            </span>
            <span v-if="link.comingSoon" class="ml-3 rounded-token-sm border border-navy-700 px-1.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.08em] text-navy-400">Coming soon</span>
          </component>
        </nav>
      </div>

      <!-- Contact facts: office / direct line / legal entity, one structural
           row (Precision Framing) — information, not decoration. -->
      <div class="footer-reveal mt-16 grid grid-cols-1 border-y border-navy-800 md:mt-20 md:grid-cols-3">
        <div class="flex flex-col gap-2 py-6 md:pr-8">
          <p class="eyebrow text-navy-500">Office</p>
          <p class="max-w-xs text-body-md text-navy-200">{{ contact.address ?? contact.addressPlaceholder }}</p>
        </div>
        <div class="flex flex-col gap-2 border-t border-navy-800 py-6 md:border-l md:border-t-0 md:px-8">
          <p class="eyebrow text-navy-500">Direct line</p>
          <a
            :href="whatsappLink"
            target="_blank"
            rel="noopener noreferrer"
            class="w-fit font-display text-body-lg font-medium tabular-nums text-paper transition-colors duration-150 ease-editorial hover:text-cobalt"
            @mouseenter="setState('link')"
            @mouseleave="setState('default')"
          >
            {{ contact.whatsappDisplay }}
          </a>
          <p class="text-body-sm text-navy-400">WhatsApp</p>
        </div>
        <div class="flex flex-col gap-2 border-t border-navy-800 py-6 md:border-l md:border-t-0 md:pl-8">
          <p class="eyebrow text-navy-500">Legal entity</p>
          <p class="flex items-center gap-3 font-display text-body-lg font-medium text-paper">
            <LayoutBrandMark :height="13" />
            <span aria-hidden="true" class="h-4 w-px bg-navy-700" />
            {{ contact.entity }}
          </p>
        </div>
      </div>

      <div class="footer-reveal mt-8 flex flex-col-reverse gap-4 text-body-sm text-navy-400 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {{ year }} {{ contact.entity }}</p>
        <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
          <p class="text-navy-500">Technology + Creative under one roof by PASTI</p>
          <button
            type="button"
            class="group inline-flex items-center gap-2 font-display text-token-metadata font-semibold uppercase tracking-[0.08em] text-navy-200 transition-colors duration-150 ease-editorial hover:text-cobalt focus-visible:text-cobalt"
            @click="playTo('y:0')"
            @mouseenter="setState('link')"
            @mouseleave="setState('default')"
          >
            Back to top <span aria-hidden="true" class="inline-block transition-transform duration-150 ease-editorial group-hover:-translate-y-0.5">↑</span>
          </button>
        </div>
      </div>

      <!-- Wordmark band: the bottom of the composition is a cropped ghost
           wordmark sitting BELOW the legal row (never behind text) — static,
           ~5%, no glow. Only the top of the letterforms shows, so the logo
           lockup above stays the largest live mass. -->
      <div aria-hidden="true" class="pointer-events-none mt-12 h-[clamp(72px,15vw,220px)] select-none overflow-hidden md:mt-16">
        <LayoutBrandMark :dot="false" class="block w-full -translate-y-[32%] opacity-[0.06]" />
      </div>
    </BaseContainer>
  </footer>
</template>
