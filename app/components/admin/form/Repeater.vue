<script setup lang="ts" generic="T extends { id?: string; _key: string; active: boolean; sortOrder: number }">
// Controlled repeater for CMS lists: add, reorder (up/down), show/hide.
// Items already live in the published version can only be hidden;
// unpublished items can also be removed. `collapsible` turns each item into
// one compact row (optional #summary slot, e.g. a logo thumbnail) that opens
// on "Edit"; new items and items with errors are always open.
const props = defineProps<{
  legend: string
  items: T[]
  max: number
  publishedIds: string[]
  itemTitle: (item: T, index: number) => string
  addLabel: string
  error?: string
  // Labels are Indonesian by default; 'en' kept for any older caller.
  locale?: 'en' | 'id'
  collapsible?: boolean
  // Item has a validation error (keeps a collapsible item open).
  hasError?: (index: number) => boolean
}>()
const L = computed(() =>
  props.locale !== 'en'
    ? { active: 'Tampil', inactive: 'Disembunyikan', newItem: 'Baru', published: 'Sudah tayang', up: '↑ Naik', down: '↓ Turun', show: 'Tampilkan', remove: 'Hapus', empty: 'Belum ada item.', untitled: 'Tanpa judul', edit: 'Edit', close: 'Tutup' }
    : { active: 'Active', inactive: 'Inactive', newItem: 'New', published: 'Published item', up: '↑ Up', down: '↓ Down', show: 'Active', remove: 'Remove', empty: 'No items yet.', untitled: 'Untitled', edit: 'Edit', close: 'Close' }
)
const emit = defineEmits<{ add: [] }>()

function move(index: number, delta: number) {
  const list = props.items
  const target = index + delta
  if (target < 0 || target >= list.length) return
  const [item] = list.splice(index, 1)
  list.splice(target, 0, item!)
  list.forEach((it, i) => (it.sortOrder = i + 1))
}

function remove(index: number) {
  props.items.splice(index, 1)
  props.items.forEach((it, i) => (it.sortOrder = i + 1))
}

const isPublished = (item: T) => !!item.id && props.publishedIds.includes(item.id)

const opened = ref(new Set<string>())
const isOpen = (item: T, i: number) => !props.collapsible || !item.id || opened.value.has(item._key) || !!props.hasError?.(i)
function toggle(item: T) {
  const next = new Set(opened.value)
  if (next.has(item._key)) next.delete(item._key)
  else next.add(item._key)
  opened.value = next
}
</script>

<template>
  <!-- min-w-0: a fieldset defaults to min-content width and would overflow phones. -->
  <fieldset class="min-w-0">
    <legend class="sr-only">{{ legend }}</legend>
    <p v-if="error" class="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">{{ error }}</p>

    <ol :class="collapsible ? 'space-y-2' : 'space-y-4'">
      <li
        v-for="(item, i) in items"
        :key="item._key"
        class="rounded-lg border bg-white"
        :class="item.active ? 'border-navy-100' : 'border-dashed border-navy-200 bg-surfaceNeutral'"
      >
        <div class="flex flex-wrap items-center gap-2 px-4 py-2" :class="isOpen(item, i) ? 'border-b border-navy-100' : ''">
          <span class="text-xs font-semibold tabular-nums text-navy-500">#{{ i + 1 }}</span>
          <slot name="summary" :item="item" :index="i" />
          <span class="min-w-[8rem] flex-1 truncate text-sm font-semibold" :title="itemTitle(item, i)">{{ itemTitle(item, i) || L.untitled }}</span>
          <span
            class="rounded-full px-2 py-0.5 text-[11px] font-semibold"
            :class="item.active ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'"
          >{{ item.active ? L.active : L.inactive }}</span>
          <span v-if="!item.id" class="rounded-full bg-navy-50 px-2 py-0.5 text-[11px] font-semibold text-navy-600">{{ L.newItem }}</span>
          <span v-else-if="isPublished(item)" class="text-[11px] text-navy-500">{{ L.published }}</span>

          <div class="ml-auto flex shrink-0 flex-wrap items-center gap-1">
            <button type="button" class="rounded px-2 py-1 text-xs hover:bg-navy-50 disabled:opacity-40" :disabled="i === 0" :aria-label="`Naikkan item ${i + 1}`" @click="move(i, -1)">{{ L.up }}</button>
            <button type="button" class="rounded px-2 py-1 text-xs hover:bg-navy-50 disabled:opacity-40" :disabled="i === items.length - 1" :aria-label="`Turunkan item ${i + 1}`" @click="move(i, 1)">{{ L.down }}</button>
            <label class="ml-1 inline-flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-xs hover:bg-navy-50">
              <input v-model="item.active" type="checkbox" class="h-3.5 w-3.5">
              {{ L.show }}
            </label>
            <button
              v-if="!isPublished(item)"
              type="button"
              class="rounded px-2 py-1 text-xs text-red-700 hover:bg-red-50"
              :aria-label="`Hapus item ${i + 1}`"
              @click="remove(i)"
            >{{ L.remove }}</button>
            <button
              v-if="collapsible && item.id && !hasError?.(i)"
              type="button"
              class="ml-1 rounded-md border border-navy-200 px-2.5 py-1 text-xs font-semibold text-slateNavy hover:bg-navy-50"
              :aria-expanded="isOpen(item, i)"
              @click="toggle(item)"
            >{{ isOpen(item, i) ? `${L.close} ▴` : `${L.edit} ▾` }}</button>
          </div>
        </div>
        <div v-if="isOpen(item, i)" class="grid gap-4 p-4" :class="{ 'opacity-75': !item.active }">
          <slot :item="item" :index="i" />
        </div>
      </li>
    </ol>

    <p v-if="items.length === 0" class="rounded-lg border border-dashed border-navy-200 bg-white px-4 py-6 text-center text-sm text-navy-500">{{ L.empty }}</p>

    <div class="mt-4 flex items-center gap-3">
      <button
        type="button"
        class="rounded-md border border-navy-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-navy-50 disabled:opacity-50"
        :disabled="items.length >= max"
        @click="emit('add')"
      >+ {{ addLabel }}</button>
      <span class="text-xs text-navy-500">{{ items.length }}/{{ max }}</span>
    </div>
  </fieldset>
</template>
