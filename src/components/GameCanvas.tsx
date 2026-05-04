import { Canvas } from '@react-three/fiber';
import { useGameStore } from '../state/useGameStore';
import { BarScene } from '../features/bar/BarScene';
import { BriefingScene } from '../features/briefing/BriefingScene';
import { QuartersScene } from '../features/quarters/QuartersScene';
import { FlightScene } from '../features/flight/FlightScene';

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
    // MENU fallback
    default:
      return null;
  }
}

export function GameCanvas() {
  return (
    <Canvas camera={{ position: [0, 1, 5] }}>
      <color attach="background" args={['#050505']} />
      <SceneManager />
    </Canvas>
  );
}
