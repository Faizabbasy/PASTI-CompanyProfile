import { randomBytes } from 'node:crypto'

// Upload one image to the Media library (ADMIN + EDITOR, media.upload).
// multipart/form-data: `file` (required), `width` / `height` (optional,
// measured by the browser — used only when the header can't be read).
// The type is checked against the file's real bytes, never trusted from the
// client; the storage key is generated here, never taken from the request.
export default defineEventHandler(async (event) => {
  const { user } = await requirePermission(event, 'media.upload')
  const cfg = requireMediaStorage(event)
  await assertUploadAllowed(user.id)

  const parts = await readMultipartFormData(event)
  const file = parts?.find((p) => p.name === 'file' && p.filename)
  if (!file) throw createError({ statusCode: 400, statusMessage: 'No image in the request.' })
  const bytes = new Uint8Array(file.data.buffer, file.data.byteOffset, file.data.byteLength)
  const mime = file.type ?? ''
  const { ext } = assertAllowedUpload(mime, bytes.subarray(0, 16), bytes.byteLength)

  const dim = (name: string) => {
    const v = Number(parts?.find((p) => p.name === name)?.data.toString('utf8'))
    return Number.isInteger(v) && v > 0 && v <= 20000 ? v : null
  }
  const measured = imageSize(bytes)

  let base = 'image'
  try {
    base = safeStorageKey(file.filename!)
  } catch {
    // Unusable name (only symbols, separators…) → generic base.
  }
  const now = new Date()
  const key = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${base}-${randomBytes(3).toString('hex')}.${ext}`

  await uploadToStorage(cfg, key, bytes, mime)
  const media = await saveMedia({
    url: mediaPublicUrl(cfg, key),
    key,
    mime,
    size: bytes.byteLength,
    width: measured?.width ?? dim('width'),
    height: measured?.height ?? dim('height'),
    originalName: file.filename!.slice(0, 200),
    uploadedBy: { id: user.id, name: user.name },
    uploadedAt: now.toISOString()
  })
  await audit(event, { action: 'media.upload', entityType: 'media', entityId: media.id, metadata: { key, size: media.size, mime } })
  return { ...media, usedIn: [] }
})
