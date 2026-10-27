<script setup lang="ts">
// Shared hero CTA pair — the homepage hero's buttons: a PASTI Yellow orb in a
// white halo leading a glass pill (primary), then a quiet text link with a
// drawing underline (secondary). Each one is a link (`href`) or a button that
// emits (in-page scroll). Links that leave the site (e.g. WhatsApp) open in a
// new tab; site paths, #anchors, mailto/tel and absolute links to this site
// stay in the same tab (CMS Step 4 CTA rule). `surface="dark"` is
// the navy-hero variant (glass pill on navy, white text link); `yellow` swaps
// the orb to Slate Navy so it doesn't vanish on the PASTI Yellow hero.
const props = withDefaults(defineProps<{
  primary: { label: string; href?: string }
  secondary?: { label: string; href?: string; down?: boolean }
  surface?: 'light' | 'dark' | 'yellow'
}>(), { surface: 'light' })
const emit = defineEmits<{ primary: []; secondary: [] }>()

const primaryRef = ref<HTMLElement | null>(null)
const secondaryRef = ref<HTMLElement | null>(null)
useMagnetic(primaryRef, { strength: 0.2 })
useMagnetic(secondaryRef, { strength: 0.2 })

const NuxtLink = resolveComponent('NuxtLink')
const siteHost = new URL(useRuntimeConfig().public.siteUrl).host.replace(/^www\./, '')

type LinkKind = 'button' | 'route' | 'same-tab' | 'external'
function linkKind(href?: string): LinkKind {
  if (!href) return 'button'
  if (href.startsWith('/') && !href.startsWith('//')) return 'route'
  if (/^https?:\/\//i.test(href)) {
    try {
      return new URL(href).host.replace(/^www\./, '') === siteHost ? 'same-tab' : 'external'
    } catch {
      return 'external'
    }
  }
  return 'same-tab'
}
const tagFor = (href?: string) => ({ button: 'button', route: NuxtLink, 'same-tab': 'a', external: 'a' })[linkKind(href)]
const ext = (href?: string) => {
  switch (linkKind(href)) {
    case 'button': return { type: 'button' }
    case 'route': return { to: lp(href!) }
    case 'same-tab': return { href }
    case 'external': return { href, target: '_blank', rel: 'noopener noreferrer' }
  }
}
void props
const lp = useLocalePath()
</script>

<template>
  <div class="m-center-row flex flex-wrap items-center gap-x-7 gap-y-4">
    <div ref="primaryRef" class="inline-block">
      <component
        :is="tagFor(primary.href)"
        v-bind="ext(primary.href)"
        class="group flex items-center transition-transform duration-200 active:scale-[0.97]"
        @click="!primary.href && emit('primary')"
      >
        <span
          class="relative z-10 grid h-[72px] w-[72px] place-items-center rounded-full border backdrop-blur-sm"
          :class="surface === 'dark' ? 'border-[color:rgba(255,255,255,0.16)] bg-[color:rgba(255,255,255,0.1)]' : 'border-[color:rgba(3,60,89,0.08)] bg-[color:rgba(255,255,255,0.7)] shadow-[0_20px_44px_-20px_rgba(3,60,89,0.45),inset_0_1px_0_#fff]'"
        >
          <span
            class="grid h-12 w-12 place-items-center rounded-full transition-transform duration-500 ease-editorial group-hover:rotate-[-45deg]"
            :class="surface === 'yellow' ? 'bg-slateNavy text-pastiYellow-500 shadow-[0_10px_24px_-8px_rgba(3,60,89,0.7)]' : 'bg-pastiYellow-500 text-slateNavy shadow-[0_10px_24px_-8px_rgba(251,186,0,0.9),inset_0_-3px_6px_rgba(200,120,0,0.25),inset_0_2px_4px_rgba(255,255,255,0.6)]'"
          >
            <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
          </span>
        </span>
        <span
          class="relative -ml-5 flex h-[52px] items-center overflow-hidden rounded-full border pl-10 pr-7 font-display text-[15px] font-bold backdrop-blur-sm"
          :class="surface === 'dark' ? 'border-[color:rgba(255,255,255,0.16)] bg-[color:rgba(255,255,255,0.1)] text-pureWhite' : 'border-[color:rgba(3,60,89,0.12)] bg-[color:rgba(255,255,255,0.72)] text-slateNavy shadow-[0_16px_36px_-22px_rgba(3,60,89,0.5)]'"
        >
          <span aria-hidden="true" class="absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-editorial group-hover:scale-x-100" :class="surface === 'dark' ? 'bg-pureWhite' : 'bg-slateNavy'" />
          <span class="relative transition-colors duration-300" :class="surface === 'dark' ? 'group-hover:text-slateNavy' : 'group-hover:text-pureWhite'">{{ primary.label }}</span>
        </span>
      </component>
    </div>
    <div v-if="secondary" ref="secondaryRef" class="inline-block">
      <component
        :is="tagFor(secondary.href)"
        v-bind="ext(secondary.href)"
        class="group relative inline-flex min-h-11 items-center gap-3 py-2 font-display text-[15px] font-semibold"
        :class="surface === 'dark' ? 'text-pureWhite' : 'text-slateNavy'"
        @click="!secondary.href && emit('secondary')"
      >
        {{ secondary.label }}
        <svg viewBox="0 0 16 16" class="h-4 w-4 transition-transform duration-300 ease-editorial" :class="secondary.down ? 'rotate-90 group-hover:translate-y-1' : 'group-hover:translate-x-1'" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
        <span aria-hidden="true" class="absolute inset-x-0 bottom-1 h-px origin-right scale-x-0 bg-current transition-transform duration-500 ease-editorial group-hover:origin-left group-hover:scale-x-100" />
      </component>
    </div>
  </div>
</template>
