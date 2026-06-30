import { useGameStore } from '../../../state/useGameStore';
import { TerminalText } from '../../../components/ui/TerminalText';

type BarView = 'BARTENDER' | 'COMMANDOS' | 'ARCADE';

interface Props {
  onNavigate: (view: BarView) => void;
}

export function MainView({ onNavigate }: Props) {
  const setMode = useGameStore(state => state.setMode);

  return (
    <>
      <TerminalText as="h2" className="terminal-title" text="The Vanguard Bar" />
      <TerminalText as="p" text="> Welcome back, Ensign." delay={10} />

      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button className="interactive-btn" onClick={() => onNavigate('BARTENDER')}>
          APPROACH THE BAR (BARTENDER UNIT 7)
        </button>
        <button className="interactive-btn" onClick={() => onNavigate('COMMANDOS')}>
          MINGLE WITH WING COMMANDOS
        </button>
        <button className="interactive-btn" onClick={() => onNavigate('ARCADE')}>
          PLAY ARCADE FLIGHT SIM
        </button>
        <button className="interactive-btn" onClick={() => setMode('BRIEFING')}>
          GO TO BRIEFING ROOM
        </button>
        <button className="interactive-btn" onClick={() => setMode('QUARTERS')}>
          GO TO QUARTERS
        </button>
        <button className="interactive-btn interactive-btn--secondary" onClick={() => setMode('MENU')}>
          RETURN TO FLIGHT DECK
        </button>
      </div>
    </>
  );
}
