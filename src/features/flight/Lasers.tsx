import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useCombatStore } from '../../state/useCombatStore';
import { makeLaserMaterial } from './shaders';

const dummy = new THREE.Object3D();
const _up = new THREE.Vector3(0, 1, 0);
const _vel = new THREE.Vector3();

export function Lasers() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const enemyMeshRef = useRef<THREE.InstancedMesh>(null);
  const { lasers, enemyLasers, updateLasers, updateEnemyLasers } = useCombatStore();

  const playerMat = useMemo(() => makeLaserMaterial('#00ffcc'), []);
  const enemyMat  = useMemo(() => makeLaserMaterial('#ff3366'), []);

  useFrame((state, delta) => {
    updateLasers(delta);
    updateEnemyLasers(delta, state.camera.position);

    playerMat.uniforms.uTime.value = state.clock.elapsedTime;
    enemyMat.uniforms.uTime.value  = state.clock.elapsedTime;

    if (meshRef.current) {
      lasers.forEach((laser, i) => {
        if (laser.active) {
          dummy.position.copy(laser.position);
          _vel.copy(laser.velocity).normalize();
          dummy.quaternion.setFromUnitVectors(_up, _vel);
          dummy.scale.set(1, 5, 1);
        } else {
          dummy.position.set(0, 0, 0);
          dummy.scale.set(0, 0, 0);
        }
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (enemyMeshRef.current) {
      enemyLasers.forEach((laser, i) => {
        if (laser.active) {
          dummy.position.copy(laser.position);
          _vel.copy(laser.velocity).normalize();
          dummy.quaternion.setFromUnitVectors(_up, _vel);
          dummy.scale.set(1, 5, 1);
        } else {
          dummy.position.set(0, 0, 0);
          dummy.scale.set(0, 0, 0);
        }
        dummy.updateMatrix();
        enemyMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      enemyMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, lasers.length]}
        material={playerMat} frustumCulled={false}>
        <cylinderGeometry args={[0.18, 0.18, 2, 8, 1, true]} />
      </instancedMesh>
      <instancedMesh ref={enemyMeshRef} args={[undefined, undefined, enemyLasers.length]}
        material={enemyMat} frustumCulled={false}>
        <cylinderGeometry args={[0.18, 0.18, 2, 8, 1, true]} />
      </instancedMesh>
    </group>
  );
}
