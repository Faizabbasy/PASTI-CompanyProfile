<script setup lang="ts">
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Compact product sub-navigation (brief: Overview · Capabilities · Use Cases
// · Architecture · Governance · Contact). Not a second navbar: a slim ruled
// bar docked bottom-centre on desktop that appears after the hero, tracks the
// section in view and steps aside at the demo form. The global PASTI header
// stays as is. Below desktop it is skipped (the WhatsApp FAB owns that edge).
const scrollTo = useEcorpScroll()
const items = [
  { id: 'overview', label: 'Overview' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'use-cases', label: 'Use Cases' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'governance', label: 'Governance' }
]
const visible = ref(false)
const active = ref('')

let st: ScrollTrigger | null = null
onMounted(() => {
  const update = () => {
    const vh = window.innerHeight
    const demo = document.getElementById('demo')
    visible.value = window.scrollY > vh * 0.8 && (!demo || demo.getBoundingClientRect().top > vh * 0.6)
    let cur = ''
    for (const it of items) {
      const el = document.getElementById(it.id)
      if (el && el.getBoundingClientRect().top < vh * 0.5) cur = it.id
    }
    active.value = cur
  }
  st = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, onRefresh: update })
  update()
})
onBeforeUnmount(() => st?.kill())
</script>

<template>
  <nav
    aria-label="e-CORPORATE page sections"
    class="fixed bottom-6 left-1/2 z-40 hidden -translate-x-1/2 transition-[opacity,transform] duration-500 ease-editorial desktop:block"
    :class="visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'"
    :inert="!visible || undefined"
  >
    <div class="flex items-center border border-[color:rgba(255,255,255,0.16)] bg-navyDeep-900 shadow-[0_24px_50px_-20px_rgba(0,12,22,0.7)]">
      <span class="hidden px-4 desktop:block"><EcorpWordmark surface="dark" class="text-[12px]" /></span>
      <button
        v-for="it in items"
        :key="it.id"
        type="button"
        class="relative h-11 border-l border-[color:rgba(255,255,255,0.1)] px-3.5 font-display text-[13px] font-semibold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pastiYellow-500 desktop:px-4"
        :class="active === it.id ? 'text-pureWhite' : 'text-[color:rgba(255,255,255,0.6)] hover:text-pureWhite'"
        :aria-current="active === it.id ? 'true' : undefined"
        @click="scrollTo(it.id)"
      >
        {{ it.label }}
        <span aria-hidden="true" class="absolute inset-x-3 bottom-0 h-[2px] origin-left bg-pastiYellow-500 transition-transform duration-300" :class="active === it.id ? 'scale-x-100' : 'scale-x-0'" />
      </button>
      <button type="button" class="h-11 bg-pastiYellow-500 px-4 font-display text-[13px] font-bold text-slateNavy focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-slateNavy" @click="scrollTo('demo')">
        Contact
      </button>
    </div>
  </nav>
</template>
