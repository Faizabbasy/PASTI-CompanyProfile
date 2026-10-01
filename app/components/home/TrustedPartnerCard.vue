<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// Trusted Partner card — the dark closing band of the owner-directed Who We
// Are section (see WhoWeAre.vue header for the approved exceptions). Navy
// block between two light sections; PASTI Yellow is limited to the stat "+"
// marks and the CTA (navy text on yellow — yellow is never text on white).
const { partner, cta } = useWhoWeAre()
const { link: whatsappLink } = useWhatsapp()

const wrapRef = ref<HTMLElement | null>(null)
const cardRef = ref<HTMLElement | null>(null)
const glowRef = ref<HTMLElement | null>(null)
const arcRef = ref<SVGPathElement | null>(null)
const portraitRef = ref<HTMLElement | null>(null)
const ctaRef = ref<HTMLElement | null>(null)
const statEls = partner.stats.map(() => ref<HTMLElement | null>(null))

partner.stats.forEach((stat, i) => useCountUp(statEls[i]!, { value: stat.value, duration: 2.2 }))
useCursorSpotlight(cardRef, glowRef, { radius: 420 })
useCardTilt(cardRef, { strength: 2.5, lift: 1.005 })
useMagnetic(ctaRef, { strength: 0.3 })

useGsapContext(() => {
  const wrap = wrapRef.value
  const card = cardRef.value
  const arc = arcRef.value
  const portrait = portraitRef.value
  if (!wrap || !card || !arc || !portrait) return

  const items = card.querySelectorAll<HTMLElement>('[data-tp-item]')
  const mm = gsap.matchMedia()

  mm.add(reducedMotionQuery.reduce, () => {
    gsap.set(wrap, { clipPath: 'none' })
    gsap.set(items, { autoAlpha: 1, x: 0 })
    gsap.set(arc, { strokeDashoffset: 0 })
    gsap.set(portrait, { yPercent: 0 })
  })

  mm.add(reducedMotionQuery.noPreference, () => {
    // The card opens from a single horizontal line — the Signal as a
    // structural rule becoming a surface — then its contents slide in.
    gsap.set(wrap, { clipPath: 'inset(49.5% 0% 49.5% 0% round 28px)' })
    gsap.set(items, { autoAlpha: 0, x: -28 })
    gsap.set(arc, { strokeDashoffset: 1 })
    gsap.set(portrait, { yPercent: 38 })

    const tl = gsap.timeline({
      scrollTrigger: { trigger: wrap, start: 'top 80%', once: true }
    })
    tl.to(wrap, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: motionTier.cinematicMax * 0.8, ease: approvedEase.gsapPrimary })
      .to(arc, { strokeDashoffset: 0, duration: motionTier.cinematicMax, ease: approvedEase.gsapCinematic }, '-=0.7')
      .to(portrait, { yPercent: 0, duration: motionTier.cinematicMax * 0.7, ease: approvedEase.gsapCinematic }, '<0.1')
      .to(items, { autoAlpha: 1, x: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.07 }, '<0.05')
      // Clip-path is only an entrance device; drop it so tilt/hover shadows aren't cropped.
      .set(wrap, { clipPath: 'none' })

    return () => tl.kill()
  })
})
</script>

<template>
  <div ref="wrapRef" class="relative [perspective:1400px]">
    <article
      ref="cardRef"
      class="surface-dark relative isolate grid gap-8 overflow-hidden rounded-[clamp(18px,1.8vw,28px)] p-4 tablet:grid-cols-2 tablet:p-6 desktop:grid-cols-12 desktop:items-center desktop:gap-6 desktop:p-5 desktop:pr-10"
      style="transform-style: preserve-3d"
    >
      <!-- Precision texture: 4-column rules + cursor spotlight (cobalt, low alpha). -->
      <div aria-hidden="true" class="tp-rules pointer-events-none absolute inset-0 -z-10" />
      <div ref="glowRef" aria-hidden="true" class="tp-glow pointer-events-none absolute inset-0 -z-10" />

      <!-- Corner signature -->
      <div aria-hidden="true" class="pointer-events-none absolute right-5 top-5 z-20 hidden items-center gap-3 desktop:flex">
        <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.4)]">Trusted Partner</span>
        <LayoutBrandMark surface="dark" :height="14" />
      </div>

      <!-- Work With Us panel -->
      <div class="relative min-h-[300px] overflow-hidden rounded-[clamp(12px,1.2vw,20px)] ring-1 ring-[color:rgba(255,255,255,0.12)] bg-[linear-gradient(150deg,#033C59_0%,#022f47_60%,#022436_100%)] tablet:col-span-2 desktop:col-span-4 desktop:min-h-[340px]">
        <svg aria-hidden="true" viewBox="0 0 400 340" preserveAspectRatio="xMaxYMax slice" class="absolute inset-0 h-full w-full">
          <path
            ref="arcRef"
            d="M-40 340 C 40 170, 220 150, 420 210"
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            stroke-width="70"
            stroke-linecap="round"
            pathLength="1"
            stroke-dasharray="1"
          />
          <circle cx="330" cy="120" r="118" fill="none" stroke="rgba(255,255,255,0.08)" stroke-dasharray="2 6" />
        </svg>

        <!-- Sticker-style cutout (white outline baked into the PNG), flush to
             the panel's bottom-right like the owner's reference; the panel's
             rounded overflow crops the flat right/bottom edges. -->
        <div ref="portraitRef" class="absolute bottom-0 right-0 h-[92%]">
          <img
            :src="partner.portrait.src"
            :alt="partner.portrait.alt"
            class="h-full w-auto max-w-none select-none [filter:drop-shadow(0_18px_28px_rgba(0,20,35,0.45))]"
            width="368"
            height="596"
            loading="lazy"
            draggable="false"
          />
        </div>

        <div class="relative z-10 flex h-full min-h-[inherit] max-w-[55%] flex-col justify-between p-6">
          <div>
            <p data-tp-item class="font-display text-[13px] text-[color:rgba(255,255,255,0.72)]">{{ partner.kicker }}</p>
            <h3 data-tp-item class="mt-3 font-display text-[clamp(30px,3vw,44px)] font-extrabold leading-[0.98] tracking-[-0.03em] text-pureWhite">
              {{ partner.panelTitle }}<span class="text-pastiYellow-500">.</span>
            </h3>
          </div>
          <p data-tp-item class="mt-8 max-w-[16ch] font-display text-[13px] leading-relaxed text-[color:rgba(255,255,255,0.72)]">{{ partner.panelBody }}</p>
        </div>
      </div>

      <!-- Title -->
      <div class="flex flex-col justify-center desktop:col-span-3 desktop:pl-4">
        <p data-tp-item class="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:rgba(255,255,255,0.45)]">— Since day one</p>
        <h3 data-tp-item class="mt-3 font-display text-[clamp(34px,3.4vw,52px)] font-extrabold leading-[0.98] tracking-[-0.035em] text-pureWhite">
          {{ partner.title }}
        </h3>
        <p data-tp-item class="mt-5 max-w-[30ch] text-token-body text-[color:rgba(255,255,255,0.68)]">{{ partner.body }}</p>
      </div>

      <!-- Stats -->
      <dl class="grid grid-cols-2 gap-x-8 gap-y-6 border-t border-[color:rgba(255,255,255,0.12)] pt-6 desktop:col-span-3 desktop:border-l desktop:border-t-0 desktop:pl-8 desktop:pt-0">
        <div v-for="(stat, i) in partner.stats" :key="stat.label" data-tp-item class="flex flex-col-reverse">
          <dt class="mt-2 font-display text-token-metadata font-semibold uppercase tracking-[0.12em] text-[color:rgba(255,255,255,0.55)]">{{ stat.label }}</dt>
          <dd class="flex items-start font-display text-[clamp(40px,3.5vw,60px)] font-bold leading-none tracking-[-0.04em] text-pureWhite">
            <span :ref="(el) => { statEls[i]!.value = el as HTMLElement | null }">{{ stat.value }}</span>
            <span class="ml-1 text-[0.55em] leading-none text-pastiYellow-500">{{ stat.suffix }}</span>
          </dd>
        </div>
      </dl>

      <!-- CTA -->
      <div data-tp-item class="flex tablet:col-span-2 desktop:col-span-2 desktop:justify-end">
        <div ref="ctaRef" class="inline-block w-full tablet:w-auto">
          <a
            :href="whatsappLink"
            target="_blank"
            rel="noopener noreferrer"
            class="tp-cta group relative flex w-full items-center justify-between gap-5 overflow-hidden rounded-[14px] bg-pastiYellow-500 py-3 pl-6 pr-3 font-display text-[15px] font-bold text-slateNavy tablet:w-auto"
          >
            <span class="relative z-10">{{ cta.label }}</span>
            <span class="relative z-10 grid h-10 w-10 place-items-center rounded-[10px] bg-slateNavy text-pastiYellow-500 transition-transform duration-300 ease-editorial group-hover:rotate-[-45deg]">
              <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
            </span>
            <span aria-hidden="true" class="absolute inset-0 origin-left scale-x-0 bg-pureWhite transition-transform duration-500 ease-editorial group-hover:scale-x-100" />
          </a>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.tp-rules {
  background-image: linear-gradient(to right, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
  background-size: 25% 100%;
}
.tp-glow {
  background: radial-gradient(
    circle var(--spotlight-radius, 400px) at var(--spotlight-x, -9999px) var(--spotlight-y, -9999px),
    rgba(251, 186, 0, 0.32),
    rgba(251, 186, 0, 0.06) 45%,
    transparent 70%
  );
}
</style>
