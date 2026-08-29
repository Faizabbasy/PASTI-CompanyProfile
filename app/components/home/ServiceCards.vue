<script setup lang="ts">
const { services } = useServices()
</script>

<template>
  <BaseSection as="section" class="pt-0 md:pt-8">
    <BaseContainer>
      <div class="flex flex-col gap-4 md:gap-5">
        <HomeServiceRow v-for="service in services" :key="service.index" :service="service" />
      </div>
    </BaseContainer>
  </BaseSection>
</template>
