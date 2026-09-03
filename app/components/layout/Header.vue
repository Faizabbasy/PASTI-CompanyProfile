<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const { navItems, primaryCta } = useNavigation()
const { link: whatsappLink } = useWhatsapp()
const { isOpen: mobileOpen, toggle: toggleMobile, close: closeMobile } = useMobileMenu()

const route = useRoute()
watch(() => route.path, closeMobile)

const { introReady } = useIntroReady()

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

useMagnetic(ctaLinkRef, { strength: 0.3 })

useGsapContext(() => {
  const navLinks = navRef.value ? Array.from(navRef.value.children) : []
  const targets = [logoRef.value, ...navLinks, ctaRef.value, toggleRef.value].filter(Boolean)

  if (!prefersReducedMotion) {
    gsap.set(targets, { opacity: 0, y: -12 })
  }

  watch(
    introReady,
    (ready) => {
      if (!ready) return

      if (prefersReducedMotion) {
        gsap.set(targets, { opacity: 1, y: 0 })
        return
      }

      const anim = gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power3.out'
      })

      return () => anim.kill()
    },
    { immediate: true }
  )

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
  <header ref="headerRef" class="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6 md:pt-5">
    <div
      class="container-page rounded-2xl border border-navy-900/10 bg-paper shadow-[0_8px_30px_-12px_rgba(11,22,32,0.18)] transition-[height] duration-500 ease-editorial"
      :class="activated ? 'h-14 md:h-16' : 'h-16 md:h-20'"
    >
      <div class="flex h-full items-center px-5 md:px-7">
        <div ref="logoRef" class="transition-transform duration-300 ease-editorial hover:scale-[1.03]">
          <LayoutLogo />
        </div>

        <nav ref="navRef" class="header-nav ml-auto hidden items-center gap-10 lg:flex">
          <LayoutNavLink v-for="item in navItems" :key="item.to" :item="item" />
        </nav>

        <div ref="ctaRef" class="ml-10 hidden lg:block">
          <div ref="ctaLinkRef" class="inline-block">
            <a :href="whatsappLink" target="_blank" rel="noopener noreferrer" class="btn-primary">
              {{ primaryCta.label }}
            </a>
          </div>
        </div>

        <div ref="toggleRef" class="ml-auto lg:hidden">
          <LayoutMenuToggle :open="mobileOpen" @toggle="toggleMobile" />
        </div>
      </div>

      <div ref="progressRef" class="h-px w-full origin-left rounded-b-2xl bg-yellow-500" aria-hidden="true" />
    </div>
  </header>
</template>
