import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { usePlayerControls } from '../../hooks/usePlayerControls';
import { CockpitHUD } from './CockpitHUD';
import { useCombatStore } from '../../state/useCombatStore';
import { useMissionStore } from '../../state/useMissionStore';

const MAX_SPEED = 40;
const TURN_SPEED = 1.5;
const FIRE_RATE = 0.15; // Seconds between shots

export function PlayerShip() {
  const meshRef = useRef<THREE.Group>(null);
  const controls = usePlayerControls();
  const fireLaser = useCombatStore(state => state.fireLaser);
  
  // Persistent physics state
  const velocity = useRef(new THREE.Vector3());
  const throttle = useRef(0); // 0 to 1
  const lastFireTime = useRef(0);
  const { camera } = useThree();
  
  // Temporary vectors for math
  const direction = new THREE.Vector3();

  const targetVelocity = new THREE.Vector3();
  
  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    // 1. Handle Rotation (Pitch, Yaw, Roll)
    if (controls.pitchUp) meshRef.current.rotateX(TURN_SPEED * delta);
    if (controls.pitchDown) meshRef.current.rotateX(-TURN_SPEED * delta);
    
    if (controls.yawLeft) meshRef.current.rotateY(TURN_SPEED * delta);
    if (controls.yawRight) meshRef.current.rotateY(-TURN_SPEED * delta);
    
    if (controls.rollLeft) meshRef.current.rotateZ(TURN_SPEED * 1.5 * delta);
    if (controls.rollRight) meshRef.current.rotateZ(-TURN_SPEED * 1.5 * delta);

    // 2. Handle Throttle
    if (controls.throttleUp) {
      throttle.current = Math.min(throttle.current + delta * 0.5, 1);
    } 
    if (controls.throttleDown) {
      throttle.current = Math.max(throttle.current - delta * 0.5, 0);
    }

    // In Three.js, forward is typically -Z. getWorldDirection gives +Z, so we negate it to get the forward vector.
    meshRef.current.getWorldDirection(direction);
    direction.negate();
    
    // Calculate target velocity based on throttle and direction
    targetVelocity.copy(direction).multiplyScalar(MAX_SPEED * throttle.current);
    
    // Smoothly interpolate current velocity to target velocity (acts as inertia/acceleration)
    velocity.current.lerp(targetVelocity, delta * 2);

    // 3. Update Position based on momentum
    meshRef.current.position.addScaledVector(velocity.current, delta);

    // 4. Handle Firing
    if (controls.fire && _state.clock.elapsedTime - lastFireTime.current > FIRE_RATE) {
      fireLaser(meshRef.current.position, direction, velocity.current);
      lastFireTime.current = _state.clock.elapsedTime;
    }

    // 5. Target Lock Logic
    const enemies = useCombatStore.getState().enemies;
    const setTarget = useCombatStore.getState().setTarget;
    const currentTarget = useCombatStore.getState().targetId;
    
    let bestTarget = null;
    let bestScore = -1;
    const shipPos = meshRef.current.position;
    
    enemies.forEach(enemy => {
      if (!enemy.active) return;
      const toEnemy = enemy.position.clone().sub(shipPos);
      const dist = toEnemy.length();
      if (dist > 500) return; // Max radar range
      
      toEnemy.normalize();
      const dot = direction.dot(toEnemy);
      if (dot > 0.95) { // Within aiming cone
        const score = dot / dist;
        if (score > bestScore) {
          bestScore = score;
          bestTarget = enemy.id;
        }
      }
    });

    if (currentTarget !== bestTarget) {
      setTarget(bestTarget);
    }

    // 6. Mission Objective Checking (Waypoints)
    const activeMission = useMissionStore.getState().activeMission;
    if (activeMission) {
      activeMission.objectives.forEach(obj => {
        if (!obj.completed && obj.type === 'NAV' && obj.position) {
          const waypointPos = new THREE.Vector3(...obj.position);
          if (shipPos.distanceTo(waypointPos) < 50) { // 50 units arrival radius
            useMissionStore.getState().updateObjective(obj.id, 1);
          }
        }
      });
    }

    // 7. Update Camera to Follow Ship (First Person Cockpit View)
    // Position camera inside the ship slightly above and slightly back so the dashboard is visible
    const cameraOffset = new THREE.Vector3(0, 0.4, 0.5);
    const shipPosition = meshRef.current.position.clone();
    const shipRotation = meshRef.current.quaternion.clone();
    
    cameraOffset.applyQuaternion(shipRotation);
    camera.position.lerp(shipPosition.clone().add(cameraOffset), 0.5); // Faster lerp for tighter 1st person feel
    
    // Look ahead of the ship
    const lookAtTarget = shipPosition.clone().add(direction.clone().multiplyScalar(10));
    camera.lookAt(lookAtTarget);
    
    // Maintain roll
    const localUp = new THREE.Vector3(0, 1, 0);
    localUp.applyQuaternion(shipRotation);
    camera.up.copy(localUp);
  });

  return (
    <group ref={meshRef}>
      {/* Basic Ship Placeholder - A wedge shape (Only visible if looking back/outside, but we keep it for geometry) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} visible={false}>
        <coneGeometry args={[0.5, 2, 3]} />
        <meshStandardMaterial color="#00ffcc" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 1]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#ff5500" transparent opacity={throttle.current > 0.1 ? 0.8 : 0.2} />
      </mesh>

      {/* Headlights */}
      <spotLight 
        position={[0, 0, 0]} 
        angle={0.6} 
        penumbra={0.5} 
        intensity={200} 
        distance={200} 
        color="#ffffff" 
      >
        <object3D position={[0, 0, -10]} attach="target" />
      </spotLight>

      {/* Targeting Reticle (Holographic Laser Sight) */}
      <mesh position={[0, 0.4, -30]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.02, 16, 32]} />
        <meshBasicMaterial color="#00ffcc" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 0.4, -30]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#ff3366" transparent opacity={0.8} />
      </mesh>

      {/* Mount the 3D Cockpit HUD inside the ship */}
      <CockpitHUD throttle={throttle} shipRef={meshRef} />
    </group>
  );
}
