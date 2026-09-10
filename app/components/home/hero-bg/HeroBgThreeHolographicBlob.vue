<script setup lang="ts">
// 3D — Holographic blob. A single heavily-subdivided icosahedron with a
// custom shader that fakes thin-film iridescence: fresnel term drives a hue
// sweep across a restrained navy -> yellow -> paper ramp (not a full
// rainbow, to stay on-brand), and a secondary high-frequency fresnel band
// adds a soap-bubble sheen. Cursor proximity brightens a highlight without
// any extra lights or geometry. One mesh, one draw call.
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

  const geometry = new THREE.IcosahedronGeometry(1.7, 12)
  const uniforms = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(999, 999) },
    uColorNavy: { value: new THREE.Color('#0B2A3D') },
    uColorMid: { value: new THREE.Color('#155A82') },
    uColorYellow: { value: new THREE.Color('#FBBA00') },
    uColorPaper: { value: new THREE.Color('#EAF1F4') }
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    vertexShader: `
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uPointer;
      uniform vec3 uColorNavy;
      uniform vec3 uColorMid;
      uniform vec3 uColorYellow;
      uniform vec3 uColorPaper;
      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        vec3 n = normalize(vNormal);
        float fresnel = pow(1.0 - max(dot(n, vViewDir), 0.0), 2.4);

        // Hue sweep driven by fresnel + a slow time offset + normal.y, so
        // the "iridescent" band drifts across the surface like an oil slick
        // instead of sitting static relative to the camera.
        float sweep = fresnel * 2.2 + n.y * 0.5 + sin(uTime * 0.15) * 0.2;
        float phase = fract(sweep * 0.5);

        vec3 ramp;
        if (phase < 0.33) {
          ramp = mix(uColorNavy, uColorMid, phase / 0.33);
        } else if (phase < 0.66) {
          ramp = mix(uColorMid, uColorYellow, (phase - 0.33) / 0.33);
        } else {
          ramp = mix(uColorYellow, uColorPaper, (phase - 0.66) / 0.34);
        }

        // Secondary fine sheen band for a soap-bubble micro-shimmer.
        float sheen = pow(fresnel, 6.0) * (0.5 + 0.5 * sin(uTime * 0.6 + n.x * 10.0));
        vec3 color = mix(uColorNavy, ramp, 0.85) + sheen * 0.25;

        // Cursor-proximity highlight bloom on the near side of the blob.
        float pointerDist = distance(n.xy, uPointer * 0.9);
        float highlight = smoothstep(0.9, 0.0, pointerDist) * fresnel;
        color += uColorPaper * highlight * 0.5;

        float alpha = 0.55 + fresnel * 0.4;
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

  const pointer = { x: 0, y: 0 }
  function onPointerMove(e: PointerEvent) {
    const rect = parent.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
  }
  parent.addEventListener('pointermove', onPointerMove)

  const clock = new THREE.Clock()
  function tick() {
    const elapsed = clock.getElapsedTime()
    const t = prefersReducedMotion ? 0 : elapsed
    uniforms.uTime.value = t
    uniforms.uPointer.value.set(pointer.x, pointer.y)

    mesh.rotation.y = t * 0.1
    mesh.rotation.x = Math.sin(t * 0.08) * 0.2

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
