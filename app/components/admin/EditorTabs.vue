<script setup lang="ts">
import type { EditorTab } from '~/composables/useSingletonEditor'

// ARIA tablist for a singleton page editor (roving tabindex, Arrow / Home /
// End keys) with a per-tab error count. Panels live in the page and use
// id="panel-<key>" + aria-labelledby="tab-<key>".
const props = defineProps<{ tabs: readonly EditorTab[]; label: string; errorCount: (key: string) => number }>()
const active = defineModel<string>({ required: true })

function onTabKey(e: KeyboardEvent, index: number) {
  const n = props.tabs.length
  const next = e.key === 'ArrowRight' ? (index + 1) % n : e.key === 'ArrowLeft' ? (index - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1
  if (next < 0) return
  e.preventDefault()
  active.value = props.tabs[next]!.key
  nextTick(() => document.getElementById(`tab-${props.tabs[next]!.key}`)?.focus())
}
</script>

<template>
  <div class="mt-4 overflow-x-auto">
    <div role="tablist" :aria-label="label" class="flex min-w-max gap-1 border-b border-navy-100">
      <button
        v-for="(tab, i) in tabs"
        :id="`tab-${tab.key}`"
        :key="tab.key"
        type="button"
        role="tab"
        :aria-selected="active === tab.key"
        :aria-controls="`panel-${tab.key}`"
        :tabindex="active === tab.key ? 0 : -1"
        class="-mb-px border-b-2 px-3 py-2 text-sm font-medium"
        :class="active === tab.key ? 'border-slateNavy text-slateNavy' : 'border-transparent text-navy-500 hover:text-slateNavy'"
        @click="active = tab.key"
        @keydown="onTabKey($event, i)"
      >
        {{ tab.label }}
        <span v-if="errorCount(tab.key)" class="ml-1 rounded-full bg-red-100 px-1.5 text-[11px] font-semibold text-red-800">
          {{ errorCount(tab.key) }}<span class="sr-only"> errors</span>
        </span>
      </button>
    </div>
  </div>
</template>
