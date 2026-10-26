// Upload guardrails for the Media library (server/api/admin/media).
// Images only; SVG is deliberately excluded (it can carry script).

const ALLOWED: Record<string, { ext: string; magic: (b: Uint8Array) => boolean }> = {
  'image/jpeg': { ext: 'jpg', magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': {
    ext: 'png',
    magic: (b) => [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => b[i] === v)
  },
  'image/webp': {
    ext: 'webp',
    magic: (b) => ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 12) === 'WEBP'
  },
  'image/avif': { ext: 'avif', magic: (b) => ascii(b, 4, 12) === 'ftypavif' }
}

// Vercel caps a function request body at ~4.5 MB; the admin downscales
// bigger images in the browser before uploading (AdminFormImage).
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

function ascii(b: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...b.subarray(start, end))
}

// Checks the declared type against the allowlist AND the file's real bytes.
export function assertAllowedUpload(mime: string, head: Uint8Array, size: number): { ext: string } {
  const rule = ALLOWED[mime]
  if (!rule || !rule.magic(head)) {
    throw createError({ statusCode: 415, statusMessage: 'Only JPG, PNG, WebP or AVIF images can be uploaded.' })
  }
  if (size > MAX_UPLOAD_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'The image is larger than 4 MB.' })
  }
  return { ext: rule.ext }
}

// Reduces a user-supplied name to a flat, safe slug: no separators, no
// traversal, no control characters. Callers append their own extension.
export function safeStorageKey(name: string): string {
  if (/[\0/\\]|\.\./.test(name)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid file name' })
  }
  const base = name
    .replace(/\.[^.]*$/, '')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
  if (!base) throw createError({ statusCode: 400, statusMessage: 'Invalid file name' })
  return base
}

// Pixel size read from the file header (PNG, JPEG, WebP). AVIF and anything
// unreadable → null (the browser-measured size is used instead).
export function imageSize(b: Uint8Array): { width: number; height: number } | null {
  const u16be = (i: number) => (b[i]! << 8) | b[i + 1]!
  const u24le = (i: number) => b[i]! | (b[i + 1]! << 8) | (b[i + 2]! << 16)
  try {
    if (b[0] === 0x89 && ascii(b, 12, 16) === 'IHDR') {
      const dv = new DataView(b.buffer, b.byteOffset, b.byteLength)
      return { width: dv.getUint32(16), height: dv.getUint32(20) }
    }
    if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2
      while (i + 9 < b.length) {
        if (b[i] !== 0xff) return null
        const marker = b[i + 1]!
        const len = u16be(i + 2)
        // SOF0..SOF15 except DHT (C4), JPG (C8), DAC (CC).
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { width: u16be(i + 7), height: u16be(i + 5) }
        }
        i += 2 + len
      }
      return null
    }
    if (ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 12) === 'WEBP') {
      const chunk = ascii(b, 12, 16)
      if (chunk === 'VP8X') return { width: u24le(24) + 1, height: u24le(27) + 1 }
      if (chunk === 'VP8 ') return { width: (b[26]! | (b[27]! << 8)) & 0x3fff, height: (b[28]! | (b[29]! << 8)) & 0x3fff }
      if (chunk === 'VP8L') {
        const bits = b[21]! | (b[22]! << 8) | (b[23]! << 16) | (b[24]! << 24)
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
      }
    }
  } catch {
    return null
  }
  return null
}
