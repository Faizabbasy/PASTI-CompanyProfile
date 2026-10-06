<script setup lang="ts">
// KEY VALUE — exactly the brief's six values, told against the CONFIRMED
// copy. Desktop: a sticky-scroll story — the left column pins a giant value
// word + index + progress ticks; on the right each value gets a full-height
// block with the confirmed sentence it rests on, its phrase underlined. The
// block crossing the viewport centre (IntersectionObserver, no scroll
// handlers) sets the active value; ticks jump to a block.
// Below desktop: a recomposed list, each value with its phrase inline.
// Reduced motion: same layout, word swaps without the slide.
const { values } = useEcorporate()
const scrollTo = useEcorpScroll()
const active = ref(0)
const currentTitle = computed(() => values[active.value]?.title ?? '')

const split = (v: (typeof values)[number]) => {
  const i = v.sentence.indexOf(v.source)
  return i < 0 ? { before: v.sentence, hit: '', after: '' } : { before: v.sentence.slice(0, i), hit: v.source, after: v.sentence.slice(i + v.source.length) }
}

const blocksRef = ref<HTMLElement | null>(null)
let io: IntersectionObserver | undefined
onMounted(() => {
  const blocks = blocksRef.value?.querySelectorAll<HTMLElement>('[data-ev-block]')
  if (!blocks) return
  io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && (active.value = Number((e.target as HTMLElement).dataset.evBlock))),
    { rootMargin: '-45% 0px -45% 0px' }
  )
  blocks.forEach((b) => io!.observe(b))
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <section id="values" data-header-theme="dark" class="relative bg-slateNavy py-24 text-pureWhite tablet:py-32">
    <div aria-hidden="true" class="ec-dots--dark pointer-events-none absolute inset-0 [mask-image:linear-gradient(90deg,#000,transparent_55%)]" />
    <BaseGridLines tone="dark" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark label="Key value" meta="04 / 12" />
      <EcorpHeading class="mt-12" surface="dark" eyebrow="Key value" before="Six principles, " mark="one platform" />

      <!-- Desktop: sticky story -->
      <div class="mt-16 hidden desktop:grid desktop:grid-cols-12 desktop:gap-8">
        <div class="col-span-5">
          <div class="sticky top-[18vh] flex h-[64vh] flex-col justify-between border-l-2 border-pastiYellow-500 pl-8">
            <div>
              <span class="font-mono text-[12px] tabular-nums text-pastiYellow-500">{{ String(active + 1).padStart(2, '0') }} <span class="text-[color:rgba(255,255,255,0.4)]">/ {{ String(values.length).padStart(2, '0') }}</span></span>
              <div class="relative mt-4 h-[1.05em] overflow-hidden font-display text-[length:clamp(52px,5.4vw,92px)] font-extrabold leading-none tracking-[-0.05em]">
                <Transition name="ev-word">
                  <span :key="currentTitle" class="absolute inset-x-0 top-0 block">{{ currentTitle }}<span class="text-pastiYellow-500">.</span></span>
                </Transition>
              </div>
            </div>
            <div aria-hidden="true" class="relative h-[clamp(120px,14vw,220px)] overflow-hidden">
              <Transition name="ev-word">
                <span :key="currentTitle" class="ec-outline ev-num absolute bottom-0 left-0 text-[length:clamp(140px,16vw,260px)]">{{ String(active + 1).padStart(2, '0') }}</span>
              </Transition>
            </div>
            <ol class="grid grid-cols-6 gap-1.5" aria-label="Key values">
              <li v-for="(v, i) in values" :key="v.title">
                <button
                  type="button"
                  class="group w-full pt-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pastiYellow-500"
                  :aria-current="active === i ? 'step' : undefined"
                  @click="scrollTo(`ev-block-${i}`)"
                >
                  <span class="block h-[3px] transition-colors duration-300" :class="i <= active ? 'bg-pastiYellow-500' : 'bg-[color:rgba(255,255,255,0.18)] group-hover:bg-[color:rgba(255,255,255,0.45)]'" />
                  <span class="mt-2 block font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-300" :class="active === i ? 'text-pureWhite' : 'text-[color:rgba(255,255,255,0.45)]'">{{ v.title }}</span>
                </button>
              </li>
            </ol>
          </div>
        </div>

        <div ref="blocksRef" class="col-span-6 col-start-7">
          <article
            v-for="(v, i) in values"
            :id="`ev-block-${i}`"
            :key="v.title"
            :data-ev-block="i"
            class="flex min-h-[64vh] flex-col justify-center border-t border-[color:rgba(255,255,255,0.12)] py-12 transition-opacity duration-500"
            :class="active === i ? 'opacity-100' : 'opacity-35'"
          >
            <h3 class="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.55)]">{{ String(i + 1).padStart(2, '0') }} · {{ v.title }}</h3>
            <p class="mt-6 font-display text-[length:clamp(24px,2.3vw,36px)] font-semibold leading-[1.3] tracking-[-0.015em] text-[color:rgba(255,255,255,0.6)]">
              {{ split(v).before }}<span class="text-pureWhite underline decoration-pastiYellow-500 decoration-[3px] underline-offset-[7px]">{{ split(v).hit }}</span>{{ split(v).after }}
            </p>
            <p class="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.4)]">From the platform positioning</p>
          </article>
        </div>
      </div>

      <!-- Below desktop: list -->
      <ol class="mt-12 desktop:hidden">
        <li v-for="(v, i) in values" :key="v.title" class="border-t border-[color:rgba(255,255,255,0.14)] py-6 last:border-b">
          <p class="flex items-baseline gap-4">
            <span class="font-mono text-[12px] text-pastiYellow-500">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="font-display text-[34px] font-extrabold leading-none tracking-[-0.03em] tablet:text-[44px]">{{ v.title }}<span class="text-pastiYellow-500">.</span></span>
          </p>
          <p class="mt-3 pl-9 text-[15px] leading-relaxed text-[color:rgba(255,255,255,0.72)]">“…<span class="text-pureWhite underline decoration-pastiYellow-500 decoration-2 underline-offset-4">{{ v.source }}</span>…”</p>
        </li>
      </ol>
    </BaseContainer>
  </section>
</template>

<style scoped>
.ev-word-enter-active,
.ev-word-leave-active {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.ev-word-enter-from {
  transform: translateY(105%);
}
.ev-word-leave-to {
  transform: translateY(-105%);
}
[data-reduced-motion='true'] .ev-word-enter-active,
[data-reduced-motion='true'] .ev-word-leave-active {
  transition: none;
}
</style>
<style scoped>
/* Big index numeral beside the value word — a clear yellow outline so it
   reads on navy (owner: the faint version was hard to see). */
.ev-num {
  -webkit-text-stroke: 2px rgba(251, 186, 0, 0.75);
}
</style>
