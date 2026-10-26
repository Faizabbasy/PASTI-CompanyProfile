<script setup lang="ts">
import type { MediaItem } from '~/composables/useMediaLibrary'

// Modal grid of the Media library. Picking an image emits `select`; the
// field that opened it decides what to do with it. Esc / backdrop closes.
const props = defineProps<{ open: boolean; current?: string }>()
const emit = defineEmits<{ close: []; select: [item: MediaItem] }>()

const { state, load, upload } = useMediaLibrary()
const loading = ref(false)
const error = ref('')
const busy = ref(false)
const query = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const dialogRef = ref<HTMLElement | null>(null)

const items = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? state.value.items.filter((m) => m.originalName.toLowerCase().includes(q)) : state.value.items
})

watch(
  () => props.open,
  async (open) => {
    if (!open) return
    error.value = ''
    loading.value = true
    try {
      await load(true)
    } catch (e) {
      error.value = cmsErrorMessage(e, 'Could not load the Media library.')
    } finally {
      loading.value = false
      nextTick(() => dialogRef.value?.focus())
    }
  }
)

async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  ;(e.target as HTMLInputElement).value = ''
  if (!file) return
  busy.value = true
  error.value = ''
  try {
    emit('select', await upload(file))
  } catch (err) {
    error.value = err instanceof Error && !('statusCode' in err) ? err.message : cmsErrorMessage(err, 'Upload failed. Try again.')
  } finally {
    busy.value = false
  }
}

const kb = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`)
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[200] flex items-center justify-center bg-slateNavy/50 p-4" @click.self="emit('close')" @keydown.esc="emit('close')">
      <div ref="dialogRef" role="dialog" aria-modal="true" aria-labelledby="media-picker-title" tabindex="-1" class="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-xl outline-none">
        <div class="flex flex-wrap items-center gap-3 border-b border-navy-100 px-5 py-3">
          <h2 id="media-picker-title" class="text-base font-bold">Media library</h2>
          <input v-model="query" type="search" placeholder="Search by file name" aria-label="Search images" class="ml-auto w-48 rounded-md border border-navy-200 px-2 py-1 text-sm">
          <button
            type="button"
            class="rounded-md bg-slateNavy px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
            :disabled="busy || !state.configured"
            @click="fileInput?.click()"
          >{{ busy ? 'Uploading…' : 'Upload new' }}</button>
          <input ref="fileInput" type="file" :accept="MEDIA_ACCEPT" class="hidden" @change="onFile">
          <button type="button" class="rounded-md border border-navy-200 px-3 py-1.5 text-sm" @click="emit('close')">Close</button>
        </div>

        <div class="overflow-y-auto p-5">
          <p v-if="error" role="alert" class="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{{ error }}</p>
          <p v-if="!loading && !state.configured" class="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Uploads aren't set up on this server yet (Supabase Storage). Existing images can still be picked.
          </p>
          <p v-if="loading" class="text-sm text-navy-500" role="status">Loading images…</p>
          <p v-else-if="!items.length" class="text-sm text-navy-500">No images yet. Upload one to start.</p>
          <ul v-else class="grid grid-cols-2 gap-3 tablet:grid-cols-4">
            <li v-for="m in items" :key="m.id">
              <button
                type="button"
                class="group block w-full overflow-hidden rounded-md border text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-cobalt"
                :class="m.url === current ? 'border-slateNavy ring-2 ring-slateNavy' : 'border-navy-100 hover:border-navy-300'"
                @click="emit('select', m)"
              >
                <span class="block aspect-[4/3] bg-[repeating-conic-gradient(#f1f4f6_0%_25%,#fff_0%_50%)] bg-[length:16px_16px]">
                  <img :src="m.url" :alt="m.originalName" loading="lazy" class="h-full w-full object-contain">
                </span>
                <span class="block truncate px-2 pt-1.5 text-xs font-medium">{{ m.originalName }}</span>
                <span class="block px-2 pb-1.5 text-[11px] text-navy-400">{{ m.width && m.height ? `${m.width}×${m.height} · ` : '' }}{{ kb(m.size) }}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </Teleport>
</template>
