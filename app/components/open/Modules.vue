<script setup lang="ts">
// CORE ECOSYSTEMS (slides 9, 10, 12, 13) — exactly three: Procurement,
// Vendor Management, Catalog Management. One explorer, not a card grid:
// three wide tabs (ARIA tabs, arrow keys, roving tabindex) over a panel that
// draws each ecosystem in its own form — Procurement as the 12-step
// workflow + the method switcher, Vendor as a nine-step lifecycle, Catalog as
// two catalog types and the record every purchase is controlled over.
// Panels stay in the DOM (v-show) so all content is indexable. The
// ecosystem dial and other CTAs can open a tab (useOpenDemo.openModule).
const { modulesIntro, procurement, vendor, catalog } = useOpen()
const { activeModule, requestDemo, scrollTo } = useOpenDemo()
const tabs = [procurement, vendor, catalog]
const contractCat = catalog.types[0]!
const shopCat = catalog.types[1]!
const shopFlow = shopCat.flow ?? []
const contractPoints = contractCat.points ?? []

const tabRefs = ref<HTMLElement[]>([])
const onKey = (e: KeyboardEvent, i: number) => {
  const map: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, Home: -i, End: tabs.length - 1 - i }
  if (!(e.key in map)) return
  e.preventDefault()
  const next = (i + map[e.key]! + tabs.length) % tabs.length
  activeModule.value = tabs[next]!.id
  tabRefs.value[next]?.focus()
}
</script>

<template>
  <section id="modules" class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 15%; --lift-y: 5%">
    <BaseContainer>
      <OpenTag :n="6" label="Core ecosystems" />
      <div class="mt-14 grid gap-8 desktop:grid-cols-12 desktop:items-end">
        <OpenHeading class="desktop:col-span-7" :lines="modulesIntro.title" size="lg" />
        <p class="max-w-[30rem] text-[16px] leading-[1.65] text-[color:rgba(3,60,89,0.78)] desktop:col-span-5">{{ modulesIntro.body }}</p>
      </div>

      <!-- Tabs -->
      <div role="tablist" aria-label="Core ecosystems OPEN" class="op-rail -mx-[4vw] mt-12 flex gap-2 overflow-x-auto px-[4vw] tablet:mx-0 tablet:grid tablet:grid-cols-3 tablet:overflow-visible tablet:px-0">
        <button
          v-for="(t, i) in tabs"
          :id="`tab-${t.id}`"
          :key="t.id"
          ref="tabRefs"
          type="button"
          role="tab"
          :aria-selected="activeModule === t.id"
          :aria-controls="`panel-${t.id}`"
          :tabindex="activeModule === t.id ? 0 : -1"
          class="group relative min-w-[240px] shrink-0 overflow-hidden rounded-[20px] border p-5 text-left transition-[background-color,border-color,color] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pastiYellow-500 tablet:min-w-0 tablet:p-6"
          :class="activeModule === t.id ? 'border-slateNavy bg-slateNavy text-pureWhite' : 'border-[color:rgba(3,60,89,0.14)] bg-pureWhite text-slateNavy hover:border-slateNavy'"
          @click="activeModule = t.id"
          @keydown="onKey($event, i)"
        >
          <span class="op-num font-display text-[14px] font-bold" :class="activeModule === t.id ? 'text-pastiYellow-500' : 'text-[color:rgba(3,60,89,0.45)]'">{{ t.index }}</span>
          <span class="mt-6 block font-display text-[length:clamp(22px,2.2vw,30px)] font-extrabold leading-[1.05] tracking-[-0.025em]">{{ t.label }}</span>
          <span class="mt-2 block text-[13.5px]" :class="activeModule === t.id ? 'text-[color:rgba(255,255,255,0.7)]' : 'text-[color:rgba(3,60,89,0.6)]'">{{ t.tagline }}</span>
          <span aria-hidden="true" class="absolute bottom-0 left-0 h-[4px] w-full origin-left bg-pastiYellow-500 transition-transform duration-500 ease-editorial" :class="activeModule === t.id ? 'scale-x-100' : 'scale-x-0'" />
        </button>
      </div>

      <!-- Procurement -->
      <div v-show="activeModule === 'procurement'" id="panel-procurement" role="tabpanel" aria-labelledby="tab-procurement" tabindex="0" class="mt-10 focus-visible:outline-none">
        <div class="grid gap-12 desktop:grid-cols-12 desktop:gap-10">
          <div class="desktop:col-span-4">
            <h3 class="op-display text-[length:clamp(30px,3.2vw,46px)] text-slateNavy">{{ procurement.title[0] }} <span class="text-[color:rgba(3,60,89,0.42)]">{{ procurement.title[1] }}</span></h3>
            <p class="mt-5 text-[15.5px] leading-[1.65] text-[color:rgba(3,60,89,0.78)]">{{ procurement.body }}</p>
            <ul class="mt-7 border-t border-[color:rgba(3,60,89,0.12)]">
              <li v-for="c in procurement.capabilities" :key="c" class="flex items-center justify-between gap-3 border-b border-[color:rgba(3,60,89,0.12)] py-3">
                <span class="text-[15px] font-semibold text-slateNavy">{{ c }}</span>
                <button v-if="c.startsWith('e-Auction')" type="button" class="shrink-0 rounded-full bg-pastiYellow-500 px-2.5 py-1 text-[11.5px] font-bold text-slateNavy" @click="scrollTo('e-auction')">High-value transaction engine</button>
              </li>
            </ul>
            <button type="button" class="group mt-7 inline-flex min-h-11 items-center gap-2 font-display text-[15px] font-bold text-slateNavy" @click="requestDemo('procurement')">
              Request a Demo
              <svg viewBox="0 0 16 16" class="h-4 w-4 transition-transform duration-300 ease-editorial group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
            </button>
          </div>

          <div class="desktop:col-span-8">
            <p class="font-display text-[15px] font-bold text-slateNavy">End-to-end procurement workflow</p>
            <p class="mt-1 text-[14px] text-[color:rgba(3,60,89,0.6)]">Siklus pengadaan yang komprehensif dan terintegrasi dalam satu alur proses.</p>
            <ol class="mt-6 grid grid-cols-2 border-t-2 border-pastiYellow-500 tablet:grid-cols-3 desktop:grid-cols-4">
              <li v-for="(w, i) in procurement.workflow" :key="w.label" class="relative border-b border-r border-[color:rgba(3,60,89,0.1)] px-3 py-4 tablet:px-4 tablet:py-5">
                <span class="op-num font-display text-[12px] font-bold text-[color:rgba(3,60,89,0.45)]">{{ String(i + 1).padStart(2, '0') }}</span>
                <p class="mt-1.5 font-display text-[16.5px] font-extrabold leading-tight tracking-[-0.015em] text-slateNavy" :class="w.label === 'e-Auction' ? 'underline decoration-pastiYellow-500 decoration-[3px] underline-offset-4' : ''">{{ w.label }}</p>
                <p class="mt-1.5 text-[13px] leading-snug text-[color:rgba(3,60,89,0.66)]">{{ w.body }}</p>
              </li>
            </ol>
          </div>
        </div>
        <OpenMethods class="mt-12" />
      </div>

      <!-- Vendor management -->
      <div v-show="activeModule === 'vendor'" id="panel-vendor" role="tabpanel" aria-labelledby="tab-vendor" tabindex="0" class="mt-10 focus-visible:outline-none">
        <div class="grid gap-12 desktop:grid-cols-12 desktop:gap-10">
          <div class="desktop:col-span-4">
            <h3 class="op-display text-[length:clamp(30px,3.2vw,46px)] text-slateNavy">{{ vendor.title[0] }} <span class="text-[color:rgba(3,60,89,0.42)]">{{ vendor.title[1] }}</span></h3>
            <p class="mt-5 text-[15.5px] leading-[1.65] text-[color:rgba(3,60,89,0.78)]">{{ vendor.body }}</p>
            <ul class="mt-7 border-t border-[color:rgba(3,60,89,0.12)]">
              <li v-for="c in vendor.capabilities" :key="c" class="border-b border-[color:rgba(3,60,89,0.12)] py-3 text-[15px] font-semibold text-slateNavy">{{ c }}</li>
            </ul>
          </div>
          <div class="desktop:col-span-8">
            <p class="font-display text-[15px] font-bold text-slateNavy">Vendor lifecycle in OPEN</p>
            <ol class="mt-6 grid grid-cols-2 gap-2 tablet:grid-cols-3">
              <li
                v-for="(s, i) in vendor.lifecycle"
                :key="s.label"
                class="relative rounded-[16px] border p-4 tablet:p-5"
                :class="s.label === 'Blacklist' ? 'border-dashed border-[color:rgba(3,60,89,0.3)] bg-transparent' : 'border-[color:rgba(3,60,89,0.1)] bg-pureWhite'"
              >
                <span class="flex items-center gap-2">
                  <span class="op-num grid h-7 w-7 place-items-center rounded-full font-display text-[11px] font-bold" :class="s.label === 'Blacklist' ? 'border border-slateNavy text-slateNavy' : 'bg-slateNavy text-pastiYellow-500'">{{ String(i + 1).padStart(2, '0') }}</span>
                  <span v-if="i < vendor.lifecycle.length - 1" aria-hidden="true" class="h-px flex-1 bg-[color:rgba(3,60,89,0.15)]" />
                </span>
                <p class="mt-4 font-display text-[17px] font-extrabold tracking-[-0.015em] text-slateNavy">{{ s.label }}</p>
                <p class="mt-1.5 text-[13.5px] leading-snug text-[color:rgba(3,60,89,0.68)]">{{ s.body }}</p>
              </li>
            </ol>
            <div class="mt-6 flex flex-col gap-1 rounded-[16px] bg-[color:rgba(251,186,0,0.14)] p-5 tablet:flex-row tablet:items-center tablet:gap-5">
              <p class="font-display text-[18px] font-extrabold tracking-[-0.015em] text-slateNavy">{{ vendor.line.join(' ') }}</p>
              <p class="text-[14px] text-[color:rgba(3,60,89,0.75)]">{{ vendor.lineBody }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Catalog management -->
      <div v-show="activeModule === 'catalog'" id="panel-catalog" role="tabpanel" aria-labelledby="tab-catalog" tabindex="0" class="mt-10 focus-visible:outline-none">
        <div class="grid gap-12 desktop:grid-cols-12 desktop:gap-10">
          <div class="desktop:col-span-4">
            <h3 class="op-display text-[length:clamp(30px,3.2vw,46px)] text-slateNavy">{{ catalog.title[0] }} <span class="text-[color:rgba(3,60,89,0.42)]">{{ catalog.title[1] }}</span></h3>
            <p class="mt-5 text-[15.5px] leading-[1.65] text-[color:rgba(3,60,89,0.78)]">{{ catalog.body }}</p>
            <ul class="mt-7 border-t border-[color:rgba(3,60,89,0.12)]">
              <li v-for="c in catalog.capabilities" :key="c" class="border-b border-[color:rgba(3,60,89,0.12)] py-3 text-[15px] font-semibold text-slateNavy">{{ c }}</li>
            </ul>
          </div>
          <div class="desktop:col-span-8">
            <div class="grid gap-3 tablet:grid-cols-2">
              <div class="rounded-[20px] border-l-[5px] border-pastiYellow-500 bg-pureWhite p-6 shadow-[0_24px_50px_-40px_rgba(3,60,89,0.6)]">
                <p class="font-display text-[20px] font-extrabold text-slateNavy">{{ contractCat.label }}</p>
                <p class="mt-2 text-[14.5px] leading-relaxed text-[color:rgba(3,60,89,0.72)]">{{ contractCat.body }}</p>
                <ul class="mt-5 space-y-2">
                  <li v-for="p in contractPoints" :key="p" class="flex items-center gap-2.5 text-[14px] font-semibold text-slateNavy"><span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />{{ p }}</li>
                </ul>
              </div>
              <div class="rounded-[20px] border-l-[5px] border-slateNavy bg-pureWhite p-6 shadow-[0_24px_50px_-40px_rgba(3,60,89,0.6)]">
                <p class="font-display text-[20px] font-extrabold text-slateNavy">{{ shopCat.label }}</p>
                <p class="mt-2 text-[14.5px] leading-relaxed text-[color:rgba(3,60,89,0.72)]">{{ shopCat.body }}</p>
                <ol class="mt-5 flex flex-wrap items-center gap-x-1.5 gap-y-2">
                  <template v-for="(f, i) in shopFlow" :key="f">
                    <li class="rounded-full bg-[color:rgba(3,60,89,0.06)] px-3 py-1.5 text-[13px] font-bold text-slateNavy">{{ f }}</li>
                    <li v-if="i < shopFlow.length - 1" aria-hidden="true" class="text-[color:rgba(3,60,89,0.4)]">→</li>
                  </template>
                </ol>
              </div>
            </div>

            <!-- The record every purchase is controlled over -->
            <p class="mt-10 font-display text-[15px] font-bold text-slateNavy">Controlled over</p>
            <dl class="mt-4 overflow-hidden rounded-[20px] border border-[color:rgba(3,60,89,0.12)] bg-pureWhite tablet:grid tablet:grid-cols-5">
              <div v-for="c in catalog.controlled" :key="c.label" class="border-b border-[color:rgba(3,60,89,0.1)] last:border-b-0 tablet:border-b-0 tablet:border-r tablet:last:border-r-0">
                <dt class="bg-slateNavy px-4 py-3 font-display text-[15px] font-extrabold text-pureWhite">{{ c.label }}</dt>
                <dd class="px-4 py-4 text-[13.5px] leading-snug text-[color:rgba(3,60,89,0.75)]">{{ c.body }}</dd>
              </div>
            </dl>
            <p class="mt-4 text-[14px] font-medium text-slateNavy">{{ catalog.controlledLine }}</p>
            <p class="mt-8 font-display text-[length:clamp(22px,2.2vw,30px)] font-extrabold tracking-[-0.02em] text-slateNavy">{{ catalog.line[0] }} <span class="text-[color:rgba(3,60,89,0.42)]">{{ catalog.line[1] }}</span></p>
          </div>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
