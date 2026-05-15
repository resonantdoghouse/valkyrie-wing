import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PlayerShip } from './PlayerShip';
import { Lasers } from './Lasers';
import { Enemies } from './Enemies';
import { Mines } from './Mines';
import { useMissionStore } from '../../state/useMissionStore';
import { Html } from '@react-three/drei';
import { makeNebulaMaterial } from './shaders';
import './flight.css';

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
                <div className="hud-label hud-label--waypoint">
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

function Nebula() {
  const mat = useMemo(() => makeNebulaMaterial(), []);
  useFrame((_, delta) => { mat.uniforms.uTime.value += delta; });
  return (
    <mesh material={mat}>
      <sphereGeometry args={[900, 64, 64]} />
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
      <ambientLight intensity={0.8} color="#ffffff" />
      <directionalLight position={[100, 100, 50]} intensity={2.5} color="#ffeedd" />
      <directionalLight position={[-100, -50, -50]} intensity={1.5} color="#aaddff" />
      
      <Nebula />
      <Starfield />
      <Enemies />
      <Lasers />
      <Waypoints />
      <PlayerShip />
      <Mines />
    </group>
  );
}
