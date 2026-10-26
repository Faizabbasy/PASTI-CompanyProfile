<script setup lang="ts">
// Plain-text CMS field: label, counter, hint, accessible error.
const props = withDefaults(
  defineProps<{
    id: string
    label: string
    maxlength: number
    required?: boolean
    multiline?: boolean
    rows?: number
    hint?: string
    error?: string
    placeholder?: string
    inputmode?: 'text' | 'url'
  }>(),
  { rows: 3, inputmode: 'text' }
)
const model = defineModel<string>({ required: true })
const describedBy = computed(() => [props.hint && `${props.id}-hint`, props.error && `${props.id}-error`].filter(Boolean).join(' ') || undefined)
const over = computed(() => model.value.length > props.maxlength)
</script>

<template>
  <div>
    <div class="flex items-baseline justify-between gap-3">
      <label :for="id" class="text-sm font-medium">
        {{ label }}<span v-if="required" class="text-red-700" aria-hidden="true"> *</span><span v-if="required" class="sr-only"> (required)</span>
      </label>
      <span class="text-[11px] tabular-nums" :class="over ? 'font-semibold text-red-700' : 'text-navy-400'" aria-hidden="true">{{ model.length }}/{{ maxlength }}</span>
    </div>
    <textarea
      v-if="multiline"
      :id="id"
      v-model="model"
      :rows="rows"
      :required="required"
      :placeholder="placeholder"
      :aria-invalid="!!error"
      :aria-describedby="describedBy"
      class="mt-1 block w-full rounded-md border px-3 py-2 text-sm leading-relaxed"
      :class="error ? 'border-red-400 bg-red-50/40' : 'border-navy-200'"
    />
    <input
      v-else
      :id="id"
      v-model="model"
      type="text"
      :inputmode="inputmode"
      :required="required"
      :placeholder="placeholder"
      :aria-invalid="!!error"
      :aria-describedby="describedBy"
      autocomplete="off"
      spellcheck="true"
      class="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
      :class="error ? 'border-red-400 bg-red-50/40' : 'border-navy-200'"
    >
    <p v-if="hint" :id="`${id}-hint`" class="mt-1 text-xs text-navy-500">{{ hint }}</p>
    <p v-if="error" :id="`${id}-error`" class="mt-1 text-xs font-medium text-red-700">
      <span aria-hidden="true">⚠ </span>{{ error }}
    </p>
  </div>
</template>
