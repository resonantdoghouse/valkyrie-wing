import { useGameStore } from './state/useGameStore';
import { useMissionStore } from './state/useMissionStore';
import { useCombatStore } from './state/useCombatStore';
import { GameCanvas } from './components/GameCanvas';
import { ScanlineOverlay } from './components/ui/ScanlineOverlay';
import { LCDPanel } from './components/ui/LCDPanel';
import { TerminalText } from './components/ui/TerminalText';
import { BarUI } from './features/bar/BarUI';
import { DebugPanel } from './debug/DebugPanel';
import { initAudio } from './utils/audio';

function App() {
  const { currentMode, setMode, isPlayerDead } = useGameStore();
  const { activeMission, startMission, completeMission, arcadeLevel, arcadeScore } = useMissionStore();
  const combatEnemies = useCombatStore(state => state.enemies);

  const isMissionComplete = activeMission && !activeMission.id.startsWith('arcade') && activeMission.objectives.every(o => o.completed);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Dev debug panel — press ` to toggle */}
      <DebugPanel />

      {/* Cinematic CRT/Scanline Overlay globally */}
      <ScanlineOverlay />

      {/* 3D Canvas rendering in the background or as main view depending on mode */}
      <GameCanvas />

      {/* 2D Overlay */}
      {currentMode === 'MENU' && (
        <div className="overlay">
          <LCDPanel>
            <TerminalText as="h1" className="terminal-title" text="Valkyrie Wing" />
            <TerminalText as="p" text="> SYSTEM INITIALIZED." delay={20} />
            <TerminalText as="p" text="> AWAITING PILOT INPUT..." delay={30} />
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

      {currentMode === 'FLIGHT' && (
        <div className="overlay" style={{ backgroundColor: 'transparent', pointerEvents: 'none', justifyContent: 'space-between', padding: '2rem' }}>
          {/* Top HUD */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <TerminalText as="h2" text="SYS: ONLINE" className="terminal-text" style={{ color: 'var(--theme-color)', textShadow: '0 0 10px var(--theme-glow)' }} />

              {/* Mission Objectives */}
              {activeMission && (
                <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid var(--theme-color)', background: 'rgba(51, 133, 255, 0.1)' }}>
                  <TerminalText as="h2" text={`MISSION: ${activeMission.title}`} className="terminal-text" style={{ color: '#ffffff', fontSize: '1.2rem' }} />
                  {activeMission.id.startsWith('arcade_sim') ? (
                    <>
                      <div style={{ color: 'var(--text-highlight)', marginTop: '0.5rem', fontFamily: "'Share Tech Mono', monospace", fontSize: '1.2rem' }}>
                        WAVE: {arcadeLevel}
                      </div>
                      <div style={{ color: 'var(--text-highlight)', marginTop: '0.5rem', fontFamily: "'Share Tech Mono', monospace", fontSize: '1.2rem' }}>
                        SCORE: {arcadeScore}
                      </div>
                      <div style={{ color: 'var(--accent-orange)', marginTop: '0.5rem', fontFamily: "'Share Tech Mono', monospace", fontSize: '1.2rem' }}>
                        ENEMIES REMAINING: {combatEnemies.filter(e => e.active).length}
                      </div>
                    </>
                  ) : (
                    activeMission.objectives.map(obj => (
                      <div key={obj.id} style={{ color: obj.completed ? 'var(--text-highlight)' : 'var(--accent-orange)', marginTop: '0.5rem', fontFamily: "'Share Tech Mono', monospace", fontSize: '1.2rem' }}>
                        {obj.completed ? '[✓]' : '[ ]'} {obj.type}: {obj.target} ({obj.currentCount}/{obj.count})
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <TerminalText as="h2" text="TARGETING: ACQUIRED" className="terminal-text" style={{ color: 'var(--danger-color)', textShadow: '0 0 10px var(--danger-color)' }} />
          </div>

          {/* Mission Complete Overlay */}
          {isMissionComplete && !isPlayerDead && (
            <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'auto', textAlign: 'center' }}>
              <TerminalText as="h1" text={activeMission?.id.startsWith('arcade') ? "ARCADE SIMULATION COMPLETE" : "MISSION COMPLETE"} className="terminal-title" style={{ color: 'var(--text-highlight)', textShadow: '0 0 20px var(--text-highlight)' }} />
              <button className="interactive-btn" onClick={() => {
                completeMission();
                if (activeMission?.id.startsWith('arcade')) {
                  setMode('BAR');
                } else {
                  setMode('LANDING');
                }
              }} style={{ marginTop: '1rem', padding: '1rem 2rem', fontSize: '1.5rem', background: 'rgba(51, 133, 255, 0.2)' }}>
                {activeMission?.id.startsWith('arcade') ? "EXIT SIMULATOR" : "RETURN TO BASE"}
              </button>
            </div>
          )}

          {/* Game Over Overlay */}
          {isPlayerDead && (
            <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'auto', textAlign: 'center' }}>
              <TerminalText as="h1" text={activeMission?.id.startsWith('arcade') ? "SIMULATION FAILED" : "KIA"} className="terminal-title" style={{ color: 'var(--danger-color)', textShadow: '0 0 20px var(--danger-color)' }} />
              {activeMission?.id.startsWith('arcade') && (
                <div style={{ marginBottom: '1rem' }}>
                  <TerminalText as="h2" text={`FINAL SCORE: ${arcadeScore}`} style={{ color: 'var(--text-highlight)' }} />
                </div>
              )}
              <button className="interactive-btn" onClick={() => {
                if (activeMission?.id.startsWith('arcade')) {
                  // Save to leaderboard
                  const lb = JSON.parse(localStorage.getItem('vanguard_arcade_leaderboard') || '[]');
                  lb.push({ name: 'Ensign', score: arcadeScore });
                  lb.sort((a: any, b: any) => b.score - a.score);
                  localStorage.setItem('vanguard_arcade_leaderboard', JSON.stringify(lb.slice(0, 10)));
                }
                completeMission();
                setMode('BAR'); // Respawn at the bar for now
              }} style={{ marginTop: '1rem', padding: '1rem 2rem', fontSize: '1.5rem', background: 'rgba(255, 51, 51, 0.2)' }}>
                {activeMission?.id.startsWith('arcade') ? "EXIT SIMULATOR" : "RESPAWN"}
              </button>
            </div>
          )}

          {/* Bottom HUD */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div style={{ pointerEvents: 'auto' }}>
              {!isMissionComplete && !isPlayerDead && (
                <button className="interactive-btn" onClick={() => {
                  if (activeMission?.id.startsWith('arcade')) {
                    // Save to leaderboard
                    const lb = JSON.parse(localStorage.getItem('vanguard_arcade_leaderboard') || '[]');
                    lb.push({ name: 'Ensign', score: arcadeScore });
                    lb.sort((a: any, b: any) => b.score - a.score);
                    localStorage.setItem('vanguard_arcade_leaderboard', JSON.stringify(lb.slice(0, 10)));
                  }
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
            style={{ color: 'var(--theme-color)', position: 'absolute', top: '10%', textShadow: '0 0 10px var(--theme-glow)' }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
