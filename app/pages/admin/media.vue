<script setup lang="ts">
import type { MediaItem } from '~/composables/useMediaLibrary'

// Media library: every uploaded image, where it is used, upload and delete.
// Files live in Supabase Storage (public bucket); delete is ADMIN-only and
// refused by the server while a page or record still uses the image.
definePageMeta({ layout: 'admin' })
useHead({ title: 'Media' })

const { can } = useCmsSession()
const { state, load, upload, remove } = useMediaLibrary()
const loading = ref(true)
const loadError = ref('')
const notice = ref<{ kind: 'success' | 'error'; text: string } | null>(null)
const uploading = ref(0)
const dragging = ref(false)
const query = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const copied = ref('')

async function refresh() {
  loading.value = true
  loadError.value = ''
  try {
    await load(true)
  } catch (e) {
    loadError.value = cmsErrorMessage(e, 'Could not load the Media library.')
  } finally {
    loading.value = false
  }
}
onMounted(refresh)

const items = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? state.value.items.filter((m) => m.originalName.toLowerCase().includes(q)) : state.value.items
})

async function sendFiles(files: FileList | File[] | null | undefined) {
  const list = Array.from(files ?? [])
  if (!list.length) return
  notice.value = null
  let ok = 0
  const failed: string[] = []
  for (const f of list) {
    uploading.value++
    try {
      await upload(f)
      ok++
    } catch (err) {
      failed.push(`${f.name}: ${err instanceof Error && !('statusCode' in err) ? err.message : cmsErrorMessage(err, 'upload failed')}`)
    } finally {
      uploading.value--
    }
  }
  notice.value = failed.length
    ? { kind: 'error', text: `${ok ? `${ok} uploaded. ` : ''}Not uploaded — ${failed.join(' · ')}` }
    : { kind: 'success', text: `${ok} image${ok === 1 ? '' : 's'} uploaded.` }
}

function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  sendFiles(input.files).finally(() => (input.value = ''))
}

async function onDelete(m: MediaItem) {
  if (!window.confirm(`Delete “${m.originalName}”? This cannot be undone.`)) return
  notice.value = null
  try {
    await remove(m.id)
    notice.value = { kind: 'success', text: `Deleted “${m.originalName}”.` }
  } catch (e) {
    notice.value = { kind: 'error', text: cmsErrorMessage(e, 'Could not delete the image.') }
    await refresh()
  }
}

async function copyUrl(m: MediaItem) {
  try {
    await navigator.clipboard.writeText(m.url)
    copied.value = m.id
    setTimeout(() => (copied.value = ''), 1500)
  } catch {
    window.prompt('Copy the image URL:', m.url)
  }
}

const kb = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`)
</script>

<template>
  <section>
    <div class="flex flex-wrap items-end gap-3">
      <div>
        <h1 class="text-2xl font-bold">Media</h1>
        <p class="mt-1 max-w-2xl text-sm text-navy-500">
          Images for every CMS page. Upload here or straight from any image field. JPG, PNG, WebP or AVIF; large photos are resized automatically.
        </p>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <input v-model="query" type="search" placeholder="Search by file name" aria-label="Search images" class="w-52 rounded-md border border-navy-200 px-3 py-1.5 text-sm">
        <button
          type="button"
          class="rounded-md bg-slateNavy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          :disabled="!state.configured || !can('media.upload')"
          @click="fileInput?.click()"
        >{{ uploading ? `Uploading ${uploading}…` : 'Upload images' }}</button>
        <input ref="fileInput" type="file" multiple :accept="MEDIA_ACCEPT" class="hidden" @change="onFile">
      </div>
    </div>

    <p v-if="!loading && !loadError && !state.configured" class="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      Uploads aren't set up on this server yet. Add <code>NUXT_CMS_SUPABASE_URL</code> and <code>NUXT_CMS_SUPABASE_SERVICE_KEY</code> (see .env.example), then reload.
    </p>
    <p v-if="notice" role="status" class="mt-4 rounded-md border px-4 py-3 text-sm" :class="notice.kind === 'success' ? 'border-green-200 bg-green-50 text-green-900' : 'border-red-200 bg-red-50 text-red-800'">{{ notice.text }}</p>

    <div
      v-if="state.configured"
      class="mt-4 rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm transition-colors"
      :class="dragging ? 'border-slateNavy bg-navy-50' : 'border-navy-200 text-navy-500'"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="dragging = false; sendFiles($event.dataTransfer?.files)"
    >Drop images here to upload</div>

    <p v-if="loading" class="mt-6 text-sm text-navy-500" role="status">Loading images…</p>
    <div v-else-if="loadError" role="alert" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ loadError }} <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Retry</button>
    </div>
    <p v-else-if="!items.length" class="mt-6 text-sm text-navy-500">{{ query ? 'No images match.' : 'No images uploaded yet.' }}</p>

    <ul v-else class="mt-6 grid grid-cols-2 gap-4 tablet:grid-cols-3 desktop:grid-cols-4">
      <li v-for="m in items" :key="m.id" class="overflow-hidden rounded-lg border border-navy-100 bg-white">
        <a :href="m.url" target="_blank" rel="noopener" class="block aspect-[4/3] bg-[repeating-conic-gradient(#f1f4f6_0%_25%,#fff_0%_50%)] bg-[length:16px_16px]">
          <img :src="m.url" :alt="m.originalName" loading="lazy" class="h-full w-full object-contain">
        </a>
        <div class="grid gap-1 p-3 text-xs">
          <p class="truncate text-sm font-medium" :title="m.originalName">{{ m.originalName }}</p>
          <p class="text-navy-500">{{ m.width && m.height ? `${m.width}×${m.height} · ` : '' }}{{ kb(m.size) }} · {{ fmtCmsTime(m.uploadedAt) }}</p>
          <p v-if="m.uploadedBy" class="text-navy-400">by {{ m.uploadedBy.name }}</p>
          <p v-if="m.usedIn.length" class="text-navy-600">Used in: {{ m.usedIn.map((u) => u.label).join(', ') }}</p>
          <p v-else class="text-navy-400">Not used yet</p>
          <div class="mt-1 flex gap-3">
            <button type="button" class="font-semibold text-slateNavy hover:underline" @click="copyUrl(m)">{{ copied === m.id ? 'Copied' : 'Copy URL' }}</button>
            <button
              v-if="can('content.delete')"
              type="button"
              class="font-semibold text-red-700 hover:underline disabled:cursor-not-allowed disabled:text-navy-300 disabled:no-underline"
              :disabled="m.usedIn.length > 0"
              :title="m.usedIn.length ? 'Remove it from the pages that use it first.' : undefined"
              @click="onDelete(m)"
            >Delete</button>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>
