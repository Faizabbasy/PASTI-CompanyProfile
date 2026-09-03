import * as THREE from 'three'

const NAVY = 0x0b3954
const YELLOW = 0xfbba00
const PAPER = 0xeaf1f4
const TEAL = 0x1c5e7c

/**
 * Low-poly "developer at a desk" mascot — matches the 2D WorkDoodle SVG's
 * subject (a rounded yellow character behind a monitor on a navy desk),
 * built from primitive geometries only (spheres/boxes/cylinders) to stay
 * within useDoodleScene's "handful of meshes" budget.
 */
export function buildWorkMascot(group: THREE.Group) {
  const mat = (color: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.05, ...opts })

  // desk
  const desk = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.18, 1.1), mat(NAVY))
  desk.position.set(0, -1.15, 0)
  group.add(desk)

  const legGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.7, 8)
  ;[-1.5, 1.5].forEach((x) => {
    const leg = new THREE.Mesh(legGeo, mat(NAVY))
    leg.position.set(x, -1.55, 0)
    group.add(leg)
  })

  // character head — placed first/behind, low enough that the monitor
  // frames it rather than floating disconnected above it
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 24), mat(YELLOW, { roughness: 0.5 }))
  head.position.set(0, -0.15, 0.55)
  group.add(head)

  const eyeGeo = new THREE.SphereGeometry(0.055, 12, 12)
  const eyeMat = mat(NAVY, { roughness: 0.3 })
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat)
  eyeL.position.set(-0.18, -0.1, 0.98)
  group.add(eyeL)
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat)
  eyeR.position.set(0.18, -0.1, 0.98)
  group.add(eyeR)

  // arms resting on desk, either side of the head
  const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8)
  const armMat = mat(TEAL)
  const armL = new THREE.Mesh(armGeo, armMat)
  armL.position.set(-0.5, -0.75, 0.55)
  armL.rotation.z = Math.PI / 2.8
  group.add(armL)
  const armR = new THREE.Mesh(armGeo, armMat)
  armR.position.set(0.5, -0.75, 0.55)
  armR.rotation.z = -Math.PI / 2.8
  group.add(armR)

  // keyboard, in front of the character
  const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.35), mat(TEAL))
  keyboard.position.set(0, -0.97, 0.85)
  group.add(keyboard)

  // monitor — positioned above/behind the head so the character reads as
  // sitting in front of it, not the head floating separately above
  const monitor = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.1, 0.12), mat(NAVY))
  monitor.position.set(0, 0.55, -0.35)
  group.add(monitor)
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.85), mat(PAPER, { emissive: 0xffffff, emissiveIntensity: 0.15 }))
  screen.position.set(0, 0.55, -0.285)
  group.add(screen)
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.1), mat(NAVY))
  stand.position.set(0, -0.1, -0.35)
  group.add(stand)

  group.scale.setScalar(0.72)
  group.position.y = 0.15

  return (elapsed: number) => {
    // gentle screen glow pulse — reads as "the monitor is on"
    const pulse = 0.12 + Math.sin(elapsed * 1.6) * 0.05
    ;(screen.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse
  }
}
