// Upload guardrails for the Media step. Not wired to an endpoint in Step 1.
// SVG is deliberately excluded (it can carry script).

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
  'image/avif': { ext: 'avif', magic: (b) => ascii(b, 4, 12) === 'ftypavif' },
  'application/pdf': { ext: 'pdf', magic: (b) => ascii(b, 0, 5) === '%PDF-' }
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

function ascii(b: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...b.subarray(start, end))
}

// Checks the declared type against the allowlist AND the file's real bytes.
export function assertAllowedUpload(mime: string, head: Uint8Array, size: number): { ext: string } {
  const rule = ALLOWED[mime]
  if (!rule || !rule.magic(head)) {
    throw createError({ statusCode: 415, statusMessage: 'File type not allowed' })
  }
  if (size > MAX_UPLOAD_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'File too large' })
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
    .slice(0, 80)
  if (!base) throw createError({ statusCode: 400, statusMessage: 'Invalid file name' })
  return base
}
