<script setup lang="ts">
// 07 SEARCH & EXPORT — a working mock of the documents & search view
// (F-09, F-10), rebuilt with synthetic records only (no NIK / vehicle
// filters from the source screenshot). The query types itself once when
// the section comes into view; visitors can then search, filter by status
// and preview the same result set as CSV, Excel or JSON. Nothing is
// downloaded; export limits and permission are implementation-specific.
const { search } = useDoraPage()
const t = useT()
const sectionRef = ref<HTMLElement | null>(null)
const boxRef = ref<HTMLElement | null>(null)
useFastReveal(sectionRef)

const query = ref('')
const status = ref<'All' | 'Verified' | 'Waiting verification'>('All')
const format = ref<(typeof search.formats)[number] | null>(null)

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  return search.results.filter(
    (r) => (status.value === 'All' || r.status === status.value) && (!q || [r.file, r.type, r.value, r.field, r.status].some((v) => v.toLowerCase().includes(q)))
  )
})

// Split a string around the query so matches can be marked.
const parts = (text: string) => {
  const q = query.value.trim()
  if (!q) return [{ t: text, m: false }]
  const i = text.toLowerCase().indexOf(q.toLowerCase())
  if (i < 0) return [{ t: text, m: false }]
  return [
    { t: text.slice(0, i), m: false },
    { t: text.slice(i, i + q.length), m: true },
    { t: text.slice(i + q.length), m: false }
  ]
}

const preview = computed(() => {
  const rows = results.value
  if (format.value === 'JSON')
    return JSON.stringify(
      rows.map((r) => ({ file: r.file, type: r.type, status: r.status, uploaded: r.date, [r.field]: r.value })),
      null,
      2
    )
  if (format.value === 'CSV') return ['file,type,status,uploaded,field,value', ...rows.map((r) => [r.file, r.type, r.status, r.date, r.field, `"${r.value}"`].join(','))].join('\n')
  return ''
})

let timer: ReturnType<typeof setInterval> | undefined
let stopIO = () => {}
onMounted(() => {
  if (!boxRef.value) return
  if (window.matchMedia(reducedMotionQuery.reduce).matches) {
    query.value = search.query
    return
  }
  stopIO = onceInView(boxRef.value, () => {
    let n = 0
    timer = setInterval(() => {
      if (query.value !== search.query.slice(0, n)) return clearInterval(timer) // visitor took over
      n++
      query.value = search.query.slice(0, n)
      if (n >= search.query.length) clearInterval(timer)
    }, 130)
  })
})
onBeforeUnmount(() => {
  clearInterval(timer)
  stopIO()
})
</script>

<template>
  <section id="search" ref="sectionRef" class="relative bg-pureWhite py-24 tablet:py-32">
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="DORA" meta="07 / 13" class="mb-12 desktop:mb-16" />
      <div class="grid gap-8 desktop:grid-cols-12 desktop:items-end desktop:gap-10">
        <div class="desktop:col-span-7"><DoraHeading :eyebrow="search.eyebrow" :title="search.headline" :lede="search.lede" /></div>
        <ul data-fr="fade" class="m-center-row flex flex-wrap gap-2 desktop:col-span-5 desktop:justify-end" :aria-label="t('Available search filters')">
          <li v-for="(f, i) in search.filters" :key="i" class="rounded-full bg-surfaceNeutral px-3 py-1.5 font-display text-[12.5px] font-semibold text-slateNavy ring-1 ring-[color:rgba(3,60,89,0.1)]">{{ f }}</li>
        </ul>
      </div>

      <div ref="boxRef" data-fr class="mt-12 overflow-hidden rounded-[22px] bg-pureWhite shadow-[0_40px_80px_-50px_rgba(3,60,89,0.6)] ring-1 ring-[color:rgba(3,60,89,0.12)]">
        <!-- Query bar -->
        <div class="border-b border-[color:rgba(3,60,89,0.08)] bg-surfaceNeutral p-4 tablet:p-5">
          <form role="search" class="flex gap-2" @submit.prevent>
            <label for="dse-q" class="sr-only">{{ t('Search full text, file name or field value') }}</label>
            <div class="relative flex-1">
              <svg viewBox="0 0 16 16" class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:rgba(3,60,89,0.5)]" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="7" cy="7" r="5" /><path d="m11 11 3.5 3.5" stroke-linecap="round" /></svg>
              <input id="dse-q" v-model="query" type="search" autocomplete="off" :placeholder="t('Full text, file name or field value')" class="block h-12 w-full rounded-[12px] border border-[color:rgba(3,60,89,0.18)] bg-pureWhite pl-11 pr-4 font-display text-[16px] font-semibold text-slateNavy outline-none transition-[border-color,box-shadow] duration-200 placeholder:font-medium placeholder:text-[color:rgba(3,60,89,0.45)] focus:border-slateNavy focus:shadow-[0_0_0_4px_rgba(251,186,0,0.35)]">
            </div>
          </form>
          <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div role="group" :aria-label="t('Filter by status')" class="inline-flex rounded-full bg-pureWhite p-1 ring-1 ring-[color:rgba(3,60,89,0.1)]">
              <button v-for="s in (['All', 'Verified', 'Waiting verification'] as const)" :key="s" type="button" :aria-pressed="status === s" class="min-h-9 rounded-full px-3.5 font-display text-[12.5px] font-bold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pastiYellow-500" :class="status === s ? 'bg-slateNavy text-pureWhite' : 'text-[color:rgba(3,60,89,0.7)] hover:text-slateNavy'" @click="status = s">
                {{ s === 'Waiting verification' ? t('Waiting') : t(s) }}
              </button>
            </div>
            <div role="group" :aria-label="t('Export preview')" class="flex items-center gap-1">
              <span class="mr-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.55)]">{{ t('Export') }}</span>
              <button v-for="f in search.formats" :key="f" type="button" :aria-pressed="format === f" class="min-h-9 rounded-full px-3 font-display text-[12.5px] font-bold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pastiYellow-500" :class="format === f ? 'bg-pastiYellow-500 text-slateNavy' : 'text-slateNavy ring-1 ring-[color:rgba(3,60,89,0.15)] hover:bg-pureWhite'" @click="format = format === f ? null : f">
                {{ f }}
              </button>
            </div>
          </div>
        </div>

        <div class="grid" :class="format ? 'desktop:grid-cols-[1.35fr_1fr]' : ''">
          <!-- Results -->
          <div class="min-w-0">
            <p class="px-4 pt-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.55)] tablet:px-5" aria-live="polite">{{ t(results.length === 1 ? '{n} result' : '{n} results', { n: results.length }) }}</p>
            <ul class="divide-y divide-[color:rgba(3,60,89,0.08)] px-4 pb-2 tablet:px-5">
              <li v-for="r in results" :key="r.file" class="grid gap-x-6 gap-y-1.5 py-4 tablet:grid-cols-[1.2fr_0.8fr_1.4fr]">
                <div class="min-w-0">
                  <p class="truncate font-display text-[15px] font-bold text-slateNavy"><template v-for="(p, i) in parts(r.file)" :key="i"><mark v-if="p.m" class="rounded-[3px] bg-pastiYellow-200 text-slateNavy">{{ p.t }}</mark><template v-else>{{ p.t }}</template></template></p>
                  <p class="mt-0.5 font-mono text-[11px] text-[color:rgba(3,60,89,0.55)]">{{ t(r.type) }} · {{ r.date }}</p>
                </div>
                <p class="inline-flex items-center gap-2 self-start font-display text-[13px] font-semibold" :class="r.status === 'Verified' ? 'text-slateNavy' : 'text-[color:rgba(3,60,89,0.7)]'">
                  <span aria-hidden="true" class="h-2 w-2 rounded-full" :class="r.status === 'Verified' ? 'bg-pastiYellow-500' : 'border-2 border-slateNavy'" />{{ t(r.status) }}
                </p>
                <p class="min-w-0 text-[13px] text-[color:rgba(3,60,89,0.6)]">
                  {{ t(r.field) }} <span class="break-all font-mono text-[12.5px] text-slateNavy"><template v-for="(p, i) in parts(r.value)" :key="i"><mark v-if="p.m" class="rounded-[3px] bg-pastiYellow-200 text-slateNavy">{{ p.t }}</mark><template v-else>{{ p.t }}</template></template></span>
                </p>
              </li>
              <li v-if="!results.length" class="py-8 text-center text-[14px] text-[color:rgba(3,60,89,0.6)]">{{ t('No documents match. Try another value.') }}</li>
            </ul>
          </div>

          <!-- Export preview -->
          <div v-if="format" class="min-w-0 border-[color:rgba(3,60,89,0.08)] bg-slateNavy p-4 text-pureWhite max-desktop:border-t tablet:p-5">
            <p class="flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:rgba(255,255,255,0.6)]">
              <span>{{ t('Preview') }} · {{ format }}</span><span>{{ t('{n} rows', { n: results.length }) }}</span>
            </p>
            <table v-if="format === 'Excel'" class="mt-3 w-full border-collapse font-mono text-[11px]">
              <thead>
                <tr class="text-left text-doraCyan"><th class="border border-[color:rgba(255,255,255,0.14)] px-2 py-1.5 font-semibold">file</th><th class="border border-[color:rgba(255,255,255,0.14)] px-2 py-1.5 font-semibold">status</th><th class="border border-[color:rgba(255,255,255,0.14)] px-2 py-1.5 font-semibold">value</th></tr>
              </thead>
              <tbody>
                <tr v-for="r in results" :key="r.file"><td class="border border-[color:rgba(255,255,255,0.14)] px-2 py-1.5 break-all">{{ r.file }}</td><td class="border border-[color:rgba(255,255,255,0.14)] px-2 py-1.5">{{ r.status }}</td><td class="border border-[color:rgba(255,255,255,0.14)] px-2 py-1.5 break-all">{{ r.value }}</td></tr>
              </tbody>
            </table>
            <pre v-else class="mt-3 max-h-[300px] overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed text-[color:rgba(255,255,255,0.85)]" data-lenis-prevent>{{ preview }}</pre>
            <p class="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:rgba(255,255,255,0.45)]">{{ t('Preview only · nothing is downloaded') }}</p>
          </div>
        </div>
      </div>
      <p data-fr="fade" class="m-center mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.5)]">{{ t('Synthetic records') }} · {{ search.note }}</p>
    </BaseContainer>
  </section>
</template>
