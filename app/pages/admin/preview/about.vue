<script setup lang="ts">
import type { AboutContent, PageStatus } from '#shared/utils/aboutSchema'

// Authenticated draft preview (ADMIN + EDITOR). Lives under /admin, so the
// session gate, no-store and noindex headers apply; data comes from
// /api/admin/pages/about/preview — never from /api/public. Renders the REAL
// About sections with the saved draft (active items only) through the same
// adapter the public page uses, so layout and motion match. Klik teks untuk
// edit: every text the CMS supplies opens its field in the About editor;
// the rest of the page is code copy.
definePageMeta({ layout: false })
useHead({
  title: 'Preview · About (draft) · PASTI CMS',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

interface PreviewResponse {
  version: number
  revision: number
  status: PageStatus
  updatedAt: string
  content: AboutContent
  // The website shows the CMS proof numbers only when this server flag is on.
  proofLive: boolean
}

const lang = useEditorLang()
const { cmsFetch } = useCmsSession()
const { data, error, refresh, status } = await useAsyncData(`admin-about-preview-${lang}`, () =>
  cmsFetch<PreviewResponse>('/api/admin/pages/about/preview', { query: { lang } })
)

const legacy = buildLegacyAboutContent()
const active = <T extends { active: boolean }>(list: T[]) => list.filter((i) => i.active)
// Same shape the public API sends (getPublishedAbout): active items only,
// proof only when the website shows it.
const preview = computed(() => {
  const d = data.value
  if (!d) return null
  const c = d.content
  const { proof, ...rest } = c
  const content = {
    ...rest,
    mission: { ...c.mission, points: active(c.mission.points) },
    values: active(c.values),
    milestones: active(c.milestones),
    ...(d.proofLive ? { proof: active(proof) } : {}),
    leadership: active(c.leadership)
  }
  return adaptAboutCms(legacy, { status: 'published', version: d.version, publishedAt: d.updatedAt, content })
})
const hidden = computed(() => {
  const c = data.value?.content
  return c ? [c.mission.points, c.values, c.milestones, c.proof, c.leadership].reduce((n, l) => n + l.filter((i) => !i.active).length, 0) : 0
})
// Leadership only updates the founder card for the SAME person (the quote
// and foreword are her own words) — say so when the first name differs.
const leadMismatch = computed(() => {
  const lead = data.value ? active(data.value.content.leadership)[0] : undefined
  return !!lead && lead.name !== legacy.founder.name
})

provideSingletonCmsMarks('/admin/pages/about', lang, () => data.value?.content)
const mainRef = ref<HTMLElement | null>(null)
usePreviewJump(mainRef)
const fmt = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) + ' WIB'
</script>

<template>
  <div class="min-h-screen bg-paper">
    <div class="sticky top-0 z-[60] border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-950 tablet:px-8" role="note">
      <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-1">
        <strong>Preview draft — belum tampil di website</strong>
        <span v-if="data">About · draft v{{ data.version }} · disimpan {{ fmt(data.updatedAt) }} · status: {{ data.status }}</span>
        <span v-if="hidden" class="text-xs">{{ hidden }} item disembunyikan</span>
        <span v-if="data && !data.proofLive" class="text-xs">Angka bukti dari CMS belum dinyalakan di website — angka di bawah dari kode.</span>
        <span v-if="leadMismatch" class="text-xs font-semibold">Kepemimpinan: nama orang pertama beda dengan {{ legacy.founder.name }} — kartu pendiri tetap memakai data bawaan.</span>
        <span class="text-xs">Arahkan kursor ke teks untuk melihat kolomnya, klik untuk langsung mengeditnya. Teks tanpa garis diatur di kode. Matikan tombol ✎ untuk mencoba halaman seperti biasa.</span>
        <span class="ml-auto inline-flex items-center gap-2"><AdminCmsPicker v-if="preview" /><button type="button" class="rounded border border-amber-400 px-2 py-0.5 text-xs font-semibold hover:bg-amber-100" @click="refresh()">Muat ulang draft</button></span>
      </div>
    </div>

    <p v-if="status === 'pending'" class="p-8 text-sm" role="status">Memuat draft…</p>
    <div v-else-if="error" class="mx-auto max-w-xl p-8" role="alert">
      <p class="font-semibold">Preview tidak tersedia.</p>
      <p class="mt-1 text-sm text-navy-600">
        {{ error.statusCode === 403 ? 'Role kamu tidak bisa membuka preview ini.' : 'Draft gagal dimuat. Mungkin sesi login sudah habis.' }}
      </p>
      <a :href="`/admin/pages/about?lang=${lang}`" class="mt-3 inline-block text-sm font-semibold underline">Kembali ke editor</a>
    </div>

    <main v-else-if="preview" ref="mainRef">
      <!-- Remount on reload so the sections re-read the new draft. -->
      <AdminAboutPreviewScope :key="`${data?.version}-${data?.revision}-${data?.updatedAt}`" :content="preview">
        <AboutHero />
        <AboutManifesto />
        <AboutVisionMission />
        <AboutStandards />
        <AboutJourney />
        <AboutFounder />
        <AboutPillars />
        <AboutVenn />
        <AboutClients />
      </AdminAboutPreviewScope>
    </main>
  </div>
</template>
