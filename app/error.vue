<script setup lang="ts">
import type { NuxtError } from '#app'

// Branded error page (2026-10-16). Nuxt renders this INSTEAD of app.vue, so
// the global header/footer, Lenis and the cursor aren't mounted here — the
// page is self-contained. The hero knot stands in for the "0" of 404 (any
// other status keeps its own digits). Motion: CSS only, expo-out mask rise,
// switched off under prefers-reduced-motion. Copy is functional microcopy
// (owner review pending), no claims.
const props = defineProps<{ error: NuxtError }>()

const code = computed(() => props.error.statusCode || 500)
const notFound = computed(() => code.value === 404)
const digits = computed(() => String(code.value).split(''))

const { link: whatsappLink } = useWhatsapp()

const t = useT()
const locale = useLocale()
const lp = useLocalePath()
useHead({ htmlAttrs: { lang: locale } })
useSeoMeta({
  title: () => (notFound.value ? t('Page not found | PASTI') : t('Something went wrong | PASTI')),
  robots: 'noindex'
})

const home = () => clearError({ redirect: lp('/') })
</script>

<template>
  <main class="err relative flex min-h-[100svh] flex-col overflow-hidden bg-paper text-slateNavy">
    <div aria-hidden="true" class="err-grid pointer-events-none absolute inset-0" />

    <header class="relative z-10 px-6 pt-6 tablet:px-10 tablet:pt-8">
      <button type="button" class="block" :aria-label="t('PASTI — back to home')" @click="home">
        <img src="/images/pasti-logo.webp" alt="PASTI" width="1205" height="527" class="h-6 w-auto tablet:h-7">
      </button>
    </header>

    <section class="relative z-10 m-center mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-14 tablet:px-10">
      <div class="err-in" style="--d: 0.05s">
        <BaseHeroMarker :label="t('Error {code}', { code })" />
      </div>

      <p class="err-code m-center-row mt-6 flex select-none items-center font-display font-extrabold leading-none tracking-[-0.06em]" aria-hidden="true">
        <span v-for="(d, i) in digits" :key="i" :class="notFound && i === 1 ? 'inline-block' : 'err-mask'">
          <span v-if="notFound && i === 1" class="err-knot-slot" :style="{ '--d': `${0.12 + i * 0.07}s` }">
            <img src="/images/hero-knot.webp" alt="" class="err-knot">
          </span>
          <span v-else class="err-digit" :style="{ '--d': `${0.12 + i * 0.07}s` }">{{ d }}</span>
        </span>
      </p>

      <h1 class="err-in mt-6 max-w-xl font-display text-[34px] font-bold leading-[1.02] tracking-[-0.035em] tablet:text-[48px]" style="--d: 0.34s">
        <template v-if="notFound">{{ t('Page not found') }}<span class="text-pastiYellow-500">.</span></template>
        <template v-else>{{ t('Something went wrong') }}<span class="text-pastiYellow-500">.</span></template>
      </h1>
      <p class="hero-lede err-in m-center mt-4" style="--d: 0.42s">
        <template v-if="notFound">{{ t('The link may be broken, or the page has moved. Let’s get you back on track.') }}</template>
        <template v-else>{{ t('We hit an unexpected error on our side. Please try again in a moment.') }}</template>
      </p>

      <div class="err-in mt-9" style="--d: 0.5s">
        <BaseHeroCtas
          :primary="{ label: t('Back to home') }"
          :secondary="{ label: t('Tell us about it'), href: whatsappLink }"
          @primary="home"
        />
      </div>
    </section>

    <footer class="relative z-10 m-center px-6 pb-6 font-display text-token-metadata font-semibold uppercase tracking-[0.12em] text-[color:rgba(3,60,89,0.55)] tablet:px-10 tablet:pb-8">
      © PASTI · PT Hidup Pasti Bahagia
    </footer>
  </main>
</template>

<style scoped>
.err-grid {
  background-image:
    linear-gradient(rgba(3, 60, 89, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(3, 60, 89, 0.05) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse at 30% 50%, #000 20%, transparent 75%);
}

.err-code {
  font-size: clamp(120px, 34vw, 300px);
  gap: 0.02em;
}
.err-mask {
  display: inline-block;
  overflow: hidden;
  padding: 0.04em 0.02em 0;
}
.err-digit {
  display: inline-block;
}
/* The knot sits in a cell one digit wide so the "4 _ 4" rhythm holds. */
.err-knot-slot {
  display: inline-block;
  position: relative;
  width: 0.62em;
  height: 0.74em;
}
.err-knot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 1.35em;
  max-width: none;
  height: auto;
  transform: translate(-50%, -50%);
  mix-blend-mode: multiply;
}

@media (prefers-reduced-motion: no-preference) {
  .err-digit {
    transform: translateY(105%);
    animation: err-rise 1.1s cubic-bezier(0.16, 1, 0.3, 1) var(--d, 0s) forwards;
  }
  .err-in {
    opacity: 0;
    transform: translateY(14px);
    animation: err-in 0.9s cubic-bezier(0.16, 1, 0.3, 1) var(--d, 0s) forwards;
  }
  .err-knot-slot {
    opacity: 0;
    transform: scale(0.82);
    animation: err-in 1.3s cubic-bezier(0.16, 1, 0.3, 1) var(--d, 0s) forwards;
  }
  .err-knot {
    animation: err-turn 18s linear infinite;
  }
}

@keyframes err-rise {
  to {
    transform: translateY(0);
  }
}
@keyframes err-in {
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes err-turn {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
</style>
