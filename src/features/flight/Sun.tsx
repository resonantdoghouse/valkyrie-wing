import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useControls } from 'leva';
import sunUrl from '../../assets/models/sun.glb';

export function Sun() {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(sunUrl);

  const { sunX, sunY, sunZ, sunScale, lightIntensity, lightColor } = useControls(
    'Flight / Sun',
    {
      sunX:           { value: 6000,     min: -30000, max: 30000, step: 100, label: 'X' },
      sunY:           { value: 3500,     min: -30000, max: 30000, step: 100, label: 'Y' },
      sunZ:           { value: -15000,   min: -30000, max: 30000, step: 100, label: 'Z' },
      sunScale:       { value: 2800,     min: 1,      max: 8000,  step: 50,  label: 'Scale' },
      lightIntensity: { value: 3.0,      min: 0,      max: 15,    step: 0.1, label: 'Light Intensity' },
      lightColor:     { value: '#ffe8cc',                                     label: 'Light Color' },
    },
    { collapsed: true }
  );

  // DoubleSide so the sun is visible regardless of the model's face winding.
  // frustumCulled=false prevents stale bounding-sphere cull after clone().
  const sunScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse(child => {
      child.frustumCulled = false;
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const src = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const std = src as THREE.MeshStandardMaterial;
      mesh.material = new THREE.MeshBasicMaterial({
        color: std.color?.clone() ?? new THREE.Color(0xffbb44),
        map:   std.map ?? null,
        side:  THREE.DoubleSide,
      });
    });
    return clone;
  }, [scene]);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.04;
  });

  return (
    <group position={[sunX, sunY, sunZ]} frustumCulled={false}>
      <primitive ref={meshRef} object={sunScene} scale={sunScale} />
      <directionalLight intensity={lightIntensity} color={lightColor} castShadow={false} />
    </group>
  );
}

useGLTF.preload(sunUrl);
