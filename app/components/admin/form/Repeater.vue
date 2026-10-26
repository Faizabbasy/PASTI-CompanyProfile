<script setup lang="ts" generic="T extends { id?: string; _key: string; active: boolean; sortOrder: number }">
// Controlled repeater for About lists: add, reorder (up/down), activate/
// deactivate. Items already live in the published version can only be
// deactivated; unpublished items can also be removed.
const props = defineProps<{
  legend: string
  items: T[]
  max: number
  publishedIds: string[]
  itemTitle: (item: T, index: number) => string
  addLabel: string
  error?: string
}>()
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
</script>

<template>
  <fieldset>
    <legend class="sr-only">{{ legend }}</legend>
    <p v-if="error" class="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">{{ error }}</p>

    <ol class="space-y-4">
      <li
        v-for="(item, i) in items"
        :key="item._key"
        class="rounded-lg border bg-white"
        :class="item.active ? 'border-navy-100' : 'border-dashed border-navy-200 bg-surfaceNeutral'"
      >
        <div class="flex flex-wrap items-center gap-2 border-b border-navy-100 px-4 py-2">
          <span class="text-xs font-semibold tabular-nums text-navy-500">#{{ i + 1 }}</span>
          <span class="truncate text-sm font-semibold">{{ itemTitle(item, i) || 'Untitled' }}</span>
          <span
            class="rounded-full px-2 py-0.5 text-[11px] font-semibold"
            :class="item.active ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'"
          >{{ item.active ? 'Active' : 'Inactive' }}</span>
          <span v-if="!item.id" class="rounded-full bg-navy-50 px-2 py-0.5 text-[11px] font-semibold text-navy-600">New</span>
          <span v-else-if="isPublished(item)" class="text-[11px] text-navy-500">Published item</span>

          <div class="ml-auto flex items-center gap-1">
            <button type="button" class="rounded px-2 py-1 text-xs hover:bg-navy-50 disabled:opacity-40" :disabled="i === 0" :aria-label="`Move item ${i + 1} up`" @click="move(i, -1)">↑ Up</button>
            <button type="button" class="rounded px-2 py-1 text-xs hover:bg-navy-50 disabled:opacity-40" :disabled="i === items.length - 1" :aria-label="`Move item ${i + 1} down`" @click="move(i, 1)">↓ Down</button>
            <label class="ml-1 inline-flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-xs hover:bg-navy-50">
              <input v-model="item.active" type="checkbox" class="h-3.5 w-3.5">
              Active
            </label>
            <button
              v-if="!isPublished(item)"
              type="button"
              class="rounded px-2 py-1 text-xs text-red-700 hover:bg-red-50"
              :aria-label="`Remove item ${i + 1}`"
              @click="remove(i)"
            >Remove</button>
          </div>
        </div>
        <div class="grid gap-4 p-4" :class="{ 'opacity-75': !item.active }">
          <slot :item="item" :index="i" />
        </div>
      </li>
    </ol>

    <p v-if="items.length === 0" class="rounded-lg border border-dashed border-navy-200 bg-white px-4 py-6 text-center text-sm text-navy-500">No items yet.</p>

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
