import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export function BriefingScene() {
  const holoRef = useRef<THREE.Mesh>(null);

  useFrame((_state, delta) => {
    if (holoRef.current) {
      holoRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.1} color="#223344" />
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0a0a1a" roughness={0.9} />
      </mesh>

      {/* Briefing Table */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[3, 0.5, 2]} />
        <meshStandardMaterial color="#112233" />
      </mesh>

      {/* Hologram Map */}
      <mesh ref={holoRef} position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.6} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={2} color="#00ffff" distance={5} />
    </group>
  );
}
