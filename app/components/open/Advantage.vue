<script setup lang="ts">
// OPEN ADVANTAGE & COMPARISON (slides 23, 24, 25).
// Six advantages, each carrying one sixth of OPEN's ring — together they
// close it. Then the deck's comparison (Traditional SaaS / Build From
// Scratch / OPEN) as a real table from tablet up, recomposed per criterion
// on phones; the "Ownership Potential" row is left out pending approval.
// Last, the difference in one line and two flows: SaaS gives you a product,
// OPEN gives you a foundation to build your system.
const { advantage } = useOpen()
const ringRef = ref<HTMLElement | null>(null)
const ringIn = useOpenInView(ringRef, 0.25)

const R = 15
const C = 2 * Math.PI * R
const seg = (i: number) => ({ dash: `${C / 6 - 2} ${C}`, rot: -90 + i * 60 })
const cell = (v: string | true | null) => (v === true ? 'Ya' : v === null ? 'Tidak' : v)
</script>

<template>
  <section id="advantage" class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 15%; --lift-y: 40%">
    <BaseContainer>
      <OpenTag :n="11" label="The OPEN advantage" />
      <OpenHeading class="mt-14" :lines="advantage.title" size="xl" />

      <ul ref="ringRef" class="mt-12 grid border-l border-t border-[color:rgba(3,60,89,0.12)] tablet:grid-cols-2 desktop:grid-cols-3" :class="{ 'is-in': ringIn }">
        <li v-for="(a, i) in advantage.items" :key="a.label" class="border-b border-r border-[color:rgba(3,60,89,0.12)] p-6 desktop:p-8">
          <svg viewBox="0 0 40 40" class="h-10 w-10" fill="none" aria-hidden="true">
            <circle cx="20" cy="20" :r="R" stroke="rgba(3,60,89,0.1)" stroke-width="5" />
            <circle
              v-for="k in i + 1"
              :key="k"
              cx="20"
              cy="20"
              :r="R"
              stroke-width="5"
              :stroke="k === i + 1 ? '#FBBA00' : '#033C59'"
              :stroke-dasharray="seg(k - 1).dash"
              :transform="`rotate(${seg(k - 1).rot} 20 20)`"
              class="op-fade"
              :style="{ '--d': `${i * 90 + k * 40}ms` }"
            />
          </svg>
          <p class="mt-6 font-display text-[24px] font-extrabold tracking-[-0.02em] text-slateNavy">{{ a.label }}</p>
          <p class="mt-2 text-[15px] leading-relaxed text-[color:rgba(3,60,89,0.72)]">{{ a.body }}</p>
        </li>
      </ul>

      <!-- Comparison -->
      <div class="mt-24 desktop:mt-32">
        <OpenHeading :lines="advantage.compareTitle" size="md" />

        <div class="mt-10 hidden overflow-hidden rounded-[24px] border border-[color:rgba(3,60,89,0.12)] bg-pureWhite tablet:block">
          <table class="w-full table-fixed text-left">
            <caption class="sr-only">Perbandingan Traditional SaaS, Build From Scratch, dan OPEN</caption>
            <thead>
              <tr>
                <th scope="col" class="w-[31%] px-6 py-5" />
                <th v-for="c in advantage.columns" :key="c" scope="col" class="px-4 py-5 text-center font-display text-[16px] font-extrabold" :class="c === 'OPEN' ? 'bg-slateNavy text-pureWhite' : 'text-slateNavy'">
                  <span v-if="c === 'OPEN'" class="inline-flex items-center gap-2"><OpenMark :size="18" />OPEN</span>
                  <span v-else>{{ c }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in advantage.rows" :key="r.label" class="border-t border-[color:rgba(3,60,89,0.08)]">
                <th scope="row" class="px-6 py-4 font-display text-[15px] font-bold text-slateNavy">{{ r.label }}</th>
                <td v-for="(v, j) in r.values" :key="j" class="px-4 py-4 text-center text-[14.5px]" :class="j === 2 ? 'bg-[color:rgba(3,60,89,0.96)] font-bold text-pureWhite' : 'text-[color:rgba(3,60,89,0.72)]'">
                  <template v-if="v === true">
                    <svg viewBox="0 0 16 16" class="mx-auto h-4 w-4" :class="j === 2 ? 'text-pastiYellow-500' : 'text-slateNavy'" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
                    <span class="sr-only">Ya</span>
                  </template>
                  <template v-else-if="v === null"><span aria-hidden="true">—</span><span class="sr-only">Tidak</span></template>
                  <template v-else>{{ v }}</template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Phones: one criterion at a time -->
        <ul class="mt-8 space-y-3 tablet:hidden">
          <li v-for="r in advantage.rows" :key="r.label" class="overflow-hidden rounded-[18px] border border-[color:rgba(3,60,89,0.12)] bg-pureWhite">
            <p class="px-4 pb-2 pt-4 font-display text-[16px] font-extrabold text-slateNavy">{{ r.label }}</p>
            <dl class="grid grid-cols-3 text-center">
              <div v-for="(v, j) in r.values" :key="j" class="px-2 py-3" :class="j === 2 ? 'bg-slateNavy text-pureWhite' : 'text-slateNavy'">
                <dt class="text-[10.5px] font-semibold leading-tight" :class="j === 2 ? 'text-[color:rgba(255,255,255,0.65)]' : 'text-[color:rgba(3,60,89,0.55)]'">{{ advantage.columns[j] }}</dt>
                <dd class="mt-1 text-[13px] font-bold">{{ v === true ? '✓' : v === null ? '—' : v }}<span v-if="v === true || v === null" class="sr-only">{{ cell(v) }}</span></dd>
              </div>
            </dl>
          </li>
        </ul>
        <p class="m-center mt-5 text-[14px] font-medium text-slateNavy">{{ advantage.compareNote }}</p>
      </div>

      <!-- The difference -->
      <div class="mt-24 desktop:mt-32">
        <p class="m-center max-w-[60rem] op-display text-[length:clamp(30px,4.2vw,62px)] text-slateNavy">
          {{ advantage.difference[0] }} <span class="text-[color:rgba(3,60,89,0.42)]">{{ advantage.difference[1] }}</span>
        </p>
        <div class="mt-12 grid gap-4 desktop:grid-cols-12">
          <div class="rounded-[24px] border border-[color:rgba(3,60,89,0.12)] p-6 desktop:col-span-4 desktop:p-8">
            <p class="font-display text-[15px] font-extrabold text-[color:rgba(3,60,89,0.55)]">SaaS</p>
            <ol class="mt-5 space-y-5">
              <li v-for="s in advantage.saasFlow" :key="s.label">
                <p class="font-display text-[19px] font-extrabold text-[color:rgba(3,60,89,0.6)]">{{ s.label }}</p>
                <p class="mt-1 text-[14px] text-[color:rgba(3,60,89,0.6)]">{{ s.body }}</p>
              </li>
            </ol>
          </div>
          <div class="rounded-[24px] bg-slateNavy p-6 text-pureWhite desktop:col-span-8 desktop:p-8" data-header-theme="dark">
            <p class="flex items-center gap-2 font-display text-[15px] font-extrabold text-pastiYellow-500"><OpenMark :size="18" />OPEN</p>
            <ol class="mt-5 grid gap-x-8 gap-y-5 tablet:grid-cols-2">
              <li v-for="(s, i) in advantage.openFlow" :key="s.label" class="flex gap-4">
                <span class="op-num mt-1 font-display text-[13px] font-bold text-pastiYellow-500">{{ String(i + 1).padStart(2, '0') }}</span>
                <span>
                  <span class="block font-display text-[19px] font-extrabold">{{ s.label }}</span>
                  <span class="mt-1 block text-[14px] text-[color:rgba(255,255,255,0.7)]">{{ s.body }}</span>
                </span>
              </li>
            </ol>
          </div>
        </div>
        <p class="m-center mt-8 font-display text-[20px] font-extrabold text-slateNavy">{{ advantage.differenceLine[0] }} <span class="text-[color:rgba(3,60,89,0.42)]">{{ advantage.differenceLine[1] }}</span></p>
      </div>
    </BaseContainer>
  </section>
</template>
