import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useCombatStore } from '../../state/useCombatStore';

const dummy = new THREE.Object3D();

export function Lasers() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { lasers, updateLasers } = useCombatStore();

  useFrame((_state, delta) => {
    updateLasers(delta);
    
    if (meshRef.current) {
      lasers.forEach((laser, i) => {
        if (laser.active) {
          dummy.position.copy(laser.position);
          
          // Align cylinder's Y axis (default) with the velocity vector
          const velocityNorm = laser.velocity.clone().normalize();
          dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), velocityNorm);
          
          dummy.scale.set(1, 5, 1); // 10 units long
          dummy.updateMatrix();
          meshRef.current!.setMatrixAt(i, dummy.matrix);
        } else {
          dummy.position.set(0, 0, 0);
          dummy.scale.set(0, 0, 0);
          dummy.updateMatrix();
          meshRef.current!.setMatrixAt(i, dummy.matrix);
        }
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, lasers.length]} frustumCulled={false}>
      <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
      <meshBasicMaterial color="#00ffcc" />
    </instancedMesh>
  );
}
