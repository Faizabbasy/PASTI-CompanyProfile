<script setup lang="ts">
// Indonesia / English switch for bilingual editors and lists: reloads the
// same admin page with ?lang= (full load, so every fetch follows). The
// default slot explains what is per language and what is shared.
defineProps<{ lang: 'id' | 'en' }>()
const route = useRoute()
const href = (l: 'id' | 'en') => `${route.path}?lang=${l}`
</script>

<template>
  <div class="mt-4 flex max-w-3xl flex-wrap items-center gap-3 rounded-lg border border-navy-100 bg-white px-4 py-3">
    <span class="text-sm font-semibold">Bahasa yang diedit:</span>
    <div class="inline-flex rounded-full bg-navy-50 p-0.5 text-sm font-semibold" role="group" aria-label="Bahasa yang diedit">
      <component :is="lang === 'id' ? 'span' : 'a'" :href="lang === 'id' ? undefined : href('id')" class="rounded-full px-3 py-1" :class="lang === 'id' ? 'bg-slateNavy text-white' : 'text-navy-600 hover:text-slateNavy'" :aria-current="lang === 'id' ? 'true' : undefined">Indonesia</component>
      <component :is="lang === 'en' ? 'span' : 'a'" :href="lang === 'en' ? undefined : href('en')" class="rounded-full px-3 py-1" :class="lang === 'en' ? 'bg-slateNavy text-white' : 'text-navy-600 hover:text-slateNavy'" :aria-current="lang === 'en' ? 'true' : undefined">English</component>
    </div>
    <p v-if="$slots.default" class="w-full text-xs text-navy-500"><slot /></p>
  </div>
</template>
