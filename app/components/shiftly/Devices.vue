<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// IoT & SMART DEVICES (deck slides 4 + 10). A connection diagram: the four
// device types on the left feed SHIFTLY on the right; selecting a device
// (hover / focus / tap) lights its line and a sync pulse travels along it
// to the platform, and its description shows below. Below desktop the
// diagram simplifies to a vertical list of devices into SHIFTLY.
// Reduced motion: lines static, no pulse.
const { devices } = useShiftly()
const active = ref(0)
const sectionRef = ref<HTMLElement | null>(null)
const pulseRefs = ref<SVGCircleElement[]>([])
const lineRefs = ref<SVGPathElement[]>([])
const ys = [50, 130, 210, 290]

let pulse: gsap.core.Tween | null = null
const runPulse = () => {
  pulse?.kill()
  const dot = pulseRefs.value[active.value]
  const path = lineRefs.value[active.value]
  if (!dot || !path || window.matchMedia(reducedMotionQuery.reduce).matches) return
  // A sync pulse travelling along the device's line to SHIFTLY.
  const len = path.getTotalLength()
  const s = { t: 0 }
  pulse = gsap.to(s, {
    t: 1,
    duration: 1.4,
    ease: approvedEase.gsapStandard,
    repeat: -1,
    repeatDelay: 0.6,
    onUpdate: () => {
      const pt = path.getPointAtLength(s.t * len)
      dot.setAttribute('cx', String(pt.x))
      dot.setAttribute('cy', String(pt.y))
    }
  })
}
watch(active, () => nextTick(runPulse))

useGsapContext(() => {
  const section = sectionRef.value
  if (!section) return
  const lines = section.querySelectorAll<SVGPathElement>('[data-dv-line]')
  const items = section.querySelectorAll<HTMLElement>('[data-dv-item]')
  const mm = gsap.matchMedia()
  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(lines, { strokeDasharray: 600, strokeDashoffset: 600 })
    gsap.set(items, { autoAlpha: 0, y: 20 })
    const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 65%', once: true }, onComplete: runPulse })
    tl.to(items, { autoAlpha: 1, y: 0, duration: motionTier.standardMax, ease: approvedEase.gsapStandard, stagger: 0.06 })
      .to(lines, { strokeDashoffset: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapCinematic, stagger: 0.1 }, 0.2)
    return () => { tl.kill(); pulse?.kill() }
  })
})
onBeforeUnmount(() => pulse?.kill())
</script>

<template>
  <section id="devices" ref="sectionRef" data-header-theme="dark" class="relative overflow-hidden bg-slateNavy py-24 text-pureWhite tablet:py-32">
    <BaseGridLines tone="dark" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="dark" label="Devices" meta="Enterprise add-on" />
      <div class="mt-14 desktop:mt-20">
        <ShiftlyHeading surface="dark" :eyebrow="devices.eyebrow" :title="devices.headline" :lede="devices.body" />
      </div>

      <!-- Desktop diagram -->
      <div class="mt-16 hidden grid-cols-12 items-center gap-8 desktop:grid">
        <ul class="col-span-4 flex flex-col gap-3" aria-label="Supported device types">
          <li class="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.5)]" aria-hidden="true">Select a device ↓</li>
          <li v-for="(d, i) in devices.items" :key="d.id" data-dv-item>
            <button
              type="button"
              :aria-pressed="active === i"
              class="flex w-full items-center gap-4 rounded-[16px] px-5 py-4 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pastiYellow-500"
              :class="active === i ? 'bg-pureWhite text-slateNavy' : 'bg-[color:rgba(255,255,255,0.06)] text-pureWhite ring-1 ring-[color:rgba(255,255,255,0.12)] hover:bg-[color:rgba(255,255,255,0.1)]'"
              @click="active = i"
              @mouseenter="active = i"
              @focus="active = i"
            >
              <span class="grid h-11 w-11 shrink-0 place-items-center rounded-[12px]" :class="active === i ? 'bg-pastiYellow-500 text-slateNavy' : 'bg-[color:rgba(255,255,255,0.08)] text-pastiYellow-500'">
                <ShiftlyIcon :name="d.id" class="h-6 w-6" />
              </span>
              <span class="flex-1 font-display text-[18px] font-bold">{{ d.name }}</span>
              <svg viewBox="0 0 16 16" class="h-4 w-4 shrink-0" :class="active === i ? 'text-slateNavy' : 'text-pastiYellow-500'" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
            </button>
          </li>
        </ul>

        <svg viewBox="0 0 440 340" class="col-span-4 h-auto w-full" fill="none" aria-hidden="true">
          <g v-for="(y, i) in ys" :key="y">
            <path :ref="(el) => { if (el) lineRefs[i] = el as SVGPathElement }" data-dv-line :d="`M0 ${y} C 200 ${y}, 240 170, 440 170`" :stroke="active === i ? '#FBBA00' : 'rgba(255,255,255,0.2)'" :stroke-width="active === i ? 2.5 : 1.5" style="transition: stroke 0.3s" />
            <circle :ref="(el) => { if (el) pulseRefs[i] = el as SVGCircleElement }" cx="0" :cy="y" r="5" fill="#FBBA00" :opacity="active === i ? 1 : 0" />
          </g>
        </svg>

        <div class="col-span-4">
          <div data-dv-item class="rounded-[24px] bg-pureWhite p-7 text-slateNavy shadow-[0_40px_80px_-40px_rgba(0,8,16,0.9)]">
            <ShiftlyMark :size="20" />
            <p class="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.55)]">Real-time sync · Centralized monitoring</p>
            <h3 class="mt-5 font-display text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-slateNavy">{{ devices.items[active]!.name }}</h3>
            <p class="mt-2 text-[15px] leading-relaxed text-[color:rgba(3,60,89,0.75)]" aria-live="polite">{{ devices.items[active]!.body }}</p>
          </div>
          <p class="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.5)]">{{ devices.note }}</p>
        </div>
      </div>

      <!-- Below desktop: vertical list into SHIFTLY -->
      <div class="mt-12 desktop:hidden">
        <ul class="relative flex flex-col gap-3 border-l-2 border-pastiYellow-500 pl-5">
          <li v-for="d in devices.items" :key="d.id" data-dv-item class="rounded-[16px] bg-[color:rgba(255,255,255,0.06)] p-5 ring-1 ring-[color:rgba(255,255,255,0.12)]">
            <p class="flex items-center gap-3 font-display text-[18px] font-bold"><ShiftlyIcon :name="d.id" class="h-6 w-6 text-pastiYellow-500" />{{ d.name }}</p>
            <p class="mt-2 text-[14px] leading-relaxed text-[color:rgba(255,255,255,0.75)]">{{ d.body }}</p>
          </li>
        </ul>
        <div class="mt-3 flex items-center gap-3 rounded-[16px] bg-pureWhite px-5 py-4">
          <ShiftlyIcon name="check" class="h-5 w-5 text-pastiYellow-500" />
          <span class="text-[14px] font-semibold text-slateNavy">Synced to</span>
          <ShiftlyMark :size="17" />
        </div>
        <p class="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.5)]">{{ devices.note }}</p>
      </div>

      <!-- Benefits -->
      <ul class="mt-16 grid gap-px overflow-hidden rounded-[20px] bg-[color:rgba(255,255,255,0.12)] tablet:grid-cols-2 desktop:mt-20 desktop:grid-cols-4">
        <li v-for="b in devices.benefits" :key="b.name" data-dv-item class="bg-slateNavy p-6 tablet:p-7">
          <h3 class="font-display text-[19px] font-bold text-pureWhite">{{ b.name }}</h3>
          <p class="mt-2 text-[14px] leading-relaxed text-[color:rgba(255,255,255,0.72)]">{{ b.body }}</p>
        </li>
      </ul>
    </BaseContainer>
  </section>
</template>
