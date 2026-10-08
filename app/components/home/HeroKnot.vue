<script setup lang="ts">
// Hero knot — the PASTI Yellow (2,3) torus knot, live again (owner
// 2026-10-08: the static capture looked bent and frozen; bring back the
// turning knot, tidier). Raw WebGL, no three.js: ~one draw call of a 13k-
// vertex tube and one small shader, so there is no 700 KB download and no
// shader-compile freeze (the reason efc2495 had swapped it for an image).
//
// Look: glossy candy-glass yellow — warm diffuse, pale fresnel rim, long
// white "softbox" reflections and two sharp highlights, tone-mapped.
// Motion: the knot turns about its own symmetry axis (so the trefoil always
// reads clean, never the bent edge-on "pretzel"), with a slow tilt wobble
// for depth and a few degrees of eased pointer response on fine pointers.
//
// Discipline: starts after the page is ready and the browser is idle;
// renders on the shared GSAP ticker; pauses off-screen, in hidden tabs and
// when the hero says so (`data-paused` on the parent, set by Hero's scroll
// timeline once the knot has faded); one static frame under reduced
// motion. The server-rendered image underneath stays until the first frame
// is drawn (and remains the fallback if WebGL is unavailable).
import gsap from 'gsap'

const hostRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const live = ref(false)
// Bound, not a literal src: keeps Vite's dev asset transform off this public path.
const still = '/images/hero-knot.webp'
const { pageReady } = usePageReady()

let cleanup: (() => void) | undefined
let disposed = false

// ---------- geometry: (p,q) torus knot tube, same params as the original ----
function buildKnot(p = 2, q = 3, radius = 1.15, tube = 0.27, tubular = 320, radial = 40) {
  const pos = new Float32Array((tubular + 1) * (radial + 1) * 3)
  const nor = new Float32Array(pos.length)
  const idx = new Uint16Array(tubular * radial * 6)
  const curve = (u: number, out: number[]) => {
    const cu = Math.cos(u)
    const su = Math.sin(u)
    const quOverP = (q / p) * u
    const cs = Math.cos(quOverP)
    out[0] = radius * (2 + cs) * 0.5 * cu
    out[1] = radius * (2 + cs) * su * 0.5
    out[2] = radius * Math.sin(quOverP) * 0.5
  }
  const P1 = [0, 0, 0]
  const P2 = [0, 0, 0]
  let k = 0
  for (let i = 0; i <= tubular; i++) {
    const u = (i / tubular) * p * Math.PI * 2
    curve(u, P1)
    curve(u + 0.01, P2)
    const T = [P2[0]! - P1[0]!, P2[1]! - P1[1]!, P2[2]! - P1[2]!]
    let N = [P2[0]! + P1[0]!, P2[1]! + P1[1]!, P2[2]! + P1[2]!]
    let B = [T[1]! * N[2]! - T[2]! * N[1]!, T[2]! * N[0]! - T[0]! * N[2]!, T[0]! * N[1]! - T[1]! * N[0]!]
    N = [B[1]! * T[2]! - B[2]! * T[1]!, B[2]! * T[0]! - B[0]! * T[2]!, B[0]! * T[1]! - B[1]! * T[0]!]
    const bl = Math.hypot(B[0]!, B[1]!, B[2]!)
    const nl = Math.hypot(N[0]!, N[1]!, N[2]!)
    B = B.map((x) => x / bl)
    N = N.map((x) => x / nl)
    for (let j = 0; j <= radial; j++) {
      const v = (j / radial) * Math.PI * 2
      const cx = -tube * Math.cos(v)
      const cy = tube * Math.sin(v)
      for (let a = 0; a < 3; a++) {
        const off = cx * N[a]! + cy * B[a]!
        pos[k + a] = P1[a]! + off
        nor[k + a] = off / tube
      }
      k += 3
    }
  }
  let t = 0
  for (let j = 1; j <= tubular; j++) {
    for (let i = 1; i <= radial; i++) {
      const a = (radial + 1) * (j - 1) + (i - 1)
      const b = (radial + 1) * j + (i - 1)
      const c = (radial + 1) * j + i
      const d = (radial + 1) * (j - 1) + i
      idx[t++] = a; idx[t++] = b; idx[t++] = d
      idx[t++] = b; idx[t++] = c; idx[t++] = d
    }
  }
  return { pos, nor, idx }
}

// ---------- tiny column-major mat4 helpers ----------
type M4 = Float32Array
const ident = (): M4 => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
function mul(a: M4, b: M4): M4 {
  const o = new Float32Array(16)
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      o[c * 4 + r] = a[r]! * b[c * 4]! + a[4 + r]! * b[c * 4 + 1]! + a[8 + r]! * b[c * 4 + 2]! + a[12 + r]! * b[c * 4 + 3]!
  return o
}
const rotX = (r: number): M4 => { const c = Math.cos(r), s = Math.sin(r); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]) }
const rotY = (r: number): M4 => { const c = Math.cos(r), s = Math.sin(r); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]) }
const rotZ = (r: number): M4 => { const c = Math.cos(r), s = Math.sin(r); return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]) }
function persp(fovDeg: number, aspect: number, near: number, far: number): M4 {
  const f = 1 / Math.tan((fovDeg * Math.PI) / 360)
  const nf = 1 / (near - far)
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0])
}

const VERT = `
attribute vec3 aPos;
attribute vec3 aNor;
uniform mat4 uModel;
uniform mat4 uViewProj;
varying vec3 vNor;
varying vec3 vPos;
void main() {
  vec4 w = uModel * vec4(aPos, 1.0);
  vPos = w.xyz;
  vNor = mat3(uModel) * aNor;
  gl_Position = uViewProj * w;
}`

const FRAG = `
precision highp float;
varying vec3 vNor;
varying vec3 vPos;
uniform vec3 uCam;

float softbox(vec3 r, vec3 dir, float size, float soft) {
  return smoothstep(1.0 - size - soft, 1.0 - size, dot(r, normalize(dir)));
}

void main() {
  vec3 N = normalize(vNor);
  vec3 V = normalize(uCam - vPos);
  float NdV = clamp(dot(N, V), 0.0, 1.0);

  // Lights (world space): warm key upper-left front, cool rim lower-right, soft top.
  vec3 Lk = normalize(vec3(-3.2, 2.6, 3.6) - vPos);
  vec3 Lr = normalize(vec3(3.4, -1.8, 2.4) - vPos);
  vec3 Lt = normalize(vec3(0.4, 4.0, 1.5) - vPos);

  // Base: amber in shadow -> PASTI golden yellow -> warm butter where lit.
  vec3 amber  = vec3(0.70, 0.24, 0.00);
  vec3 gold   = vec3(1.00, 0.56, 0.03);
  vec3 butter = vec3(1.00, 0.80, 0.32);
  float dk = dot(N, Lk) * 0.5 + 0.5;            // wrapped key
  float dt = max(dot(N, Lt), 0.0);
  vec3 col = mix(amber, gold, smoothstep(0.0, 0.7, dk));
  col = mix(col, butter, smoothstep(0.62, 1.0, dk) * 0.5 + dt * 0.1);

  // Candy-glass depth: warm inner glow where the tube faces the camera.
  col += vec3(0.16, 0.07, 0.0) * pow(NdV, 2.5);
  // Occlusion toward the underside + parts of the knot farther away.
  col *= 0.8 + 0.2 * (N.y * 0.5 + 0.5);
  col *= 0.8 + 0.2 * smoothstep(-1.4, 1.4, vPos.z);

  // Fresnel: soft pale-gold rim (the original's light edge), not pink.
  float fres = pow(1.0 - NdV, 3.0);
  col = mix(col, vec3(1.0, 0.90, 0.68), fres * 0.5);
  col += vec3(1.0, 0.97, 0.9) * pow(max(dot(N, Lr), 0.0), 3.0) * fres * 0.3;

  // Studio reflections: long white softboxes + a faint horizon glow.
  vec3 R = reflect(-V, N);
  float refl = softbox(R, vec3(-0.45, 0.75, 0.48), 0.03, 0.045)
             + softbox(R, vec3(0.65, 0.35, 0.68), 0.018, 0.035) * 0.75
             + smoothstep(0.6, 0.98, R.y) * 0.12;
  col += vec3(1.0, 0.99, 0.95) * refl * (0.55 + 0.45 * fres);

  // Two sharp clearcoat highlights.
  vec3 Hk = normalize(Lk + V);
  vec3 Ht = normalize(Lt + V);
  col += vec3(1.0, 0.98, 0.92) * (pow(max(dot(N, Hk), 0.0), 160.0) * 1.2 + pow(max(dot(N, Ht), 0.0), 240.0) * 0.8);

  // Filmic-ish tone map (keeps the yellow saturated) + gamma.
  col = col / (col + vec3(0.9)) * 1.9;
  col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 1.05));
  gl_FragColor = vec4(col, 1.0);
}`

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader')
  return s
}

function init() {
  const host = hostRef.value
  const canvas = canvasRef.value
  if (!host || !canvas || disposed) return
  const gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'default' })
  if (!gl) return

  const reduced = window.matchMedia(reducedMotionQuery.reduce).matches
  const fine = window.matchMedia('(pointer: fine)').matches
  const small = window.matchMedia(breakpointQuery.belowDesktop).matches
  // Phones / tablets: lighter canvas, mesh and frame rate (the knot turns
  // slowly, so 30fps reads the same) — measured: keeps scroll on a 4x-
  // throttled phone at its pre-knot jank level.
  const light = small || isLiteDevice() || window.matchMedia('(pointer: coarse)').matches
  const dprCap = light ? 1.25 : 2
  const frameStep = light ? 1 / 30 : 0

  let prog: WebGLProgram
  try {
    prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link')
  } catch {
    return
  }
  gl.useProgram(prog)

  const { pos, nor, idx } = light ? buildKnot(2, 3, 1.15, 0.27, 220, 28) : buildKnot()
  const bufP = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, bufP)
  gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(prog, 'aPos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0)
  const bufN = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, bufN)
  gl.bufferData(gl.ARRAY_BUFFER, nor, gl.STATIC_DRAW)
  const aNor = gl.getAttribLocation(prog, 'aNor')
  gl.enableVertexAttribArray(aNor)
  gl.vertexAttribPointer(aNor, 3, gl.FLOAT, false, 0, 0)
  const bufI = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufI)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW)

  const uModel = gl.getUniformLocation(prog, 'uModel')
  const uViewProj = gl.getUniformLocation(prog, 'uViewProj')
  const uCam = gl.getUniformLocation(prog, 'uCam')
  const camZ = 9.4
  gl.uniform3f(uCam, 0, 0, camZ)
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)
  gl.clearColor(0, 0, 0, 0)

  const view = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -camZ, 1])
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap)
    const w = Math.max(1, Math.round(host.clientWidth * dpr))
    const h = Math.max(1, Math.round(host.clientHeight * dpr))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    gl.viewport(0, 0, w, h)
    gl.uniformMatrix4fv(uViewProj, false, mul(persp(32, w / h, 0.1, 50), view))
  }
  resize()

  // Base pose: the knot's symmetry axis tipped toward the viewer so the
  // trefoil reads clearly, then a slight lean to sit with the orbit line.
  const pivot = mul(rotZ(-0.32), mul(rotX(0.42), rotY(0.18)))
  const target = { x: 0, y: 0 }
  const cur = { x: 0, y: 0 }
  let time = 0

  const draw = () => {
    const spin = time * 0.34 // about the symmetry axis
    const wobX = Math.sin(time * 0.31) * 0.16 + cur.y * 0.24
    const wobY = Math.sin(time * 0.23 + 1.1) * 0.2 + cur.x * 0.34
    const model = mul(pivot, mul(rotY(wobY), mul(rotX(wobX), rotZ(spin))))
    gl.uniformMatrix4fv(uModel, false, model)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0)
  }

  const onMove = (e: PointerEvent) => {
    target.x = (e.clientX / window.innerWidth) * 2 - 1
    target.y = (e.clientY / window.innerHeight) * 2 - 1
  }
  if (fine && !reduced) window.addEventListener('pointermove', onMove, { passive: true })

  let running = false
  let inView = true
  let acc = 0
  // Light devices: hold the knot still while the page is being scrolled and
  // resume shortly after — frees the frame budget for the scroll itself.
  let scrolling = false
  let scrollTimer: ReturnType<typeof setTimeout> | undefined
  const onScroll = () => {
    scrolling = true
    clearTimeout(scrollTimer)
    scrollTimer = setTimeout(() => (scrolling = false), 180)
  }
  if (light) window.addEventListener('scroll', onScroll, { passive: true })
  const tick = (_: number, deltaMs: number) => {
    if (host.parentElement?.dataset.paused === 'true' || scrolling) return
    acc += Math.min(deltaMs, 100) / 1000
    if (acc < frameStep) return
    const dt = Math.min(acc, 0.1)
    acc = 0
    time += dt
    cur.x += (target.x - cur.x) * Math.min(1, dt * 2.6)
    cur.y += (target.y - cur.y) * Math.min(1, dt * 2.6)
    draw()
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
  const sync = () => (inView && !document.hidden ? start() : stop())
  const io = new IntersectionObserver((entries) => {
    inView = entries.some((e) => e.isIntersecting)
    sync()
  })
  io.observe(host)
  document.addEventListener('visibilitychange', sync)
  const ro = new ResizeObserver(() => {
    resize()
    if (!running) draw()
  })
  ro.observe(host)

  time = 1.4
  draw()
  live.value = true
  sync()

  cleanup = () => {
    stop()
    io.disconnect()
    ro.disconnect()
    document.removeEventListener('visibilitychange', sync)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('scroll', onScroll)
    clearTimeout(scrollTimer)
    gl.deleteBuffer(bufP)
    gl.deleteBuffer(bufN)
    gl.deleteBuffer(bufI)
    gl.deleteProgram(prog)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
}

onMounted(() => {
  // Wait for the page entrance, then for an idle slot, so the knot never
  // competes with hydration or the hero's first animation frames.
  const boot = () => {
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
    if (idle) idle(init, { timeout: 1200 })
    else setTimeout(init, 300)
  }
  if (pageReady.value) boot()
  else {
    const stopWatch = watch(pageReady, (v) => {
      if (!v) return
      stopWatch()
      boot()
    })
  }
})

onBeforeUnmount(() => {
  disposed = true
  cleanup?.()
})
</script>

<template>
  <div ref="hostRef" aria-hidden="true" class="absolute inset-0">
    <!-- Server-painted still (also the WebGL fallback); fades once live. -->
    <img
      :src="still"
      alt=""
      width="960"
      height="960"
      fetchpriority="high"
      decoding="async"
      draggable="false"
      class="hero-knot-img absolute inset-0 h-full w-full select-none object-contain transition-opacity duration-700"
      :class="live ? 'opacity-0' : 'opacity-100'"
    >
    <canvas
      ref="canvasRef"
      class="absolute inset-0 h-full w-full transition-opacity duration-700"
      :class="live ? 'opacity-100' : 'opacity-0'"
    />
  </div>
</template>
