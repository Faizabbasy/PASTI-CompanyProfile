<script setup lang="ts">
// Admin CMS shell: sidebar + topbar. Functional only — no site motion.
const route = useRoute()
const navOpen = ref(false)

watch(() => route.fullPath, () => (navOpen.value = false))

useHead({
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  titleTemplate: (t) => (t ? `${t} · PASTI CMS` : 'PASTI CMS')
})
</script>

<template>
  <div class="admin min-h-screen bg-surfaceNeutral text-slateNavy">
    <a
      href="#admin-main"
      class="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-slateNavy focus:px-3 focus:py-2 focus:text-sm focus:text-white"
    >Skip to content</a>

    <!-- Off-canvas sidebar below desktop, fixed column from desktop up -->
    <div
      v-if="navOpen"
      class="fixed inset-0 z-30 bg-slateNavy/40 desktop:hidden"
      aria-hidden="true"
      @click="navOpen = false"
    />
    <AdminSidebar
      id="admin-sidebar"
      :class="[
        'fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-200 desktop:translate-x-0',
        navOpen ? 'translate-x-0' : 'invisible -translate-x-full desktop:visible'
      ]"
    />

    <div class="flex min-h-screen flex-col desktop:pl-64">
      <AdminTopbar :nav-open="navOpen" @toggle-nav="navOpen = !navOpen" />
      <main id="admin-main" tabindex="-1" class="flex-1 px-4 py-6 tablet:px-8 tablet:py-8 focus:outline-none">
        <slot />
      </main>
    </div>
  </div>
</template>

<style>
/* Visible keyboard focus across the admin (the public site styles its own). */
.admin :where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
  outline: 2px solid #033c59;
  outline-offset: 2px;
  border-radius: 6px;
}
</style>
