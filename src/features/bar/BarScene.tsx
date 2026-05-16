import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { useDebugStore } from '../../debug/useDebugStore';

export function BarScene() {
  const tableRef = useRef<THREE.Mesh>(null);
  const showLightHelpers = useDebugStore(state => state.showLightHelpers);

  // ── Ambient Light Controls ──────────────────────────────────────────────────
  const { ambientIntensity, ambientColor } = useControls(
    'Bar / Ambient Light',
    {
      ambientIntensity: { value: 0.2, min: 0, max: 5, step: 0.05, label: 'Intensity' },
      ambientColor: { value: '#445566', label: 'Color' },
    },
    { collapsed: true }
  );

  // ── Point Light Controls ────────────────────────────────────────────────────
  const { pointIntensity, pointColor, pointX, pointY, pointZ, pointDistance } = useControls(
    'Bar / Point Light',
    {
      pointIntensity: { value: 1.0, min: 0, max: 20, step: 0.1, label: 'Intensity' },
      pointColor: { value: '#ffaa55', label: 'Color' },
      pointX: { value: 0, min: -10, max: 10, step: 0.1, label: 'X' },
      pointY: { value: 2, min: -5, max: 10, step: 0.1, label: 'Y' },
      pointZ: { value: 0, min: -10, max: 10, step: 0.1, label: 'Z' },
      pointDistance: { value: 10, min: 0, max: 50, step: 0.5, label: 'Distance' },
    },
    { collapsed: true }
  );

  useFrame((_state, _delta) => {
    if (tableRef.current) {
      tableRef.current.position.y = Math.sin(_state.clock.elapsedTime * 2) * 0.05 - 1;
    }
  });

  return (
    <group>
      <ambientLight intensity={ambientIntensity} color={ambientColor} />
      <pointLight
        position={[pointX, pointY, pointZ]}
        intensity={pointIntensity}
        color={pointColor}
        distance={pointDistance}
      />

      {/* Light debug helpers */}
      {showLightHelpers && (
        <>
          {/* Point light position indicator */}
          <mesh position={[pointX, pointY, pointZ]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial color={pointColor} />
          </mesh>
          {/* Point light range sphere */}
          <mesh position={[pointX, pointY, pointZ]}>
            <sphereGeometry args={[pointDistance, 12, 12]} />
            <meshBasicMaterial color={pointColor} wireframe transparent opacity={0.12} />
          </mesh>
          {/* Ambient fill indicator */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshBasicMaterial color={ambientColor} wireframe />
          </mesh>
          <axesHelper args={[3]} />
        </>
      )}

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
