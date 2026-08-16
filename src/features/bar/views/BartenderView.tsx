import { useState } from 'react';
import { useGameStore } from '../../../state/useGameStore';
import { TerminalText } from '../../../components/ui/TerminalText';

interface Props {
  onBack: () => void;
}

export function BartenderView({ onBack }: Props) {
  const { playerStats, updateCredits } = useGameStore();
  const [dialogue, setDialogue] = useState<string[]>([]);
  const credits = playerStats.credits;

  const handleOrder = (item: string, cost: number) => {
    if (credits >= cost) {
      updateCredits(-cost);
      setDialogue([`Bartender Unit 7: "One ${item} coming right up, Ensign. Credits deducted."`]);
    } else {
      setDialogue(['Bartender Unit 7: "Insufficient credits. The Vanguard doesn\'t run on tabs."']);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Avatar & Title Header */}
      <div className="character-avatar-badge">
        <div className="character-avatar-icon" style={{ borderColor: '#00ffff', color: '#00ffff' }}>
          🤖
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', letterSpacing: '0.08rem' }}>
              BARTENDER UNIT 7 // MORALE DROID MODEL-B7
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-highlight)' }}>
              CREDITS: {credits} C
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            STATUS: ACTIVE &bull; DRINKS SERVED: 4,201 &bull; SUBSYSTEMS: SYNTHESIS READY
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="dialogue-content-grid" style={{ marginTop: '0.75rem' }}>
        <div className="dialogue-speech-box">
          {dialogue.length > 0
            ? dialogue.map((line, i) => <TerminalText key={i} as="p" text={line} delay={4} style={{ margin: 0, fontSize: '0.95rem' }} />)
            : <TerminalText as="p" text="Bartender Unit 7: 'What can I synthesize for you today, Ensign?'" delay={8} style={{ margin: 0, fontSize: '0.95rem', color: '#00ff88' }} />
          }
        </div>

        <div className="dialogue-actions-box">
          <button className="interactive-btn" onClick={() => handleOrder('Nebula Stout', 10)} style={{ padding: '0.5rem', fontSize: '0.9rem' }}>
            🍺 ORDER NEBULA STOUT (10 C)
          </button>
          <button className="interactive-btn" onClick={() => handleOrder('Synthetic Protein Ration', 15)} style={{ padding: '0.5rem', fontSize: '0.9rem' }}>
            🥪 ORDER SYNTH-RATION (15 C)
          </button>
          <button className="interactive-btn" onClick={() => setDialogue([
            'Bartender Unit 7: "I monitor many comm channels.',
            'The organic pilots are anxious about the Nebula Remnant expansion.',
            'Also, the synthesizer is low on artificial lime flavoring."'
          ])} style={{ padding: '0.5rem', fontSize: '0.9rem' }}>
            📡 ASK FOR RUMORS
          </button>
          <button className="interactive-btn" onClick={() => setDialogue([
            'Bartender Unit 7: "I was manufactured on Earth in 2142. My purpose is to ensure crew morale and hydration during long space tours."'
          ])} style={{ padding: '0.5rem', fontSize: '0.9rem' }}>
            ℹ️ UNIT HISTORY
          </button>
          <button className="interactive-btn interactive-btn--secondary" onClick={onBack} style={{ padding: '0.45rem', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            &larr; STEP AWAY FROM BAR
          </button>
        </div>
      </div>
    </div>
  );
}

