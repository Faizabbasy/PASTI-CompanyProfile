<script setup lang="ts">
import gsap from 'gsap'

// Agency — Infinite marquee ticker, rotated diagonally and set behind the
// content at low opacity, speed reactive to scroll velocity (faster scroll
// = faster marquee, classic Awwwards agency-site signature). Built with
// two duplicated content blocks translated in a seamless loop — no
// external marquee library needed.
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const rootRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)

const words = ['TECHNOLOGY', '•', 'CREATIVITY', '•', 'IMPACT', '•', 'PASTI', '•']

useGsapContext(() => {
  if (!trackRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const track = trackRef.value
  const baseSpeed = 40 // px/sec
  const state = { speed: baseSpeed, x: 0 }

  if (prefersReducedMotion) {
    gsap.set(track, { x: 0 })
    return
  }

  let halfWidth = track.scrollWidth / 2
  const resizeObserver = new ResizeObserver(() => {
    halfWidth = track.scrollWidth / 2
  })
  resizeObserver.observe(track)

  const scrollTrigger = ScrollTrigger.create({
    onUpdate: (self) => {
      const velocity = Math.abs(self.getVelocity())
      state.speed = baseSpeed + Math.min(velocity * 0.06, 260)
    }
  })

  const ticker = gsap.ticker.add((_time, deltaMs) => {
    state.x -= (state.speed * deltaMs) / 1000
    if (Math.abs(state.x) >= halfWidth) state.x += halfWidth
    track.style.transform = `translateX(${state.x}px)`
    state.speed += (baseSpeed - state.speed) * 0.02
  })

  return () => {
    resizeObserver.disconnect()
    scrollTrigger.kill()
    gsap.ticker.remove(ticker)
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 flex items-center overflow-hidden opacity-[0.06]">
    <div class="w-[160%] -rotate-6">
      <div ref="trackRef" class="flex whitespace-nowrap will-change-transform">
        <span v-for="rep in 2" :key="rep" class="flex shrink-0">
          <span
            v-for="(w, i) in words"
            :key="`${rep}-${i}`"
            class="mx-6 font-display text-[10vw] font-extrabold leading-none text-navy-900"
          >
            {{ w }}
          </span>
        </span>
      </div>
    </div>
  </div>
</template>
