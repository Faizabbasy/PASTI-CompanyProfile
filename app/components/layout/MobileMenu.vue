<script setup lang="ts">
import gsap from 'gsap'

const { navItems, primaryCta } = useNavigation()
const { isOpen: open, close } = useMobileMenu()

const route = useRoute()
const listRef = ref<HTMLElement | null>(null)

let mm: gsap.MatchMedia | undefined

watch(open, (isOpen) => {
  document.documentElement.style.overflow = isOpen ? 'hidden' : ''

  if (isOpen) {
    nextTick(() => {
      const items = listRef.value?.querySelectorAll('li')
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
        <nav class="container-page flex h-full flex-col justify-between py-28">
          <ul ref="listRef" class="flex flex-col gap-1">
            <li
              v-for="item in navItems"
              :key="item.to"
              class="border-b border-navy-100"
            >
              <NuxtLink
                :to="item.to"
                class="flex items-center gap-2 py-4 font-display text-display-sm font-semibold text-ink transition-colors duration-400 ease-editorial hover:text-navy-500"
                :class="{ 'text-navy-700': route.path === item.to }"
                @click="close()"
              >
                <span
                  v-if="item.isPlatform"
                  class="h-2 w-2 rounded-full bg-yellow-500"
                  aria-hidden="true"
                />
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>

          <NuxtLink :to="primaryCta.to" class="btn-accent w-full" @click="close()">
            {{ primaryCta.label }}
          </NuxtLink>
        </nav>
      </Transition>
    </div>
  </Transition>
</template>
