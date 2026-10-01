<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// MANIFESTO — the company intro as an editorial paragraph that "comes into
// focus" word by word with the scroll (faint → PASTI Blue; key words get the
// Yellow accent), then the five-step method from the brand guide §01 as a
// timeline whose rail fills and whose nodes light up in sequence.
const { introHeading, introBody, method } = useAbout()

const accent = new Set(['exceptional', 'expertise', 'excellence,', 'efficient', 'impactful', 'rapid', 'effective'])
const words = introBody.split(' ')

const sectionRef = ref<HTMLElement | null>(null)
const methodRef = ref<HTMLElement | null>(null)
const lit = ref(-1)

useGsapContext(() => {
  const section = sectionRef.value
  const methodEl = methodRef.value
  if (!section || !methodEl) return
  const wordEls = section.querySelectorAll<HTMLElement>('[data-mf-word]')
  const rail = methodEl.querySelector<HTMLElement>('[data-mf-rail]')
  const mm = gsap.matchMedia()

  mm.add(reducedMotionQuery.reduce, () => {
    gsap.set(wordEls, { opacity: 1 })
    if (rail) gsap.set(rail, { scaleX: 1, scaleY: 1 })
    lit.value = method.length - 1
  })

  mm.add(reducedMotionQuery.noPreference, () => {
    const fill = gsap.fromTo(
      wordEls,
      { opacity: 0.14 },
      { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: section.querySelector('[data-mf-text]'), start: 'top 80%', end: 'bottom 45%', scrub: true } }
    )
    const steps = gsap.timeline({
      scrollTrigger: {
        trigger: methodEl,
        start: 'top 75%',
        end: 'bottom 55%',
        scrub: 0.5,
        onUpdate: (self) => (lit.value = self.progress < 0.02 ? -1 : Math.min(method.length - 1, Math.floor(self.progress * method.length)))
      }
    })
    if (rail) steps.fromTo(rail, { scaleX: 0, scaleY: 0 }, { scaleX: 1, scaleY: 1, ease: 'none' })
    return () => {
      fill.scrollTrigger?.kill()
      fill.kill()
      steps.scrollTrigger?.kill()
      steps.kill()
    }
  })
})
</script>

<template>
  <section ref="sectionRef" class="surface-light relative overflow-hidden py-24 tablet:py-36" style="--lift-x: 10%; --lift-y: 80%">
    <BaseGridLines tone="light" />
    <BaseContainer class="relative z-10">
      <div class="grid gap-10 desktop:grid-cols-12">
        <p class="inline-flex h-fit items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.6)] desktop:col-span-3 desktop:pt-4">
          <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />{{ introHeading }}
        </p>
        <p data-mf-text class="font-display text-[length:clamp(28px,3.6vw,58px)] font-bold leading-[1.12] tracking-[-0.03em] text-slateNavy desktop:col-span-9">
          <template v-for="(w, i) in words" :key="i"><span data-mf-word class="mf-word" :class="accent.has(w.toLowerCase()) ? 'mf-accent' : ''">{{ w }}</span>{{ ' ' }}</template>
        </p>
      </div>

      <!-- Method timeline -->
      <div ref="methodRef" class="mt-24 tablet:mt-32">
        <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.55)]">How PASTI works</p>
        <ol class="relative mt-8 grid gap-0 desktop:grid-cols-5 desktop:gap-6">
          <!-- Rail: vertical on mobile, horizontal on desktop -->
          <span aria-hidden="true" class="absolute bottom-6 left-[15px] top-4 w-px bg-[color:rgba(3,60,89,0.14)] desktop:bottom-auto desktop:left-0 desktop:right-0 desktop:top-[15px] desktop:h-px desktop:w-auto" />
          <span data-mf-rail aria-hidden="true" class="absolute bottom-6 left-[15px] top-4 w-[2px] origin-top bg-pastiYellow-500 desktop:bottom-auto desktop:left-0 desktop:right-0 desktop:top-[14px] desktop:h-[2px] desktop:w-auto desktop:origin-left" />
          <li v-for="(step, i) in method" :key="step" class="relative flex gap-5 pb-10 desktop:block desktop:pb-0">
            <span
              class="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 font-mono text-[11px] font-bold transition-[background-color,border-color,color,transform] duration-500 ease-editorial"
              :class="i <= lit ? 'scale-110 border-pastiYellow-500 bg-pastiYellow-500 text-slateNavy' : 'border-[color:rgba(3,60,89,0.2)] bg-surfaceNeutral text-[color:rgba(3,60,89,0.5)]'"
            >{{ i + 1 }}</span>
            <p class="font-display text-[22px] font-bold leading-[1.15] tracking-[-0.02em] transition-colors duration-500 desktop:mt-6 desktop:text-[clamp(20px,1.7vw,26px)]" :class="i <= lit ? 'text-slateNavy' : 'text-[color:rgba(3,60,89,0.35)]'">
              {{ step }}
            </p>
          </li>
        </ol>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.mf-accent {
  background-image: linear-gradient(transparent 62%, rgba(251, 186, 0, 0.55) 62%);
}
</style>
