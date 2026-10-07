<script setup lang="ts">
import gsap from 'gsap'

// MODULE EXPLORER (deck slides 3 + 6). Not a wall of equal cards: four
// module groups as tabs; inside a group, the modules are a list and the
// selected one opens in a detail panel next to the real mobile app screen
// (the employee side of the platform). Keyboard: ←/→ between groups,
// ↑/↓ between modules. Below desktop the groups become an accordion with
// every module listed. Reduced motion: no transitions.
const { moduleGroups, modulesMore, hero } = useShiftly()
const group = ref(0)
const mod = ref(0)
const panelRef = ref<HTMLElement | null>(null)
const tabRefs = ref<HTMLElement[]>([])
const modRefs = ref<HTMLElement[]>([])
const openAcc = ref<string | null>(moduleGroups[0]!.id)

const current = computed(() => moduleGroups[group.value]!)
const active = computed(() => current.value.modules[mod.value]!)
const total = moduleGroups.reduce((n, g) => n + g.modules.length, 0)

const setGroup = (i: number, focus = false) => {
  group.value = (i + moduleGroups.length) % moduleGroups.length
  mod.value = 0
  if (focus) tabRefs.value[group.value]?.focus()
}
const onTabKey = (e: KeyboardEvent, i: number) => {
  const map: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: moduleGroups.length - 1 }
  if (!(e.key in map)) return
  e.preventDefault()
  setGroup(map[e.key]!, true)
}
const onModKey = (e: KeyboardEvent, i: number) => {
  const n = current.value.modules.length
  const map: Record<string, number> = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: n - 1 }
  if (!(e.key in map)) return
  e.preventDefault()
  mod.value = (map[e.key]! + n) % n
  nextTick(() => modRefs.value[mod.value]?.focus())
}

watch([group, mod], async () => {
  await nextTick()
  const p = panelRef.value
  if (!p || window.matchMedia(reducedMotionQuery.reduce).matches) return
  gsap.fromTo(p.querySelectorAll('[data-md-anim]'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: motionTier.standardMax, ease: approvedEase.gsapStandard, stagger: 0.05, overwrite: true })
})
</script>

<template>
  <section id="modules" data-header-theme="dark" class="relative overflow-hidden bg-slateNavy py-24 text-pureWhite tablet:py-32">
    <BaseGridLines tone="dark" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="dark" label="Modules" :meta="`${total} modules · 4 groups`" />
      <div class="mt-14 grid items-end gap-8 desktop:mt-20 desktop:grid-cols-12">
        <div class="desktop:col-span-7">
          <ShiftlyHeading surface="dark" eyebrow="All-in-one HRIS platform" title="Complete modules, seamless experience." lede="SHIFTLY provides comprehensive HR modules to streamline every people process in one integrated platform." />
        </div>
        <p class="m-center font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.5)] desktop:col-span-5 desktop:text-right">{{ modulesMore }}</p>
      </div>

      <!-- DESKTOP explorer -->
      <div class="mt-14 hidden desktop:block">
        <div role="tablist" aria-label="Module groups" class="grid grid-cols-4 border-b border-[color:rgba(255,255,255,0.14)]">
          <button
            v-for="(g, i) in moduleGroups"
            :id="`md-tab-${g.id}`"
            :key="g.id"
            :ref="(el) => { if (el) tabRefs[i] = el as HTMLElement }"
            type="button"
            role="tab"
            :aria-selected="group === i"
            :aria-controls="`md-panel-${g.id}`"
            :tabindex="group === i ? 0 : -1"
            class="relative flex items-baseline gap-3 rounded-t-[12px] px-3 py-5 text-left transition-colors duration-300 hover:bg-[color:rgba(255,255,255,0.05)] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pastiYellow-500"
            :class="group === i ? 'text-pureWhite' : 'text-[color:rgba(255,255,255,0.5)] hover:text-pureWhite'"
            @click="setGroup(i)"
            @keydown="onTabKey($event, i)"
          >
            <span class="font-mono text-[11px]" :class="group === i ? 'text-pastiYellow-500' : ''">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="font-display text-[18px] font-bold tracking-[-0.01em]">{{ g.label }}</span>
            <span class="font-mono text-[10px] text-[color:rgba(255,255,255,0.4)]">{{ g.modules.length }}</span>
            <span aria-hidden="true" class="absolute inset-x-0 -bottom-px h-[3px] origin-left bg-pastiYellow-500 transition-transform duration-500 ease-editorial" :class="group === i ? 'scale-x-100' : 'scale-x-0'" />
          </button>
        </div>

        <div :id="`md-panel-${current.id}`" role="tabpanel" :aria-labelledby="`md-tab-${current.id}`" class="mt-10 grid grid-cols-12 gap-10">
          <ul class="col-span-4" aria-label="Modules">
            <li class="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.45)]" aria-hidden="true">Click a module ↓</li>
            <li v-for="(m, i) in current.modules" :key="m.name">
              <button
                :ref="(el) => { if (el) modRefs[i] = el as HTMLElement }"
                type="button"
                :aria-pressed="mod === i"
                class="group mb-1.5 flex w-full items-center gap-4 rounded-[14px] px-4 py-3.5 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pastiYellow-500"
                :class="mod === i ? 'bg-pastiYellow-500' : 'bg-[color:rgba(255,255,255,0.05)] ring-1 ring-[color:rgba(255,255,255,0.1)] hover:bg-[color:rgba(255,255,255,0.1)]'"
                @click="mod = i"
                @mouseenter="mod = i"
                @keydown="onModKey($event, i)"
              >
                <span class="font-mono text-[10px]" :class="mod === i ? 'text-slateNavy' : 'text-[color:rgba(255,255,255,0.4)]'">{{ String(i + 1).padStart(2, '0') }}</span>
                <span class="flex-1 font-display text-[18px] font-bold tracking-[-0.01em] transition-colors duration-300" :class="mod === i ? 'text-slateNavy' : 'text-[color:rgba(255,255,255,0.8)] group-hover:text-pureWhite'">{{ m.name }}</span>
                <svg viewBox="0 0 16 16" class="h-4 w-4 shrink-0 transition-transform duration-300 ease-editorial group-hover:translate-x-0.5" :class="mod === i ? 'text-slateNavy' : 'text-pastiYellow-500'" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </button>
            </li>
          </ul>

          <div ref="panelRef" class="col-span-5 self-center" aria-live="polite">
            <p data-md-anim class="font-mono text-[11px] uppercase tracking-[0.18em] text-pastiYellow-500">{{ current.label }}</p>
            <h3 data-md-anim class="mt-3 text-pureWhite font-display text-[clamp(34px,3.2vw,48px)] font-extrabold leading-[1.02] tracking-[-0.035em]">{{ active.name }}</h3>
            <p data-md-anim class="mt-4 max-w-[40ch] text-token-body-large leading-relaxed text-[color:rgba(255,255,255,0.78)]">{{ active.body }}</p>
            <p data-md-anim class="mt-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] ring-1" :class="active.standard ? 'text-pureWhite ring-[color:rgba(255,255,255,0.25)]' : 'text-pastiYellow-500 ring-pastiYellow-500'">
              <ShiftlyIcon :name="active.standard ? 'check' : 'plus'" class="h-3.5 w-3.5" />
              {{ active.standard ? 'In SHIFTLY Standard' : 'Additional module' }}
            </p>
          </div>

          <figure class="col-span-3 justify-self-end">
            <div class="w-[200px] overflow-hidden rounded-[26px] border-[5px] border-[#0b1620] bg-pureWhite shadow-[0_40px_70px_-30px_rgba(0,8,16,0.9)]">
              <img :src="hero.mobile.src" :alt="hero.mobile.alt" width="262" height="576" loading="lazy" class="block h-auto w-full" draggable="false">
            </div>
            <figcaption class="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(255,255,255,0.5)]">Employee mobile app</figcaption>
          </figure>
        </div>
      </div>

      <!-- BELOW DESKTOP: grouped accordion -->
      <ol class="mt-12 border-b border-[color:rgba(255,255,255,0.14)] desktop:hidden">
        <li v-for="(g, i) in moduleGroups" :key="g.id" class="border-t border-[color:rgba(255,255,255,0.14)]">
          <h3 class="text-pureWhite">
            <button
              :id="`md-acc-${g.id}`"
              type="button"
              class="flex w-full items-center gap-4 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pastiYellow-500"
              :aria-expanded="openAcc === g.id"
              :aria-controls="`md-acc-panel-${g.id}`"
              @click="openAcc = openAcc === g.id ? null : g.id"
            >
              <span class="font-mono text-[11px]" :class="openAcc === g.id ? 'text-pastiYellow-500' : 'text-[color:rgba(255,255,255,0.45)]'">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="flex-1 font-display text-[22px] font-bold tracking-[-0.02em]">{{ g.label }}</span>
              <span class="font-mono text-[10px] text-[color:rgba(255,255,255,0.45)]">{{ g.modules.length }}</span>
              <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full transition-[transform,background-color,color] duration-300" :class="openAcc === g.id ? 'rotate-45 bg-pastiYellow-500 text-slateNavy' : 'bg-[color:rgba(255,255,255,0.1)]'">
                <ShiftlyIcon name="plus" class="h-4 w-4" />
              </span>
            </button>
          </h3>
          <div :id="`md-acc-panel-${g.id}`" role="region" :aria-labelledby="`md-acc-${g.id}`" class="grid transition-[grid-template-rows] duration-500 ease-editorial motion-reduce:transition-none" :class="openAcc === g.id ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'" :inert="openAcc !== g.id">
            <ul class="min-w-0 overflow-hidden">
              <li v-for="m in g.modules" :key="m.name" class="border-t border-[color:rgba(255,255,255,0.08)] py-4 pl-8 last:mb-5">
                <p class="flex flex-wrap items-center gap-2 font-display text-[17px] font-bold">{{ m.name }}
                  <span v-if="!m.standard" class="rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-pastiYellow-500 ring-1 ring-pastiYellow-500">Additional</span>
                </p>
                <p class="mt-1 text-[14px] leading-relaxed text-[color:rgba(255,255,255,0.72)]">{{ m.body }}</p>
              </li>
            </ul>
          </div>
        </li>
      </ol>
    </BaseContainer>
  </section>
</template>
