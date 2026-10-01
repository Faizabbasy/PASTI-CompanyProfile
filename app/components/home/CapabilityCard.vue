<script setup lang="ts">
import gsap from 'gsap'
import type { Service } from '~/composables/useServices'

// One What We Build capability, drawn as a "capability module" rather than a
// flat SaaS card (00-brand-guide.md §08 Precision Framing / §10 Cards):
//
//   01 ● ───────────────── Technology      <- index + pillar (real data)
//   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
//   │  measured window: fine grid,     │    <- the illustration sits in a
//   │  corner ticks, line drawing      │       framed blueprint window
//   └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
//   Title / body
//   ─────────────────────────────────
//   EXPLORE →                  [PASTI]      <- signed with the brand mark
//
// Response layer (fine pointer, motion allowed): the card's border and the
// window's grid brighten inside a mask that follows the pointer (the same
// "the system is measuring where you are" language as the Hero field), a
// single Cobalt scan line sweeps the window on enter, and the module tilts
// at most ~3deg. No glow, no scale jump. The parent owns lift / dimming /
// accent redraw via [data-card-edge] and [data-accent].
const props = withDefaults(
  defineProps<{
    service: Service
    kind: 'technology' | 'enterprise' | 'mobile' | 'creative'
    size: 'primary' | 'medium' | 'accent'
    interactive?: boolean
  }>(),
  { interactive: false }
)

const rootRef = ref<HTMLElement | null>(null)
const scanRef = ref<HTMLElement | null>(null)
const windowRef = ref<HTMLElement | null>(null)

const SIZE = {
  primary: { pad: 'p-6', art: 'h-[132px]', title: 'text-token-body-large', body: 'text-token-body' },
  medium: { pad: 'p-5', art: 'h-[96px]', title: 'text-token-body', body: 'text-[0.8125rem] leading-[1.5]' },
  accent: { pad: 'p-4', art: 'h-[64px]', title: 'text-sm', body: '' }
} as const
const sz = computed(() => SIZE[props.size])
const pillar = computed(() => (props.service.category === 'creative' ? 'Creative' : 'Technology'))

let tiltX: ((v: number) => void) | undefined
let tiltY: ((v: number) => void) | undefined
const canRespond = () =>
  props.interactive &&
  import.meta.client &&
  window.matchMedia('(pointer: fine)').matches &&
  !window.matchMedia(reducedMotionQuery.reduce).matches

onMounted(() => {
  if (!canRespond() || !rootRef.value) return
  gsap.set(rootRef.value, { transformPerspective: 900 })
  tiltX = gsap.quickTo(rootRef.value, 'rotationY', { duration: 0.6, ease: approvedEase.gsapStandard })
  tiltY = gsap.quickTo(rootRef.value, 'rotationX', { duration: 0.6, ease: approvedEase.gsapStandard })
})

function onMove(event: PointerEvent) {
  const el = rootRef.value
  if (!el || event.pointerType !== 'mouse' || !canRespond()) return
  const r = el.getBoundingClientRect()
  const px = event.clientX - r.left
  const py = event.clientY - r.top
  el.style.setProperty('--px', `${px}px`)
  el.style.setProperty('--py', `${py}px`)
  const w = windowRef.value
  if (w) {
    const wr = w.getBoundingClientRect()
    w.style.setProperty('--wx', `${event.clientX - wr.left}px`)
    w.style.setProperty('--wy', `${event.clientY - wr.top}px`)
  }
  tiltX?.(((px / r.width) * 2 - 1) * 3)
  tiltY?.(-((py / r.height) * 2 - 1) * 3)
}

function onEnter() {
  if (!canRespond() || !scanRef.value) return
  gsap.fromTo(
    scanRef.value,
    { left: '0%', opacity: 1 },
    { left: '100%', opacity: 0.2, duration: 0.9, ease: approvedEase.gsapCinematic, overwrite: 'auto' }
  )
}

function onLeave() {
  tiltX?.(0)
  tiltY?.(0)
  if (scanRef.value) gsap.to(scanRef.value, { opacity: 0, duration: 0.2, overwrite: 'auto' })
}
</script>

<template>
  <div
    ref="rootRef"
    class="cap-card group/cap relative overflow-hidden rounded-card border bg-[linear-gradient(180deg,#FFFFFF_0%,#F4F8FB_100%)] shadow-[0_24px_50px_-34px_rgba(3,60,89,0.45)]"
    :class="[sz.pad, size === 'accent' ? 'border-[color:rgba(3, 60, 89,0.45)]' : 'border-[color:rgba(3,60,89,0.120)]']"
    @pointermove="onMove"
    @pointerenter="onEnter"
    @pointerleave="onLeave"
  >
    <!-- Measuring edge: the card's own border redrawn in Cobalt, only
         inside the pointer mask. -->
    <span
      aria-hidden="true"
      class="cap-card__measure pointer-events-none absolute inset-0 rounded-card border border-cobalt opacity-0 transition-opacity duration-200 ease-editorial group-hover/cap:opacity-100"
    />

    <!-- Header: index, primary Signal point, a rule, the pillar. -->
    <div class="relative flex items-center gap-3">
      <span class="font-display text-token-metadata font-semibold tabular-nums tracking-[0.08em] text-slateNavy">{{ service.index }}</span>
      <span v-if="size === 'primary'" aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-cobalt" />
      <span aria-hidden="true" class="h-px flex-1 bg-[color:rgba(3,60,89,0.144)]" />
      <span class="font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.68)]">{{ pillar }}</span>
    </div>

    <!-- Blueprint window. -->
    <div
      ref="windowRef"
      class="cap-card__window relative mt-4 overflow-hidden rounded-token-sm border border-[color:rgba(3,60,89,0.084)] bg-[color:rgba(3,60,89,0.035)] px-3 py-2 text-[color:rgba(3,60,89,0.68)]"
      :class="sz.art"
    >
      <span aria-hidden="true" class="cap-card__grid pointer-events-none absolute inset-0" />
      <span aria-hidden="true" class="cap-card__grid cap-card__grid--hot pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 ease-editorial group-hover/cap:opacity-100" />
      <!-- Corner registration ticks. -->
      <span aria-hidden="true" class="pointer-events-none absolute left-1.5 top-1.5 h-2 w-2 border-l border-t border-[color:rgba(3, 60, 89,0.7)]" />
      <span aria-hidden="true" class="pointer-events-none absolute right-1.5 top-1.5 h-2 w-2 border-r border-t border-[color:rgba(3, 60, 89,0.7)]" />
      <span aria-hidden="true" class="pointer-events-none absolute bottom-1.5 left-1.5 h-2 w-2 border-b border-l border-[color:rgba(3, 60, 89,0.7)]" />
      <span aria-hidden="true" class="pointer-events-none absolute bottom-1.5 right-1.5 h-2 w-2 border-b border-r border-[color:rgba(3, 60, 89,0.7)]" />
      <div class="relative h-full w-full">
        <HomeCapabilityArt :kind="kind" />
      </div>
      <span ref="scanRef" aria-hidden="true" class="pointer-events-none absolute inset-y-0 left-0 w-px bg-cobalt opacity-0" />
    </div>

    <h3 class="relative mt-5 font-display font-semibold leading-tight text-slateNavy" :class="sz.title">
      {{ service.title }}
    </h3>
    <p v-if="size !== 'accent'" class="relative mt-2 text-[color:rgba(3,60,89,0.80)]" :class="sz.body">
      {{ service.body }}
    </p>

    <!-- Footer: CTA (primary) / pillar tick, signed with the brand mark. -->
    <div class="relative flex items-center justify-between border-t border-[color:rgba(3,60,89,0.096)]" :class="size === 'accent' ? 'mt-4 pt-3' : 'mt-5 pt-4'">
      <span
        v-if="size === 'primary'"
        class="inline-flex items-center gap-1.5 font-display text-token-metadata font-semibold uppercase tracking-[0.08em] text-cobalt"
      >
        {{ service.cta }}
        <span aria-hidden="true" class="inline-block transition-transform duration-200 ease-editorial group-hover/cap:translate-x-1">→</span>
      </span>
      <span v-else aria-hidden="true" class="h-px w-6 bg-[color:rgba(3,60,89,0.360)] transition-all duration-200 ease-editorial group-hover/cap:w-10 group-hover/cap:bg-cobalt" />
      <LayoutBrandMark surface="light" :height="size === 'accent' ? 9 : size === 'primary' ? 12 : 10" class="opacity-70 transition-opacity duration-200 ease-editorial group-hover/cap:opacity-100" />
    </div>

    <!-- Cobalt edge: drawn left-to-right by the parent on hover. -->
    <span data-card-edge aria-hidden="true" class="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-cobalt" />
  </div>
</template>

<style scoped>
.cap-card {
  --px: 50%;
  --py: 0%;
  transform-style: preserve-3d;
}

.cap-card__measure {
  -webkit-mask-image: radial-gradient(circle 150px at var(--px) var(--py), #000 0%, rgba(0, 0, 0, 0.25) 60%, transparent 100%);
  mask-image: radial-gradient(circle 150px at var(--px) var(--py), #000 0%, rgba(0, 0, 0, 0.25) 60%, transparent 100%);
}

/* Fine 12px measuring grid inside the window (structure, not texture). */
.cap-card__grid {
  background-image:
    linear-gradient(to right, rgba(3,60,89,0.07) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(3,60,89,0.07) 1px, transparent 1px);
  background-size: 12px 12px;
}

.cap-card__grid--hot {
  background-image:
    linear-gradient(to right, rgba(3, 60, 89, 0.35) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(251, 186, 0, 0.22) 1px, transparent 1px);
  -webkit-mask-image: radial-gradient(circle 110px at var(--wx, 50%) var(--wy, 50%), #000 0%, transparent 100%);
  mask-image: radial-gradient(circle 110px at var(--wx, 50%) var(--wy, 50%), #000 0%, transparent 100%);
}
</style>
