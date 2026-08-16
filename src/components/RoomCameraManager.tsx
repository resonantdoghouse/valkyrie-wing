import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  targetPosition: [number, number, number];
  targetLookAt: [number, number, number];
  lerpSpeed?: number;
}

export function RoomCameraManager({ targetPosition, targetLookAt, lerpSpeed = 0.04 }: Props) {
  const { camera } = useThree();
  const currentLookAt = useRef(new THREE.Vector3(targetLookAt[0], targetLookAt[1], targetLookAt[2]));
  const mouse = useRef({ x: 0, y: 0 });
  const isInitialized = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 to +1
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Initialize camera position once on initial mount
  useEffect(() => {
    if (!isInitialized.current) {
      camera.position.set(targetPosition[0], targetPosition[1], targetPosition[2]);
      currentLookAt.current.set(targetLookAt[0], targetLookAt[1], targetLookAt[2]);
      camera.lookAt(currentLookAt.current);
      isInitialized.current = true;
    }
  }, [camera, targetPosition, targetLookAt]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Organic camera sway (simulating floating/breathing)
    const floatX = Math.sin(t * 0.5) * 0.06;
    const floatY = Math.cos(t * 0.6) * 0.04;
    const floatZ = Math.sin(t * 0.4) * 0.03;

    // Mouse tilt offset (adds a subtle sense of perspective/leaning)
    const tiltX = mouse.current.x * 0.25;
    const tiltY = mouse.current.y * 0.18;

    // Smoothly lerp camera position toward target
    const destX = targetPosition[0] + floatX + tiltX;
    const destY = targetPosition[1] + floatY + tiltY;
    const destZ = targetPosition[2] + floatZ;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, destX, lerpSpeed);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, destY, lerpSpeed);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, destZ, lerpSpeed);

    // Smoothly lerp look-at target vector
    const destLookX = targetLookAt[0] + floatX * 0.2 + mouse.current.x * 0.4;
    const destLookY = targetLookAt[1] + floatY * 0.2 + mouse.current.y * 0.3;
    const destLookZ = targetLookAt[2];

    const targetLookVec = new THREE.Vector3(destLookX, destLookY, destLookZ);
    currentLookAt.current.lerp(targetLookVec, lerpSpeed);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

