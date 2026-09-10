<script setup lang="ts">
import gsap from 'gsap'

// Copy sourced verbatim from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 05 — TRUST.
const heading = 'Trusted by leading organizations'

const { clients } = useTrustedClients()
// Marquee needs a duplicated run so the loop can wrap seamlessly at -50%.
const marqueeClients = [...clients, ...clients]

const headingRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const hoveredClient = ref<string | null>(null)
const paused = ref(false)

const { setState } = useCustomCursor()

useMaskedReveal(headingRef, { by: 'word' })

useGsapContext(() => {
  if (!trackRef.value) return
  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const tween = gsap.to(trackRef.value, {
      xPercent: -50,
      duration: 32,
      ease: 'none',
      repeat: -1
    })

    watch(paused, (isPaused) => {
      if (isPaused) tween.pause()
      else tween.play()
    })

    return () => tween.kill()
  })
})
</script>

<template>
  <BaseSection as="section" class="overflow-hidden">
    <BaseContainer>
      <h2 ref="headingRef" class="text-center text-display-sm">
        {{ heading }}
      </h2>
    </BaseContainer>

    <div v-if="clients.length" class="relative mt-16 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div
        ref="trackRef"
        class="flex w-max flex-wrap items-center justify-center gap-x-16 gap-y-14 motion-safe:flex-nowrap motion-safe:justify-start md:gap-x-24"
        @mouseenter="paused = true"
        @mouseleave="paused = false; hoveredClient = null"
      >
        <div
          v-for="(client, i) in marqueeClients"
          :key="`${client.name}-${i}`"
          class="trust-logo flex h-24 w-56 shrink-0 items-center justify-center transition-all duration-400 ease-editorial"
          :class="[i >= clients.length ? 'motion-reduce:hidden' : '', hoveredClient === client.name ? 'scale-110' : 'scale-100']"
          :style="{ opacity: hoveredClient && hoveredClient !== client.name ? 0.3 : 1 }"
          @mouseenter="hoveredClient = client.name; setState('view')"
          @mouseleave="setState('default')"
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
    </div>
  </BaseSection>
</template>

<style scoped>
.wordpress-logo {
  filter: brightness(1.08) contrast(2.2);
}
</style>
