<script setup lang="ts">
// 3D — Fake volumetric light shafts / god-rays. A hidden "source" behind a
// soft occluder is faked entirely with additive-blended cone geometry: each
// ray is a thin radial cone with a custom shader that fades opacity along
// its length and across its width (no raymarching, no post-process
// god-ray pass — just alpha falloff + additive blending, so it's a handful
// of triangles and one draw call per ray). Rays breathe/rotate slowly and
// the source position nudges toward the cursor for a subtle parallax cue,
// the way a shaft of light would shift as you move past a window.
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
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  camera.position.set(0, 0.4, 7)
  camera.lookAt(0, 0, 0)

  const sourceGroup = new THREE.Group()
  sourceGroup.position.set(0.6, 1.6, -1.5)
  scene.add(sourceGroup)

  // Small glowing core at the hidden source, additive-blended soft disc.
  const coreGeometry = new THREE.CircleGeometry(0.35, 32)
  const coreMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color('#FBBA00') }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float d = distance(vUv, vec2(0.5));
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(uColor, a * 0.9);
      }
    `
  })
  const core = new THREE.Mesh(coreGeometry, coreMaterial)
  sourceGroup.add(core)

  const rayUniforms = {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#FBBA00') }
  }

  const rayCount = 5
  const rays: THREE.Mesh[] = []
  for (let i = 0; i < rayCount; i++) {
    // A thin, elongated cone standing in for a light shaft: wide near the
    // source, tapering to a point, oriented outward and rotated around Z
    // so the bundle reads as diverging rays rather than one solid cone.
    const geometry = new THREE.ConeGeometry(0.9, 9, 12, 1, true)
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: rayUniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec2 vUv;
        void main() {
          // vUv.y runs 0 (tip) -> 1 (base) along the cone axis; fade both
          // ends and taper opacity toward the rim for a soft shaft look.
          float lengthFade = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
          float rimFade = 1.0 - abs(vUv.x - 0.5) * 2.0;
          float alpha = lengthFade * pow(rimFade, 1.6) * 0.16;
          gl_FragColor = vec4(uColor, alpha);
        }
      `
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.z = Math.PI + (i / rayCount) * 0.9 - 0.45
    mesh.rotation.x = 0.15
    mesh.position.y = -4.4
    const pivot = new THREE.Group()
    pivot.add(mesh)
    sourceGroup.add(pivot)
    rays.push(mesh)
  }

  function resize() {
    const { clientWidth, clientHeight } = parent
    renderer.setSize(clientWidth, clientHeight)
    camera.aspect = clientWidth / clientHeight
    camera.updateProjectionMatrix()
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(parent)

  const pointer = { x: 0, y: 0 }
  function onPointerMove(e: PointerEvent) {
    const rect = parent.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
  }
  parent.addEventListener('pointermove', onPointerMove)

  const baseSourcePos = sourceGroup.position.clone()
  const clock = new THREE.Clock()
  function tick() {
    const elapsed = clock.getElapsedTime()
    const t = prefersReducedMotion ? 0 : elapsed
    rayUniforms.uTime.value = t

    sourceGroup.position.x = baseSourcePos.x + pointer.x * 0.4
    sourceGroup.position.y = baseSourcePos.y + pointer.y * 0.25
    sourceGroup.rotation.z = Math.sin(t * 0.05) * 0.12

    const breathe = 1 + Math.sin(t * 0.35) * 0.06
    rays.forEach((mesh, i) => {
      mesh.scale.set(breathe, 1, breathe)
      const phase = t * 0.03 + i * 0.4
      mesh.parent!.rotation.z = Math.sin(phase) * 0.03
    })
    core.scale.setScalar(1 + Math.sin(t * 0.8) * 0.08)

    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    resizeObserver.disconnect()
    parent.removeEventListener('pointermove', onPointerMove)
    coreGeometry.dispose()
    coreMaterial.dispose()
    rays.forEach((mesh) => {
      mesh.geometry.dispose()
      ;(mesh.material as THREE.Material).dispose()
    })
    renderer.dispose()
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-90">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>
