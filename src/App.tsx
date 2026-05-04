import { useGameStore } from './state/useGameStore';
import { GameCanvas } from './components/GameCanvas';
import { ScanlineOverlay } from './components/ui/ScanlineOverlay';
import { LCDPanel } from './components/ui/LCDPanel';
import { TerminalText } from './components/ui/TerminalText';

function App() {
  const { currentMode, setMode } = useGameStore();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Cinematic CRT/Scanline Overlay globally */}
      <ScanlineOverlay />

      {/* 3D Canvas rendering in the background or as main view depending on mode */}
      <GameCanvas />

      {/* 2D Overlay */}
      {currentMode === 'MENU' && (
        <div className="overlay">
          <LCDPanel>
            <TerminalText as="h1" className="terminal-title" text="Wing Commando" />
            <TerminalText as="p" text="> SYSTEM INITIALIZED." delay={20} />
            <TerminalText as="p" text="> AWAITING PILOT INPUT..." delay={30} />
            <button className="interactive-btn" onClick={() => setMode('BAR')} style={{ marginTop: '1rem' }}>
              INITIATE LAUNCH SEQUENCE
            </button>
          </LCDPanel>
        </div>
      )}

      {currentMode === 'BAR' && (
        <div className="overlay" style={{ backgroundColor: 'transparent' }}>
          <LCDPanel style={{ position: 'absolute', bottom: '10%', left: '10%' }}>
            <TerminalText as="h2" className="terminal-title" text="The Vanguard Bar" />
            <TerminalText as="p" text="> Welcome back, Ensign." delay={30} />
            <TerminalText as="p" text="> The Nebula Remnant forces are pushing sector 4." delay={40} />
            <button className="interactive-btn" onClick={() => setMode('BRIEFING')} style={{ marginTop: '1rem' }}>
              GO TO BRIEFING ROOM
            </button>
            <button className="interactive-btn" onClick={() => setMode('QUARTERS')} style={{ marginTop: '0.5rem' }}>
              GO TO QUARTERS
            </button>
            <button className="interactive-btn" onClick={() => setMode('MENU')} style={{ marginTop: '0.5rem', opacity: 0.7 }}>
              RETURN TO DECK
            </button>
          </LCDPanel>
        </div>
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
            <button className="interactive-btn" onClick={() => setMode('FLIGHT')} style={{ marginTop: '0.5rem', background: 'rgba(255, 51, 102, 0.2)' }}>
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

      {currentMode === 'FLIGHT' && (
        <div className="overlay" style={{ backgroundColor: 'transparent', pointerEvents: 'none', justifyContent: 'space-between', padding: '2rem' }}>
          {/* Top HUD */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
            <TerminalText as="h2" text="SYS: ONLINE" className="terminal-text" style={{ color: '#00ffcc', textShadow: '0 0 10px #00ffcc' }} />
            <TerminalText as="h2" text="TARGETING: ACQUIRED" className="terminal-text" style={{ color: '#ff3366', textShadow: '0 0 10px #ff3366' }} />
          </div>

          {/* Bottom HUD */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div style={{ pointerEvents: 'auto' }}>
              <button className="interactive-btn" onClick={() => setMode('BAR')} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'rgba(0,0,0,0.5)' }}>
                ABORT MISSION
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
