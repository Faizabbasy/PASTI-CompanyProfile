<script setup lang="ts">
import gsap from 'gsap'

// CAPABILITY AREAS — the brief's eight TEMPORARY capability areas (not
// confirmed fixed modules; flagged `temporary` in useEcorporate and said so
// on the page). Set as a ruled specification sheet: shared hairlines, a
// numbered index, line icons — a structured matrix, not floating cards.
// Desktop: a soft yellow spotlight follows the cursor across the sheet (two
// CSS variables written per pointer frame — one gradient repaint), and the
// hovered cell floods navy from the bottom with its text turning white.
const { capabilities, capabilityNote } = useEcorporate()

const sectionRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)
let raf = 0
const onMove = (e: PointerEvent) => {
  const el = gridRef.value
  if (!el || e.pointerType !== 'mouse') return
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  })
}
onBeforeUnmount(() => cancelAnimationFrame(raf))
useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const cells = section.querySelectorAll<HTMLElement>('[data-ec-cell]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(cells, { autoAlpha: 0, y: 18 })
    const t = gsap.to(cells, { autoAlpha: 1, y: 0, duration: motionTier.standardMax, ease: approvedEase.gsapStandard, stagger: 0.05, scrollTrigger: { trigger: section.querySelector('[data-ec-grid]'), start: 'top 78%', once: true } })
    return () => {
      t.kill()
      gsap.set(cells, { clearProps: 'opacity,visibility,transform' })
    }
  })
})
</script>

<template>
  <section id="capabilities" ref="sectionRef" class="relative overflow-hidden bg-pureWhite py-24 tablet:py-32">
    <BaseGridLines tone="light" />
    <EcorpMarks label="05 / 12 · Indicative capability areas" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Capability areas" meta="05 / 12" />
      <div class="mt-12 grid gap-6 desktop:grid-cols-12 desktop:items-end">
        <EcorpHeading class="desktop:col-span-8" eyebrow="Capability areas" before="What the environment " mark="brings together" />
        <p class="m-center max-w-[22rem] font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-[color:rgba(3,60,89,0.55)] desktop:col-span-4 desktop:justify-self-end desktop:text-right">{{ capabilityNote }}</p>
      </div>

      <ul ref="gridRef" data-ec-grid class="ec-spot mt-14 grid border-l border-t border-[color:rgba(3,60,89,0.14)] bg-pureWhite tablet:grid-cols-2 desktop:grid-cols-4" @pointermove="onMove">
        <li
          v-for="(c, i) in capabilities"
          :key="c.id"
          data-ec-cell
          class="group relative isolate flex flex-col overflow-hidden border-b border-r border-[color:rgba(3,60,89,0.14)] p-6 tablet:min-h-[220px] desktop:min-h-[260px]"
        >
          <span aria-hidden="true" class="absolute inset-0 -z-10 hidden origin-bottom scale-y-0 bg-slateNavy transition-transform duration-500 ease-editorial group-hover:scale-y-100 desktop:block" />
          <span aria-hidden="true" class="absolute inset-x-0 -top-px h-[2px] origin-left scale-x-0 bg-pastiYellow-500 transition-transform duration-500 ease-editorial group-hover:scale-x-100" />
          <div class="flex items-center justify-between">
            <span class="font-mono text-[11px] tabular-nums text-[color:rgba(3,60,89,0.45)] transition-colors duration-300 desktop:group-hover:text-pastiYellow-500">{{ String(i + 1).padStart(2, '0') }}</span>
            <EcorpIcon :name="c.id" class="h-7 w-7 text-slateNavy transition-[color,transform] duration-500 ease-editorial desktop:group-hover:-translate-y-1 desktop:group-hover:text-pastiYellow-500" />
          </div>
          <h3 class="mt-auto pt-6 font-display text-[20px] font-bold leading-[1.15] tracking-[-0.015em] text-slateNavy transition-colors duration-300 tablet:pt-10 desktop:group-hover:text-pureWhite">{{ c.title }}</h3>
          <p class="mt-3 text-[14px] leading-relaxed text-[color:rgba(3,60,89,0.7)] transition-colors duration-300 desktop:group-hover:text-[color:rgba(255,255,255,0.75)]">{{ c.body }}</p>
        </li>
      </ul>
    </BaseContainer>
  </section>
</template>

<style scoped>
@media (min-width: 1024px) and (pointer: fine) {
  .ec-spot {
    background-image: radial-gradient(260px circle at var(--mx, -400px) var(--my, -400px), rgba(251, 186, 0, 0.16), transparent 70%);
  }
}
</style>
