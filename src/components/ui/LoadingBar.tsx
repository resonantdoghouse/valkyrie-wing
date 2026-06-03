import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

export function LoadingBar() {
  const { active, progress } = useProgress();
  const [showReady, setShowReady] = useState(false);
  const [wasActive, setWasActive] = useState(false);

  useEffect(() => {
    if (active) setWasActive(true);
  }, [active]);

  useEffect(() => {
    if (wasActive && !active && progress >= 100) {
      setShowReady(true);
      const t = setTimeout(() => setShowReady(false), 2000);
      return () => clearTimeout(t);
    }
  }, [wasActive, active, progress]);

  if (!active && !showReady && (!wasActive || progress >= 100)) return null;

  const pct = Math.round(progress);

  return (
    <div className="asset-loading">
      <p className="terminal-text" style={{ fontSize: '0.85rem', margin: 0, opacity: 0.9 }}>
        {showReady && !active
          ? '> FLIGHT SYSTEMS READY'
          : `> LOADING FLIGHT ASSETS... ${pct}%`}
      </p>
      <div className="loading-track">
        <div className="loading-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
