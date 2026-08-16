import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../state/useGameStore';
import { RoomCameraManager } from '../../components/RoomCameraManager';
import { InteractiveMarker3D } from '../../components/ui/InteractiveMarker3D';
import { CosmicBackdrop } from '../../components/CosmicBackdrop';
import { playLightClickSound } from '../../utils/audio';

export function BriefingScene() {
  const holoGroupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  const { briefingMode, setBriefingMode } = useGameStore();
  const [hovered, setHovered] = useState(false);

  // Update cursor pointer on hover
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);

  const cycleMode = () => {
    const modes: ('NAV' | 'HAZARDS' | 'TACTICAL')[] = ['NAV', 'HAZARDS', 'TACTICAL'];
    const nextIndex = (modes.indexOf(briefingMode) + 1) % modes.length;
    setBriefingMode(modes[nextIndex]);
    playLightClickSound();
  };

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    
    if (holoGroupRef.current) {
      holoGroupRef.current.rotation.y += delta * 0.4;
      // Gentle float height modulation
      holoGroupRef.current.position.y = -0.15 + Math.sin(t * 1.8) * 0.04;
    }
    
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.6;
      ring1Ref.current.rotation.y = t * 0.3;
    }
    
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -t * 0.8;
      ring2Ref.current.rotation.z = t * 0.4;
    }
  });

  // Color maps based on tactical briefing modes
  const getHoloStyle = () => {
    switch (briefingMode) {
      case 'NAV':
        return { color: '#00ffff', intensity: 3.2 };
      case 'HAZARDS':
        return { color: '#ff5511', intensity: 3.4 };
      case 'TACTICAL':
        return { color: '#00ff88', intensity: 3.2 };
      default:
        return { color: '#00ffff', intensity: 2.8 };
    }
  };

  const holoStyle = getHoloStyle();

  return (
    <group>
      {/* Swaying Camera */}
      <RoomCameraManager targetPosition={[0, 0.4, 4.2]} targetLookAt={[0, -0.2, 0]} lerpSpeed={0.045} />

      {/* ── Background Cosmic Panorama ── */}
      <CosmicBackdrop
        depth={-11}
        starCount={650}
        nebulaColor1="#133868"
        nebulaColor2="#0d526e"
        planetPosition={[-4.2, 1.6, -9]}
        planetRadius={1.5}
        planetColor="#3f668f"
      />

      {/* ── Enhanced Room Lighting ── */}
      <ambientLight intensity={0.9} color="#6888b5" />
      
      {/* Overhead Tactical Command Key Light */}
      <directionalLight position={[0, 6, 3]} intensity={2.2} color="#c8e0ff" />
      
      {/* Soft Ceiling Point Light */}
      <pointLight position={[0, 2.5, 0]} intensity={2.2} color="#b0d8ff" distance={12} />

      {/* Projector floor point light source */}
      <pointLight 
        position={[0, -0.4, 0]} 
        intensity={holoStyle.intensity} 
        color={holoStyle.color} 
        distance={7} 
      />

      {/* ── Room Geometries ─────────────────────────────────────────────────── */}
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#222e45" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Floor Glowing Grid Perimeter */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.49, 0]}>
        <planeGeometry args={[3.8, 2.6]} />
        <meshBasicMaterial color="#00e5ff" wireframe transparent opacity={0.4} />
      </mesh>

      {/* Ceiling Panel */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1e2738" roughness={0.6} />
      </mesh>
      {/* Ceiling Light Panel */}
      <mesh position={[0, 3.18, 0]}>
        <boxGeometry args={[4.5, 0.04, 2.5]} />
        <meshBasicMaterial color="#d4e8ff" />
      </mesh>

      {/* Back wall panel */}
      <mesh position={[0, 1, -2.8]}>
        <planeGeometry args={[20, 5]} />
        <meshStandardMaterial color="#29364e" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Vertical Neon Accent Strips on Back Wall */}
      <mesh position={[-2.8, 1, -2.78]}>
        <boxGeometry args={[0.06, 4.5, 0.02]} />
        <meshBasicMaterial color="#00e5ff" />
      </mesh>
      <mesh position={[2.8, 1, -2.78]}>
        <boxGeometry args={[0.06, 4.5, 0.02]} />
        <meshBasicMaterial color="#00e5ff" />
      </mesh>

      {/* Side columns */}
      <mesh position={[-4, 1, -2.6]}>
        <boxGeometry args={[0.5, 5, 0.5]} />
        <meshStandardMaterial color="#33435e" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[4, 1, -2.6]}>
        <boxGeometry args={[0.5, 5, 0.5]} />
        <meshStandardMaterial color="#33435e" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* ── Briefing Table ──────────────────────────────────────────────────── */}
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[3, 0.4, 1.8]} />
        <meshStandardMaterial color="#2d3b55" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Table Glowing Accent Rim */}
      <mesh position={[0, -0.72, 0]}>
        <boxGeometry args={[3.04, 0.03, 1.84]} />
        <meshBasicMaterial color={holoStyle.color} />
      </mesh>
      
      {/* Projector emitter lens base */}
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.08, 16]} />
        <meshStandardMaterial color="#1a2538" metalness={0.9} />
      </mesh>

      {/* Hologram Projector Light Cone (semi-transparent) */}
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.42, 0.28, 0.42, 16, 1, true]} />
        <meshBasicMaterial 
          color={holoStyle.color} 
          transparent 
          opacity={0.12} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* ── Wall Interface HUD screen ────────────────────────────────────────── */}
      {/* Flat Screen Panel */}
      <mesh position={[0, 1.25, -2.75]}>
        <boxGeometry args={[4.2, 1.8, 0.05]} />
        <meshStandardMaterial color="#101826" roughness={0.2} metalness={0.8} />
      </mesh>
      
      {/* Neon glowing screen frame border */}
      <mesh position={[0, 1.25, -2.73]}>
        <boxGeometry args={[4.25, 1.85, 0.02]} />
        <meshStandardMaterial color={holoStyle.color} emissive={holoStyle.color} emissiveIntensity={0.8} wireframe />
      </mesh>

      {/* Graphic Grid Readout inside screen */}
      <gridHelper 
        args={[4, 10, holoStyle.color, holoStyle.color]} 
        rotation={[Math.PI / 2, 0, 0]} 
        position={[0, 1.25, -2.71]} 
      />


      {/* ── Interactive Hologram Unit (Clickable) ────────────────────────────── */}
      <group 
        ref={holoGroupRef} 
        position={[0, -0.15, 0]}
        onClick={(e) => {
          e.stopPropagation();
          cycleMode();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <InteractiveMarker3D
          position={[0, 0.55, 0]}
          label={`TACTICAL: ${briefingMode}`}
          actionHint="CYCLE"
          accentColor={holoStyle.color}
          icon="🌐"
          onClick={cycleMode}
        />

        {/* Render different geometry modules based on the tactical screen mode */}
        {briefingMode === 'NAV' && (
          <>
            {/* Core planet */}
            <mesh>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.65} />
            </mesh>
            {/* Orbit ring 1 */}
            <mesh ref={ring1Ref}>
              <torusGeometry args={[0.55, 0.015, 6, 24]} />
              <meshBasicMaterial color="#00ffff" transparent opacity={0.7} />
            </mesh>
            {/* Orbit ring 2 */}
            <mesh ref={ring2Ref} rotation={[Math.PI/4, Math.PI/4, 0]}>
              <torusGeometry args={[0.7, 0.01, 4, 20]} />
              <meshBasicMaterial color="#00aaff" transparent opacity={0.5} />
            </mesh>
          </>
        )}

        {briefingMode === 'HAZARDS' && (
          <>
            {/* Asteroid hazard cluster core */}
            <mesh>
              <dodecahedronGeometry args={[0.26, 0]} />
              <meshBasicMaterial color="#ff4400" wireframe transparent opacity={0.75} />
            </mesh>
            <mesh rotation={[Math.PI/2, Math.PI/4, 0]}>
              <octahedronGeometry args={[0.42, 0]} />
              <meshBasicMaterial color="#ff2200" wireframe transparent opacity={0.4} />
            </mesh>
            {/* Tiny dust/particle clouds */}
            <mesh position={[0.4, 0.2, -0.3]}>
              <tetrahedronGeometry args={[0.06, 0]} />
              <meshBasicMaterial color="#ffbb00" transparent opacity={0.7} />
            </mesh>
            <mesh position={[-0.4, -0.3, 0.2]}>
              <tetrahedronGeometry args={[0.07, 0]} />
              <meshBasicMaterial color="#ffbb00" transparent opacity={0.7} />
            </mesh>
            <mesh position={[0.2, -0.4, -0.4]}>
              <tetrahedronGeometry args={[0.05, 0]} />
              <meshBasicMaterial color="#ff3300" transparent opacity={0.6} />
            </mesh>
          </>
        )}

        {briefingMode === 'TACTICAL' && (
          <>
            {/* Target waypoint octahedron */}
            <mesh>
              <octahedronGeometry args={[0.28, 0]} />
              <meshBasicMaterial color="#00ff66" wireframe transparent opacity={0.8} />
            </mesh>
            {/* Twin tracking sweep rings */}
            <mesh ref={ring1Ref}>
              <torusGeometry args={[0.62, 0.012, 4, 16]} />
              <meshBasicMaterial color="#00ff44" transparent opacity={0.7} />
            </mesh>
            <mesh ref={ring2Ref} rotation={[Math.PI/3, 0, Math.PI/3]}>
              <cylinderGeometry args={[0.5, 0.5, 0.02, 12, 1, true]} />
              <meshBasicMaterial color="#00aa44" wireframe transparent opacity={0.4} />
            </mesh>
          </>
        )}
      </group>

      {/* Console Input interfaces around the table */}
      <group position={[-1.2, -0.85, 0.6]} rotation={[0, 0.8, 0.15]}>
        <mesh>
          <boxGeometry args={[0.4, 0.05, 0.25]} />
          <meshStandardMaterial color="#0c0e18" metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <planeGeometry args={[0.36, 0.2]} />
          <meshStandardMaterial color={holoStyle.color} emissive={holoStyle.color} emissiveIntensity={0.5} />
        </mesh>
      </group>
      
      <group position={[1.2, -0.85, 0.6]} rotation={[0, -0.8, -0.15]}>
        <mesh>
          <boxGeometry args={[0.4, 0.05, 0.25]} />
          <meshStandardMaterial color="#0c0e18" metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <planeGeometry args={[0.36, 0.2]} />
          <meshStandardMaterial color={holoStyle.color} emissive={holoStyle.color} emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  );
}
