import { useGameStore } from '../../state/useGameStore';
import { useMissionStore } from '../../state/useMissionStore';
import { useCombatStore } from '../../state/useCombatStore';
import { TerminalText } from '../../components/ui/TerminalText';
import './flight.css';

export function FlightHUD() {
  const { setMode, isPlayerDead, boundaryWarning } = useGameStore();
  const { activeMission, completeMission, arcadeLevel, arcadeScore } = useMissionStore();
  const activeEnemyCount = useCombatStore(state => state.enemies.filter(e => e.active).length);

  const isMissionComplete =
    activeMission &&
    !activeMission.id.startsWith('arcade') &&
    activeMission.objectives.every(o => o.completed);

  const isArcade = activeMission?.id.startsWith('arcade') ?? false;

  const saveLeaderboardAndExit = () => {
    if (isArcade) {
      const lb = JSON.parse(localStorage.getItem('vanguard_arcade_leaderboard') || '[]');
      lb.push({ name: 'Ensign', score: arcadeScore });
      lb.sort((a: { score: number }, b: { score: number }) => b.score - a.score);
      localStorage.setItem('vanguard_arcade_leaderboard', JSON.stringify(lb.slice(0, 10)));
    }
    completeMission();
    setMode('BAR');
  };

  return (
    <div
      className="overlay"
      style={{ backgroundColor: 'transparent', pointerEvents: 'none', justifyContent: 'space-between', padding: '2rem' }}
    >
      {/* Top HUD */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <TerminalText
            as="h2"
            text="SYS: ONLINE"
            className="terminal-text"
            style={{ color: 'var(--theme-color)', textShadow: '0 0 10px var(--theme-glow)' }}
          />

          {activeMission && (
            <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid var(--theme-color)', background: 'rgba(51, 133, 255, 0.1)' }}>
              <TerminalText
                as="h2"
                text={`MISSION: ${activeMission.title}`}
                className="terminal-text"
                style={{ color: '#ffffff', fontSize: '1.2rem' }}
              />
              {isArcade ? (
                <>
                  <div style={{ color: 'var(--text-highlight)', marginTop: '0.5rem', fontFamily: "'Share Tech Mono', monospace", fontSize: '1.2rem' }}>
                    WAVE: {arcadeLevel}
                  </div>
                  <div style={{ color: 'var(--text-highlight)', marginTop: '0.5rem', fontFamily: "'Share Tech Mono', monospace", fontSize: '1.2rem' }}>
                    SCORE: {arcadeScore}
                  </div>
                  <div style={{ color: 'var(--accent-orange)', marginTop: '0.5rem', fontFamily: "'Share Tech Mono', monospace", fontSize: '1.2rem' }}>
                    ENEMIES REMAINING: {activeEnemyCount}
                  </div>
                </>
              ) : (
                activeMission.objectives.map(obj => (
                  <div
                    key={obj.id}
                    style={{ color: obj.completed ? 'var(--text-highlight)' : 'var(--accent-orange)', marginTop: '0.5rem', fontFamily: "'Share Tech Mono', monospace", fontSize: '1.2rem' }}
                  >
                    {obj.completed ? '[✓]' : '[ ]'} {obj.type}: {obj.target} ({obj.currentCount}/{obj.count})
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <TerminalText
          as="h2"
          text="TARGETING: ACQUIRED"
          className="terminal-text"
          style={{ color: 'var(--danger-color)', textShadow: '0 0 10px var(--danger-color)' }}
        />
      </div>

      {/* Boundary Warning */}
      {boundaryWarning !== 'none' && (
        <div className="boundary-warning-overlay">
          <div className={`boundary-warning-banner${boundaryWarning === 'turning' ? ' boundary-warning-banner--turning' : ''}`}>
            {boundaryWarning === 'turning' ? '⚠ AUTO-RETURN ENGAGED' : '⚠ MISSION BOUNDARY EXCEEDED'}
          </div>
          {boundaryWarning === 'warning' && (
            <div className="boundary-warning-subtext">
              RETURN TO MISSION AREA OR AUTO-RETURN WILL ENGAGE
            </div>
          )}
        </div>
      )}

      {/* Mission Complete */}
      {isMissionComplete && !isPlayerDead && (
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'auto', textAlign: 'center' }}>
          <TerminalText
            as="h1"
            text="MISSION COMPLETE"
            className="terminal-title"
            style={{ color: 'var(--text-highlight)', textShadow: '0 0 20px var(--text-highlight)' }}
          />
          <button
            className="interactive-btn interactive-btn--positive"
            onClick={() => { completeMission(); setMode('LANDING'); }}
            style={{ marginTop: '1rem', padding: '1rem 2rem', fontSize: '1.5rem' }}
          >
            RETURN TO BASE
          </button>
        </div>
      )}

      {/* Game Over */}
      {isPlayerDead && (
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'auto', textAlign: 'center' }}>
          <TerminalText
            as="h1"
            text={isArcade ? 'SIMULATION FAILED' : 'KIA'}
            className="terminal-title"
            style={{ color: 'var(--danger-color)', textShadow: '0 0 20px var(--danger-color)' }}
          />
          {isArcade && (
            <div style={{ marginBottom: '1rem' }}>
              <TerminalText as="h2" text={`FINAL SCORE: ${arcadeScore}`} style={{ color: 'var(--text-highlight)' }} />
            </div>
          )}
          <button
            className="interactive-btn interactive-btn--danger"
            onClick={saveLeaderboardAndExit}
            style={{ marginTop: '1rem', padding: '1rem 2rem', fontSize: '1.5rem' }}
          >
            {isArcade ? 'EXIT SIMULATOR' : 'RESPAWN'}
          </button>
        </div>
      )}

      {/* Bottom HUD — Abort */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ pointerEvents: 'auto' }}>
          {!isMissionComplete && !isPlayerDead && (
            <button
              className="interactive-btn interactive-btn--danger"
              onClick={saveLeaderboardAndExit}
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
            >
              ABORT MISSION
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
