<script setup lang="ts">
// MEET OPEN (slides 1, 4) — the product's own wordmark as the H1: the yellow
// ring-and-check is the "O", as on the cover. Left: what OPEN is (a
// customizable procurement framework, not blank-page build, not rigid SaaS).
// Right: a live procurement record (OpenRecord). Bottom: what OPEN connects —
// seven words threaded on one trace line that draws once on load.
// Entrance: CSS classes switched by the page-ready gate; the ring draws, the
// letters rise. No idle motion here except the record (paused off-screen).
const { hero } = useOpen()
const { requestDemo, scrollTo } = useOpenDemo()
const { pageReady } = usePageReady()

const mounted = ref(false)
onMounted(() => (mounted.value = true))
const go = computed(() => mounted.value && pageReady.value)
</script>

<template>
  <section id="overview" class="surface-light relative isolate overflow-hidden pb-14 pt-28 desktop:pb-12 desktop:pt-32" :class="{ 'is-in': go }" style="--lift-x: 85%; --lift-y: 20%">
    <div aria-hidden="true" class="op-rules pointer-events-none absolute inset-0 -z-10 opacity-70" />
    <div aria-hidden="true" class="open-glow pointer-events-none absolute -right-[16%] -top-[22%] -z-10 h-[70vw] max-h-[880px] w-[70vw] max-w-[880px] opacity-80" />

    <BaseContainer class="relative">
      <div class="grid items-center gap-12 desktop:grid-cols-12 desktop:gap-10">
        <div class="desktop:col-span-6">
          <p class="op-fade flex items-center gap-2.5 font-display text-[14px] font-bold text-slateNavy" style="--d: 100ms">
            <span class="h-2 w-2 rounded-full bg-pastiYellow-500" />{{ hero.origin }}
          </p>

          <h1 class="mt-7">
            <span class="sr-only">{{ hero.name }} — {{ hero.expansion }}</span>
            <span aria-hidden="true" class="flex items-center text-[length:clamp(84px,24vw,128px)] leading-[0.8] desktop:text-[length:clamp(120px,min(12vw,22svh),200px)]">
              <svg viewBox="0 0 100 100" class="op-hero-o mr-[0.02em] h-[0.86em] w-[0.86em] shrink-0" fill="none">
                <circle cx="50" cy="50" r="38" stroke="#FBBA00" stroke-width="18" class="op-hero-ring" pathLength="100" transform="rotate(-90 50 50)" />
                <path d="M33 51l12 12 23-25" stroke="#033C59" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" class="op-hero-check" pathLength="100" />
              </svg>
              <span class="op-line"><span class="op-display !leading-[0.8] text-slateNavy" style="--d: 260ms">PEN</span></span>
            </span>
            <span aria-hidden="true" class="op-line mt-5"><span class="font-display text-[length:clamp(19px,4.6vw,26px)] font-extrabold tracking-[-0.02em] text-slateNavy desktop:text-[length:clamp(22px,1.9vw,30px)]" style="--d: 380ms">{{ hero.expansion }}</span></span>
          </h1>

          <p class="op-fade mt-7 max-w-[30rem] font-display text-[length:clamp(20px,2vw,26px)] font-semibold leading-[1.25] tracking-[-0.015em] text-slateNavy" style="--d: 520ms">
            {{ hero.statement }}
          </p>
          <p class="op-fade mt-4 max-w-[31rem] text-[16px] leading-[1.65] text-[color:rgba(3,60,89,0.78)]" style="--d: 600ms">{{ hero.body }}</p>

          <div class="op-fade mt-9" style="--d: 700ms">
            <BaseHeroCtas
              :primary="{ label: 'Request a Demo' }"
              :secondary="{ label: 'Explore OPEN', down: true }"
              @primary="requestDemo()"
              @secondary="scrollTo('problem')"
            />
          </div>
        </div>

        <div class="op-fade desktop:col-span-6 desktop:pl-4" style="--d: 450ms">
          <OpenRecord />
        </div>
      </div>

      <!-- What OPEN connects (slide 4) -->
      <div class="mt-14 border-t border-[color:rgba(3,60,89,0.12)] pt-7 desktop:mt-16">
        <p class="op-fade text-[15px] font-medium text-[color:rgba(3,60,89,0.72)]" style="--d: 800ms">{{ hero.connectsIntro }}</p>
        <ol class="relative mt-5 grid grid-cols-2 gap-x-4 gap-y-4 tablet:grid-cols-4 desktop:grid-cols-7 desktop:gap-0">
          <span aria-hidden="true" class="op-draw absolute left-0 right-0 top-[9px] hidden h-[2px] bg-pastiYellow-500 desktop:block" style="--d: 900ms" />
          <li v-for="(c, i) in hero.connects" :key="c" class="relative flex items-center gap-3 desktop:flex-col desktop:items-start desktop:gap-4">
            <span class="op-pop relative z-10 h-5 w-5 shrink-0 rounded-full border-[5px] border-pastiYellow-500 bg-pureWhite" :style="{ '--d': `${950 + i * 70}ms` }" />
            <span class="font-display text-[17px] font-extrabold tracking-[-0.02em] text-slateNavy desktop:text-[20px]">{{ c }}</span>
          </li>
        </ol>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.op-hero-ring,
.op-hero-check {
  stroke-dasharray: 100;
  transition: stroke-dashoffset 1.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.op-hero-check {
  transition-duration: 0.7s;
  transition-delay: 0.75s;
}
:global(html[data-reduced-motion='false']) .op-hero-ring,
:global(html[data-reduced-motion='false']) .op-hero-check {
  stroke-dashoffset: 100;
}
:global(html[data-reduced-motion='false']) .is-in .op-hero-ring,
:global(html[data-reduced-motion='false']) .is-in .op-hero-check {
  stroke-dashoffset: 0;
}
</style>
