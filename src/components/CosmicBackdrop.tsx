import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface CosmicBackdropProps {
  starCount?: number;
  nebulaColor1?: string;
  nebulaColor2?: string;
  showPlanet?: boolean;
  planetPosition?: [number, number, number];
  planetColor?: string;
  planetRadius?: number;
  depth?: number;
}

export function CosmicBackdrop({
  starCount = 600,
  nebulaColor1 = '#1a3b6e',
  nebulaColor2 = '#4a1e6d',
  showPlanet = true,
  planetPosition = [-4.5, 1.8, -12],
  planetColor = '#4a6fa5',
  planetRadius = 1.6,
  depth = -14,
}: CosmicBackdropProps) {
  const starsGroupRef = useRef<THREE.Group>(null);
  const nebula1Ref = useRef<THREE.Mesh>(null);
  const nebula2Ref = useRef<THREE.Mesh>(null);
  const planetRef = useRef<THREE.Mesh>(null);

  // Generate multi-tiered star positions and colors
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(starCount * 3);
    const col = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#d0e8ff'),
      new THREE.Color('#88ccff'),
      new THREE.Color('#ffe8b0'),
      new THREE.Color('#ffc0d0'),
      new THREE.Color('#00ffff'),
    ];

    for (let i = 0; i < starCount; i++) {
      // Distribute in a spherical arc behind the room
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 18 + Math.random() * 12;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = Math.abs(r * Math.sin(phi) * Math.sin(theta)) - 2; // Bias slightly upward
      pos[i * 3 + 2] = -Math.abs(r * Math.cos(phi)) - 6;

      // Random palette color
      const chosenColor = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;
    }

    return { positions: pos, colors: col };
  }, [starCount]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (starsGroupRef.current) {
      starsGroupRef.current.rotation.z = t * 0.008;
      starsGroupRef.current.rotation.y = Math.sin(t * 0.005) * 0.02;
    }
    if (nebula1Ref.current) {
      nebula1Ref.current.rotation.z = t * 0.012;
    }
    if (nebula2Ref.current) {
      nebula2Ref.current.rotation.z = -t * 0.009;
    }
    if (planetRef.current) {
      planetRef.current.rotation.y = t * 0.02;
    }
  });

  return (
    <group position={[0, 0, depth]}>
      {/* ── Nebula Glow Clouds (Large layered backdrop meshes) ────────────────── */}
      {/* Nebula Layer 1 - Deep Blue/Cyan */}
      <mesh ref={nebula1Ref} position={[2, 3, -4]}>
        <planeGeometry args={[35, 25]} />
        <meshBasicMaterial
          color={nebulaColor1}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Nebula Layer 2 - Violet/Magenta */}
      <mesh ref={nebula2Ref} position={[-4, 1, -3]}>
        <planeGeometry args={[30, 22]} />
        <meshBasicMaterial
          color={nebulaColor2}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Nebula Core Highlight */}
      <mesh position={[0, 2, -5]}>
        <planeGeometry args={[20, 16]} />
        <meshBasicMaterial
          color="#1e528a"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── Starfield Points ─────────────────────────────────────────────────── */}
      <group ref={starsGroupRef}>
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={starCount}
              array={positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={starCount}
              array={colors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.12}
            sizeAttenuation
            vertexColors
            transparent
            opacity={0.95}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      </group>

      {/* ── Distant Planet with Atmospheric Glow ─────────────────────────────── */}
      {showPlanet && (
        <group position={planetPosition}>
          {/* Planet Body */}
          <mesh ref={planetRef}>
            <sphereGeometry args={[planetRadius, 32, 32]} />
            <meshStandardMaterial
              color={planetColor}
              roughness={0.7}
              metalness={0.3}
              emissive="#122040"
              emissiveIntensity={0.6}
            />
          </mesh>

          {/* Atmospheric Glow Ring / Rim Halo */}
          <mesh>
            <sphereGeometry args={[planetRadius * 1.08, 32, 32]} />
            <meshBasicMaterial
              color="#66aaff"
              transparent
              opacity={0.25}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
            />
          </mesh>

          {/* Planetary Ring */}
          <mesh rotation={[Math.PI / 3, 0.2, 0]}>
            <ringGeometry args={[planetRadius * 1.35, planetRadius * 1.9, 48]} />
            <meshBasicMaterial
              color="#88b5ee"
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
