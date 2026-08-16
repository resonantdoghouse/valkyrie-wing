import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { useDebugStore } from '../../debug/useDebugStore';
import { useGameStore } from '../../state/useGameStore';
import { RoomCameraManager } from '../../components/RoomCameraManager';
import { InteractiveMarker3D } from '../../components/ui/InteractiveMarker3D';
import { CosmicBackdrop } from '../../components/CosmicBackdrop';
import { playLightClickSound, playChimeSound } from '../../utils/audio';

export function BarScene() {
  const tableRef = useRef<THREE.Mesh>(null);
  const bartenderRef = useRef<THREE.Group>(null);
  const jukeboxRef = useRef<THREE.Mesh>(null);
  
  const showLightHelpers = useDebugStore(state => state.showLightHelpers);
  const barView = useGameStore(state => state.barView);
  const setBarView = useGameStore(state => state.setBarView);

  // Dynamic Camera Framing per Bar Sub-View
  const getCameraTarget = (): { pos: [number, number, number]; lookAt: [number, number, number] } => {
    switch (barView) {
      case 'BARTENDER':
        return { pos: [-1.4, -0.1, 0.6], lookAt: [-2.4, -0.4, -1.0] };
      case 'COMMANDOS':
        return { pos: [0.6, -0.2, 1.8], lookAt: [0.0, -0.6, 0.0] };
      case 'ARCADE':
        return { pos: [1.2, -0.2, 0.3], lookAt: [2.0, -0.4, -1.2] };
      default: // 'MAIN'
        return { pos: [0, 0.4, 4.4], lookAt: [0, -0.3, 0] };
    }
  };

  const { pos: camPos, lookAt: camLookAt } = getCameraTarget();

  // Interaction Hover States
  const [hoveredBartender, setHoveredBartender] = useState(false);
  const [hoveredArcade, setHoveredArcade] = useState(false);
  const [hoveredJukebox, setHoveredJukebox] = useState(false);

  // Update cursor pointer on hover
  useEffect(() => {
    if (hoveredBartender || hoveredArcade || hoveredJukebox) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'auto';
    }
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hoveredBartender, hoveredArcade, hoveredJukebox]);


  // ── Ambient Light Controls ──────────────────────────────────────────────────
  const { ambientIntensity, ambientColor } = useControls(
    'Bar / Ambient Light',
    {
      ambientIntensity: { value: 0.9, min: 0, max: 5, step: 0.05, label: 'Intensity' },
      ambientColor: { value: '#607c9f', label: 'Color' },
    },
    { collapsed: true }
  );

  // ── Point Light Controls ────────────────────────────────────────────────────
  const { pointIntensity, pointColor, pointX, pointY, pointZ, pointDistance } = useControls(
    'Bar / Point Light',
    {
      pointIntensity: { value: 3.5, min: 0, max: 20, step: 0.1, label: 'Intensity' },
      pointColor: { value: '#ffc285', label: 'Color' },
      pointX: { value: 0, min: -10, max: 10, step: 0.1, label: 'X' },
      pointY: { value: 2.2, min: -5, max: 10, step: 0.1, label: 'Y' },
      pointZ: { value: 0.2, min: -10, max: 10, step: 0.1, label: 'Z' },
      pointDistance: { value: 20, min: 0, max: 50, step: 0.5, label: 'Distance' },
    },
    { collapsed: true }
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    // Animate table slow float
    if (tableRef.current) {
      tableRef.current.position.y = Math.sin(t * 1.5) * 0.03 - 0.95;
    }
    
    // Animate bartender droid float
    if (bartenderRef.current) {
      bartenderRef.current.position.y = Math.sin(t * 2.2) * 0.04 + 0.15;
      bartenderRef.current.rotation.y = t * 0.4;
    }
    
    // Animate jukebox spin
    if (jukeboxRef.current) {
      jukeboxRef.current.rotation.y = t * 0.6;
      jukeboxRef.current.rotation.z = Math.sin(t * 1.1) * 0.1;
    }
  });

  return (
    <group>
      {/* Dynamic Cinematic Swaying Camera */}
      <RoomCameraManager targetPosition={camPos} targetLookAt={camLookAt} lerpSpeed={0.045} />

      {/* ── Background Cosmic Environment (Starfield, Nebulae, Distant Planet) ── */}
      <CosmicBackdrop
        depth={-11}
        starCount={700}
        nebulaColor1="#1d4880"
        nebulaColor2="#5a1e78"
        planetPosition={[3.8, 1.8, -9]}
        planetRadius={1.8}
        planetColor="#4d74aa"
      />

      {/* ── Enhanced Room Illumination ────────────────────────────────────────── */}
      <ambientLight intensity={ambientIntensity} color={ambientColor} />
      
      {/* Main Overhead Flood / Key Light */}
      <directionalLight position={[3, 7, 4]} intensity={1.8} color="#dbeaff" />
      
      {/* Starlight Rim Light from the Observation Window */}
      <directionalLight position={[2, 2, -6]} intensity={1.5} color="#66aaff" />

      {/* Warm central bar point light */}
      <pointLight
        position={[pointX, pointY, pointZ]}
        intensity={pointIntensity}
        color={pointColor}
        distance={pointDistance}
      />
      
      {/* Under-counter blue neon bar light */}
      <pointLight
        position={[-2, -0.6, -1]}
        intensity={3.5}
        color="#0099ff"
        distance={8}
      />

      {/* Light debug helpers */}
      {showLightHelpers && (
        <>
          <mesh position={[pointX, pointY, pointZ]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial color={pointColor} />
          </mesh>
          <mesh position={[pointX, pointY, pointZ]}>
            <sphereGeometry args={[pointDistance, 12, 12]} />
            <meshBasicMaterial color={pointColor} wireframe transparent opacity={0.1} />
          </mesh>
          <axesHelper args={[3]} />
        </>
      )}

      {/* ── Room Structures ──────────────────────────────────────────────────── */}
      {/* Illuminated Station Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial color="#252f44" roughness={0.4} metalness={0.3} />
      </mesh>
      
      {/* Floor Neon Accent Runners */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.2, -1.49, 0]}>
        <planeGeometry args={[0.08, 14]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.5, -1.49, 0]}>
        <planeGeometry args={[0.08, 14]} />
        <meshBasicMaterial color="#ffaa00" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.5, 0]}>
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial color="#1e2738" roughness={0.7} />
      </mesh>

      {/* Ceiling Glow Light Strip */}
      <mesh position={[0, 3.48, 0]}>
        <boxGeometry args={[12, 0.04, 0.3]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Back Wall - Left Section (Behind Shelves) */}
      <mesh position={[-3.5, 1, -3]}>
        <planeGeometry args={[7, 6]} />
        <meshStandardMaterial color="#2a364f" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Back Wall - Top Header Beam above Window */}
      <mesh position={[2, 3.0, -3]}>
        <planeGeometry args={[12, 2.0]} />
        <meshStandardMaterial color="#222d40" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Back Wall - Lower Bulkhead beneath Window */}
      <mesh position={[2, -1.0, -3]}>
        <planeGeometry args={[12, 1.0]} />
        <meshStandardMaterial color="#222d40" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* ── Panoramic Observation Window to Space ─────────────────────────────── */}
      <group position={[1.8, 0.9, -2.98]}>
        {/* Outer Frame */}
        <mesh>
          <boxGeometry args={[7.2, 3.2, 0.08]} />
          <meshStandardMaterial color="#354562" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Translucent Glass with Starlight Sheen */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[6.9, 2.9]} />
          <meshStandardMaterial
            color="#00ffff"
            transparent
            opacity={0.06}
            roughness={0.05}
            metalness={0.95}
          />
        </mesh>
        {/* Window Struts / Mullions */}
        <mesh position={[-1.7, 0, 0.03]}>
          <boxGeometry args={[0.08, 2.9, 0.04]} />
          <meshStandardMaterial color="#4a5e82" metalness={0.9} />
        </mesh>
        <mesh position={[1.7, 0, 0.03]}>
          <boxGeometry args={[0.08, 2.9, 0.04]} />
          <meshStandardMaterial color="#4a5e82" metalness={0.9} />
        </mesh>
      </group>
      
      {/* Left Wall with Sconce Glow */}
      <mesh position={[-5, 1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[20, 6]} />
        <meshStandardMaterial color="#263248" roughness={0.6} />
      </mesh>
      {/* Left Wall Sci-Fi Light Bar */}
      <mesh position={[-4.95, 1.2, -1]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.15, 2.4, 0.04]} />
        <meshBasicMaterial color="#00e5ff" />
      </mesh>

      {/* ── Bar Counter Area ─────────────────────────────────────────────────── */}
      {/* Curved L-counter */}
      <group position={[-2.2, -1, -0.8]}>
        {/* Main Counter top */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[2.5, 0.1, 0.8]} />
          <meshStandardMaterial color="#384763" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Counter body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.4, 0.8, 0.7]} />
          <meshStandardMaterial color="#2b374e" roughness={0.5} metalness={0.5} />
        </mesh>
        {/* Under-counter glowing LED strip */}
        <mesh position={[0, 0.36, 0.36]}>
          <boxGeometry args={[2.42, 0.03, 0.03]} />
          <meshBasicMaterial color="#00e5ff" />
        </mesh>

        {/* Return counter top */}
        <mesh position={[0.85, 0.4, 0.8]} rotation={[0, Math.PI/2, 0]}>
          <boxGeometry args={[1.2, 0.1, 0.8]} />
          <meshStandardMaterial color="#384763" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Return counter body */}
        <mesh position={[0.85, 0, 0.8]} rotation={[0, Math.PI/2, 0]}>
          <boxGeometry args={[1.2, 0.8, 0.7]} />
          <meshStandardMaterial color="#2b374e" roughness={0.5} metalness={0.5} />
        </mesh>
        <mesh position={[0.85, 0.36, 1.41]} rotation={[0, Math.PI/2, 0]}>
          <boxGeometry args={[1.22, 0.03, 0.03]} />
          <meshBasicMaterial color="#00e5ff" />
        </mesh>


        {/* ── Stools ── */}
        <group position={[0.2, -0.2, 0.8]}>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.08, 12]} />
            <meshStandardMaterial color="#ff7700" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
            <meshStandardMaterial color="#cccccc" metalness={1.0} />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.02, 8]} />
            <meshStandardMaterial color="#888888" metalness={1.0} />
          </mesh>
        </group>

        <group position={[-0.6, -0.2, 0.8]}>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.08, 12]} />
            <meshStandardMaterial color="#ff7700" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
            <meshStandardMaterial color="#cccccc" metalness={1.0} />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.02, 8]} />
            <meshStandardMaterial color="#888888" metalness={1.0} />
          </mesh>
        </group>
      </group>

      {/* ── Bartender Terminal (Clickable) ─────────────────────────────────── */}
      <group 
        position={[-2.4, -0.5, -1.0]}
        onClick={(e) => {
          e.stopPropagation();
          setBarView('BARTENDER');
          playLightClickSound();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredBartender(true);
        }}
        onPointerOut={() => setHoveredBartender(false)}
      >
        {/* In-world 3D Tag */}
        <InteractiveMarker3D 
          position={[0, 0.55, 0]}
          label="UNIT 7"
          actionHint="TALK"
          accentColor="#00ffff"
          icon="🤖"
          onClick={() => { setBarView('BARTENDER'); playLightClickSound(); }}
        />

        {/* Terminal Station Base */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.5, 0.2, 0.5]} />
          <meshStandardMaterial color="#1a1a24" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Floating Droid Unit */}
        <group ref={bartenderRef}>
          {/* Droid Core */}
          <mesh>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial 
              color={hoveredBartender ? "#00ffff" : "#00aa88"} 
              emissive={hoveredBartender ? "#00ffff" : "#005544"}
              emissiveIntensity={hoveredBartender ? 1.2 : 0.4}
              roughness={0.1}
            />
          </mesh>
          {/* Eye lens */}
          <mesh position={[0.09, 0.04, 0.08]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color={hoveredBartender ? "#ffea00" : "#ff3300"} />
          </mesh>
          {/* Antennas */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.1, 8]} />
            <meshStandardMaterial color="#cccccc" metalness={1.0} />
          </mesh>
        </group>
      </group>

      {/* ── Back Shelves and Neon Bottles ────────────────────────────────────── */}
      <group position={[-3.2, 0.1, -1.8]}>
        {/* Shelf backboards */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.1, 1.2, 1.5]} />
          <meshStandardMaterial color="#222d42" metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Bottles */}
        <mesh position={[0.07, 0.3, -0.4]}>
          <cylinderGeometry args={[0.04, 0.04, 0.22, 8]} />
          <meshStandardMaterial color="#ff0044" emissive="#ff0044" emissiveIntensity={1.8} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0.07, 0.3, -0.1]}>
          <cylinderGeometry args={[0.035, 0.035, 0.28, 8]} />
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2.0} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0.07, 0.3, 0.2]}>
          <cylinderGeometry args={[0.045, 0.045, 0.24, 8]} />
          <meshStandardMaterial color="#ff9900" emissive="#ff9900" emissiveIntensity={1.5} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0.07, 0.3, 0.5]}>
          <cylinderGeometry args={[0.038, 0.038, 0.25, 8]} />
          <meshStandardMaterial color="#00ff66" emissive="#00ff66" emissiveIntensity={1.6} transparent opacity={0.85} />
        </mesh>
      </group>

      {/* ── Central Table (Hovering) & Glass ─────────────────────────────────── */}
      <group position={[0, 0, 0]}>
        <InteractiveMarker3D 
          position={[0, -0.4, 0]}
          label="COMMANDOS"
          actionHint="MINGLE"
          accentColor="#ffaa00"
          icon="👥"
          onClick={() => { setBarView('COMMANDOS'); playLightClickSound(); }}
        />

        <mesh ref={tableRef} position={[0, -0.95, 0]}>
          <cylinderGeometry args={[1, 1, 0.15, 16]} />
          <meshStandardMaterial color="#2e3d55" metalness={0.7} roughness={0.2} />
        </mesh>
        {/* Light glow ring above table */}
        <mesh position={[0, 1.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.04, 8, 24]} />
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2.0} />
        </mesh>
        {/* Spot light pointing down at table */}
        <spotLight
          position={[0, 1.25, 0]}
          intensity={3.5}
          color="#00ffff"
          distance={4.0}
          angle={Math.PI / 4.5}
          penumbra={0.5}
        />

        {/* Drink on table */}
        <mesh position={[0.35, -0.82, 0.2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.15, 8]} />
          <meshStandardMaterial color="#00ffcc" emissive="#00ccaa" emissiveIntensity={1.0} transparent opacity={0.85} roughness={0.1} />
        </mesh>
        <pointLight position={[0.35, -0.75, 0.2]} color="#00ffcc" intensity={0.8} distance={1.5} />
      </group>

      {/* ── Retro Arcade Cabinet (Clickable) ─────────────────────────────────── */}
      <group 
        position={[2.0, -0.7, -1.2]} 
        rotation={[0, -0.5, 0]}
        onClick={(e) => {
          e.stopPropagation();
          setBarView('ARCADE');
          playLightClickSound();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredArcade(true);
        }}
        onPointerOut={() => setHoveredArcade(false)}
      >
        <InteractiveMarker3D 
          position={[0, 1.05, 0]}
          label="ARCADE SIM"
          actionHint="PLAY"
          accentColor="#ff7700"
          icon="🕹️"
          onClick={() => { setBarView('ARCADE'); playLightClickSound(); }}
        />

        {/* Cabinet Body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 1.6, 0.8]} />
          <meshStandardMaterial color="#2c364c" roughness={0.3} metalness={0.6} />
        </mesh>
        
        {/* Glowing Screen Face */}
        <mesh position={[0, 0.38, 0.405]} rotation={[-0.2, 0, 0]}>
          <planeGeometry args={[0.7, 0.5]} />
          <meshStandardMaterial 
            color={hoveredArcade ? "#ffaa00" : "#3385ff"} 
            emissive={hoveredArcade ? "#ff7700" : "#1144aa"} 
            emissiveIntensity={hoveredArcade ? 2.5 : 1.4} 
            roughness={0.1} 
          />
        </mesh>
        
        {/* Control Deck Console */}
        <mesh position={[0, 0.05, 0.45]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.72, 0.1, 0.3]} />
          <meshStandardMaterial color="#3d4963" metalness={0.7} />
        </mesh>
        
        {/* Cabinet Side Neon Stripes */}
        <mesh position={[-0.405, 0, 0]}>
          <boxGeometry args={[0.01, 1.5, 0.78]} />
          <meshStandardMaterial color="#ff7700" emissive="#ff5500" emissiveIntensity={1.2} />
        </mesh>
        <mesh position={[0.405, 0, 0]}>
          <boxGeometry args={[0.01, 1.5, 0.78]} />
          <meshStandardMaterial color="#ff7700" emissive="#ff5500" emissiveIntensity={1.2} />
        </mesh>
      </group>

      {/* ── Hologram Jukebox (Interactive Object) ────────────────────────────── */}
      <group 
        position={[1.5, -0.6, 0.9]}
        onClick={(e) => {
          e.stopPropagation();
          playChimeSound();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredJukebox(true);
        }}
        onPointerOut={() => setHoveredJukebox(false)}
      >
        <InteractiveMarker3D 
          position={[0, 0.65, 0]}
          label="JUKEBOX"
          actionHint="CHIME"
          accentColor="#ff55ff"
          icon="🎵"
          onClick={() => playChimeSound()}
        />

        {/* Pedestal stand */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.15, 0.25, 0.6, 12]} />
          <meshStandardMaterial color="#3a4b66" metalness={0.8} />
        </mesh>
        {/* Projector Lens */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.06, 12]} />
          <meshStandardMaterial color="#1a2538" metalness={0.9} />
        </mesh>
        {/* Spinning Holographic Ring */}
        <mesh ref={jukeboxRef} position={[0, 0.35, 0]}>
          <torusGeometry args={[0.18, 0.03, 8, 16]} />
          <meshBasicMaterial 
            color={hoveredJukebox ? "#00ffff" : "#ff55ff"} 
            wireframe 
            transparent 
            opacity={0.85} 
          />
        </mesh>
        <pointLight position={[0, 0.35, 0]} color={hoveredJukebox ? "#00ffff" : "#ff55ff"} intensity={1.2} distance={3.0} />
      </group>
    </group>
  );
}


