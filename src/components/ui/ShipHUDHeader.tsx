import { useGameStore } from '../../state/useGameStore';
import { AudioController } from './AudioController';

export function ShipHUDHeader() {
  const { currentMode, setMode, playerStats, cinematicViewMode, toggleCinematicViewMode } = useGameStore();

  const getLocationTitle = () => {
    switch (currentMode) {
      case 'BAR':
        return 'VSS VALKYRIE // THE VANGUARD BAR';
      case 'BRIEFING':
        return 'VSS VALKYRIE // TACTICAL BRIEFING ROOM';
      case 'QUARTERS':
        return 'VSS VALKYRIE // CREW QUARTERS';
      default:
        return 'VSS VALKYRIE // COMMAND';
    }
  };

  return (
    <header className="ship-hud-header" style={{
      position: 'absolute',
      top: '12px',
      left: '16px',
      right: '16px',
      zIndex: 900,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      pointerEvents: 'none',
      flexWrap: 'wrap'
    }}>
      {/* Left: Location & Pilot ID */}
      <div className="ship-hud-location-card" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(5, 10, 31, 0.7)',
        border: '1px solid rgba(51, 133, 255, 0.35)',
        padding: '6px 14px',
        borderRadius: '6px',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 0 12px rgba(51, 133, 255, 0.15)',
        pointerEvents: 'auto'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#00ff88',
          boxShadow: '0 0 8px #00ff88',
          animation: 'pulse 2s infinite'
        }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 'bold', letterSpacing: '0.08rem' }}>
            {getLocationTitle()}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            STATUS: NOMINAL &bull; PILOT: {playerStats.rank} &bull; CREDITS: <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{playerStats.credits} C</span>
          </span>
        </div>
      </div>

      {/* Right: Room Navigation Tabs, View Mode Toggle & Audio Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'auto',
        flexWrap: 'wrap'
      }}>
        {/* Navigation Tabs */}
        <div className="ship-hud-tabs" style={{
          display: 'flex',
          gap: '4px',
          background: 'rgba(5, 10, 31, 0.65)',
          border: '1px solid rgba(51, 133, 255, 0.25)',
          padding: '3px',
          borderRadius: '6px',
          backdropFilter: 'blur(6px)'
        }}>
          <button 
            className={`hud-tab-btn ${currentMode === 'BAR' ? 'hud-tab-btn--active' : ''}`}
            onClick={() => setMode('BAR')}
          >
            BAR
          </button>
          <button 
            className={`hud-tab-btn ${currentMode === 'BRIEFING' ? 'hud-tab-btn--active' : ''}`}
            onClick={() => setMode('BRIEFING')}
          >
            BRIEFING
          </button>
          <button 
            className={`hud-tab-btn ${currentMode === 'QUARTERS' ? 'hud-tab-btn--active' : ''}`}
            onClick={() => setMode('QUARTERS')}
          >
            QUARTERS
          </button>
        </div>

        {/* View Mode Toggle Button */}
        <button
          className={`hud-view-mode-btn ${cinematicViewMode ? 'hud-view-mode-btn--active' : ''}`}
          onClick={toggleCinematicViewMode}
          title="Toggle UI overlay to inspect the 3D room (Shortcut: 'H')"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: cinematicViewMode ? 'rgba(0, 255, 136, 0.2)' : 'rgba(5, 10, 31, 0.65)',
            border: `1px solid ${cinematicViewMode ? '#00ff88' : 'rgba(51, 133, 255, 0.35)'}`,
            color: cinematicViewMode ? '#00ff88' : '#ffffff',
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            backdropFilter: 'blur(6px)',
            transition: 'all 0.2s ease',
            textShadow: cinematicViewMode ? '0 0 6px rgba(0,255,136,0.6)' : 'none'
          }}
        >
          <span>{cinematicViewMode ? '👁 SHOW UI' : '👁 3D VIEW'}</span>
          <span style={{ fontSize: '0.65rem', opacity: 0.7, background: 'rgba(255,255,255,0.1)', padding: '1px 4px', borderRadius: '3px' }}>[H]</span>
        </button>

        {/* Audio Controller */}
        <AudioController />
      </div>
    </header>
  );
}
