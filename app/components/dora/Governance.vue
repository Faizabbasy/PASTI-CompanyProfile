<script setup lang="ts">
// 10 ACCESS, PRIVACY & GOVERNANCE — the five role concepts from the
// blueprint (§3.1, §9) as a role picker: each shows its baseline access,
// labelled as a baseline agreed per implementation. Four safe access
// principles and the privacy-policy stance follow. Deliberately no audit-
// trail, SSO/MFA or encryption claim (design recommendations / open
// decisions in the source — docs/dora/00).
const { governance } = useDoraPage()
const t = useT()
const sectionRef = ref<HTMLElement | null>(null)
const picked = ref(2)
const role = computed(() => governance.roles[picked.value]!)
const pad = (n: number) => String(n).padStart(2, '0')
useFastReveal(sectionRef)
</script>

<template>
  <section ref="sectionRef" class="relative bg-pureWhite py-24 tablet:py-32">
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="DORA" meta="10 / 13" class="mb-12 desktop:mb-16" />
      <div class="grid gap-12 desktop:grid-cols-12 desktop:gap-10">
        <div class="desktop:col-span-5">
          <DoraHeading size="md" :eyebrow="governance.eyebrow" :title="governance.headline" :lede="governance.lede" />
          <ul class="mt-8 grid gap-2">
            <li v-for="(p, i) in governance.principles" :key="i" data-fr class="flex items-start gap-3 rounded-[14px] bg-surfaceNeutral px-4 py-3 text-[14.5px] font-semibold leading-snug text-slateNavy">
              <svg viewBox="0 0 16 16" class="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="7" width="10" height="7.5" rx="1.5" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" /></svg>
              {{ p }}
            </li>
          </ul>
        </div>

        <div class="desktop:col-span-7">
          <div data-fr class="overflow-hidden rounded-[22px] ring-1 ring-[color:rgba(3,60,89,0.12)]">
            <ul class="grid grid-cols-1 border-b border-[color:rgba(3,60,89,0.1)] bg-surfaceNeutral tablet:grid-cols-5" :aria-label="t('Roles')">
              <li v-for="(r, i) in governance.roles" :key="i" class="border-[color:rgba(3,60,89,0.08)] max-tablet:border-b tablet:border-r tablet:last:border-r-0">
                <button
                  type="button"
                  class="relative flex h-full w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pastiYellow-500 tablet:block tablet:px-3"
                  :class="picked === i ? 'bg-pureWhite' : 'hover:bg-pureWhite'"
                  :aria-pressed="picked === i"
                  aria-controls="dgv-role"
                  @click="picked = i"
                >
                  <span class="font-mono text-[10px] tabular-nums text-[color:rgba(3,60,89,0.5)]">{{ pad(i + 1) }}</span>
                  <span class="block font-display text-[14px] font-bold leading-tight text-slateNavy tablet:mt-1">{{ r.name }}</span>
                  <span aria-hidden="true" class="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-pastiYellow-500 transition-transform duration-300" :class="picked === i ? 'scale-x-100' : 'scale-x-0'" />
                </button>
              </li>
            </ul>
            <div id="dgv-role" class="bg-pureWhite p-6 tablet:p-8" aria-live="polite">
              <p class="font-display text-[26px] font-extrabold tracking-[-0.02em] text-slateNavy">{{ role.name }}</p>
              <p class="mt-2 max-w-[52ch] text-[15.5px] leading-relaxed text-[color:rgba(3,60,89,0.72)]">{{ role.body }}</p>
              <p class="mt-6 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.55)]">{{ t('Baseline access') }}</p>
              <ul class="mt-2.5 flex flex-wrap gap-2">
                <li v-for="c in role.can" :key="c" class="inline-flex items-center gap-2 rounded-full bg-slateNavy px-3.5 py-1.5 font-display text-[13px] font-semibold text-pureWhite">
                  <svg viewBox="0 0 12 12" class="h-3 w-3 text-pastiYellow-500" aria-hidden="true"><path d="M2.5 6.2 5 8.6l4.6-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>{{ c }}
                </li>
              </ul>
              <p class="mt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.5)]">{{ governance.note }}</p>
            </div>
          </div>

          <div data-fr class="mt-3 flex gap-4 rounded-[22px] bg-slateNavy p-6 text-pureWhite tablet:p-7">
            <svg viewBox="0 0 24 24" class="h-6 w-6 shrink-0 text-doraCyan" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 2.8 4 6v5.6c0 4.7 3.3 8.6 8 9.6 4.7-1 8-4.9 8-9.6V6z" /><path d="M8.5 12.2 11 14.6l4.6-4.8" /></svg>
            <div>
              <p class="font-display text-[17px] font-bold">{{ t('Privacy follows your policy') }}</p>
              <p class="mt-1.5 text-[14.5px] leading-relaxed text-[color:rgba(255,255,255,0.75)]">{{ governance.policy }}</p>
            </div>
          </div>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
