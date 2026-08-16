import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../state/useGameStore';
import { RoomCameraManager } from '../../components/RoomCameraManager';
import { InteractiveMarker3D } from '../../components/ui/InteractiveMarker3D';
import { CosmicBackdrop } from '../../components/CosmicBackdrop';
import { playLightClickSound, playChimeSound } from '../../utils/audio';

export function QuartersScene() {
  const bedRef = useRef<THREE.Group>(null);
  const lampBulbRef = useRef<THREE.Mesh>(null);

  const { quartersLightsOn, toggleQuartersLights, addQuartersLog } = useGameStore();

  // Interaction Hover States
  const [hoveredBed, setHoveredBed] = useState(false);
  const [hoveredLamp, setHoveredLamp] = useState(false);
  const [hoveredFrame, setHoveredFrame] = useState(false);
  const [hoveredWindow, setHoveredWindow] = useState(false);

  // Update cursor pointer on hover
  useEffect(() => {
    if (hoveredBed || hoveredLamp || hoveredFrame || hoveredWindow) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'auto';
    }
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hoveredBed, hoveredLamp, hoveredFrame, hoveredWindow]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    // Sleeping pod LED glow wave
    if (bedRef.current) {
      const ledTrim = bedRef.current.getObjectByName('ledTrim') as THREE.Mesh;
      if (ledTrim && ledTrim.material) {
        (ledTrim.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6 + Math.sin(t * 2.0) * 0.3;
      }
    }
  });

  const handleLampClick = (e?: any) => {
    if (e?.stopPropagation) e.stopPropagation();
    playLightClickSound();
    toggleQuartersLights();
    addQuartersLog(quartersLightsOn ? "> Desk Lamp: toggled OFF" : "> Desk Lamp: toggled ON");
  };

  const handleBedClick = (e?: any) => {
    if (e?.stopPropagation) e.stopPropagation();
    playChimeSound();
    addQuartersLog("> Rest chamber initiated. Regeneration cycle active.");
  };

  const handleFrameClick = (e?: any) => {
    if (e?.stopPropagation) e.stopPropagation();
    playChimeSound();
    addQuartersLog("> Memory Core: Cycling holographic painting frame.");
  };

  const handleWindowClick = (e?: any) => {
    if (e?.stopPropagation) e.stopPropagation();
    playLightClickSound();
    addQuartersLog("> Viewport: Nebula starfield observation recorded.");
  };

  return (
    <group>
      {/* Swaying Camera focused toward the quarters corner */}
      <RoomCameraManager targetPosition={[1.2, 0.6, 3.8]} targetLookAt={[-0.6, -0.2, -1.0]} lerpSpeed={0.045} />

      {/* ── Space Environment outside the Window ── */}
      <CosmicBackdrop
        depth={-9}
        starCount={600}
        nebulaColor1="#204d80"
        nebulaColor2="#502070"
        planetPosition={[-2.4, 0.4, -7.5]}
        planetRadius={1.3}
        planetColor="#4d6f9e"
      />

      {/* Ambient Lighting - Dim/Cozy but Bright enough to see */}
      <ambientLight intensity={quartersLightsOn ? 0.95 : 0.45} color="#6b86ab" />
      
      {/* Overhead Cabin Light */}
      <directionalLight position={[2, 6, 3]} intensity={quartersLightsOn ? 1.8 : 0.5} color="#dbe8ff" />

      {/* Space view illumination outside window */}
      <directionalLight position={[-4, 2, -5]} intensity={1.8} color="#6ea2e8" />

      {/* ── Room Structures ──────────────────────────────────────────────────── */}
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#283348" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#202a3a" roughness={0.7} />
      </mesh>

      {/* Ceiling Warm Recessed Light Cove */}
      {quartersLightsOn && (
        <mesh position={[0, 2.98, 0]}>
          <boxGeometry args={[6, 0.04, 1.2]} />
          <meshBasicMaterial color="#eef5ff" />
        </mesh>
      )}

      {/* Back Wall with Cutout Window Panels */}
      <mesh position={[-3.25, 0.75, -2]}>
        <planeGeometry args={[5.5, 4.5]} />
        <meshStandardMaterial color="#2d3a52" roughness={0.6} />
      </mesh>
      <mesh position={[3.25, 0.75, -2]}>
        <planeGeometry args={[5.5, 4.5]} />
        <meshStandardMaterial color="#2d3a52" roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.35, -2]}>
        <planeGeometry args={[12, 1.3]} />
        <meshStandardMaterial color="#2d3a52" roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.95, -2]}>
        <planeGeometry args={[12, 1.1]} />
        <meshStandardMaterial color="#2d3a52" roughness={0.6} />
      </mesh>

      {/* Sleek Window Frame Trim */}
      <mesh position={[0, 0.7, -1.99]}>
        <boxGeometry args={[3.2, 2.1, 0.05]} />
        <meshStandardMaterial color="#384966" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Glass Pane (Clickable window) */}
      <mesh 
        position={[0, 0.7, -2.01]}
        onClick={handleWindowClick}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredWindow(true); }}
        onPointerOut={() => setHoveredWindow(false)}
      >
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial 
          color={hoveredWindow ? "#00ffff" : "#00ddff"} 
          transparent 
          opacity={0.08} 
          roughness={0.05} 
          metalness={0.95} 
        />
      </mesh>


      {/* Window Interactive 3D Marker */}
      <InteractiveMarker3D
        position={[0, 1.6, -1.95]}
        label="VIEWPORT"
        actionHint="OBSERVE"
        accentColor="#00ffff"
        icon="🪐"
        onClick={handleWindowClick}
      />

      {/* ── Sleeping Capsule / Pod (Clickable) ───────────────────────────────── */}
      <group 
        ref={bedRef} 
        position={[-1.8, -1.2, -1.1]} 
        rotation={[0, 0.4, 0]}
        onClick={handleBedClick}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredBed(true); }}
        onPointerOut={() => setHoveredBed(false)}
      >
        <InteractiveMarker3D
          position={[0, 0.9, 0]}
          label="SLEEP POD"
          actionHint="REST"
          accentColor="#00ffff"
          icon="🛏️"
          onClick={handleBedClick}
        />

        {/* Capsule Base */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[1.4, 0.5, 2.1]} />
          <meshStandardMaterial color="#2e3a50" roughness={0.4} metalness={0.6} />
        </mesh>
        
        {/* Mattress */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.2, 0.1, 1.8]} />
          <meshStandardMaterial color="#f0f3f8" roughness={0.8} />
        </mesh>

        {/* Pillow */}
        <mesh position={[0, 0.57, -0.7]}>
          <boxGeometry args={[1.0, 0.08, 0.35]} />
          <meshStandardMaterial color="#cfd7e6" roughness={0.85} />
        </mesh>

        {/* LED Glowing Trim Stripe */}
        <mesh name="ledTrim" position={[0, 0.48, 1.01]}>
          <boxGeometry args={[1.32, 0.04, 0.04]} />
          <meshStandardMaterial 
            color={hoveredBed ? "#00ffff" : "#3385ff"} 
            emissive={hoveredBed ? "#00ffff" : "#0055ff"} 
            emissiveIntensity={0.8} 
          />
        </mesh>
      </group>

      {/* ── Desk & Keyboard Workstation ───────────────────────────────────────── */}
      <group position={[1.8, -1.1, -1.2]} rotation={[0, -0.4, 0]}>
        {/* Desk Table */}
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[1.6, 0.7, 0.8]} />
          <meshStandardMaterial color="#2f3b52" roughness={0.3} metalness={0.6} />
        </mesh>

        {/* Laptop/Terminal Stand */}
        <mesh position={[-0.2, 0.75, -0.1]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.5, 0.04, 0.35]} />
          <meshStandardMaterial color="#1a2233" roughness={0.2} metalness={0.7} />
        </mesh>
        
        {/* Glowing Terminal Screen */}
        <mesh position={[-0.2, 0.95, -0.22]} rotation={[0.1, 0, 0]}>
          <planeGeometry args={[0.45, 0.3]} />
          <meshStandardMaterial color="#3385ff" emissive="#1144aa" emissiveIntensity={1.4} />
        </mesh>

        {/* Keyboard plate */}
        <mesh position={[-0.2, 0.71, 0.15]}>
          <boxGeometry args={[0.42, 0.02, 0.18]} />
          <meshStandardMaterial color="#3a4760" metalness={0.5} />
        </mesh>

        {/* ── Interactive Desk Lamp (Clickable) ── */}
        <group 
          position={[0.5, 0.7, 0.05]}
          onClick={handleLampClick}
          onPointerOver={(e) => { e.stopPropagation(); setHoveredLamp(true); }}
          onPointerOut={() => setHoveredLamp(false)}
        >
          <InteractiveMarker3D
            position={[0, 0.55, 0]}
            label="DESK LAMP"
            actionHint="TOGGLE"
            accentColor="#ffea88"
            icon="💡"
            onClick={handleLampClick}
          />

          {/* Lamp Base */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.08, 0.09, 0.03, 10]} />
            <meshStandardMaterial color="#445570" metalness={0.9} />
          </mesh>
          {/* Arm */}
          <mesh position={[-0.04, 0.18, -0.02]} rotation={[0, 0, -0.2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.32, 8]} />
            <meshStandardMaterial color="#aaaaaa" metalness={1.0} />
          </mesh>
          {/* Bulb head */}
          <mesh position={[-0.08, 0.32, 0.02]} rotation={[0, 0, 0.5]}>
            <cylinderGeometry args={[0.06, 0.08, 0.09, 10]} />
            <meshStandardMaterial color="#2d3748" metalness={0.9} />
          </mesh>
          {/* Light bulb (emissive glowing) */}
          <mesh 
            ref={lampBulbRef}
            position={[-0.08, 0.28, 0.02]}
          >
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial 
              color={quartersLightsOn ? "#ffea88" : "#444444"} 
              emissive={quartersLightsOn ? "#ffea88" : "#111111"}
              emissiveIntensity={quartersLightsOn ? 2.8 : 0.0}
            />
          </mesh>
          {/* Spotlight cast downward */}
          <spotLight
            position={[-0.08, 0.25, 0.02]}
            intensity={quartersLightsOn ? 4.0 : 0}
            color="#ffe2a8"
            distance={3.2}
            angle={Math.PI / 3}
            penumbra={0.6}
          />
        </group>

        {/* Chair */}
        <group position={[-0.2, -0.05, 0.7]} rotation={[0, 0.3, 0]}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.45, 0.06, 0.45]} />
            <meshStandardMaterial color="#38455e" roughness={0.6} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.42, -0.2]}>
            <boxGeometry args={[0.42, 0.5, 0.05]} />
            <meshStandardMaterial color="#38455e" roughness={0.6} metalness={0.3} />
          </mesh>
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.44, 8]} />
            <meshStandardMaterial color="#cccccc" metalness={0.95} />
          </mesh>
        </group>
      </group>

      {/* ── Picture Frame / Memory Board (Clickable) ─────────────────────────── */}
      <group 
        position={[-4.5, 1.25, -1.98]}
        onClick={handleFrameClick}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredFrame(true); }}
        onPointerOut={() => setHoveredFrame(false)}
      >
        <InteractiveMarker3D
          position={[0, 0.5, 0.05]}
          label="MEMORY LOG"
          actionHint="CYCLE"
          accentColor="#00ff88"
          icon="🖼️"
          onClick={handleFrameClick}
        />

        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.9, 0.7, 0.04]} />
          <meshStandardMaterial color="#2d374a" roughness={0.6} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.025]}>
          <planeGeometry args={[0.8, 0.6]} />
          <meshStandardMaterial 
            color={hoveredFrame ? "#00ffff" : "#00aa77"} 
            emissive={hoveredFrame ? "#00ffff" : "#005533"} 
            emissiveIntensity={hoveredFrame ? 1.8 : 0.6} 
          />
        </mesh>
      </group>

      {/* Personal Storage Locker (Sci-Fi Cabinet) */}
      <group position={[-5.3, -0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[0.8, 2.4, 0.6]} />
          <meshStandardMaterial color="#2e3c54" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0.01, 0, 0.301]}>
          <boxGeometry args={[0.02, 2.2, 0.02]} />
          <meshStandardMaterial color="#00e5ff" />
        </mesh>
      </group>
    </group>
  );
}


