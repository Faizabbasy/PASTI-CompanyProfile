import * as THREE from 'three'

const NAVY = 0x0b3954
const YELLOW = 0xfbba00

/**
 * PASTI mascot blob — matches the 2D AboutDoodle SVG (a navy blob body with
 * a yellow belly, waving arm, sparkle) as a rounded low-poly 3D character.
 */
export function buildAboutMascot(group: THREE.Group) {
  const mat = (color: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.05, ...opts })

  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), mat(NAVY))
  body.scale.set(0.95, 1.15, 0.95)
  group.add(body)

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.6, 24, 24), mat(YELLOW, { roughness: 0.5 }))
  belly.position.set(0, -0.2, 0.72)
  belly.scale.set(1, 1.1, 0.55)
  group.add(belly)

  const eyeGeo = new THREE.SphereGeometry(0.09, 12, 12)
  const eyeMat = mat(0xffffff, { roughness: 0.2 })
  const pupilGeo = new THREE.SphereGeometry(0.045, 10, 10)
  const pupilMat = mat(NAVY, { roughness: 0.2 })
  ;[-0.28, 0.28].forEach((x) => {
    const eye = new THREE.Mesh(eyeGeo, eyeMat)
    eye.position.set(x, 0.35, 0.92)
    group.add(eye)
    const pupil = new THREE.Mesh(pupilGeo, pupilMat)
    pupil.position.set(x, 0.35, 1.0)
    group.add(pupil)
  })

  const armGeo = new THREE.CapsuleGeometry(0.08, 0.5, 4, 8)
  const armMat = mat(NAVY)
  const armL = new THREE.Mesh(armGeo, armMat)
  armL.position.set(-0.95, -0.1, 0.1)
  armL.rotation.z = Math.PI / 3
  group.add(armL)

  const wavingArm = new THREE.Mesh(armGeo, armMat)
  wavingArm.position.set(0.95, 0.3, 0.1)
  wavingArm.rotation.z = -Math.PI / 2.4
  group.add(wavingArm)

  const feetGeo = new THREE.SphereGeometry(0.22, 16, 16)
  const feetMat = mat(NAVY)
  ;[-0.35, 0.35].forEach((x) => {
    const foot = new THREE.Mesh(feetGeo, feetMat)
    foot.position.set(x, -1.15, 0.15)
    foot.scale.set(1, 0.55, 1.1)
    group.add(foot)
  })

  const sparkle = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), mat(YELLOW, { emissive: YELLOW, emissiveIntensity: 0.4 }))
  sparkle.position.set(1.1, 1.1, 0.4)
  group.add(sparkle)

  group.scale.setScalar(0.85)

  const wavingArmBaseRot = wavingArm.rotation.z
  const sparkleBasePos = sparkle.position.clone()

  return (elapsed: number) => {
    // waving arm swings back and forth
    wavingArm.rotation.z = wavingArmBaseRot + Math.sin(elapsed * 3.2) * 0.35
    // sparkle twinkles: spins + bobs
    sparkle.rotation.y += 0.06
    sparkle.rotation.x += 0.04
    sparkle.position.y = sparkleBasePos.y + Math.sin(elapsed * 2.4) * 0.06
    const scaleT = 0.8 + Math.sin(elapsed * 3) * 0.25
    sparkle.scale.setScalar(scaleT)
  }
}
