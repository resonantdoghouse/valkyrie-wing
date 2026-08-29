import { useEffect, useState, useMemo } from 'react';
import { TerminalText } from '../../../components/ui/TerminalText';
import { JUKEBOX_TRACKS, jukeboxSynth, JukeboxTrack } from '../../../utils/jukeboxMusic';
import { playLightClickSound, playChimeSound } from '../../../utils/audio';

interface Props {
  onBack: () => void;
}

type FilterCategory = 'ALL' | 'FLEET' | 'SWING' | 'SYNTH' | 'ALIEN';
type SortOption = 'DEFAULT' | 'TITLE' | 'BPM_DESC' | 'BPM_ASC';

export function JukeboxView({ onBack }: Props) {
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(jukeboxSynth.getCurrentTrack());
  const [isPlaying, setIsPlaying] = useState<boolean>(jukeboxSynth.getIsPlaying());
  const [volume, setVolume] = useState<number>(jukeboxSynth.getVolume());
  const [spectrum, setSpectrum] = useState<number[]>([0.1, 0.2, 0.15, 0.3, 0.2, 0.1]);

  // Filtering & Sorting states
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('DEFAULT');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const unsubTrack = jukeboxSynth.subscribeTrack((trackId, playing) => {
      setCurrentTrackId(trackId);
      setIsPlaying(playing);
    });

    const unsubBeat = jukeboxSynth.subscribeBeat((_, spec) => {
      setSpectrum(spec);
    });

    const decayInterval = setInterval(() => {
      setSpectrum(prev => prev.map(v => Math.max(0.08, v * 0.85)));
    }, 80);

    return () => {
      unsubTrack();
      unsubBeat();
      clearInterval(decayInterval);
    };
  }, []);

  const filteredAndSortedTracks = useMemo(() => {
    let list = [...JUKEBOX_TRACKS];

    // Filter by Category
    if (categoryFilter !== 'ALL') {
      list = list.filter(t => t.category === categoryFilter);
    }

    // Filter by Search
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.genre.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortOption === 'TITLE') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'BPM_DESC') {
      list.sort((a, b) => b.bpm - a.bpm);
    } else if (sortOption === 'BPM_ASC') {
      list.sort((a, b) => a.bpm - b.bpm);
    }

    return list;
  }, [categoryFilter, searchQuery, sortOption]);

  const handlePlayTrack = (track: JukeboxTrack) => {
    playLightClickSound();
    if (currentTrackId === track.id && isPlaying) {
      jukeboxSynth.pause();
    } else {
      jukeboxSynth.play(track.id);
    }
  };

  const handleTogglePlay = () => {
    playLightClickSound();
    jukeboxSynth.togglePlayPause(currentTrackId || undefined);
  };

  const handleRandomDisc = () => {
    playChimeSound();
    jukeboxSynth.playRandom(true);
  };

  const handleNext = () => {
    playLightClickSound();
    jukeboxSynth.nextTrack();
  };

  const handlePrev = () => {
    playLightClickSound();
    jukeboxSynth.prevTrack();
  };

  const handleStop = () => {
    playLightClickSound();
    jukeboxSynth.stop();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    jukeboxSynth.setVolume(val);
  };

  const activeTrack = JUKEBOX_TRACKS.find(t => t.id === currentTrackId) || JUKEBOX_TRACKS[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      {/* Header Bar */}
      <div className="character-avatar-badge">
        <div className="character-avatar-icon" style={{ borderColor: '#ff55ff', color: '#ff55ff', textShadow: '0 0 10px #ff55ff' }}>
          🎵
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#fff', letterSpacing: '0.08rem' }}>
              HOLOGRAM JUKEBOX // VANGUARD SOUNDCORE
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="interactive-btn"
                onClick={handleRandomDisc}
                style={{
                  padding: '3px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  borderColor: '#00ffff',
                  color: '#00ffff',
                  background: 'rgba(0, 255, 255, 0.15)',
                  boxShadow: '0 0 8px rgba(0, 255, 255, 0.3)'
                }}
                title="Play a random song from the catalogue"
              >
                🔀 RANDOM DISC
              </button>
              <span style={{ fontSize: '0.75rem', color: isPlaying ? '#00ff88' : '#888', fontWeight: 'bold' }}>
                {isPlaying ? '● BROADCASTING' : '○ STANDBY'}
              </span>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            PROCEDURAL MULTI-FREQUENCY AUDIO &bull; FLEET EXPLORATION &bull; BIG BAND &bull; RETRO SYNTH &bull; ALIEN RITES
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '6px',
        flexWrap: 'wrap',
        background: 'rgba(5, 10, 26, 0.65)',
        border: '1px solid rgba(51, 133, 255, 0.25)',
        borderRadius: '5px',
        padding: '4px 8px'
      }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {(['ALL', 'FLEET', 'SWING', 'SYNTH', 'ALIEN'] as const).map(cat => {
            const labels: Record<FilterCategory, string> = {
              ALL: 'ALL DISCS',
              FLEET: '🚀 FLEET ANTHEMS',
              SWING: '🎷 SWING & BRASS',
              SYNTH: '🎹 RETRO SYNTH',
              ALIEN: '🛸 ALIEN / ATONAL',
            };
            const isActive = categoryFilter === cat;
            return (
              <button
                key={cat}
                className={`hud-tab-btn ${isActive ? 'hud-tab-btn--active' : ''}`}
                onClick={() => { playLightClickSound(); setCategoryFilter(cat); }}
                style={{
                  padding: '3px 8px',
                  fontSize: '0.7rem',
                  letterSpacing: '0.04rem',
                  borderColor: isActive ? '#ff55ff' : 'rgba(51,133,255,0.3)',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.7)'
                }}
              >
                {labels[cat]}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="text"
            placeholder="Search tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'rgba(10, 20, 45, 0.8)',
              border: '1px solid rgba(51, 133, 255, 0.35)',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '0.75rem',
              color: '#ffffff',
              outline: 'none',
              width: '120px'
            }}
          />

          <select
            value={sortOption}
            onChange={(e) => { playLightClickSound(); setSortOption(e.target.value as SortOption); }}
            style={{
              background: 'rgba(10, 20, 45, 0.8)',
              border: '1px solid rgba(51, 133, 255, 0.35)',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '0.75rem',
              color: '#00ffff',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="DEFAULT">Sort: Default</option>
            <option value="TITLE">Sort: Title (A-Z)</option>
            <option value="BPM_DESC">Sort: BPM (Fastest)</option>
            <option value="BPM_ASC">Sort: BPM (Slowest)</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Track List & Player Deck */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.25fr 1fr',
        gap: '0.8rem',
        marginTop: '0.1rem'
      }}>
        {/* Track List (Smoothly Scrollable) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          background: 'rgba(5, 10, 26, 0.75)',
          border: '1px solid rgba(255, 85, 255, 0.3)',
          borderRadius: '6px',
          padding: '0.5rem',
          backdropFilter: 'blur(8px)',
          maxHeight: '230px',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#ff55ff rgba(5,10,26,0.5)'
        }}>
          {filteredAndSortedTracks.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
              No holographic discs matching criteria.
            </div>
          ) : (
            filteredAndSortedTracks.map((track) => {
              const isSelected = currentTrackId === track.id;
              const isTrackPlaying = isSelected && isPlaying;

              return (
                <div
                  key={track.id}
                  onClick={() => handlePlayTrack(track)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    padding: '5px 8px',
                    borderRadius: '4px',
                    background: isSelected ? 'rgba(255, 85, 255, 0.18)' : 'rgba(15, 25, 50, 0.5)',
                    border: `1px solid ${isSelected ? track.color : 'rgba(51, 133, 255, 0.2)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isTrackPlaying ? `0 0 10px ${track.color}44` : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <span style={{ fontSize: '0.85rem', color: track.color }}>
                      {isTrackPlaying ? '▶' : isSelected ? '⏸' : '💿'}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{
                        fontSize: '0.82rem',
                        fontWeight: 'bold',
                        color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden'
                      }}>
                        {track.title}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.55)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {track.artist} &bull; <span style={{ color: track.color }}>{track.genre}</span>
                      </span>
                    </div>
                  </div>

                  <div style={{
                    fontSize: '0.68rem',
                    padding: '2px 5px',
                    borderRadius: '3px',
                    background: 'rgba(0,0,0,0.4)',
                    color: track.color,
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}>
                    {track.bpm} BPM
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Player Controls & Visualizer */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.5rem',
          background: 'rgba(5, 10, 26, 0.75)',
          border: '1px solid rgba(51, 133, 255, 0.35)',
          borderRadius: '6px',
          padding: '0.6rem',
          backdropFilter: 'blur(8px)'
        }}>
          {/* Now Playing Info & Animated Spectrum Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-highlight)', fontWeight: 'bold' }}>
                CURRENT FREQUENCY:
              </span>
              <span style={{ fontSize: '0.68rem', color: activeTrack.color, fontWeight: 'bold' }}>
                {activeTrack.genre}
              </span>
            </div>

            <div style={{
              fontSize: '0.92rem',
              fontWeight: 'bold',
              color: '#ffffff',
              letterSpacing: '0.04rem',
              textShadow: isPlaying ? `0 0 8px ${activeTrack.color}88` : 'none'
            }}>
              {activeTrack.title}
            </div>

            <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.55)' }}>
              Transmission: <span style={{ color: '#fff' }}>{activeTrack.artist}</span>
            </div>

            <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.7)', minHeight: '30px' }}>
              <TerminalText
                key={activeTrack.id}
                as="span"
                text={`> ${activeTrack.description}`}
                delay={6}
                style={{ fontSize: '0.72rem' }}
              />
            </div>

            {/* Retro Audio Visualizer Spectrum Bars */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: '34px',
              padding: '3px 6px',
              background: 'rgba(0, 5, 20, 0.8)',
              border: '1px solid rgba(0, 255, 255, 0.25)',
              borderRadius: '4px',
              gap: '4px',
              marginTop: '2px'
            }}>
              {spectrum.map((level, i) => {
                const heightPercent = isPlaying ? Math.min(100, Math.max(12, level * 100)) : 10;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${heightPercent}%`,
                      background: `linear-gradient(to top, #00ffff, ${activeTrack.color})`,
                      borderRadius: '2px',
                      transition: 'height 0.08s ease',
                      boxShadow: isPlaying ? `0 0 6px ${activeTrack.color}66` : 'none'
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Player Transport Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: '4px' }}>
              <button
                className="interactive-btn"
                onClick={handlePrev}
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                title="Previous Track"
              >
                ⏮
              </button>

              <button
                className={`interactive-btn ${isPlaying ? 'interactive-btn--positive' : ''}`}
                onClick={handleTogglePlay}
                style={{
                  padding: '0.35rem',
                  fontSize: '0.88rem',
                  fontWeight: 'bold',
                  letterSpacing: '0.04rem'
                }}
              >
                {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
              </button>

              <button
                className="interactive-btn"
                onClick={handleNext}
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                title="Next Track"
              >
                ⏭
              </button>

              <button
                className="interactive-btn interactive-btn--secondary"
                onClick={handleStop}
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                title="Stop"
              >
                ⏹
              </button>
            </div>

            {/* Volume Slider & Return Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.7)' }}>VOL:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={handleVolumeChange}
                  style={{
                    flex: 1,
                    accentColor: activeTrack.color,
                    cursor: 'pointer',
                    height: '4px'
                  }}
                />
              </div>

              <button
                className="interactive-btn interactive-btn--secondary"
                onClick={onBack}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                &larr; BACK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
