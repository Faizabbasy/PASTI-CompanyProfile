<script setup lang="ts">
// 06 AVAILABILITY TO ACTION — "See the shortage. Understand the risk.
// Review the action." Three linked panels on the same sample material:
// the shortfall against requirement, the context that makes it risky (lead
// time, incoming supply, stock under condition review, criticality), and a
// replenishment recommendation that stays *pending review*. The visitor
// can act as the reviewer — approve, or return with a reason — and the
// card records the decision as evidence. Nothing is purchased; source §6
// is explicit that replenishment remains under governance.
const { availability, sample } = useMatrixPage()
const sectionRef = ref<HTMLElement | null>(null)
useMatrixReveal(sectionRef)

const net = netAvailable(sample.mix)
const short = Math.max(0, (sample.mix.requirement ?? 0) - net)
const decision = ref<'pending' | 'approved' | 'returned'>('pending')
const risk = [
  { l: 'Criticality', v: sample.criticality },
  { l: 'Lead time', v: '6 weeks' },
  { l: 'Incoming supply', v: `${availability.incoming.qty} ${sample.unit} · ${availability.incoming.eta}` },
  { l: 'Condition review', v: `${sample.mix.quarantine} ${sample.unit} in quarantine` }
]
const statusText = computed(() => ({ pending: 'Pending review', approved: 'Approved · evidence recorded', returned: 'Returned with reason' })[decision.value])
</script>

<template>
  <section ref="sectionRef" class="relative bg-pureWhite py-24 tablet:py-32">
    <BaseContainer class="relative z-10">
      <MatrixBinLabel :index="6" name="Availability to action" surface="light" class="mb-12 desktop:mb-16" />
      <MatrixHeading :eyebrow="availability.eyebrow" :title="availability.headline" :lede="availability.lede" />

      <ol class="mt-14 grid gap-3 desktop:grid-cols-3">
        <!-- See -->
        <li class="relative rounded-[22px] bg-surfaceNeutral p-6 ring-1 ring-[color:rgba(3,60,89,0.08)]">
          <div data-fr>
            <p class="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.55)]">01 · See the shortage</p>
            <p class="mt-3 font-display text-[40px] font-extrabold leading-none text-slateNavy">−{{ short }} <span class="text-[18px]">{{ sample.unit }}</span></p>
            <p class="mt-1 text-[14px] text-[color:rgba(3,60,89,0.7)]">Net available {{ net }} vs requirement {{ sample.mix.requirement }}</p>
            <div class="mt-12"><MatrixStockBar :mix="sample.mix" requirement :legend="false" /></div>
          </div>
        </li>

        <!-- Understand -->
        <li class="relative rounded-[22px] bg-surfaceNeutral p-6 ring-1 ring-[color:rgba(3,60,89,0.08)]">
          <div data-fr>
            <p class="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.55)]">02 · Understand the risk</p>
            <dl class="mt-4 divide-y divide-[color:rgba(3,60,89,0.08)]">
              <div v-for="r in risk" :key="r.l" class="flex items-baseline justify-between gap-4 py-2.5">
                <dt class="text-[13.5px] text-[color:rgba(3,60,89,0.65)]">{{ r.l }}</dt>
                <dd class="text-right font-display text-[15px] font-bold text-slateNavy">{{ r.v }}</dd>
              </div>
            </dl>
            <p class="mt-3 text-[13px] leading-snug text-[color:rgba(3,60,89,0.65)]">Incoming supply arrives after the requirement date — the gap stays open unless something changes.</p>
          </div>
        </li>

        <!-- Review -->
        <li class="relative rounded-[22px] bg-slateNavy p-6 text-pureWhite">
          <div data-fr>
            <p class="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.6)]">03 · Review the action</p>
            <p class="mt-3 font-display text-[18px] font-bold">Replenishment recommendation</p>
            <dl class="mt-3 grid grid-cols-2 gap-3 text-[13px]">
              <div><dt class="text-[color:rgba(255,255,255,0.6)]">Proposed quantity</dt><dd class="mt-0.5 font-display text-[22px] font-extrabold">{{ availability.recommendation.qty }} {{ sample.unit }}</dd></div>
              <div><dt class="text-[color:rgba(255,255,255,0.6)]">Basis</dt><dd class="mt-0.5 font-semibold leading-snug">Shortfall + minimum stock</dd></div>
            </dl>
            <p class="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em]" :class="decision === 'approved' ? 'bg-pastiYellow-500 text-slateNavy' : decision === 'returned' ? 'bg-[color:rgba(255,138,115,0.18)] text-[#FFB4A6]' : 'bg-[color:rgba(255,255,255,0.1)] text-pureWhite'" aria-live="polite">
              <span aria-hidden="true" class="h-1.5 w-1.5 rounded-full" :class="decision === 'approved' ? 'bg-slateNavy' : decision === 'returned' ? 'bg-[#FF8A73]' : 'bg-pastiYellow-500'" />{{ statusText }}
            </p>
            <p v-if="decision === 'returned'" class="mt-2 text-[13px] text-[color:rgba(255,255,255,0.75)]">Reason: “Check incoming supply date with the supplier first.”</p>
            <p v-else-if="decision === 'approved'" class="mt-2 text-[13px] text-[color:rgba(255,255,255,0.75)]">Approver role, time and reference are kept with the record.</p>
            <div class="mt-5 flex flex-wrap gap-2">
              <template v-if="decision === 'pending'">
                <button type="button" class="inline-flex min-h-10 items-center rounded-full bg-pureWhite px-4 font-display text-[13px] font-bold text-slateNavy transition-colors duration-300 hover:bg-pastiYellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pastiYellow-500" @click="decision = 'approved'">Approve</button>
                <button type="button" class="inline-flex min-h-10 items-center rounded-full px-4 font-display text-[13px] font-semibold ring-1 ring-[color:rgba(255,255,255,0.3)] transition-colors duration-300 hover:bg-[color:rgba(255,255,255,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pastiYellow-500" @click="decision = 'returned'">Return with reason</button>
              </template>
              <button v-else type="button" class="inline-flex min-h-10 items-center rounded-full px-4 font-display text-[13px] font-semibold underline decoration-pastiYellow-500 decoration-2 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pastiYellow-500" @click="decision = 'pending'">Reset the example</button>
            </div>
          </div>
        </li>
      </ol>
      <p data-fr="fade" class="m-center mt-5 flex items-start gap-2 text-[13.5px] leading-relaxed text-[color:rgba(3,60,89,0.7)] max-desktop:justify-center">
        <svg viewBox="0 0 16 16" class="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="8" cy="8" r="6.5" /><path d="M8 7v4.5M8 4.6v.2" stroke-linecap="round" /></svg>
        {{ availability.note }} Illustrative values.
      </p>
    </BaseContainer>
  </section>
</template>
