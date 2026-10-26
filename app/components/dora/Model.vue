<script setup lang="ts">
// 09 CONFIGURABLE DOCUMENT MODEL — "Different documents. Different fields.
// One configurable core." Three sample configurations (clearly labelled as
// samples — no document type is promised as prebuilt) switch the template
// card: fields with required flag and validation rule, statuses, review
// path, search and export fields. The core strip underneath never changes.
// Tabs follow the WAI-ARIA tabs pattern (arrow keys move between them).
const { model } = useDoraPage()
const sectionRef = ref<HTMLElement | null>(null)
const picked = ref(0)
const type = computed(() => model.types[picked.value]!)
useFastReveal(sectionRef)

const tabRefs = ref<HTMLButtonElement[]>([])
const onKey = (e: KeyboardEvent) => {
  const n = model.types.length
  const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
  if (!d) return
  e.preventDefault()
  picked.value = (picked.value + d + n) % n
  tabRefs.value[picked.value]?.focus()
}
</script>

<template>
  <section ref="sectionRef" class="relative bg-surfaceNeutral py-24 tablet:py-32">
    <BaseGridLines tone="light" edge="top" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="DORA" meta="09 / 13" class="mb-12 desktop:mb-16" />
      <DoraHeading :eyebrow="model.eyebrow" :title="model.headline" :lede="model.lede" />

      <div data-fr class="mt-12">
        <div role="tablist" aria-label="Sample document types" class="m-center-row flex flex-wrap gap-2" @keydown="onKey">
          <button
            v-for="(t, i) in model.types"
            :id="`dmo-tab-${t.id}`"
            :key="t.id"
            ref="tabRefs"
            type="button"
            role="tab"
            :aria-selected="picked === i"
            :aria-controls="`dmo-panel`"
            :tabindex="picked === i ? 0 : -1"
            class="inline-flex min-h-11 items-center gap-2.5 rounded-full px-5 font-display text-[14px] font-bold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pastiYellow-500"
            :class="picked === i ? 'bg-slateNavy text-pureWhite' : 'bg-pureWhite text-slateNavy ring-1 ring-[color:rgba(3,60,89,0.14)] hover:ring-slateNavy'"
            @click="picked = i"
          >
            <span class="font-mono text-[10px] uppercase opacity-60">Type {{ t.id.toUpperCase() }}</span>{{ t.name }}
          </button>
        </div>

        <div id="dmo-panel" role="tabpanel" :aria-labelledby="`dmo-tab-${type.id}`" class="mt-6">
          <Transition name="dmo" mode="out-in">
            <div :key="type.id" class="grid gap-3 desktop:grid-cols-12">
              <!-- Field template -->
              <div class="rounded-[22px] bg-pureWhite p-5 ring-1 ring-[color:rgba(3,60,89,0.1)] tablet:p-6 desktop:col-span-7">
                <p class="flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.6)]"><span>Field template</span><span>{{ type.fields.length }} fields</span></p>
                <ul class="mt-4 divide-y divide-[color:rgba(3,60,89,0.08)]">
                  <li v-for="f in type.fields" :key="f.name" class="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-3 tablet:grid-cols-[1fr_7rem_7rem]">
                    <span class="font-display text-[15.5px] font-bold text-slateNavy">{{ f.name }}</span>
                    <span class="justify-self-end rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] tablet:justify-self-start" :class="f.required ? 'bg-slateNavy text-pureWhite' : 'bg-[color:rgba(3,60,89,0.07)] text-[color:rgba(3,60,89,0.7)]'">{{ f.required ? 'Required' : 'Optional' }}</span>
                    <span class="col-span-2 text-[13px] text-[color:rgba(3,60,89,0.65)] tablet:col-span-1">Rule · {{ f.rule }}</span>
                  </li>
                </ul>
              </div>
              <!-- Workflow + outputs -->
              <dl class="grid gap-3 desktop:col-span-5">
                <div class="rounded-[22px] bg-slateNavy p-5 text-pureWhite tablet:p-6">
                  <dt class="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.6)]">Statuses · {{ type.path }}</dt>
                  <dd class="mt-3 flex flex-wrap items-center gap-1.5">
                    <template v-for="s in type.statuses" :key="s">
                      <span class="rounded-full bg-[color:rgba(255,255,255,0.08)] px-3 py-1.5 font-display text-[12.5px] font-semibold">{{ s }}</span>
                      <svg viewBox="0 0 12 12" class="h-3 w-3 text-doraCyan" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 6h7M6.5 3 9.5 6l-3 3" /></svg>
                    </template>
                    <span class="inline-flex overflow-hidden rounded-full ring-1 ring-[color:rgba(255,255,255,0.22)]">
                      <span v-for="(o, i) in type.outcomes" :key="o" class="px-3 py-1.5 font-display text-[12.5px] font-semibold" :class="i ? 'border-l border-[color:rgba(255,255,255,0.22)]' : ''">{{ o }}</span>
                    </span>
                    <span class="sr-only">— final status, as configured</span>
                  </dd>
                </div>
                <div class="rounded-[22px] bg-pureWhite p-5 ring-1 ring-[color:rgba(3,60,89,0.1)] tablet:p-6">
                  <dt class="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.6)]">Search fields</dt>
                  <dd class="mt-2.5 flex flex-wrap gap-1.5"><span v-for="s in type.search" :key="s" class="rounded-full bg-surfaceNeutral px-3 py-1 text-[13px] font-semibold text-slateNavy ring-1 ring-[color:rgba(3,60,89,0.1)]">{{ s }}</span></dd>
                  <dt class="mt-5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.6)]">Export fields</dt>
                  <dd class="mt-2.5 flex flex-wrap gap-1.5"><span v-for="s in type.export" :key="s" class="rounded-full bg-surfaceNeutral px-3 py-1 text-[13px] font-semibold text-slateNavy ring-1 ring-[color:rgba(3,60,89,0.1)]">{{ s }}</span></dd>
                </div>
              </dl>
            </div>
          </Transition>
        </div>

        <!-- The constant -->
        <div class="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border-2 border-slateNavy px-5 py-4">
          <span class="inline-flex items-center gap-3 font-display text-[15px] font-bold text-slateNavy"><DoraMark :size="15" /> One core for every type</span>
          <span class="text-[13px] text-[color:rgba(3,60,89,0.65)]">Intake · OCR · extraction · verification · search · export</span>
        </div>
        <p class="m-center mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.5)]">{{ model.note }}</p>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.dmo-enter-active,
.dmo-leave-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.dmo-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.dmo-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
@media (prefers-reduced-motion: reduce) {
  .dmo-enter-active,
  .dmo-leave-active {
    transition: none;
  }
}
</style>
