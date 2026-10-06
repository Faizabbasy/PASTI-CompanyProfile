<script setup lang="ts">
import gsap from 'gsap'

// CONFIGURABLE BY ORGANIZATION — deep navy structural section. Headline is
// the brief's allowed TEMPORARY marketing line. The brief's model
// (Organization → Roles → Workflow → Approval → Process → Information →
// Dashboard) is one chain of ruled blocks; a yellow line runs through it
// with the scroll (scrubbed) and each block switches on as it is reached. Below: the six CONFIRMED
// adaptation dimensions (from "tailored to specific business requirements,
// organizational workflows, and operational needs").
// Desktop: horizontal chain. Below desktop: vertical chain.
const { configHeadline, configChain, configAdapts, positioning } = useEcorporate()

const sectionRef = ref<HTMLElement | null>(null)
const reached = ref(-1)
useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const chain = section.querySelector<HTMLElement>('[data-cf-chain]')
  const lines = section.querySelectorAll<HTMLElement>('[data-cf-line]')
  const mm = gsap.matchMedia()
  // Scrubbed: the yellow line runs through the chain as you scroll and each
  // block switches on as the line reaches it.
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(lines, { scaleX: 0, scaleY: 0 })
    const n = configChain.length
    const t = gsap.to(lines, {
      scaleX: 1,
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: chain,
        start: 'top 78%',
        end: 'bottom 45%',
        scrub: 0.6,
        onUpdate: (self) => (reached.value = Math.min(n - 1, Math.floor(self.progress * n - 0.001)))
      }
    })
    return () => {
      t.scrollTrigger?.kill()
      t.kill()
      gsap.set(lines, { clearProps: 'transform' })
      reached.value = n - 1
    }
  })
  mm.add(reducedMotionQuery.reduce, () => {
    reached.value = configChain.length - 1
  })
})
</script>

<template>
  <section id="configurable" ref="sectionRef" data-header-theme="dark" class="relative overflow-hidden bg-navyDeep-800 py-24 text-pureWhite tablet:py-32">
    <BaseGridLines tone="dark" edge="top" />
    <EcorpMarks surface="dark" label="07 / 12 · Configuration model" />
    <span aria-hidden="true" class="ec-outline ec-outline--dark absolute -left-[1vw] bottom-[-2vw] text-[length:clamp(120px,20vw,320px)]">ADAPT</span>
    <BaseContainer class="relative z-10">
      <BaseSectionMark label="Configurable" meta="07 / 12" />
      <div class="mt-12 grid gap-8 desktop:grid-cols-12 desktop:items-end">
        <EcorpHeading class="desktop:col-span-8" surface="dark" size="md" eyebrow="Configurable by organization" :before="configHeadline.before" :mark="configHeadline.mark" />
        <p class="m-center max-w-[28rem] text-[16px] leading-relaxed text-[color:rgba(255,255,255,0.72)] desktop:col-span-4 desktop:justify-self-end">{{ positioning[1] }}</p>
      </div>

      <!-- Chain -->
      <ol data-cf-chain class="relative mt-16 grid gap-3 desktop:grid-cols-7 desktop:gap-0" aria-label="Configuration model">
        <span aria-hidden="true" data-cf-line class="absolute left-[19px] top-4 bottom-4 w-[2px] origin-top bg-pastiYellow-500 desktop:hidden" />
        <span aria-hidden="true" data-cf-line class="absolute left-[7%] right-[7%] top-[27px] hidden h-[2px] origin-left bg-pastiYellow-500 desktop:block" />
        <li v-for="(c, i) in configChain" :key="c" class="relative flex items-center gap-4 transition-opacity duration-500 desktop:flex-col desktop:items-center desktop:gap-4 desktop:px-2 desktop:text-center" :class="i <= reached ? 'opacity-100' : 'opacity-30'">
          <span class="relative z-10 grid h-10 w-10 shrink-0 place-items-center border font-mono text-[11px] transition-colors duration-500 desktop:h-14 desktop:w-14 desktop:text-[12px]" :class="i <= reached ? 'border-pastiYellow-500 bg-pastiYellow-500 text-slateNavy' : 'border-[color:rgba(255,255,255,0.3)] bg-navyDeep-800 text-[color:rgba(255,255,255,0.6)]'">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="font-display text-[18px] font-bold leading-tight tablet:text-[20px] desktop:text-[17px] wide:text-[19px]">{{ c }}</span>
          <span v-if="i < configChain.length - 1" class="sr-only">then</span>
        </li>
      </ol>

      <!-- Adapts to (confirmed) -->
      <div class="mt-16 border-t border-[color:rgba(255,255,255,0.16)] pt-8">
        <p class="m-center font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(255,255,255,0.55)]">Adapts to</p>
        <ul class="mt-5 grid grid-cols-1 border-l border-t border-[color:rgba(255,255,255,0.12)] tablet:grid-cols-2 desktop:grid-cols-3">
          <li v-for="a in configAdapts" :key="a" class="flex items-center gap-3 border-b border-r border-[color:rgba(255,255,255,0.12)] px-5 py-4 font-display text-[17px] font-semibold">
            <span aria-hidden="true" class="h-1.5 w-1.5 bg-pastiYellow-500" />{{ a }}
          </li>
        </ul>
      </div>
    </BaseContainer>
  </section>
</template>
