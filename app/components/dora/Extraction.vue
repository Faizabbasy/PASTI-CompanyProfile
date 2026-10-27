<script setup lang="ts">
// 05 OCR & STRUCTURED EXTRACTION — the five source-backed capabilities
// (§5 rows 1–5) as one pipeline. Pick a capability (or let it advance on
// its own while in view) and the stage shows that layer of the same
// synthetic letter: intake → text layer → document type → fields →
// confidence. States that fields depend on the configured document type;
// no universal-detection or accuracy claim. Reduced motion: no autoplay.
const { extraction, sample } = useDoraPage()
// `tr`, not `t`: the template already loops with `t`.
const tr = useT()
const sectionRef = ref<HTMLElement | null>(null)
const stageRef = ref<HTMLElement | null>(null)
const picked = ref(0)
const pad = (n: number) => String(n).padStart(2, '0')
useFastReveal(sectionRef)

// Autoplay runs only while the stage is on screen (IntersectionObserver),
// so it never swaps panels — and re-lays out the page — while the visitor
// is elsewhere; a click hands control to the visitor for good.
let timer: ReturnType<typeof setInterval> | undefined
let io: IntersectionObserver | undefined
const manual = ref(false)
const stopAuto = () => {
  clearInterval(timer)
  timer = undefined
}
const pick = (i: number) => {
  manual.value = true
  stopAuto()
  picked.value = i
}
onMounted(() => {
  if (window.matchMedia(reducedMotionQuery.reduce).matches || !stageRef.value) return
  io = new IntersectionObserver(
    ([e]) => {
      if (!e?.isIntersecting || manual.value) return stopAuto()
      if (timer) return
      timer = setInterval(() => {
        if (picked.value >= extraction.caps.length - 1) {
          manual.value = true
          return stopAuto()
        }
        picked.value++
      }, 3200)
    },
    { rootMargin: '0px 0px -15% 0px' }
  )
  io.observe(stageRef.value)
})
onBeforeUnmount(() => {
  stopAuto()
  io?.disconnect()
})

const intake = [
  { file: 'surat-contoh-0001.pdf', kind: 'PDF', ok: true },
  { file: 'scan-contoh-07.tiff', kind: 'TIFF', ok: true },
  { file: 'foto-dokumen-03.jpg', kind: 'JPG', ok: true },
  { file: 'catatan-contoh.docx', kind: 'DOCX', ok: false }
]
const textLayer = ['INSTANSI CONTOH', 'UNIT KERJA CONTOH', 'Nomor : 000.1/OO01/CONTOH/X/2026', 'Lampiran : 1 (satu) berkas', 'Perihal : Permohonan Data Contoh', 'Kota Contoh, 12 Oktober 2026', 'Kepada Yth. Penerima Contoh', 'Nama : NAMA CONTOH']
</script>

<template>
  <section id="ocr" ref="sectionRef" class="relative bg-pureWhite py-24 tablet:py-32">
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="DORA" meta="05 / 13" class="mb-12 desktop:mb-16" />
      <DoraHeading :eyebrow="extraction.eyebrow" :title="extraction.headline" :lede="extraction.lede" />

      <div class="mt-14 grid gap-8 desktop:grid-cols-12 desktop:gap-10">
        <!-- Capability list -->
        <ol class="grid gap-1.5 desktop:col-span-5">
          <li v-for="(c, i) in extraction.caps" :key="i" data-fr>
            <button
              type="button"
              class="flex w-full items-start gap-4 rounded-[16px] px-4 py-4 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pastiYellow-500"
              :class="picked === i ? 'bg-surfaceNeutral ring-1 ring-[color:rgba(3,60,89,0.1)]' : 'hover:bg-surfaceNeutral'"
              :aria-pressed="picked === i"
              aria-controls="dex-stage"
              @click="pick(i)"
            >
              <span class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-[10.5px] font-semibold tabular-nums transition-colors duration-300" :class="picked === i ? 'bg-slateNavy text-pureWhite' : 'bg-[color:rgba(3,60,89,0.08)] text-[color:rgba(3,60,89,0.65)]'">{{ pad(i + 1) }}</span>
              <span>
                <span class="block font-display text-[17px] font-bold text-slateNavy">{{ c.name }}</span>
                <span class="mt-1 block text-[14px] leading-snug text-[color:rgba(3,60,89,0.7)]" :class="picked === i ? '' : 'desktop:line-clamp-1'">{{ c.body }}</span>
              </span>
            </button>
          </li>
        </ol>

        <!-- Stage -->
        <div class="min-w-0 desktop:col-span-7">
          <div id="dex-stage" ref="stageRef" data-fr class="relative min-h-[380px] overflow-hidden [contain:layout_paint] rounded-[22px] bg-slateNavy p-5 text-pureWhite tablet:p-7" :aria-live="manual ? 'polite' : 'off'">
            <p class="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.55)]">
              <span>{{ pad(picked + 1) }} · {{ extraction.caps[picked]!.name }}</span>
              <span>{{ sample.file }}</span>
            </p>

            <Transition name="dex" mode="out-in">
              <!-- 01 Intake -->
              <ul v-if="picked === 0" key="0" class="mt-6 grid gap-2">
                <li v-for="f in intake" :key="f.file" class="flex items-center justify-between gap-3 rounded-[12px] bg-[color:rgba(255,255,255,0.05)] px-4 py-3 ring-1 ring-[color:rgba(255,255,255,0.08)]">
                  <span class="flex min-w-0 items-center gap-3">
                    <span class="w-12 shrink-0 rounded-[6px] bg-[color:rgba(255,255,255,0.08)] py-1 text-center font-mono text-[10px] font-semibold">{{ f.kind }}</span>
                    <span class="truncate font-display text-[14px] font-semibold">{{ f.file }}</span>
                  </span>
                  <span class="inline-flex shrink-0 items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em]" :class="f.ok ? 'text-doraCyan' : 'text-[#FF8A73]'">
                    <svg v-if="f.ok" viewBox="0 0 12 12" class="h-3 w-3" aria-hidden="true"><path d="M2.5 6.2 5 8.6l4.6-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                    <svg v-else viewBox="0 0 12 12" class="h-3 w-3" aria-hidden="true"><path d="m3 3 6 6M9 3 3 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
                    {{ f.ok ? tr('Accepted') : tr('Rejected · file type') }}
                  </span>
                </li>
              </ul>

              <!-- 02 OCR text layer -->
              <div v-else-if="picked === 1" key="1" class="mt-6 grid gap-5 tablet:grid-cols-[0.8fr_1fr]">
                <div class="relative overflow-hidden rounded-[6px] max-tablet:mx-auto max-tablet:w-[70%]">
                  <DoraSampleDoc />
                  <span aria-hidden="true" class="dex-scan pointer-events-none absolute inset-x-0 top-0 h-[22%]" />
                </div>
                <ol class="space-y-1.5 font-mono text-[12px] leading-relaxed text-[color:rgba(255,255,255,0.85)]">
                  <li v-for="(l, i) in textLayer" :key="l" class="dex-line flex gap-3" :style="{ animationDelay: `${i * 90}ms` }">
                    <span class="w-5 shrink-0 text-right tabular-nums text-[color:rgba(255,255,255,0.35)]">{{ i + 1 }}</span><span class="min-w-0 break-words">{{ l }}</span>
                  </li>
                </ol>
              </div>

              <!-- 03 Classification -->
              <div v-else-if="picked === 2" key="2" class="mt-6">
                <div class="rounded-[16px] bg-[color:rgba(255,255,255,0.05)] p-5 ring-1 ring-[color:rgba(255,255,255,0.08)]">
                  <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.55)]">{{ tr('Document type') }}</p>
                  <div class="mt-3 flex flex-wrap items-center gap-3">
                    <span class="inline-flex items-center gap-2 rounded-full bg-doraCyan px-4 py-2 font-display text-[15px] font-bold text-slateNavy">{{ tr('Official letter') }}</span>
                    <span class="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:rgba(255,255,255,0.6)]">{{ tr('Auto-detected') }}</span>
                  </div>
                  <p class="mt-5 text-[14px] leading-relaxed text-[color:rgba(255,255,255,0.72)]">{{ tr('Or chosen at upload when a batch holds one type. A reviewer can still change it during verification.') }}</p>
                </div>
                <p class="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(255,255,255,0.5)]">{{ tr('Types and rules are configured per organization') }}</p>
                <ul class="mt-3 flex flex-wrap gap-2">
                  <li v-for="t in ['Official letter', 'Application form', 'Internal report', 'Other']" :key="t" class="rounded-full px-3 py-1.5 font-display text-[12.5px] font-semibold ring-1" :class="t === 'Official letter' ? 'text-pureWhite ring-doraCyan' : 'text-[color:rgba(255,255,255,0.6)] ring-[color:rgba(255,255,255,0.14)]'">{{ tr(t) }}</li>
                </ul>
              </div>

              <!-- 04 Fields / 05 Confidence -->
              <div v-else key="3" class="mt-6">
                <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:rgba(255,255,255,0.55)]">{{ tr('Template · Official letter') }}</p>
                <dl class="mt-3 divide-y divide-[color:rgba(255,255,255,0.08)] rounded-[16px] bg-[color:rgba(255,255,255,0.05)] ring-1 ring-[color:rgba(255,255,255,0.08)]">
                  <div v-for="f in sample.fields" :key="f.key" class="grid grid-cols-[7.5rem_1fr] items-center gap-3 px-4 py-3.5 tablet:grid-cols-[8.5rem_1fr_auto]">
                    <dt class="font-display text-[13px] font-bold text-[color:rgba(255,255,255,0.8)]">{{ f.label }}</dt>
                    <dd class="min-w-0 truncate font-mono text-[12.5px]">{{ f.ocr }}</dd>
                    <dd v-if="picked === 4" class="col-span-2 flex items-center gap-2 font-mono text-[10.5px] tabular-nums tablet:col-span-1">
                      <span aria-hidden="true" class="relative block h-1.5 w-20 overflow-hidden rounded-full bg-[color:rgba(255,255,255,0.12)]"><span class="dex-bar absolute inset-y-0 left-0 rounded-full" :class="f.review ? 'bg-[#FF8A73]' : 'bg-doraCyan'" :style="{ width: `${f.conf}%` }" /></span>
                      <span :class="f.review ? 'text-[#FF8A73]' : 'text-[color:rgba(255,255,255,0.75)]'">{{ f.conf }}%{{ f.review ? ` · ${tr('review')}` : '' }}</span>
                    </dd>
                  </div>
                </dl>
              </div>
            </Transition>

            <p class="mt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(255,255,255,0.45)]">{{ tr('Synthetic sample · illustrative values') }}</p>
          </div>
          <p data-fr="fade" class="m-center mt-4 max-w-[60ch] text-[13.5px] leading-relaxed text-[color:rgba(3,60,89,0.65)]">{{ extraction.note }}</p>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
.dex-enter-active,
.dex-leave-active {
  transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.dex-enter-from {
  opacity: 0;
  transform: translateX(14px);
}
.dex-leave-to {
  opacity: 0;
  transform: translateX(-14px);
}
.dex-line {
  animation: dex-line 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}
/* Opacity + transform only (composited) — no clip-path repaint. */
@keyframes dex-line {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
}
.dex-bar {
  transform-origin: left;
  animation: dex-bar 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes dex-bar {
  from {
    transform: scaleX(0);
  }
}
.dex-scan {
  background: linear-gradient(180deg, transparent, rgba(31, 214, 238, 0.16) 70%, rgba(31, 214, 238, 0.9) 98%, transparent);
  animation: dex-scan 2.2s cubic-bezier(0.16, 1, 0.3, 1) 1 both;
}
@keyframes dex-scan {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(460%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .dex-line,
  .dex-bar {
    animation: none;
  }
  .dex-scan {
    display: none;
  }
  .dex-enter-active,
  .dex-leave-active {
    transition: none;
  }
}
</style>
