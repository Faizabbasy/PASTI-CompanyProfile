<script setup lang="ts">
// MATRIX section mark — a warehouse bin label instead of the shared
// BaseSectionMark (owner 2026-10-20: MATRIX must feel distinct). The page
// is laid out as one rack: 12 sections = rows A–C × bins 01–04, so every
// section has a location code (section 5 = B-01). Label = PASTI mark ·
// LOC code · barcode · section name · NN / 12. The barcode bars "scan in"
// once (scaleY, CSS) when the label enters view. `data-mx-bin` lets the
// rack locator find each section.
const props = withDefaults(defineProps<{ index: number; name: string; surface?: 'light' | 'dark' }>(), { surface: 'light' })
// Section name shown by the rack locator, in the page's language (the
// barcode keeps hashing the English name so it looks the same in both).
const t = useT()

const pad = (n: number) => String(n).padStart(2, '0')
const code = computed(() => `${'ABC'[Math.floor((props.index - 1) / 4)]}-${pad(((props.index - 1) % 4) + 1)}`)
// Deterministic pseudo-barcode from the code (bars 1–3 px, gaps 1–2 px),
// drawn as ONE element: a hard-stop linear-gradient. (22 separately
// animated bars × 12 labels created hundreds of layers — perf 2026-10-20.)
const barcode = computed(() => {
  let h = 0
  for (const ch of `${code.value}${props.name}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const color = props.surface === 'dark' ? '#fff' : '#033C59'
  const stops: string[] = []
  let x = 0
  for (let i = 0; i < 22; i++) {
    h = (h * 1103515245 + 12345) >>> 0
    const w = 1 + (h % 3)
    const gap = 1 + ((h >> 3) % 2)
    stops.push(`${color} ${x}px ${x + w}px`, `transparent ${x + w}px ${x + w + gap}px`)
    x += w + gap
  }
  return { width: x, image: `linear-gradient(90deg, ${stops.join(', ')})` }
})

const rootRef = ref<HTMLElement | null>(null)
const seen = ref(false)
let stop = () => {}
onMounted(() => {
  if (window.matchMedia(reducedMotionQuery.reduce).matches || !rootRef.value) {
    seen.value = true
    return
  }
  stop = onceInView(rootRef.value, () => (seen.value = true), '0px 0px -10% 0px')
})
onBeforeUnmount(() => stop())

const dark = computed(() => props.surface === 'dark')
</script>

<template>
  <div :id="`loc-${code}`" ref="rootRef" data-mx-bin :data-mx-code="code" :data-mx-name="t(name)" class="flex items-center gap-4" :class="seen ? 'is-in' : ''">
    <LayoutBrandMark :surface="surface" :height="15" />
    <span class="h-px flex-1" :class="dark ? 'bg-[color:rgba(255,255,255,0.14)]' : 'bg-[color:rgba(3,60,89,0.14)]'" />
    <span class="inline-flex items-center gap-3 rounded-[8px] px-2.5 py-1.5 ring-1" :class="dark ? 'ring-[color:rgba(255,255,255,0.18)]' : 'bg-pureWhite ring-[color:rgba(3,60,89,0.14)]'">
      <span class="font-mono text-[10px] uppercase tracking-[0.14em]" :class="dark ? 'text-[color:rgba(255,255,255,0.55)]' : 'text-[color:rgba(3,60,89,0.55)]'">Loc</span>
      <span class="font-mono text-[13px] font-semibold tabular-nums" :class="dark ? 'text-pastiYellow-400' : 'text-slateNavy'">{{ code }}</span>
      <span aria-hidden="true" class="mbl-code block h-4 origin-bottom" :style="{ width: `${barcode.width}px`, backgroundImage: barcode.image }" />
    </span>
    <span class="hidden font-display text-token-metadata font-semibold uppercase tracking-[0.12em] tablet:inline" :class="dark ? 'text-[color:rgba(255,255,255,0.55)]' : 'text-[color:rgba(3,60,89,0.6)]'">{{ pad(index) }} / 12</span>
  </div>
</template>

<style scoped>
.mbl-code {
  transform: scaleY(0.15);
  opacity: 0.35;
  transition:
    transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.is-in .mbl-code {
  transform: none;
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  .mbl-code {
    transition: none;
  }
}
</style>
