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
</script>

<template>
  <fieldset class="grid gap-3">
    <legend class="text-sm font-medium">Isi artikel (blok-blok)</legend>
    <p v-if="err('body')" class="text-xs font-medium text-red-700" role="alert">{{ err('body') }}</p>
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
