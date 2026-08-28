<script setup lang="ts">
// Copy sourced verbatim from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 05 — TRUST.
const heading = 'Trusted by leading organizations'

const { clients } = useTrustedClients()

const headingRef = ref<HTMLElement | null>(null)
useRevealOnScroll(headingRef)
</script>

<template>
  <BaseSection as="section">
    <BaseContainer>
      <h2 ref="headingRef" class="reveal-up text-center text-display-sm">
        {{ heading }}
      </h2>

      <div
        v-if="clients.length"
        class="mx-auto mt-16 grid max-w-4xl grid-cols-2 items-center justify-items-center gap-x-8 gap-y-12 md:grid-cols-4 md:gap-x-12"
      >
        <div
          v-for="(client, index) in clients"
          :key="client.name"
          class="reveal-up flex items-center justify-center opacity-70 grayscale transition-opacity duration-400 ease-editorial hover:opacity-100 hover:grayscale-0"
          :style="{ transitionDelay: `${index * 60}ms` }"
        >
          <img :src="client.logo" :alt="client.name" class="h-8 w-auto max-w-[140px] object-contain" loading="lazy" />
        </div>
      </div>
    </BaseContainer>
  </BaseSection>
</template>
