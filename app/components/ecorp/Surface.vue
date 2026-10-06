<script setup lang="ts">
// ENTERPRISE OPERATING SURFACE — the hero visual. A UI-native slice of an
// e-CORPORATE workspace: navigation rail (workflow, approvals, documents,
// monitoring, information, people), one internal request moving through its
// steps by role, attached documents, process status and an approval prompt.
// Structure only: no numbers, no charts, no names — roles are generic.
// The active step advances every ~2.4s while visible (one class swap, no
// layout work); reduced motion holds a finished-looking static state.
// Mobile gets a recomposed slice (lane + approval), not a scaled desktop.
// `focus` comes from the hero headline (hover/focus on people · processes ·
// information): the matching region of the surface lights up, the rest
// recedes — the headline and the product read as one statement.
const props = defineProps<{ focus?: 'people' | 'processes' | 'information' | null }>()
const region = (r: 'people' | 'processes' | 'information') =>
  !props.focus ? '' : props.focus === r ? 'es-on' : 'es-off'

const rail = ['Workflow', 'Approvals', 'Documents', 'Monitoring', 'Information', 'People']
const steps = [
  { label: 'Submitted', role: 'Requester' },
  { label: 'Reviewed', role: 'Department head' },
  { label: 'Approved', role: 'Approver' },
  { label: 'Recorded', role: 'Information owner' }
]
const docs = ['Request form', 'Supporting document', 'Approval note']
const status = [
  { label: 'In review', tone: 'navy' },
  { label: 'Waiting for approval', tone: 'yellow' },
  { label: 'Completed', tone: 'done' }
]

const active = ref(2)
const rootRef = ref<HTMLElement | null>(null)

let timer: ReturnType<typeof setInterval> | undefined
let io: IntersectionObserver | undefined
onMounted(() => {
  if (window.matchMedia(reducedMotionQuery.reduce).matches) return
  const start = () => {
    if (timer) return
    timer = setInterval(() => (active.value = (active.value + 1) % steps.length), 2400)
  }
  const stop = () => {
    clearInterval(timer)
    timer = undefined
  }
  io = new IntersectionObserver(([e]) => (e?.isIntersecting ? start() : stop()), { threshold: 0.2 })
  if (rootRef.value) io.observe(rootRef.value)
})
onBeforeUnmount(() => {
  clearInterval(timer)
  io?.disconnect()
})

const stateOf = (i: number) => (i < active.value ? 'done' : i === active.value ? 'active' : 'next')
</script>

<template>
  <div
    ref="rootRef"
    role="img"
    aria-label="Illustration of an e-CORPORATE workspace: an internal request moving from submission to review, approval and record, with roles, documents and process status in one environment."
    class="relative"
  >
    <div aria-hidden="true">
      <!-- Desktop / tablet: full surface -->
      <div class="hidden overflow-hidden rounded-[14px] border border-[color:rgba(3,60,89,0.14)] bg-pureWhite shadow-[0_50px_100px_-60px_rgba(3,60,89,0.7)] tablet:block">
        <!-- Top bar -->
        <div class="flex items-center justify-between border-b border-[color:rgba(3,60,89,0.1)] bg-slateNavy px-5 py-3">
          <span class="flex items-center gap-3">
            <EcorpWordmark surface="dark" class="text-[14px]" />
            <span class="h-3 w-px bg-[color:rgba(255,255,255,0.25)]" />
            <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:rgba(255,255,255,0.6)]">Workspace</span>
          </span>
          <span class="es-region flex items-center gap-1.5" :class="region('people')">
            <span v-for="r in ['RQ', 'DH', 'AP']" :key="r" class="grid h-6 w-6 place-items-center rounded-full border border-[color:rgba(255,255,255,0.25)] font-mono text-[9px] text-pureWhite">{{ r }}</span>
          </span>
        </div>

        <div class="grid grid-cols-12">
          <!-- Rail -->
          <ul class="es-region col-span-3 border-r border-[color:rgba(3,60,89,0.08)] py-3" :class="region('people')">
            <li
              v-for="(r, i) in rail"
              :key="r"
              class="flex items-center gap-2.5 px-4 py-2 font-display text-[12px] font-semibold"
              :class="i === 0 ? 'border-l-2 border-pastiYellow-500 bg-[color:rgba(3,60,89,0.04)] text-slateNavy' : 'border-l-2 border-transparent text-[color:rgba(3,60,89,0.55)]'"
            >
              <span class="h-1.5 w-1.5" :class="i === 0 ? 'bg-pastiYellow-500' : 'bg-[color:rgba(3,60,89,0.25)]'" />{{ r }}
            </li>
          </ul>

          <!-- Main -->
          <div class="col-span-9 p-5">
            <div class="es-region" :class="region('processes')">
            <div class="flex items-baseline justify-between">
              <span class="font-display text-[15px] font-bold text-slateNavy">Internal request</span>
              <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.5)]">Workflow</span>
            </div>

            <!-- Workflow lane -->
            <ol class="relative mt-5 grid grid-cols-4 gap-2">
              <span class="absolute left-[12%] right-[12%] top-[11px] h-px bg-[color:rgba(3,60,89,0.14)]" />
              <span class="es-fill absolute left-[12%] top-[11px] h-px bg-pastiYellow-500" :style="{ width: `${(active / (steps.length - 1)) * 76}%` }" />
              <li v-for="(s, i) in steps" :key="s.label" class="relative flex flex-col items-center text-center">
                <span
                  class="es-node relative grid h-[23px] w-[23px] place-items-center border"
                  :class="{
                    'border-pastiYellow-500 bg-pastiYellow-500 text-slateNavy': stateOf(i) === 'done',
                    'border-slateNavy bg-slateNavy text-pureWhite es-pulse': stateOf(i) === 'active',
                    'border-[color:rgba(3,60,89,0.25)] bg-pureWhite text-[color:rgba(3,60,89,0.4)]': stateOf(i) === 'next'
                  }"
                >
                  <svg v-if="stateOf(i) === 'done'" viewBox="0 0 16 16" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M3 8.5l3 3 7-7" /></svg>
                  <span v-else class="font-mono text-[9px]">{{ i + 1 }}</span>
                </span>
                <span class="mt-2 font-display text-[12px] font-bold text-slateNavy">{{ s.label }}</span>
                <span class="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[color:rgba(3,60,89,0.5)]">{{ s.role }}</span>
              </li>
            </ol>
            </div>

            <div class="es-region mt-6 grid grid-cols-2 gap-3" :class="region('information')">
              <!-- Documents -->
              <div class="border border-[color:rgba(3,60,89,0.1)]">
                <div class="border-b border-[color:rgba(3,60,89,0.08)] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.55)]">Documents</div>
                <ul class="px-3 py-1">
                  <li v-for="d in docs" :key="d" class="flex items-center gap-2 border-b border-[color:rgba(3,60,89,0.06)] py-2 font-display text-[11px] font-semibold text-slateNavy last:border-0">
                    <svg viewBox="0 0 16 16" class="h-3.5 w-3.5 shrink-0 text-[color:rgba(3,60,89,0.45)]" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 1.5h5.5L13 5v9.5H4z M9.5 1.5V5H13" /></svg>
                    {{ d }}
                  </li>
                </ul>
              </div>
              <!-- Monitoring -->
              <div class="border border-[color:rgba(3,60,89,0.1)]">
                <div class="border-b border-[color:rgba(3,60,89,0.08)] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.55)]">Monitoring</div>
                <ul class="px-3 py-1">
                  <li v-for="s in status" :key="s.label" class="flex items-center gap-2 border-b border-[color:rgba(3,60,89,0.06)] py-2 font-display text-[11px] font-semibold text-slateNavy last:border-0">
                    <span class="h-2 w-2 shrink-0" :class="s.tone === 'yellow' ? 'bg-pastiYellow-500' : s.tone === 'navy' ? 'bg-slateNavy' : 'border border-slateNavy'" />
                    {{ s.label }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Approval prompt (edge-bled overlay, desktop/tablet) -->
      <div class="absolute -bottom-20 -left-6 hidden w-[240px] border border-[color:rgba(3,60,89,0.12)] bg-pureWhite p-4 shadow-[0_30px_60px_-30px_rgba(3,60,89,0.7)] tablet:block desktop:-left-12">
        <div class="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.55)]">
          <span class="h-1.5 w-1.5 bg-pastiYellow-500" />Approval required
        </div>
        <p class="mt-2 font-display text-[13px] font-bold text-slateNavy">Internal request · Step 3</p>
        <div class="mt-3 flex gap-2">
          <span class="flex-1 bg-slateNavy py-1.5 text-center font-display text-[11px] font-bold text-pureWhite">Approve</span>
          <span class="flex-1 border border-[color:rgba(3,60,89,0.2)] py-1.5 text-center font-display text-[11px] font-bold text-slateNavy">Review</span>
        </div>
      </div>

      <!-- Mobile: recomposed slice -->
      <div class="overflow-hidden rounded-[12px] border border-[color:rgba(3,60,89,0.14)] bg-pureWhite tablet:hidden">
        <div class="flex items-center justify-between bg-slateNavy px-4 py-3">
          <EcorpWordmark surface="dark" class="text-[13px]" />
          <span class="font-mono text-[9px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.6)]">Internal request</span>
        </div>
        <ol class="px-4 py-2">
          <li v-for="(s, i) in steps" :key="s.label" class="flex items-center gap-3 border-b border-[color:rgba(3,60,89,0.06)] py-2.5 last:border-0">
            <span
              class="es-node grid h-6 w-6 shrink-0 place-items-center border"
              :class="{
                'border-pastiYellow-500 bg-pastiYellow-500 text-slateNavy': stateOf(i) === 'done',
                'border-slateNavy bg-slateNavy text-pureWhite': stateOf(i) === 'active',
                'border-[color:rgba(3,60,89,0.25)] text-[color:rgba(3,60,89,0.4)]': stateOf(i) === 'next'
              }"
            >
              <svg v-if="stateOf(i) === 'done'" viewBox="0 0 16 16" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M3 8.5l3 3 7-7" /></svg>
              <span v-else class="font-mono text-[9px]">{{ i + 1 }}</span>
            </span>
            <span class="flex-1 font-display text-[14px] font-bold text-slateNavy">{{ s.label }}</span>
            <span class="font-mono text-[9px] uppercase tracking-[0.1em] text-[color:rgba(3,60,89,0.5)]">{{ s.role }}</span>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<style scoped>
.es-region {
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.es-off {
  opacity: 0.28;
}
.es-on {
  box-shadow: 0 0 0 2px #fbba00;
}
.es-fill {
  transition: width 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.es-node {
  transition: background-color 0.4s ease, border-color 0.4s ease, color 0.4s ease;
}
@media (prefers-reduced-motion: no-preference) {
  .es-pulse {
    box-shadow: 0 0 0 0 rgba(3, 60, 89, 0.3);
    animation: es-pulse 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  }
}
@keyframes es-pulse {
  70% {
    box-shadow: 0 0 0 8px rgba(3, 60, 89, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(3, 60, 89, 0);
  }
}
</style>
