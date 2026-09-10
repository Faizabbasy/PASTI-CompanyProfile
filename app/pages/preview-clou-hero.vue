<script setup lang="ts">
/**
 * EXPLORATION CONCEPT — not wired into the real site.
 *
 * Virtual Camera Panning Engine, per explicit architectural correction: the
 * 8 cards are stickers fixed to one `.world-canvas` sheet and NEVER get
 * their own transform. The cursor is treated as a virtual camera — moving
 * it pans/tilts the whole world-canvas (translate + 3D rotate) inside a
 * perspective viewport, so the grid's relative layout is physically
 * incapable of drifting or overlapping; only the "camera" looking at it
 * moves. Each card keeps an independent hover response (scale only, no
 * position/rotation) so hovering can't pull it off its sticker position.
 *
 * LayoutHeader/LayoutFooter are hardcoded in app.vue OUTSIDE <NuxtPage>
 * (not part of Nuxt's layout system), so `definePageMeta({ layout: false })`
 * can't hide them. This page renders as a fixed, full-viewport overlay
 * (position: fixed; inset: 0; z-index above the header) so it reads as
 * hero-only on screen, without touching app.vue or Hero.vue.
 */
import { onMounted, onBeforeUnmount, ref, useTemplateRef } from 'vue'
import { gsap } from 'gsap'

const dynamicWords = ['experiences', 'digital products', 'solutions', 'brands']
const wordIndex = ref(0)
let wordTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  wordTimer = setInterval(() => {
    wordIndex.value = (wordIndex.value + 1) % dynamicWords.length
  }, 2500)
})
onBeforeUnmount(() => {
  if (wordTimer) clearInterval(wordTimer)
})

const worldCanvasRef = useTemplateRef<HTMLElement>('worldCanvas')

let mouseMoveHandler: ((e: MouseEvent) => void) | undefined
const hoverCleanups: Array<() => void> = []

onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const cards = document.querySelectorAll<HTMLElement>('.card-mask')

  // Hover: scale only, on the individual card. This never writes x/y or
  // rotation, so a card can't be pulled off its fixed sticker position on
  // `.world-canvas` — only the camera pan/tilt below ever moves position,
  // and it moves the whole canvas, never an individual card.
  cards.forEach((card) => {
    const handleEnter = () => {
      gsap.to(card, { scale: 1.06, duration: 0.3, ease: 'power2.out' })
    }
    const handleLeave = () => {
      gsap.to(card, { scale: 1, duration: 0.3, ease: 'power2.out' })
    }
    card.addEventListener('mouseenter', handleEnter)
    card.addEventListener('mouseleave', handleLeave)
    hoverCleanups.push(() => {
      card.removeEventListener('mouseenter', handleEnter)
      card.removeEventListener('mouseleave', handleLeave)
    })
  })

  if (reduceMotion || !worldCanvasRef.value) return

  // Root cause of an earlier "completely dead" canvas bug: GSAP's
  // CSSPlugin tween property for 3D rotation is `rotationX`/`rotationY`,
  // NOT `rotateX`/`rotateY` (that's the raw CSS function name, not the
  // property GSAP registers a tween for). Calling
  // gsap.quickTo(el, 'rotateX', ...) doesn't throw — it silently creates a
  // tween GSAP can't resolve against the element's transform, so nothing
  // gets written to the DOM. `rotationX`/`rotationY` below are correct.
  //
  // Perspective itself lives on `.hero-viewport` (the parent — see
  // <style>), not here: CSS `perspective` only has an effect on the
  // transforms of that element's direct 3D children, so it has to sit one
  // level up from `.world-canvas`, which is the thing actually being
  // rotated in 3D.
  gsap.set(worldCanvasRef.value, { transformStyle: 'preserve-3d' })

  // Infinite Drag / Canvas Velocity Engine: the ONLY element GSAP ever
  // tweens here is `.world-canvas` itself — no per-card quickTo exists
  // anywhere. Multipliers are kept strictly POSITIVE (mouseX * 550, never
  // -mouseX) so moving the cursor right always drags the canvas right,
  // never the reverse. A slower duration (1.6s) with a gentler, more
  // deceleration-heavy ease (power4.out — steeper falloff than power3)
  // is what actually produces the "glides and settles with inertia" feel
  // the smoothness fix calls for: quickTo already eases every retarget,
  // but a longer duration + steeper ease curve makes that easing visibly
  // readable instead of snapping to the new target too quickly to notice.
  const xTo = gsap.quickTo(worldCanvasRef.value, 'x', { duration: 1.4, ease: 'power3.out' })
  const yTo = gsap.quickTo(worldCanvasRef.value, 'y', { duration: 1.4, ease: 'power3.out' })
  const rotXTo = gsap.quickTo(worldCanvasRef.value, 'rotationX', { duration: 1.4, ease: 'power3.out' })
  const rotYTo = gsap.quickTo(worldCanvasRef.value, 'rotationY', { duration: 1.4, ease: 'power3.out' })

  mouseMoveHandler = (e: MouseEvent) => {
    // Cursor offset from center, -0.5..0.5 across the viewport.
    const mouseX = e.clientX / window.innerWidth - 0.5
    const mouseY = e.clientY / window.innerHeight - 0.5

    // Drag distance: 1.2x viewport size, positive multiplier so the
    // canvas glides IN THE SAME DIRECTION as the cursor. At full cursor
    // deflection (±0.5) this drags the canvas up to ±60vw/±60vh —
    // `.world-canvas` below is sized 200vw/200vh (50% margin per side)
    // specifically to stay ahead of that so its own edge never shows.
    xTo(mouseX * (window.innerWidth * 1.2))
    yTo(mouseY * (window.innerHeight * 1.2))

    rotXTo(-mouseY * 6)
    rotYTo(mouseX * 6)
  }

  window.addEventListener('mousemove', mouseMoveHandler)
})

onBeforeUnmount(() => {
  hoverCleanups.forEach((cleanup) => cleanup())
  if (mouseMoveHandler) window.removeEventListener('mousemove', mouseMoveHandler)
})
</script>

<template>
  <!-- Fixed full-viewport overlay: sits above LayoutHeader/LayoutFooter so
       the concept reads as hero-only, without deleting or hiding them. -->
  <div class="fixed inset-0 z-[100] overflow-hidden bg-paper font-body text-ink">
    <div class="hero-viewport relative h-screen w-screen overflow-hidden">
      <!-- The camera's backdrop: all 8 cards are fixed sticker positions on
           THIS single element, laid out with plain percentage top/left/
           right/bottom. Oversized to 200vw x 200vh and centered (-50vh/
           -50vw offset) — the mousemove handler's 1.2x-viewport pan range
           reaches ±60vw/±60vh at full cursor deflection, so this margin
           keeps the canvas's own edge from ever showing. Card percentages
           below were recalculated against this canvas size so each card
           lands at the exact organically-spread position specified (as
           authored against a notional 140vw/140vh canvas) — only the
           canvas is larger for panning headroom, the visible layout is
           unchanged. The mousemove handler only ever transforms
           `.world-canvas` itself (pan + 3D tilt) — never an individual
           card — so this grid is physically locked exactly as authored
           and cannot drift or overlap. All 8 cards sit at z-index 10,
           BEHIND the center text (z-index 30, see below), so they slide
           visually behind the text as the canvas pans. -->
      <div ref="worldCanvas" class="world-canvas absolute" style="width:200vw; height:200vh; top:-50vh; left:-50vw;">
        <a
          href="#"
          class="card-mask group absolute block overflow-hidden rounded-3xl border border-navy-100 bg-paper"
          style="top:23.4%; left:27.6%; width:340px; height:340px; z-index:10; transform: rotate(-5deg);"
        >
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400"
            alt="Abstract gradient project preview"
            class="aspect-square h-full w-full object-cover"
          >
          <span class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/80 to-transparent px-3 py-2 font-display text-[11px] font-semibold text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Fintech Platform
          </span>
        </a>

        <a
          href="#"
          class="card-mask group absolute block overflow-hidden rounded-3xl border border-navy-100 bg-paper"
          style="top:55.6%; left:25.5%; width:320px; height:320px; z-index:10; transform: rotate(4deg);"
        >
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=400"
            alt="Tech and electronics project preview"
            class="aspect-square h-full w-full object-cover"
          >
          <span class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/80 to-transparent px-3 py-2 font-display text-[11px] font-semibold text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Brand Identity
          </span>
        </a>

        <a
          href="#"
          class="card-mask group absolute block overflow-hidden rounded-3xl border border-navy-100 bg-paper"
          style="top:22%; right:27.6%; width:350px; height:350px; z-index:10; transform: rotate(6deg);"
        >
          <img
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400"
            alt="Agency desk project preview"
            class="aspect-square h-full w-full object-cover"
          >
          <span class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/80 to-transparent px-3 py-2 font-display text-[11px] font-semibold text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            CRM System
          </span>
        </a>

        <a
          href="#"
          class="card-mask group absolute block overflow-hidden rounded-3xl border border-navy-100 bg-paper"
          style="top:57%; right:26.2%; width:330px; height:330px; z-index:10; transform: rotate(-4deg);"
        >
          <img
            src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400"
            alt="Sketch and wireframe project preview"
            class="aspect-square h-full w-full object-cover"
          >
          <span class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/80 to-transparent px-3 py-2 font-display text-[11px] font-semibold text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            E-commerce App
          </span>
        </a>

        <a
          href="#"
          class="card-mask group absolute block overflow-hidden rounded-3xl border border-navy-100 bg-paper"
          style="top:40.2%; left:17.8%; width:270px; height:270px; z-index:10; opacity:0.9; transform: rotate(-8deg);"
        >
          <img
            src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400"
            alt="Product design project preview"
            class="aspect-square h-full w-full object-cover"
          >
          <span class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/80 to-transparent px-3 py-2 font-display text-[11px] font-semibold text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Product Design
          </span>
        </a>

        <a
          href="#"
          class="card-mask group absolute block overflow-hidden rounded-3xl border border-navy-100 bg-paper"
          style="top:41.6%; right:17.8%; width:280px; height:280px; z-index:10; opacity:0.9; transform: rotate(7deg);"
        >
          <img
            src="https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=400"
            alt="Mobile app project preview"
            class="aspect-square h-full w-full object-cover"
          >
          <span class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/80 to-transparent px-3 py-2 font-display text-[11px] font-semibold text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Mobile App
          </span>
        </a>

        <a
          href="#"
          class="card-mask group absolute block overflow-hidden rounded-3xl border border-navy-100 bg-paper"
          style="top:13.6%; left:43.7%; width:290px; height:290px; z-index:10; transform: rotate(-3deg);"
        >
          <img
            src="https://images.unsplash.com/photo-1558655146-d09347e92766?w=400"
            alt="Data dashboard project preview"
            class="aspect-square h-full w-full object-cover"
          >
          <span class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/80 to-transparent px-3 py-2 font-display text-[11px] font-semibold text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Data Dashboard
          </span>
        </a>

        <a
          href="#"
          class="card-mask group absolute block overflow-hidden rounded-3xl border border-navy-100 bg-paper"
          style="bottom:13.6%; left:44.4%; width:290px; height:290px; z-index:10; transform: rotate(5deg);"
        >
          <img
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400"
            alt="Web platform project preview"
            class="aspect-square h-full w-full object-cover"
          >
          <span class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/80 to-transparent px-3 py-2 font-display text-[11px] font-semibold text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Web Platform
          </span>
        </a>
      </div>

      <!-- Center text container — z-index 30, pointer-events:none per the
           reference video's layering (cards sit at z-index 10, so they can
           visually slide behind the text as the canvas pans, rather than
           being kept clipped away from it). Fixed max-width, OUTSIDE
           `.world-canvas` entirely, so camera panning/tilting never moves
           the text itself — only the cards behind it move. The CTA buttons
           re-enable pointer-events on their own wrapper below so they stay
           clickable despite the outer pointer-events:none. -->
      <div class="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-6">
        <div class="pointer-events-auto mx-auto max-w-[650px] text-center">
          <p class="mb-5 font-display text-xs font-bold uppercase tracking-[0.18em] text-navy-500">PASTI</p>
          <h1 class="font-extrabold leading-[1.05] tracking-tight text-display-lg md:text-display-xl">
            We build
            <span class="relative inline-block h-[1.1em] w-full overflow-hidden align-top">
              <Transition name="word-swap">
                <span :key="dynamicWords[wordIndex]" class="absolute inset-x-0 block text-yellow-500">
                  {{ dynamicWords[wordIndex] }}
                </span>
              </Transition>
            </span>
          </h1>

          <p class="mx-auto mt-6 max-w-lg text-body-lg text-muted">
            PASTI — technology and creative partner for businesses ready to move forward.
          </p>

          <div class="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="#" class="btn-primary">Explore our work</a>
            <a href="#" class="btn-outline">Tell us about it</a>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 z-50 -translate-x-1/2 text-center">
        <div class="mx-auto h-10 w-px animate-scroll-pulse bg-navy-300" />
        <span class="mt-2 block font-display text-[10px] font-semibold uppercase tracking-widest text-muted">Scroll</span>
      </div>

      <!-- Dev-only escape hatch back to the real site -->
      <NuxtLink to="/" class="absolute right-4 top-4 z-50 rounded-full border border-navy-200 bg-paper/90 px-4 py-2 font-display text-xs font-semibold text-ink backdrop-blur hover:border-yellow-500">
        ← Back to site
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.hero-viewport {
  perspective: 1200px;
  transform-style: preserve-3d;
  overflow: hidden;
}

.world-canvas {
  transform-style: preserve-3d;
  transform-origin: 50% 50%;
  will-change: transform;
}

.card-mask {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  border-radius: 24px;
  transition: box-shadow 0.3s ease-out;
}
/* Scale on hover is owned entirely by the mouseenter/mouseleave GSAP
   tweens in <script setup> (position/z-index are untouched by hover, per
   the corrected architecture) — only the shadow bump stays in CSS. */
.card-mask:hover {
  box-shadow: 0 30px 60px -20px rgba(11, 57, 84, 0.35);
}

.word-swap-enter-active,
.word-swap-leave-active {
  transition: transform 0.5s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.5s cubic-bezier(0.65, 0, 0.35, 1);
}
.word-swap-enter-from {
  transform: translateY(100%);
  opacity: 0;
}
.word-swap-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

@keyframes scroll-pulse {
  0% { transform: scaleY(0); transform-origin: top; opacity: 0; }
  40% { transform: scaleY(1); transform-origin: top; opacity: 1; }
  60% { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
  100% { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
}
.animate-scroll-pulse {
  animation: scroll-pulse 2s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .animate-scroll-pulse { animation: none; }
}
</style>
