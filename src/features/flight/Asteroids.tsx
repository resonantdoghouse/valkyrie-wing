import { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useGameStore } from '../../state/useGameStore';
import { useCombatStore, AsteroidData } from '../../state/useCombatStore';
import asteroidUrl from '../../assets/models/low-poly-asteroid.glb';
import { makeExplosionMaterial } from './shaders';

const dummy = new THREE.Object3D();

function AsteroidExplosion({ position, scale }: { position: THREE.Vector3; scale: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [alive, setAlive] = useState(true);
  const elapsed = useRef(0);
  const mat = useMemo(() => makeExplosionMaterial(), []);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const dur = 1.4;
    const prog = Math.min(elapsed.current / dur, 1.0);
    mat.uniforms.uTime.value     = elapsed.current;
    mat.uniforms.uProgress.value = prog;
    mat.uniforms.uOpacity.value  = Math.max(0, 1.0 - prog);
    if (meshRef.current) meshRef.current.scale.setScalar((1 + prog * 12) * scale);
    if (elapsed.current >= dur) setAlive(false);
  });

  if (!alive) return null;

  return (
    <mesh ref={meshRef} position={position} material={mat}>
      <sphereGeometry args={[1.5, 16, 16]} />
    </mesh>
  );
}

export function Asteroids() {
  const storeAsteroids = useCombatStore(state => state.asteroids);
  const initAsteroids  = useCombatStore(state => state.initAsteroids);
  const { camera } = useThree();

  const { scene } = useGLTF(asteroidUrl);

  const { geometry, material } = useMemo(() => {
    let geo: THREE.BufferGeometry | undefined;
    let mat: THREE.Material | THREE.Material[] | undefined;
    scene.traverse(child => {
      if (!geo && (child as THREE.Mesh).isMesh) {
        geo = (child as THREE.Mesh).geometry;
        mat = (child as THREE.Mesh).material;
      }
    });
    return { geometry: geo, material: Array.isArray(mat) ? mat[0] : mat };
  }, [scene]);

  const initialAsteroids = useMemo<AsteroidData[]>(() => {
    const count = 15 + Math.floor(Math.random() * 11);
    return Array.from({ length: count }).map((_, i) => ({
      id: `asteroid_${i}`,
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 600,
        (Math.random() - 0.5) * 300,
        -50 - Math.random() * 700,
      ),
      scale: 0.5 + Math.random() * 4.0,
      active: true,
    }));
  }, []);

  useEffect(() => {
    initAsteroids(initialAsteroids);
    return () => initAsteroids([]);
  }, [initAsteroids, initialAsteroids]);

  const instancedRef = useRef<THREE.InstancedMesh>(null);

  // Per-instance rotation angles and speeds — purely visual, not in store
  const rotAngles = useRef<{ x: number; y: number; z: number }[]>([]);
  const rotSpeeds = useRef<{ x: number; y: number; z: number }[]>([]);

  useEffect(() => {
    rotAngles.current = initialAsteroids.map(() => ({ x: 0, y: 0, z: 0 }));
    rotSpeeds.current = initialAsteroids.map(() => ({
      x: (Math.random() - 0.5) * 0.5,
      y: (Math.random() - 0.5) * 0.5,
      z: (Math.random() - 0.5) * 0.3,
    }));
  }, [initialAsteroids]);

  const detonatedIds = useRef<Set<string>>(new Set());

  useFrame((_, delta) => {
    if (!instancedRef.current || storeAsteroids.length === 0) return;

    const enemies = useCombatStore.getState().enemies;

    for (let i = 0; i < storeAsteroids.length; i++) {
      const asteroid = storeAsteroids[i];

      if (!asteroid.active) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        instancedRef.current.setMatrixAt(i, dummy.matrix);
        continue;
      }

      const rot = rotAngles.current[i];
      const spd = rotSpeeds.current[i];
      if (rot) {
        rot.x += spd.x * delta;
        rot.y += spd.y * delta;
        rot.z += spd.z * delta;
        dummy.rotation.set(rot.x, rot.y, rot.z);
      }

      dummy.position.copy(asteroid.position);
      dummy.scale.setScalar(asteroid.scale);
      dummy.updateMatrix();
      instancedRef.current.setMatrixAt(i, dummy.matrix);

      if (detonatedIds.current.has(asteroid.id)) continue;

      const collisionRadiusSq = (5 * asteroid.scale) ** 2;

      if (camera.position.distanceToSquared(asteroid.position) < collisionRadiusSq) {
        detonatedIds.current.add(asteroid.id);
        useGameStore.getState().takeDamage('front', 10);
        useCombatStore.getState().hitAsteroid(asteroid.id);
        continue;
      }

      for (const enemy of enemies) {
        if (enemy.active && enemy.position.distanceToSquared(asteroid.position) < collisionRadiusSq) {
          detonatedIds.current.add(asteroid.id);
          useCombatStore.getState().hitEnemy(enemy.id, 10);
          useCombatStore.getState().hitAsteroid(asteroid.id);
          break;
        }
      }
    }

    instancedRef.current.instanceMatrix.needsUpdate = true;
  });

  const shownExplosions = useRef<Set<string>>(new Set());
  const [detonated, setDetonated] = useState<AsteroidData[]>([]);

  useEffect(() => {
    const newOnes = storeAsteroids.filter(
      a => !a.active && !shownExplosions.current.has(a.id)
    );
    if (newOnes.length > 0) {
      newOnes.forEach(a => shownExplosions.current.add(a.id));
      setDetonated(prev => [...prev, ...newOnes]);
    }
  }, [storeAsteroids]);

  const maxCount = initialAsteroids.length;

  if (!geometry || !material) return null;

  return (
    <group>
      <instancedMesh
        ref={instancedRef}
        args={[geometry, material, maxCount]}
        frustumCulled={false}
      />
      {detonated.map(asteroid => (
        <AsteroidExplosion
          key={`exp_${asteroid.id}`}
          position={asteroid.position}
          scale={asteroid.scale}
        />
      ))}
    </group>
  );
}

useGLTF.preload(asteroidUrl);
