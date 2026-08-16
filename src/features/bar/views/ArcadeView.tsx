import { useState, useEffect } from 'react';
import { useGameStore } from '../../../state/useGameStore';
import { useMissionStore } from '../../../state/useMissionStore';
import { useCombatStore } from '../../../state/useCombatStore';
import { TerminalText } from '../../../components/ui/TerminalText';

interface Props {
  onBack: () => void;
}

export function ArcadeView({ onBack }: Props) {
  const { playerStats, updateCredits, setMode } = useGameStore();
  const { startMission } = useMissionStore();
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number }[]>([]);
  const [error, setError] = useState('');
  const credits = playerStats.credits;

  useEffect(() => {
    const lb = JSON.parse(localStorage.getItem('vanguard_arcade_leaderboard') || '[]');
    setLeaderboard(lb);
  }, []);

  const handlePlay = () => {
    if (credits >= 5) {
      updateCredits(-5);
      startMission('arcade_sim_1');
      useCombatStore.getState().startArcadeWave(1);
      setMode('FLIGHT');
    } else {
      setError('> ERROR: Insufficient Credits (5 C Required).');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header bar */}
      <div className="character-avatar-badge">
        <div className="character-avatar-icon" style={{ borderColor: '#3385ff', color: '#3385ff' }}>
          🕹️
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', letterSpacing: '0.08rem' }}>
              VANGUARD DEFENDER // 3D CAB-SIMULATOR
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-highlight)' }}>
              CREDITS: {credits} C
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            COST: 5 CREDITS / PLAY &bull; MODE: ENDLESS WAVE COMBAT &bull; CRT HYPERDRIVE EMULATION
          </div>
        </div>
      </div>

      <div className="dialogue-content-grid" style={{ marginTop: '0.75rem' }}>
        <div className="dialogue-speech-box">
          {error ? (
            <TerminalText as="p" text={error} delay={5} style={{ color: 'var(--danger-color)', margin: 0 }} />
          ) : (
            <>
              <TerminalText as="p" text="> Test your dogfighting reflexes against holographic simulation waves." delay={8} style={{ margin: 0, fontSize: '0.95rem' }} />
              <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(51,133,255,0.25)', paddingTop: '0.35rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-highlight)', fontWeight: 'bold', marginBottom: '2px' }}>TOP PILOT RECORDS:</div>
                {leaderboard.length > 0 ? (
                  leaderboard.slice(0, 3).map((entry, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '200px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                      <span>{i + 1}. {entry.name}</span>
                      <span style={{ color: 'var(--accent-orange)' }}>{entry.score} pts</span>
                    </div>
                  ))
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '200px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                    <span>1. Lt. Viper</span>
                    <span style={{ color: 'var(--accent-orange)' }}>500 pts</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="dialogue-actions-box">
          <button className="interactive-btn interactive-btn--positive" onClick={handlePlay} style={{ padding: '0.65rem', fontSize: '1rem' }}>
            🪙 INSERT 5 C & PLAY
          </button>
          <button className="interactive-btn interactive-btn--secondary" onClick={onBack} style={{ padding: '0.45rem', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            &larr; STEP AWAY FROM CABINET
          </button>
        </div>
      </div>
    </div>
  );
}

