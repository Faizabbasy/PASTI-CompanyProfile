<script setup lang="ts">
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Local OPEN sub-nav — desktop only. A small floating pill (bottom centre,
// clear of the global header and the WhatsApp FAB) that appears once the hero
// is passed, tracks the section in view and hides again at the demo form.
// The global PASTI header stays untouched.
const { scrollTo, requestDemo } = useOpenDemo()

const items = [
  { id: 'ecosystem', label: 'Ecosystem' },
  { id: 'solutions', label: 'Solutions' },
  { id: 'e-auction', label: 'e-Auction' },
  { id: 'cases', label: 'Cases' },
  { id: 'impact', label: 'Impact' }
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
    aria-label="OPEN page sections"
    class="fixed bottom-6 left-1/2 z-40 hidden -translate-x-1/2 transition-[opacity,transform] duration-500 ease-editorial desktop:block"
    :class="visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'"
  >
    <div class="flex items-center gap-1 rounded-full border border-[color:rgba(255,255,255,0.14)] bg-[color:rgba(2,36,54,0.92)] p-1.5 shadow-[0_24px_50px_-20px_rgba(0,12,22,0.7)] backdrop-blur-md">
      <span class="flex items-center gap-2 pl-3 pr-2">
        <OpenMark :size="18" />
        <span class="font-display text-[13px] font-extrabold text-pureWhite">OPEN</span>
      </span>
      <button
        v-for="it in items"
        :key="it.id"
        type="button"
        class="relative h-9 rounded-full px-3.5 font-display text-[13px] font-semibold transition-colors duration-300"
        :class="active === it.id ? 'bg-[color:rgba(255,255,255,0.12)] text-pureWhite' : 'text-[color:rgba(255,255,255,0.6)] hover:text-pureWhite'"
        :aria-current="active === it.id ? 'true' : undefined"
        @click="scrollTo(it.id)"
      >
        {{ it.label }}
      </button>
      <button type="button" class="ml-1 h-9 rounded-full bg-pastiYellow-500 px-4 font-display text-[13px] font-bold text-slateNavy transition-transform duration-200 active:scale-[0.97]" @click="requestDemo()">
        Request Demo
      </button>
    </div>
  </nav>
</template>
