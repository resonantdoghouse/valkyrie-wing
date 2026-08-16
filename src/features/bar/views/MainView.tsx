import { useGameStore } from '../../../state/useGameStore';
import { TerminalText } from '../../../components/ui/TerminalText';

type BarView = 'BARTENDER' | 'COMMANDOS' | 'ARCADE';

interface Props {
  onNavigate: (view: BarView) => void;
}

export function MainView({ onNavigate }: Props) {
  const setMode = useGameStore(state => state.setMode);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header bar */}
      <div className="character-avatar-badge">
        <div className="character-avatar-icon" style={{ borderColor: '#ff9900', color: '#ff9900' }}>
          🍸
        </div>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', letterSpacing: '0.08rem' }}>
            THE VANGUARD LOUNGE &bull; DECK 4
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            LOCAL TIME: 22:40 &bull; CABIN PRESSURE: 1.0 ATM &bull; CREW ON DECK
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="dialogue-content-grid" style={{ marginTop: '0.75rem' }}>
        <div className="dialogue-speech-box">
          <TerminalText as="p" text="> Welcome back, Ensign. The lounge is lively tonight." delay={10} style={{ margin: 0, fontSize: '1rem', color: '#00ff88' }} />
          <TerminalText as="p" text="> You can speak with Bartender Unit 7, socialize with the Wing Commandos, or test your reflexes on the arcade flight simulator cabinet." delay={8} style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }} />
          <div style={{ marginTop: 'auto', paddingTop: '6px', fontSize: '0.75rem', color: 'rgba(51, 133, 255, 0.8)' }}>
            💡 Tip: Click objects directly in the 3D room to walk over and interact.
          </div>
        </div>

        <div className="dialogue-actions-box">
          <button className="interactive-btn" onClick={() => onNavigate('BARTENDER')} style={{ padding: '0.55rem 1rem', fontSize: '0.95rem' }}>
            🍸 APPROACH BAR (UNIT 7)
          </button>
          <button className="interactive-btn" onClick={() => onNavigate('COMMANDOS')} style={{ padding: '0.55rem 1rem', fontSize: '0.95rem' }}>
            👥 MINGLE WITH COMMANDOS
          </button>
          <button className="interactive-btn" onClick={() => onNavigate('ARCADE')} style={{ padding: '0.55rem 1rem', fontSize: '0.95rem' }}>
            🕹️ PLAY ARCADE SIMULATOR
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.2rem' }}>
            <button className="interactive-btn interactive-btn--secondary" onClick={() => setMode('BRIEFING')} style={{ padding: '0.45rem', fontSize: '0.85rem' }}>
              BRIEFING ROOM &rarr;
            </button>
            <button className="interactive-btn interactive-btn--secondary" onClick={() => setMode('QUARTERS')} style={{ padding: '0.45rem', fontSize: '0.85rem' }}>
              CREW QUARTERS &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

