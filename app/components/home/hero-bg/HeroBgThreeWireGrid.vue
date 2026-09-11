<script setup lang="ts">
// 3D — Wireframe terrain grid, synthwave/HUD-inspired but restrained in
// color (brand navy/yellow, not neon). A wireframe plane recedes into the
// distance with perspective, vertices displaced by scrolling noise for a
// "terrain flying past" feel, plus a horizon glow plane behind it. Camera
// is static; only the shader's noise offset and a slow horizontal drift
// move, which is far cheaper than moving actual geometry per frame.
//
// Chromatic Depth Refraction: two slowly-drifting "lens" zones near the
// mesh's upper-left/upper-right edges bend the perceived color of the
// grid lines passing through them (fake chromatic aberration, computed
// per-pixel in the same fragment shader — no second draw pass), reading
// as an optical distortion in the terrain rather than a separate object.
import * as THREE from 'three'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

const noiseGLSL = `
vec2 hash(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return -1.0+2.0*fract(sin(p)*43758.5453123);}
float noise(vec2 p){
  const float K1=0.366025404;
  const float K2=0.211324865;
  vec2 i=floor(p+(p.x+p.y)*K1);
  vec2 a=p-i+(i.x+i.y)*K2;
  vec2 o=(a.x>a.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec2 b=a-o+K2;
  vec2 c=a-1.0+2.0*K2;
  vec3 h=max(0.5-vec3(dot(a,a),dot(b,b),dot(c,c)),0.0);
  vec3 n=h*h*h*h*vec3(dot(a,hash(i+0.0)),dot(b,hash(i+o)),dot(c,hash(i+1.0)));
  return dot(n,vec3(70.0));
}
`

useGsapContext(() => {
  if (!canvasRef.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvas = canvasRef.value
  const parent = canvas.parentElement!
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100)
  camera.position.set(0, 1.6, 2.6)
  camera.lookAt(0, 0.2, -4)

  const geometry = new THREE.PlaneGeometry(14, 20, 90, 130)
  const uniforms = {
    uTime: { value: 0 },
    uPointer: { value: 0 },
    uColor: { value: new THREE.Color('#0B3954') },
    uAccent: { value: new THREE.Color('#FBBA00') },
    uResolution: { value: new THREE.Vector2(1, 1) },
    // xy = screen-space lens center (0-1, aspect-corrected x, y-up), z = radius, w = strength.
    // Positioned at the mesh's own upper edge (~0.35-0.5), not the literal
    // viewport corner — this camera/plane setup only puts terrain geometry
    // in the lower ~55% of the screen, so a lens centered higher would sit
    // over empty space with nothing to visibly refract.
    uLensTL: { value: new THREE.Vector4(0.32, 0.42, 0.42, 1.6) },
    uLensTR: { value: new THREE.Vector4(1.28, 0.46, 0.32, 1.3) }
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    wireframe: true,
    transparent: true,
    vertexShader: `
      uniform float uTime;
      varying float vDist;
      varying vec2 vUv;
      varying vec4 vClip;
      ${noiseGLSL}
      void main() {
        vUv = uv;
        vec3 p = position;
        float scroll = uTime * 0.5;
        float elevation = noise(vec2(p.x * 0.25, p.y * 0.2 + scroll)) * 0.9;
        p.z += elevation;
        vDist = 1.0 - clamp((p.y + 10.0) / 20.0, 0.0, 1.0);
        vec4 clip = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        vClip = clip;
        gl_Position = clip;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform vec3 uAccent;
      uniform vec2 uResolution;
      uniform vec4 uLensTL;
      uniform vec4 uLensTR;
      uniform float uTime;
      varying float vDist;
      varying vec2 vUv;
      varying vec4 vClip;

      // Screen-space position of this fragment, aspect-corrected, y-up (0-1).
      vec2 screenPos() {
        vec2 ndc = vClip.xy / vClip.w;
        vec2 sp = ndc * 0.5 + 0.5;
        sp.x *= uResolution.x / uResolution.y;
        return sp;
      }

      // Per-lens falloff strength — cheap fake chromatic-aberration/refraction:
      // no second draw pass, all computed in this one fragment shader.
      float lensFalloff(vec2 sp, vec4 lens) {
        float d = distance(sp, lens.xy) / lens.z;
        return (1.0 - smoothstep(0.55, 1.0, d)) * lens.w;
      }

      void main() {
        vec2 sp = screenPos();
        float lTL = lensFalloff(sp, uLensTL);
        float lTR = lensFalloff(sp, uLensTR);
        float lens = clamp(lTL + lTR, 0.0, 1.0);

        vec3 base = mix(uAccent, uColor, vDist);
        float edgeFade = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
        float baseAlpha = 0.5 * edgeFade * (1.0 - vDist * 0.6);

        // Inside a lens zone: split into a warm/cool fringe (fake chromatic
        // split) and boost line opacity so the distortion reads as "the
        // grid bends and refracts here", not just a glow.
        vec3 warm = base + vec3(0.45, 0.24, -0.08) * lens;
        vec3 cool = base + vec3(-0.12, 0.08, 0.4) * lens;
        float split = sin(uTime * 0.6 + sp.x * 40.0) * 0.5 + 0.5;
        vec3 color = mix(warm, cool, split * lens);

        float alpha = baseAlpha * (1.0 + lens * 3.2) + lens * 0.18;
        gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.95));
      }
    `
  })

  const grid = new THREE.Mesh(geometry, material)
  grid.rotation.x = -Math.PI / 2.15
  grid.position.set(0, -0.6, -6)
  scene.add(grid)

  const glowGeo = new THREE.PlaneGeometry(14, 4)
  const glowMat = new THREE.MeshBasicMaterial({
    color: '#FBBA00',
    transparent: true,
    opacity: 0.06,
    side: THREE.DoubleSide
  })
  const glow = new THREE.Mesh(glowGeo, glowMat)
  glow.position.set(0, 0.4, -12)
  scene.add(glow)

  function resize() {
    const { clientWidth, clientHeight } = parent
    renderer.setSize(clientWidth, clientHeight)
    camera.aspect = clientWidth / clientHeight
    camera.updateProjectionMatrix()
    uniforms.uResolution.value.set(clientWidth, clientHeight)
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(parent)

  const pointer = { x: 0 }
  function onPointerMove(e: PointerEvent) {
    const rect = parent.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  }
  parent.addEventListener('pointermove', onPointerMove)

  const clock = new THREE.Clock()
  function tick() {
    const elapsed = clock.getElapsedTime()
    const t = prefersReducedMotion ? 0 : elapsed
    uniforms.uTime.value = t
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.03
    camera.lookAt(0, 0.2, -4)

    // Both lens zones drift on slow, independent, non-repeating-looking
    // paths, plus a gentle breathing radius/strength pulse — frozen when
    // reduced motion is preferred.
    if (!prefersReducedMotion) {
      const aspect = uniforms.uResolution.value.x / uniforms.uResolution.value.y
      uniforms.uLensTL.value.x = (0.2 + Math.sin(t * 0.045) * 0.05) * aspect
      uniforms.uLensTL.value.y = 0.42 + Math.cos(t * 0.037) * 0.06
      uniforms.uLensTL.value.z = (0.26 + Math.sin(t * 0.021) * 0.03) * aspect
      uniforms.uLensTL.value.w = 1.6 + Math.sin(t * 0.11) * 0.3

      uniforms.uLensTR.value.x = (0.8 + Math.sin(t * 0.03 + 3.0) * 0.04) * aspect
      uniforms.uLensTR.value.y = 0.46 + Math.cos(t * 0.041 + 1.5) * 0.05
      uniforms.uLensTR.value.z = (0.2 + Math.cos(t * 0.026) * 0.02) * aspect
      uniforms.uLensTR.value.w = 1.3 + Math.sin(t * 0.09 + 2.0) * 0.25
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
    glowGeo.dispose()
    glowMat.dispose()
    renderer.dispose()
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden opacity-70">
    <canvas ref="canvasRef" class="h-full w-full" />
  </div>
</template>
