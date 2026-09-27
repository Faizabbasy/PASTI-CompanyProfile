<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 15 —
// FOOTER / PLATFORM LINKS.
const { navLinks, platformLinks } = useFooter()
const { email } = useFinalCta()

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
  <footer ref="footerRef" class="surface-dark relative overflow-hidden border-t border-navy-900 py-16 md:py-20">
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

    <BaseContainer class="relative">
      <div class="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
        <div class="footer-reveal flex flex-col gap-8 md:col-span-4">
          <div class="w-fit origin-left scale-[1.6] md:scale-[1.9]">
            <LayoutLogo inverted />
          </div>

          <NuxtLink
            v-if="email"
            :to="`mailto:${email}`"
            class="btn-outline w-fit border-navy-700 text-paper hover:border-paper"
            @mouseenter="setState('contact')"
            @mouseleave="setState('default')"
          >
            {{ email }}
          </NuxtLink>
        </div>

        <nav class="footer-reveal flex flex-col gap-4 border-navy-800 md:col-span-4 md:col-start-6 md:border-l md:pl-8">
          <p class="eyebrow text-navy-500">Navigate</p>
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="group inline-flex w-fit items-center gap-2 font-display text-body-lg font-medium text-navy-200 transition-all duration-150 ease-editorial hover:translate-x-1 hover:text-cobalt focus-visible:translate-x-1 focus-visible:text-cobalt"
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
        <nav class="footer-reveal flex flex-col gap-4 border-navy-800 md:col-span-3 md:col-start-10 md:border-l md:pl-8">
          <p class="eyebrow text-navy-500">Platforms</p>
          <component
            :is="link.comingSoon ? 'span' : 'NuxtLink'"
            v-for="link in platformLinks"
            :key="link.to"
            :to="link.comingSoon ? undefined : link.to"
            :aria-disabled="link.comingSoon ? 'true' : undefined"
            :title="link.comingSoon ? `${link.label} — coming soon` : undefined"
            class="group inline-flex w-fit items-center gap-1.5 font-display text-body-lg font-medium text-paper transition-all duration-150 ease-editorial"
            :class="link.comingSoon ? 'cursor-default opacity-50' : 'hover:translate-x-1 hover:text-cobalt focus-visible:translate-x-1 focus-visible:text-cobalt'"
            @mouseenter="link.comingSoon ? undefined : setState('link')"
            @mouseleave="setState('default')"
          >
            <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-cobalt transition-transform duration-150 ease-editorial group-hover:scale-125 group-focus-visible:scale-125" aria-hidden="true" />
            {{ link.label }}
          </component>
        </nav>
      </div>

      <div class="footer-reveal mt-16 flex flex-col-reverse gap-4 border-t border-navy-800 pt-8 text-body-sm text-navy-400 sm:flex-row sm:items-center sm:justify-between md:mt-20">
        <p>&copy; {{ year }} PT Hidup Pasti Bahagia</p>
        <p class="text-navy-500">Technology + Creative under one roof by PASTI</p>
      </div>
    </BaseContainer>
  </footer>
</template>
