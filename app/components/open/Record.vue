<script setup lang="ts">
// Hero product slice — an OPEN procurement record, rebuilt as UI (not a
// screenshot, no device frame). From slide 3's overview screen: the process
// lifecycle (Request → … → Closing), the approval flow by role, and the
// governance rail. Structure only: no figures, no people, no company names.
// While on screen the record advances one lifecycle step every ~2.6s (one
// reactive index; CSS does the rest) and every step leaves a line in the
// trace. Paused off-screen; static at the last step under reduced motion.
const { hero } = useOpen()
const steps = hero.lifecycle
const roles = ['Procurement Officer', 'Manager', 'Head of Division', 'Procurement Head']

const rootRef = ref<HTMLElement | null>(null)
const visible = useOpenVisible(rootRef)
const active = ref(2)
let timer: ReturnType<typeof setInterval> | null = null

const reduced = () => import.meta.client && window.matchMedia(reducedMotionQuery.reduce).matches
const stop = () => {
  if (timer) clearInterval(timer)
  timer = null
}
watch(visible, (v) => {
  stop()
  if (!v || reduced()) return
  timer = setInterval(() => {
    active.value = (active.value + 1) % steps.length
  }, 2600)
})
onMounted(() => {
  if (reduced()) active.value = steps.length - 1
})
onBeforeUnmount(stop)

// Roles that have signed so far: approval is step 2, so the chain fills
// as the record passes it.
const signed = computed(() => (active.value < 2 ? 0 : active.value === 2 ? 2 : roles.length))
const trace = computed(() => steps.slice(0, active.value + 1).slice(-3).reverse())
</script>

<template>
  <div ref="rootRef" class="relative">
    <div class="overflow-hidden rounded-[26px] border border-[color:rgba(3,60,89,0.1)] bg-pureWhite shadow-[0_60px_120px_-60px_rgba(3,60,89,0.55)]">
      <!-- Title bar -->
      <div class="flex items-center gap-3 border-b border-[color:rgba(3,60,89,0.08)] px-5 py-4">
        <OpenMark :size="20" />
        <span class="font-display text-[15px] font-extrabold tracking-[-0.01em] text-slateNavy">Procurement Overview</span>
        <span class="ml-auto hidden h-7 w-28 rounded-full bg-[color:rgba(3,60,89,0.05)] tablet:block" />
      </div>

      <div class="grid tablet:grid-cols-[1fr_168px]">
        <div class="p-5 tablet:p-6">
          <!-- Lifecycle -->
          <p class="font-display text-[13px] font-bold text-slateNavy">Process Lifecycle</p>
          <ol class="relative mt-5 grid grid-cols-6" aria-label="Process lifecycle">
            <span aria-hidden="true" class="absolute left-[8.33%] right-[8.33%] top-[13px] h-[2px] bg-[color:rgba(3,60,89,0.1)]" />
            <span
              aria-hidden="true"
              class="absolute left-[8.33%] top-[13px] h-[2px] origin-left bg-pastiYellow-500 transition-[width] duration-700 ease-editorial"
              :style="{ width: `${(active / (steps.length - 1)) * 83.33}%` }"
            />
            <li v-for="(s, i) in steps" :key="s" class="relative flex flex-col items-center gap-2" :aria-current="i === active ? 'step' : undefined">
              <span
                class="relative z-10 grid h-7 w-7 place-items-center rounded-full border-2 transition-[background-color,border-color,box-shadow] duration-500 ease-editorial"
                :class="i < active ? 'border-slateNavy bg-slateNavy text-pastiYellow-500' : i === active ? 'border-pastiYellow-500 bg-pastiYellow-500 text-slateNavy shadow-[0_0_0_6px_rgba(251,186,0,0.2)]' : 'border-[color:rgba(3,60,89,0.18)] bg-pureWhite text-transparent'"
              >
                <svg viewBox="0 0 16 16" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
              </span>
              <span class="text-center font-display text-[10.5px] font-semibold leading-tight tablet:text-[11.5px]" :class="i <= active ? 'text-slateNavy' : 'text-[color:rgba(3,60,89,0.42)]'">{{ s }}</span>
            </li>
          </ol>

          <!-- Approval flow + trace -->
          <div class="mt-7 grid gap-5 border-t border-[color:rgba(3,60,89,0.08)] pt-5 tablet:grid-cols-2">
            <div>
              <p class="font-display text-[13px] font-bold text-slateNavy">Approval Flow</p>
              <ol class="mt-3 space-y-2.5">
                <li v-for="(r, i) in roles" :key="r" class="flex items-center gap-2.5">
                  <span
                    class="grid h-5 w-5 shrink-0 place-items-center rounded-full transition-colors duration-500"
                    :class="i < signed ? 'bg-slateNavy text-pastiYellow-500' : 'border border-[color:rgba(3,60,89,0.2)] text-transparent'"
                  >
                    <svg viewBox="0 0 16 16" class="h-2.5 w-2.5" fill="none" stroke="currentColor" stroke-width="2.8" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
                  </span>
                  <span class="text-[12.5px] font-semibold text-slateNavy">{{ r }}</span>
                </li>
              </ol>
            </div>
            <div aria-live="off">
              <p class="font-display text-[13px] font-bold text-slateNavy">Audit Trail</p>
              <TransitionGroup tag="ol" name="rec" class="relative mt-3 space-y-2">
                <li v-for="(t, i) in trace" :key="t" class="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2" :class="i === 0 ? 'bg-[color:rgba(251,186,0,0.14)]' : 'bg-[color:rgba(3,60,89,0.04)]'">
                  <span class="h-1.5 w-1.5 shrink-0 rounded-full" :class="i === 0 ? 'bg-pastiYellow-500' : 'bg-[color:rgba(3,60,89,0.3)]'" />
                  <span class="text-[12px] font-semibold text-slateNavy">{{ t }}</span>
                  <span class="ml-auto text-[11px] text-[color:rgba(3,60,89,0.5)]">recorded</span>
                </li>
              </TransitionGroup>
            </div>
          </div>
        </div>

        <!-- Governance rail (slide 3) -->
        <ul class="hidden border-l border-[color:rgba(3,60,89,0.08)] bg-[color:rgba(3,60,89,0.025)] tablet:block">
          <li v-for="(g, i) in hero.rail" :key="g.label" class="border-b border-[color:rgba(3,60,89,0.06)] px-4 py-3 last:border-0">
            <span class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full transition-colors duration-500" :class="i === active % hero.rail.length ? 'bg-pastiYellow-500' : 'bg-[color:rgba(3,60,89,0.2)]'" />
              <span class="font-display text-[12px] font-bold text-slateNavy">{{ g.label }}</span>
            </span>
            <span class="mt-0.5 block pl-3.5 text-[10.5px] leading-snug text-[color:rgba(3,60,89,0.58)]">{{ g.body }}</span>
          </li>
        </ul>
      </div>
    </div>
    <p class="mt-3 text-right text-[11px] text-[color:rgba(3,60,89,0.45)]">Ilustrasi antarmuka OPEN</p>
  </div>
</template>

<style scoped>
.rec-enter-active,
.rec-move {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.rec-leave-active {
  position: absolute;
  inset-inline: 0;
  transition: opacity 0.3s;
}
.rec-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.rec-leave-to {
  opacity: 0;
}
</style>
