<script setup lang="ts">
import gsap from 'gsap'

// Agency Intro — Logo stack cycle. Cycles through the brand's three pillar
// words (Technology / Creativity / Impact) stacked in place, each replacing
// the last with a deep vertical mask-swap plus a subtle scale/blur breath,
// landing on "PASTI" as the final word — held longer, at full dramatic
// scale, with a light sweep across it — a "flipping through concepts to
// arrive at the brand" opener, common on agency sites that want to state
// their positioning before the page loads.
const emit = defineEmits<{ complete: [] }>()
const overlayRef = ref<HTMLElement | null>(null)
const wordWrapRef = ref<HTMLElement | null>(null)
const wordRef = ref<HTMLElement | null>(null)
const shineRef = ref<HTMLElement | null>(null)

const words = ['Technology', 'Creativity', 'Impact', 'PASTI']

onMounted(() => {
  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(overlayRef.value, { autoAlpha: 0, duration: 0.6, ease: 'power2.inOut', onComplete: () => emit('complete') })
    }
  })

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
    <div ref="wordWrapRef" class="relative">
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
</template>
