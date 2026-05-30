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
      setDialogue([`Bartender Unit 7: "One ${item} coming right up, Ensign."`]);
    } else {
      setDialogue(['Bartender Unit 7: "Insufficient credits. The Vanguard doesn\'t run on tabs."']);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--theme-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        <TerminalText as="h2" text="Bartender Unit 7" style={{ margin: 0, fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1rem' }} />
        <TerminalText as="p" text={`> Credits: ${credits} C`} style={{ margin: 0, color: 'var(--text-highlight)' }} />
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px' }}>
          <div style={{ minHeight: '60px', padding: '10px', border: '1px solid var(--theme-color)', background: 'rgba(51, 133, 255, 0.1)' }}>
            {dialogue.length > 0
              ? dialogue.map((line, i) => <TerminalText key={i} as="p" text={line} delay={5} />)
              : <TerminalText as="p" text="Bartender Unit 7: 'What can I get you, Ensign?'" delay={10} />
            }
          </div>
        </div>

        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <TerminalText as="h3" text="ACTIONS & ORDERS" style={{ margin: 0, marginBottom: '0.5rem', borderBottom: '1px solid var(--theme-color)', paddingBottom: '0.5rem', color: 'var(--text-highlight)' }} />
          <button className="interactive-btn" onClick={() => handleOrder('Nebula Stout', 10)}>
            ORDER NEBULA STOUT (10 C)
          </button>
          <button className="interactive-btn" onClick={() => handleOrder('Synthetic Protein Ration', 15)}>
            ORDER SYNTH-PROTEIN RATION (15 C)
          </button>
          <button className="interactive-btn" onClick={() => setDialogue([
            'Bartender Unit 7: "I process many conversations.',
            'The organic pilots are anxious about the Nebula Remnant expansion.',
            'Also, the synthesizer is low on artificial lime flavoring."',
          ])}>
            ASK FOR RUMORS
          </button>
          <button className="interactive-btn" onClick={() => setDialogue([
            'Bartender Unit 7: "I was manufactured on Earth in 2142. My purpose is to ensure crew morale and hydration. I have mixed 4,201 drinks to date."',
          ])}>
            TELL ME ABOUT YOURSELF
          </button>
          <button className="interactive-btn" onClick={onBack} style={{ marginTop: '1rem' }}>
            STEP AWAY
          </button>
        </div>
      </div>
    </div>
  );
}
