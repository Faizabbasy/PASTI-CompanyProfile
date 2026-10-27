<script setup lang="ts">
import type { DoraField, VerifyStep } from '~/composables/useDora'

// Reconstructed DORA verification workspace (sanitized — never a source
// screenshot, docs/dora/00). Left: the synthetic page with field-location
// markers and, while recognising, the cyan scan line. Right: document type,
// the extracted fields with their (illustrative) confidence, and the
// verification decision. Driven by `step`:
//   -1 recognising · 0 opened from queue · 1 compare (marker follows the
//   selected field) · 2 flag (the lower-confidence field) · 3 corrected ·
//   4 verified.
// `compact` (hero): display-only, fields as text. Full mode: fields are
// buttons that select their marker; the field under review becomes an
// editable input from step 2. Below desktop it recomposes rather than
// shrinks: page → fields → decision.
type Key = DoraField['key']
const props = withDefaults(defineProps<{ step: VerifyStep; active?: Key | null; compact?: boolean }>(), { active: null, compact: false })
const emit = defineEmits<{ select: [key: Key]; decide: [] }>()
const { sample } = useDoraPage()
const t = useT()

const reviewKey = sample.fields.find((f) => f.review)?.key ?? null
const edits = reactive<Partial<Record<Key, string>>>({})
const shown = (f: DoraField) => edits[f.key] ?? (props.step >= 3 ? f.value : f.ocr)
const flag = computed(() => (props.step === 2 ? reviewKey : null))
const marker = computed<Key | null>(() => (props.step <= 0 ? null : props.active ?? (props.step >= 2 && props.step < 4 ? reviewKey : null)))
const verified = computed(() => props.step >= 4)
const statusLabel = computed(() => t(props.step < 0 ? 'Recognising…' : verified.value ? 'Verified' : 'Waiting verification'))
const uid = useId()
</script>

<template>
  <div class="overflow-hidden rounded-[18px] bg-navyDeep-950 text-pureWhite ring-1 ring-[color:rgba(255,255,255,0.12)]">
    <!-- Title row -->
    <!-- One line at every width (the status label changes length; a wrap
         would resize the workspace and shift the page). -->
    <div class="flex items-center justify-between gap-3 border-b border-[color:rgba(255,255,255,0.08)] px-4 py-3">
      <p class="min-w-0 truncate font-display text-[14px] font-bold">{{ sample.file }}</p>
      <p class="inline-flex shrink-0 items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.1em] tablet:tracking-[0.14em]" aria-live="polite">
        <span aria-hidden="true" class="h-1.5 w-1.5 rounded-full" :class="verified ? 'bg-pastiYellow-500' : 'bg-doraCyan'" />
        <span :class="verified ? 'text-pastiYellow-400' : 'text-doraCyan'">{{ statusLabel }}</span>
      </p>
    </div>

    <div class="grid gap-0" :class="compact ? 'tablet:grid-cols-[1.1fr_1fr]' : 'desktop:grid-cols-[1.15fr_1fr]'">
      <!-- Page -->
      <div class="relative p-3 tablet:p-4">
        <div class="relative overflow-hidden rounded-[6px] shadow-[0_20px_40px_-24px_rgba(0,0,0,0.8)]">
          <DoraSampleDoc :markers="step >= 0" :active="marker" :flag="flag" />
          <span v-if="step < 0" aria-hidden="true" class="dw-scan pointer-events-none absolute inset-x-0 top-0 h-[22%]" />
        </div>
      </div>

      <!-- Panel -->
      <div class="border-[color:rgba(255,255,255,0.08)] p-4 max-tablet:border-t" :class="compact ? 'tablet:border-l' : 'max-desktop:border-t desktop:border-l'">
        <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.55)]">{{ t('Document type') }}</p>
        <p class="mt-1.5 flex items-center justify-between rounded-[10px] bg-[color:rgba(255,255,255,0.06)] px-3 py-2 font-display text-[13.5px] font-semibold">
          <span>{{ step < 0 ? t('Detecting…') : t(sample.type) }}</span>
          <span class="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[color:rgba(255,255,255,0.5)]">{{ step < 0 ? '' : t('Auto-detected') }}</span>
        </p>

        <ul class="mt-4 grid gap-2.5">
          <li
            v-for="f in sample.fields"
            :key="f.key"
            class="rounded-[12px] transition-[background-color,box-shadow] duration-300"
            :class="step < 0 ? 'bg-[color:rgba(255,255,255,0.04)]' : marker === f.key ? (flag === f.key ? 'bg-[color:rgba(194,65,45,0.16)] shadow-[inset_0_0_0_1.5px_#FF8A73]' : 'bg-[color:rgba(31,214,238,0.1)] shadow-[inset_0_0_0_1.5px_#1FD6EE]') : 'bg-[color:rgba(255,255,255,0.04)]'"
          >
            <!-- Skeleton while recognising: same boxes and line heights as a
                 filled field, so nothing below shifts when values land. -->
            <div v-if="step < 0" aria-hidden="true" class="p-3">
              <span class="flex items-center justify-between gap-3">
                <span class="font-display text-[13px] font-bold"><span class="dw-skel inline-block h-2 w-16 rounded-full align-middle" /></span>
                <span class="font-mono text-[10px]">&nbsp;</span>
              </span>
              <span class="mt-2 block rounded-[8px] bg-[color:rgba(0,0,0,0.25)] px-2.5 py-1.5 font-mono text-[12.5px]"><span class="dw-skel inline-block h-2.5 w-[70%] rounded-full align-middle" /></span>
            </div>

            <template v-else>
              <component
                :is="compact ? 'div' : 'button'"
                :type="compact ? undefined : 'button'"
                :aria-pressed="compact ? undefined : marker === f.key"
                class="block w-full rounded-[12px] p-3 text-left"
                :class="compact ? '' : 'hover:bg-[color:rgba(255,255,255,0.05)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-doraCyan'"
                @click="!compact && emit('select', f.key)"
              >
                <span class="flex items-center justify-between gap-3">
                  <span class="font-display text-[13px] font-bold">{{ f.label }}</span>
                  <span v-if="f.review && step === 2" class="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[#FF8A73]">
                    <svg viewBox="0 0 12 12" class="h-3 w-3" aria-hidden="true"><path d="M6 1 11 10.5H1z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /><path d="M6 4.6v2.6M6 8.6v.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
                    {{ t('Needs review') }} · {{ f.conf }}%
                  </span>
                  <span v-else-if="f.review && step >= 3" class="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-pastiYellow-400">
                    <svg viewBox="0 0 12 12" class="h-3 w-3" aria-hidden="true"><path d="M2.5 6.2 5 8.6l4.6-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                    {{ t('Corrected') }}
                  </span>
                  <span v-else class="inline-flex items-center gap-1.5 font-mono text-[10px] tabular-nums text-[color:rgba(255,255,255,0.7)]">
                    <span aria-hidden="true" class="relative block h-1 w-8 overflow-hidden rounded-full bg-[color:rgba(255,255,255,0.12)]"><span class="absolute inset-y-0 left-0 rounded-full bg-doraCyan" :style="{ width: `${f.conf}%` }" /></span>
                    {{ f.conf }}%
                  </span>
                </span>
                <span v-if="compact || !(f.review && step >= 2)" class="mt-2 block truncate rounded-[8px] bg-[color:rgba(0,0,0,0.25)] px-2.5 py-1.5 font-mono text-[12.5px]">{{ shown(f) }}</span>
              </component>

              <!-- Field under review: editable from step 2 (full mode). -->
              <div v-if="!compact && f.review && step >= 2" class="-mt-1 px-3 pb-3">
                <label :for="`${uid}-${f.key}`" class="sr-only">{{ f.label }} — {{ t('correct the value') }}</label>
                <input
                  :id="`${uid}-${f.key}`"
                  :value="shown(f)"
                  spellcheck="false"
                  autocomplete="off"
                  class="block w-full rounded-[8px] border bg-[color:rgba(0,0,0,0.3)] px-2.5 py-1.5 font-mono text-[12.5px] outline-none transition-[border-color] duration-200 focus:border-doraCyan"
                  :class="step === 2 ? 'border-[#FF8A73] text-[#FFB4A6]' : 'border-[color:rgba(255,255,255,0.14)] text-pureWhite'"
                  @focus="emit('select', f.key)"
                  @input="edits[f.key] = ($event.target as HTMLInputElement).value"
                >
              </div>
            </template>
          </li>
        </ul>

        <!-- Decision -->
        <div v-if="!compact" class="mt-4 flex items-center gap-2 border-t border-[color:rgba(255,255,255,0.08)] pt-4">
          <button
            type="button"
            :disabled="step < 0"
            class="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full font-display text-[13px] font-bold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-doraCyan"
            :class="verified ? 'bg-pastiYellow-500 text-slateNavy' : 'bg-pureWhite text-slateNavy hover:bg-pastiYellow-500'"
            :aria-pressed="verified"
            @click="emit('decide')"
          >
            <svg v-if="verified" viewBox="0 0 12 12" class="h-3.5 w-3.5" aria-hidden="true"><path d="M2.5 6.2 5 8.6l4.6-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
            {{ verified ? t('Verified') : t('Complete verification') }}
          </button>
          <span class="inline-flex min-h-10 items-center rounded-full px-4 font-display text-[13px] font-semibold text-[color:rgba(255,255,255,0.55)] ring-1 ring-[color:rgba(255,255,255,0.14)]">{{ t('Reject') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Recognition pass: a soft cyan band travels down the page (transform). */
.dw-scan {
  background: linear-gradient(180deg, transparent, rgba(31, 214, 238, 0.16) 70%, rgba(31, 214, 238, 0.9) 98%, transparent);
  animation: dw-scan 1.6s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}
@keyframes dw-scan {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(460%);
  }
}
.dw-skel {
  background: rgba(255, 255, 255, 0.12);
}
@media (prefers-reduced-motion: reduce) {
  .dw-scan {
    animation: none;
    display: none;
  }
}
</style>
