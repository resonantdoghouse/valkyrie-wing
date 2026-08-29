import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { useGameStore } from '../state/useGameStore';
import { useDebugStore } from '../debug/useDebugStore';
import { BarScene } from '../features/bar/BarScene';
import { BriefingScene } from '../features/briefing/BriefingScene';
import { QuartersScene } from '../features/quarters/QuartersScene';
import { FlightScene } from '../features/flight/FlightScene';
import { LaunchScene } from '../features/flight/LaunchScene';
import { LandingScene } from '../features/flight/LandingScene';

function SceneManager() {
  const currentMode = useGameStore((state) => state.currentMode);

  switch (currentMode) {
    case 'BAR':
      return <BarScene />;
    case 'BRIEFING':
      return <BriefingScene />;
    case 'QUARTERS':
      return <QuartersScene />;
    case 'FLIGHT':
      return <FlightScene />;
    case 'LAUNCH':
      return <LaunchScene />;
    case 'LANDING':
      return <LandingScene />;
    default:
      return null;
  }
}

function DebugOverlays() {
  const showStats = useDebugStore(state => state.showStats);
  const showDirections = useDebugStore(state => state.showDirections);

  return (
    <>
      {showStats && <Stats />}
      {showDirections && (
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport axisColors={['#ff4444', '#44ff44', '#4488ff']} labelColor="#ffffff" />
        </GizmoHelper>
      )}
    </>
  );
}

export function GameCanvas() {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 1, 5], fov: 60, far: 50000 }}>
      <color attach="background" args={['#0a1329']} />
      <Suspense fallback={null}>
        <SceneManager />
      </Suspense>
      <DebugOverlays />
    </Canvas>
  );
}

