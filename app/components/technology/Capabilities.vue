<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// CAPABILITY INDEX — the six COMPRO 2025 technology capabilities as one
// editorial chapter (owner 2026-10-07: merged instead of six thin sections).
// Each row: COMPRO sentence, the key terms from that sentence, and "Related
// work" links where a matching case exists (none for AI / Cyber / SLA).
// Desktop (fine pointer): hovering a row floods it with Slate Navy from the
// bottom, the index turns PASTI Yellow and a preview card follows the cursor,
// tilting with the pointer's horizontal speed and swapping images per row.
// Touch / small screens: each row is a tappable accordion that opens onto its
// image and description (first row open), 44px+ targets throughout.
const { servicesEyebrow, servicesHeading, services } = useTechnology()

const sectionRef = ref<HTMLElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const previewRef = ref<HTMLElement | null>(null)
const hovered = ref<number | null>(null)
const open = ref<number | null>(0)

const { setState } = useCustomCursor()

const toggle = (i: number) => {
  open.value = open.value === i ? null : i
}

useGsapContext(() => {
  const section = sectionRef.value
  const list = listRef.value
  if (!section || !list) return
  const rows = list.querySelectorAll<HTMLElement>('[data-cap-row]')
  const heads = section.querySelectorAll<HTMLElement>('[data-cap-head]')
  const rules = list.querySelectorAll<HTMLElement>('[data-cap-rule]')
  const mm = gsap.matchMedia()

  mm.add(reducedMotionQuery.reduce, () => {
    gsap.set(heads, { yPercent: 0 })
    gsap.set(rules, { scaleX: 1 })
    gsap.set(rows, { autoAlpha: 1, y: 0 })
  })

  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(heads, { yPercent: 110 })
    gsap.set(rules, { scaleX: 0, transformOrigin: 'left center' })
    gsap.set(rows, { autoAlpha: 0, y: 30 })
    const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 70%', once: true } })
    tl.to(heads, { yPercent: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.08 })
    const perRow = ScrollTrigger.batch(rows, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.08 })
        batch.forEach((row) => {
          const rule = row.querySelector('[data-cap-rule]')
          if (rule) gsap.to(rule, { scaleX: 1, duration: motionTier.cinematicMax, ease: approvedEase.gsapCinematic })
        })
      }
    })
    return () => {
      tl.kill()
      perRow.forEach((t) => t.kill())
    }
  })

  // Cursor-follow preview (desktop, fine pointer only).
  mm.add(`${reducedMotionQuery.noPreference} and ${breakpointQuery.desktopUp} and (pointer: fine)`, () => {
    const preview = previewRef.value
    if (!preview) return
    const qx = gsap.quickTo(preview, 'x', { duration: 0.55, ease: approvedEase.gsapStandard })
    const qy = gsap.quickTo(preview, 'y', { duration: 0.55, ease: approvedEase.gsapStandard })
    const qr = gsap.quickTo(preview, 'rotation', { duration: 0.8, ease: approvedEase.gsapStandard })
    let lastX = 0
    const onMove = (e: PointerEvent) => {
      const r = section.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      qx(x)
      qy(y)
      qr(Math.max(-10, Math.min(10, (e.clientX - lastX) * 0.6)))
      lastX = e.clientX
    }
    section.addEventListener('pointermove', onMove)
    return () => section.removeEventListener('pointermove', onMove)
  })
})
</script>

<template>
  <section id="capabilities" ref="sectionRef" class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 90%; --lift-y: 10%">
    <BaseGridLines tone="light" />

    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Capabilities" :meta="`${String(services.length).padStart(2, '0')} services`" />

      <div class="mt-14 grid gap-6 desktop:mt-20 desktop:grid-cols-12 desktop:items-end">
        <div class="m-center desktop:col-span-7">
          <div class="overflow-hidden">
            <p data-cap-head class="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.6)]">
              <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />{{ servicesEyebrow }}
            </p>
          </div>
          <div class="mt-4 overflow-hidden pb-2">
            <h2 data-cap-head class="hero-title">
              {{ servicesHeading }}<span class="text-pastiYellow-500">.</span>
            </h2>
          </div>
        </div>
        <p class="m-center font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.5)] desktop:col-span-4 desktop:col-start-9 desktop:text-right">
          <span class="hidden desktop:inline">Hover to preview</span><span class="desktop:hidden">Tap to expand</span>
        </p>
      </div>

      <ul ref="listRef" class="mt-12 desktop:mt-16" @mouseleave="hovered = null">
        <li v-for="(s, i) in services" :key="s.index" data-cap-row class="relative">
          <span data-cap-rule aria-hidden="true" class="absolute inset-x-0 top-0 block h-px bg-[color:rgba(3,60,89,0.16)]" />

          <!-- Desktop row -->
          <div
            class="group/row relative hidden cursor-default overflow-hidden desktop:grid desktop:grid-cols-12 desktop:items-center desktop:gap-8 desktop:py-9"
            @mouseenter="hovered = i; setState('view', s.title)"
            @mouseleave="setState('default')"
          >
            <span aria-hidden="true" class="absolute inset-0 origin-bottom scale-y-0 bg-slateNavy transition-transform duration-500 ease-editorial group-hover/row:scale-y-100" />
            <span class="relative z-10 col-span-1 pl-4 font-mono text-[13px] tabular-nums text-[color:rgba(3,60,89,0.5)] transition-colors duration-300 group-hover/row:text-pastiYellow-500">{{ s.index }}</span>
            <div class="relative z-10 col-span-6 transition-transform duration-500 ease-editorial group-hover/row:translate-x-3">
              <h3 class="font-display text-[length:clamp(26px,2.4vw,38px)] font-bold leading-[1.08] tracking-[-0.03em] text-slateNavy transition-colors duration-500 group-hover/row:text-pureWhite">
                {{ s.title }}
              </h3>
              <ul class="mt-4 flex flex-wrap gap-1.5" :aria-label="`${s.title} — key areas`">
                <li v-for="k in s.keywords" :key="k" class="rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:rgba(3,60,89,0.62)] ring-1 ring-[color:rgba(3,60,89,0.16)] transition-colors duration-300 group-hover/row:text-[color:rgba(255,255,255,0.75)] group-hover/row:ring-[color:rgba(255,255,255,0.22)]">{{ k }}</li>
              </ul>
            </div>
            <div class="relative z-10 col-span-5 pr-4">
              <p class="text-token-body text-[color:rgba(3,60,89,0.72)] transition-colors duration-300 group-hover/row:text-[color:rgba(255,255,255,0.78)]">{{ s.body }}</p>
              <div v-if="s.related.length" class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.45)] transition-colors duration-300 group-hover/row:text-pastiYellow-500">Related work</span>
                <template v-for="w in s.related" :key="w.label">
                  <NuxtLink v-if="w.to" :to="w.to" class="cap-link text-[14px] font-semibold text-slateNavy transition-colors duration-300 group-hover/row:text-pureWhite">{{ w.label }} <span aria-hidden="true">↗</span></NuxtLink>
                  <span v-else class="text-[14px] font-semibold text-[color:rgba(3,60,89,0.72)] transition-colors duration-300 group-hover/row:text-[color:rgba(255,255,255,0.72)]">{{ w.label }}</span>
                </template>
              </div>
            </div>
          </div>

          <!-- Touch / small-screen row: accordion -->
          <div class="desktop:hidden">
            <button
              type="button"
              class="flex w-full items-start gap-4 py-6 text-left"
              :aria-expanded="open === i"
              :aria-controls="`cap-panel-${i}`"
              @click="toggle(i)"
            >
              <span class="mt-2 font-mono text-[12px] tabular-nums" :class="open === i ? 'text-cobalt' : 'text-[color:rgba(3,60,89,0.5)]'">{{ s.index }}</span>
              <span class="flex-1 font-display text-[24px] font-bold leading-[1.1] tracking-[-0.02em] text-slateNavy tablet:text-[30px]">{{ s.title }}</span>
              <span
                class="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full transition-[transform,background-color,color] duration-300 ease-editorial"
                :class="open === i ? 'rotate-45 bg-pastiYellow-500 text-slateNavy' : 'bg-slateNavy text-pureWhite'"
              >
                <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 2v12M2 8h12" /></svg>
              </span>
            </button>
            <div
              :id="`cap-panel-${i}`"
              class="grid transition-[grid-template-rows] duration-500 ease-editorial"
              :class="open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
            >
              <div class="overflow-hidden">
                <div class="pb-8">
                  <div class="relative aspect-[4/5] overflow-hidden rounded-[18px] border border-[color:rgba(3,60,89,0.12)] bg-slateNavy tablet:aspect-[16/10]">
                    <img :src="s.image" alt="" loading="lazy" class="h-full w-full object-cover object-top">
                    <span class="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-slateNavy px-3 py-1.5">
                      <LayoutBrandMark surface="dark" :height="9" />
                      <span class="font-mono text-[10px] tracking-[0.14em] text-pureWhite">{{ s.index }}</span>
                    </span>
                  </div>
                  <p class="mt-4 text-[15px] leading-relaxed text-[color:rgba(3,60,89,0.75)]">{{ s.body }}</p>
                  <ul class="mt-4 flex flex-wrap gap-1.5">
                    <li v-for="k in s.keywords" :key="k" class="rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:rgba(3,60,89,0.62)] ring-1 ring-[color:rgba(3,60,89,0.16)]">{{ k }}</li>
                  </ul>
                  <div v-if="s.related.length" class="mt-5 border-t border-[color:rgba(3,60,89,0.12)] pt-4">
                    <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.45)]">Related work</p>
                    <ul class="mt-2 flex flex-col gap-1">
                      <li v-for="w in s.related" :key="w.label">
                        <NuxtLink v-if="w.to" :to="w.to" class="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-slateNavy underline decoration-pastiYellow-500 decoration-2 underline-offset-4">{{ w.label }} <span aria-hidden="true">↗</span></NuxtLink>
                        <span v-else class="inline-flex min-h-11 items-center text-[15px] font-semibold text-[color:rgba(3,60,89,0.72)]">{{ w.label }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </li>
        <li aria-hidden="true" class="h-px bg-[color:rgba(3,60,89,0.16)]" />
      </ul>
    </BaseContainer>

    <!-- Cursor-follow preview (desktop, fine pointer). Positioned by GSAP at
         the pointer; images cross-fade per hovered row. -->
    <div
      ref="previewRef"
      aria-hidden="true"
      class="pointer-events-none absolute left-0 top-0 z-30 hidden desktop:block"
    >
      <div
        class="relative -ml-[150px] -mt-[190px] h-[260px] w-[300px] overflow-hidden rounded-[18px] border border-[color:rgba(255,255,255,0.2)] bg-slateNavy shadow-[0_40px_80px_-30px_rgba(0,12,22,0.7)] transition-[transform,opacity] duration-500 ease-editorial"
        :class="hovered !== null ? 'scale-100 opacity-100' : 'scale-50 opacity-0'"
      >
        <img
          v-for="(s, i) in services"
          :key="s.index"
          :src="s.image"
          alt=""
          loading="lazy"
          class="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-500 ease-editorial"
          :class="hovered === i ? 'scale-100 opacity-100' : 'scale-110 opacity-0'"
          style="object-position: 80% 40%"
        >
        <span class="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-slateNavy px-3 py-1.5">
          <LayoutBrandMark surface="dark" :height="9" />
          <span class="font-mono text-[10px] tracking-[0.14em] text-pureWhite">{{ hovered !== null ? services[hovered]?.index : '' }}</span>
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cap-link {
  background-image: linear-gradient(currentColor, currentColor);
  background-size: 0% 1px;
  background-position: 0 100%;
  background-repeat: no-repeat;
  transition: background-size 0.4s cubic-bezier(0.22, 1, 0.36, 1), color 0.3s;
}
.cap-link:hover,
.cap-link:focus-visible {
  background-size: 100% 1px;
}
</style>
