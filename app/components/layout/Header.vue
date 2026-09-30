<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const { navItems, primaryCta } = useNavigation()
const { link: whatsappLink } = useWhatsapp()
const { isOpen: mobileOpen, toggle: toggleMobile, close: closeMobile } = useMobileMenu()

const route = useRoute()
watch(() => route.path, closeMobile)

const { pageReady } = usePageReady()
const { coverTrigger, revealTrigger } = useRouteCurtain()

const headerRef = ref<HTMLElement | null>(null)
const logoRef = ref<HTMLElement | null>(null)
const navRef = ref<HTMLElement | null>(null)
const ctaRef = ref<HTMLElement | null>(null)
const ctaLinkRef = ref<HTMLElement | null>(null)
const toggleRef = ref<HTMLElement | null>(null)
const progressRef = ref<HTMLElement | null>(null)
const progressDotRef = ref<HTMLElement | null>(null)

const prefersReducedMotion = import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// "Activated" once the page has scrolled past the header's own height —
// switches the header from transparent/borderless (blending into the Hero)
// to a blurred, bordered, slightly shorter bar. A discrete state flip
// (toggleClass) rather than a continuous scrub, so it reads as one
// deliberate transition instead of the header visibly resizing as you
// scroll.
const activated = ref(false)

// Nav (04-homepage-spec.md / 02-design-direction.md §12): "no background
// box in initial Hero state" applies specifically to the homepage, whose
// Hero is now a dark Slate Navy section (Milestone 4A) — every other
// page's hero is still the light `bg-paper` treatment (out of scope for
// this milestone; see pasti-working-process memory's per-task scope
// rule). `heroIsDark` is true only pre-activation on `/`, where the header
// sits directly over Hero's dark environment and must render as a
// transparent, white-on-dark bar rather than the light bordered bar used
// everywhere else.
// The homepage is dark end to end at the top of every section boundary the
// header crosses, so on `/` the bar stays in the dark, transparent-with-scrim
// treatment even after activation (never the light bordered bar) — a
// transparent header re-appearing over light sections (Trusted, Insight) is
// kept legible by the scrim below, not by a filled background.
const heroIsDark = computed(() => route.path === '/')

// Owner revision (2026-09-30): the homepage is now light-dominant, so the
// transparent homepage bar can't stay white-on-dark. Dark sections carry
// `data-header-theme="dark"`; whatever sits under the bar decides whether it
// renders white-on-dark (dark scrim) or navy-on-light (light scrim).
const onLight = ref(false)
const darkMode = computed(() => heroIsDark.value && !onLight.value)
function probeHeaderTheme() {
  if (!heroIsDark.value) return
  const y = 40
  let dark = false
  document.querySelectorAll<HTMLElement>('[data-header-theme="dark"]').forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.height > 0 && r.top <= y && r.bottom > y) dark = true
  })
  onLight.value = !dark
}
let probeQueued = false
function queueProbe() {
  if (probeQueued) return
  probeQueued = true
  requestAnimationFrame(() => {
    probeQueued = false
    probeHeaderTheme()
  })
}
onMounted(() => {
  window.addEventListener('scroll', queueProbe, { passive: true })
  window.addEventListener('resize', queueProbe, { passive: true })
  queueProbe()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', queueProbe)
  window.removeEventListener('resize', queueProbe)
})
watch(() => route.path, () => nextTick(queueProbe))

useMagnetic(ctaLinkRef, { strength: 0.3 })

useGsapContext(() => {
  const navLinks = navRef.value ? Array.from(navRef.value.children) : []
  const targets = [logoRef.value, ...navLinks, ctaRef.value, toggleRef.value].filter(Boolean)

  if (!prefersReducedMotion) {
    gsap.set(targets, { opacity: 0, y: -12 })
  }

  function playEntrance() {
    if (prefersReducedMotion) {
      gsap.set(targets, { opacity: 1, y: 0 })
      return
    }

    gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.05,
      ease: 'power3.out'
    })
  }

  watch(
    pageReady,
    (ready) => {
      if (ready) playEntrance()
    },
    { immediate: true }
  )

  // Every page-to-page navigation now plays as LayoutRouteCurtain sliding a
  // white panel over the viewport (see useRouteCurtain.ts) — the header
  // resets to its hidden pre-entrance state the instant the curtain starts
  // covering, then replays the same stagger-in it uses on first load once
  // the curtain lifts, so the navbar reads as arriving fresh with each new
  // page rather than just sitting there static underneath the curtain.
  if (!prefersReducedMotion) {
    watch(coverTrigger, () => {
      gsap.set(targets, { opacity: 0, y: -12 })
    })
  }

  watch(revealTrigger, () => {
    playEntrance()
  })

  if (prefersReducedMotion || !headerRef.value) return

  const activateTrigger = ScrollTrigger.create({
    start: 80,
    onUpdate: (self) => {
      activated.value = self.scroll() > 80
    }
  })

  // Hide-on-scroll-down / show-on-scroll-up, with a small dead-zone so
  // ordinary scroll jitter (trackpad micro-movements, bounce scrolling)
  // doesn't flicker the header. Only engages once activated (i.e. never
  // hides while still over the Hero), and always shows immediately near
  // the top of the page.
  let lastScroll = 0
  let hidden = false
  const header = headerRef.value

  const hideTrigger = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const current = self.scroll()
      const delta = current - lastScroll
      const deadZone = 10

      if (current < 120) {
        if (hidden) {
          hidden = false
          gsap.to(header, { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' })
        }
      } else if (delta > deadZone && !hidden) {
        // Never hide while the mobile menu is open.
        if (mobileOpen.value) {
          lastScroll = current
          return
        }
        hidden = true
        gsap.to(header, { yPercent: -100, autoAlpha: 0, duration: 0.45, ease: 'power3.inOut' })
      } else if (delta < -deadZone && hidden) {
        hidden = false
        gsap.to(header, { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: 'power3.out' })
      }

      lastScroll = current
    }
  })

  // Thin scroll-progress indicator under the header — grows left-to-right
  // as the reader moves through the page.
  let progressTrigger: ScrollTrigger | undefined
  if (progressRef.value) {
    gsap.set(progressRef.value, { scaleX: 0 })
    progressTrigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        gsap.set(progressRef.value, { scaleX: self.progress })
        if (progressDotRef.value) {
          progressDotRef.value.style.left = `${self.progress * 100}%`
          progressDotRef.value.style.opacity = self.progress > 0.002 ? '1' : '0'
        }
      }
    })
  }

  return () => {
    activateTrigger.kill()
    hideTrigger.kill()
    progressTrigger?.kill()
  }
})
</script>

<template>
  <header
    ref="headerRef"
    class="fixed inset-x-0 top-0 z-50 transition-[height,background-color,border-color,box-shadow] duration-500 ease-editorial"
    :class="[
      activated ? 'h-14 md:h-16' : 'h-16 md:h-20',
      heroIsDark
        ? 'border-b border-transparent bg-transparent'
        : 'border-b border-navy-900/10 bg-paper shadow-[0_8px_30px_-12px_rgba(11,22,32,0.18)]'
    ]"
  >
    <!-- Scrim (homepage): the bar itself has no fill — this dark-to-clear
         gradient sits behind it once the page has scrolled, so white nav
         text stays legible over any section without a filled background,
         a border box or blur. Fades in with `activated`. -->
    <div
      v-if="heroIsDark"
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 top-0 h-[170%] bg-gradient-to-b from-[rgba(3,60,89,0.92)] via-[rgba(3,60,89,0.55)] to-transparent transition-opacity duration-500 ease-editorial"
      :class="activated && darkMode ? 'opacity-100' : 'opacity-0'"
    />
    <div
      v-if="heroIsDark"
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 top-0 h-[170%] bg-gradient-to-b from-[rgba(255,255,255,0.94)] via-[rgba(255,255,255,0.6)] to-transparent transition-opacity duration-500 ease-editorial"
      :class="activated && !darkMode ? 'opacity-100' : 'opacity-0'"
    />
    <div class="container-page relative h-full">
      <div class="flex h-full items-center px-5 md:px-7">
        <div ref="logoRef" class="transition-transform duration-300 ease-editorial hover:scale-[1.03]">
          <LayoutLogo :inverted="darkMode" />
        </div>

        <nav ref="navRef" class="header-nav ml-auto hidden items-center gap-10 lg:flex">
          <LayoutNavLink v-for="item in navItems" :key="item.to" :item="item" :dark="darkMode" />
        </nav>

        <div ref="ctaRef" class="ml-10 hidden lg:block">
          <div ref="ctaLinkRef" class="inline-block">
            <a
              :href="whatsappLink"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-primary !rounded-[14px] !bg-slateNavy !text-pureWhite hover:!bg-cobalt"
              :class="{ 'ring-1 ring-[color:rgba(255,255,255,0.35)]': darkMode }"
            >
              {{ primaryCta.label }}
            </a>
          </div>
        </div>

        <div ref="toggleRef" class="ml-auto lg:hidden">
          <LayoutMenuToggle :open="mobileOpen" :dark="darkMode" @toggle="toggleMobile" />
        </div>
      </div>

      <!-- Scroll progress: a Cobalt line whose leading point is the logo's
           own yellow dot — the brand's one signature colour, riding the
           Signal. ~6px, so Yellow stays scarce (00-brand-guide.md §05). -->
      <div class="relative" aria-hidden="true">
        <div ref="progressRef" class="h-px w-full origin-left bg-yellow-500" :class="{ '!bg-cobalt': heroIsDark }" />
        <span ref="progressDotRef" class="absolute -top-[2.5px] left-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-yellow-500 opacity-0" />
      </div>
    </div>
  </header>
</template>
