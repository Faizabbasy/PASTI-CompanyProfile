<script setup lang="ts">
import gsap from 'gsap'

// A string `:is="'NuxtLink'"` is not resolved at runtime (components are
// auto-imported, not globally registered) — it rendered a dead <NuxtLink>
// element instead of an <a>. Resolve the component itself.
const RouterLink = resolveComponent('NuxtLink')

const { navItems, primaryCta } = useNavigation()
const { link: whatsappLink } = useWhatsapp()
const { isOpen: open, close } = useMobileMenu()

const route = useRoute()
const listRef = ref<HTMLElement | null>(null)

// Groups (Services / Platforms, 2026-10-16) are accordions; the group that
// holds the current page starts expanded each time the menu opens.
const expanded = ref<string[]>([])
const isExpanded = (label: string) => expanded.value.includes(label)
const toggleGroup = (label: string) => {
  expanded.value = isExpanded(label) ? expanded.value.filter((l) => l !== label) : [...expanded.value, label]
}
const groupId = (label: string) => `m-nav-${label.toLowerCase()}`

let mm: gsap.MatchMedia | undefined

watch(open, (isOpen) => {
  document.documentElement.style.overflow = isOpen ? 'hidden' : ''

  if (isOpen) {
    expanded.value = navItems.filter((i) => i.children?.some((c) => c.to === route.path)).map((i) => i.label)
    nextTick(() => {
      const items = listRef.value?.querySelectorAll(':scope > li')
      if (!items?.length) return

      mm?.revert()
      mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          items,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.05, delay: 0.15 }
        )
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(items, { opacity: 1, y: 0 })
      })
    })
  }
})

onBeforeUnmount(() => {
  document.documentElement.style.overflow = ''
  mm?.revert()
})
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-400 ease-editorial"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-400 ease-editorial"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="fixed inset-0 z-40 bg-paper lg:hidden"
      role="dialog"
      aria-modal="true"
    >
      <Transition
        appear
        enter-active-class="transition-all duration-600 ease-editorial delay-100"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
      >
        <nav aria-label="Main" class="container-page flex h-full flex-col justify-between gap-8 overflow-y-auto py-28">
          <ul ref="listRef" class="flex flex-col gap-1">
            <li
              v-for="item in navItems"
              :key="item.to"
              class="border-b border-navy-100"
            >
              <template v-if="item.children">
                <button
                  type="button"
                  :aria-expanded="isExpanded(item.label)"
                  :aria-controls="groupId(item.label)"
                  class="flex w-full items-center gap-2 py-4 text-left font-display text-display-sm font-semibold text-ink"
                  @click="toggleGroup(item.label)"
                >
                  <span v-if="item.isPlatform" class="h-2 w-2 rounded-full bg-yellow-500" aria-hidden="true" />
                  {{ item.label }}
                  <span
                    aria-hidden="true"
                    class="ml-auto grid h-11 w-11 place-items-center rounded-full border transition-[background-color,border-color,transform] duration-400 ease-editorial"
                    :class="isExpanded(item.label) ? 'rotate-45 border-pastiYellow-500 bg-pastiYellow-500 text-slateNavy' : 'border-navy-100 text-ink'"
                  >
                    <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 3v10M3 8h10" /></svg>
                  </span>
                </button>
                <div
                  :id="groupId(item.label)"
                  class="m-nav-collapse grid"
                  :class="isExpanded(item.label) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
                  :inert="!isExpanded(item.label) || undefined"
                >
                  <ul class="min-h-0 overflow-hidden">
                    <li v-for="c in item.children" :key="c.to" class="pb-2 last:pb-4">
                      <NuxtLink
                        :to="c.to"
                        :aria-current="route.path === c.to ? 'page' : undefined"
                        class="flex min-h-[56px] items-start gap-3 rounded-[14px] px-3 py-3 transition-colors duration-300 active:bg-[color:rgba(3,60,89,0.06)]"
                        :class="{ 'bg-[color:rgba(3,60,89,0.05)]': route.path === c.to }"
                        @click="close()"
                      >
                        <span aria-hidden="true" class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" :class="route.path === c.to || c.isPlatform ? 'bg-pastiYellow-500' : 'bg-[color:rgba(3,60,89,0.25)]'" />
                        <span>
                          <span class="block font-display text-[19px] font-bold tracking-[-0.01em] text-slateNavy">{{ c.label }}</span>
                          <span class="mt-0.5 block text-[14px] leading-snug text-[color:rgba(3,60,89,0.65)]">{{ c.description }}</span>
                        </span>
                      </NuxtLink>
                    </li>
                  </ul>
                </div>
              </template>
              <component
                :is="item.comingSoon ? 'span' : RouterLink"
                v-else
                :to="item.comingSoon ? undefined : item.to"
                :aria-disabled="item.comingSoon ? 'true' : undefined"
                :title="item.comingSoon ? `${item.label} — coming soon` : undefined"
                class="flex items-center gap-2 py-4 font-display text-display-sm font-semibold text-ink transition-colors duration-400 ease-editorial hover:text-navy-500"
                :class="[{ 'text-navy-700': route.path === item.to }, { 'cursor-default opacity-50': item.comingSoon }]"
                @click="item.comingSoon ? undefined : close()"
              >
                <span
                  v-if="item.isPlatform"
                  class="h-2 w-2 rounded-full bg-yellow-500"
                  aria-hidden="true"
                />
                {{ item.label }}
              </component>
            </li>
          </ul>

          <a :href="whatsappLink" target="_blank" rel="noopener noreferrer" class="btn-accent w-full" @click="close()">
            {{ primaryCta.label }}
          </a>
        </nav>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.m-nav-collapse {
  transition: grid-template-rows 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
:global(html[data-reduced-motion='true']) .m-nav-collapse {
  transition: none;
}
</style>
