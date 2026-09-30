<script setup lang="ts">
import gsap from 'gsap'

// Floating "Contact Us" WhatsApp button (owner request, 2026-09-30). Fixed
// bottom-right on every page, so it follows the scroll. Tapping it opens a
// small chat card (PASTI team, online dot) whose button opens WhatsApp with
// the same number + prefilled message every other CTA uses (useWhatsapp).
// Hidden while the mobile menu is open; enters once the page is ready.
const { link: whatsappLink } = useWhatsapp()
const { isOpen: menuOpen } = useMobileMenu()
const { pageReady } = usePageReady()
const { setState } = useCustomCursor()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const buttonRef = ref<HTMLElement | null>(null)
useMagnetic(buttonRef, { strength: 0.25 })

const close = () => {
  open.value = false
}
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
}
const onOutside = (e: PointerEvent) => {
  if (open.value && rootRef.value && !rootRef.value.contains(e.target as Node)) close()
}

watch(menuOpen, (v) => {
  if (v) close()
})

onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('pointerdown', onOutside)
  const root = rootRef.value
  if (!root) return
  const reduce = window.matchMedia(reducedMotionQuery.reduce).matches
  const show = () => {
    if (reduce) gsap.set(root, { autoAlpha: 1, y: 0 })
    else gsap.fromTo(root, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapPrimary, delay: 1.2 })
  }
  if (pageReady.value) show()
  else watch(pageReady, (v) => v && show(), { once: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('pointerdown', onOutside)
})
</script>

<template>
  <div
    ref="rootRef"
    class="wa-fab fixed bottom-[max(16px,env(safe-area-inset-bottom))] right-4 z-[45] flex flex-col items-end gap-3 opacity-0 transition-[transform,opacity] duration-300 ease-editorial tablet:bottom-6 tablet:right-6"
    :class="menuOpen ? 'pointer-events-none !opacity-0 translate-y-4' : ''"
  >
    <!-- Chat card -->
    <Transition name="wa-card">
      <div
        v-if="open"
        id="wa-card"
        role="dialog"
        aria-label="Contact PASTI on WhatsApp"
        class="w-[min(320px,calc(100vw-32px))] origin-bottom-right overflow-hidden rounded-[22px] border border-[color:rgba(3,60,89,0.12)] bg-pureWhite shadow-[0_40px_80px_-30px_rgba(3,30,46,0.55)]"
      >
        <div class="relative bg-slateNavy px-5 pb-5 pt-4 text-pureWhite">
          <div class="flex items-center justify-between">
            <LayoutBrandMark surface="dark" :height="13" />
            <button type="button" aria-label="Close" class="-mr-2 grid h-11 w-11 place-items-center rounded-full text-[color:rgba(255,255,255,0.7)] hover:text-pureWhite" @click="close">
              <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" /></svg>
            </button>
          </div>
          <p class="mt-2 font-display text-[22px] font-extrabold leading-tight tracking-[-0.02em]">Contact Us<span class="text-pastiYellow-500">.</span></p>
          <p class="mt-1 inline-flex items-center gap-2 text-[13px] text-[color:rgba(255,255,255,0.7)]">
            <span class="relative flex h-2 w-2"><span class="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-60 motion-reduce:animate-none" /><span class="relative h-2 w-2 rounded-full bg-[#25D366]" /></span>
            PASTI team · WhatsApp
          </p>
        </div>
        <div class="p-5">
          <div class="rounded-[14px] rounded-tl-[4px] bg-surfaceNeutral px-4 py-3 text-[14px] leading-relaxed text-slateNavy">
            Halo! Ada yang bisa kami bantu? Ceritakan kebutuhan Anda — tim PASTI akan membalas lewat WhatsApp.
          </div>
          <a
            :href="whatsappLink"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-4 flex min-h-12 items-center justify-center gap-2.5 rounded-[14px] bg-[#25D366] font-display text-[15px] font-bold text-[#053d1f] transition-[transform,filter] duration-200 hover:brightness-105 active:scale-[0.97]"
            @click="close"
          >
            <span class="h-5 w-5"><LayoutSocialIcon name="whatsapp" /></span>
            Start chat
          </a>
        </div>
      </div>
    </Transition>

    <!-- Floating button -->
    <div ref="buttonRef" class="inline-block">
      <button
        type="button"
        class="group relative flex items-center gap-3 rounded-full bg-slateNavy py-2 pl-2 pr-5 font-display text-[14px] font-bold text-pureWhite shadow-[0_18px_40px_-14px_rgba(3,30,46,0.7)] ring-1 ring-[color:rgba(255,255,255,0.12)] transition-transform duration-200 active:scale-95"
        :aria-expanded="open"
        aria-controls="wa-card"
        @click="open = !open"
        @mouseenter="setState('link')"
        @mouseleave="setState('default')"
      >
        <span class="relative grid h-11 w-11 place-items-center rounded-full bg-[#25D366] text-pureWhite transition-transform duration-500 ease-editorial group-hover:rotate-[-12deg]">
          <span aria-hidden="true" class="wa-ring absolute inset-0 rounded-full border-2 border-[#25D366]" />
          <span class="relative h-6 w-6">
            <LayoutSocialIcon v-if="!open" name="whatsapp" />
            <svg v-else viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" class="h-6 w-6 p-1"><path d="M3 3l10 10M13 3L3 13" /></svg>
          </span>
        </span>
        Contact Us
        <span aria-hidden="true" class="absolute right-3 top-2 h-2 w-2 rounded-full bg-pastiYellow-500" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.wa-card-enter-active,
.wa-card-leave-active {
  transition:
    opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.wa-card-enter-from,
.wa-card-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.92);
}
/* A few attention pulses after load, then it rests. */
.wa-ring {
  opacity: 0;
}
@media (prefers-reduced-motion: no-preference) {
  .wa-ring {
    animation: wa-pulse 2.4s cubic-bezier(0.16, 1, 0.3, 1) 2.5s 3;
  }
}
@keyframes wa-pulse {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1.7);
    opacity: 0;
  }
}
</style>
