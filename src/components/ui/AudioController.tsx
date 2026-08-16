import { useState, useEffect } from 'react';
import { getAudioState, setMuteAmbient, setAmbientVolume } from '../../utils/audio';

export function AudioController() {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.25);

  useEffect(() => {
    const state = getAudioState();
    setMuted(state.isMuted);
    setVolume(state.ambientVolume);
  }, []);

  const handleToggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    setMuteAmbient(nextMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVol = parseFloat(e.target.value);
    setVolume(nextVol);
    setAmbientVolume(nextVol);
  };

  return (
    <div className="audio-controller-widget" style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: 'rgba(5, 10, 31, 0.65)',
      border: '1px solid rgba(51, 133, 255, 0.3)',
      padding: '4px 8px',
      borderRadius: '6px',
      backdropFilter: 'blur(6px)',
      pointerEvents: 'auto'
    }}>
      <button 
        onClick={handleToggleMute}
        style={{
          background: 'none',
          border: 'none',
          color: muted ? 'var(--danger-color)' : 'var(--text-main)',
          fontSize: '1rem',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.2s',
          textShadow: muted ? '0 0 5px var(--danger-color)' : '0 0 5px var(--theme-glow)',
          outline: 'none'
        }}
        title={muted ? "Unmute Ambient" : "Mute Ambient"}
      >
        {muted ? '🔇' : '🔊'}
      </button>
      
      <input 
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={volume}
        onChange={handleVolumeChange}
        style={{
          width: '60px',
          height: '4px',
          backgroundColor: 'rgba(51, 133, 255, 0.2)',
          outline: 'none',
          cursor: 'pointer',
          accentColor: 'var(--theme-color)',
        }}
        title={`Ambient Volume: ${Math.round(volume * 100)}%`}
      />
      <span style={{ fontSize: '0.75rem', color: 'var(--theme-color)', minWidth: '24px', textAlign: 'right', fontFamily: "'Share Tech Mono', monospace" }}>
        {Math.round(volume * 100)}%
      </span>
    </div>
  );
}

