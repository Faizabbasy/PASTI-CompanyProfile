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
