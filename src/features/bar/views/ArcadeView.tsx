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
      setError('> ERROR: Insufficient Credits.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--theme-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        <TerminalText as="h2" text="Vanguard Defender Cabinet" style={{ margin: 0, fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1rem' }} />
        <TerminalText as="p" text={`> Credits: ${credits} C`} style={{ margin: 0, color: 'var(--text-highlight)' }} />
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px' }}>
          <div style={{ minHeight: '60px', padding: '10px', border: '1px solid var(--theme-color)', background: 'rgba(51, 133, 255, 0.1)' }}>
            {error
              ? <TerminalText as="p" text={error} delay={5} />
              : (
                <>
                  <TerminalText as="p" text="> Insert 5 Credits to play 'Vanguard Defender'." delay={10} />
                  <div style={{ marginTop: '1rem', borderTop: '1px solid var(--theme-color)', paddingTop: '0.5rem' }}>
                    <TerminalText as="h3" text="HIGH SCORES" style={{ margin: 0, marginBottom: '0.5rem', color: 'var(--text-highlight)' }} />
                    {leaderboard.length > 0
                      ? leaderboard.map((entry, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '250px', fontFamily: "'Share Tech Mono', monospace" }}>
                          <span>{i + 1}. {entry.name}</span>
                          <span style={{ color: 'var(--accent-orange)' }}>{entry.score}</span>
                        </div>
                      ))
                      : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '250px', fontFamily: "'Share Tech Mono', monospace" }}>
                          <span>1. Lt. Viper</span>
                          <span style={{ color: 'var(--accent-orange)' }}>500</span>
                        </div>
                      )
                    }
                  </div>
                </>
              )
            }
          </div>
        </div>

        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <TerminalText as="h3" text="ARCADE OPTIONS" style={{ margin: 0, marginBottom: '0.5rem', borderBottom: '1px solid var(--theme-color)', paddingBottom: '0.5rem', color: 'var(--text-highlight)' }} />
          <button className="interactive-btn interactive-btn--positive" onClick={handlePlay}>
            INSERT 5 C & PLAY
          </button>
          <button className="interactive-btn interactive-btn--secondary" onClick={onBack} style={{ marginTop: '1rem' }}>
            STEP AWAY
          </button>
        </div>
      </div>
    </div>
  );
}
