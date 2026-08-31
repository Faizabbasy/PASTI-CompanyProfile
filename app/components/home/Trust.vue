<script setup lang="ts">
// Copy sourced verbatim from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 05 — TRUST.
const heading = 'Trusted by leading organizations'

const { clients } = useTrustedClients()

const headingRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)

useMaskedReveal(headingRef, { by: 'word' })
useScrollReveal(gridRef, { y: 16, children: '.trust-logo', stagger: 0.06 })
</script>

<template>
  <BaseSection as="section">
    <BaseContainer>
      <h2 ref="headingRef" class="text-center text-display-sm">
        {{ heading }}
      </h2>

      <div
        v-if="clients.length"
        ref="gridRef"
        class="mx-auto mt-16 flex max-w-6xl flex-wrap items-center justify-center gap-x-16 gap-y-14"
      >
        <div
          v-for="client in clients"
          :key="client.name"
          class="trust-logo flex h-24 w-56 items-center justify-center"
        >
          <img
            :src="client.logo"
            :alt="client.name"
            class="max-h-full max-w-full object-contain"
            :class="{
              'wordpress-logo scale-150': client.name === 'WordPress',
              'scale-150': client.name === 'Shopify'
            }"
            loading="lazy"
          />
        </div>
      </div>
    </BaseContainer>
  </BaseSection>
</template>

<style scoped>
.wordpress-logo {
  filter: brightness(1.08) contrast(2.2);
}
</style>
