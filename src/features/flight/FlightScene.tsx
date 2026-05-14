import { useRef } from 'react';
import * as THREE from 'three';
import { PlayerShip } from './PlayerShip';
import { Lasers } from './Lasers';
import { Enemies } from './Enemies';
import { useMissionStore } from '../../state/useMissionStore';
import { Html } from '@react-three/drei';

function Waypoints() {
  const activeMission = useMissionStore(state => state.activeMission);
  if (!activeMission) return null;

  return (
    <>
      {activeMission.objectives.map(obj => {
        if (!obj.completed && obj.position) {
          return (
            <group key={obj.id} position={obj.position}>
              <mesh>
                <octahedronGeometry args={[5, 0]} />
                <meshBasicMaterial color="#ffff00" wireframe />
              </mesh>
              <Html center position={[0, -8, 0]}>
                <div style={{
                  color: '#ffff00',
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '12px',
                  background: 'rgba(0,0,0,0.5)',
                  padding: '2px 5px',
                  border: '1px solid #ffff00'
                }}>
                  {obj.target}
                </div>
              </Html>
            </group>
          );
        }
        return null;
      })}
    </>
  );
}

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
      <Waypoints />
      <PlayerShip />

      {/* Three floating rings */}
      <Ring position={[0, 0, -50]} />
      <Ring position={[20, 10, -150]} />
      <Ring position={[-30, -20, -300]} />
    </group>
  );
}
