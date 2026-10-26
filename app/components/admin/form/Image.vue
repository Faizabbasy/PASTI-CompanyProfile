<script setup lang="ts">
import type { MediaItem } from '~/composables/useMediaLibrary'

// CMS image field: preview, Upload (button or drop), pick from the Media
// library, or (advanced) type an /images/ path. The value is the image URL
// or path; `dimensions` fires when the size is known (Creative uses it to
// fill width/height). Validation stays with the page schema (mediaRef).
const props = withDefaults(
  defineProps<{
    id: string
    label: string
    required?: boolean
    hint?: string
    error?: string
    // Preview frame, e.g. '4/5', '1200/630'. Default: the image's own ratio.
    aspect?: string
    // CSS object-position for the preview (article cover focus).
    focus?: string
    round?: boolean
    // 'contain' = never crop (logos); default crops to `aspect` when set.
    fit?: 'contain' | 'cover'
  }>(),
  {}
)
const model = defineModel<string>({ required: true })
const emit = defineEmits<{ dimensions: [size: { width: number; height: number }] }>()

const { state, load, upload } = useMediaLibrary()
const pickerOpen = ref(false)
const busy = ref(false)
const uploadError = ref('')
const dragging = ref(false)
const broken = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

watch(model, () => (broken.value = false))
onMounted(() => load().catch(() => {}))

const describedBy = computed(() => [props.hint && `${props.id}-hint`, (props.error || uploadError.value) && `${props.id}-error`].filter(Boolean).join(' ') || undefined)
const isUpload = computed(() => /^https:\/\//.test(model.value))

// Only a value the user just set may report a size — never the stored value
// on page load (that would mark the form as changed).
const sizePending = ref(false)

function apply(item: MediaItem) {
  model.value = item.url
  if (item.width && item.height) emit('dimensions', { width: item.width, height: item.height })
  else sizePending.value = true
}

async function send(file: File | undefined) {
  if (!file) return
  busy.value = true
  uploadError.value = ''
  try {
    apply(await upload(file))
  } catch (err) {
    uploadError.value = err instanceof Error && !('statusCode' in err) ? err.message : cmsErrorMessage(err, 'Upload gagal. Coba lagi.')
  } finally {
    busy.value = false
  }
}

function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  send(file)
}

function onDrop(e: DragEvent) {
  dragging.value = false
  send(e.dataTransfer?.files?.[0])
}

function onPick(item: MediaItem) {
  pickerOpen.value = false
  apply(item)
}

// Size of an image typed as a path (or picked earlier without a size).
function onPreviewLoad(e: Event) {
  if (!sizePending.value) return
  sizePending.value = false
  const img = e.target as HTMLImageElement
  if (img.naturalWidth && img.naturalHeight) emit('dimensions', { width: img.naturalWidth, height: img.naturalHeight })
}
</script>

<template>
  <div>
    <div class="flex items-baseline justify-between gap-3">
      <label :for="id" class="text-sm font-medium">
        {{ label }}<span v-if="required" class="text-red-700" aria-hidden="true"> *</span><span v-if="required" class="sr-only"> (wajib)</span>
      </label>
      <span v-if="model" class="text-[11px] text-navy-400">{{ isUpload ? 'Dari Media library' : 'File bawaan situs' }}</span>
    </div>

    <div
      class="mt-1 rounded-md border p-3 transition-colors"
      :class="[error || uploadError ? 'border-red-400 bg-red-50/40' : dragging ? 'border-slateNavy bg-navy-50' : 'border-navy-200 bg-white']"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <div class="flex flex-wrap items-start gap-4">
        <div
          class="relative flex shrink-0 items-center justify-center overflow-hidden border border-navy-100 bg-[repeating-conic-gradient(#f1f4f6_0%_25%,#fff_0%_50%)] bg-[length:16px_16px]"
          :class="round ? 'h-24 w-24 rounded-full' : 'w-40 rounded'"
          :style="!round ? { aspectRatio: aspect || '4/3' } : undefined"
        >
          <img
            v-if="model && !broken"
            :src="model"
            alt=""
            class="h-full w-full"
            :class="fit === 'contain' || !(aspect || round) ? 'object-contain' : 'object-cover'"
            :style="focus ? { objectPosition: focus } : undefined"
            @load="onPreviewLoad"
            @error="broken = true"
          >
          <span v-else class="px-2 text-center text-[11px] text-navy-400">{{ model ? 'Preview tidak tersedia' : 'Belum ada gambar' }}</span>
        </div>

        <!-- basis-56: drops below the preview instead of squeezing in narrow columns. -->
        <div class="grid min-w-0 flex-1 basis-56 gap-2">
          <div class="flex flex-wrap gap-2">
            <button
              :id="id"
              type="button"
              class="rounded-md bg-slateNavy px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
              :disabled="busy || (state.loaded && !state.configured)"
              :aria-describedby="describedBy"
              @click="fileInput?.click()"
            >{{ busy ? 'Mengunggah…' : model ? 'Ganti (upload baru)' : 'Upload gambar' }}</button>
            <button type="button" class="rounded-md border border-navy-200 px-3 py-1.5 text-sm font-medium" :disabled="busy" @click="pickerOpen = true">Pilih dari Media</button>
            <button v-if="model && !required" type="button" class="rounded-md px-2 py-1.5 text-sm text-red-700 hover:underline" :disabled="busy" @click="model = ''">Hapus</button>
          </div>
          <input :id="`${id}-file`" ref="fileInput" type="file" :accept="MEDIA_ACCEPT" class="hidden" tabindex="-1" aria-hidden="true" @change="onFile">
          <p class="text-[11px] text-navy-400">JPG, PNG, WebP atau AVIF. Bisa juga tarik & lepas file ke kotak ini. Foto besar otomatis diperkecil.</p>
          <p v-if="state.loaded && !state.configured" class="text-[11px] text-amber-800">Upload belum disiapkan di server ini — pilih gambar yang sudah ada.</p>
          <p v-if="model" class="truncate text-[11px] text-navy-500" :title="model">{{ model }}</p>
          <details class="text-xs">
            <summary class="cursor-pointer text-navy-500">Lanjutan: ketik alamat gambar</summary>
            <input
              :id="`${id}-path`"
              v-model="model"
              type="text"
              inputmode="url"
              maxlength="300"
              autocomplete="off"
              :aria-label="`${label} — alamat gambar`"
              placeholder="/images/folder/file.webp"
              class="mt-1 block w-full rounded-md border border-navy-200 px-2 py-1.5 text-sm"
              @input="sizePending = true"
            >
          </details>
        </div>
      </div>
    </div>

    <p v-if="hint" :id="`${id}-hint`" class="mt-1 text-xs text-navy-500">{{ hint }}</p>
    <p v-if="error || uploadError" :id="`${id}-error`" class="mt-1 text-xs font-medium text-red-700" role="alert">
      <span aria-hidden="true">⚠ </span>{{ uploadError || error }}
    </p>

    <AdminMediaPicker :open="pickerOpen" :current="model" @close="pickerOpen = false" @select="onPick" />
  </div>
</template>
