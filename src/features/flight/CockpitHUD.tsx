import { useRef, MutableRefObject } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { usePlayerControls } from '../../hooks/usePlayerControls';
import { useCombatStore } from '../../state/useCombatStore';
import * as THREE from 'three';
import { useMissionStore } from '../../state/useMissionStore';
import { useGameStore } from '../../state/useGameStore';

interface CockpitHUDProps {
  throttle: MutableRefObject<number>;
  shipRef: React.RefObject<THREE.Group>;
}

const getHealthColor = (val: number) => {
  if (val > 60) return '#00ffaa';
  if (val > 30) return '#ffaa00';
  return '#ff3333';
};

const StatBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', letterSpacing: '1px' }}>{label}</div>
    <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', background: color, boxShadow: `0 0 8px ${color}`, transition: 'width 0.2s ease-out' }} />
    </div>
  </div>
);

export function CockpitHUD({ throttle, shipRef }: CockpitHUDProps) {
  const controls = usePlayerControls();
  const targetId = useCombatStore(state => state.targetId);
  const targetEnemy = useCombatStore(state => state.enemies.find(e => e.id === targetId && e.active));
  const radarCanvasRef = useRef<HTMLCanvasElement>(null);
  const playerHealth = useGameStore(state => state.playerHealth);
  const radarSweep = useRef(0);
  
  const throttleBarRef = useRef<HTMLDivElement>(null);
  const throttleTextRef = useRef<HTMLParagraphElement>(null);

  useFrame(() => {
    // Throttle bar and text are mutated via DOM refs each frame to avoid React
    // re-renders on every keypress — imperative updates are correct here.
    if (throttleBarRef.current) {
      throttleBarRef.current.style.width = `${throttle.current * 100}%`;
    }
    if (throttleTextRef.current) {
      const c = controls.current;
      if (c.throttleUp)        throttleTextRef.current.innerText = 'ENG: ACCELERATING';
      else if (c.throttleDown) throttleTextRef.current.innerText = 'ENG: DECELERATING';
      else                     throttleTextRef.current.innerText = `THRUST: ${Math.round(throttle.current * 100)}%`;
    }

    if (radarCanvasRef.current && shipRef.current) {
      const ctx = radarCanvasRef.current.getContext('2d');
      if (ctx) {
        const center = 120;
        const radius = 115;
        
        ctx.clearRect(0, 0, 240, 240);
        
        // Update sweep
        radarSweep.current = (radarSweep.current + 0.03) % (Math.PI * 2);

        // Draw radar background
        ctx.fillStyle = 'rgba(2, 6, 12, 0.8)';
        ctx.beginPath(); ctx.arc(center, center, radius, 0, Math.PI * 2); ctx.fill();

        // Draw radar rings (dashed)
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        [40, 75, 110].forEach(r => {
          ctx.beginPath(); ctx.arc(center, center, r, 0, Math.PI * 2); ctx.stroke();
        });
        ctx.setLineDash([]);
        
        // Draw crosshair
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
        ctx.beginPath(); ctx.moveTo(center, 5); ctx.lineTo(center, 235); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(5, center); ctx.lineTo(235, center); ctx.stroke();

        // Draw sweep
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(radarSweep.current);
        const gradient = ctx.createConicGradient(0, 0, 0);
        gradient.addColorStop(0, 'rgba(0, 229, 255, 0)');
        gradient.addColorStop(0.8, 'rgba(0, 229, 255, 0.05)');
        gradient.addColorStop(1, 'rgba(0, 229, 255, 0.4)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, 0, Math.PI / 3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        const MAX_RADAR_DIST = 1000;

        // Draw Enemies
        const enemies = useCombatStore.getState().enemies;
        enemies.forEach(enemy => {
          if (!enemy.active) return;
          const localPos = shipRef.current!.worldToLocal(enemy.position.clone());
          
          const rx = center + (localPos.x / MAX_RADAR_DIST) * 110;
          const ry = center + (localPos.z / MAX_RADAR_DIST) * 110;

          if (rx >= 5 && rx <= 235 && ry >= 5 && ry <= 235) {
             ctx.fillStyle = '#ff3366';
             ctx.shadowColor = '#ff3366';
             ctx.shadowBlur = 8;
             ctx.beginPath(); ctx.arc(rx, ry, 4, 0, Math.PI * 2); ctx.fill();
             ctx.shadowBlur = 0;
          }
        });

        // Draw Waypoints
        const activeMission = useMissionStore.getState().activeMission;
        if (activeMission) {
          activeMission.objectives.forEach(obj => {
            if (!obj.completed && obj.position) {
               const worldPos = new THREE.Vector3(...obj.position);
               const localPos = shipRef.current!.worldToLocal(worldPos);
               
               const rx = center + (localPos.x / MAX_RADAR_DIST) * 110;
               const ry = center + (localPos.z / MAX_RADAR_DIST) * 110;

               if (rx >= 5 && rx <= 235 && ry >= 5 && ry <= 235) {
                 ctx.fillStyle = '#ffcc00';
                 ctx.shadowColor = '#ffcc00';
                 ctx.shadowBlur = 10;
                 ctx.beginPath(); ctx.moveTo(rx, ry-6); ctx.lineTo(rx+6, ry+6); ctx.lineTo(rx-6, ry+6); ctx.fill();
                 ctx.shadowBlur = 0;
               }
            }
          });
        }
        
        // Draw Player Ship (Center)
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 5;
        ctx.beginPath(); ctx.moveTo(center, center-8); ctx.lineTo(center+6, center+6); ctx.lineTo(center, center+3); ctx.lineTo(center-6, center+6); ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  });
  
  return (
    <group position={[0, -0.5, -2]}>
      <Html>
        <style>{`
          @keyframes hud-spin { 100% { transform: rotate(360deg); } }
          @keyframes hud-pulse { 0% { opacity: 0.8; } 50% { opacity: 0.3; } 100% { opacity: 0.8; } }
        `}</style>
      </Html>
      
      {/* Physical dashboard placeholder */}
      <mesh position={[0, -0.8, -1]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[4.5, 1.5, 0.5]} />
        <meshStandardMaterial color="#050a10" metalness={0.9} roughness={0.6} />
      </mesh>

      {/* Center Console UI (Speed & Thrust) */}
      <Html transform position={[0, -0.2, -0.7]} rotation={[-0.2, 0, 0]} scale={0.1} center>
        <div style={{
          width: '420px',
          height: '120px',
          background: 'linear-gradient(180deg, rgba(6, 15, 30, 0.4) 0%, rgba(2, 6, 12, 0.85) 100%)',
          borderBottom: '3px solid rgba(0, 229, 255, 0.6)',
          borderRadius: '20px 20px 8px 8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: '20px',
          color: '#e0f7fa',
          fontFamily: "'Share Tech Mono', monospace",
          backdropFilter: 'blur(6px)',
          clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '75%', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)' }}>PROPULSION</span>
            <span ref={throttleTextRef} style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#00e5ff', textShadow: '0 0 8px rgba(0,229,255,0.5)' }}>THRUST: 0%</span>
          </div>
          
          <div style={{ width: '80%', height: '24px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,229,255,0.4)', borderRadius: '12px', overflow: 'hidden', position: 'relative', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'space-between', padding: '0 15px', pointerEvents: 'none', zIndex: 2 }}>
               {[...Array(10)].map((_, i) => <div key={i} style={{ width: '2px', height: '100%', background: 'rgba(0,0,0,0.8)' }} />)}
            </div>
            <div ref={throttleBarRef} style={{ 
              width: '0%', 
              height: '100%', 
              background: 'linear-gradient(90deg, #0088ff 0%, #00e5ff 100%)',
              boxShadow: '0 0 15px rgba(0,229,255,0.8)',
              transition: 'width 0.1s linear',
              position: 'relative',
              zIndex: 1
            }} />
          </div>
        </div>
      </Html>

      {/* Map Nav / Radar */}
      <Html transform position={[0, -0.65, -0.65]} rotation={[-0.5, 0, 0]} scale={0.1} center>
        <div style={{
          width: '280px',
          height: '280px',
          background: 'linear-gradient(135deg, rgba(6, 15, 30, 0.9) 0%, rgba(2, 6, 12, 0.95) 100%)',
          border: '2px solid rgba(0, 229, 255, 0.4)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8), inset 0 0 40px rgba(0, 229, 255, 0.2)',
          position: 'relative',
          backdropFilter: 'blur(8px)'
        }}>
           <div style={{ position: 'absolute', width: '100%', height: '100%', border: '1px dashed rgba(0, 229, 255, 0.3)', borderRadius: '50%', animation: 'hud-spin 30s linear infinite reverse' }} />
           
           <canvas ref={radarCanvasRef} width={240} height={240} style={{ borderRadius: '50%', zIndex: 1 }} />
           
           <div style={{ position: 'absolute', top: '15px', fontSize: '0.8rem', color: '#00e5ff', fontFamily: "'Share Tech Mono', monospace", letterSpacing: '2px', zIndex: 2, textShadow: '0 0 5px #00e5ff' }}>TACTICAL MAP</div>
           <div style={{ position: 'absolute', bottom: '15px', fontSize: '0.8rem', color: '#00e5ff', fontFamily: "'Share Tech Mono', monospace", letterSpacing: '1px', zIndex: 2, opacity: 0.7 }}>RANGE: 1.0 KM</div>
        </div>
      </Html>

      {/* Left Console UI (VDU / Ship Status) */}
      <Html transform position={[-1.7, -0.1, -0.6]} rotation={[-0.2, 0.4, 0]} scale={0.1} center>
        <div style={{
          width: '380px',
          height: '300px',
          background: 'linear-gradient(135deg, rgba(6, 15, 30, 0.85) 0%, rgba(2, 6, 12, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          borderTop: '4px solid #00e5ff',
          borderRadius: '16px',
          padding: '20px',
          color: '#e0f7fa',
          fontFamily: "'Share Tech Mono', monospace",
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 15px 35px rgba(0,0,0,0.6), inset 0 0 25px rgba(0, 229, 255, 0.1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0, 229, 255, 0.3)', paddingBottom: '10px', marginBottom: '16px' }}>
             <span style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#00e5ff', letterSpacing: '2px', textShadow: '0 0 8px rgba(0,229,255,0.4)' }}>VDU // STATUS</span>
             <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', animation: 'hud-pulse 2s infinite' }}>SYS: NOMINAL</span>
          </div>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Left Data Column - Shields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '30%' }}>
              <StatBar label="SHIELD F" value={playerHealth.shields.front} color="#00e5ff" />
              <StatBar label="SHIELD L" value={playerHealth.shields.left} color="#00e5ff" />
              <StatBar label="SHIELD R" value={playerHealth.shields.right} color="#00e5ff" />
              <StatBar label="SHIELD B" value={playerHealth.shields.rear} color="#00e5ff" />
            </div>

            {/* Ship Diagram Center */}
            <div style={{ position: 'relative', width: '120px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '2px solid rgba(0, 229, 255, 0.3)', boxShadow: '0 0 20px rgba(0, 229, 255, 0.15)' }} />
               <svg width="60" height="100" viewBox="0 0 60 100" style={{ filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.6))', zIndex: 2 }}>
                 <polygon points="30,10 50,40 60,90 40,80 30,90 20,80 0,90 10,40" fill="rgba(0, 30, 60, 0.8)" stroke="#00e5ff" strokeWidth="2" />
                 <polygon points="30,30 40,70 30,80 20,70" fill="rgba(0, 229, 255, 0.4)" />
               </svg>
            </div>

            {/* Right Data Column - Hull */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '30%' }}>
              <StatBar label="HULL F" value={playerHealth.hull.front} color={getHealthColor(playerHealth.hull.front)} />
              <StatBar label="HULL L" value={playerHealth.hull.left} color={getHealthColor(playerHealth.hull.left)} />
              <StatBar label="HULL R" value={playerHealth.hull.right} color={getHealthColor(playerHealth.hull.right)} />
              <StatBar label="HULL B" value={playerHealth.hull.rear} color={getHealthColor(playerHealth.hull.rear)} />
            </div>
          </div>
        </div>
      </Html>

      {/* Right Console UI (Targeting) */}
      <Html transform position={[1.6, -0.1, -0.5]} rotation={[-0.2, -0.4, 0]} scale={0.1} center>
        <div style={{
          width: '340px',
          height: '300px',
          background: targetEnemy ? 'linear-gradient(135deg, rgba(30, 5, 10, 0.9) 0%, rgba(12, 2, 4, 0.95) 100%)' : 'linear-gradient(135deg, rgba(6, 15, 30, 0.85) 0%, rgba(2, 6, 12, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${targetEnemy ? 'rgba(255, 51, 102, 0.4)' : 'rgba(0, 229, 255, 0.3)'}`,
          borderTop: `4px solid ${targetEnemy ? '#ff3366' : '#00e5ff'}`,
          borderRadius: '16px',
          padding: '20px',
          color: targetEnemy ? '#ffb3c6' : '#e0f7fa',
          fontFamily: "'Share Tech Mono', monospace",
          display: 'flex',
          flexDirection: 'column',
          boxShadow: targetEnemy ? '0 15px 35px rgba(255,51,102,0.3), inset 0 0 25px rgba(255, 51, 102, 0.15)' : '0 15px 35px rgba(0,0,0,0.6), inset 0 0 25px rgba(0, 229, 255, 0.1)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${targetEnemy ? 'rgba(255,51,102,0.3)' : 'rgba(0,229,255,0.3)'}`, paddingBottom: '10px', marginBottom: '20px' }}>
             <span style={{ fontWeight: 'bold', fontSize: '1.3rem', color: targetEnemy ? '#ff3366' : '#00e5ff', letterSpacing: '2px', textShadow: `0 0 8px ${targetEnemy ? 'rgba(255,51,102,0.4)' : 'rgba(0,229,255,0.4)'}` }}>
               {targetEnemy ? 'TARGET LOCKED' : 'TARGETING SYS'}
             </span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {targetEnemy ? (
              <>
                <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' }}>
                   <div style={{ position: 'absolute', width: '100%', height: '100%', border: '2px dashed #ff3366', borderRadius: '50%', animation: 'hud-spin 10s linear infinite' }} />
                   <div style={{ position: 'absolute', width: '140%', height: '2px', background: 'rgba(255,51,102,0.3)' }} />
                   <div style={{ position: 'absolute', height: '140%', width: '2px', background: 'rgba(255,51,102,0.3)' }} />
                   
                   <svg width="50" height="50" viewBox="0 0 40 40" style={{ filter: 'drop-shadow(0 0 8px #ff3366)' }}>
                     <polygon points="20,5 35,35 20,28 5,35" fill="rgba(255,51,102,0.2)" stroke="#ff3366" strokeWidth="2" />
                   </svg>
                </div>
                
                <div style={{ width: '100%', padding: '0 5px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '1.1rem', fontWeight: 'bold' }}>
                     <span>ID: {targetEnemy.id.substring(0, 6).toUpperCase()}</span>
                     <span>DIST: {shipRef.current ? Math.round(shipRef.current.position.distanceTo(targetEnemy.position)) : 0}m</span>
                   </div>
                   <StatBar label="TARGET INTEGRITY" value={targetEnemy.health} color="#ff3366" />
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.85 }}>
                {useCombatStore.getState().enemies.filter(e => e.active).length > 0 ? (
                  <>
                    <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                      <div style={{ position: 'absolute', width: '100%', height: '100%', border: '2px dashed #ffaa00', borderRadius: '50%', animation: 'hud-spin 6s linear infinite' }} />
                      <span style={{ fontSize: '1.6rem', color: '#ffaa00', textShadow: '0 0 10px #ffaa00' }}>⚠</span>
                    </div>
                    <span style={{ fontSize: '1rem', letterSpacing: '2px', color: '#ffaa00', fontWeight: 'bold', textShadow: '0 0 8px rgba(255,170,0,0.5)' }}>
                      {useCombatStore.getState().enemies.filter(e => e.active).length} HOSTILES DETECTED
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#00e5ff', marginTop: '6px', letterSpacing: '1px' }}>
                      PRESS [T] TO ACQUIRE LOCK
                    </span>
                  </>
                ) : (
                  <>
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1" strokeDasharray="4 4" style={{ animation: 'hud-spin 8s linear infinite', marginBottom: '25px' }}>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2 L12 22 M2 12 L22 12" />
                    </svg>
                    <span style={{ fontSize: '1.1rem', letterSpacing: '2px' }}>SECTOR CLEAR</span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '5px' }}>SEARCHING SECTOR...</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
}
