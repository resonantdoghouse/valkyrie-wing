import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export function BarScene() {
  const tableRef = useRef<THREE.Mesh>(null);

  useFrame((_state, _delta) => {
    if (tableRef.current) {
      // Gentle floating animation to make it dynamic
      tableRef.current.position.y = Math.sin(_state.clock.elapsedTime * 2) * 0.05 - 1;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.2} color="#445566" />
      <pointLight position={[0, 2, 0]} intensity={1} color="#ffaa55" distance={10} />
      
      {/* Room Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* Main Table */}
      <mesh ref={tableRef} position={[0, -1, 0]}>
        <cylinderGeometry args={[1, 1, 0.2, 8]} />
        <meshStandardMaterial color="#334433" metalness={0.5} roughness={0.2} />
      </mesh>

      {/* Drink on table */}
      <mesh position={[0.3, -0.8, 0.2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.15, 8]} />
        <meshStandardMaterial color="#00ffcc" emissive="#00aa88" emissiveIntensity={0.5} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
