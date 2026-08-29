<script setup lang="ts">
const { services } = useServices()

const shapes = ['diagonal', 'chevron', 'radial'] as const
</script>

<template>
  <BaseSection as="section" class="pt-0 md:pt-8">
    <BaseContainer>
      <div class="flex flex-col gap-4 md:gap-5">
        <HomeServiceRow
          v-for="(service, i) in services"
          :key="service.index"
          :service="service"
          :shape="shapes[i % shapes.length] ?? 'diagonal'"
        />
      </div>
    </BaseContainer>
  </BaseSection>
</template>
