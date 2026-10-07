<script setup lang="ts">
// Procurement methods OPEN handles (slide 10): 1T1S / 1T2S / 2T2S. A radio
// switcher; the diagram draws each method as stages × envelopes (sampul),
// so the difference is visible, not just listed: one envelope with both
// technical and price; two envelopes where price stays locked until the
// technical evaluation passes; two separate stages.
const { procurement } = useOpen()
const methods = procurement.methods
const pickedIdx = ref(1)
const picked = computed(() => methods[pickedIdx.value]!)

const onKey = (e: KeyboardEvent) => {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
  e.preventDefault()
  const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1
  pickedIdx.value = (pickedIdx.value + dir + methods.length) % methods.length
  ;(e.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLElement>('[role="radio"]')[pickedIdx.value]?.focus()
}

const envLabel = { teknis: 'Teknis', harga: 'Harga', 'teknis+harga': 'Teknis + Harga' } as const
</script>

<template>
  <div class="rounded-[24px] border border-[color:rgba(3,60,89,0.12)] bg-pureWhite p-5 tablet:p-8">
    <div class="grid gap-8 desktop:grid-cols-12">
      <div class="desktop:col-span-4">
        <p class="font-display text-[22px] font-extrabold tracking-[-0.02em] text-slateNavy">Metode procurement yang didukung</p>
        <p class="mt-3 text-[14.5px] leading-relaxed text-[color:rgba(3,60,89,0.72)]">{{ procurement.methodsIntro }}</p>
        <div role="radiogroup" aria-label="Metode procurement" class="mt-6 grid grid-cols-3 gap-1 rounded-full bg-[color:rgba(3,60,89,0.06)] p-1">
          <button
            v-for="(m, i) in methods"
            :key="m.code"
            type="button"
            role="radio"
            :aria-checked="i === pickedIdx"
            :tabindex="i === pickedIdx ? 0 : -1"
            class="h-11 rounded-full font-display text-[15px] font-extrabold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pastiYellow-500"
            :class="i === pickedIdx ? 'bg-slateNavy text-pureWhite' : 'text-slateNavy hover:bg-[color:rgba(3,60,89,0.06)]'"
            @click="pickedIdx = i"
            @keydown="onKey"
          >{{ m.code }}</button>
        </div>
        <p class="mt-6 text-[13px] font-semibold text-[color:rgba(3,60,89,0.55)]">Perbedaan utama yang dikelola OPEN:</p>
        <ul class="mt-2 space-y-1.5">
          <li v-for="d in procurement.methodsManaged" :key="d" class="flex items-center gap-2 text-[14px] font-semibold text-slateNavy"><span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />{{ d }}</li>
        </ul>
      </div>

      <div class="desktop:col-span-8" aria-live="polite">
        <p class="font-display text-[length:clamp(22px,2.4vw,30px)] font-extrabold tracking-[-0.02em] text-slateNavy">{{ picked.name }}</p>
        <p class="mt-2 max-w-[34rem] text-[15px] leading-relaxed text-[color:rgba(3,60,89,0.75)]">{{ picked.body }}</p>

        <!-- Stages × envelopes -->
        <div class="mt-6 flex flex-col gap-3 tablet:flex-row" aria-hidden="true">
          <div
            v-for="(stage, si) in picked.stages"
            :key="`${picked.code}-${si}`"
            class="flex-1 rounded-[18px] border-2 border-dashed border-[color:rgba(3,60,89,0.18)] p-4"
          >
            <p class="text-[12px] font-bold text-[color:rgba(3,60,89,0.55)]">Tahap {{ si + 1 }}</p>
            <div class="mt-3 flex gap-3">
              <div
                v-for="(env, ei) in stage"
                :key="env"
                class="op-env relative flex flex-1 flex-col items-center gap-2 rounded-[12px] px-3 py-5"
                :class="env === 'harga' && picked.code === '1T2S' ? 'bg-[color:rgba(3,60,89,0.05)] text-slateNavy' : 'bg-slateNavy text-pureWhite'"
                :style="{ '--d': `${(si * 2 + ei) * 90}ms` }"
              >
                <svg viewBox="0 0 32 24" class="h-6 w-8" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1.5" y="1.5" width="29" height="21" rx="3" /><path d="M2 3l14 10 14-10" /></svg>
                <span class="font-display text-[13px] font-bold">Sampul {{ picked.code === '1T1S' ? '' : si + ei + 1 }}</span>
                <span class="text-[12px] opacity-80">{{ envLabel[env] }}</span>
                <span v-if="env === 'harga' && picked.code === '1T2S'" class="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-pastiYellow-500 text-slateNavy">
                  <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="7" width="10" height="7" rx="1.5" /><path d="M5.5 7V5a2.5 2.5 0 015 0" /></svg>
                </span>
              </div>
            </div>
          </div>
        </div>

        <ul class="mt-6 grid gap-x-6 gap-y-2 tablet:grid-cols-2">
          <li v-for="p in picked.points" :key="p" class="flex items-start gap-2.5 text-[14.5px] font-medium text-slateNavy">
            <svg viewBox="0 0 16 16" class="mt-1 h-3.5 w-3.5 shrink-0 text-pastiYellow-600" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>{{ p }}
          </li>
        </ul>
        <p class="mt-6 border-t border-[color:rgba(3,60,89,0.1)] pt-4 text-[14px] text-[color:rgba(3,60,89,0.7)]"><strong class="text-slateNavy">{{ procurement.methodsLine }}</strong> OPEN memastikan setiap metode dijalankan dengan kontrol dan transparansi.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.op-env {
  animation: op-env-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: var(--d, 0ms);
}
@keyframes op-env-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}
[data-reduced-motion='true'] .op-env {
  animation: none;
}
</style>
