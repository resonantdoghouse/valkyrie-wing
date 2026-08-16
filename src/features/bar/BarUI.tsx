import { useGameStore } from '../../state/useGameStore';
import { ShipHUDHeader } from '../../components/ui/ShipHUDHeader';
import { MainView } from './views/MainView';
import { BartenderView } from './views/BartenderView';
import { CommandosView } from './views/CommandosView';
import { ArcadeView } from './views/ArcadeView';

export function BarUI() {
  const barView = useGameStore((state) => state.barView);
  const setBarView = useGameStore((state) => state.setBarView);
  const cinematicViewMode = useGameStore((state) => state.cinematicViewMode);
  const toggleCinematicViewMode = useGameStore((state) => state.toggleCinematicViewMode);

  return (
    <>
      {/* Top Station HUD Header */}
      <ShipHUDHeader />

      {/* Docked Dialogue Console (Bottom) */}
      {!cinematicViewMode ? (
        <div className="dialogue-console-container">
          <div className="dialogue-console">
            {barView === 'MAIN'      && <MainView      onNavigate={setBarView} />}
            {barView === 'BARTENDER' && <BartenderView onBack={() => setBarView('MAIN')} />}
            {barView === 'COMMANDOS' && <CommandosView onBack={() => setBarView('MAIN')} />}
            {barView === 'ARCADE'    && <ArcadeView    onBack={() => setBarView('MAIN')} />}
          </div>
        </div>
      ) : (
        /* Minimal pill in 3D View Mode allowing easy expand */
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 500,
          pointerEvents: 'auto'
        }}>
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
            💬 OPEN COMMS CONSOLE [H]
          </button>
        </div>
      )}
    </>
  );
}

