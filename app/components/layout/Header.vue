<script setup lang="ts">
const { navItems, primaryCta } = useNavigation()
const { isOpen: mobileOpen, toggle: toggleMobile, close: closeMobile } = useMobileMenu()

const route = useRoute()
watch(() => route.path, closeMobile)
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-navy-100 bg-paper/95 backdrop-blur">
    <div class="container-page flex h-20 items-center justify-between md:h-24">
      <LayoutLogo />

      <nav class="hidden items-center gap-8 lg:flex">
        <LayoutNavLink v-for="item in navItems" :key="item.to" :item="item" />
      </nav>

      <div class="hidden lg:block">
        <NuxtLink :to="primaryCta.to" class="btn-accent">
          {{ primaryCta.label }}
        </NuxtLink>
      </div>

      <LayoutMenuToggle :open="mobileOpen" @toggle="toggleMobile" />
    </div>
  </header>
</template>
