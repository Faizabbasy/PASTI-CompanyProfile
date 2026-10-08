<script setup lang="ts">
// VISIBILITY, INTEGRATION & SECURITY (slides 17, 18, 19) — the management
// and IT questions in one section.
// 1. Monitoring: a dashboard rebuilt as UI with the deck's seven views as
//    panels. Shapes only (rings, lines, bars) — no figures; they draw once.
// 2. Integration (navy): OPEN as the hub, the deck's seven targets on two
//    buses (as slide 18), connectors that draw in; hovering or focusing a
//    target lights its path. No vendor logos. Then the three approaches.
// 3. Security & access: the seven measures as a ruled list. No standards or
//    certifications beyond the deck.
const { visibility, integration, security } = useOpen()

const dashRef = ref<HTMLElement | null>(null)
const dashIn = useOpenInView(dashRef, 0.25)
const hubRef = ref<HTMLElement | null>(null)
const hubIn = useOpenInView(hubRef, 0.3)
const hovered = ref<string | null>(null)

const left = integration.targets.slice(0, 4)
const right = integration.targets.slice(4)
type PanelKind = 'ring' | 'line' | 'bars' | 'list'
const kinds: PanelKind[] = ['ring', 'line', 'bars', 'ring', 'ring', 'bars', 'list']
// Ring panels: two arcs (navy, yellow) as % of the ring — shapes, not data.
const arcs = [[58, 22], [0, 0], [0, 0], [46, 30], [70, 14], [0, 0], [0, 0]]
const panels = visibility.items.map((label: string, i: number) => {
  const [a, b] = arcs[i] ?? [0, 0]
  return { label, kind: kinds[i] ?? 'bars', a: a ?? 0, b: b ?? 0 }
})
</script>

<template>
  <section id="integration" class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 20%; --lift-y: 10%">
    <BaseContainer>
      <OpenTag :n="9" label="Visibility, integration & security" />

      <!-- 1 · Monitoring -->
      <div class="mt-14 grid gap-12 desktop:grid-cols-12 desktop:gap-10">
        <div class="desktop:col-span-4">
          <OpenHeading :lines="visibility.title" size="md" :lede="visibility.intro" />
          <ul class="mt-6 border-t border-[color:rgba(3,60,89,0.12)]">
            <li v-for="v in visibility.items" :key="v" class="flex items-center gap-3 border-b border-[color:rgba(3,60,89,0.12)] py-3 text-[15px] font-semibold text-slateNavy"><span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />{{ v }}</li>
          </ul>
          <p class="m-center mt-6 font-display text-[18px] font-extrabold text-slateNavy">{{ visibility.line[0] }} <span class="text-[color:rgba(3,60,89,0.42)]">{{ visibility.line[1] }}</span></p>
        </div>

        <div ref="dashRef" class="desktop:col-span-8" :class="{ 'is-in': dashIn }" aria-hidden="true">
          <div class="overflow-hidden rounded-[24px] border border-[color:rgba(3,60,89,0.12)] bg-[color:#F4F7FA] p-3 shadow-[0_60px_120px_-70px_rgba(3,60,89,0.7)] tablet:p-4">
            <div class="flex items-center justify-between px-2 pb-3 pt-1">
              <span class="flex items-center gap-2 font-display text-[14px] font-extrabold text-slateNavy"><OpenMark :size="16" />Procurement Monitoring Dashboard</span>
              <span class="flex items-center gap-2 text-[11.5px] font-semibold text-[color:rgba(3,60,89,0.6)]"><span class="op-live h-2 w-2 rounded-full bg-pastiYellow-500" />Live</span>
            </div>
            <div class="grid grid-cols-2 gap-2 tablet:grid-cols-3 tablet:gap-2.5">
              <div
                v-for="(p, i) in panels"
                :key="p.label"
                class="flex min-h-[132px] flex-col rounded-[14px] bg-pureWhite p-4"
                :class="p.kind === 'list' ? 'col-span-2' : p.kind === 'line' ? 'tablet:col-span-2' : ''"
              >
                <span class="font-display text-[12.5px] font-bold text-slateNavy">{{ p.label }}</span>
                <div class="mt-auto pt-4">
                  <svg v-if="p.kind === 'ring'" viewBox="0 0 64 64" class="h-16 w-16">
                    <circle cx="32" cy="32" r="24" stroke="rgba(3,60,89,0.08)" stroke-width="9" fill="none" />
                    <circle cx="32" cy="32" r="24" stroke="#033C59" stroke-width="9" fill="none" pathLength="100" stroke-dasharray="100" class="op-chart" :style="{ '--to': 100 - p.a, '--d': `${i * 90}ms` }" transform="rotate(-90 32 32)" />
                    <circle cx="32" cy="32" r="24" stroke="#FBBA00" stroke-width="9" fill="none" pathLength="100" stroke-dasharray="100" class="op-chart" :style="{ '--to': 100 - p.b, '--d': `${i * 90 + 200}ms` }" :transform="`rotate(${-90 + p.a * 3.6} 32 32)`" />
                  </svg>
                  <svg v-else-if="p.kind === 'line'" viewBox="0 0 300 70" preserveAspectRatio="none" class="h-16 w-full">
                    <path d="M0 58 L30 50 L60 54 L90 40 L120 44 L150 30 L180 34 L210 22 L240 26 L270 14 L300 18" fill="none" stroke="#FBBA00" stroke-width="3" pathLength="100" stroke-dasharray="100" class="op-chart" style="--to: 0" />
                    <path d="M0 64 L30 60 L60 62 L90 54 L120 56 L150 48 L180 50 L210 42 L240 44 L270 38 L300 40" fill="none" stroke="rgba(3,60,89,0.35)" stroke-width="2" pathLength="100" stroke-dasharray="100" class="op-chart" style="--to: 0; --d: 150ms" />
                  </svg>
                  <div v-else-if="p.kind === 'bars'" class="space-y-2">
                    <span v-for="w in [86, 64, 72, 40]" :key="w" class="block h-2 rounded-full bg-[color:rgba(3,60,89,0.07)]">
                      <span class="op-draw block h-full rounded-full bg-slateNavy" :style="{ width: `${w}%`, '--d': `${i * 60}ms` }" />
                    </span>
                  </div>
                  <div v-else class="grid grid-cols-2 gap-2 tablet:grid-cols-3">
                    <span v-for="r in 6" :key="r" class="flex items-center gap-2 rounded-[10px] bg-[color:rgba(3,60,89,0.04)] px-3 py-3">
                      <span class="h-2 w-2 shrink-0 rounded-sm bg-pastiYellow-500" />
                      <span class="op-draw block h-1.5 rounded-full bg-[color:rgba(3,60,89,0.18)]" :style="{ width: `${50 + ((r * 13) % 35)}%`, '--d': `${r * 70}ms` }" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p class="mt-3 text-right text-[11px] text-[color:rgba(3,60,89,0.45)]">Ilustrasi antarmuka OPEN</p>
        </div>
      </div>

      <!-- 2 · Integration -->
      <div ref="hubRef" data-header-theme="dark" class="relative isolate mt-24 overflow-hidden rounded-[28px] bg-slateNavy px-5 py-12 text-pureWhite tablet:px-10 tablet:py-14 desktop:mt-32 desktop:px-14 desktop:py-16" :class="{ 'is-in': hubIn }">
        <div aria-hidden="true" class="op-rules--dark pointer-events-none absolute inset-0 -z-10" />
        <div class="grid gap-8 desktop:grid-cols-12 desktop:items-end">
          <OpenHeading class="desktop:col-span-7" :lines="integration.title" surface="dark" size="md" />
          <p class="m-center text-[16px] text-[color:rgba(255,255,255,0.7)] desktop:col-span-4 desktop:col-start-9">{{ integration.intro }}</p>
        </div>

        <div class="mt-12 grid items-center gap-6 desktop:grid-cols-[1fr_200px_1fr] desktop:gap-0">
          <!-- Left bus -->
          <ul class="relative space-y-2 desktop:pr-10">
            <span aria-hidden="true" class="op-drawy absolute bottom-[28px] right-0 top-[28px] hidden w-[2px] bg-[color:rgba(255,255,255,0.22)] desktop:block" style="--d: 300ms" />
            <li v-for="(t, i) in left" :key="t.label" class="relative">
              <button
                type="button"
                class="relative z-10 block w-full rounded-[14px] border p-4 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pastiYellow-500"
                :class="hovered === t.label ? 'border-pastiYellow-500 bg-[color:rgba(251,186,0,0.1)]' : 'border-[color:rgba(255,255,255,0.14)] bg-[color:rgba(255,255,255,0.04)]'"
                @mouseenter="hovered = t.label"
                @mouseleave="hovered = null"
                @focus="hovered = t.label"
                @blur="hovered = null"
              >
                <span class="block font-display text-[16px] font-extrabold">{{ t.label }}</span>
                <span class="mt-1 block text-[13px] text-[color:rgba(255,255,255,0.65)]">{{ t.body }}</span>
              </button>
              <span aria-hidden="true" class="op-draw absolute -right-10 top-1/2 hidden h-[2px] w-10 desktop:block" :class="hovered === t.label ? 'bg-pastiYellow-500' : 'bg-[color:rgba(255,255,255,0.22)]'" :style="{ '--d': `${i * 80}ms` }" />
            </li>
          </ul>

          <!-- Hub -->
          <div class="relative mx-auto flex h-[180px] w-[180px] items-center justify-center desktop:h-[200px] desktop:w-[200px]">
            <span aria-hidden="true" class="op-draw absolute left-0 top-1/2 hidden h-[2px] w-[22px] desktop:block" :class="hovered && left.some((t) => t.label === hovered) ? 'bg-pastiYellow-500' : 'bg-[color:rgba(255,255,255,0.22)]'" />
            <span aria-hidden="true" class="op-draw absolute right-0 top-1/2 hidden h-[2px] w-[22px] desktop:block" :class="hovered && right.some((t) => t.label === hovered) ? 'bg-pastiYellow-500' : 'bg-[color:rgba(255,255,255,0.22)]'" />
            <div class="op-pop grid h-[156px] w-[156px] place-items-center rounded-full border-[10px] border-pastiYellow-500 bg-pureWhite text-center text-slateNavy" style="--d: 400ms">
              <span>
                <span class="block font-display text-[30px] font-extrabold tracking-[-0.04em]">OPEN</span>
                <span class="block text-[11px] font-semibold leading-tight text-[color:rgba(3,60,89,0.7)]">Procurement<br>Ecosystem</span>
              </span>
            </div>
          </div>

          <!-- Right bus -->
          <ul class="relative space-y-2 desktop:pl-10">
            <span aria-hidden="true" class="op-drawy absolute bottom-[28px] left-0 top-[28px] hidden w-[2px] bg-[color:rgba(255,255,255,0.22)] desktop:block" style="--d: 300ms" />
            <li v-for="(t, i) in right" :key="t.label" class="relative">
              <span aria-hidden="true" class="op-draw absolute -left-10 top-1/2 hidden h-[2px] w-10 desktop:block" :class="hovered === t.label ? 'bg-pastiYellow-500' : 'bg-[color:rgba(255,255,255,0.22)]'" :style="{ '--d': `${i * 80}ms` }" />
              <button
                type="button"
                class="relative z-10 block w-full rounded-[14px] border p-4 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pastiYellow-500"
                :class="hovered === t.label ? 'border-pastiYellow-500 bg-[color:rgba(251,186,0,0.1)]' : 'border-[color:rgba(255,255,255,0.14)] bg-[color:rgba(255,255,255,0.04)]'"
                @mouseenter="hovered = t.label"
                @mouseleave="hovered = null"
                @focus="hovered = t.label"
                @blur="hovered = null"
              >
                <span class="block font-display text-[16px] font-extrabold">{{ t.label }}</span>
                <span class="mt-1 block text-[13px] text-[color:rgba(255,255,255,0.65)]">{{ t.body }}</span>
              </button>
            </li>
          </ul>
        </div>

        <div class="m-center m-center-col mt-12 flex flex-col gap-4 border-t border-[color:rgba(255,255,255,0.14)] pt-8 desktop:flex-row desktop:items-center desktop:gap-8">
          <p class="text-[15px] text-[color:rgba(255,255,255,0.65)]">{{ integration.approachesIntro }}:</p>
          <ul class="m-center-row flex flex-wrap gap-2">
            <li v-for="a in integration.approaches" :key="a" class="rounded-full bg-pastiYellow-500 px-4 py-2 font-display text-[15px] font-extrabold text-slateNavy">{{ a }}</li>
          </ul>
        </div>
        <p class="m-center mt-6 max-w-[52rem] text-[15px] leading-relaxed text-[color:rgba(255,255,255,0.72)]">{{ integration.line }}</p>
      </div>

      <!-- 3 · Security -->
      <div class="mt-24 grid gap-12 desktop:mt-32 desktop:grid-cols-12 desktop:gap-10">
        <div class="desktop:col-span-4">
          <OpenHeading :lines="security.title" size="md" :lede="security.intro" />
          <p class="m-center mt-10 font-display text-[length:clamp(22px,2.2vw,30px)] font-extrabold leading-[1.15] tracking-[-0.02em] text-slateNavy">{{ security.quote[0] }}<br><span class="text-[color:rgba(3,60,89,0.42)]">{{ security.quote[1] }}</span></p>
        </div>
        <ul class="grid border-t border-[color:rgba(3,60,89,0.12)] tablet:grid-cols-2 tablet:gap-x-10 desktop:col-span-8">
          <li v-for="s in security.items" :key="s.label" class="flex gap-4 border-b border-[color:rgba(3,60,89,0.12)] py-5">
            <svg viewBox="0 0 20 20" class="mt-0.5 h-5 w-5 shrink-0 text-slateNavy" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M10 2l6.5 2.5v5c0 4-2.8 6.9-6.5 8.5-3.7-1.6-6.5-4.5-6.5-8.5v-5L10 2z" /><path d="M7 10l2.2 2.2L13.5 8" stroke="#D69C00" /></svg>
            <div>
              <p class="font-display text-[17px] font-extrabold text-slateNavy">{{ s.label }}</p>
              <p class="mt-1 text-[14px] leading-snug text-[color:rgba(3,60,89,0.7)]">{{ s.body }}</p>
            </div>
          </li>
        </ul>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.op-chart {
  stroke-dashoffset: calc(var(--to) * 1);
  transition: stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1) var(--d, 0ms);
}
:global(html[data-reduced-motion='false']) .op-chart {
  stroke-dashoffset: 100;
}
:global(html[data-reduced-motion='false']) .is-in .op-chart {
  stroke-dashoffset: var(--to);
}
.op-live {
  animation: op-live 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}
@keyframes op-live {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(251, 186, 0, 0.5);
  }
  60% {
    box-shadow: 0 0 0 6px rgba(251, 186, 0, 0);
  }
}
[data-reduced-motion='true'] .op-live {
  animation: none;
}
</style>
