// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  imports: {
    dirs: ['composables', 'composables/motion']
  },

  css: ['~/assets/css/main.css'],

  // Bundle GSAP's ESM build into the server output instead of letting Node
  // load its CommonJS `main` (dist/gsap.js) — keeps `import gsap from 'gsap'`
  // resolving to the real gsap instance during SSR on Vercel.
  build: {
    transpile: ['gsap']
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap'
        }
      ]
    }
  },

  // Performance (2026-10-06): three.js (~865 KB) is only imported by the
  // hero knot on capable desktops (see useDeviceTier.ts / HeroRing.vue).
  // Nuxt adds a <link rel="prefetch"> for every dynamic chunk, which made
  // phones download it anyway — drop the hint for three's chunks only.
  hooks: {
    'build:manifest'(manifest) {
      for (const key of Object.keys(manifest)) {
        if (key.includes('node_modules/three')) {
          manifest[key]!.prefetch = false
          manifest[key]!.preload = false
        }
      }
    }
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts'
  }
})
