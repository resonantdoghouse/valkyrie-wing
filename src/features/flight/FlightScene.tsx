import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PlayerShip } from './PlayerShip';
import { Lasers } from './Lasers';
import { Enemies } from './Enemies';
import { Mines } from './Mines';
import { useMissionStore } from '../../state/useMissionStore';
import { Html } from '@react-three/drei';
import { makeNebulaMaterial, makeSunSurfaceMaterial, makeSunCoronaMaterial } from './shaders';
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

const SUN_POSITION: [number, number, number] = [800, 200, -300];
const SUN_RADIUS = 80;

function Sun() {
  const surfaceMat  = useMemo(() => makeSunSurfaceMaterial(), []);
  const innerCorona = useMemo(() => makeSunCoronaMaterial(1.0), []);
  const outerCorona = useMemo(() => makeSunCoronaMaterial(0.35), []);

  useFrame((_, delta) => {
    surfaceMat.uniforms.uTime.value  += delta;
    innerCorona.uniforms.uTime.value += delta;
    outerCorona.uniforms.uTime.value += delta;
  });

  return (
    <>
      <group position={SUN_POSITION}>
        {/* Sun surface with limb darkening + granulation */}
        <mesh material={surfaceMat}>
          <sphereGeometry args={[SUN_RADIUS, 64, 64]} />
        </mesh>

        {/* Chromosphere / inner corona edge glow */}
        <mesh material={innerCorona}>
          <sphereGeometry args={[SUN_RADIUS * 1.55, 32, 32]} />
        </mesh>

        {/* Outer diffuse corona halo */}
        <mesh material={outerCorona}>
          <sphereGeometry args={[SUN_RADIUS * 3.2, 16, 16]} />
        </mesh>
      </group>

      {/* Directional light from sun position toward scene origin */}
      <directionalLight
        position={SUN_POSITION}
        color="#ffd580"
        intensity={2.5}
      />
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
      {/* Dim space ambient — keeps ship silhouettes readable in shadow */}
      <ambientLight intensity={0.12} color="#1a2233" />

      <Sun />
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
