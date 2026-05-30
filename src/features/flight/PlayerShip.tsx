import { useRef, useState, useEffect, useMemo, RefObject, MutableRefObject } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import { Html, useGLTF } from '@react-three/drei';
import { usePlayerControls } from '../../hooks/usePlayerControls';
import { CockpitHUD } from './CockpitHUD';
import { useCombatStore } from '../../state/useCombatStore';
import { useMissionStore } from '../../state/useMissionStore';
import { useGameStore } from '../../state/useGameStore';
import { useDebugStore } from '../../debug/useDebugStore';
import playerShipUrl from '../../assets/models/player-ship.glb';
import { makeEngineGlowMaterial } from './shaders';

const BASE_MAX_SPEED = 40;
const BASE_TURN_SPEED = 1.5;
const FIRE_RATE = 0.15;
const BOUNDARY_WARN = 700;
const AUTO_TURN_DELAY = 5;

function TargetingReticle() {
  const spokesGeo = useMemo(() => {
    const r = 0.68;
    const gap = 0.2;
    const verts = new Float32Array([
       0,  r,  0,   0,  gap, 0,
       0, -r,  0,   0, -gap, 0,
       r,  0,  0,   gap, 0,  0,
      -r,  0,  0,  -gap, 0,  0,
    ]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    return geo;
  }, []);

  return (
    <group position={[0, 0, -30]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.013, 6, 64]} />
        <meshBasicMaterial color="#ff2200" transparent opacity={0.9} />
      </mesh>
      <lineSegments geometry={spokesGeo}>
        <lineBasicMaterial color="#ff2200" transparent opacity={0.65} />
      </lineSegments>
      <mesh>
        <circleGeometry args={[0.045, 8]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={1.0} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── Lead Indicator — world-space predictive targeting pip ───────────────────
const LEAD_LASER_SPEED = 100; // must match LASER_SPEED in useCombatStore

function LeadIndicator() {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const tickVerts = useMemo(() => new Float32Array([
    // N tick
     0,  1.35, 0,   0,  1.65, 0,
    // S tick
     0, -1.35, 0,   0, -1.65, 0,
    // E tick
     1.35, 0,  0,   1.65, 0,  0,
    // W tick
    -1.35, 0,  0,  -1.65, 0,  0,
  ]), []);

  useFrame(() => {
    if (!groupRef.current) return;
    const { enemies, targetId } = useCombatStore.getState();
    const target = enemies.find(e => e.id === targetId && e.active);

    if (!target) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;

    // Iterative lead: two passes converges well within typical engagement ranges
    const dist1 = camera.position.distanceTo(target.position);
    const lead = target.position.clone().addScaledVector(target.velocity, dist1 / LEAD_LASER_SPEED);
    const dist2 = camera.position.distanceTo(lead);
    lead.copy(target.position).addScaledVector(target.velocity, dist2 / LEAD_LASER_SPEED);

    groupRef.current.position.copy(lead);
    // Billboard toward camera so the ring always faces the player
    groupRef.current.quaternion.copy(camera.quaternion);
    // Scale proportionally so visual size stays consistent at all ranges
    groupRef.current.scale.setScalar(Math.max(0.3, dist2 * 0.016));
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh>
        <torusGeometry args={[1, 0.05, 6, 48]} />
        <meshBasicMaterial color="#ff8800" />
      </mesh>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={8} array={tickVerts} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#ff8800" transparent opacity={0.85} />
      </lineSegments>
    </group>
  );
}

// ─── Direction Arrows (lives inside ship group → local-space transforms) ──────
function DirectionArrows({
  meshRef,
  velocityRef,
}: {
  meshRef: RefObject<THREE.Group>;
  velocityRef: MutableRefObject<THREE.Vector3>;
}) {
  const forwardArrow = useMemo(
    () => new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(), 18, 0x00ffcc, 4, 2),
    []
  );
  const upArrow = useMemo(
    () => new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 10, 0x4488ff, 2.5, 1.2),
    []
  );
  const velocityArrow = useMemo(
    () => new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(), 12, 0xff8800, 3, 1.5),
    []
  );

  const _invQuat = useMemo(() => new THREE.Quaternion(), []);
  const _localVel = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!meshRef.current) return;
    const speed = velocityRef.current.length();
    if (speed > 0.1) {
      _invQuat.copy(meshRef.current.quaternion).invert();
      _localVel.copy(velocityRef.current).applyQuaternion(_invQuat).normalize();
      velocityArrow.setDirection(_localVel);
      velocityArrow.setLength(Math.min(speed * 0.45, 28), 3, 1.5);
    }
  });

  return (
    <>
      <primitive object={forwardArrow} />
      <primitive object={upArrow} />
      <primitive object={velocityArrow} />
    </>
  );
}

// ─── Camera Info Label (Html, updated every 6 frames) ─────────────────────────
function CameraInfoLabel() {
  const { camera } = useThree();
  const [info, setInfo] = useState('');
  const tick = useRef(0);

  useFrame(() => {
    tick.current++;
    if (tick.current % 6 !== 0) return;
    const p = camera.position;
    const fov = (camera as THREE.PerspectiveCamera).fov ?? 0;
    setInfo(
      `CAM  ${p.x.toFixed(0)}, ${p.y.toFixed(0)}, ${p.z.toFixed(0)}\nFOV  ${fov.toFixed(0)}°`
    );
  });

  return (
    <pre className="debug-camera-info">{info}</pre>
  );
}

export function PlayerShip() {
  const meshRef = useRef<THREE.Group>(null);
  const controls = usePlayerControls();
  const fireLaser = useCombatStore(state => state.fireLaser);
  const showDirections = useDebugStore(state => state.showDirections);
  const showCameraInfo = useDebugStore(state => state.showCameraInfo);

  const velocity = useRef(new THREE.Vector3());
  const throttle = useRef(0.5);
  const lastFireTime = useRef(0);
  const { camera } = useThree();

  const [is3rdPerson, setIs3rdPerson] = useState(false);
  const is3rdPersonRef = useRef(false);

  const { scene: shipModel } = useGLTF(playerShipUrl);
  const clonedShipScene = useMemo(() => shipModel.clone(), [shipModel]);
  const engineMat = useMemo(() => makeEngineGlowMaterial('#ffffff', '#ff5500'), []);

  // ── Leva: Ship & Camera ───────────────────────────────────────────────────────
  const { fov, maxSpeedMult, turnSpeedMult } = useControls(
    'Ship & Camera',
    {
      fov: { value: 75, min: 30, max: 120, step: 1, label: 'FOV' },
      maxSpeedMult: { value: 1.0, min: 0.1, max: 5.0, step: 0.1, label: 'Max Speed ×' },
      turnSpeedMult: { value: 1.0, min: 0.1, max: 3.0, step: 0.1, label: 'Turn Speed ×' },
    },
    { collapsed: true }
  );

  // Apply FOV changes
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = fov;
    cam.updateProjectionMatrix();
  }, [fov, camera]);


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

  const direction = useRef(new THREE.Vector3()).current;
  const targetVelocity = useRef(new THREE.Vector3()).current;
  const _camOffset = useRef(new THREE.Vector3()).current;
  const _lookTarget = useRef(new THREE.Vector3()).current;
  const _localUp = useRef(new THREE.Vector3()).current;
  const _waypointPos = useRef(new THREE.Vector3()).current;
  const _leadPos = useRef(new THREE.Vector3()).current;

  const prevCycleTarget = useRef(false);
  const warningTimer = useRef(0);
  const boundaryPhaseRef = useRef<'none' | 'warning' | 'turning'>('none');
  const _autoTurnMat = useMemo(() => new THREE.Matrix4(), []);
  const _autoTurnQuat = useMemo(() => new THREE.Quaternion(), []);
  const _autoTurnUp = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const _origin = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  const MAX_SPEED = BASE_MAX_SPEED * maxSpeedMult;
  const TURN_SPEED = BASE_TURN_SPEED * turnSpeedMult;

  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    const c = controls.current;

    if (boundaryPhaseRef.current !== 'turning') {
      if (c.pitchUp)   meshRef.current.rotateX( TURN_SPEED * delta);
      if (c.pitchDown) meshRef.current.rotateX(-TURN_SPEED * delta);
      if (c.yawLeft)   meshRef.current.rotateY( TURN_SPEED * delta);
      if (c.yawRight)  meshRef.current.rotateY(-TURN_SPEED * delta);
      if (c.rollLeft)  meshRef.current.rotateZ( TURN_SPEED * 1.5 * delta);
      if (c.rollRight) meshRef.current.rotateZ(-TURN_SPEED * 1.5 * delta);
    }

    if (c.throttleUp)   throttle.current = Math.min(throttle.current + delta * 0.5, 1);
    if (c.throttleDown) throttle.current = Math.max(throttle.current - delta * 0.5, 0);

    meshRef.current.getWorldDirection(direction);
    direction.negate();

    const activeMaxSpeed = c.boost ? MAX_SPEED * 2.5 : MAX_SPEED;
    targetVelocity.copy(direction).multiplyScalar(activeMaxSpeed * throttle.current);
    velocity.current.lerp(targetVelocity, delta * 2);
    meshRef.current.position.addScaledVector(velocity.current, delta);

    useGameStore.getState().rechargeShields(delta);

    engineMat.uniforms.uTime.value += delta;
    engineMat.uniforms.uIntensity.value = throttle.current > 0.1 ? 1.0 : 0.15;

    const { enemies, targetId, setTarget } = useCombatStore.getState();
    const shipPos = meshRef.current.position;

    if (c.fire && _state.clock.elapsedTime - lastFireTime.current > FIRE_RATE) {
      // When a target is locked, fire toward the lead pip position
      let fireDir = direction;
      const lockedTarget = enemies.find(e => e.id === targetId && e.active);
      if (lockedTarget) {
        const d1 = shipPos.distanceTo(lockedTarget.position);
        _leadPos.copy(lockedTarget.position).addScaledVector(lockedTarget.velocity, d1 / LEAD_LASER_SPEED);
        const d2 = shipPos.distanceTo(_leadPos);
        _leadPos.copy(lockedTarget.position).addScaledVector(lockedTarget.velocity, d2 / LEAD_LASER_SPEED);
        fireDir = _leadPos.sub(shipPos).normalize();
      }
      fireLaser(meshRef.current.position, fireDir, velocity.current);
      lastFireTime.current = _state.clock.elapsedTime;
    }

    // Clear target if the locked enemy was destroyed
    if (targetId && !enemies.find(e => e.id === targetId && e.active)) {
      setTarget(null);
    }

    // T key — cycle to next active enemy (edge-detect so one press = one step)
    if (c.cycleTarget && !prevCycleTarget.current) {
      const active = enemies.filter(e => e.active);
      if (active.length > 0) {
        const idx = active.findIndex(e => e.id === targetId);
        setTarget(active[(idx + 1) % active.length].id);
      }
    }
    prevCycleTarget.current = c.cycleTarget;

    const activeMission = useMissionStore.getState().activeMission;
    if (activeMission) {
      activeMission.objectives.forEach(obj => {
        if (!obj.completed && obj.type === 'NAV' && obj.position) {
          _waypointPos.set(...obj.position);
          if (shipPos.distanceTo(_waypointPos) < 50) {
            useMissionStore.getState().updateObjective(obj.id, 1);
          }
        }
      });
    }

    // Boundary warning and auto-return
    const distFromOrigin = meshRef.current.position.length();
    if (distFromOrigin > BOUNDARY_WARN) {
      warningTimer.current += delta;
      const newPhase = warningTimer.current >= AUTO_TURN_DELAY ? 'turning' : 'warning';
      if (boundaryPhaseRef.current !== newPhase) {
        boundaryPhaseRef.current = newPhase;
        useGameStore.getState().setBoundaryWarning(newPhase);
      }
    } else if (boundaryPhaseRef.current !== 'none') {
      warningTimer.current = 0;
      boundaryPhaseRef.current = 'none';
      useGameStore.getState().setBoundaryWarning('none');
    }

    if (boundaryPhaseRef.current === 'turning') {
      _autoTurnMat.lookAt(meshRef.current.position, _origin, _autoTurnUp);
      _autoTurnQuat.setFromRotationMatrix(_autoTurnMat);
      meshRef.current.quaternion.slerp(_autoTurnQuat, delta * 1.5);
      throttle.current = Math.max(throttle.current, 0.35);
    }

    const shipPosition = meshRef.current.position;
    const shipRotation = meshRef.current.quaternion;
    _localUp.set(0, 1, 0).applyQuaternion(shipRotation);
    camera.up.copy(_localUp);

    if (is3rdPersonRef.current) {
      _camOffset.set(0, 5, 18).applyQuaternion(shipRotation).add(shipPosition);
      camera.position.lerp(_camOffset, delta * 8);
      _lookTarget.copy(direction).multiplyScalar(8).add(shipPosition);
      camera.lookAt(_lookTarget);
    } else {
      _camOffset.set(0, 0.4, 0.5).applyQuaternion(shipRotation).add(shipPosition);
      camera.position.copy(_camOffset);
      _lookTarget.copy(direction).multiplyScalar(10).add(shipPosition);
      camera.lookAt(_lookTarget);
    }
  });

  return (
    <>
    <group ref={meshRef}>
      <primitive object={clonedShipScene} scale={3} rotation-y={Math.PI / 2} visible={is3rdPerson} />

      <mesh position={[0, 0, 1]} material={engineMat}>
        <sphereGeometry args={[0.5, 16, 16]} />
      </mesh>

      {!is3rdPerson && (
        <>
          <TargetingReticle />
          <CockpitHUD throttle={throttle} shipRef={meshRef} />
        </>
      )}

      {/* Debug: direction arrows (inside group → inherit ship rotation) */}
      {showDirections && (
        <DirectionArrows meshRef={meshRef} velocityRef={velocity} />
      )}

      {/* Debug: camera info label floating above ship */}
      {showCameraInfo && (
        <Html position={[0, 10, 0]} style={{ pointerEvents: 'none' }}>
          <CameraInfoLabel />
        </Html>
      )}
    </group>
    <LeadIndicator />
    </>
  );
}

useGLTF.preload(playerShipUrl);
