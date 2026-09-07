import * as THREE from 'three'

/**
 * Hero curtain/sheet scene — three large, deterministically-curved
 * "material sheets" benchmarked against icomat.co.uk's hero: a spatial
 * material composition, not animated cloth. Each sheet's macro silhouette
 * comes from an explicit art-directed curve (never procedural noise —
 * noise is reserved for tiny-amplitude micro-surface detail layered on
 * top, added in a later step of this same file). Mirrors the
 * start()/stop()/dispose()/fit() lifecycle shape used elsewhere in this
 * codebase's Three.js composables (see the intro-3d-redesign work's
 * useIntroScene.ts for the same pattern).
 */

/** One sheet's art-directed shape + placement. Curvature values are
 * deliberately hand-tuned constants (see LAYER_PROFILES below), not
 * derived from noise or randomness — the whole point of "deterministic
 * curvature" per the design spec is that these numbers are chosen, not
 * generated. */
export interface SheetProfile {
  /** Curve control points in the sheet's local space (before width
   * extrusion), defining one large intentional arc. 4 points is enough
   * for a single clean bend — more points risk reading as a wave. */
  curvePoints: THREE.Vector3[]
  /** Width of the ribbon perpendicular to the curve's travel direction. */
  width: number
  /** Extrusion thickness (gives the sheet slight physical depth). */
  thickness: number
  /** Bevel size on the extruded edge, so specular highlights can catch
   * the side face — an "engineered material" cue per the design spec. */
  bevelSize: number
}

/**
 * Builds one sheet's geometry: a ribbon that follows `profile.curvePoints`
 * (the deterministic macro shape), given width and slight thickness with a
 * beveled edge. Implemented as a 2D cross-section shape (width x
 * thickness, beveled) extruded along the 3D curve — THREE.ExtrudeGeometry
 * with an `extrudePath` gives us exactly this: deterministic shape control
 * (the path) with real thickness/bevel (the cross-section), no noise
 * anywhere in the geometry itself.
 */
export function buildSheetGeometry(profile: SheetProfile): THREE.ExtrudeGeometry {
  const curve = new THREE.CatmullRomCurve3(profile.curvePoints, false, 'catmullrom', 0.5)

  const halfW = profile.width / 2
  const halfT = profile.thickness / 2
  const crossSection = new THREE.Shape()
  crossSection.moveTo(-halfW, -halfT)
  crossSection.lineTo(halfW, -halfT)
  crossSection.lineTo(halfW, halfT)
  crossSection.lineTo(-halfW, halfT)
  crossSection.closePath()

  const geometry = new THREE.ExtrudeGeometry(crossSection, {
    steps: 48,
    extrudePath: curve,
    bevelEnabled: true,
    bevelThickness: profile.bevelSize,
    bevelSize: profile.bevelSize,
    bevelSegments: 3
  })
  geometry.computeVertexNormals()
  return geometry
}

export interface SheetMaterialOptions {
  metalness: number
  roughness: number
  clearcoat: number
  clearcoatRoughness: number
  /** 0 disables the micro-noise normal perturbation entirely — used by
   * the mobile tier to cut shader cost. */
  microNoiseStrength: number
  /** Rim highlight color mixed in at grazing angles on the beveled edge
   * — this is the ONLY place yellow may appear on a sheet, per the
   * design spec's accent-only color discipline. 0 disables it (used by
   * the background layer, which must not carry the accent). */
  rimAccentColor: THREE.Color | null
  rimAccentStrength: number
}

/**
 * Builds one sheet's material: MeshPhysicalMaterial with Three.js's own
 * PBR lighting pipeline left fully intact (per the design spec — this is
 * an extension via onBeforeCompile, not a shader replacement). The
 * injected GLSL adds two things, both additive on top of the stock
 * physical shader:
 *  1. A tiny-amplitude 3D noise perturbation to the normal, for
 *     brushed/satin micro-surface richness — shape-changing noise is
 *     explicitly forbidden by the spec, so this only nudges shading, it
 *     never displaces geometry.
 *  2. A rim/fresnel-driven mix toward `rimAccentColor` (yellow), so the
 *     accent only ever shows as a thin edge highlight, never a fill.
 */
export function buildSheetMaterial(tint: THREE.Color, options: SheetMaterialOptions): THREE.MeshPhysicalMaterial {
  const material = new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: options.metalness,
    roughness: options.roughness,
    clearcoat: options.clearcoat,
    clearcoatRoughness: options.clearcoatRoughness,
    fog: true
  })

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uMicroNoiseStrength = { value: options.microNoiseStrength }
    shader.uniforms.uRimAccentColor = { value: options.rimAccentColor ?? new THREE.Color(0x000000) }
    shader.uniforms.uRimAccentStrength = { value: options.rimAccentColor ? options.rimAccentStrength : 0 }

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uMicroNoiseStrength;
        uniform vec3 uRimAccentColor;
        uniform float uRimAccentStrength;

        // Cheap hash-based 3D noise — micro-surface imperfection only,
        // amplitude is kept tiny by uMicroNoiseStrength (typically < 0.05).
        float hash3(vec3 p) {
          p = fract(p * 0.3183099 + 0.1);
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }`
      )
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        {
          float n = hash3(vWorldPosition * 40.0) - 0.5;
          normal = normalize(normal + vec3(n, n, n) * uMicroNoiseStrength);
        }`
      )
      .replace(
        '#include <dithering_fragment>',
        `#include <dithering_fragment>
        {
          float fresnel = pow(1.0 - max(dot(normalize(vViewPosition), normal), 0.0), 3.0);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, uRimAccentColor, fresnel * uRimAccentStrength);
        }`
      )

    // vWorldPosition isn't declared in the stock fragment shader — add it
    // and populate it from the vertex shader so the noise hash has a
    // stable world-space input (screen-space would make the noise swim
    // as the camera drifts, which reads as animated texture, not a
    // static material imperfection).
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
      varying vec3 vWorldPosition;`
    )
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vWorldPosition;`
      )
      .replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
        vWorldPosition = worldPosition.xyz;`
      )
  }

  return material
}
