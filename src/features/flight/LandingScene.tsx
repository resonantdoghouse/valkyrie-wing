import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../../state/useGameStore';
import { useMissionStore } from '../../state/useMissionStore';
import { useGLTF } from '@react-three/drei';
import playerShipUrl from '../../assets/models/player-ship.glb';

export function LandingScene() {
  const shipRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const { scene: shipModel } = useGLTF(playerShipUrl);
  const shipScene = useMemo(() => shipModel.clone(), [shipModel]);
  
  useEffect(() => {
    // Initial camera position
    camera.position.set(0, 2, 158);
    camera.lookAt(0, 0, 100);
  }, [camera]);

  useFrame((_state, delta) => {
    if (!shipRef.current) return;
    
    // Decelerate ship forward into the tube
    // Start at 150, land at 0
    shipRef.current.position.z -= 40 * delta;
    
    // Camera follows ship
    const targetCamZ = shipRef.current.position.z + 8;
    camera.position.z += (targetCamZ - camera.position.z) * 0.1;
    
    // Look ahead of the ship
    camera.lookAt(0, 0, shipRef.current.position.z - 20);
    
    // Shake camera slightly (less than launch)
    if (shipRef.current.position.z > 20) {
      camera.position.x = (Math.random() - 0.5) * 0.02;
      camera.position.y = 2 + (Math.random() - 0.5) * 0.02;
    } else {
      camera.position.x = 0;
      camera.position.y = 2;
    }
    
    // Transition after it lands
    if (shipRef.current.position.z <= 0) {
      useMissionStore.getState().completeMission();
      useGameStore.getState().setMode('BAR');
    }
  });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      
      {/* Landing Tube */}
      {Array.from({ length: 30 }).map((_, i) => (
        <mesh key={i} position={[0, 0, 150 - i * 6]}>
          <torusGeometry args={[8, 0.5, 16, 32]} />
          <meshStandardMaterial color="#111" emissive={i % 2 === 0 ? "#ffaa00" : "#000"} emissiveIntensity={1.5} />
        </mesh>
      ))}

      {/* Landing Track */}
      <mesh position={[0, -2, 75]}>
        <boxGeometry args={[4, 0.5, 180]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.5} />
      </mesh>

      {/* Ship */}
      <group ref={shipRef} position={[0, 0, 150]}>
        <primitive object={shipScene} scale={3} rotation-y={-Math.PI / 2} />

        {/* Engine Glow (Fading) */}
        <mesh position={[0, 0, 2.2]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshBasicMaterial color="#ff5500" transparent opacity={0.6} />
        </mesh>

        <pointLight position={[0, 0, 2.5]} color="#ff5500" intensity={2} distance={10} />
      </group>
    </group>
  );
}

useGLTF.preload(playerShipUrl);
