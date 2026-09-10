<script setup lang="ts">
// 3D — Liquid-magnet blob. Deliberately different behavior from
// HeroBgThreeHolographicBlob's passive slow rotation: this blob actively
// chases the cursor like a drop of liquid metal caught in a magnetic
// field. The chase target is spring-damped (not a direct 1:1 follow) so
// the whole mesh has real inertia — overshoots slightly, settles — and
// the surface itself stretches toward the direction of travel via a
// per-vertex shader displacement keyed off velocity, so the blob visibly
// elongates when moving fast and relaxes back to round when idle, the
// way a liquid droplet would.
import * as THREE from 'three'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  camera.position.set(0, 0, 6.5)

  const geometry = new THREE.IcosahedronGeometry(1.5, 10)
  const uniforms = {
    uTime: { value: 0 },
    uStretch: { value: new THREE.Vector3(0, 0, 0) },
    uColorNavy: { value: new THREE.Color('#0B2A3D') },
    uColorMid: { value: new THREE.Color('#155A82') },
    uColorYellow: { value: new THREE.Color('#FBBA00') }
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    vertexShader: `
      uniform float uTime;
      uniform vec3 uStretch;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        // Elongate along the stretch direction, proportional to how
        // aligned each vertex's position is with that direction — the
        // liquid-droplet "trailing" look, not a uniform scale.
        vec3 p = position;
        float alignment = dot(normalize(p + 0.0001), normalize(uStretch + 0.0001));
        float stretchAmount = length(uStretch);
        p += normalize(uStretch + 0.0001) * max(alignment, 0.0) * stretchAmount * 0.9;

        // Small ambient surface ripple so it never looks perfectly rigid.
        float ripple = sin(p.x * 3.0 + uTime * 1.4) * cos(p.y * 3.0 + uTime * 1.1) * 0.025;
        p += normalize(p + 0.0001) * ripple;

        vNormal = normalize(normalMatrix * normalize(p));
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColorNavy;
      uniform vec3 uColorMid;
      uniform vec3 uColorYellow;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vec3 n = normalize(vNormal);
        float fresnel = pow(1.0 - max(dot(n, vViewDir), 0.0), 2.2);
        float sweep = fresnel * 1.8 + n.y * 0.4 + sin(uTime * 0.2) * 0.15;
        vec3 ramp = mix(uColorNavy, uColorYellow, clamp(sweep, 0.0, 1.0));
        vec3 color = mix(uColorMid, ramp, 0.75) + fresnel * 0.2;
        float alpha = 0.6 + fresnel * 0.35;
        gl_FragColor = vec4(color, alpha);
      }
    `
  })

  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  function resize() {
    const { clientWidth, clientHeight } = parent
    renderer.setSize(clientWidth, clientHeight)
    camera.aspect = clientWidth / clientHeight
    camera.updateProjectionMatrix()
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(parent)

  const pointerTarget = { x: 0, y: 0 }
  function onPointerMove(e: PointerEvent) {
    const rect = parent.getBoundingClientRect()
    pointerTarget.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointerTarget.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
  }
  parent.addEventListener('pointermove', onPointerMove)

  // Spring-damped chase: position has real velocity/inertia rather than
  // snapping straight to the pointer, so the blob overshoots and settles.
  const pos = { x: 0, y: 0 }
  const vel = { x: 0, y: 0 }
  const prevPos = { x: 0, y: 0 }
  const stretchVec = new THREE.Vector3()

  const clock = new THREE.Clock()
  function tick() {
    const elapsed = clock.getElapsedTime()
    const t = prefersReducedMotion ? 0 : elapsed
    uniforms.uTime.value = t

    if (!prefersReducedMotion) {
      const springStrength = 6
      const damping = 3.4
      const dt = 0.016
      vel.x += (pointerTarget.x * 1.6 - pos.x) * springStrength * dt
      vel.y += (pointerTarget.y * 1.6 - pos.y) * springStrength * dt
      vel.x *= 1 - damping * dt
      vel.y *= 1 - damping * dt
      pos.x += vel.x * dt
      pos.y += vel.y * dt

      const travelX = pos.x - prevPos.x
      const travelY = pos.y - prevPos.y
      prevPos.x = pos.x
      prevPos.y = pos.y

      stretchVec.set(travelX * 6, travelY * 6, 0)
      uniforms.uStretch.value.lerp(stretchVec, 0.3)

      mesh.position.set(pos.x, pos.y, 0)
      mesh.rotation.y = t * 0.08
    }

    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
    geometry.dispose()
    material.dispose()
    renderer.dispose()
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-90">
    <div class="h-[120%] w-[120%]">
      <canvas ref="canvasRef" class="h-full w-full" />
    </div>
  </div>
</template>
