<script setup lang="ts">
import { ARTICLE_LIMITS as LIM, type BodyBlock } from '#shared/utils/insightsSchema'

// Structured article body: a fixed set of plain-text blocks (paragraph,
// heading, quote, list, image, divider). No HTML, embeds, CSS or scripts —
// the server validates every block against the same schema.
const props = defineProps<{ blocks: BodyBlock[]; err: (path: string) => string | undefined }>()

const TYPES = [
  { type: 'paragraph', label: 'Paragraf' },
  { type: 'heading', label: 'Subjudul' },
  { type: 'quote', label: 'Kutipan' },
  { type: 'list', label: 'Daftar poin' },
  { type: 'image', label: 'Gambar' },
  { type: 'divider', label: 'Garis pemisah' }
] as const
const make = (type: BodyBlock['type']): BodyBlock => {
  switch (type) {
    case 'paragraph': return { type, text: '' }
    case 'heading': return { type, level: 2, text: '' }
    case 'quote': return { type, text: '', attribution: '' }
    case 'list': return { type, style: 'bullet', items: [''] }
    case 'image': return { type, src: '', alt: '', caption: '' }
    case 'divider': return { type }
  }
}
const adding = ref<BodyBlock['type']>('paragraph')
const add = () => props.blocks.push(make(adding.value))
const move = (i: number, d: number) => {
  const t = i + d
  if (t < 0 || t >= props.blocks.length) return
  props.blocks.splice(t, 0, props.blocks.splice(i, 1)[0]!)
}
const label = (b: BodyBlock) => TYPES.find((t) => t.type === b.type)!.label

// Paste a whole draft (plain text or Markdown) → blocks (bodyFromText).
const pasteOpen = ref(false)
const pasted = ref('')
const parsed = computed(() => (pasted.value.trim() ? bodyFromText(pasted.value) : []))
const parsedSummary = computed(() => {
  const n = (t: BodyBlock['type']) => parsed.value.filter((b) => b.type === t).length
  return TYPES.map((t) => [t.label, n(t.type)] as const).filter(([, c]) => c).map(([l, c]) => `${c} ${l.toLowerCase()}`).join(' · ')
})
const room = computed(() => LIM.blocks - props.blocks.length)
const applyPaste = (mode: 'append' | 'replace') => {
  const list = parsed.value
  if (!list.length) return
  if (mode === 'replace' && props.blocks.length && !window.confirm(`Ganti ${props.blocks.length} blok yang ada dengan ${list.length} blok dari teks ini?`)) return
  if (mode === 'replace') props.blocks.splice(0, props.blocks.length)
  props.blocks.push(...list.slice(0, LIM.blocks - props.blocks.length))
  pasted.value = ''
  pasteOpen.value = false
}
</script>

<template>
  <fieldset class="grid gap-3">
    <legend class="text-sm font-medium">Isi artikel (blok-blok)</legend>
    <p v-if="err('body')" class="text-xs font-medium text-red-700" role="alert">{{ err('body') }}</p>
    <div class="rounded-lg border border-dashed border-navy-200 bg-navy-50/40 p-3">
      <div class="flex flex-wrap items-center gap-2">
        <button type="button" class="rounded-md border border-navy-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-navy-50" :aria-expanded="pasteOpen" aria-controls="body-paste" @click="pasteOpen = !pasteOpen">
          {{ pasteOpen ? 'Tutup' : 'Tempel dari teks…' }}
        </button>
        <span class="text-xs text-navy-600">Punya tulisan jadi (Word, Google Docs, Markdown)? Tempel sekalian — otomatis dipecah jadi blok.</span>
      </div>
      <div v-if="pasteOpen" id="body-paste" class="mt-3 grid gap-2">
        <label for="body-paste-text" class="text-sm font-medium">Teks artikel</label>
        <textarea id="body-paste-text" v-model="pasted" rows="10" class="w-full rounded-md border border-navy-200 bg-white px-3 py-2 font-mono text-xs" placeholder="Paragraf dipisah baris kosong.&#10;## Subjudul&#10;### Subjudul kecil&#10;- poin&#10;1. poin bernomor&#10;> kutipan&#10;> — Sumber kutipan&#10;---  (garis pemisah)&#10;**tebal**  *miring*" />
        <p class="text-xs text-navy-600">
          Judul artikel di baris paling atas (kalau ada) dilewati — judul sudah diisi di tab 01. Tabel jadi daftar poin; link dihapus (teksnya tetap). <strong>**tebal**</strong> dan <em>*miring*</em> ikut tampil di halaman artikel.
        </p>
        <p v-if="parsed.length" class="text-xs font-semibold text-navy-800" role="status">Terbaca {{ parsed.length }} blok: {{ parsedSummary }}<template v-if="parsed.length > room"> — hanya {{ room }} yang muat (maks {{ LIM.blocks }}).</template></p>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="rounded-md bg-navy-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50" :disabled="!parsed.length || room <= 0" @click="applyPaste('append')">Tambahkan di bawah</button>
          <button v-if="blocks.length" type="button" class="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-50 disabled:opacity-50" :disabled="!parsed.length" @click="applyPaste('replace')">Ganti semua blok</button>
        </div>
      </div>
    </div>
    <ol class="grid gap-3">
      <li v-for="(b, i) in blocks" :key="i" class="rounded-lg border border-navy-100 bg-white">
        <div class="flex items-center gap-2 border-b border-navy-100 px-3 py-1.5 text-xs">
          <span class="font-semibold">#{{ i + 1 }} {{ label(b) }}</span>
          <div class="ml-auto flex gap-1">
            <button type="button" class="rounded px-2 py-1 hover:bg-navy-50 disabled:opacity-40" :disabled="i === 0" :aria-label="`Naikkan blok ${i + 1}`" @click="move(i, -1)">↑</button>
            <button type="button" class="rounded px-2 py-1 hover:bg-navy-50 disabled:opacity-40" :disabled="i === blocks.length - 1" :aria-label="`Turunkan blok ${i + 1}`" @click="move(i, 1)">↓</button>
            <button type="button" class="rounded px-2 py-1 text-red-700 hover:bg-red-50" :aria-label="`Hapus blok ${i + 1}`" @click="blocks.splice(i, 1)">Hapus</button>
          </div>
        </div>
        <div class="grid gap-3 p-3">
          <AdminFormField v-if="b.type === 'paragraph'" :id="fieldId(`body.${i}.text`)" v-model="b.text" label="Teks" multiline :rows="4" :maxlength="LIM.paragraph" required :error="err(`body.${i}.text`)" />
          <template v-else-if="b.type === 'heading'">
            <div>
              <label :for="fieldId(`body.${i}.level`)" class="text-sm font-medium">Tingkat</label>
              <select :id="fieldId(`body.${i}.level`)" v-model.number="b.level" class="mt-1 block rounded-md border border-navy-200 bg-white px-3 py-2 text-sm">
                <option :value="2">Subjudul bagian (H2)</option>
                <option :value="3">Subjudul kecil (H3)</option>
              </select>
            </div>
            <AdminFormField :id="fieldId(`body.${i}.text`)" v-model="b.text" label="Subjudul" :maxlength="LIM.heading" required :error="err(`body.${i}.text`)" />
          </template>
          <template v-else-if="b.type === 'quote'">
            <AdminFormField :id="fieldId(`body.${i}.text`)" v-model="b.text" label="Kutipan" multiline :maxlength="LIM.quote" required :error="err(`body.${i}.text`)" />
            <AdminFormField :id="fieldId(`body.${i}.attribution`)" v-model="b.attribution" label="Sumber kutipan (opsional)" :maxlength="120" :error="err(`body.${i}.attribution`)" />
          </template>
          <template v-else-if="b.type === 'list'">
            <div class="flex gap-4 text-sm">
              <label class="inline-flex items-center gap-2"><input v-model="b.style" type="radio" value="bullet"> Titik-titik</label>
              <label class="inline-flex items-center gap-2"><input v-model="b.style" type="radio" value="numbered"> Bernomor</label>
            </div>
            <AdminFormStringList legend="Poin" :path="`body.${i}.items`" :items="b.items" :max="LIM.listItems" :min="1" :maxlength="LIM.listItem" item-label="Poin" add-label="Tambah poin" :err="err" />
          </template>
          <template v-else-if="b.type === 'image'">
            <AdminFormImage :id="fieldId(`body.${i}.src`)" v-model="b.src" label="Gambar" required :error="err(`body.${i}.src`)" />
            <AdminFormField :id="fieldId(`body.${i}.alt`)" v-model="b.alt" label="Deskripsi gambar (untuk pembaca layar)" :maxlength="LIM.alt" required :error="err(`body.${i}.alt`)" />
            <AdminFormField :id="fieldId(`body.${i}.caption`)" v-model="b.caption" label="Keterangan di bawah gambar (opsional)" :maxlength="LIM.caption" :error="err(`body.${i}.caption`)" />
          </template>
          <p v-else class="text-xs text-navy-500">Garis pemisah horizontal.</p>
        </div>
      </li>
    </ol>
    <div class="flex items-center gap-2">
      <label for="body-add-type" class="sr-only">Jenis blok</label>
      <select id="body-add-type" v-model="adding" class="rounded-md border border-navy-200 bg-white px-3 py-1.5 text-sm">
        <option v-for="t in TYPES" :key="t.type" :value="t.type">{{ t.label }}</option>
      </select>
      <button type="button" class="rounded-md border border-navy-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-navy-50 disabled:opacity-50" :disabled="blocks.length >= LIM.blocks" @click="add">+ Tambah blok</button>
      <span class="text-xs text-navy-500">{{ blocks.length }}/{{ LIM.blocks }}</span>
    </div>
  </fieldset>
</template>
