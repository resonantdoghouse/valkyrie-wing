import { useGameStore } from './state/useGameStore';
import { useMissionStore } from './state/useMissionStore';
import { GameCanvas } from './components/GameCanvas';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ScanlineOverlay } from './components/ui/ScanlineOverlay';
import { LCDPanel } from './components/ui/LCDPanel';
import { TerminalText } from './components/ui/TerminalText';
import { LoadingBar } from './components/ui/LoadingBar';
import { BarUI } from './features/bar/BarUI';
import { DebugPanel } from './debug/DebugPanel';
import { FlightHUD } from './features/flight/FlightHUD';
import { initAudio } from './utils/audio';

function App() {
  const { currentMode, setMode } = useGameStore();
  const { startMission } = useMissionStore();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Dev debug panel — press ` to toggle */}
      <DebugPanel />

      {/* Cinematic CRT/Scanline Overlay globally */}
      <ScanlineOverlay />

      {/* 3D Canvas rendering in the background or as main view depending on mode */}
      <ErrorBoundary>
        <GameCanvas />
      </ErrorBoundary>

      {/* 2D Overlay */}
      {currentMode === 'MENU' && (
        <div className="overlay">
          <LCDPanel>
            <TerminalText as="h1" className="terminal-title" text="Valkyrie Wing" />
            <TerminalText as="p" text="> SYSTEM INITIALIZED." delay={20} />
            <TerminalText as="p" text="> AWAITING PILOT INPUT..." delay={30} />
            <LoadingBar />
            <button className="interactive-btn" onClick={() => {
              initAudio();
              setMode('BAR');
            }} style={{ marginTop: '1rem' }}>
              START GAME
            </button>
          </LCDPanel>
        </div>
      )}

      {currentMode === 'BAR' && (
        <BarUI />
      )}

      {currentMode === 'BRIEFING' && (
        <div className="overlay" style={{ backgroundColor: 'transparent', justifyContent: 'flex-start', paddingTop: '2rem' }}>
          <LCDPanel style={{ maxWidth: '600px' }}>
            <TerminalText as="h2" className="terminal-title" text="Briefing Room" />
            <TerminalText as="p" text="> Objective: Escort Vanguard Cargo to Waypoint Alpha." delay={20} />
            <TerminalText as="p" text="> Warning: Nebula Remnant interceptors detected." delay={20} />
            <button className="interactive-btn" onClick={() => setMode('BAR')} style={{ marginTop: '1rem' }}>
              BACK TO BAR
            </button>
            <button className="interactive-btn" onClick={() => {
              startMission('m1_escort_alpha');
              setMode('LAUNCH');
            }} style={{ marginTop: '0.5rem', background: 'rgba(255, 51, 51, 0.2)' }}>
              LAUNCH MISSION
            </button>
          </LCDPanel>
        </div>
      )}

      {currentMode === 'QUARTERS' && (
        <div className="overlay" style={{ backgroundColor: 'transparent', justifyContent: 'flex-start', paddingTop: '2rem' }}>
          <LCDPanel style={{ maxWidth: '500px', marginLeft: 'auto', marginRight: '2rem' }}>
            <TerminalText as="h2" className="terminal-title" text="Crew Quarters" />
            <TerminalText as="p" text="> Status: Resting." delay={30} />
            <TerminalText as="p" text="> Rank: Ensign." delay={30} />
            <button className="interactive-btn" onClick={() => setMode('BAR')} style={{ marginTop: '1rem' }}>
              BACK TO BAR
            </button>
          </LCDPanel>
        </div>
      )}

      {currentMode === 'FLIGHT' && <FlightHUD />}

      {(currentMode === 'LAUNCH' || currentMode === 'LANDING') && (
        <div className="overlay" style={{ backgroundColor: 'transparent', pointerEvents: 'none' }}>
          <TerminalText
            as="h2"
            text={currentMode === 'LAUNCH' ? "LAUNCH SEQUENCE INITIATED" : "AUTO-LANDING ENGAGED"}
            className="terminal-title"
            style={{ color: 'var(--theme-color)', position: 'absolute', top: '10%', textShadow: '0 0 10px var(--theme-glow)' }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
