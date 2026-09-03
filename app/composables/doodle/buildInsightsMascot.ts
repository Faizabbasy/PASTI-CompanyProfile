import * as THREE from 'three'

const NAVY = 0x0b3954
const TEAL = 0x1c5e7c
const YELLOW = 0xfbba00
const YELLOW_SOFT = 0xfffbeb
const PAPER = 0xeaf1f4

/**
 * "Character with an open book and idea bulb" mascot — matches the 2D
 * InsightsDoodle SVG's subject as a low-poly 3D scene.
 */
export function buildInsightsMascot(group: THREE.Group) {
  const mat = (color: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.05, ...opts })

  // open book: a flat navy base slab (reads as the book's mass/shadow side)
  // plus a lighter angled "pages" wedge on top, facing the camera — simpler
  // and more reliable at this small scale/steep angle than two hinged
  // page meshes, which read as an near-invisible sliver from the front.
  const bookGroup = new THREE.Group()
  bookGroup.position.set(0, -0.55, 0.15)
  bookGroup.rotation.x = -0.25
  group.add(bookGroup)

  const bookBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.14, 1.05), mat(NAVY))
  bookGroup.add(bookBase)

  const pagesGeo = new THREE.BoxGeometry(1.3, 0.06, 0.9)
  const pages = new THREE.Mesh(pagesGeo, mat(PAPER, { roughness: 0.6 }))
  pages.position.y = 0.1
  bookGroup.add(pages)

  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 1.05), mat(TEAL))
  bookGroup.add(spine)

  const lineGeo = new THREE.BoxGeometry(0.5, 0.015, 0.02)
  const lineMat = mat(0x9fc1cf)
  for (let i = 0; i < 3; i++) {
    const lineL = new THREE.Mesh(lineGeo, lineMat)
    lineL.position.set(-0.36, 0.135, 0.28 - i * 0.22)
    bookGroup.add(lineL)
    const lineR = new THREE.Mesh(lineGeo, lineMat)
    lineR.position.set(0.36, 0.135, 0.28 - i * 0.22)
    bookGroup.add(lineR)
  }

  // character head peeking above the book
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), mat(YELLOW, { roughness: 0.5 }))
  head.position.set(0, 0.35, 0.1)
  group.add(head)

  const eyeGeo = new THREE.SphereGeometry(0.06, 12, 12)
  const eyeMat = mat(NAVY, { roughness: 0.3 })
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat)
  eyeL.position.set(-0.2, 0.4, 0.58)
  group.add(eyeL)
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat)
  eyeR.position.set(0.2, 0.4, 0.58)
  group.add(eyeR)

  // idea bulb
  const bulbGroup = new THREE.Group()
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 20, 20),
    mat(YELLOW_SOFT, { emissive: YELLOW, emissiveIntensity: 0.35, roughness: 0.3 })
  )
  bulbGroup.add(bulb)
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.15, 12), mat(0x523b00))
  base.position.y = -0.34
  bulbGroup.add(base)
  bulbGroup.position.set(0.95, 1.15, 0.35)
  group.add(bulbGroup)

  const bulbLight = new THREE.PointLight(YELLOW, 0, 2.5)
  bulbLight.position.copy(bulbGroup.position)
  group.add(bulbLight)

  group.scale.setScalar(0.78)
  group.position.y = -0.05

  return (elapsed: number) => {
    // bulb glows in a slow pulse and bobs slightly — "idea sparking"
    const glow = 0.25 + Math.sin(elapsed * 1.8) * 0.15
    ;(bulb.material as THREE.MeshStandardMaterial).emissiveIntensity = glow
    bulbLight.intensity = Math.max(0, glow) * 1.4
    bulbGroup.position.y = 1.15 + Math.sin(elapsed * 1.4) * 0.05
  }
}
