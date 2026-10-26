<script setup lang="ts">
// Admin dashboard — real CMS data only (server/utils/cms/dashboard.ts):
// totals, what still needs publishing, the status of every page / list with
// whether the site actually uses it, recent activity and recent uploads.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Dashboard' })

type Status = 'draft' | 'published' | 'archived' | 'none'
interface DashboardItem {
  key: string
  label: string
  group: string
  to: string
  status: Status
  dummy: boolean
  needsPublish: boolean
  live: boolean
  flagOn: boolean
  updatedAt: string | null
  updatedBy: string | null
  counts?: { published: number; draft: number; archived: number; needsPublish: number }
}
interface DashboardData {
  user: { name: string; email: string; role: 'ADMIN' | 'EDITOR' }
  totals: { published: number; draft: number; archived: number; needsPublish: number }
  items: DashboardItem[]
  pending: { label: string; to: string; group: string; updatedAt: string; neverPublished: boolean }[]
  pendingTotal: number
  activity: { id: string; at: string; who: string; verb: string; label: string; to: string | null }[]
  recentMedia: { id: string; filename: string; mime: string; sizeKb: number; uploadedAt: string; uploadedBy: string }[]
}

const route = useRoute()
const { cmsFetch } = useCmsSession()
const { data, status, error, refresh } = await useAsyncData('admin-dashboard', () => cmsFetch<DashboardData>('/api/admin/dashboard'))

const denied = computed(() => typeof route.query.denied === 'string')
const fmt = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) + ' WIB'

const GROUPS = ['Pages', 'Products', 'Shared Content', 'Work', 'Insights']
const grouped = computed(() => GROUPS.map((g) => ({ group: g, items: (data.value?.items ?? []).filter((i) => i.group === g) })).filter((g) => g.items.length))

const STATUS: Record<Status, { label: string; cls: string }> = {
  published: { label: 'Sudah di-publish', cls: 'bg-emerald-50 text-emerald-800' },
  draft: { label: 'Draft', cls: 'bg-navy-50 text-navy-600' },
  archived: { label: 'Diarsipkan', cls: 'bg-gray-100 text-gray-600' },
  none: { label: 'Belum ada isi', cls: 'border border-dashed border-navy-200 text-navy-400' }
}

// One plain sentence: does the public site show this CMS content right now?
function siteLine(i: DashboardItem) {
  if (i.status === 'none' || i.dummy) return { text: 'Website memakai teks bawaan', cls: 'text-navy-400' }
  if (i.live) return { text: 'Tampil di website', cls: 'text-emerald-700' }
  if (!i.flagOn) return { text: 'Flag server belum aktif — website memakai teks bawaan', cls: 'text-amber-800' }
  return { text: 'Belum di-publish — website memakai teks bawaan', cls: 'text-amber-800' }
}
</script>

<template>
  <section>
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p v-if="data" class="mt-1 text-sm text-navy-500">
          Login sebagai <strong class="text-slateNavy">{{ data.user.name }}</strong> · {{ data.user.email }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <AdminRoleBadge v-if="data" :role="data.user.role" />
        <button type="button" class="rounded-md border border-navy-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-navy-50" @click="refresh()">Muat ulang</button>
      </div>
    </div>

    <div v-if="denied" role="alert" class="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      Role kamu tidak punya izin untuk membuka bagian itu.
    </div>

    <div v-if="status === 'pending' && !data" class="mt-6 text-sm text-navy-500" role="status">Memuat dashboard…</div>

    <div v-else-if="error && !data" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      Dashboard gagal dimuat.
      <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Coba lagi</button>
    </div>

    <template v-else-if="data">
      <!-- Totals -->
      <div class="mt-6 grid grid-cols-2 gap-4 desktop:grid-cols-4">
        <AdminStatCard label="Sudah di-publish" :value="data.totals.published" hint="Halaman & item yang punya versi tayang." />
        <AdminStatCard label="Draft" :value="data.totals.draft" hint="Belum pernah di-publish, atau ditarik dari website." />
        <div class="rounded-lg border p-5" :class="data.totals.needsPublish ? 'border-amber-300 bg-amber-50' : 'border-navy-100 bg-white'">
          <p class="text-xs font-semibold uppercase tracking-wider" :class="data.totals.needsPublish ? 'text-amber-900' : 'text-navy-500'">Perlu di-publish</p>
          <p class="mt-2 font-display text-3xl font-bold tabular-nums text-slateNavy">{{ data.totals.needsPublish }}</p>
          <p class="mt-1 text-xs" :class="data.totals.needsPublish ? 'text-amber-900' : 'text-navy-500'">Ada perubahan tersimpan yang belum tampil di website.</p>
        </div>
        <AdminStatCard label="Diarsipkan" :value="data.totals.archived" hint="Tidak tampil di website." />
      </div>

      <!-- Needs publishing -->
      <div v-if="data.pending.length" class="mt-8 rounded-lg border border-amber-300 bg-white">
        <div class="flex flex-wrap items-baseline gap-2 border-b border-amber-200 bg-amber-50 px-5 py-3">
          <h2 class="text-sm font-semibold text-amber-950">Perlu di-publish ({{ data.pendingTotal }})</h2>
          <p class="text-xs text-amber-900">Buka, cek preview, lalu klik Publish (admin).</p>
        </div>
        <ul class="divide-y divide-navy-100">
          <li v-for="p in data.pending" :key="p.to">
            <NuxtLink :to="p.to" class="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-2.5 text-sm hover:bg-navy-50">
              <span class="font-medium">{{ p.label }}</span>
              <span class="text-xs text-navy-400">{{ p.group }}</span>
              <span class="rounded-full bg-navy-50 px-2 py-0.5 text-[11px] font-semibold text-navy-600">{{ p.neverPublished ? 'Belum pernah tayang' : 'Ada perubahan baru' }}</span>
              <span class="ml-auto text-xs text-navy-500">disimpan {{ fmt(p.updatedAt) }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Every page / list -->
      <div class="mt-8 rounded-lg border border-navy-100 bg-white">
        <div class="border-b border-navy-100 px-5 py-3">
          <h2 class="text-sm font-semibold">Status semua konten</h2>
          <p class="mt-0.5 text-xs text-navy-500">Konten CMS baru tampil di website kalau sudah di-publish <strong>dan</strong> flag server-nya aktif. Selama belum, website tetap memakai teks bawaan.</p>
        </div>
        <div v-for="g in grouped" :key="g.group">
          <h3 class="bg-surfaceNeutral px-5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-navy-500">{{ g.group }}</h3>
          <ul class="divide-y divide-navy-100">
            <li v-for="i in g.items" :key="i.key">
              <NuxtLink :to="i.to" class="grid gap-1 px-5 py-2.5 text-sm hover:bg-navy-50 tablet:grid-cols-[12rem_minmax(0,1fr)_auto] tablet:items-center tablet:gap-4">
                <span class="font-medium">{{ i.label }}</span>
                <span class="flex flex-wrap items-center gap-2">
                  <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="STATUS[i.status].cls">{{ STATUS[i.status].label }}</span>
                  <span v-if="i.dummy" class="rounded-full border border-dashed border-navy-300 px-2 py-0.5 text-[11px] font-semibold text-navy-500">Data contoh</span>
                  <span v-if="i.counts && i.status !== 'none'" class="text-xs text-navy-500">{{ i.counts.published }} tayang · {{ i.counts.draft }} draft<template v-if="i.counts.archived"> · {{ i.counts.archived }} diarsipkan</template></span>
                  <span v-if="i.needsPublish" class="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">Perlu di-publish</span>
                  <span class="text-xs" :class="siteLine(i).cls">{{ siteLine(i).text }}</span>
                </span>
                <span class="text-xs text-navy-500 tablet:text-right">{{ i.updatedAt ? `${fmt(i.updatedAt)}${i.updatedBy ? ` · ${i.updatedBy}` : ''}` : '—' }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-8 grid grid-cols-1 gap-6 desktop:grid-cols-3">
        <!-- Activity -->
        <div class="rounded-lg border border-navy-100 bg-white desktop:col-span-2">
          <h2 class="border-b border-navy-100 px-5 py-3 text-sm font-semibold">Aktivitas terakhir</h2>
          <ul class="divide-y divide-navy-100">
            <li v-if="!data.activity.length" class="px-5 py-3 text-sm text-navy-500">Belum ada aktivitas.</li>
            <li v-for="a in data.activity" :key="a.id" class="flex flex-wrap items-center gap-x-2 gap-y-1 px-5 py-2.5 text-sm">
              <strong class="font-semibold">{{ a.who }}</strong>
              <span class="text-navy-600">{{ a.verb }}</span>
              <NuxtLink v-if="a.to" :to="a.to" class="font-medium underline decoration-navy-200 underline-offset-2 hover:decoration-slateNavy">{{ a.label }}</NuxtLink>
              <span v-else class="font-medium">{{ a.label }}</span>
              <span class="ml-auto text-xs text-navy-500">{{ fmt(a.at) }}</span>
            </li>
          </ul>
        </div>

        <!-- Media -->
        <div class="rounded-lg border border-navy-100 bg-white">
          <h2 class="border-b border-navy-100 px-5 py-3 text-sm font-semibold">Media terbaru</h2>
          <ul class="divide-y divide-navy-100">
            <li v-if="!data.recentMedia.length" class="px-5 py-3 text-sm text-navy-500">Belum ada upload. <NuxtLink to="/admin/media" class="font-semibold underline">Buka Media</NuxtLink></li>
            <li v-for="m in data.recentMedia" :key="m.id" class="px-5 py-3 text-sm">
              <p class="truncate font-medium">{{ m.filename }}</p>
              <p class="text-xs text-navy-500">{{ m.mime }} · {{ m.sizeKb }} KB · {{ fmt(m.uploadedAt) }}<template v-if="m.uploadedBy"> · {{ m.uploadedBy }}</template></p>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </section>
</template>
