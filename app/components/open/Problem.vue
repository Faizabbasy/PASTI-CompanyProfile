<script setup lang="ts">
// PROCUREMENT PROBLEM (slides 2, 3). Part one: the deck's paper pile, told
// with its own words — six sheets ("More people." … "More risks.") fall
// from a scatter into one pile as the section enters, and the five symptoms
// are pinned to it. Then the verdict: "The process works — but the
// visibility doesn't." Part two (navy): the real problem as five questions
// any procurement decision must answer — WHO / WHY / WHEN / WHAT / TRACE.
// All motion is one class switch per part (CSS transitions).
const { problem } = useOpen()

const pileRef = ref<HTMLElement | null>(null)
const pileIn = useOpenInView(pileRef, 0.3)
const qRef = ref<HTMLElement | null>(null)
const qIn = useOpenInView(qRef, 0.3)

// Deterministic scatter → pile (SSR-safe). x/y in %, r in deg.
const sheets = problem.pressures.map((p, i) => ({
  text: p,
  from: [[-60, -80, -24], [70, -60, 18], [-80, 30, 14], [80, 40, -20], [-30, 90, 8], [40, -110, -12]][i]!,
  // Final pile: a cascade (each sheet ~44% of its height lower) so every label stays readable.
  to: [i % 2 ? 2 : -2, i * 44, [-3, 2, -1.5, 2.5, -1, 1][i]!]
}))
</script>

<template>
  <section id="problem" class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 10%; --lift-y: 30%">
    <BaseContainer>
      <OpenTag :n="2" label="The procurement problem" />

      <div class="mt-14 grid items-center gap-16 desktop:grid-cols-12 desktop:gap-10">
        <div class="desktop:col-span-6">
          <OpenHeading :lines="problem.title" size="lg" />
          <p class="m-center mt-6 max-w-[28rem] text-[16px] leading-[1.65] text-[color:rgba(3,60,89,0.78)] tablet:text-[17px]">{{ problem.intro }}</p>
          <!-- The pile is decorative; this is its readable form. -->
          <ul class="sr-only">
            <li v-for="p in problem.pressures" :key="p" class="font-display text-[18px] font-extrabold tracking-[-0.02em] text-slateNavy">{{ p }}</li>
          </ul>
        </div>

        <!-- The pile -->
        <div ref="pileRef" class="relative desktop:col-span-6" :class="{ 'is-in': pileIn }">
          <div class="relative mx-auto aspect-[5/4] w-full max-w-[520px] desktop:ml-0 desktop:mr-auto desktop:max-w-[440px]" aria-hidden="true">
            <div
              v-for="(s, i) in sheets"
              :key="s.text"
              class="op-sheet absolute left-[6%] top-[3%] flex h-[30%] w-[88%] items-start justify-between gap-3 rounded-[8px] border border-[color:rgba(3,60,89,0.12)] bg-pureWhite px-5 py-3.5 shadow-[0_-10px_30px_-22px_rgba(3,60,89,0.45)] tablet:px-6"
              :style="{
                '--fx': `${s.from[0]}%`, '--fy': `${s.from[1]}%`, '--fr': `${s.from[2]}deg`,
                '--tx': `${s.to[0]}%`, '--ty': `${s.to[1]}%`, '--tr': `${s.to[2]}deg`,
                '--d': `${i * 90}ms`, zIndex: i
              }"
            >
              <span class="whitespace-nowrap font-display text-[length:clamp(18px,4.6vw,24px)] font-extrabold leading-none tracking-[-0.03em] text-slateNavy desktop:text-[22px]">{{ s.text }}</span>
              <span class="mt-1.5 flex w-1/4 flex-col gap-1.5"><span class="h-1.5 rounded-full bg-[color:rgba(3,60,89,0.1)]" /><span class="h-1.5 w-2/3 rounded-full bg-[color:rgba(3,60,89,0.07)]" /></span>
            </div>
          </div>

          <!-- Symptoms pinned to the pile -->
          <ul class="relative z-20 mt-6 flex flex-wrap justify-center gap-2 desktop:absolute desktop:right-0 desktop:top-0 desktop:mt-0 desktop:h-full desktop:flex-col desktop:items-end desktop:justify-around desktop:gap-0" aria-label="Gejala">
            <li
              v-for="(s, i) in problem.symptoms"
              :key="s"
              class="op-fade flex items-center gap-2 rounded-full border border-[color:rgba(3,60,89,0.14)] bg-pureWhite py-1.5 pl-1.5 pr-3.5 shadow-[0_14px_30px_-20px_rgba(3,60,89,0.6)]"
              :style="{ '--d': `${700 + i * 110}ms` }"
            >
              <span class="grid h-5 w-5 place-items-center rounded-full bg-slateNavy font-display text-[11px] font-extrabold text-pastiYellow-500">!</span>
              <span class="font-display text-[13px] font-bold text-slateNavy">{{ s }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Verdict -->
      <p class="m-center mt-20 max-w-[60rem] op-display text-[length:clamp(30px,4.4vw,64px)] text-slateNavy desktop:mt-24">
        {{ problem.verdict[0] }} <span class="text-[color:rgba(3,60,89,0.42)]">{{ problem.verdict[1] }}</span>
      </p>

      <!-- The real problem -->
      <div ref="qRef" data-header-theme="dark" class="relative isolate mt-16 overflow-hidden rounded-[28px] bg-slateNavy px-5 py-12 text-pureWhite tablet:px-10 tablet:py-14 desktop:mt-20 desktop:px-14 desktop:py-16" :class="{ 'is-in': qIn }">
        <div aria-hidden="true" class="op-rules--dark pointer-events-none absolute inset-0 -z-10" />
        <div class="grid gap-8 desktop:grid-cols-12 desktop:items-end">
          <OpenHeading class="desktop:col-span-7" :lines="problem.realTitle" surface="dark" size="md" />
          <p class="m-center text-[16px] text-[color:rgba(255,255,255,0.7)] desktop:col-span-4 desktop:col-start-9">{{ problem.realIntro }}</p>
        </div>

        <dl class="mt-12 grid grid-cols-1 border-t border-[color:rgba(255,255,255,0.14)] tablet:grid-cols-5">
          <div
            v-for="(q, i) in problem.questions"
            :key="q.key"
            class="flex items-baseline justify-between gap-4 border-b border-[color:rgba(255,255,255,0.14)] py-5 tablet:flex-col tablet:items-start tablet:border-b-0 tablet:border-r tablet:px-4 tablet:py-6 tablet:last:border-r-0 tablet:first:pl-0"
          >
            <dt class="op-line"><span class="op-display text-[length:clamp(34px,4.2vw,64px)]" :class="q.key === 'TRACE' ? 'text-pastiYellow-500' : 'text-pureWhite'" :style="{ '--d': `${i * 90}ms` }">{{ q.key }}</span></dt>
            <dd class="op-fade text-right text-[15px] text-[color:rgba(255,255,255,0.72)] tablet:mt-3 tablet:text-left" :style="{ '--d': `${300 + i * 90}ms` }">{{ q.q }}</dd>
          </div>
        </dl>

        <p class="m-center m-center-row mt-10 flex flex-wrap items-baseline gap-x-3 gap-y-2 font-display text-[length:clamp(19px,2vw,26px)] font-bold tracking-[-0.015em]">
          <span class="text-[color:rgba(255,255,255,0.65)]">{{ problem.needsIntro }}</span>
          <template v-for="(n, i) in problem.needs" :key="n">
            <span v-if="i" aria-hidden="true" class="text-pastiYellow-500">+</span>
            <span class="text-pureWhite underline decoration-pastiYellow-500 decoration-[3px] underline-offset-[6px]">{{ n }}</span>
          </template>
          <span class="text-[color:rgba(255,255,255,0.65)]">.</span>
        </p>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.op-sheet {
  transform: translate(var(--tx), var(--ty)) rotate(var(--tr));
  transition: transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) var(--d, 0ms), opacity 0.6s ease var(--d, 0ms);
}
:global(html[data-reduced-motion='false']) .op-sheet {
  transform: translate(var(--fx), var(--fy)) rotate(var(--fr));
  opacity: 0;
}
:global(html[data-reduced-motion='false']) .is-in .op-sheet {
  transform: translate(var(--tx), var(--ty)) rotate(var(--tr));
  opacity: 1;
}
</style>
