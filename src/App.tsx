import { useEffect } from 'react';
import { useGameStore } from './state/useGameStore';
import { useMissionStore } from './state/useMissionStore';
import { useCombatStore } from './state/useCombatStore';
import { GameCanvas } from './components/GameCanvas';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ScanlineOverlay } from './components/ui/ScanlineOverlay';
import { LCDPanel } from './components/ui/LCDPanel';
import { TerminalText } from './components/ui/TerminalText';
import { LoadingBar } from './components/ui/LoadingBar';
import { BarUI } from './features/bar/BarUI';
import { DebugPanel } from './debug/DebugPanel';
import { FlightHUD } from './features/flight/FlightHUD';
import { initAudio, startAmbientSound, stopAmbientSound, playMenuHoverSound, playMenuClickSound } from './utils/audio';
import { ShipHUDHeader } from './components/ui/ShipHUDHeader';

function App() {
  const { currentMode, setMode, quartersLogs, briefingMode, setBriefingMode, cinematicViewMode, toggleCinematicViewMode } = useGameStore();
  const { startMission } = useMissionStore();

  useEffect(() => {
    if (currentMode === 'BAR' || currentMode === 'BRIEFING' || currentMode === 'QUARTERS') {
      startAmbientSound(currentMode);
    } else {
      stopAmbientSound();
    }
  }, [currentMode]);

  // Global key listener for 'H' (View Mode Toggle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'h' || e.key === 'H') && (currentMode === 'BAR' || currentMode === 'BRIEFING' || currentMode === 'QUARTERS')) {
        toggleCinematicViewMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMode, toggleCinematicViewMode]);

  // Global UI Button SFX listeners
  useEffect(() => {
    let lastHovered: HTMLElement | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement)?.closest('button, .interactive-btn, .interactive-marker-3d');
      if (btn) {
        if (lastHovered !== btn) {
          lastHovered = btn as HTMLElement;
          playMenuHoverSound();
        }
      } else {
        lastHovered = null;
      }
    };

    const handleClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement)?.closest('button, .interactive-btn, .interactive-marker-3d');
      if (btn) {
        playMenuClickSound();
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('click', handleClick);
    };
  }, []);

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
            <button className="interactive-btn interactive-btn--positive" onClick={() => {
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
        <>
          <ShipHUDHeader />

          {!cinematicViewMode ? (
            <div className="dialogue-console-container">
              <div className="dialogue-console">
                {/* Header Badge */}
                <div className="character-avatar-badge">
                  <div className="character-avatar-icon" style={{ borderColor: '#00ffff', color: '#00ffff' }}>
                    🌐
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', letterSpacing: '0.08rem' }}>
                        MISSION COMMAND // TACTICAL BRIEFING
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-highlight)' }}>
                        SECTOR 7 &bull; OPERATION VALKYRIE
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                      PROJECTOR STATUS: ACTIVE &bull; GRID MODE: {briefingMode}
                    </div>
                  </div>
                </div>

                <div className="dialogue-content-grid" style={{ marginTop: '0.75rem' }}>
                  <div className="dialogue-speech-box">
                    <TerminalText as="p" text="> MISSION: Escort Vanguard Cargo to Waypoint Alpha." delay={10} style={{ margin: 0, fontSize: '0.95rem', color: '#00ff88', fontWeight: 'bold' }} />
                    <TerminalText as="p" text="> Threat intel: Hostile Nebula Remnant interceptors detected in sector." delay={10} style={{ margin: '4px 0', fontSize: '0.9rem' }} />
                    <TerminalText 
                      key={briefingMode}
                      as="p" 
                      text={
                        briefingMode === 'NAV' ? "> Tactical Projection: Navigational Grid Alpha Active. Waypoint corridors marked." :
                        briefingMode === 'HAZARDS' ? "> Tactical Projection: Nebula Asteroid & Plasma Density Map Active." :
                        "> Tactical Projection: Intercept Trajectory & Enemy Patrol Routing Active."
                      } 
                      style={{ color: 'var(--theme-color)', fontSize: '0.85rem', margin: '4px 0 0 0' }}
                      delay={10} 
                    />
                  </div>

                  <div className="dialogue-actions-box">
                    <button className="interactive-btn interactive-btn--positive" onClick={() => {
                      startMission('m1_escort_alpha');
                      useCombatStore.getState().initMissionEnemies('m1_escort_alpha');
                      setMode('LAUNCH');
                    }} style={{ padding: '0.65rem', fontSize: '1rem' }}>
                      🚀 LAUNCH MISSION
                    </button>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                      <button className="interactive-btn" onClick={() => {
                        const modes: ('NAV' | 'HAZARDS' | 'TACTICAL')[] = ['NAV', 'HAZARDS', 'TACTICAL'];
                        const next = modes[(modes.indexOf(briefingMode) + 1) % modes.length];
                        setBriefingMode(next);
                      }} style={{ padding: '0.45rem', fontSize: '0.85rem' }}>
                        🔄 CYCLE GRID ({briefingMode})
                      </button>
                      <button className="interactive-btn interactive-btn--secondary" onClick={() => setMode('BAR')} style={{ padding: '0.45rem', fontSize: '0.85rem' }}>
                        &larr; BACK TO BAR
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 500, pointerEvents: 'auto' }}>
              <button
                className="interactive-btn interactive-btn--secondary"
                onClick={toggleCinematicViewMode}
                style={{
                  padding: '6px 16px',
                  fontSize: '0.85rem',
                  backdropFilter: 'blur(8px)',
                  background: 'rgba(5, 10, 31, 0.8)',
                  border: '1px solid #00ffff',
                  color: '#00ffff',
                  boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)'
                }}
              >
                💬 OPEN BRIEFING CONSOLE [H]
              </button>
            </div>
          )}
        </>
      )}

      {currentMode === 'QUARTERS' && (
        <>
          <ShipHUDHeader />

          {!cinematicViewMode ? (
            <div className="dialogue-console-container">
              <div className="dialogue-console">
                {/* Header Badge */}
                <div className="character-avatar-badge">
                  <div className="character-avatar-icon" style={{ borderColor: '#00ff88', color: '#00ff88' }}>
                    🛏️
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', letterSpacing: '0.08rem' }}>
                        PERSONAL QUARTERS // CABIN 07
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-highlight)' }}>
                        ENSIGN SUITE
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                      LIFE SUPPORT: NORMAL &bull; REGENERATION POD: STANDBY &bull; VIEWPORT: SHIELDED
                    </div>
                  </div>
                </div>

                <div className="dialogue-content-grid" style={{ marginTop: '0.75rem' }}>
                  <div className="dialogue-speech-box">
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-highlight)', fontWeight: 'bold', marginBottom: '2px' }}>QUARTERS ACTIVITY LOG:</div>
                    {quartersLogs.map((log, i) => (
                      <TerminalText key={`${i}-${log}`} as="p" text={log} delay={3} style={{ fontSize: '0.85rem', margin: '1px 0', color: 'rgba(255,255,255,0.85)' }} />
                    ))}
                  </div>

                  <div className="dialogue-actions-box">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                      <button className="interactive-btn" onClick={() => {
                        useGameStore.getState().toggleQuartersLights();
                      }} style={{ padding: '0.5rem', fontSize: '0.85rem' }}>
                        💡 TOGGLE LIGHTS
                      </button>
                      <button className="interactive-btn" onClick={() => {
                        useGameStore.getState().addQuartersLog("> Memory Core: Holographic photo log refreshed.");
                      }} style={{ padding: '0.5rem', fontSize: '0.85rem' }}>
                        🖼️ MEMORY LOG
                      </button>
                    </div>
                    <button className="interactive-btn interactive-btn--positive" onClick={() => {
                      useGameStore.getState().addQuartersLog("> Regeneration pod activated. Vitals recovered.");
                    }} style={{ padding: '0.55rem', fontSize: '0.9rem' }}>
                      🛏️ REST IN REGEN POD
                    </button>
                    <button className="interactive-btn interactive-btn--secondary" onClick={() => setMode('BAR')} style={{ padding: '0.45rem', fontSize: '0.85rem' }}>
                      &larr; RETURN TO BAR
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 500, pointerEvents: 'auto' }}>
              <button
                className="interactive-btn interactive-btn--secondary"
                onClick={toggleCinematicViewMode}
                style={{
                  padding: '6px 16px',
                  fontSize: '0.85rem',
                  backdropFilter: 'blur(8px)',
                  background: 'rgba(5, 10, 31, 0.8)',
                  border: '1px solid #00ffff',
                  color: '#00ffff',
                  boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)'
                }}
              >
                💬 OPEN CABIN CONSOLE [H]
              </button>
            </div>
          )}
        </>
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

