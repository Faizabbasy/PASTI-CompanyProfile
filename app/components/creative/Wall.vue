<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// STUDIO WALL — an endless, draggable board of PASTI-made visuals.
// Drag (mouse or finger) to throw it in any direction; it glides with
// inertia, wraps infinitely, and drifts slowly when left alone. Tiles near
// the centre of the frame sit larger (lens), so the board reads as depth,
// not a flat grid. Touch: horizontal drags move the wall, vertical swipes
// still scroll the page (touch-action: pan-y). Reduced motion: static grid.
const { visuals } = useCreative()
const COLS = 4
const ROWS = 4 // 4 rows so the wrapped board always overfills the frame (no empty bands on phones)
const tiles = Array.from({ length: COLS * ROWS }, (_, i) => ({ ...visuals[i % visuals.length]!, i }))

const frameRef = ref<HTMLElement | null>(null)
const tileRefs = ref<HTMLElement[]>([])
const hovered = ref<number | null>(null)
const { setState } = useCustomCursor()

useGsapContext(() => {
  const frame = frameRef.value
  const els = tileRefs.value
  if (!frame || !els.length) return
  const heads = frame.parentElement!.querySelectorAll<HTMLElement>('[data-cw-head]')
  const mm = gsap.matchMedia()

  mm.add(reducedMotionQuery.noPreference, () => {
    gsap.set(heads, { yPercent: 110 })
    const intro = gsap.to(heads, { yPercent: 0, duration: motionTier.cinematicMin, ease: approvedEase.gsapStandard, stagger: 0.08, scrollTrigger: { trigger: frame, start: 'top 80%', once: true } })

    let cw = 0
    let ch = 0
    let fw = 0
    let fh = 0
    const measure = () => {
      fw = frame.clientWidth
      fh = frame.clientHeight
      // Phones: smaller tiles, ~2.3 across, so the board reads as a wall.
      cw = fw < 640 ? Math.max(150, fw / 2.3) : Math.max(200, Math.min(340, fw / 3.4))
      ch = cw * 1.32
      els.forEach((el) => {
        el.style.width = `${cw - 28}px`
      })
    }
    measure()

    const off = { x: 0, y: 0 }
    const vel = { x: -0.35, y: -0.15 }
    let dragging = false
    let last = { x: 0, y: 0, t: 0 }
    let idleAt = 0
    const W = () => COLS * cw
    const H = () => ROWS * ch
    const wrap = (v: number, m: number) => ((v % m) + m) % m

    const render = () => {
      const w = W()
      const h = H()
      els.forEach((el, i) => {
        const col = i % COLS
        const row = Math.floor(i / COLS)
        const x = wrap(col * cw + off.x, w) - cw + (row % 2 ? cw * 0.5 : 0)
        const y = wrap(row * ch + off.y, h) - ch * 0.5
        const cx = x + cw / 2 - fw / 2
        const cy = y + ch / 2 - fh / 2
        const d = Math.min(1, Math.hypot(cx / fw, cy / fh) * 1.4)
        gsap.set(el, { x, y, scale: 1.06 - d * 0.22, opacity: 1 - d * 0.35, zIndex: Math.round((1 - d) * 100) })
      })
    }

    const tick = () => {
      if (!dragging) {
        const idle = performance.now() - idleAt > 1600
        const tx = idle ? -0.35 : 0
        const ty = idle ? -0.15 : 0
        vel.x += (tx - vel.x) * 0.02
        vel.y += (ty - vel.y) * 0.02
        off.x += vel.x
        off.y += vel.y
        vel.x *= idle ? 1 : 0.95
        vel.y *= idle ? 1 : 0.95
      }
      render()
    }

    const onDown = (e: PointerEvent) => {
      dragging = true
      last = { x: e.clientX, y: e.clientY, t: performance.now() }
      frame.classList.add('cw-grabbing')
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      const now = performance.now()
      const dx = e.clientX - last.x
      const dy = e.pointerType === 'touch' ? 0 : e.clientY - last.y
      off.x += dx
      off.y += dy
      const dt = Math.max(1, now - last.t)
      vel.x = (dx / dt) * 16
      vel.y = (dy / dt) * 16
      last = { x: e.clientX, y: e.clientY, t: now }
    }
    const onUp = () => {
      if (!dragging) return
      dragging = false
      idleAt = performance.now()
      frame.classList.remove('cw-grabbing')
    }

    frame.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    const ro = new ResizeObserver(() => {
      measure()
      render()
    })
    ro.observe(frame)

    let visible = false
    const vis = ScrollTrigger.create({ trigger: frame, start: 'top bottom', end: 'bottom top', onToggle: (s) => (visible = s.isActive) })
    const loop = () => visible && tick()
    gsap.ticker.add(loop)
    render()

    return () => {
      intro.kill()
      vis.kill()
      gsap.ticker.remove(loop)
      ro.disconnect()
      frame.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  })

  mm.add(reducedMotionQuery.reduce, () => {
    gsap.set(heads, { yPercent: 0 })
    frame.classList.add('cw-static')
  })
})
</script>

<template>
  <section data-header-theme="dark" class="relative overflow-hidden bg-slateNavy pt-24 text-pureWhite tablet:pt-32">
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="dark" label="Studio wall" :meta="`${String(visuals.length).padStart(2, '0')} visuals`" />
      <div class="mt-12 flex flex-wrap items-end justify-between gap-6 desktop:mt-16">
        <div class="overflow-hidden pb-2">
          <h2 data-cw-head class="font-display text-[length:clamp(40px,6.4vw,104px)] font-extrabold leading-[0.95] tracking-[-0.045em] text-pureWhite">
            Made in the <span class="text-pastiYellow-500">studio.</span>
          </h2>
        </div>
        <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(255,255,255,0.6)]">← Drag to explore →</p>
      </div>
    </BaseContainer>

    <div
      ref="frameRef"
      class="cw-frame relative mt-10 h-[min(68svh,560px)] tablet:mt-12 tablet:h-[min(78svh,760px)] cursor-grab touch-pan-y overflow-hidden"
      @mouseenter="setState('view', 'Drag')"
      @mouseleave="setState('default'); hovered = null"
    >
      <figure
        v-for="(t, i) in tiles"
        :key="i"
        :ref="(el) => { if (el) tileRefs[i] = el as HTMLElement }"
        class="cw-tile absolute left-0 top-0 m-0 w-[240px] will-change-transform"
        @mouseenter="hovered = i"
      >
        <div class="overflow-hidden rounded-[20px] ring-1 ring-[color:rgba(255,255,255,0.12)] shadow-[0_40px_80px_-40px_rgba(0,8,16,0.9)]">
          <img :src="t.src" :alt="t.label" draggable="false" loading="lazy" class="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-editorial" :class="[hovered === i ? 'scale-105' : '', t.src.includes('/insights/') ? 'object-left' : 'object-top']">
        </div>
        <figcaption class="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors duration-300" :class="hovered === i ? 'text-pastiYellow-500' : 'text-[color:rgba(255,255,255,0.5)]'">
          <span class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />{{ t.label }}
        </figcaption>
      </figure>
      <!-- Edge fades -->
      <div aria-hidden="true" class="pointer-events-none absolute inset-0 z-[200] bg-[linear-gradient(180deg,#033C59_0%,transparent_12%,transparent_88%,#033C59_100%),linear-gradient(90deg,#033C59_0%,transparent_8%,transparent_92%,#033C59_100%)]" />
    </div>
  </section>
</template>

<style scoped>
.cw-grabbing {
  cursor: grabbing;
}
.cw-frame :deep(img) {
  -webkit-user-drag: none;
  user-select: none;
}
/* Reduced motion: a plain responsive grid instead of the endless board. */
.cw-static {
  display: grid;
  height: auto;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
  padding: 0 clamp(20px, 4vw, 80px) 80px;
  cursor: default;
}
.cw-static .cw-tile {
  position: static;
  width: auto !important;
}
</style>
