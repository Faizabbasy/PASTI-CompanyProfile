<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const { navItems, primaryCta } = useNavigation()
const { link: whatsappLink } = useWhatsapp()
const { isOpen: mobileOpen, toggle: toggleMobile, close: closeMobile } = useMobileMenu()

const route = useRoute()
watch(() => route.path, closeMobile)

const { introReady } = useIntroReady()
const { coverTrigger, revealTrigger } = useRouteCurtain()

const headerRef = ref<HTMLElement | null>(null)
const logoRef = ref<HTMLElement | null>(null)
const navRef = ref<HTMLElement | null>(null)
const ctaRef = ref<HTMLElement | null>(null)
const ctaLinkRef = ref<HTMLElement | null>(null)
const toggleRef = ref<HTMLElement | null>(null)
const progressRef = ref<HTMLElement | null>(null)

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
const heroIsDark = computed(() => route.path === '/' && !activated.value)

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
    introReady,
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
          gsap.to(header, { yPercent: 0, duration: 0.5, ease: 'power3.out' })
        }
      } else if (delta > deadZone && !hidden) {
        hidden = true
        gsap.to(header, { yPercent: -100, duration: 0.45, ease: 'power3.inOut' })
      } else if (delta < -deadZone && hidden) {
        hidden = false
        gsap.to(header, { yPercent: 0, duration: 0.45, ease: 'power3.out' })
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
    <div class="container-page h-full">
      <div class="flex h-full items-center px-5 md:px-7">
        <div ref="logoRef" class="transition-transform duration-300 ease-editorial hover:scale-[1.03]">
          <LayoutLogo :inverted="heroIsDark" />
        </div>

        <nav ref="navRef" class="header-nav ml-auto hidden items-center gap-10 lg:flex">
          <LayoutNavLink v-for="item in navItems" :key="item.to" :item="item" :dark="heroIsDark" />
        </nav>

        <div ref="ctaRef" class="ml-10 hidden lg:block">
          <div ref="ctaLinkRef" class="inline-block">
            <a
              :href="whatsappLink"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-primary"
              :class="{ '!bg-cobalt !text-pureWhite hover:!bg-cyan hover:!text-slateNavy': heroIsDark }"
            >
              {{ primaryCta.label }}
            </a>
          </div>
        </div>

        <div ref="toggleRef" class="ml-auto lg:hidden">
          <LayoutMenuToggle :open="mobileOpen" :dark="heroIsDark" @toggle="toggleMobile" />
        </div>
      </div>

      <div ref="progressRef" class="h-px w-full origin-left bg-yellow-500" :class="{ '!bg-cobalt': heroIsDark }" aria-hidden="true" />
    </div>
  </header>
</template>
