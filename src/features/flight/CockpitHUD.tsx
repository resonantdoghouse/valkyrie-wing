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

export function CockpitHUD({ throttle, shipRef }: CockpitHUDProps) {
  const controls = usePlayerControls();
  const targetId = useCombatStore(state => state.targetId);
  const targetEnemy = useCombatStore(state => state.enemies.find(e => e.id === targetId && e.active));
  const radarCanvasRef = useRef<HTMLCanvasElement>(null);
  const playerHealth = useGameStore(state => state.playerHealth);
  
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

    if (radarCanvasRef.current && shipRef.current) {
      const ctx = radarCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 200, 200);
        
        // Draw radar rings
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.3)';
        ctx.beginPath(); ctx.arc(100, 100, 50, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(100, 100, 90, 0, Math.PI * 2); ctx.stroke();
        
        // Draw crosshair
        ctx.beginPath(); ctx.moveTo(100, 0); ctx.lineTo(100, 200); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 100); ctx.lineTo(200, 100); ctx.stroke();

        const MAX_RADAR_DIST = 1000;

        // Draw Enemies
        const enemies = useCombatStore.getState().enemies;
        enemies.forEach(enemy => {
          if (!enemy.active) return;
          const localPos = shipRef.current!.worldToLocal(enemy.position.clone());
          
          // Map to 2D
          const rx = 100 + (localPos.x / MAX_RADAR_DIST) * 100;
          const ry = 100 + (localPos.z / MAX_RADAR_DIST) * 100; // z is forward/back

          if (rx >= 0 && rx <= 200 && ry >= 0 && ry <= 200) {
             ctx.fillStyle = '#ff3366';
             ctx.beginPath(); ctx.arc(rx, ry, 3, 0, Math.PI * 2); ctx.fill();
          }
        });

        // Draw Waypoints
        const activeMission = useMissionStore.getState().activeMission;
        if (activeMission) {
          activeMission.objectives.forEach(obj => {
            if (!obj.completed && obj.position) {
               const worldPos = new THREE.Vector3(...obj.position);
               const localPos = shipRef.current!.worldToLocal(worldPos);
               
               const rx = 100 + (localPos.x / MAX_RADAR_DIST) * 100;
               const ry = 100 + (localPos.z / MAX_RADAR_DIST) * 100;

               if (rx >= 0 && rx <= 200 && ry >= 0 && ry <= 200) {
                 ctx.fillStyle = '#ffff00';
                 ctx.beginPath(); ctx.arc(rx, ry, 4, 0, Math.PI * 2); ctx.fill();
               }
            }
          });
        }
        
        // Draw Player Ship (Center)
        ctx.fillStyle = '#00ffcc';
        ctx.beginPath(); ctx.moveTo(100, 95); ctx.lineTo(105, 105); ctx.lineTo(95, 105); ctx.fill();
      }
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

      {/* Map Nav / Radar */}
      <Html transform position={[0, -0.6, -0.7]} rotation={[-0.4, 0, 0]} scale={0.1} center>
        <div style={{
          width: '220px',
          height: '220px',
          background: 'rgba(0, 20, 10, 0.9)',
          border: '3px solid #00ffcc',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 0 20px rgba(0, 255, 204, 0.2)',
          overflow: 'hidden'
        }}>
           <canvas ref={radarCanvasRef} width={200} height={200} style={{ borderRadius: '50%' }} />
        </div>
      </Html>

      {/* Left Console UI (VDU / Ship Status) */}
      <Html transform position={[-1.6, -0.1, -0.6]} rotation={[-0.2, 0.3, 0]} scale={0.1} center>
        <div style={{
          width: '320px',
          height: '240px',
          background: 'rgba(0, 15, 30, 0.95)',
          border: '4px solid #0055ff',
          borderRadius: '10px',
          padding: '10px',
          color: '#00ccff',
          fontFamily: "'Share Tech Mono', monospace",
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'inset 0 0 20px rgba(0, 85, 255, 0.3)',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0055ff', paddingBottom: '5px', marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>VDU</span>
            <span>SYSTEMS / COMMS</span>
          </div>
          
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Ship Diagram */}
            <div style={{ position: 'absolute', width: '60px', height: '100px', background: '#334455', clipPath: 'polygon(50% 0%, 100% 30%, 80% 100%, 20% 100%, 0% 30%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ fontSize: '0.8rem', color: '#00ccff', textAlign: 'center' }}>HULL</div>
            </div>
            
            {/* Shields (Outer Ring) & Hull Values (Inner) */}
            <div style={{ position: 'absolute', top: '10px', left: '130px', textAlign: 'center' }}>
              <div style={{ color: `hsl(${playerHealth.shields.front}, 100%, 50%)` }}>S: {Math.round(playerHealth.shields.front)}%</div>
              <div style={{ color: `hsl(${playerHealth.hull.front}, 100%, 50%)`, fontSize: '0.8rem' }}>H: {Math.round(playerHealth.hull.front)}%</div>
            </div>
            
            <div style={{ position: 'absolute', bottom: '10px', left: '130px', textAlign: 'center' }}>
              <div style={{ color: `hsl(${playerHealth.hull.rear}, 100%, 50%)`, fontSize: '0.8rem' }}>H: {Math.round(playerHealth.hull.rear)}%</div>
              <div style={{ color: `hsl(${playerHealth.shields.rear}, 100%, 50%)` }}>S: {Math.round(playerHealth.shields.rear)}%</div>
            </div>
            
            <div style={{ position: 'absolute', left: '10px', top: '90px', textAlign: 'right' }}>
              <div style={{ color: `hsl(${playerHealth.shields.left}, 100%, 50%)` }}>S: {Math.round(playerHealth.shields.left)}%</div>
              <div style={{ color: `hsl(${playerHealth.hull.left}, 100%, 50%)`, fontSize: '0.8rem' }}>H: {Math.round(playerHealth.hull.left)}%</div>
            </div>
            
            <div style={{ position: 'absolute', right: '10px', top: '90px', textAlign: 'left' }}>
              <div style={{ color: `hsl(${playerHealth.shields.right}, 100%, 50%)` }}>S: {Math.round(playerHealth.shields.right)}%</div>
              <div style={{ color: `hsl(${playerHealth.hull.right}, 100%, 50%)`, fontSize: '0.8rem' }}>H: {Math.round(playerHealth.hull.right)}%</div>
            </div>
          </div>
          
          <div style={{ borderTop: '2px solid #0055ff', paddingTop: '5px', marginTop: '10px', fontSize: '0.8rem', opacity: 0.8 }}>
            &gt; COMMS CHANNEL OPEN...
          </div>
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
