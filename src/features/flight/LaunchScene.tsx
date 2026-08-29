import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../../state/useGameStore';
import { useGLTF } from '@react-three/drei';
import playerShipUrl from '../../assets/models/player-ship.glb';

export function LaunchScene() {
  const shipRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const { scene: shipModel } = useGLTF(playerShipUrl);
  const shipScene = useMemo(() => shipModel.clone(), [shipModel]);
  
  useEffect(() => {
    // Initial camera position
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, -10);
  }, [camera]);

  useFrame((_state, delta) => {
    if (!shipRef.current) return;
    
    // Accelerate ship forward
    shipRef.current.position.z -= 60 * delta;
    
    // Camera follows ship but stays slightly behind
    const targetCamZ = shipRef.current.position.z + 8;
    camera.position.z += (targetCamZ - camera.position.z) * 0.1;
    
    // Look ahead of the ship
    camera.lookAt(0, 0, shipRef.current.position.z - 20);

    // Shake camera slightly for engine effect
    camera.position.x = (Math.random() - 0.5) * 0.1;
    camera.position.y = 2 + (Math.random() - 0.5) * 0.1;
    
    // Transition after it flies out of the tube
    if (shipRef.current.position.z < -150) {
      useGameStore.getState().setMode('FLIGHT');
    }
  });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      
      {/* Launch Tube */}
      {Array.from({ length: 30 }).map((_, i) => (
        <mesh key={i} position={[0, 0, -i * 6]}>
          <torusGeometry args={[8, 0.5, 16, 32]} />
          <meshStandardMaterial color="#111" emissive={i % 2 === 0 ? "#00ffcc" : "#000"} emissiveIntensity={2} />
        </mesh>
      ))}

      {/* Launch Track */}
      <mesh position={[0, -2, -80]}>
        <boxGeometry args={[4, 0.5, 180]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.5} />
      </mesh>

      {/* Ship */}
      <group ref={shipRef} position={[0, 0, 0]}>
        <primitive object={shipScene} scale={3} rotation-y={-Math.PI / 2} />

        {/* Engine Glow */}
        <mesh position={[0, 0, 2.2]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshBasicMaterial color="#00ffcc" transparent opacity={0.8} />
        </mesh>

        <pointLight position={[0, 0, 2.5]} color="#00ffcc" intensity={5} distance={20} />
      </group>
    </group>
  );
}

useGLTF.preload(playerShipUrl);
