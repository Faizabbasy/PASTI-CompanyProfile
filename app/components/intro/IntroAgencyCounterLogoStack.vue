<script setup lang="ts">
import gsap from 'gsap'

// Agency Intro — Counter grid → Logo stack cycle. Two-act combination: Act 1
// is the "00 → 100%" counter ticking up with a checkerboard grid fill behind
// it (a loading beat that sets scale/anticipation); at 100% it crossfades
// into Act 2 — the pillar-word stack cycle (Technology / Creativity /
// Impact), landing on a large-scale "PASTI" with a light-sweep bloom. Both
// acts are simple opacity layers stacked in the same spot (not toggled via
// visibility/display) so the handoff is just a plain GSAP crossfade — the
// most reliable way to hand off between two acts on one timeline.
const emit = defineEmits<{ complete: [] }>()
const overlayRef = ref<HTMLElement | null>(null)
const counterActRef = ref<HTMLElement | null>(null)
const counterRef = ref<HTMLElement | null>(null)
const wordWrapRef = ref<HTMLElement | null>(null)
const wordRef = ref<HTMLElement | null>(null)
const shineRef = ref<HTMLElement | null>(null)

const COLS = 10
const ROWS = 6
const words = ['Technology', 'Creativity', 'Impact', 'PASTI']

onMounted(() => {
  const cells = Array.from(document.querySelectorAll<HTMLElement>('[data-counter-cell]'))
  gsap.set(cells, { opacity: 0 })

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(overlayRef.value, { autoAlpha: 0, duration: 0.6, ease: 'power2.inOut', onComplete: () => emit('complete') })
    }
  })

  // Act 1 — counter + grid fill, building anticipation.
  tl.to(
    { v: 0 },
    {
      v: 100,
      duration: 1.3,
      ease: 'power1.inOut',
      onUpdate: function () {
        const v = Math.floor(this.targets()[0].v)
        if (counterRef.value) counterRef.value.textContent = String(v).padStart(2, '0')
        const shouldShow = Math.floor((v / 100) * cells.length)
        cells.forEach((cell, i) => {
          gsap.set(cell, { opacity: i < shouldShow ? 1 : 0 })
        })
      }
    }
  )
  tl.to({}, { duration: 0.15 })

  // Transition — Act 1 fades/zooms out while Act 2 fades in on top of it, a
  // plain crossfade (no visibility toggling) for a smooth, reliable handoff.
  tl.to(counterActRef.value, { scale: 1.3, opacity: 0, duration: 0.6, ease: 'power3.in' })
  tl.fromTo(wordWrapRef.value, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '<')

  // Act 2 — pillar-word stack cycle, landing on "PASTI" at full scale.
  words.forEach((word, i) => {
    const isLast = i === words.length - 1
    tl.call(() => {
      if (wordRef.value) wordRef.value.textContent = word
      if (wordWrapRef.value) wordWrapRef.value.classList.toggle('is-brand', isLast)
    })
    tl.fromTo(
      wordRef.value,
      { yPercent: 115, opacity: 0, scale: isLast ? 0.85 : 0.96, filter: 'blur(6px)' },
      {
        yPercent: 0,
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: isLast ? 0.9 : 0.32,
        ease: isLast ? 'power4.out' : 'power3.out'
      }
    )
    tl.to({}, { duration: isLast ? 0.9 : 0.26 })
    if (!isLast) {
      tl.to(wordRef.value, { yPercent: -115, opacity: 0, scale: 1.04, filter: 'blur(6px)', duration: 0.26, ease: 'power3.in' })
    }
  })

  // Dramatic light sweep across "PASTI" once it lands at full scale.
  if (shineRef.value) {
    gsap.set(shineRef.value, { opacity: 0, backgroundPosition: '150% 150%' })
    tl.to(
      shineRef.value,
      { opacity: 1, backgroundPosition: '-50% -50%', duration: 1.1, ease: 'cubic-bezier(0.65, 0, 0.35, 1)' },
      '-=0.75'
    )
    tl.set(shineRef.value, { opacity: 0 })
  }

  onBeforeUnmount(() => tl.kill())
})
</script>

<template>
  <div ref="overlayRef" class="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-paper">
    <div ref="counterActRef" class="absolute inset-0 flex items-center justify-center">
      <div
        class="absolute inset-0 grid opacity-[0.06]"
        :style="{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }"
      >
        <div v-for="i in COLS * ROWS" :key="i" data-counter-cell="" class="m-[2px] bg-navy-700" />
      </div>
      <div class="relative flex items-baseline gap-2 font-display text-navy-900">
        <span ref="counterRef" class="text-7xl font-extrabold tabular-nums md:text-9xl">00</span>
        <span class="text-2xl font-semibold text-navy-400 md:text-4xl">%</span>
      </div>
    </div>

    <div ref="wordWrapRef" class="absolute inset-0 flex items-center justify-center opacity-0">
      <div class="relative">
        <span
          ref="wordRef"
          class="block font-display text-display-xl font-extrabold tracking-tight text-navy-900 will-change-transform [.is-brand_&]:text-[clamp(4rem,11vw,10rem)]"
        />
        <span
          ref="shineRef"
          aria-hidden="true"
          class="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.9)_50%,transparent_65%)] bg-[length:250%_250%] bg-clip-text text-transparent [-webkit-text-fill-color:transparent] font-display text-display-xl font-extrabold tracking-tight [.is-brand_&]:text-[clamp(4rem,11vw,10rem)]"
        >PASTI</span>
      </div>
    </div>
  </div>
</template>
