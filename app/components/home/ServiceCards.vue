<script setup lang="ts">
const { services } = useServices()
</script>

<template>
  <BaseSection as="section" class="pt-0 md:pt-8">
    <BaseContainer>
      <HomeServicesReactiveField :row-count="services.length" />
      <div class="mx-auto flex max-w-5xl flex-col gap-4 md:gap-5">
        <HomeServiceRow
          v-for="(service, index) in services"
          :key="service.index"
          :service="service"
          :index="index"
        />
      </div>
    </BaseContainer>
  </BaseSection>
</template>
