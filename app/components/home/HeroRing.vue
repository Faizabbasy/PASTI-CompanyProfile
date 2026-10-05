<script setup lang="ts">
import gsap from 'gsap'

// Hero centerpiece — a single glass ring in the PASTI blue family. This is
// content-justified WebGL under 00-brand-guide.md §12 (a real 3D material
// the page's hero brief asks for), not decorative particles/orbs: one
// object, restrained motion (slow rotation + a few degrees of pointer
// response), no glow spam. Everything is client-only and lazily imported
// so three.js never touches SSR or the critical path.
//
// Lifecycle discipline (03-design-system.md §13): renders on the shared GSAP
// ticker (no private RAF loop), pauses when off-screen or when the tab is
// hidden, and disposes geometry/material/environment/renderer on unmount.

const hostRef = ref<HTMLElement | null>(null)
const failed = ref(false)
// Lite tier (mid/low-end devices, see useDeviceTier.ts): show the knot's
// pre-rendered image (public/images/hero-knot.webp, captured from this very
// scene) instead of loading three.js (~865 KB) and compiling a transmission
// shader. A slow CSS float keeps it alive at near-zero cost.
const lite = ref(false)

let cleanup: (() => void) | undefined
let disposed = false

onMounted(async () => {
  const host = hostRef.value
  if (!host) return

  if (isLiteDevice()) {
    // Touch devices already show the server-rendered image (Hero.vue).
    lite.value = !window.matchMedia('(pointer: coarse)').matches
    return
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isSmall = window.matchMedia('(max-width: 1023px)').matches
  const finePointer = window.matchMedia('(pointer: fine)').matches

  try {
    const THREE = await import('three')
    const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js')
    if (disposed || !hostRef.value) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall ? 1 : 1.75))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envTexture
    scene.environmentIntensity = 0.5

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50)
    camera.position.set(0, 0, 9.4)

    // Owner revision (2026-09-30): the knot is PASTI Yellow glass. Warm amber
    // key + a cool white rim keep the gradation readable on the light hero.
    scene.add(new THREE.AmbientLight(0xffd98a, 0.35))
    const key = new THREE.PointLight(0xffc233, 22, 24, 1.6)
    key.position.set(-3.2, 2.4, 3.5)
    scene.add(key)
    const rim = new THREE.PointLight(0xfff4d6, 16, 24, 1.6)
    rim.position.set(3.4, -1.8, 2.4)
    scene.add(rim)
    const top = new THREE.PointLight(0xffffff, 6, 24, 1.6)
    top.position.set(0.5, 3.6, 2.5)
    scene.add(top)

    const geometry = new THREE.TorusKnotGeometry(1.15, 0.27, 360, 64, 2, 3)
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xf5a800,
      metalness: 0,
      roughness: 0.1,
      transmission: 0.35,
      thickness: 1.2,
      ior: 1.45,
      attenuationColor: new THREE.Color(0xfbba00),
      attenuationDistance: 2.6,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      iridescence: 0.15,
      iridescenceIOR: 1.3,
      envMapIntensity: 0.8,
      specularIntensity: 1
    })
    const ring = new THREE.Mesh(geometry, material)
    const pivot = new THREE.Group()
    pivot.add(ring)
    pivot.rotation.set(0.5, 0.2, -0.25)
    scene.add(pivot)

    const resize = () => {
      const w = host.clientWidth || 1
      const h = host.clientHeight || 1
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const resizeObserver = new ResizeObserver(() => {
      resize()
      if (!running) renderer.render(scene, camera)
    })
    resizeObserver.observe(host)

    // Pointer response: a few degrees of tilt, eased — Response, not follow.
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    const onMove = (event: PointerEvent) => {
      target.x = (event.clientX / window.innerWidth) * 2 - 1
      target.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    if (finePointer && !reduced) window.addEventListener('pointermove', onMove, { passive: true })

    let time = 0
    let running = false
    let inView = true

    const tick = (_: number, deltaMs: number) => {
      if (host.parentElement?.dataset.paused === 'true') return
      const dt = Math.min(deltaMs, 50) / 1000
      time += dt
      current.x += (target.x - current.x) * Math.min(1, dt * 3)
      current.y += (target.y - current.y) * Math.min(1, dt * 3)
      ring.rotation.y = time * 0.22 + current.x * 0.35
      ring.rotation.x = Math.sin(time * 0.35) * 0.12 + current.y * 0.22
      ring.rotation.z = time * 0.08
      renderer.render(scene, camera)
    }

    const start = () => {
      if (running || reduced) return
      running = true
      gsap.ticker.add(tick)
    }
    const stop = () => {
      if (!running) return
      running = false
      gsap.ticker.remove(tick)
    }
    const sync = () => {
      if (inView && !document.hidden) start()
      else stop()
    }

    const io = new IntersectionObserver((entries) => {
      inView = entries.some((e) => e.isIntersecting)
      sync()
    })
    io.observe(host)
    document.addEventListener('visibilitychange', sync)

    // First frame (also the only frame under reduced motion).
    ring.rotation.set(0.15, 0.6, 0.1)
    renderer.render(scene, camera)
    sync()

    cleanup = () => {
      stop()
      io.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('pointermove', onMove)
      geometry.dispose()
      material.dispose()
      envTexture.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  } catch {
    // No WebGL (or import failure): the CSS fallback ring below stays.
    failed.value = true
  }
})

onBeforeUnmount(() => {
  disposed = true
  cleanup?.()
})
</script>

<template>
  <div ref="hostRef" aria-hidden="true" class="relative h-full w-full">
    <img
      v-if="lite"
      src="/images/hero-knot.webp"
      alt=""
      width="960"
      height="960"
      decoding="async"
      fetchpriority="high"
      draggable="false"
      class="hero-knot-img absolute inset-0 h-full w-full select-none object-contain"
    >
    <!-- Fallback only if WebGL is unavailable: a flat gradient ring. -->
    <div
      v-if="failed"
      class="absolute inset-[14%] rounded-full"
      style=" border: 22px solid transparent; background: linear-gradient(#f6f9fb, #f6f9fb) padding-box, linear-gradient(140deg, #ffd45a, #fbba00 45%, #f29d00) border-box; opacity: 0.85; "
    />
  </div>
</template>
