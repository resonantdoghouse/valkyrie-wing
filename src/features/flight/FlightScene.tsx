import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useControls } from 'leva';
import { PlayerShip } from './PlayerShip';
import { Lasers } from './Lasers';
import { Enemies } from './Enemies';
import { Mines } from './Mines';
import { Asteroids } from './Asteroids';
import { Sun } from './Sun';
import { useMissionStore } from '../../state/useMissionStore';
import { useDebugStore } from '../../debug/useDebugStore';
import { Html } from '@react-three/drei';
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

function Starfield() {
  const starsRef = useRef<THREE.Points>(null);
  const count = 2000;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 1000;
    }
    return arr;
  }, []);

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
  const showLightHelpers = useDebugStore(state => state.showLightHelpers);

  // ── Ambient Light Controls ──────────────────────────────────────────────────
  const { ambientIntensity, ambientColor } = useControls(
    'Flight / Ambient Light',
    {
      ambientIntensity: { value: 1.4, min: 0, max: 8, step: 0.05, label: 'Intensity' },
      ambientColor: { value: '#99aabb', label: 'Color' },
    },
    { collapsed: true }
  );

  // ── Hemisphere Light Controls ───────────────────────────────────────────────
  const { hemiIntensity, skyColor, groundColor } = useControls(
    'Flight / Hemisphere Light',
    {
      hemiIntensity: { value: 1.2, min: 0, max: 8, step: 0.05, label: 'Intensity' },
      skyColor: { value: '#334466', label: 'Sky Color' },
      groundColor: { value: '#442233', label: 'Ground Color' },
    },
    { collapsed: true }
  );

  return (
    <group>
      <ambientLight intensity={ambientIntensity} color={ambientColor} />
      <hemisphereLight color={skyColor} groundColor={groundColor} intensity={hemiIntensity} />

      <Sun />

      {/* Light debug helpers */}
      {showLightHelpers && (
        <>
          {/* Sky color sphere — top of scene */}
          <mesh position={[0, 80, 0]}>
            <sphereGeometry args={[6, 8, 8]} />
            <meshBasicMaterial color={skyColor} />
          </mesh>
          {/* Ground color sphere — bottom of scene */}
          <mesh position={[0, -80, 0]}>
            <sphereGeometry args={[6, 8, 8]} />
            <meshBasicMaterial color={groundColor} />
          </mesh>
          {/* Ambient fill sphere at origin */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[4, 8, 8]} />
            <meshBasicMaterial color={ambientColor} wireframe />
          </mesh>
          {/* World axes reference */}
          <axesHelper args={[60]} />
        </>
      )}

      <Starfield />
      <Enemies />
      <Lasers />
      <Waypoints />
      <PlayerShip />
      <Mines />
      <Asteroids />
    </group>
  );
}
