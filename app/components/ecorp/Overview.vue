<script setup lang="ts">
// PLATFORM OVERVIEW — "a digital operating foundation, not a single workflow
// tool". An interactive system diagram of the brief's core relationship
// (People ↔ Processes ↔ Information ↔ Workflow ↔ Monitoring ↔ Integration):
// six nodes on one foundation bus. Selecting a node (click, tap, focus,
// arrow keys) lights its link to the foundation and its neighbours in the
// chain, and shows its description (temporary copy) in the panel.
// Desktop: diagram + panel. Below desktop: the same tabs as a compact grid
// with the panel underneath — no lines forced onto small screens.
const { nodes, overviewLead, positioning } = useEcorporate()

const active = ref(0)
const top = nodes.slice(0, 3)
const bottom = nodes.slice(3)
const current = computed(() => nodes[active.value]!)
const isNeighbour = (i: number) => Math.abs(i - active.value) === 1

const tabRefs = ref<HTMLElement[]>([])
const onKey = (e: KeyboardEvent) => {
  const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
  if (!dir) return
  e.preventDefault()
  active.value = (active.value + dir + nodes.length) % nodes.length
  nextTick(() => (e.currentTarget as HTMLElement)?.parentElement?.querySelectorAll<HTMLElement>('[role=tab]')[active.value]?.focus())
}
void tabRefs
</script>

<template>
  <section id="overview" class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 15%; --lift-y: 10%">
    <BaseGridLines tone="light" />
    <EcorpMarks label="03 / 12 · System map" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Platform overview" meta="03 / 12" />

      <div class="mt-12 grid gap-8 desktop:grid-cols-12 desktop:items-end">
        <EcorpHeading class="desktop:col-span-7" eyebrow="Platform overview" before="A digital operating " mark="foundation" />
        <p class="m-center max-w-[30rem] text-[16px] leading-relaxed text-[color:rgba(3,60,89,0.76)] desktop:col-span-5 desktop:justify-self-end">{{ positioning[0] }}</p>
      </div>
      <p class="m-center mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.55)]">{{ overviewLead }}</p>

      <div class="mt-12 grid gap-8 desktop:grid-cols-12 desktop:gap-10">
        <!-- Diagram (desktop) -->
        <div class="relative hidden desktop:col-span-7 desktop:block">
          <div class="ec-dots relative border border-[color:rgba(3,60,89,0.12)] bg-pureWhite p-8">
            <span class="absolute left-4 top-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.45)]">System map</span>
            <div role="tablist" aria-label="e-CORPORATE platform elements" class="relative grid grid-cols-3 gap-x-10 gap-y-[120px] pt-6" @keydown="onKey">
              <!-- Horizontal chain links -->
              <span aria-hidden="true" class="absolute left-[16%] right-[16%] top-[calc(1.5rem+28px)] h-px bg-[color:rgba(3,60,89,0.16)]" />
              <span aria-hidden="true" class="absolute bottom-[28px] left-[16%] right-[16%] h-px bg-[color:rgba(3,60,89,0.16)]" />
              <button
                v-for="(n, i) in [...top, ...bottom]"
                :id="`eo-tab-${n.id}`"
                :key="n.id"
                type="button"
                role="tab"
                :aria-selected="active === i"
                aria-controls="eo-panel"
                :tabindex="active === i ? 0 : -1"
                class="eo-node relative z-10 flex h-14 items-center justify-center gap-2 border font-display text-[15px] font-bold transition-[background-color,border-color,color] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pastiYellow-500"
                :class="active === i ? 'border-slateNavy bg-slateNavy text-pureWhite' : isNeighbour(i) ? 'border-pastiYellow-500 bg-pureWhite text-slateNavy' : 'border-[color:rgba(3,60,89,0.18)] bg-pureWhite text-slateNavy hover:border-slateNavy'"
                @click="active = i"
                @mouseenter="active = i"
              >
                <span aria-hidden="true" class="h-1.5 w-1.5" :class="active === i ? 'bg-pastiYellow-500' : 'bg-[color:rgba(3,60,89,0.3)]'" />{{ n.title }}
                <!-- Link to the foundation bus -->
                <span
                  aria-hidden="true"
                  class="absolute left-1/2 w-px transition-colors duration-300"
                  :class="[i < 3 ? 'top-full h-[46px]' : 'bottom-full h-[46px]', active === i ? 'bg-pastiYellow-500' : 'bg-[color:rgba(3,60,89,0.16)]']"
                />
              </button>
              <!-- Foundation bus -->
              <div aria-hidden="true" class="absolute inset-x-0 top-1/2 flex h-[30px] -translate-y-[calc(50%-14px)] items-center justify-center overflow-hidden bg-slateNavy">
                <span class="eo-signal absolute left-0 top-1/2 h-[3px] w-16 -translate-y-1/2 bg-gradient-to-r from-transparent to-pastiYellow-500" />
                <EcorpWordmark surface="dark" class="text-[13px]" /><span class="ml-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:rgba(255,255,255,0.6)]">Operating foundation</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs (below desktop) -->
        <div role="tablist" aria-label="e-CORPORATE platform elements" class="grid grid-cols-2 gap-2 tablet:grid-cols-3 desktop:hidden" @keydown="onKey">
          <button
            v-for="(n, i) in nodes"
            :key="n.id"
            type="button"
            role="tab"
            :aria-selected="active === i"
            aria-controls="eo-panel"
            :tabindex="active === i ? 0 : -1"
            class="flex min-h-12 items-center gap-2 border px-4 font-display text-[15px] font-bold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pastiYellow-500"
            :class="active === i ? 'border-slateNavy bg-slateNavy text-pureWhite' : 'border-[color:rgba(3,60,89,0.18)] bg-pureWhite text-slateNavy'"
            @click="active = i"
          >
            <span aria-hidden="true" class="h-1.5 w-1.5" :class="active === i ? 'bg-pastiYellow-500' : 'bg-[color:rgba(3,60,89,0.3)]'" />{{ n.title }}
          </button>
        </div>

        <!-- Panel -->
        <div id="eo-panel" role="tabpanel" :aria-labelledby="`eo-tab-${current.id}`" class="border-t-2 border-slateNavy pt-6 desktop:col-span-5 desktop:self-center">
          <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.5)]">{{ String(active + 1).padStart(2, '0') }} / {{ String(nodes.length).padStart(2, '0') }}</span>
          <h3 class="mt-3 font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.03em] text-slateNavy tablet:text-[40px]">{{ current.title }}</h3>
          <p class="mt-4 max-w-[26rem] text-[16px] leading-relaxed text-[color:rgba(3,60,89,0.76)]">{{ current.body }}</p>
          <p class="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.55)]">
            <span>Connected to</span>
            <template v-for="(n, i) in nodes" :key="n.id">
              <span v-if="isNeighbour(i)" class="border-b-2 border-pastiYellow-500 pb-0.5 text-slateNavy">{{ n.title }}</span>
            </template>
            <span class="text-slateNavy">· Foundation</span>
          </p>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.eo-signal {
  transform: translate(-100%, -50%);
}
@media (prefers-reduced-motion: no-preference) {
  .eo-signal {
    animation: eo-signal 3.2s cubic-bezier(0.45, 0, 0.2, 1) infinite;
  }
}
@keyframes eo-signal {
  to {
    transform: translate(calc(100vw), -50%);
  }
}
</style>
