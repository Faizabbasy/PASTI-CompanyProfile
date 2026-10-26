<script setup lang="ts">
import type { FieldDesc } from '#shared/cms/productFields'

// Renders a product-page field map (shared/cms/productFields.ts) as form fields,
// recursively. Lists have a fixed item count, so there is no add/remove:
// every item is shown, edited in place. Ids follow fieldId(path), so the
// editor's "jump to first error" lands on the right input.
defineOptions({ name: 'AdminProductFields' })

const props = defineProps<{
  fields: Record<string, FieldDesc>
  model: Record<string, unknown>
  path: string
  err: (path: string) => string | undefined
}>()

const p = (k: string) => (props.path ? `${props.path}.${k}` : k)
const arr = (k: string) => props.model[k] as unknown[]
const obj = (v: unknown) => v as Record<string, unknown>
const titleOf = (v: unknown, i: number) => {
  if (typeof v === 'string') return `#${i + 1} · ${v}`
  const o = obj(v)
  const name = [o.label, o.name, o.title, o.capability, o.problem, o.key].find((x) => typeof x === 'string' && x)
  return `#${i + 1}${name ? ` · ${name}` : ''}`
}

// Comparison cells: true = Ya (✓), null = Tidak (—), string = text.
const cellKind = (v: unknown) => (v === true ? 'yes' : v === null ? 'no' : 'text')
function setCellKind(list: unknown[], i: number, kind: string) {
  list[i] = kind === 'yes' ? true : kind === 'no' ? null : typeof list[i] === 'string' ? list[i] : ''
}
</script>

<template>
  <div class="grid gap-5">
    <template v-for="(d, k) in fields" :key="k">
      <AdminFormField
        v-if="d.k === 'text'"
        :id="fieldId(p(k))"
        v-model="(model[k] as string)"
        :label="d.label"
        :maxlength="d.max"
        :multiline="d.multiline"
        :hint="d.hint"
        required
        :error="err(p(k))"
      />

      <AdminFormImage
        v-else-if="d.k === 'image'"
        :id="fieldId(p(k))"
        v-model="(model[k] as string)"
        :label="d.label"
        :aspect="d.aspect"
        :hint="d.hint"
        required
        :error="err(p(k))"
      />

      <fieldset v-else-if="d.k === 'strings'" :id="fieldId(p(k))" tabindex="-1" class="rounded-lg border border-navy-100 bg-white p-4">
        <legend class="px-1 text-sm font-semibold">{{ d.label }} <span class="font-normal text-navy-400">({{ d.n }})</span></legend>
        <p v-if="d.hint" class="mb-2 text-xs text-navy-500">{{ d.hint }}</p>
        <p v-if="err(p(k))" class="mb-2 text-xs font-medium text-red-700" role="alert">{{ err(p(k)) }}</p>
        <div class="grid gap-3 tablet:grid-cols-2">
          <AdminFormField
            v-for="(_, i) in arr(k)"
            :id="fieldId(`${p(k)}.${i}`)"
            :key="i"
            v-model="(arr(k)[i] as string)"
            :label="`${d.itemLabel} ${i + 1}`"
            :maxlength="d.max"
            required
            :error="err(`${p(k)}.${i}`)"
          />
        </div>
      </fieldset>

      <fieldset v-else-if="d.k === 'items'" :id="fieldId(p(k))" tabindex="-1" class="rounded-lg border border-navy-100 bg-white p-4">
        <legend class="px-1 text-sm font-semibold">{{ d.label }} <span class="font-normal text-navy-400">({{ d.n }})</span></legend>
        <p v-if="d.hint" class="mb-2 text-xs text-navy-500">{{ d.hint }}</p>
        <p v-if="err(p(k))" class="mb-2 text-xs font-medium text-red-700" role="alert">{{ err(p(k)) }}</p>
        <div class="grid gap-3">
          <div v-for="(item, i) in arr(k)" :key="i" class="rounded-md border border-navy-100 bg-navy-50/40 p-3">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-500">{{ titleOf(item, i) }}</p>
            <AdminProductFields :fields="d.fields" :model="obj(item)" :path="`${p(k)}.${i}`" :err="err" />
          </div>
        </div>
      </fieldset>

      <fieldset v-else-if="d.k === 'group'" class="rounded-lg border border-navy-100 bg-white p-4">
        <legend class="px-1 text-sm font-semibold">{{ d.label }}</legend>
        <AdminProductFields :fields="d.fields" :model="obj(model[k])" :path="p(k)" :err="err" />
      </fieldset>

      <fieldset v-else-if="d.k === 'tuple'" class="grid gap-3 rounded-lg border border-navy-100 bg-white p-4">
        <legend class="px-1 text-sm font-semibold">{{ d.label }}</legend>
        <div v-for="(g, i) in d.items" :key="i" class="rounded-md border border-navy-100 bg-navy-50/40 p-3">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-500">{{ g.label }}</p>
          <AdminProductFields :fields="g.fields" :model="obj(arr(k)[i])" :path="`${p(k)}.${i}`" :err="err" />
        </div>
      </fieldset>

      <div v-else-if="d.k === 'cells'" :id="fieldId(p(k))" tabindex="-1">
        <p class="text-sm font-medium">{{ d.label }}</p>
        <p v-if="d.hint" class="text-xs text-navy-500">{{ d.hint }}</p>
        <div class="mt-2 grid gap-3 tablet:grid-cols-3">
          <div v-for="(v, i) in arr(k)" :key="i">
            <label :for="fieldId(`${p(k)}.${i}`) + '-kind'" class="text-xs text-navy-500">Column {{ i + 1 }}</label>
            <select
              :id="fieldId(`${p(k)}.${i}`) + '-kind'"
              :value="cellKind(v)"
              class="mt-1 block w-full rounded-md border border-navy-200 px-2 py-1.5 text-sm"
              @change="setCellKind(arr(k), i, ($event.target as HTMLSelectElement).value)"
            >
              <option value="yes">Ya (✓)</option>
              <option value="no">Tidak (—)</option>
              <option value="text">Teks</option>
            </select>
            <input
              v-if="cellKind(v) === 'text'"
              :id="fieldId(`${p(k)}.${i}`)"
              v-model="(arr(k)[i] as string)"
              type="text"
              :maxlength="d.max + 20"
              :aria-label="`Column ${i + 1} text`"
              :aria-invalid="!!err(`${p(k)}.${i}`)"
              class="mt-1 block w-full rounded-md border px-2 py-1.5 text-sm"
              :class="err(`${p(k)}.${i}`) ? 'border-red-400 bg-red-50/40' : 'border-navy-200'"
            >
            <p v-if="err(`${p(k)}.${i}`)" class="mt-1 text-xs font-medium text-red-700">{{ err(`${p(k)}.${i}`) }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
