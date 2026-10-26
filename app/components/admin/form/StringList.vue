<script setup lang="ts">
// Ordered list of plain strings (keywords, bullet points) or of picks from a
// fixed option list (`options`): add, reorder, remove. Field ids follow
// fieldId(`${path}.${index}`) so server/client errors land on the right row.
const props = withDefaults(
  defineProps<{
    legend: string
    path: string
    items: string[]
    max: number
    min?: number
    maxlength?: number
    itemLabel: string
    addLabel: string
    hint?: string
    options?: readonly { value: string; label: string }[]
    err: (path: string) => string | undefined
  }>(),
  { min: 0, maxlength: 200, hint: undefined, options: undefined }
)

function move(i: number, d: number) {
  const t = i + d
  if (t < 0 || t >= props.items.length) return
  props.items.splice(t, 0, props.items.splice(i, 1)[0]!)
}
function add() {
  const free = props.options?.find((o) => !props.items.includes(o.value))
  props.items.push(props.options ? (free?.value ?? props.options[0]!.value) : '')
}
</script>

<template>
  <fieldset class="grid gap-2">
    <legend class="text-sm font-medium">{{ legend }}</legend>
    <p v-if="hint" class="text-xs text-navy-500">{{ hint }}</p>
    <p v-if="err(path)" class="text-xs font-medium text-red-700" role="alert">{{ err(path) }}</p>
    <div v-for="(_, k) in items" :key="k" class="flex items-start gap-2">
      <div class="flex-1">
        <template v-if="options">
          <label :for="fieldId(`${path}.${k}`)" class="text-sm font-medium">{{ itemLabel }} {{ k + 1 }}</label>
          <select :id="fieldId(`${path}.${k}`)" v-model="items[k]" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm" :aria-invalid="!!err(`${path}.${k}`)">
            <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
          <p v-if="err(`${path}.${k}`)" class="mt-1 text-xs font-medium text-red-700" role="alert">{{ err(`${path}.${k}`) }}</p>
        </template>
        <AdminFormField v-else :id="fieldId(`${path}.${k}`)" v-model="items[k]!" :label="`${itemLabel} ${k + 1}`" :maxlength="maxlength" required :error="err(`${path}.${k}`)" />
      </div>
      <div class="mt-6 flex gap-1 text-xs">
        <button type="button" class="rounded px-2 py-1 hover:bg-navy-50 disabled:opacity-40" :disabled="k === 0" :aria-label="`Move ${itemLabel} ${k + 1} up`" @click="move(k, -1)">↑</button>
        <button type="button" class="rounded px-2 py-1 hover:bg-navy-50 disabled:opacity-40" :disabled="k === items.length - 1" :aria-label="`Move ${itemLabel} ${k + 1} down`" @click="move(k, 1)">↓</button>
        <button type="button" class="rounded px-2 py-1 text-red-700 hover:bg-red-50 disabled:opacity-40" :disabled="items.length <= min" :aria-label="`Remove ${itemLabel} ${k + 1}`" @click="items.splice(k, 1)">Remove</button>
      </div>
    </div>
    <div>
      <button type="button" class="rounded-md border border-navy-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-navy-50 disabled:opacity-50" :disabled="items.length >= max" @click="add">+ {{ addLabel }}</button>
      <span class="ml-2 text-xs text-navy-500">{{ items.length }}/{{ max }}</span>
    </div>
  </fieldset>
</template>
