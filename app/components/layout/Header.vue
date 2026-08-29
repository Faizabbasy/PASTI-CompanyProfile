<script setup lang="ts">
const { navItems, primaryCta } = useNavigation()
const { isOpen: mobileOpen, toggle: toggleMobile, close: closeMobile } = useMobileMenu()

const route = useRoute()
watch(() => route.path, closeMobile)
</script>

<template>
  <header class="sticky top-0 z-50 bg-paper">
    <div class="container-page flex h-16 items-center justify-between md:h-20">
      <LayoutLogo />

      <nav class="hidden items-center gap-10 lg:flex">
        <LayoutNavLink v-for="item in navItems" :key="item.to" :item="item" />
      </nav>

      <div class="hidden lg:block">
        <NuxtLink :to="primaryCta.to" class="btn-primary">
          {{ primaryCta.label }}
        </NuxtLink>
      </div>

      <LayoutMenuToggle :open="mobileOpen" @toggle="toggleMobile" />
    </div>
  </header>
</template>
