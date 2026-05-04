import { useRef, MutableRefObject } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { usePlayerControls } from '../../hooks/usePlayerControls';
import { useCombatStore } from '../../state/useCombatStore';

interface CockpitHUDProps {
  throttle: MutableRefObject<number>;
}

export function CockpitHUD({ throttle }: CockpitHUDProps) {
  const controls = usePlayerControls();
  const targetId = useCombatStore(state => state.targetId);
  const targetEnemy = useCombatStore(state => state.enemies.find(e => e.id === targetId && e.active));
  
  const throttleBarRef = useRef<HTMLDivElement>(null);
  const throttleTextRef = useRef<HTMLParagraphElement>(null);

  useFrame(() => {
    if (throttleBarRef.current) {
      const percentage = throttle.current * 100;
      throttleBarRef.current.style.width = `${percentage}%`;
    }
    if (throttleTextRef.current) {
      if (controls.throttleUp) throttleTextRef.current.innerText = 'ACCELERATING';
      else if (controls.throttleDown) throttleTextRef.current.innerText = 'DECELERATING';
      else throttleTextRef.current.innerText = `THRUST: ${Math.round(throttle.current * 100)}%`;
    }
  });
  
  return (
    <group position={[0, -0.5, -2]}>
      {/* Physical dashboard placeholder */}
      <mesh position={[0, -0.8, -1]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[4, 1.5, 0.5]} />
        <meshStandardMaterial color="#112222" metalness={0.9} roughness={0.4} />
      </mesh>

      {/* Center Console UI (Speed & Thrust) */}
      <Html transform position={[0, -0.2, -0.7]} rotation={[-0.2, 0, 0]} scale={0.1} center>
        <div style={{
          width: '350px',
          height: '250px',
          background: 'rgba(0, 20, 10, 0.9)',
          border: '3px solid #00ffcc',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00ffcc',
          fontFamily: "'Share Tech Mono', monospace",
          boxShadow: 'inset 0 0 20px rgba(0, 255, 204, 0.2)'
        }}>
          <h2 style={{ margin: 0, fontSize: '2.5rem', textShadow: '0 0 10px #00ffcc' }}>ENGINE</h2>
          <div style={{ marginTop: '20px', width: '80%', height: '30px', border: '2px solid #00ffcc' }}>
            <div ref={throttleBarRef} style={{ 
              width: '0%', 
              height: '100%', 
              background: '#00ffcc',
            }} />
          </div>
          <p ref={throttleTextRef} style={{ marginTop: '15px', fontSize: '1.5rem', fontWeight: 'bold' }}>THRUST: 0%</p>
        </div>
      </Html>

      {/* Left Console UI (Shields) */}
      <Html transform position={[-1.5, -0.1, -0.5]} rotation={[-0.2, 0.3, 0]} scale={0.1} center>
        <div style={{
          width: '250px',
          height: '200px',
          background: 'rgba(20, 0, 0, 0.9)',
          border: '3px solid #ff3366',
          borderRadius: '10px',
          padding: '15px',
          color: '#ff3366',
          fontFamily: "'Share Tech Mono', monospace"
        }}>
          <h3 style={{ margin: 0, fontSize: '2rem' }}>SHIELDS</h3>
          <h1 style={{ margin: '15px 0', fontSize: '4rem' }}>100%</h1>
          <p style={{ margin: 0, fontSize: '1.2rem' }}>FRONT: STABLE</p>
          <p style={{ margin: 0, fontSize: '1.2rem' }}>REAR: STABLE</p>
        </div>
      </Html>

      {/* Right Console UI (Targeting) */}
      <Html transform position={[1.5, -0.1, -0.5]} rotation={[-0.2, -0.3, 0]} scale={0.1} center>
        <div style={{
          width: '250px',
          height: '200px',
          background: targetEnemy ? 'rgba(50, 0, 0, 0.9)' : 'rgba(0, 10, 20, 0.9)',
          border: `3px solid ${targetEnemy ? '#ff3366' : '#33ccff'}`,
          borderRadius: '10px',
          padding: '15px',
          color: targetEnemy ? '#ff3366' : '#33ccff',
          fontFamily: "'Share Tech Mono', monospace",
          transition: 'all 0.2s'
        }}>
          <h3 style={{ margin: 0, fontSize: '2rem' }}>{targetEnemy ? 'LOCKED' : 'TARGET'}</h3>
          <div style={{ 
            border: `2px dashed ${targetEnemy ? '#ff3366' : '#33ccff'}`, 
            height: '80px', 
            margin: '15px 0', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '1.5rem',
            animation: targetEnemy ? 'flicker 1s infinite' : 'none'
          }}>
            {targetEnemy ? (
              <>
                <span>HULL: {targetEnemy.health}%</span>
                <span>{targetEnemy.id.toUpperCase()}</span>
              </>
            ) : (
              '[ NO LOCK ]'
            )}
          </div>
          <p style={{ margin: 0, fontSize: '1.2rem' }}>
            {targetEnemy ? '> FIRING SOLUTION ACQUIRED' : 'RADAR: SEARCHING'}
          </p>
        </div>
      </Html>
    </group>
  );
}
