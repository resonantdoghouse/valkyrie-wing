import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useCombatStore, EnemyData } from '../../state/useCombatStore';
import { Html, useGLTF } from '@react-three/drei';
import enemyShipUrl from '../../assets/models/enemy-ship.glb';
import { makeEngineGlowMaterial, makeExplosionMaterial } from './shaders';
import './flight.css';

export function Enemies() {
  const enemies = useCombatStore((state) => state.enemies);
  const updateEnemies = useCombatStore((state) => state.updateEnemies);
  const { camera } = useThree();

  useFrame((_state, delta) => {
    updateEnemies(delta, camera.position);
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
