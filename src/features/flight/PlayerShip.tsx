import { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { usePlayerControls } from '../../hooks/usePlayerControls';
import { CockpitHUD } from './CockpitHUD';
import { useCombatStore } from '../../state/useCombatStore';
import { useMissionStore } from '../../state/useMissionStore';
import { useGameStore } from '../../state/useGameStore';
import { useGLTF } from '@react-three/drei';
import playerShipUrl from '../../assets/models/player-ship.glb';
import { makeEngineGlowMaterial } from './shaders';

const MAX_SPEED = 40;
const TURN_SPEED = 1.5;
const FIRE_RATE = 0.15; // Seconds between shots

export function PlayerShip() {
  const meshRef = useRef<THREE.Group>(null);
  const controls = usePlayerControls();
  const fireLaser = useCombatStore(state => state.fireLaser);

  // Persistent physics state
  const velocity = useRef(new THREE.Vector3());
  const throttle = useRef(0.5); // 0 to 1
  const lastFireTime = useRef(0);
  const { camera } = useThree();

  // Camera mode: cockpit (first-person) or thirdPerson
  const [is3rdPerson, setIs3rdPerson] = useState(false);
  const is3rdPersonRef = useRef(false);

  const { scene: shipModel } = useGLTF(playerShipUrl);
  const clonedShipScene = useMemo(() => shipModel.clone(), [shipModel]);
  const engineMat = useMemo(() => makeEngineGlowMaterial('#ffffff', '#ff5500'), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyV') {
        setIs3rdPerson(prev => {
          const next = !prev;
          is3rdPersonRef.current = next;
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  
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
    const activeMaxSpeed = controls.boost ? MAX_SPEED * 2.5 : MAX_SPEED;
    targetVelocity.copy(direction).multiplyScalar(activeMaxSpeed * throttle.current);
    
    // Smoothly interpolate current velocity to target velocity (acts as inertia/acceleration)
    velocity.current.lerp(targetVelocity, delta * 2);

    // 3. Update Position based on momentum
    meshRef.current.position.addScaledVector(velocity.current, delta);

    // Recharge shields
    useGameStore.getState().rechargeShields(delta);

    // Engine glow shader
    engineMat.uniforms.uTime.value += delta;
    engineMat.uniforms.uIntensity.value = throttle.current > 0.1 ? 1.0 : 0.15;

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

    // 7. Update Camera
    const shipPosition = meshRef.current.position.clone();
    const shipRotation = meshRef.current.quaternion.clone();
    const localUp = new THREE.Vector3(0, 1, 0).applyQuaternion(shipRotation);
    camera.up.copy(localUp);

    if (is3rdPersonRef.current) {
      // Third-person: smooth follow behind and above the ship
      const offset = new THREE.Vector3(0, 5, 18).applyQuaternion(shipRotation);
      const desiredPos = shipPosition.clone().add(offset);
      camera.position.lerp(desiredPos, delta * 8);
      const lookTarget = shipPosition.clone().add(direction.clone().multiplyScalar(8));
      camera.lookAt(lookTarget);
    } else {
      // Cockpit: camera positioned inside ship, looking forward
      const cameraOffset = new THREE.Vector3(0, 0.4, 0.5).applyQuaternion(shipRotation);
      camera.position.copy(shipPosition.clone().add(cameraOffset));
      const lookAtTarget = shipPosition.clone().add(direction.clone().multiplyScalar(10));
      camera.lookAt(lookAtTarget);
    }
  });

  return (
    <group ref={meshRef}>
      {/* GLB model — only visible in third-person mode */}
      <primitive object={clonedShipScene} scale={3} rotation-y={Math.PI / 2} visible={is3rdPerson} />

      {/* Engine glow */}
      <mesh position={[0, 0, 1]} material={engineMat}>
        <sphereGeometry args={[0.5, 16, 16]} />
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

      {/* Cockpit-only elements */}
      {!is3rdPerson && (
        <>
          {/* Targeting Reticle */}
          <mesh position={[0, 0.4, -30]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.5, 0.02, 16, 32]} />
            <meshBasicMaterial color="#00ffcc" transparent opacity={0.3} />
          </mesh>
          <mesh position={[0, 0.4, -30]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#ff3366" transparent opacity={0.8} />
          </mesh>

          <CockpitHUD throttle={throttle} shipRef={meshRef} />
        </>
      )}
    </group>
  );
}

useGLTF.preload(playerShipUrl);
