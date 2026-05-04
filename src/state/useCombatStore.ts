import { create } from 'zustand';
import * as THREE from 'three';
import { useMissionStore } from './useMissionStore';

export interface LaserData {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  active: boolean;
  life: number;
}

export interface EnemyData {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  health: number;
  active: boolean;
}

interface CombatState {
  lasers: LaserData[];
  fireLaser: (position: THREE.Vector3, direction: THREE.Vector3, shipVelocity: THREE.Vector3) => void;
  updateLasers: (delta: number) => void;
  enemies: EnemyData[];
  spawnEnemy: (id: string, position: THREE.Vector3) => void;
  hitEnemy: (id: string, damage: number) => void;
  updateEnemies: (delta: number, playerPosition: THREE.Vector3) => void;
  targetId: string | null;
  setTarget: (id: string | null) => void;
}

const MAX_LASERS = 50;
const LASER_SPEED = 100;

export const useCombatStore = create<CombatState>((set) => ({
  lasers: Array.from({ length: MAX_LASERS }).map((_, i) => ({
    id: i,
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    active: false,
    life: 0,
  })),
  
  fireLaser: (position, direction, shipVelocity) => {
    set((state) => {
      const lasers = [...state.lasers];
      const inactiveLaser = lasers.find(l => !l.active);
      if (inactiveLaser) {
        inactiveLaser.active = true;
        inactiveLaser.life = 0;
        inactiveLaser.position.copy(position).add(direction.clone().multiplyScalar(2));
        inactiveLaser.velocity.copy(direction).multiplyScalar(LASER_SPEED).add(shipVelocity);
      }
      return { lasers };
    });
  },

  updateLasers: (delta) => {
    set((state) => {
      let updated = false;
      const hits: { enemyId: string; damage: number }[] = [];

      const lasers = state.lasers.map((laser) => {
        if (!laser.active) return laser;
        updated = true;
        
        laser.position.addScaledVector(laser.velocity, delta);
        laser.life += delta;
        
        if (laser.life > 2) {
          laser.active = false;
        }

        // Collision Check
        for (const enemy of state.enemies) {
          if (enemy.active && laser.position.distanceToSquared(enemy.position) < 30) {
            laser.active = false;
            hits.push({ enemyId: enemy.id, damage: 25 });
            break;
          }
        }
        
        return laser;
      });

      if (hits.length > 0) {
        const newEnemies = state.enemies.map(e => {
          const totalDamage = hits.filter(h => h.enemyId === e.id).reduce((sum, h) => sum + h.damage, 0);
          if (totalDamage > 0 && e.active) {
            const newHealth = Math.max(0, e.health - totalDamage);
            
            // If enemy just died, update mission store objective
            if (newHealth === 0) {
              useMissionStore.getState().updateObjective('obj_kill_1', 1);
            }
            
            return { ...e, health: newHealth, active: newHealth > 0 };
          }
          return e;
        });
        return { lasers, enemies: newEnemies };
      }

      return updated ? { lasers } : state;
    });
  },

  enemies: [
    { id: 'enemy_1', position: new THREE.Vector3(0, 0, -100), velocity: new THREE.Vector3(10, 0, 0), health: 100, active: true },
    { id: 'enemy_2', position: new THREE.Vector3(50, 20, -150), velocity: new THREE.Vector3(-10, 5, 0), health: 100, active: true },
    { id: 'enemy_3', position: new THREE.Vector3(-40, -10, -200), velocity: new THREE.Vector3(0, -5, 10), health: 100, active: true }
  ],
  
  spawnEnemy: (id, position) => set(state => ({
    enemies: [...state.enemies, { id, position, velocity: new THREE.Vector3(), health: 100, active: true }]
  })),
  
  hitEnemy: (id, damage) => set(state => ({
    enemies: state.enemies.map(e => {
      if (e.id === id && e.active) {
        const newHealth = Math.max(0, e.health - damage);
        return { ...e, health: newHealth, active: newHealth > 0 };
      }
      return e;
    })
  })),

  updateEnemies: (delta, playerPosition) => set(state => {
    let updated = false;
    const newEnemies = state.enemies.map(enemy => {
      if (!enemy.active) return enemy;
      updated = true;
      
      const newPos = enemy.position.clone();
      
      // Simple evasive AI: move forward, occasionally turn towards player
      const toPlayer = playerPosition.clone().sub(newPos);
      const distance = toPlayer.length();
      
      if (distance < 300) {
         // Steer slowly away or around player to simulate dogfighting
         const steer = toPlayer.normalize().multiplyScalar(20);
         enemy.velocity.lerp(steer, delta * 0.5);
      }
      
      newPos.addScaledVector(enemy.velocity, delta);
      return { ...enemy, position: newPos };
    });
    
    return updated ? { enemies: newEnemies } : state;
  }),

  targetId: null,
  setTarget: (id) => set({ targetId: id }),
}));
