<script setup lang="ts">
// 06 CONSTRAINT-AWARE SCHEDULING (+ advanced production logic, brief §10).
// Hard vs soft explained by doing it: one live toggle on "Material
// readiness" shows the held order (hard) turn into a placed order with a
// logged warning (soft). Then the scope pills and the catalogue of
// constraints — only those the source shows running (useFast filters out
// the COMING SOON ones). Advanced logic is explained as concepts, without
// client parameters.
const { constraints } = useFastPage()
const sectionRef = ref<HTMLElement | null>(null)
const hard = ref(true)
const scope = ref(constraints.scopes[2]!)
useFastReveal(sectionRef)
</script>

<template>
  <section id="constraints" ref="sectionRef" class="relative overflow-hidden bg-pureWhite py-24 tablet:py-32">
    <BaseContainer class="relative z-10">
        <BaseSectionMark surface="light" label="FAST" meta="06 / 12" class="mb-12 desktop:mb-16" />
      <div><FastHeading :eyebrow="constraints.eyebrow" :title="constraints.headline" :lede="constraints.lede" /></div>

      <div class="mt-14 grid gap-6 desktop:grid-cols-12">
        <!-- Live hard / soft demo -->
        <div data-fr class="rounded-[24px] bg-slateNavy p-6 text-pureWhite tablet:p-8 desktop:col-span-5">
          <div class="flex items-center justify-between gap-4">
            <p class="font-display text-[17px] font-bold">Material readiness</p>
            <button
              type="button"
              role="switch"
              :aria-checked="hard"
              class="relative inline-flex h-9 w-[104px] items-center rounded-full p-1 ring-1 ring-[color:rgba(255,255,255,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pastiYellow-500"
              @click="hard = !hard"
            >
              <span class="absolute inset-y-1 w-[48px] rounded-full bg-pastiYellow-500 transition-transform duration-500 ease-editorial" :class="hard ? 'translate-x-0' : 'translate-x-[48px]'" />
              <span class="relative z-10 w-[48px] text-center font-mono text-[10px] font-bold uppercase" :class="hard ? 'text-slateNavy' : 'text-[color:rgba(255,255,255,0.7)]'">Hard</span>
              <span class="relative z-10 w-[48px] text-center font-mono text-[10px] font-bold uppercase" :class="!hard ? 'text-slateNavy' : 'text-[color:rgba(255,255,255,0.7)]'">Soft</span>
            </button>
          </div>
          <p class="mt-3 text-[14px] leading-relaxed text-[color:rgba(255,255,255,0.72)]">{{ hard ? constraints.modes[0]!.body : constraints.modes[1]!.body }}</p>

          <div class="mt-6 rounded-[16px] bg-[color:rgba(255,255,255,0.06)] p-4 ring-1 ring-[color:rgba(255,255,255,0.1)]">
            <div class="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.55)]">
              <span>PRD-1051 · Op 10</span><span>Line B</span>
            </div>
            <div class="relative mt-3 h-10 rounded-[8px] bg-[color:rgba(255,255,255,0.05)]">
              <span class="absolute inset-y-1.5 left-[30%] w-[38%] rounded-[6px] transition-[opacity,transform] duration-500 ease-editorial" :class="hard ? 'scale-95 border border-dashed border-[color:rgba(255,255,255,0.35)] opacity-60' : 'scale-100 bg-pureWhite opacity-100'" />
            </div>
            <p class="mt-3 flex items-center gap-2 text-[13px] font-semibold" :class="hard ? 'text-[color:rgba(255,255,255,0.85)]' : 'text-pastiYellow-500'">
              <span class="h-1.5 w-1.5 rounded-full" :class="hard ? 'bg-[color:rgba(255,255,255,0.6)]' : 'bg-pastiYellow-500'" />
              {{ hard ? 'Held in the queue — inputs not ready.' : 'Placed — potential breach logged to the Exception Center.' }}
            </p>
          </div>

          <p class="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:rgba(255,255,255,0.55)]">Switch it on or off</p>
          <div role="group" aria-label="Constraint scope" class="mt-2 flex flex-wrap gap-2">
            <button v-for="s in constraints.scopes" :key="s" type="button" :aria-pressed="scope === s" class="min-h-10 rounded-full px-3.5 font-display text-[13px] font-semibold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pastiYellow-500" :class="scope === s ? 'bg-pureWhite text-slateNavy' : 'text-[color:rgba(255,255,255,0.75)] ring-1 ring-[color:rgba(255,255,255,0.2)] hover:text-pureWhite'" @click="scope = s">{{ s }}</button>
          </div>
        </div>

        <!-- Catalogue -->
        <div class="desktop:col-span-7">
          <p data-fr="fade" class="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.55)]">Constraint catalogue · {{ constraints.catalog.length }} rules</p>
          <ul class="mt-4 grid gap-2 tablet:grid-cols-2">
            <li v-for="(c, i) in constraints.catalog" :key="i" data-fr class="flex items-start gap-3 rounded-[14px] bg-surfaceNeutral px-4 py-3">
              <span aria-hidden="true" class="mt-0.5 inline-flex h-5 w-9 shrink-0 items-center justify-end rounded-full bg-slateNavy p-0.5"><span class="h-4 w-4 rounded-full bg-pastiYellow-500" /></span>
              <span>
                <span class="block font-display text-[14px] font-bold text-slateNavy">{{ c.name }}</span>
                <span class="mt-0.5 block text-[12.5px] leading-snug text-[color:rgba(3,60,89,0.65)]">{{ c.body }}</span>
              </span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Advanced production logic -->
      <div class="mt-16 grid gap-8 border-t border-[color:rgba(3,60,89,0.1)] pt-12 desktop:grid-cols-12">
        <div data-fr class="m-center desktop:col-span-4">
          <h3 class="font-display text-[24px] font-bold tracking-[-0.02em] text-slateNavy">{{ constraints.advanced.title }}<span class="text-pastiYellow-500">.</span></h3>
          <p class="mt-2 text-[15px] leading-relaxed text-[color:rgba(3,60,89,0.7)]">{{ constraints.advanced.body }}</p>
        </div>
        <ul class="grid gap-3 tablet:grid-cols-2 desktop:col-span-8">
          <li v-for="(a, i) in constraints.advanced.items" :key="i" data-fr class="rounded-[18px] p-5 ring-1 ring-[color:rgba(3,60,89,0.1)]">
            <span aria-hidden="true" class="flex items-center gap-1">
              <span class="h-[3px] w-6 rounded-full bg-slateNavy" /><span class="h-px w-3 bg-[color:rgba(3,60,89,0.3)]" /><span class="h-[3px] w-4 rounded-full bg-pastiYellow-500" />
            </span>
            <span class="mt-4 block font-display text-[16px] font-bold text-slateNavy">{{ a.name }}</span>
            <span class="mt-1 block text-[13.5px] leading-snug text-[color:rgba(3,60,89,0.68)]">{{ a.body }}</span>
          </li>
        </ul>
      </div>
    </BaseContainer>
  </section>
</template>
