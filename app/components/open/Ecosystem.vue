<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// ONE PROCUREMENT ECOSYSTEM (slide 8) — the page's signature, and its only
// pinned section. OPEN's own mark, scaled up into a dial: the ten functions
// (Request → … → Payment) sit on one ring; the centre is OPEN.
// Desktop + motion: the stage pins; scrolling sweeps a yellow arc around the
// ring (one scrubbed stroke-dashoffset) and the centre names the function
// the arc has reached, with its description and a link into its core
// ecosystem. Nodes are buttons: they scroll the dial to that function.
// Below desktop / reduced motion: no pin — the full ring (static, arc
// closed) above the ten functions as a vertical list.
const { ecosystem } = useOpen()
const { openModule } = useOpenDemo()
const nodes = ecosystem.nodes
const n = nodes.length

const stageRef = ref<HTMLElement | null>(null)
const arcRef = ref<SVGCircleElement | null>(null)
const active = ref(0)
const pinned = ref(false)
let st: ScrollTrigger | undefined

const C = 300
const R = 196
const pts = nodes.map((node, i) => {
  const a = ((-90 + (i * 360) / n) * Math.PI) / 180
  const cos = Math.cos(a)
  const sin = Math.sin(a)
  return {
    ...node,
    x: C + R * cos,
    y: C + R * sin,
    lx: C + (R + 34) * cos,
    ly: C + (R + 34) * sin + 5,
    anchor: Math.abs(cos) < 0.15 ? 'middle' : cos > 0 ? 'start' : 'end'
  }
})
const current = computed(() => nodes[active.value]!)

const moduleLabel: Record<string, string> = { procurement: 'Procurement', vendor: 'Vendor Management', catalog: 'Catalog Management' }

const pick = (i: number) => {
  if (pinned.value && st) {
    const y = st.start + ((i + 0.5) / n) * (st.end - st.start)
    const lenis = getLenisInstance()
    if (lenis) lenis.scrollTo(y, { duration: 1.1 })
    else window.scrollTo({ top: y, behavior: 'smooth' })
  } else {
    active.value = i
  }
}

useGsapContext(() => {
  const stage = stageRef.value
  const arc = arcRef.value
  if (!stage || !arc) return
  const mm = gsap.matchMedia()

  mm.add(`${reducedMotionQuery.noPreference} and ${breakpointQuery.desktopUp}`, () => {
    pinned.value = true
    gsap.set(arc, { strokeDashoffset: 100 })
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: '+=240%',
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const i = Math.min(n - 1, Math.floor(self.progress * n))
          if (i !== active.value) active.value = i
        }
      }
    })
    tl.to(arc, { strokeDashoffset: 0, duration: 1 })
    st = tl.scrollTrigger
    return () => {
      st = undefined
      pinned.value = false
      tl.scrollTrigger?.kill()
      tl.kill()
      gsap.set(arc, { clearProps: 'strokeDashoffset' })
    }
  })
})
</script>

<template>
  <section id="ecosystem" class="surface-light relative overflow-hidden" style="--lift-x: 70%; --lift-y: 50%">
    <div ref="stageRef" class="relative py-24 tablet:py-32 desktop:flex desktop:h-[100svh] desktop:min-h-[720px] desktop:items-center desktop:py-0">
      <div aria-hidden="true" class="open-glow pointer-events-none absolute right-[0%] top-1/2 hidden h-[60vw] max-h-[820px] w-[60vw] max-w-[820px] -translate-y-1/2 opacity-60 desktop:block" />
      <BaseContainer class="relative w-full">
        <div class="grid items-center gap-12 desktop:grid-cols-12 desktop:gap-8">
          <div class="desktop:col-span-5">
            <OpenTag :n="5" label="One procurement ecosystem" />
            <OpenHeading class="mt-10" :lines="ecosystem.title" size="md" :lede="ecosystem.body" />
            <p class="m-center mx-auto w-fit border-t-[3px] border-pastiYellow-500 pt-4 desktop:mx-0 desktop:w-auto desktop:border-l-[3px] desktop:border-t-0 desktop:pt-0 desktop:pl-4 mt-5 max-w-[30rem] text-[15px] font-medium leading-relaxed text-slateNavy">{{ ecosystem.note }}</p>

            <!-- Desktop: progress readout -->
            <div class="mt-10 hidden items-center gap-4 desktop:flex" aria-hidden="true">
              <span class="op-num font-display text-[15px] font-bold text-slateNavy">{{ String(active + 1).padStart(2, '0') }}</span>
              <span class="flex flex-1 gap-1">
                <span v-for="(p, i) in nodes" :key="p.id" class="h-[3px] flex-1 rounded-full transition-colors duration-300" :class="i <= active ? 'bg-pastiYellow-500' : 'bg-[color:rgba(3,60,89,0.12)]'" />
              </span>
              <span class="op-num font-display text-[15px] font-bold text-[color:rgba(3,60,89,0.45)]">{{ n }}</span>
            </div>
          </div>

          <!-- The dial -->
          <div class="relative mx-auto w-full max-w-[400px] tablet:max-w-[520px] desktop:col-span-7 desktop:max-w-[640px]">
            <svg viewBox="-60 -10 720 620" class="h-auto w-full overflow-visible" role="img" :aria-label="`OPEN menghubungkan ${n} fungsi procurement dalam satu siklus: ${nodes.map((x) => x.label).join(', ')}`">
              <circle :cx="C" :cy="C" :r="R + 64" stroke="rgba(3,60,89,0.07)" stroke-dasharray="2 7" fill="none" />
              <circle :cx="C" :cy="C" :r="R" stroke="rgba(3,60,89,0.12)" stroke-width="14" fill="none" />
              <circle ref="arcRef" :cx="C" :cy="C" :r="R" stroke="#FBBA00" stroke-width="14" fill="none" pathLength="100" stroke-dasharray="100" stroke-dashoffset="0" stroke-linecap="round" :transform="`rotate(-90 ${C} ${C})`" />
              <g v-for="(p, i) in pts" :key="p.id">
                <circle :cx="p.x" :cy="p.y" :r="i === active && pinned ? 15 : 10" :fill="!pinned || i <= active ? '#033C59' : '#fff'" stroke="#033C59" stroke-width="3" class="transition-all duration-300" />
                <text :x="p.lx" :y="p.ly" :text-anchor="p.anchor" class="hidden font-display text-[17px] font-bold transition-[fill] duration-300 tablet:inline" :class="!pinned || i === active ? 'fill-slateNavy' : 'fill-[rgba(3,60,89,0.45)]'">{{ p.label }}</text>
              </g>
            </svg>

            <!-- Node hit targets (HTML, keyboard reachable) -->
            <div class="absolute inset-0" aria-label="Pilih fungsi" role="group">
              <button
                v-for="(p, i) in pts"
                :key="p.id"
                type="button"
                class="absolute h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pastiYellow-500"
                :style="{ left: `${((p.x + 60) / 720) * 100}%`, top: `${((p.y + 10) / 620) * 100}%` }"
                :aria-label="p.label"
                :aria-pressed="i === active"
                @click="pick(i)"
              />
            </div>

            <!-- Centre -->
            <div class="pointer-events-none absolute left-1/2 top-[50%] flex w-[46%] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center" style="top: calc((300 + 10) / 620 * 100%)">
              <span class="flex items-center gap-1.5 font-display text-[12px] font-extrabold text-slateNavy tablet:text-[14px]"><OpenMark :size="16" />OPEN</span>
              <Transition name="eco" mode="out-in">
                <div :key="current.id" class="mt-2" aria-live="polite">
                  <p class="op-display text-[length:clamp(22px,3.4vw,46px)] text-slateNavy">{{ current.label }}</p>
                  <p class="mt-2 hidden text-[13px] leading-snug text-[color:rgba(3,60,89,0.7)] tablet:block tablet:text-[14px]">{{ current.body }}</p>
                </div>
              </Transition>
              <button
                v-if="current.module"
                type="button"
                class="pointer-events-auto mt-3 hidden min-h-9 items-center gap-1.5 rounded-full bg-slateNavy px-3.5 text-[12px] font-bold text-pureWhite transition-colors hover:bg-[color:#022436] tablet:inline-flex"
                @click="openModule(current.module!)"
              >
                {{ moduleLabel[current.module!] }}
                <svg viewBox="0 0 16 16" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Below desktop: the ten functions as a list -->
        <ol class="relative mt-12 desktop:hidden">
          <span aria-hidden="true" class="absolute bottom-6 left-[11px] top-3 w-[2px] bg-pastiYellow-500" />
          <li v-for="(p, i) in nodes" :key="p.id" class="relative flex gap-4 pb-6 last:pb-0">
            <span class="op-num relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slateNavy font-display text-[10px] font-bold text-pastiYellow-500">{{ i + 1 }}</span>
            <div class="flex-1">
              <p class="font-display text-[19px] font-extrabold tracking-[-0.02em] text-slateNavy">{{ p.label }}</p>
              <p class="mt-1 text-[14px] leading-snug text-[color:rgba(3,60,89,0.72)]">{{ p.body }}</p>
            </div>
          </li>
        </ol>
      </BaseContainer>
    </div>

    <!-- Ecosystem components + what runs underneath -->
    <BaseContainer class="relative pb-24 tablet:pb-32">
      <ul class="grid gap-3 tablet:grid-cols-3">
        <li v-for="c in ecosystem.components" :key="c.id">
          <button type="button" class="group flex h-full w-full flex-col rounded-[20px] border border-[color:rgba(3,60,89,0.12)] bg-pureWhite p-6 text-left transition-[border-color,box-shadow] duration-300 hover:border-slateNavy hover:shadow-[0_30px_60px_-40px_rgba(3,60,89,0.6)]" @click="openModule(c.id)">
            <span class="font-display text-[20px] font-extrabold tracking-[-0.02em] text-slateNavy">{{ c.label }}</span>
            <span class="mt-2 text-[14px] leading-relaxed text-[color:rgba(3,60,89,0.7)]">{{ c.body }}</span>
            <span class="mt-5 inline-flex items-center gap-2 text-[13px] font-bold text-slateNavy">
              Lihat modul
              <svg viewBox="0 0 16 16" class="h-3.5 w-3.5 transition-transform duration-300 ease-editorial group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
            </span>
          </button>
        </li>
      </ul>
      <ul class="mt-10 grid grid-cols-1 border-t border-[color:rgba(3,60,89,0.14)] tablet:grid-cols-2 desktop:grid-cols-5">
        <li v-for="p in ecosystem.pillars" :key="p.label" class="border-b border-[color:rgba(3,60,89,0.14)] py-5 desktop:border-b-0 desktop:border-r desktop:px-5 desktop:first:pl-0 desktop:last:border-r-0">
          <p class="font-display text-[15px] font-extrabold text-slateNavy">{{ p.label }}</p>
          <p class="mt-1.5 text-[13.5px] leading-snug text-[color:rgba(3,60,89,0.68)]">{{ p.body }}</p>
        </li>
      </ul>
    </BaseContainer>
  </section>
</template>

<style scoped>
.eco-enter-active,
.eco-leave-active {
  transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.eco-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.eco-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
[data-reduced-motion='true'] .eco-enter-active,
[data-reduced-motion='true'] .eco-leave-active {
  transition: none;
}
</style>
