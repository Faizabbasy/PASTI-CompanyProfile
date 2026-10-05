<script setup lang="ts">
// CORE SOLUTIONS — the six OPEN modules as an editorial index. e-Procurement
// is 01 and the primary solution (open by default, the only one with the
// brief's subtitle, USP and capability list) — but it sits in the list as one
// module among six, never as the page's definition.
// Desktop: list left (sticky), panel right swaps per module with a crop-shift.
// Below desktop: accordion. Capabilities that are also full modules (Vendor /
// Contract Management) cross-link to them.
const { modules, capabilityModule } = useOpen()
const { requestDemo } = useOpenDemo()
const active = useState<string>('open-active-module', () => 'e-procurement')

const current = computed(() => modules.find((m) => m.id === active.value) ?? modules[0]!)
const toggle = (id: string) => {
  active.value = active.value === id ? '' : id
}

const sectionRef = ref<HTMLElement | null>(null)

</script>

<template>
  <section id="solutions" ref="sectionRef" class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 85%; --lift-y: 15%">
    <BaseGridLines tone="light" />
    <div aria-hidden="true" class="open-glow pointer-events-none absolute -right-[14%] top-[28%] h-[46vw] max-h-[640px] w-[46vw] max-w-[640px] opacity-70" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Core solutions" meta="04 / 11" />

      <OpenHeading class="mt-10 desktop:mt-12" eyebrow="Inside OPEN" before="Core " mark="Solutions" />

      <!-- Desktop: index + panel -->
      <div class="mt-14 hidden desktop:grid desktop:grid-cols-12 desktop:gap-10">
        <ul class="col-span-5 self-start desktop:sticky desktop:top-28" role="tablist" aria-label="OPEN modules">
          <li v-for="m in modules" :key="m.id" class="relative border-t border-[color:rgba(3,60,89,0.14)] last:border-b">
            <span aria-hidden="true" class="absolute -top-px left-0 h-[2px] origin-left bg-pastiYellow-500 transition-transform duration-500 ease-editorial" :class="active === m.id ? 'w-full scale-x-100' : 'w-full scale-x-0'" />
            <button
              type="button"
              role="tab"
              :aria-selected="active === m.id"
              class="group flex w-full items-baseline gap-5 py-5 text-left"
              @click="active = m.id"
              @mouseenter="active = m.id"
            >
              <span class="font-mono text-[12px] tabular-nums transition-colors duration-300" :class="active === m.id ? 'text-slateNavy' : 'text-[color:rgba(3,60,89,0.4)]'">{{ m.index }}</span>
              <span
                class="flex-1 font-display font-bold leading-[1.05] tracking-[-0.025em] transition-[color,transform] duration-500 ease-editorial"
                :class="[m.primary ? 'text-[34px]' : 'text-[26px]', active === m.id ? 'translate-x-2 text-slateNavy' : 'text-[color:rgba(3,60,89,0.42)] group-hover:text-slateNavy']"
              >{{ m.title }}</span>
              <span v-if="m.primary" class="rounded-full bg-pastiYellow-500 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slateNavy">Primary</span>
            </button>
          </li>
        </ul>

        <div class="relative col-span-7">
          <Transition name="md-swap" mode="out-in">
            <article :key="current.id" role="tabpanel" class="rounded-[28px] border border-[color:rgba(3,60,89,0.08)] bg-pureWhite p-6 shadow-[0_50px_100px_-60px_rgba(3,60,89,0.6)] wide:p-8">
              <OpenFragment :title="current.title" :seed="Number(current.index)" class="h-[240px] !shadow-none" />
              <div class="mt-7 grid grid-cols-7 gap-8">
                <div class="col-span-4">
                  <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.5)]">Module {{ current.index }}</span>
                  <h3 class="mt-2 font-display text-[36px] font-extrabold leading-[1.02] tracking-[-0.03em] text-slateNavy">{{ current.title }}</h3>
                  <p v-if="current.subtitle" class="mt-2 font-display text-[18px] font-semibold text-[color:rgba(3,60,89,0.75)]">{{ current.subtitle }}</p>
                  <p v-if="current.usp" class="mt-5 inline-block rounded-[6px] bg-pastiYellow-500 px-3 py-1.5 font-display text-[16px] font-bold text-slateNavy">{{ current.usp }}</p>
                  <p class="mt-5 text-[15px] leading-relaxed text-[color:rgba(3,60,89,0.72)]">{{ current.body }}</p>
                  <button type="button" class="group mt-6 inline-flex min-h-11 items-center gap-2 font-display text-[15px] font-bold text-slateNavy" @click="requestDemo(current.id)">
                    Request Demo
                    <svg viewBox="0 0 16 16" class="h-4 w-4 transition-transform duration-300 ease-editorial group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
                  </button>
                </div>
                <div class="col-span-3">
                  <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.5)]">Capabilities</span>
                  <ul class="mt-3">
                    <li v-for="c in current.capabilities" :key="c" class="flex items-center gap-2.5 border-b border-[color:rgba(3,60,89,0.08)] py-2.5 text-[14px] font-semibold text-slateNavy">
                      <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-pastiYellow-500" />
                      <button v-if="capabilityModule[c] && current.primary" type="button" class="group inline-flex items-center gap-1.5 text-left underline decoration-[color:rgba(3,60,89,0.25)] underline-offset-4 hover:decoration-slateNavy" @click="active = capabilityModule[c]!">
                        {{ c }}<span class="font-mono text-[10px] text-[color:rgba(3,60,89,0.5)]">full module ↗</span>
                      </button>
                      <span v-else>{{ c }}</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="mt-6 flex items-center justify-between border-t border-[color:rgba(3,60,89,0.08)] pt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.45)]">
                <span>{{ current.index }} / {{ String(modules.length).padStart(2, '0') }}</span>
                <LayoutBrandMark surface="light" :height="10" />
              </div>
            </article>
          </Transition>
        </div>
      </div>

      <!-- Below desktop: accordion -->
      <ul class="mt-10 desktop:hidden">
        <li v-for="m in modules" :key="m.id" class="border-t border-[color:rgba(3,60,89,0.14)] last:border-b">
          <button
            type="button"
            class="flex w-full items-start gap-4 py-5 text-left"
            :aria-expanded="active === m.id"
            :aria-controls="`md-panel-${m.id}`"
            @click="toggle(m.id)"
          >
            <span class="mt-2 font-mono text-[12px] tabular-nums text-[color:rgba(3,60,89,0.5)]">{{ m.index }}</span>
            <span class="flex-1">
              <span class="block font-display text-[24px] font-bold leading-[1.1] tracking-[-0.02em] text-slateNavy tablet:text-[30px]">{{ m.title }}</span>
              <span v-if="m.primary" class="mt-2 inline-block rounded-full bg-pastiYellow-500 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slateNavy">Primary</span>
            </span>
            <span
              class="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full transition-[transform,background-color,color] duration-300 ease-editorial"
              :class="active === m.id ? 'rotate-45 bg-pastiYellow-500 text-slateNavy' : 'bg-slateNavy text-pureWhite'"
            >
              <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 2v12M2 8h12" /></svg>
            </span>
          </button>
          <div :id="`md-panel-${m.id}`" class="grid transition-[grid-template-rows] duration-500 ease-editorial" :class="active === m.id ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
            <div class="overflow-hidden">
              <div class="pb-8">
                <OpenFragment :title="m.title" :seed="Number(m.index)" class="h-[200px]" />
                <p v-if="m.subtitle" class="mt-5 font-display text-[18px] font-semibold text-slateNavy">{{ m.subtitle }}</p>
                <p v-if="m.usp" class="mt-3 inline-block rounded-[6px] bg-pastiYellow-500 px-3 py-1.5 font-display text-[15px] font-bold text-slateNavy">{{ m.usp }}</p>
                <p class="mt-4 text-[15px] leading-relaxed text-[color:rgba(3,60,89,0.72)]">{{ m.body }}</p>
                <ul class="mt-4 flex flex-wrap gap-2">
                  <li v-for="c in m.capabilities" :key="c">
                    <button
                      v-if="capabilityModule[c] && m.primary"
                      type="button"
                      class="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-slateNavy px-3 text-[13px] font-semibold text-slateNavy"
                      @click="active = capabilityModule[c]!"
                    >{{ c }} ↗</button>
                    <span v-else class="inline-flex min-h-9 items-center rounded-full bg-[color:rgba(3,60,89,0.06)] px-3 text-[13px] font-semibold text-slateNavy">{{ c }}</span>
                  </li>
                </ul>
                <button type="button" class="mt-5 inline-flex min-h-11 items-center gap-2 font-display text-[15px] font-bold text-slateNavy" @click="requestDemo(m.id)">
                  Request Demo
                  <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </BaseContainer>
  </section>
</template>

<style scoped>
.md-swap-enter-active,
.md-swap-leave-active {
  transition: clip-path 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.md-swap-enter-from {
  clip-path: inset(0 0 0 18%);
  transform: translateX(24px);
}
.md-swap-leave-to {
  clip-path: inset(0 18% 0 0);
  transform: translateX(-16px);
}
[data-reduced-motion='true'] .md-swap-enter-active,
[data-reduced-motion='true'] .md-swap-leave-active {
  transition: none;
}
</style>
