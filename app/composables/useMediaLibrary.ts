// Admin Media library client: listing (cached per session), upload with
// in-browser downscaling, delete. Used by AdminFormImage, the picker and
// /admin/media. The server re-checks type, size and permissions.

export interface MediaItem {
  id: string
  url: string
  key: string
  mime: string
  size: number
  width: number | null
  height: number | null
  originalName: string
  uploadedBy: { id: string; name: string } | null
  uploadedAt: string
  usedIn: { key: string; label: string }[]
}

interface MediaState {
  loaded: boolean
  configured: boolean
  items: MediaItem[]
}

// Must stay under the server limit (4 MB, Vercel body cap ~4.5 MB).
const MAX_BYTES = 4 * 1024 * 1024
const RESIZE_ABOVE_BYTES = 3.5 * 1024 * 1024
const MAX_EDGE = 2560
export const MEDIA_ACCEPT = 'image/jpeg,image/png,image/webp,image/avif'

export function cmsErrorMessage(e: unknown, fallback: string): string {
  const er = e as { statusCode?: number; statusMessage?: string; data?: { statusMessage?: string } }
  if (er.statusCode === 401) return 'Your session has expired. Sign in again in a new tab, then retry.'
  if (er.statusCode === 403) return "You don't have permission to do this."
  return er.data?.statusMessage || er.statusMessage || fallback
}

// Big photos are scaled to ≤2560px on the long edge and re-encoded as WebP
// so they fit the upload limit; smaller files are sent untouched.
async function prepareUpload(file: File): Promise<{ blob: Blob; name: string; width: number | null; height: number | null }> {
  let bmp: ImageBitmap | null = null
  try {
    bmp = await createImageBitmap(file)
  } catch {
    // Format the browser can't decode (e.g. AVIF on older browsers): send as-is.
  }
  if (!bmp) return { blob: file, name: file.name, width: null, height: null }
  const { width, height } = bmp
  if (file.size <= RESIZE_ABOVE_BYTES && Math.max(width, height) <= MAX_EDGE) {
    bmp.close()
    return { blob: file, name: file.name, width, height }
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height))
  const w = Math.round(width * scale)
  const h = Math.round(height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, w, h)
  bmp.close()
  let blob: Blob | null = null
  for (const q of [0.86, 0.75, 0.6]) {
    blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', q))
    if (blob && blob.size <= MAX_BYTES) break
  }
  if (!blob || blob.size > MAX_BYTES) throw new Error('This image is too large even after compressing. Use a smaller image.')
  return { blob, name: file.name.replace(/\.[^.]*$/, '') + '.webp', width: w, height: h }
}

export function useMediaLibrary() {
  const { cmsFetch } = useCmsSession()
  const state = useState<MediaState>('cms-media-library', () => ({ loaded: false, configured: false, items: [] }))

  async function load(force = false) {
    if (state.value.loaded && !force) return state.value
    const res = await cmsFetch<{ configured: boolean; items: MediaItem[] }>('/api/admin/media')
    state.value = { loaded: true, configured: res.configured, items: res.items }
    return state.value
  }

  async function upload(file: File): Promise<MediaItem> {
    if (!MEDIA_ACCEPT.split(',').includes(file.type)) throw new Error('Only JPG, PNG, WebP or AVIF images can be uploaded.')
    const prepared = await prepareUpload(file)
    const body = new FormData()
    body.append('file', prepared.blob, prepared.name)
    if (prepared.width) body.append('width', String(prepared.width))
    if (prepared.height) body.append('height', String(prepared.height))
    const item = await cmsFetch<MediaItem>('/api/admin/media', { method: 'POST', body })
    state.value = { ...state.value, items: [item, ...state.value.items.filter((m) => m.id !== item.id)] }
    return item
  }

  async function remove(id: string) {
    await cmsFetch(`/api/admin/media/${id}`, { method: 'DELETE' })
    state.value = { ...state.value, items: state.value.items.filter((m) => m.id !== id) }
  }

  return { state, load, upload, remove }
}
