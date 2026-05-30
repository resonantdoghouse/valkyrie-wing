import { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useCombatStore, EnemyData } from '../../state/useCombatStore';
import { useMissionStore } from '../../state/useMissionStore';
import { Html, useGLTF } from '@react-three/drei';
import enemyShipUrl from '../../assets/models/enemy-ship.glb';
import { makeEngineGlowMaterial, makeExplosionMaterial } from './shaders';
import './flight.css';

// ─── Target Bracket — world-space corner brackets around the locked target ────
function TargetBracket() {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const bracketVerts = useMemo(() => {
    const s = 1;    // half-size of the square
    const a = 0.32; // arm length (fraction of s)
    return new Float32Array([
      // Top-left
      -s,  s, 0,  -s + a,  s, 0,
      -s,  s, 0,  -s,  s - a, 0,
      // Top-right
       s,  s, 0,   s - a,  s, 0,
       s,  s, 0,   s,  s - a, 0,
      // Bottom-left
      -s, -s, 0,  -s + a, -s, 0,
      -s, -s, 0,  -s, -s + a, 0,
      // Bottom-right
       s, -s, 0,   s - a, -s, 0,
       s, -s, 0,   s, -s + a, 0,
    ]);
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const { enemies, targetId } = useCombatStore.getState();
    const target = enemies.find(e => e.id === targetId && e.active);

    if (!target) { groupRef.current.visible = false; return; }
    groupRef.current.visible = true;

    groupRef.current.position.copy(target.position);
    groupRef.current.quaternion.copy(camera.quaternion);
    const dist = camera.position.distanceTo(target.position);
    groupRef.current.scale.setScalar(Math.max(5, dist * 0.1));
  });

  return (
    <group ref={groupRef} visible={false}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={16} array={bracketVerts} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#00ffcc" />
      </lineSegments>
    </group>
  );
}

export function Enemies() {
  const enemies = useCombatStore((state) => state.enemies);
  const updateEnemies = useCombatStore((state) => state.updateEnemies);
  const { camera } = useThree();
  const prevPos = useRef(new THREE.Vector3());
  const smoothVel = useRef(new THREE.Vector3());

  const activeMission = useMissionStore((state) => state.activeMission);
  const isArcade = activeMission?.id.startsWith('arcade_sim') ?? false;
  const waveComplete = isArcade && enemies.length > 0 && enemies.every((e) => !e.active);

  useEffect(() => {
    if (!waveComplete) return;
    const timer = setTimeout(() => {
      useMissionStore.getState().levelUpArcade();
      useCombatStore.getState().startArcadeWave(useMissionStore.getState().arcadeLevel);
    }, 2000);
    return () => clearTimeout(timer);
  }, [waveComplete]);

  useFrame((_state, delta) => {
    const raw = camera.position.clone().sub(prevPos.current).divideScalar(Math.max(delta, 0.001));
    if (raw.length() > 120) raw.normalize().multiplyScalar(120);
    smoothVel.current.lerp(raw, 0.25);
    prevPos.current.copy(camera.position);
    updateEnemies(delta, camera.position, smoothVel.current);
  });

  return (
    <group>
      {enemies.map(enemy => (
        enemy.active ? (
          <EnemyShip key={enemy.id} enemy={enemy} />
        ) : (
          <Explosion key={`exp_${enemy.id}`} position={enemy.position} />
        )
      ))}
      <TargetBracket />
    </group>
  );
}

function Explosion({ position }: { position: THREE.Vector3 }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [alive, setAlive] = useState(true);
  const elapsed = useRef(0);
  const mat = useMemo(() => makeExplosionMaterial(), []);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const dur = 1.8;
    const prog = Math.min(elapsed.current / dur, 1.0);
    mat.uniforms.uTime.value     = elapsed.current;
    mat.uniforms.uProgress.value = prog;
    mat.uniforms.uOpacity.value  = Math.max(0, 1.0 - prog);
    if (meshRef.current) meshRef.current.scale.setScalar(1 + prog * 22);
    if (elapsed.current >= dur) setAlive(false);
  });

  if (!alive) return null;

  return (
    <mesh ref={meshRef} position={position} material={mat}>
      <sphereGeometry args={[2, 16, 16]} />
    </mesh>
  );
}

function EnemyShip({ enemy }: { enemy: EnemyData }) {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(enemyShipUrl);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  const engineMat = useMemo(
    () => makeEngineGlowMaterial('#ffffff', '#ff0033'),
    []
  );

  useFrame((_, delta) => {
    if (meshRef.current && enemy.velocity.lengthSq() > 0.1) {
      const target = enemy.position.clone().add(enemy.velocity);
      meshRef.current.lookAt(target);
    }
    engineMat.uniforms.uTime.value += delta;
  });

  return (
    <group ref={meshRef} position={enemy.position}>
      {/* rotate model so it faces its travel direction correctly */}
      <primitive object={clonedScene} scale={5} rotation-y={Math.PI / 2} />
      <mesh position={[0, 0, -5]} material={engineMat}>
        <sphereGeometry args={[1.2, 16, 16]} />
      </mesh>
      <Html center position={[0, 8, 0]}>
        <div className="hud-label hud-label--enemy">
          [{enemy.health}%]
        </div>
      </Html>
    </group>
  );
}

useGLTF.preload(enemyShipUrl);
