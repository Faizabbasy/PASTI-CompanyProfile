<script setup lang="ts">
const props = defineProps<{ title: string }>()
useHead({ title: () => props.title })
</script>

<template>
  <section>
    <h1 class="text-2xl font-bold">{{ title }}</h1>
    <div class="mt-6 rounded-lg border border-dashed border-navy-200 bg-white p-8 text-center">
      <p class="font-semibold">Coming in next step</p>
      <p class="mt-1 text-sm text-navy-500">This section is a protected placeholder. Editing arrives in a later CMS step.</p>
    </div>
    <slot />
  </section>
</template>
