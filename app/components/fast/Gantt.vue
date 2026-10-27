<script setup lang="ts">
import type { GanttOp, GanttStep } from '~/composables/useFast'

// Reconstructed FAST Scheduling Board (no product screenshot is published —
// docs/fast/00). Resources down, time across, neutral sample data from
// useFastPage().gantt. One component, two uses:
// - Hero (`compact`): the resolved plan, blocks drop into place once.
// - Board: driven by `step` (0 queue · 1 schedule · 2 validate · 3 adjust),
//   `dir` (forward / backward) and `view` (hour / day / week). At step 2
//   the conflicting operation can be dragged onto Work Center 04 by hand.
// Motion is CSS transitions on position (editorial ease); under reduced
// motion every state is shown statically.
const props = withDefaults(
  defineProps<{
    step?: GanttStep
    dir?: 'fwd' | 'bwd'
    view?: 'hour' | 'day' | 'week'
    surface?: 'light' | 'dark'
    compact?: boolean
    interactive?: boolean
    now?: number
  }>(),
  { step: 3, dir: 'fwd', view: 'day', surface: 'light', compact: false, interactive: false, now: 9 }
)
const emit = defineEmits<{ resolve: [] }>()

const { gantt } = useFastPage()
// `tr`, not `t`: this file already uses `t` for tones and ticks.
const tr = useT()
const { setState } = useCustomCursor()
const dark = computed(() => props.surface === 'dark')
const rowIndex = (res: string) => gantt.resources.findIndex((r) => r.id === res)
const R = gantt.resources.length

const win = computed<[number, number]>(() => (props.view === 'hour' ? [2, 12] : props.view === 'week' ? [0, 24 * 7] : [0, 24]))
const span = computed(() => win.value[1] - win.value[0])
const pct = (h: number) => ((h - win.value[0]) / span.value) * 100

const ticks = computed(() => {
  if (props.view === 'week') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({ at: i * 24, label: tr(d) }))
  const every = props.view === 'hour' ? 2 : 3
  const out: { at: number; label: string }[] = []
  for (let h = win.value[0]; h < win.value[1]; h += every) out.push({ at: h, label: `${String((gantt.start + h) % 24).padStart(2, '0')}:00` })
  return out
})

const orderTone = (order: string) => ['PRD-1042', 'PRD-1043', 'PRD-1047'].indexOf(order)

const placed = (op: GanttOp) => {
  const fixed = props.step === 3 && op.fix
  const res = fixed ? op.fix!.res : op.res
  const [s, e] = fixed ? op.fix![props.dir] : op[props.dir]
  return { res, s, e }
}

const blocks = computed(() =>
  gantt.ops.map((op, i) => {
    const p = placed(op)
    const visible = props.step >= 1
    return {
      op,
      i,
      ...p,
      visible,
      conflict: props.step === 2 && !!op.conflict,
      resolved: props.step === 3 && !!op.conflict
    }
  })
)

// Week view: the day's plan repeats faintly across the working week.
const ghosts = computed(() => {
  if (props.view !== 'week' || props.step < 1) return []
  const out: { key: string; res: string; s: number; e: number; tone: number }[] = []
  for (let d = 1; d < 5; d++) for (const b of blocks.value) out.push({ key: `${b.op.id}-${d}`, res: b.res, s: b.s + d * 24, e: b.e + d * 24, tone: orderTone(b.op.order) })
  return out
})

// Dependency connectors between consecutive operations of one order.
const links = computed(() => {
  if (props.step < 1 || props.view === 'week') return []
  const out: { key: string; x1: number; y1: number; x2: number; y2: number; hot: boolean }[] = []
  const byOrder = new Map<string, typeof blocks.value>()
  for (const b of blocks.value) byOrder.set(b.op.order, [...(byOrder.get(b.op.order) ?? []), b])
  for (const list of byOrder.values()) {
    for (let k = 1; k < list.length; k++) {
      const a = list[k - 1]!
      const b = list[k]!
      out.push({ key: `${a.op.id}-${b.op.id}`, x1: pct(a.e), y1: (rowIndex(a.res) + 0.5) * 10, x2: pct(b.s), y2: (rowIndex(b.res) + 0.5) * 10, hot: b.conflict || a.conflict })
    }
  }
  return out
})

const conflicts = computed(() => (props.step === 2 ? gantt.ops.filter((o) => o.conflict).length : 0))

// ---- Manual adjustment (step 2, fine pointer) ----
const rowsRef = ref<HTMLElement | null>(null)
const drag = reactive({ id: '', dx: 0, dy: 0, sx: 0, sy: 0 })
const canDrag = (b: { op: GanttOp; conflict: boolean }) => props.interactive && b.conflict
const onDown = (e: PointerEvent, b: { op: GanttOp; conflict: boolean }) => {
  if (!canDrag(b)) return
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  Object.assign(drag, { id: b.op.id, dx: 0, dy: 0, sx: e.clientX, sy: e.clientY })
}
const onMove = (e: PointerEvent) => {
  if (!drag.id) return
  drag.dx = e.clientX - drag.sx
  drag.dy = e.clientY - drag.sy
}
const onUp = (e: PointerEvent) => {
  if (!drag.id) return
  const rows = rowsRef.value
  if (rows) {
    const r = rows.getBoundingClientRect()
    const target = Math.floor(((e.clientY - r.top) / r.height) * R)
    if (target === rowIndex('r4')) emit('resolve')
  }
  Object.assign(drag, { id: '', dx: 0, dy: 0 })
}
// Keyboard path for the same action.
const onKey = (e: KeyboardEvent, b: { op: GanttOp; conflict: boolean }) => {
  if (canDrag(b) && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
    e.preventDefault()
    emit('resolve')
  }
}

const tone = (t: number, d: boolean) =>
  d
    ? ['bg-pureWhite text-slateNavy', 'bg-[#9DC0D3] text-slateNavy', 'bg-pastiYellow-500 text-slateNavy'][t] ?? 'bg-pureWhite text-slateNavy'
    : ['bg-slateNavy text-pureWhite', 'bg-[#3E7A99] text-pureWhite', 'bg-pastiYellow-500 text-slateNavy'][t] ?? 'bg-slateNavy text-pureWhite'

const summary = computed(
  () =>
    tr('Sample scheduling board: {n} resources over a {view} view.', { n: R, view: tr(props.view) }) +
    ' ' +
    tr(props.step === 0 ? 'Four orders wait in the unscheduled queue.' : props.step === 1 ? 'Operations are placed by a scheduling run.' : props.step === 2 ? 'Validation flags one operation that overlaps planned maintenance; one order is held for material shortage.' : 'The conflicting operation has been moved to Work Center 04; the schedule is valid.')
)
</script>

<template>
  <div class="fg relative select-none" :class="[dark ? 'fg--dark text-pureWhite' : 'text-slateNavy', compact ? 'fg--compact' : '']" role="img" :aria-label="summary">
    <!-- Board header -->
    <div v-if="!compact" class="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3" :class="dark ? 'border-[color:rgba(255,255,255,0.12)]' : 'border-[color:rgba(3,60,89,0.1)]'">
      <p class="font-mono text-[10px] uppercase tracking-[0.18em]" :class="dark ? 'text-[color:rgba(255,255,255,0.6)]' : 'text-[color:rgba(3,60,89,0.55)]'">{{ tr('Scheduling board') }} · {{ dir === 'fwd' ? tr('Forward') : tr('Backward') }} · {{ tr(view) }}</p>
      <p class="inline-flex items-center gap-2 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]" :class="conflicts ? 'bg-[color:rgba(194,65,45,0.12)] text-[#C2412D]' : step === 3 ? 'bg-[color:rgba(251,186,0,0.18)] text-[#8A5A00]' : dark ? 'bg-[color:rgba(255,255,255,0.08)] text-[color:rgba(255,255,255,0.7)]' : 'bg-surfaceNeutral text-[color:rgba(3,60,89,0.6)]'">
        <span class="h-1.5 w-1.5 rounded-full" :class="conflicts ? 'bg-[#C2412D]' : step === 3 ? 'bg-pastiYellow-500' : 'bg-current opacity-50'" />
        {{ step === 0 ? tr('4 orders unscheduled') : step === 1 ? tr('Run complete · validating') : step === 2 ? tr('{n} conflict · 1 blocked', { n: conflicts }) : tr('Valid · saved as draft') }}
      </p>
    </div>

    <div class="flex">
      <!-- Resource labels -->
      <div class="shrink-0" :class="compact ? 'w-[4.5rem] tablet:w-24' : 'w-[5.5rem] tablet:w-32'">
        <div class="h-7" />
        <div v-for="r in gantt.resources" :key="r.id" class="fg-row flex items-center border-t pl-3 pr-2 font-display font-semibold" :class="[dark ? 'border-[color:rgba(255,255,255,0.08)]' : 'border-[color:rgba(3,60,89,0.08)]', compact ? 'text-[10px] tablet:text-[11px]' : 'text-[11px] tablet:text-[12px]']">
          <span class="truncate">{{ compact ? r.short : '' }}<template v-if="!compact"><span class="tablet:hidden">{{ r.short }}</span><span class="hidden tablet:inline">{{ r.name }}</span></template></span>
        </div>
      </div>

      <!-- Timeline (clipped: operations outside the window never spill
           into the resource column) -->
      <div class="relative min-w-0 flex-1 overflow-hidden">
        <!-- Ticks -->
        <div class="relative h-7">
          <span v-for="t in ticks.filter((x) => view === 'week' || x.at > win[0])" :key="t.at" class="absolute top-2 -translate-x-1/2 font-mono text-[9px] tablet:text-[10px]" :class="dark ? 'text-[color:rgba(255,255,255,0.45)]' : 'text-[color:rgba(3,60,89,0.45)]'" :style="{ left: `calc(${pct(t.at)}% + ${view === 'week' ? `${(24 / span) * 50}%` : '0px'})` }">{{ t.label }}</span>
        </div>

        <div ref="rowsRef" class="relative" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp">
          <!-- Grid -->
          <div v-for="r in gantt.resources" :key="r.id" class="fg-row border-t" :class="dark ? 'border-[color:rgba(255,255,255,0.08)]' : 'border-[color:rgba(3,60,89,0.08)]'" />
          <span v-for="t in ticks" :key="`g${t.at}`" aria-hidden="true" class="absolute inset-y-0 w-px" :class="dark ? 'bg-[color:rgba(255,255,255,0.06)]' : 'bg-[color:rgba(3,60,89,0.06)]'" :style="{ left: `${pct(t.at)}%` }" />

          <!-- Downtime -->
          <span
            v-for="d in step >= 1 ? gantt.downtime : []"
            :key="d.res"
            aria-hidden="true"
            class="fg-downtime absolute"
            :style="{ left: `${pct(d.from)}%`, width: `${pct(d.to) - pct(d.from)}%`, top: `${(rowIndex(d.res) / R) * 100}%`, height: `${100 / R}%` }"
          >
            <span v-if="!compact && view !== 'week'" class="absolute left-1.5 top-1 font-mono text-[8px] uppercase tracking-[0.1em] text-[color:rgba(194,65,45,0.85)]">{{ tr('Maintenance') }}</span>
          </span>

          <!-- Dependency links -->
          <svg class="pointer-events-none absolute inset-0 h-full w-full overflow-visible" :viewBox="`0 0 100 ${R * 10}`" preserveAspectRatio="none" aria-hidden="true">
            <path
              v-for="l in links"
              :key="l.key"
              :d="`M ${l.x1} ${l.y1} C ${l.x1 + 1.6} ${l.y1}, ${l.x2 - 1.6} ${l.y2}, ${l.x2} ${l.y2}`"
              fill="none"
              vector-effect="non-scaling-stroke"
              :stroke="l.hot ? '#C2412D' : dark ? 'rgba(255,255,255,0.35)' : 'rgba(3,60,89,0.3)'"
              stroke-width="1.2"
              stroke-dasharray="3 3"
              class="fg-link"
            />
          </svg>

          <!-- Week ghosts -->
          <span v-for="g in ghosts" :key="g.key" aria-hidden="true" class="absolute rounded-[3px] opacity-25" :class="tone(g.tone, dark)" :style="{ left: `${pct(g.s)}%`, width: `${pct(g.e) - pct(g.s)}%`, top: `calc(${(rowIndex(g.res) / R) * 100}% + 22%/${R})`, height: `calc(${100 / R}% * 0.56)` }" />

          <!-- Operation blocks -->
          <div
            v-for="b in blocks"
            :key="b.op.id"
            class="fg-block absolute"
            :class="[b.visible ? 'fg-block--in' : 'fg-block--out', canDrag(b) ? 'cursor-grab touch-none active:cursor-grabbing' : '']"
            :style="{
              left: `${pct(b.s)}%`,
              width: `${pct(b.e) - pct(b.s)}%`,
              top: `${(rowIndex(b.res) / R) * 100}%`,
              height: `${100 / R}%`,
              transitionDelay: b.visible && step === 1 ? `${b.i * 60}ms` : '0ms',
              transform: drag.id === b.op.id ? `translate(${drag.dx}px, ${drag.dy}px)` : undefined,
              zIndex: drag.id === b.op.id ? 30 : b.conflict ? 20 : 10
            }"
            :tabindex="canDrag(b) ? 0 : undefined"
            :role="canDrag(b) ? 'button' : undefined"
            :aria-label="canDrag(b) ? `Move ${b.op.order} ${b.op.label} to Work Center 04` : undefined"
            @pointerdown="onDown($event, b)"
            @keydown="onKey($event, b)"
            @mouseenter="canDrag(b) && setState('view', 'Drag')"
            @mouseleave="setState('default')"
          >
            <!-- Conflict pulse: opacity-only ring (compositor), not an animated outline. -->
            <span v-if="b.conflict" aria-hidden="true" class="fg-ring pointer-events-none absolute inset-x-[-2px] inset-y-[7px] rounded-[7px] border-2 border-[#C2412D]" />
            <span
              class="fg-pill flex h-full items-center gap-1 overflow-hidden rounded-[5px] px-1.5 font-display font-semibold shadow-[0_6px_14px_-8px_rgba(3,30,46,0.6)] transition-[box-shadow,outline-color] duration-300"
              :class="[tone(orderTone(b.op.order), dark), compact ? 'text-[8px] tablet:text-[9px]' : 'text-[9px] tablet:text-[10px]', b.conflict ? 'fg-pill--conflict' : '', b.resolved ? 'fg-pill--resolved' : '']"
            >
              <svg v-if="b.op.locked && !compact" viewBox="0 0 12 12" class="h-2.5 w-2.5 shrink-0 opacity-80" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="2.5" y="5.5" width="7" height="5" rx="1" /><path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" /></svg>
              <svg v-if="b.conflict" viewBox="0 0 12 12" class="h-2.5 w-2.5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 1.5 11 10.5H1Z" /><path d="M6 5v2.5M6 9h.01" /></svg>
              <span v-if="view !== 'week'" class="truncate">{{ compact ? b.op.order.slice(4) : `${b.op.order} · ${b.op.label}` }}</span>
            </span>
          </div>

          <!-- NOW line -->
          <span v-if="view !== 'week'" aria-hidden="true" class="pointer-events-none absolute inset-y-0 z-[25] w-[2px] bg-pastiYellow-500" :style="{ left: `${pct(now)}%` }">
            <span class="absolute -top-[22px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-pastiYellow-500 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase text-slateNavy">{{ tr('Now') }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fg-row {
  height: 44px;
}
.fg--compact .fg-row {
  height: 34px;
}
@media (min-width: 640px) {
  .fg-row {
    height: 50px;
  }
  .fg--compact .fg-row {
    height: 40px;
  }
}
.fg-block {
  padding: 9px 1px;
  transition:
    left 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    top 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    width 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.fg--compact .fg-block {
  padding: 7px 1px;
}
.fg-block--out {
  opacity: 0;
  pointer-events: none;
}
.fg-block--in {
  opacity: 1;
}
.fg-pill--conflict {
  outline: 2px solid #c2412d;
  outline-offset: 1px;
}
.fg-ring {
  animation: fg-pulse 1.6s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}
.fg--compact .fg-ring {
  inset-block: 5px;
}
.fg-pill--resolved {
  outline: 2px solid #fbba00;
  outline-offset: 1px;
}
.fg-downtime {
  background-image: repeating-linear-gradient(135deg, rgba(194, 65, 45, 0.16) 0 6px, transparent 6px 12px);
  border-left: 1px solid rgba(194, 65, 45, 0.4);
  border-right: 1px solid rgba(194, 65, 45, 0.4);
}
@keyframes fg-pulse {
  0% { opacity: 0.9; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.12, 1.35); }
}
@media (prefers-reduced-motion: reduce) {
  .fg-block { transition: none; }
  .fg-ring { animation: none; opacity: 0; }
}
</style>
