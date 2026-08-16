import { useState } from 'react';
import { Html } from '@react-three/drei';

interface InteractiveMarker3DProps {
  position: [number, number, number];
  label: string;
  actionHint?: string;
  onClick: () => void;
  accentColor?: string;
  icon?: string;
}

export function InteractiveMarker3D({
  position,
  label,
  actionHint = 'CLICK',
  onClick,
  accentColor = '#00ffff',
  icon = '◈'
}: InteractiveMarker3DProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <Html center distanceFactor={8} zIndexRange={[100, 0]}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`interactive-marker-3d ${hovered ? 'interactive-marker-3d--hovered' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: hovered ? 'rgba(5, 15, 40, 0.95)' : 'rgba(5, 10, 31, 0.75)',
            border: `1px solid ${hovered ? accentColor : 'rgba(51, 133, 255, 0.4)'}`,
            padding: '3px 8px',
            borderRadius: '4px',
            color: hovered ? '#ffffff' : 'rgba(255, 255, 255, 0.85)',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.05rem',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
            boxShadow: hovered ? `0 0 12px ${accentColor}` : '0 0 6px rgba(0, 0, 0, 0.5)',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            pointerEvents: 'auto'
          }}
        >
          <span style={{ color: accentColor, fontSize: '10px' }}>{icon}</span>
          <span style={{ fontWeight: 'bold' }}>{label}</span>
          {hovered && (
            <span style={{
              fontSize: '9px',
              backgroundColor: accentColor,
              color: '#000',
              padding: '1px 4px',
              borderRadius: '2px',
              fontWeight: 'bold',
              marginLeft: '2px'
            }}>
              [{actionHint}]
            </span>
          )}
        </div>
      </Html>
    </group>
  );
}
