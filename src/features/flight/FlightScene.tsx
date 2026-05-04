import { useRef } from 'react';
import * as THREE from 'three';
import { PlayerShip } from './PlayerShip';
import { Lasers } from './Lasers';
import { Enemies } from './Enemies';

function Ring({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[10, 0.5, 16, 64]} />
      <meshStandardMaterial color="#ff00ff" emissive="#ff00aa" emissiveIntensity={0.5} />
    </mesh>
  );
}

function Starfield() {
  const starsRef = useRef<THREE.Points>(null);
  const count = 2000;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 1000;
  }

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.5} sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

export function FlightScene() {
  return (
    <group>
      <ambientLight intensity={0.2} color="#ffffff" />
      <directionalLight position={[50, 50, 50]} intensity={1} color="#ffeedd" />
      
      <Starfield />
      <Enemies />
      <Lasers />
      <PlayerShip />

      {/* Three floating rings */}
      <Ring position={[0, 0, -50]} />
      <Ring position={[20, 10, -150]} />
      <Ring position={[-30, -20, -300]} />
    </group>
  );
}
