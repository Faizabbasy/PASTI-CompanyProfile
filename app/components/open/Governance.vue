<script setup lang="ts">
// GOVERNANCE, APPROVAL & AUDITABILITY (slides 14, 15, 16) — one section,
// three beats on one idea: control lives inside the process.
// 1. Governance embedded in every step (Request → … → Completion) over the
//    eight governance capabilities, as a ruled matrix.
// 2. Approval: the deck's multi-level example as a working demo. The
//    request walks Reviewer → Approver 1 → Approver 2 → Final while a status
//    card answers what the deck promises the system shows: Who / What /
//    When / Status / Next Action. Runs once when visible; replayable;
//    reduced motion shows the completed state.
// 3. Audit trail: a log built from that same request — roles, not people;
//    no dates, no document numbers (illustration). Rows reveal in order.
const { governance } = useOpen()
const flow = governance.approvalFlow

const laneRef = ref<HTMLElement | null>(null)
const laneIn = useOpenInView(laneRef, 0.35)

// ---- Approval demo ----
const demoRef = ref<HTMLElement | null>(null)
const demoIn = useOpenInView(demoRef, 0.4)
const step = ref(0)
let timer: ReturnType<typeof setInterval> | null = null
const stop = () => {
  if (timer) clearInterval(timer)
  timer = null
}
const run = () => {
  stop()
  step.value = 0
  timer = setInterval(() => {
    if (step.value >= flow.length - 1) return stop()
    step.value++
  }, 1500)
}
watch(demoIn, (v) => {
  if (!v) return
  if (window.matchMedia(reducedMotionQuery.reduce).matches) step.value = flow.length - 1
  else run()
})
onBeforeUnmount(stop)
const done = computed(() => step.value >= flow.length - 1)
// Who acted at each step (roles from the deck's example; "Sistem" at the end).
const who = ['User', 'Reviewer', 'Approver 1', 'Approver 2', 'Final Approver', 'Sistem']
const status = computed(() => [
  { k: 'Who', v: who[step.value] ?? '' },
  { k: 'What', v: flow[step.value]?.body ?? '' },
  { k: 'When', v: 'Tercatat otomatis' },
  { k: 'Status', v: done.value ? 'Completed' : step.value === 0 ? 'Submitted' : 'In approval' },
  { k: 'Next Action', v: done.value ? '—' : flow[step.value + 1]?.label ?? '' }
])

// ---- Audit log (illustration) ----
const logRef = ref<HTMLElement | null>(null)
const logIn = useOpenInView(logRef, 0.25)
const log = [
  { user: 'Requester', action: 'Created request', status: 'Success' },
  { user: 'Reviewer', action: 'Reviewed request', status: 'Success' },
  { user: 'Approver 1', action: 'Approved — level 1', status: 'Success' },
  { user: 'Approver 2', action: 'Approved — level 2', status: 'Success' },
  { user: 'Final Approver', action: 'Final approval', status: 'Success' },
  { user: 'System', action: 'Notification sent', status: 'Info' }
]
</script>

<template>
  <section id="governance" class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 85%; --lift-y: 60%">
    <BaseContainer>
      <OpenTag :n="8" label="Governance, approval & auditability" />

      <!-- 1 · Governance inside the process -->
      <div class="mt-14 grid gap-10 desktop:grid-cols-12 desktop:items-end">
        <OpenHeading class="desktop:col-span-8" :lines="governance.title" size="lg" />
        <p class="max-w-[26rem] text-[16px] leading-[1.65] text-[color:rgba(3,60,89,0.78)] desktop:col-span-4">{{ governance.body }}</p>
      </div>

      <div ref="laneRef" class="mt-14" :class="{ 'is-in': laneIn }">
        <p class="font-display text-[15px] font-bold text-slateNavy">Governance embedded in every step</p>
        <ol class="relative mt-6 grid gap-5 tablet:grid-cols-5 tablet:gap-3">
          <span aria-hidden="true" class="op-draw absolute left-3 right-3 top-[15px] hidden h-[2px] bg-pastiYellow-500 tablet:block" />
          <span aria-hidden="true" class="op-drawy absolute bottom-3 left-[15px] top-3 w-[2px] bg-pastiYellow-500 tablet:hidden" />
          <li v-for="(e, i) in governance.embedded" :key="e.label" class="relative flex gap-4 tablet:block">
            <span class="op-pop relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slateNavy text-pastiYellow-500" :style="{ '--d': `${200 + i * 120}ms` }">
              <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
            </span>
            <span class="block tablet:mt-4">
              <span class="block font-display text-[19px] font-extrabold tracking-[-0.015em] text-slateNavy">{{ e.label }}</span>
              <span class="mt-1 block text-[14px] text-[color:rgba(3,60,89,0.68)]">{{ e.body }}</span>
            </span>
          </li>
        </ol>
        <p class="mt-6 text-[14.5px] font-medium text-slateNavy">{{ governance.embeddedLine }}</p>
      </div>

      <ul class="mt-12 grid grid-cols-2 border-l border-t border-[color:rgba(3,60,89,0.12)] desktop:grid-cols-4">
        <li v-for="c in governance.capabilities" :key="c.label" class="border-b border-r border-[color:rgba(3,60,89,0.12)] bg-[color:rgba(255,255,255,0.6)] p-4 tablet:p-6">
          <p class="font-display text-[16px] font-extrabold tracking-[-0.015em] text-slateNavy tablet:text-[18px]">{{ c.label }}</p>
          <p class="mt-2 text-[13px] leading-snug tablet:text-[14px] text-[color:rgba(3,60,89,0.7)]">{{ c.body }}</p>
        </li>
      </ul>

      <!-- 2 · Approval -->
      <div class="mt-24 grid gap-12 desktop:mt-32 desktop:grid-cols-12 desktop:gap-10">
        <div class="desktop:col-span-5">
          <OpenHeading :lines="governance.approvalTitle" size="md" :lede="governance.approvalBody" />
          <div class="mt-8 rounded-[20px] bg-[color:rgba(251,186,0,0.14)] p-6">
            <p class="text-[14px] text-[color:rgba(3,60,89,0.75)]">{{ governance.approvalQuestionIntro }}</p>
            <p class="mt-1 font-display text-[24px] font-extrabold tracking-[-0.02em] text-slateNavy">{{ governance.approvalQuestion }}</p>
            <p class="mt-4 text-[14px] text-[color:rgba(3,60,89,0.75)]">Sistem akan menunjukkan:</p>
            <p class="mt-1 font-display text-[16px] font-bold text-slateNavy">{{ governance.approvalShows.join(' → ') }}</p>
          </div>
        </div>

        <div ref="demoRef" class="desktop:col-span-7">
          <div class="rounded-[24px] border border-[color:rgba(3,60,89,0.12)] bg-pureWhite p-5 shadow-[0_50px_100px_-70px_rgba(3,60,89,0.7)] tablet:p-7">
            <div class="flex items-center justify-between gap-3">
              <p class="flex items-center gap-2 font-display text-[15px] font-extrabold text-slateNavy"><OpenMark :size="18" />Multi-level approval flow</p>
              <button type="button" class="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[color:rgba(3,60,89,0.18)] px-3 text-[12.5px] font-bold text-slateNavy hover:border-slateNavy" @click="run">
                <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2.5 8a5.5 5.5 0 109.4-3.9M12 1.5v3h-3" /></svg>
                Ulangi
              </button>
            </div>
            <ol class="mt-6 grid grid-cols-3 gap-y-5 tablet:grid-cols-6">
              <li v-for="(f, i) in flow" :key="f.label" class="relative flex flex-col items-center text-center" :aria-current="i === step ? 'step' : undefined">
                <span v-if="i" aria-hidden="true" class="absolute right-1/2 top-[15px] hidden h-[2px] w-full tablet:block" :class="i <= step ? 'bg-pastiYellow-500' : 'bg-[color:rgba(3,60,89,0.12)]'" />
                <span
                  class="relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 transition-[background-color,border-color,box-shadow] duration-500 ease-editorial"
                  :class="i < step || (done && i === step) ? 'border-slateNavy bg-slateNavy text-pastiYellow-500' : i === step ? 'border-pastiYellow-500 bg-pastiYellow-500 text-slateNavy shadow-[0_0_0_6px_rgba(251,186,0,0.2)]' : 'border-[color:rgba(3,60,89,0.18)] bg-pureWhite text-[color:rgba(3,60,89,0.45)]'"
                >
                  <svg v-if="i < step || done" viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
                  <span v-else class="op-num font-display text-[11px] font-bold">{{ i + 1 }}</span>
                </span>
                <span class="mt-2 font-display text-[12.5px] font-bold leading-tight text-slateNavy">{{ f.label }}</span>
              </li>
            </ol>
            <dl class="mt-7 grid grid-cols-2 overflow-hidden rounded-[16px] bg-slateNavy text-pureWhite tablet:grid-cols-5">
              <div v-for="s in status" :key="s.k" class="border-b border-r border-[color:rgba(255,255,255,0.1)] px-4 py-4 tablet:border-b-0 tablet:last:border-r-0">
                <dt class="text-[12px] text-[color:rgba(255,255,255,0.55)]">{{ s.k }}</dt>
                <dd class="mt-1 font-display text-[14px] font-bold leading-snug" :class="s.k === 'Status' ? 'text-pastiYellow-500' : ''">{{ s.v }}</dd>
              </div>
            </dl>
            <p class="mt-4 text-[13px] text-[color:rgba(3,60,89,0.6)]">{{ governance.approvalLine }} Contoh alur — jumlah level mengikuti authority matrix organisasi.</p>
          </div>
        </div>
      </div>

      <ul class="mt-10 grid gap-x-8 border-t border-[color:rgba(3,60,89,0.12)] tablet:grid-cols-2 desktop:grid-cols-4">
        <li v-for="f in governance.approvalFeatures" :key="f.label" class="border-b border-[color:rgba(3,60,89,0.12)] py-5">
          <p class="font-display text-[16.5px] font-extrabold text-slateNavy">{{ f.label }}</p>
          <p class="mt-1.5 text-[13.5px] leading-snug text-[color:rgba(3,60,89,0.68)]">{{ f.body }}</p>
        </li>
      </ul>

      <!-- 3 · Audit trail -->
      <div class="mt-24 grid gap-12 desktop:mt-32 desktop:grid-cols-12 desktop:gap-10">
        <div class="desktop:col-span-5">
          <OpenHeading :lines="governance.auditTitle" size="md" :lede="governance.auditIntro" />
          <ul class="mt-6 flex flex-wrap gap-2">
            <li v-for="f in governance.auditFields" :key="f" class="rounded-full border border-slateNavy px-3.5 py-1.5 text-[13.5px] font-bold text-slateNavy">{{ f }}</li>
          </ul>
          <p class="mt-10 font-display text-[length:clamp(22px,2.2vw,30px)] font-extrabold leading-[1.15] tracking-[-0.02em] text-slateNavy">{{ governance.auditQuote[0] }}<br><span class="text-[color:rgba(3,60,89,0.42)]">{{ governance.auditQuote[1] }}</span></p>
        </div>

        <div ref="logRef" class="desktop:col-span-7" :class="{ 'is-in': logIn }">
          <div class="overflow-hidden rounded-[24px] border border-[color:rgba(3,60,89,0.12)] bg-pureWhite shadow-[0_50px_100px_-70px_rgba(3,60,89,0.7)]">
            <div class="flex items-center justify-between border-b border-[color:rgba(3,60,89,0.08)] px-5 py-4">
              <p class="flex items-center gap-2 font-display text-[15px] font-extrabold text-slateNavy"><OpenMark :size="18" />Audit Log</p>
              <span class="text-[12px] text-[color:rgba(3,60,89,0.5)]">Ilustrasi</span>
            </div>
            <table class="w-full text-left">
              <thead class="hidden tablet:table-header-group">
                <tr class="text-[12px] text-[color:rgba(3,60,89,0.55)]">
                  <th scope="col" class="px-5 py-3 font-semibold">Timestamp</th>
                  <th scope="col" class="px-3 py-3 font-semibold">User</th>
                  <th scope="col" class="px-3 py-3 font-semibold">Action</th>
                  <th scope="col" class="px-3 py-3 font-semibold">Document</th>
                  <th scope="col" class="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in log" :key="r.action" class="op-fade grid grid-cols-[1fr_auto] gap-x-3 border-t border-[color:rgba(3,60,89,0.07)] px-5 py-3.5 tablet:table-row tablet:px-0 tablet:py-0" :style="{ '--d': `${i * 120}ms` }">
                  <td class="op-num text-[12.5px] text-[color:rgba(3,60,89,0.45)] tablet:px-5 tablet:py-3.5">hh:mm</td>
                  <td class="col-start-1 font-display text-[14px] font-bold text-slateNavy tablet:px-3 tablet:py-3.5">{{ r.user }}</td>
                  <td class="col-start-1 text-[13.5px] text-slateNavy tablet:px-3 tablet:py-3.5">{{ r.action }}</td>
                  <td class="hidden text-[13px] text-[color:rgba(3,60,89,0.6)] tablet:table-cell tablet:px-3 tablet:py-3.5">Request</td>
                  <td class="col-start-2 row-span-3 row-start-1 self-center tablet:px-5 tablet:py-3.5">
                    <span class="rounded-full px-2.5 py-1 text-[11.5px] font-bold" :class="r.status === 'Success' ? 'bg-[color:rgba(3,60,89,0.08)] text-slateNavy' : 'bg-[color:rgba(251,186,0,0.22)] text-slateNavy'">{{ r.status }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="mt-4 text-[14px] font-medium text-slateNavy">{{ governance.auditLine }}</p>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
