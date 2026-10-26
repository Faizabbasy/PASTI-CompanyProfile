// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  imports: {
    dirs: ['composables', 'composables/motion']
  },

  css: ['~/assets/css/main.css'],

  // Production origin for canonical URLs, share-card images and the sitemap
  // (useSeo.ts, server/routes). Website per COMPRO 2025 (useCompany); a
  // preview deploy can override it with NUXT_PUBLIC_SITE_URL.
  runtimeConfig: {
    // Admin CMS (Step 1). Server-only — never exposed to the client bundle.
    // Every value is overridable via NUXT_CMS_* env vars (see .env.example).
    cms: {
      // CMS database (Postgres, e.g. Supabase transaction pooler URL). Set →
      // every CMS read/write goes to the cms.kv table (server/utils/cms/
      // storage.ts). Unset → local files in .data/cms, `nuxt dev` only:
      // production refuses to run the CMS without it unless allowFsStorage.
      // NUXT_CMS_DATABASE_URL / NUXT_CMS_DATABASE_CA (optional PEM root CA:
      // set it to verify the server certificate) / NUXT_CMS_ALLOW_FS_STORAGE.
      databaseUrl: '',
      databaseCa: '',
      allowFsStorage: false,
      // Media library uploads (Supabase Storage, public bucket). Unset →
      // uploads answer 503; existing /images/ paths keep working.
      // NUXT_CMS_SUPABASE_URL (https://<ref>.supabase.co) /
      // NUXT_CMS_SUPABASE_SERVICE_KEY (service_role or secret key — server
      // only, never sent to the browser) / NUXT_CMS_MEDIA_BUCKET.
      supabaseUrl: '',
      supabaseServiceKey: '',
      mediaBucket: 'cms-media',
      sessionSecret: '',
      trustProxy: false,
      allowSeed: false,
      seedAdminPassword: '',
      seedEditorPassword: '',
      // Public /about reads the published CMS snapshot only when true
      // (NUXT_CMS_ABOUT_PUBLIC_ENABLED). Server-only; default false.
      aboutPublicEnabled: false,
      // Company-proof numbers stay code-managed until real figures are
      // approved, even with the flag above on
      // (NUXT_CMS_ABOUT_PUBLIC_PROOF_ENABLED). Default false.
      aboutPublicProofEnabled: false,
      // Public /technology reads the published CMS snapshot only when true
      // (NUXT_CMS_TECHNOLOGY_PUBLIC_ENABLED). Server-only; default false.
      technologyPublicEnabled: false,
      // Public /creative reads the published CMS snapshot only when true
      // (NUXT_CMS_CREATIVE_PUBLIC_ENABLED). Server-only; default false.
      creativePublicEnabled: false,
      // Public /work reads the published Work CMS (page + projects + case
      // studies) only when true (NUXT_CMS_WORK_PUBLIC_ENABLED). Server-only;
      // default false.
      workPublicEnabled: false,
      // Public /insights reads the published Insights CMS (landing + articles
      // + categories) only when true (NUXT_CMS_INSIGHTS_PUBLIC_ENABLED).
      // Server-only; default false. The homepage never reads it.
      insightsPublicEnabled: false,
      // Public /contact reads the published Contact CMS snapshot (page
      // wording only) only when true (NUXT_CMS_CONTACT_PUBLIC_ENABLED).
      // Server-only; default false. Shared contact data and form behaviour
      // stay in code either way.
      contactPublicEnabled: false,
      // GET /api/public/pages/open serves the published OPEN product page
      // only when true (NUXT_CMS_OPEN_PUBLIC_ENABLED). Server-only; default
      // false. Structure, mock-ups and the demo form stay in code either way.
      openPublicEnabled: false,
      // Same for SHIFTLY (NUXT_CMS_SHIFTLY_PUBLIC_ENABLED) and e-CORPORATE
      // (NUXT_CMS_ECORPORATE_PUBLIC_ENABLED). Server-only; default false.
      shiftlyPublicEnabled: false,
      ecorporatePublicEnabled: false,
      // And FAST / DORA / MATRIX (NUXT_CMS_FAST_PUBLIC_ENABLED,
      // NUXT_CMS_DORA_PUBLIC_ENABLED, NUXT_CMS_MATRIX_PUBLIC_ENABLED).
      fastPublicEnabled: false,
      doraPublicEnabled: false,
      matrixPublicEnabled: false,
      // Shared Content: GET /api/public/shared/<clients|faqs|ctas> serves the
      // published copy only when true (NUXT_CMS_CLIENTS_PUBLIC_ENABLED,
      // NUXT_CMS_FAQS_PUBLIC_ENABLED, NUXT_CMS_CTAS_PUBLIC_ENABLED).
      // Server-only; default false = code content.
      clientsPublicEnabled: false,
      faqsPublicEnabled: false,
      ctasPublicEnabled: false,
      // GET /api/public/testimonials serves public-eligible shared
      // testimonials only when true (NUXT_CMS_TESTIMONIALS_PUBLIC_ENABLED).
      // Server-only; default false. No page reads it yet — Home and every
      // other page keep their current testimonial source.
      testimonialsPublicEnabled: false
    },
    public: {
      siteUrl: 'https://www.pastipeople.id'
    }
  },

  // Admin CMS surfaces are never cached, indexed or framed.
  routeRules: {
    '/admin/**': {
      prerender: false,
      headers: {
        'cache-control': 'no-store',
        'x-robots-tag': 'noindex, nofollow',
        'x-frame-options': 'DENY',
        'referrer-policy': 'same-origin'
      }
    },
    '/api/admin/**': {
      headers: {
        'cache-control': 'no-store',
        'x-robots-tag': 'noindex, nofollow'
      }
    }
  },

  // Bundle GSAP's ESM build into the server output instead of letting Node
  // load its CommonJS `main` (dist/gsap.js) — keeps `import gsap from 'gsap'`
  // resolving to the real gsap instance during SSR on Vercel.
  build: {
    transpile: ['gsap']
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      // Site-wide share defaults; each page sets its own title, description,
      // card and canonical through usePageSeo() (useSeo.ts).
      meta: [
        { property: 'og:site_name', content: 'PASTI' },
        { property: 'og:type', content: 'website' },
        { name: 'theme-color', content: '#033C59' }
      ],
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

  // Static output (`nuxt generate`) still emits the server-rendered sitemap
  // and robots files.
  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/robots.txt']
    },
    // Local-files CMS store, used only when NUXT_CMS_DATABASE_URL is unset
    // (`nuxt dev`). With a database URL the CMS mounts its Postgres store at
    // runtime instead (server/utils/cms/storage.ts).
    storage: {
      cmsfs: { driver: 'fs', base: './.data/cms' }
    }
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts'
  }
})
