import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  targetPosition: [number, number, number];
  targetLookAt: [number, number, number];
  lerpSpeed?: number;
  maxYaw?: number;
  maxPitch?: number;
}

export function RoomCameraManager({
  targetPosition,
  targetLookAt,
  lerpSpeed = 0.045,
  maxYaw = 0.52, // ~30 degrees max horizontal sweep
  maxPitch = 0.26, // ~15 degrees max vertical sweep
}: Props) {
  const { camera } = useThree();
  const currentLookAt = useRef(new THREE.Vector3(targetLookAt[0], targetLookAt[1], targetLookAt[2]));
  const currentCamPos = useRef(new THREE.Vector3(targetPosition[0], targetPosition[1], targetPosition[2]));
  const mouse = useRef({ x: 0, y: 0 });
  const isInitialized = useRef(false);

  // Keyboard navigation state
  const keysDown = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const targetYaw = useRef(0);
  const targetPitch = useRef(0);
  const currentYaw = useRef(0);
  const currentPitch = useRef(0);

  // Track previous target position/lookAt to reset offsets when switching rooms/subviews
  const prevTargetPos = useRef<[number, number, number]>(targetPosition);
  const prevTargetLookAt = useRef<[number, number, number]>(targetLookAt);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 to +1
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      const code = e.code;

      if (key === 'a' || code === 'KeyA' || key === 'arrowleft' || code === 'ArrowLeft') {
        keysDown.current.left = true;
      }
      if (key === 'd' || code === 'KeyD' || key === 'arrowright' || code === 'ArrowRight') {
        keysDown.current.right = true;
      }
      if (key === 'w' || code === 'KeyW' || key === 'arrowup' || code === 'ArrowUp') {
        keysDown.current.up = true;
      }
      if (key === 's' || code === 'KeyS' || key === 'arrowdown' || code === 'ArrowDown') {
        keysDown.current.down = true;
      }

      // Quick recenter view with 'c' or 'r'
      if (key === 'c' || code === 'KeyC' || key === 'r' || code === 'KeyR') {
        targetYaw.current = 0;
        targetPitch.current = 0;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const code = e.code;

      if (key === 'a' || code === 'KeyA' || key === 'arrowleft' || code === 'ArrowLeft') {
        keysDown.current.left = false;
      }
      if (key === 'd' || code === 'KeyD' || key === 'arrowright' || code === 'ArrowRight') {
        keysDown.current.right = false;
      }
      if (key === 'w' || code === 'KeyW' || key === 'arrowup' || code === 'ArrowUp') {
        keysDown.current.up = false;
      }
      if (key === 's' || code === 'KeyS' || key === 'arrowdown' || code === 'ArrowDown') {
        keysDown.current.down = false;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Initialize camera position once on initial mount
  useEffect(() => {
    if (!isInitialized.current) {
      camera.position.set(targetPosition[0], targetPosition[1], targetPosition[2]);
      currentCamPos.current.set(targetPosition[0], targetPosition[1], targetPosition[2]);
      currentLookAt.current.set(targetLookAt[0], targetLookAt[1], targetLookAt[2]);
      camera.lookAt(currentLookAt.current);
      isInitialized.current = true;
    }
  }, [camera, targetPosition, targetLookAt]);

  // If the target position or lookAt changed (e.g. switched bar subview or room), reset look offsets
  useEffect(() => {
    const posChanged =
      prevTargetPos.current[0] !== targetPosition[0] ||
      prevTargetPos.current[1] !== targetPosition[1] ||
      prevTargetPos.current[2] !== targetPosition[2];

    const lookChanged =
      prevTargetLookAt.current[0] !== targetLookAt[0] ||
      prevTargetLookAt.current[1] !== targetLookAt[1] ||
      prevTargetLookAt.current[2] !== targetLookAt[2];

    if (posChanged || lookChanged) {
      targetYaw.current = 0;
      targetPitch.current = 0;
      prevTargetPos.current = targetPosition;
      prevTargetLookAt.current = targetLookAt;
    }
  }, [targetPosition, targetLookAt]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);

    // Turn speed in radians per second
    const turnSpeed = 1.0;

    // Process keyboard inputs smoothly into targetYaw and targetPitch
    if (keysDown.current.left) {
      targetYaw.current += turnSpeed * dt;
    }
    if (keysDown.current.right) {
      targetYaw.current -= turnSpeed * dt;
    }
    if (keysDown.current.up) {
      targetPitch.current += turnSpeed * dt;
    }
    if (keysDown.current.down) {
      targetPitch.current -= turnSpeed * dt;
    }

    // Hard clamp to ensure player never turns away from the main scene or into walls
    targetYaw.current = THREE.MathUtils.clamp(targetYaw.current, -maxYaw, maxYaw);
    targetPitch.current = THREE.MathUtils.clamp(targetPitch.current, -maxPitch, maxPitch);

    // Smoothly interpolate current angles toward target angles (fluid inertia)
    const angleSmoothFactor = Math.min(dt * 8, 1);
    currentYaw.current = THREE.MathUtils.lerp(currentYaw.current, targetYaw.current, angleSmoothFactor);
    currentPitch.current = THREE.MathUtils.lerp(currentPitch.current, targetPitch.current, angleSmoothFactor);

    // Mouse tilt offset (adds a subtle reactive layer)
    const mouseYaw = -mouse.current.x * 0.10;
    const mousePitch = mouse.current.y * 0.06;

    const totalYaw = currentYaw.current + mouseYaw;
    const totalPitch = currentPitch.current + mousePitch;

    // Compute base framing vectors
    const basePos = new THREE.Vector3(...targetPosition);
    const baseLook = new THREE.Vector3(...targetLookAt);
    const baseForward = new THREE.Vector3().subVectors(baseLook, basePos);
    const distance = baseForward.length();
    baseForward.normalize();

    const worldUp = new THREE.Vector3(0, 1, 0);
    const baseRight = new THREE.Vector3().crossVectors(baseForward, worldUp).normalize();
    const baseUp = new THREE.Vector3().crossVectors(baseRight, baseForward).normalize();

    // Pure stationary head rotation: Camera position stays anchored at target position
    const destPos = new THREE.Vector3(...targetPosition);

    // Compute rotated look direction vector from stationary vantage
    // Rotating baseForward by totalYaw around worldUp, and totalPitch around baseRight
    const lookDir = baseForward
      .clone()
      .multiplyScalar(Math.cos(totalPitch) * Math.cos(totalYaw))
      .add(baseRight.clone().multiplyScalar(-Math.sin(totalYaw)))
      .add(baseUp.clone().multiplyScalar(Math.sin(totalPitch)))
      .normalize();

    const destLookAt = destPos.clone().add(lookDir.multiplyScalar(distance));

    // Smoothly lerp camera position and lookAt target
    currentCamPos.current.lerp(destPos, lerpSpeed);
    currentLookAt.current.lerp(destLookAt, lerpSpeed);

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

