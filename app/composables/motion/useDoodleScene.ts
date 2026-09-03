import * as THREE from 'three'

export interface DoodleSceneHandle {
  start: () => void
  stop: () => void
  fit: () => void
  dispose: () => void
  triggerBounce: () => void
}

/**
 * Shared lean Three.js scaffold for the three hero-doodle mascots
 * (Work/About/Insights) — deliberately NOT built on useHeroScene.ts's
 * "Living Network" machinery (~1000 lines, PMREM env maps, thousands of
 * point-sprite nodes, multi-hop data packets). These are a handful of
 * primitive meshes each, so a much smaller dedicated loop keeps the per-page
 * cost low, matching the client's "keep the 3D compact/light" brief that
 * already shaped the homepage Hero scene.
 *
 * `buildGroup` receives the root THREE.Group to populate and returns a
 * per-frame tick callback (elapsed, dt) for any mascot-specific idle motion
 * (e.g. a spinning gear, a blinking eye) beyond the shared idle bob/rotation
 * and hover squash this composable already drives.
 */
export function useDoodleScene(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  buildGroup: (group: THREE.Group) => ((elapsed: number, dt: number) => void) | void
): DoodleSceneHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50)
  camera.position.set(0, 0, 6.5)

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
  keyLight.position.set(3, 4, 5)
  scene.add(keyLight)
  const rimLight = new THREE.DirectionalLight(0xfbba00, 0.8)
  rimLight.position.set(-3, -2, -2)
  scene.add(rimLight)
  scene.add(new THREE.AmbientLight(0xffffff, 0.55))

  const root = new THREE.Group()
  scene.add(root)
  const mascotTick = buildGroup(root) ?? (() => {})

  let running = false
  let rafId: number | undefined
  let lastTime = 0
  let elapsed = 0

  // Hover reaction: an exaggerated squash-and-stretch pop laid on top of the
  // continuous idle bob, matching the same cartoon-bounce request the 2D
  // doodles already implement (useHeroDoodle.ts) — timeline-driven here via
  // a manual eased progress instead of GSAP, since tying GSAP tweens to a
  // per-frame-recomputed scale would fight the idle bob's own scale writes.
  let bounceStart: number | undefined
  const BOUNCE_DUR = 0.7

  function triggerBounce() {
    bounceStart = elapsed
  }

  function bounceScale(): { x: number; y: number; z: number } {
    if (bounceStart === undefined) return { x: 1, y: 1, z: 1 }
    const t = (elapsed - bounceStart) / BOUNCE_DUR
    if (t >= 1) {
      bounceStart = undefined
      return { x: 1, y: 1, z: 1 }
    }
    // Two damped oscillations settling back to 1 — squash-stretch-settle.
    const decay = Math.exp(-t * 5)
    const wobble = Math.sin(t * Math.PI * 4) * decay
    return { x: 1 + wobble * 0.22, y: 1 - wobble * 0.22, z: 1 + wobble * 0.1 }
  }

  function tick(dt: number) {
    elapsed += dt

    root.position.y = Math.sin(elapsed * 1.1) * 0.12
    root.rotation.y = Math.sin(elapsed * 0.7) * 0.18
    root.rotation.z = Math.sin(elapsed * 0.9 + 1.2) * 0.03

    const b = bounceScale()
    root.scale.set(b.x, b.y, b.z)

    mascotTick(elapsed, dt)
  }

  function loop(now: number) {
    if (!running) return
    const dt = Math.min((now - lastTime) / 1000, 0.05)
    lastTime = now
    tick(dt)
    renderer.render(scene, camera)
    rafId = requestAnimationFrame(loop)
  }

  function start() {
    if (running) return
    running = true
    lastTime = performance.now()
    rafId = requestAnimationFrame(loop)
  }

  function stop() {
    running = false
    if (rafId !== undefined) cancelAnimationFrame(rafId)
    rafId = undefined
  }

  function fit() {
    const rect = container.getBoundingClientRect()
    const w = Math.max(rect.width, 1)
    const h = Math.max(rect.height, 1)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  function dispose() {
    stop()
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        mats.forEach((m) => m.dispose())
      }
    })
    renderer.dispose()
  }

  return { start, stop, fit, dispose, triggerBounce }
}
