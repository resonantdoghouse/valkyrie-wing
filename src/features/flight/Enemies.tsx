import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useCombatStore, EnemyData } from '../../state/useCombatStore';
import { Html, useGLTF } from '@react-three/drei';
import enemyShipUrl from '../../assets/models/enemy-ship.glb';

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
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);
  
  useFrame((_state, delta) => {
    setScale(s => s + delta * 20);
    setOpacity(o => Math.max(0, o - delta * 2));
  });

  if (opacity <= 0) return null;

  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[2, 16, 16]} />
      <meshBasicMaterial color="#ffaa00" transparent opacity={opacity} wireframe />
    </mesh>
  );
}

function EnemyShip({ enemy }: { enemy: EnemyData }) {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(enemyShipUrl);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  useFrame(() => {
    if (meshRef.current && enemy.velocity.lengthSq() > 0.1) {
      const target = enemy.position.clone().add(enemy.velocity);
      meshRef.current.lookAt(target);
    }
  });

  return (
    <group ref={meshRef} position={enemy.position}>
      <primitive object={clonedScene} scale={5} />
      {/* Engine glow - might need adjustment based on the new model's scale/origin */}
      <mesh position={[0, 0, -5]}>
        <sphereGeometry args={[1]} />
        <meshBasicMaterial color="#ff3366" transparent opacity={0.8} />
      </mesh>
      {/* Target Marker UI */}
      <Html center position={[0, 8, 0]}>
        <div style={{
          color: '#ff3366',
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '1rem',
          border: '1px solid #ff3366',
          padding: '2px 5px',
          background: 'rgba(255, 0, 0, 0.2)'
        }}>
          [{enemy.health}%]
        </div>
      </Html>
    </group>
  );
}

useGLTF.preload(enemyShipUrl);
