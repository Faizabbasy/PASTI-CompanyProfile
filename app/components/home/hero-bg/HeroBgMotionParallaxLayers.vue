<script setup lang="ts">
import gsap from 'gsap'

// Motion — Three flat depth layers, each holding one or two large
// soft-blurred shapes, drifting at different slow speeds and tracking the
// cursor with a different parallax multiplier (far layer barely moves,
// near layer moves the most) — a cheap, pure-CSS-transform illusion of
// depth. One shared gsap.ticker pointer-follow loop drives all three
// layers rather than per-layer listeners, matching the eased, lagging
// feel used elsewhere in this set (see MagneticGrid's spring loop).
const rootRef = ref<HTMLElement | null>(null)

interface LayerState {
  el: HTMLElement
  depth: number
  x: number
  y: number
}

useGsapContext(() => {
  if (!rootRef.value) return
  const el = rootRef.value
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const layerEls = Array.from(el.querySelectorAll<HTMLElement>('[data-layer]'))
  const layers: LayerState[] = layerEls.map((layerEl) => ({
    el: layerEl,
    depth: Number(layerEl.dataset.layer) || 0,
    x: 0,
    y: 0
  }))

  if (prefersReducedMotion) return

  // Slow independent ambient drift per layer, in addition to parallax.
  layers.forEach((layer, i) => {
    gsap.to(layer.el, {
      xPercent: -3 * layer.depth,
      yPercent: 2.5 * layer.depth,
      duration: 22 + i * 6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    })
  })

  const pointer = { x: 0.5, y: 0.5 }
  function onPointerMove(e: PointerEvent) {
    const rect = el.getBoundingClientRect()
    pointer.x = (e.clientX - rect.left) / rect.width - 0.5
    pointer.y = (e.clientY - rect.top) / rect.height - 0.5
  }
  function onPointerLeave() {
    pointer.x = 0
    pointer.y = 0
  }
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerleave', onPointerLeave)

  const ticker = gsap.ticker.add(() => {
    layers.forEach((layer) => {
      const targetX = pointer.x * layer.depth * 40
      const targetY = pointer.y * layer.depth * 40
      layer.x += (targetX - layer.x) * 0.06
      layer.y += (targetY - layer.y) * 0.06
      layer.el.style.setProperty('--parallax-x', `${layer.x}px`)
      layer.el.style.setProperty('--parallax-y', `${layer.y}px`)
    })
  })

  return () => {
    el.removeEventListener('pointermove', onPointerMove)
    el.removeEventListener('pointerleave', onPointerLeave)
    gsap.ticker.remove(ticker)
  }
})
</script>

<template>
  <div ref="rootRef" aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
    <div data-layer="0.3" class="layer">
      <div class="shape shape-far" />
    </div>
    <div data-layer="0.6" class="layer">
      <div class="shape shape-mid" />
    </div>
    <div data-layer="1" class="layer">
      <div class="shape shape-near" />
    </div>
  </div>
</template>

<style scoped>
.layer {
  --parallax-x: 0px;
  --parallax-y: 0px;
  position: absolute;
  inset: 0;
  transform: translate(var(--parallax-x), var(--parallax-y));
  will-change: transform;
}

.shape {
  position: absolute;
  border-radius: 9999px;
  filter: blur(70px);
}

.shape-far {
  left: 5%;
  top: 10%;
  width: 30vw;
  height: 30vw;
  max-width: 420px;
  max-height: 420px;
  opacity: 0.25;
  background: radial-gradient(circle at 40% 40%, theme(colors.navy.300 / 70%), transparent 70%);
}

.shape-mid {
  right: 10%;
  top: 35%;
  width: 24vw;
  height: 24vw;
  max-width: 340px;
  max-height: 340px;
  opacity: 0.3;
  background: radial-gradient(circle at 40% 40%, theme(colors.yellow.200 / 65%), transparent 70%);
}

.shape-near {
  left: 32%;
  bottom: 0%;
  width: 18vw;
  height: 18vw;
  max-width: 260px;
  max-height: 260px;
  opacity: 0.35;
  background: radial-gradient(circle at 40% 40%, theme(colors.navy.500 / 55%), transparent 70%);
}
</style>
