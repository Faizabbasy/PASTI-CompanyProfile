<script setup lang="ts">
import type { NavItem } from '~/composables/useNavigation'

// Desktop nav group (2026-10-16): "Services" / "Frameworks" as a trigger that
// matches LayoutNavLink, opening a panel of child pages (icon tile, name,
// description, arrow — owner reference 2026-10-19). Opens on hover
// (with a short grace period so the pointer can travel into the panel), on
// click, and from the keyboard; Escape, focus leaving the group, a route
// change or opening the other group closes it. One group open at a time
// (shared useState). Panel motion: opacity + a short lift on the editorial
// curve; lift is dropped under reduced motion.
const props = withDefaults(defineProps<{ item: NavItem; dark?: boolean }>(), { dark: false })

const route = useRoute()
const { setState } = useCustomCursor()
const openGroup = useState<string | null>('nav-open-group', () => null)

const id = `nav-${props.item.label.toLowerCase()}`
const isOpen = computed(() => openGroup.value === id)
const isCurrent = computed(() => !!props.item.children?.some((c) => stripLocale(route.path) === c.to))

const rootRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
let closeTimer: ReturnType<typeof setTimeout> | undefined

const open = () => {
  clearTimeout(closeTimer)
  openGroup.value = id
}
const close = () => {
  clearTimeout(closeTimer)
  if (openGroup.value === id) openGroup.value = null
}
const scheduleClose = () => {
  clearTimeout(closeTimer)
  closeTimer = setTimeout(close, 160)
}
const toggle = () => (isOpen.value ? close() : open())

const finePointer = () => window.matchMedia('(pointer: fine)').matches
const onEnter = () => finePointer() && open()
const onLeave = () => finePointer() && scheduleClose()

const onFocusOut = (e: FocusEvent) => {
  if (!rootRef.value?.contains(e.relatedTarget as Node | null)) close()
}
const onEscape = () => {
  if (!isOpen.value) return
  close()
  triggerRef.value?.focus()
}

watch(() => route.path, close)
onBeforeUnmount(() => clearTimeout(closeTimer))
const lp = useLocalePath()
</script>

<template>
  <div ref="rootRef" class="relative" @mouseenter="onEnter" @mouseleave="onLeave" @focusout="onFocusOut" @keydown.esc="onEscape">
    <button
      ref="triggerRef"
      type="button"
      :aria-expanded="isOpen"
      :aria-controls="`${id}-panel`"
      class="group relative flex items-center gap-1.5 whitespace-nowrap py-2 font-display text-sm font-bold tracking-tight"
      :class="dark ? ['text-pureWhite/80', { 'text-pureWhite': isCurrent || isOpen }] : ['text-navy-950', { 'text-navy-700': isCurrent }]"
      @click="toggle"
      @mouseenter="setState('link')"
      @mouseleave="setState('default')"
    >
      <span
        v-if="item.isPlatform"
        class="mt-[0.55em] h-1.5 w-1.5 shrink-0 self-start rounded-full bg-pastiYellow-500 transition-transform duration-400 ease-editorial group-hover:scale-125"
        aria-hidden="true"
      />
      <span class="relative block overflow-clip">
        <span class="block transition-transform duration-400 ease-editorial group-hover:-translate-y-full">{{ item.label }}</span>
        <span class="absolute inset-0 block translate-y-full transition-transform duration-400 ease-editorial group-hover:translate-y-0" :class="dark ? 'text-pastiYellow-500' : 'text-yellow-500'" aria-hidden="true">{{ item.label }}</span>
      </span>
      <svg viewBox="0 0 12 12" class="h-2.5 w-2.5 transition-transform duration-400 ease-editorial" :class="{ 'rotate-180': isOpen }" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5" /></svg>
      <span
        class="pointer-events-none absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 transition-transform duration-400 ease-editorial group-hover:scale-x-100"
        :class="[dark ? 'bg-pastiYellow-500' : 'bg-yellow-500', { 'scale-x-100': isCurrent || isOpen }]"
        aria-hidden="true"
      />
    </button>

    <Transition
      enter-active-class="nav-panel-motion"
      leave-active-class="nav-panel-motion"
      enter-from-class="nav-panel-hidden"
      leave-to-class="nav-panel-hidden"
    >
      <!-- pt-3 is the hover bridge between trigger and card. Layout follows
           the owner's dropdown reference (2026-10-19): small-caps heading,
           then rows of navy icon tile · name + description · arrow disc. -->
      <div v-show="isOpen" :id="`${id}-panel`" class="absolute left-1/2 top-full z-50 w-[33rem] -translate-x-1/2 pt-3">
        <div class="overflow-hidden rounded-[22px] border border-[color:rgba(3,60,89,0.1)] bg-pureWhite p-2.5 shadow-[0_30px_60px_-30px_rgba(3,60,89,0.45)]">
          <div class="flex items-center justify-between px-3 pb-1.5 pt-2.5">
            <span class="font-display text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[color:rgba(3,60,89,0.55)]">{{ item.heading ?? item.label }}</span>
            <LayoutBrandMark surface="light" :height="10" class="opacity-70" />
          </div>
          <ul>
            <li v-for="c in item.children" :key="c.to">
              <NuxtLink
                :to="lp(c.to)"
                class="nav-panel-row group/row grid grid-cols-[3rem_1fr_auto] items-center gap-x-4 rounded-[16px] px-3 py-2.5 transition-colors duration-300 ease-editorial hover:bg-[color:rgba(3,60,89,0.045)] focus-visible:bg-[color:rgba(3,60,89,0.045)] focus-visible:outline-none"
                :class="{ 'bg-[color:rgba(3,60,89,0.045)]': stripLocale(route.path) === c.to }"
                :aria-current="stripLocale(route.path) === c.to ? 'page' : undefined"
                @click="close"
                @mouseenter="setState('link')"
                @mouseleave="setState('default')"
              >
                <span
                  aria-hidden="true"
                  class="grid h-12 w-12 place-items-center rounded-[12px] transition-colors duration-300 ease-editorial"
                  :class="stripLocale(route.path) === c.to ? 'bg-pastiYellow-500 text-slateNavy' : 'bg-slateNavy text-pureWhite group-hover/row:bg-pastiYellow-500 group-hover/row:text-slateNavy'"
                >
                  <LayoutNavIcon :name="c.icon" class="h-[22px] w-[22px]" />
                </span>
                <span class="min-w-0">
                  <span class="block font-display text-[16px] font-bold tracking-[-0.01em] text-slateNavy">{{ c.label }}</span>
                  <span class="mt-0.5 block text-[13.5px] leading-snug text-[color:rgba(3,60,89,0.62)]">{{ c.description }}</span>
                </span>
                <span aria-hidden="true" class="grid h-10 w-10 place-items-center rounded-full border border-[color:rgba(3,60,89,0.14)] text-slateNavy transition-[background-color,border-color,transform] duration-500 ease-editorial group-hover/row:-rotate-45 group-hover/row:border-pastiYellow-500 group-hover/row:bg-pastiYellow-500">
                  <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
                </span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.nav-panel-motion {
  transition:
    opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.nav-panel-hidden {
  opacity: 0;
  transform: translate(-50%, -6px);
}
/* Plain selector, not :global(html…) — scoped CSS drops whatever follows
   :global(), which moved this rule onto <html> itself. */
html[data-reduced-motion='true'] .nav-panel-hidden {
  transform: translate(-50%, 0);
}
</style>
