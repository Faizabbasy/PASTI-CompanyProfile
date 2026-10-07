<script setup lang="ts">
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Compact OPEN product sub-nav (brief: Overview · Ecosystem · Modules ·
// Governance · Integration · Demo) — desktop only, a slim pill bottom-centre
// that appears after the hero and steps aside at the demo form. The OPEN
// ring in it fills with page progress (one stroke-dashoffset), the same
// closed-loop device as the section tags. The global header is untouched;
// below desktop the WhatsApp FAB owns that edge.
const { scrollTo } = useOpenDemo()

const items = [
  { id: 'overview', label: 'Overview' },
  { id: 'ecosystem', label: 'Ecosystem' },
  { id: 'modules', label: 'Modules' },
  { id: 'governance', label: 'Governance' },
  { id: 'integration', label: 'Integration' },
  { id: 'demo', label: 'Demo' }
]
const visible = ref(false)
const active = ref('')
const progress = ref(0)

let st: ScrollTrigger | null = null
onMounted(() => {
  const update = (self?: ScrollTrigger) => {
    const vh = window.innerHeight
    const demo = document.getElementById('demo')
    visible.value = window.scrollY > vh * 0.8 && (!demo || demo.getBoundingClientRect().top > vh * 0.55)
    let cur = ''
    for (const it of items) {
      const el = document.getElementById(it.id)
      if (el && el.getBoundingClientRect().top < vh * 0.5) cur = it.id
    }
    active.value = cur
    if (self) progress.value = self.progress
  }
  st = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, onRefresh: update })
  update()
})
onBeforeUnmount(() => st?.kill())
</script>

<template>
  <nav
    aria-label="Navigasi halaman OPEN"
    class="fixed bottom-6 left-1/2 z-40 hidden -translate-x-1/2 transition-[opacity,transform] duration-500 ease-editorial desktop:block"
    :class="visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'"
  >
    <div class="flex items-center gap-0.5 rounded-full border border-[color:rgba(255,255,255,0.14)] bg-[color:rgba(2,36,54,0.94)] p-1.5 shadow-[0_24px_50px_-20px_rgba(0,12,22,0.7)]">
      <span class="flex items-center gap-2 pl-2.5 pr-2" aria-hidden="true">
        <svg viewBox="0 0 24 24" class="h-5 w-5 -rotate-90" fill="none">
          <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.18)" stroke-width="3" />
          <circle cx="12" cy="12" r="9" stroke="#FBBA00" stroke-width="3" pathLength="100" stroke-dasharray="100" :stroke-dashoffset="100 - progress * 100" stroke-linecap="round" />
        </svg>
        <span class="font-display text-[13px] font-extrabold text-pureWhite">OPEN</span>
      </span>
      <a
        v-for="it in items.slice(0, -1)"
        :key="it.id"
        :href="`#${it.id}`"
        class="relative flex h-9 items-center rounded-full px-3.5 font-display text-[13px] font-semibold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pastiYellow-500"
        :class="active === it.id ? 'bg-[color:rgba(255,255,255,0.12)] text-pureWhite' : 'text-[color:rgba(255,255,255,0.65)] hover:text-pureWhite'"
        :aria-current="active === it.id ? 'location' : undefined"
        @click.prevent="scrollTo(it.id)"
      >{{ it.label }}</a>
      <a href="#demo" class="ml-1 flex h-9 items-center rounded-full bg-pastiYellow-500 px-4 font-display text-[13px] font-bold text-slateNavy transition-transform duration-200 active:scale-[0.97]" @click.prevent="scrollTo('demo')">
        Request a Demo
      </a>
    </div>
  </nav>
</template>
