<script setup lang="ts">
// Protected placeholder — editing arrives in a later CMS step.
definePageMeta({ layout: 'admin' })

const route = useRoute()
const group = useAdminNav().find((g) => g.to === '/admin/products')
const title = computed(() => {
  const child = group?.children?.find((c) => c.to === route.path)
  return child ? `Products · ${child.label}` : 'Products'
})
</script>

<template>
  <AdminComingSoon :title="title" />
</template>
