<script setup lang="ts">
// ID / EN switch: the same page in the other language. A plain link (full
// load) on purpose — every URL renders one language server-side, so the
// header, footer and page all come up in the new language at once.
const props = withDefaults(defineProps<{ dark?: boolean; size?: 'sm' | 'lg' }>(), { dark: false, size: 'sm' })
const route = useRoute()
const locale = computed(() => localeOfPath(route.path))
const href = (l: Locale) => localePath(route.fullPath, l)
const LABEL: Record<Locale, { short: string; name: string }> = {
  id: { short: 'ID', name: 'Bahasa Indonesia' },
  en: { short: 'EN', name: 'English' }
}
const base = computed(() => (props.size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-[11px]'))
</script>

<template>
  <div
    role="group"
    :aria-label="locale === 'id' ? 'Pilih bahasa' : 'Choose language'"
    class="inline-flex items-center rounded-full p-0.5 font-display font-semibold tracking-[0.08em]"
    :class="dark ? 'bg-[color:rgba(255,255,255,0.12)]' : 'bg-[color:rgba(3,60,89,0.07)]'"
  >
    <template v-for="l in LOCALES" :key="l">
      <span
        v-if="l === locale"
        :class="[base, dark ? 'bg-pureWhite text-slateNavy' : 'bg-slateNavy text-pureWhite']"
        class="rounded-full"
        aria-current="true"
        :title="LABEL[l].name"
      >{{ LABEL[l].short }}</span>
      <a
        v-else
        :href="href(l)"
        :hreflang="l"
        :lang="l"
        :title="LABEL[l].name"
        :class="[base, dark ? 'text-[color:rgba(255,255,255,0.75)] hover:text-pureWhite' : 'text-[color:rgba(3,60,89,0.65)] hover:text-slateNavy']"
        class="rounded-full transition-colors duration-200"
      >{{ LABEL[l].short }}<span class="sr-only"> — {{ LABEL[l].name }}</span></a>
    </template>
  </div>
</template>
