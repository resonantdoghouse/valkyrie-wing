import { useGameStore } from './state/useGameStore';
import { useMissionStore } from './state/useMissionStore';
import { GameCanvas } from './components/GameCanvas';
import { ScanlineOverlay } from './components/ui/ScanlineOverlay';
import { LCDPanel } from './components/ui/LCDPanel';
import { TerminalText } from './components/ui/TerminalText';
import { BarUI } from './features/bar/BarUI';
import { initAudio } from './utils/audio';

function App() {
  const { currentMode, setMode } = useGameStore();
  const { activeMission, startMission, completeMission } = useMissionStore();

  const isMissionComplete = activeMission?.objectives.every(o => o.completed) || false;

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
            <button className="interactive-btn" onClick={() => {
              initAudio();
              setMode('BAR');
            }} style={{ marginTop: '1rem' }}>
              INITIATE LAUNCH SEQUENCE
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
            }} style={{ marginTop: '0.5rem', background: 'rgba(255, 51, 102, 0.2)' }}>
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
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <TerminalText as="h2" text="SYS: ONLINE" className="terminal-text" style={{ color: '#00ffcc', textShadow: '0 0 10px #00ffcc' }} />
              
              {/* Mission Objectives */}
              {activeMission && (
                <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #00ffcc', background: 'rgba(0, 255, 204, 0.1)' }}>
                  <TerminalText as="h2" text={`MISSION: ${activeMission.title}`} className="terminal-text" style={{ color: '#ffffff', fontSize: '1.2rem' }} />
                  {activeMission.objectives.map(obj => (
                    <div key={obj.id} style={{ color: obj.completed ? '#00ffcc' : '#ffaa00', marginTop: '0.5rem', fontFamily: "'Share Tech Mono', monospace", fontSize: '1.2rem' }}>
                      {obj.completed ? '[✓]' : '[ ]'} {obj.type}: {obj.target} ({obj.currentCount}/{obj.count})
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <TerminalText as="h2" text="TARGETING: ACQUIRED" className="terminal-text" style={{ color: '#ff3366', textShadow: '0 0 10px #ff3366' }} />
          </div>

          {/* Mission Complete Overlay */}
          {isMissionComplete && (
            <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'auto', textAlign: 'center' }}>
              <TerminalText as="h1" text="MISSION COMPLETE" className="terminal-title" style={{ color: '#00ffcc', textShadow: '0 0 20px #00ffcc' }} />
              <button className="interactive-btn" onClick={() => {
                setMode('LANDING');
              }} style={{ marginTop: '1rem', padding: '1rem 2rem', fontSize: '1.5rem', background: 'rgba(0, 255, 204, 0.2)' }}>
                RETURN TO BASE
              </button>
            </div>
          )}

          {/* Bottom HUD */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div style={{ pointerEvents: 'auto' }}>
              {!isMissionComplete && (
                <button className="interactive-btn" onClick={() => {
                  completeMission();
                  setMode('BAR');
                }} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'rgba(0,0,0,0.5)' }}>
                  ABORT MISSION
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {(currentMode === 'LAUNCH' || currentMode === 'LANDING') && (
        <div className="overlay" style={{ backgroundColor: 'transparent', pointerEvents: 'none' }}>
           <TerminalText 
             as="h2" 
             text={currentMode === 'LAUNCH' ? "LAUNCH SEQUENCE INITIATED" : "AUTO-LANDING ENGAGED"} 
             className="terminal-title" 
             style={{ color: '#00ffcc', position: 'absolute', top: '10%', textShadow: '0 0 10px #00ffcc' }} 
           />
        </div>
      )}
    </div>
  );
}

export default App;
