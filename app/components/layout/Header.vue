<script setup lang="ts">
import gsap from 'gsap'

const { navItems, primaryCta } = useNavigation()
const { isOpen: mobileOpen, toggle: toggleMobile, close: closeMobile } = useMobileMenu()

const route = useRoute()
watch(() => route.path, closeMobile)

const { introReady } = useIntroReady()

const logoRef = ref<HTMLElement | null>(null)
const navRef = ref<HTMLElement | null>(null)
const ctaRef = ref<HTMLElement | null>(null)
const toggleRef = ref<HTMLElement | null>(null)

const prefersReducedMotion = import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches

useGsapContext(() => {
  const navLinks = navRef.value ? Array.from(navRef.value.children) : []
  const targets = [logoRef.value, ...navLinks, ctaRef.value, toggleRef.value].filter(Boolean)

  if (!prefersReducedMotion) {
    gsap.set(targets, { opacity: 0, y: -12 })
  }

  watch(
    introReady,
    (ready) => {
      if (!ready) return

      if (prefersReducedMotion) {
        gsap.set(targets, { opacity: 1, y: 0 })
        return
      }

      const anim = gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power3.out'
      })

      return () => anim.kill()
    },
    { immediate: true }
  )
})
</script>

<template>
  <header class="relative z-50 bg-paper">
    <div class="container-page flex h-16 items-center md:h-20">
      <div ref="logoRef">
        <LayoutLogo />
      </div>

      <nav ref="navRef" class="ml-auto hidden items-center gap-10 lg:flex">
        <LayoutNavLink v-for="item in navItems" :key="item.to" :item="item" />
      </nav>

      <div ref="ctaRef" class="ml-10 hidden lg:block">
        <NuxtLink :to="primaryCta.to" class="btn-primary">
          {{ primaryCta.label }}
        </NuxtLink>
      </div>

      <div ref="toggleRef" class="ml-auto lg:hidden">
        <LayoutMenuToggle :open="mobileOpen" @toggle="toggleMobile" />
      </div>
    </div>
  </header>
</template>
