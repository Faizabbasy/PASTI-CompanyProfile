import { IMAGE_VARIANTS } from './imageVariants'

// `srcset` for a public image that has phone-size copies (see
// scripts/make-image-variants.py), so phones download ~640px instead of the
// full desktop file. Anything else (CMS uploads, small images) → undefined,
// and the <img> keeps using `src` alone.
export function imgSet(src?: string | null): string | undefined {
  if (!src) return undefined
  const v = IMAGE_VARIANTS[src]
  if (!v) return undefined
  const stem = src.replace(/\.[a-z0-9]+$/i, '')
  return [...v.variants.map((w) => `${stem}.${w}.webp ${w}w`), `${src} ${v.w}w`].join(', ')
}

// One URL at roughly `width` px (the smallest copy at least that wide, else
// the original) — for CSS backgrounds, where srcset doesn't apply.
export function imgAt(src: string | null | undefined, width: number): string {
  if (!src) return ''
  const v = IMAGE_VARIANTS[src]
  const w = v?.variants.find((x) => x >= width)
  return v && w ? `${src.replace(/\.[a-z0-9]+$/i, '')}.${w}.webp` : src
}
