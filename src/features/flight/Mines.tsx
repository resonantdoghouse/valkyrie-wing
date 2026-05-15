import { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useGameStore } from '../../state/useGameStore';
import { useCombatStore, MineData } from '../../state/useCombatStore';
import mineUrl from '../../assets/models/mine.glb';
import { makeExplosionMaterial } from './shaders';

function MineExplosion({ position }: { position: THREE.Vector3 }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [alive, setAlive] = useState(true);
  const elapsed = useRef(0);
  const mat = useMemo(() => makeExplosionMaterial(), []);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const dur = 1.2;
    const prog = Math.min(elapsed.current / dur, 1.0);
    mat.uniforms.uTime.value     = elapsed.current;
    mat.uniforms.uProgress.value = prog;
    mat.uniforms.uOpacity.value  = Math.max(0, 1.0 - prog);
    if (meshRef.current) meshRef.current.scale.setScalar(1 + prog * 14);
    if (elapsed.current >= dur) setAlive(false);
  });

  if (!alive) return null;

  return (
    <mesh ref={meshRef} position={position} material={mat}>
      <sphereGeometry args={[1.5, 28, 28]} />
    </mesh>
  );
}

function Mine({ data }: { data: MineData }) {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(mineUrl);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const { camera } = useThree();
  const detonated = useRef(false);

  useFrame((_state, delta) => {
    if (!meshRef.current || detonated.current) return;

    meshRef.current.rotation.y += delta * 0.6;
    meshRef.current.rotation.x += delta * 0.3;

    // Player ship collision
    if (camera.position.distanceToSquared(data.position) < 100) {
      detonated.current = true;
      useGameStore.getState().takeDamage('front', 10);
      useCombatStore.getState().hitMine(data.id);
      return;
    }

    // Enemy ship collision
    const enemies = useCombatStore.getState().enemies;
    for (const enemy of enemies) {
      if (enemy.active && enemy.position.distanceToSquared(data.position) < 64) {
        detonated.current = true;
        useCombatStore.getState().hitEnemy(enemy.id, 10);
        useCombatStore.getState().hitMine(data.id);
        return;
      }
    }
  });

  return (
    <group ref={meshRef} position={data.position}>
      <primitive object={clonedScene} scale={2.5} />
    </group>
  );
}

export function Mines() {
  const storeMines = useCombatStore(state => state.mines);
  const initMines  = useCombatStore(state => state.initMines);

  // Generate positions once; push them into the store
  const initialMines = useMemo<MineData[]>(() => {
    const count = 6 + Math.floor(Math.random() * 5);
    return Array.from({ length: count }).map((_, i) => ({
      id: `mine_${i}`,
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 200,
        -60 - Math.random() * 440
      ),
      active: true,
    }));
  }, []);

  useEffect(() => {
    initMines(initialMines);
    return () => initMines([]);
  }, [initMines, initialMines]);

  // Track which detonated mines have already triggered an explosion visual
  const shownExplosions = useRef<Set<string>>(new Set());
  const [detonated, setDetonated] = useState<MineData[]>([]);

  useEffect(() => {
    const newOnes = storeMines.filter(
      m => !m.active && !shownExplosions.current.has(m.id)
    );
    if (newOnes.length > 0) {
      newOnes.forEach(m => shownExplosions.current.add(m.id));
      setDetonated(prev => [...prev, ...newOnes]);
    }
  }, [storeMines]);

  return (
    <group>
      {storeMines.filter(m => m.active).map(mine => (
        <Mine key={mine.id} data={mine} />
      ))}
      {detonated.map(mine => (
        <MineExplosion key={`exp_${mine.id}`} position={mine.position} />
      ))}
    </group>
  );
}

useGLTF.preload(mineUrl);
