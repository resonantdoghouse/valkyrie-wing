import { create } from 'zustand';
import * as THREE from 'three';
import { useMissionStore } from './useMissionStore';
import { playLaserSound, playExplosionSound } from '../utils/audio';

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

export interface MineData {
  id: string;
  position: THREE.Vector3;
  active: boolean;
}

export interface AsteroidData {
  id: string;
  position: THREE.Vector3;
  scale: number;
  active: boolean;
}

interface CombatState {
  lasers: LaserData[];
  enemyLasers: LaserData[];
  fireLaser: (position: THREE.Vector3, direction: THREE.Vector3, shipVelocity: THREE.Vector3) => void;
  fireEnemyLaser: (position: THREE.Vector3, direction: THREE.Vector3, shipVelocity: THREE.Vector3) => void;
  updateLasers: (delta: number) => void;
  updateEnemyLasers: (delta: number, playerPosition: THREE.Vector3) => void;
  enemies: EnemyData[];
  spawnEnemy: (id: string, position: THREE.Vector3) => void;
  hitEnemy: (id: string, damage: number) => void;
  updateEnemies: (delta: number, playerPosition: THREE.Vector3) => void;
  targetId: string | null;
  setTarget: (id: string | null) => void;
  startArcadeWave: (level: number) => void;
  mines: MineData[];
  initMines: (mines: MineData[]) => void;
  hitMine: (id: string) => void;
  asteroids: AsteroidData[];
  initAsteroids: (asteroids: AsteroidData[]) => void;
  hitAsteroid: (id: string) => void;
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
  enemyLasers: Array.from({ length: MAX_LASERS }).map((_, i) => ({
    id: i + MAX_LASERS,
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
        
        playLaserSound();
      }
      return { lasers };
    });
  },

  fireEnemyLaser: (position, direction, shipVelocity) => {
    set((state) => {
      const enemyLasers = [...state.enemyLasers];
      const inactiveLaser = enemyLasers.find(l => !l.active);
      if (inactiveLaser) {
        inactiveLaser.active = true;
        inactiveLaser.life = 0;
        inactiveLaser.position.copy(position).add(direction.clone().multiplyScalar(2));
        inactiveLaser.velocity.copy(direction).multiplyScalar(LASER_SPEED * 0.8).add(shipVelocity);
      }
      return { enemyLasers };
    });
  },

  updateLasers: (delta) => {
    set((state) => {
      let updated = false;
      const hits: { enemyId: string; damage: number }[] = [];
      const mineHits: string[] = [];
      const asteroidHits: string[] = [];

      const lasers = state.lasers.map((laser) => {
        if (!laser.active) return laser;
        updated = true;

        laser.position.addScaledVector(laser.velocity, delta);
        laser.life += delta;

        if (laser.life > 2) {
          laser.active = false;
        }

        // Enemy collision
        if (laser.active) {
          for (const enemy of state.enemies) {
            if (enemy.active && laser.position.distanceToSquared(enemy.position) < 30) {
              laser.active = false;
              hits.push({ enemyId: enemy.id, damage: 25 });
              break;
            }
          }
        }

        // Mine collision
        if (laser.active) {
          for (const mine of state.mines) {
            if (mine.active && laser.position.distanceToSquared(mine.position) < 25) {
              laser.active = false;
              mineHits.push(mine.id);
              break;
            }
          }
        }

        // Asteroid collision — radius scales with asteroid size
        if (laser.active) {
          for (const asteroid of state.asteroids) {
            if (asteroid.active) {
              const hitRadius = 4 * asteroid.scale;
              if (laser.position.distanceToSquared(asteroid.position) < hitRadius * hitRadius) {
                laser.active = false;
                asteroidHits.push(asteroid.id);
                break;
              }
            }
          }
        }

        return laser;
      });

      if (hits.length > 0) {
        const newEnemies = state.enemies.map(e => {
          const totalDamage = hits.filter(h => h.enemyId === e.id).reduce((sum, h) => sum + h.damage, 0);
          if (totalDamage > 0 && e.active) {
            const newHealth = Math.max(0, e.health - totalDamage);
            
            // If enemy just died, update mission store objective and play explosion
            if (newHealth === 0) {
              const missionStore = useMissionStore.getState();
              const activeMission = missionStore.activeMission;
              
              if (activeMission?.id.startsWith('arcade_sim')) {
                missionStore.addArcadeScore(100);
              } else {
                missionStore.updateObjective('obj_kill_1', 1);
              }
              playExplosionSound();
            }
            
            return { ...e, health: newHealth, active: newHealth > 0 };
          }
          return e;
        });

        // Check if arcade wave is complete
        const activeMission = useMissionStore.getState().activeMission;
        if (activeMission?.id.startsWith('arcade_sim')) {
          const activeEnemies = newEnemies.filter(e => e.active);
          if (activeEnemies.length === 0 && newEnemies.length > 0) {
            // Next wave!
            setTimeout(() => {
               const ms = useMissionStore.getState();
               ms.levelUpArcade();
               useCombatStore.getState().startArcadeWave(ms.arcadeLevel);
            }, 2000);
          }
        }

        const newMines = mineHits.length > 0
          ? state.mines.map(m => mineHits.includes(m.id) ? { ...m, active: false } : m)
          : state.mines;
        const newAsteroids = asteroidHits.length > 0
          ? state.asteroids.map(a => asteroidHits.includes(a.id) ? { ...a, active: false } : a)
          : state.asteroids;
        return { lasers, enemies: newEnemies, mines: newMines, asteroids: newAsteroids };
      }

      if (mineHits.length > 0 || asteroidHits.length > 0) {
        return {
          lasers,
          mines: mineHits.length > 0
            ? state.mines.map(m => mineHits.includes(m.id) ? { ...m, active: false } : m)
            : state.mines,
          asteroids: asteroidHits.length > 0
            ? state.asteroids.map(a => asteroidHits.includes(a.id) ? { ...a, active: false } : a)
            : state.asteroids,
        };
      }

      return updated ? { lasers } : state;
    });
  },

  updateEnemyLasers: (delta, playerPosition) => {
    set((state) => {
      let updated = false;
      let playerHit = false;
      let hitDirection: 'front' | 'rear' | 'left' | 'right' = 'front';

      const enemyLasers = state.enemyLasers.map((laser) => {
        if (!laser.active) return laser;
        updated = true;
        
        laser.position.addScaledVector(laser.velocity, delta);
        laser.life += delta;
        
        if (laser.life > 2) {
          laser.active = false;
        }

        // Collision with player
        if (laser.position.distanceToSquared(playerPosition) < 25) {
          laser.active = false;
          playerHit = true;
          // Determine direction
          const relativePos = laser.position.clone().sub(playerPosition).normalize();
          // Assuming player faces -Z
          const zDot = relativePos.z;
          const xDot = relativePos.x;
          
          if (Math.abs(zDot) > Math.abs(xDot)) {
             hitDirection = zDot < 0 ? 'front' : 'rear';
          } else {
             hitDirection = xDot > 0 ? 'right' : 'left';
          }
        }
        
        return laser;
      });

      if (playerHit) {
        import('./useGameStore').then(({ useGameStore }) => {
          useGameStore.getState().takeDamage(hitDirection, 15);
        });
      }

      return updated ? { enemyLasers } : state;
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
         
         // Chance to fire
         if (distance < 200 && Math.random() < 0.02) {
            const fireDir = toPlayer.clone().normalize();
            state.fireEnemyLaser(enemy.position, fireDir, enemy.velocity);
         }
      }
      
      newPos.addScaledVector(enemy.velocity, delta);
      return { ...enemy, position: newPos };
    });
    
    return updated ? { enemies: newEnemies } : state;
  }),

  targetId: null,
  setTarget: (id) => set({ targetId: id }),

  mines: [] as MineData[],
  initMines: (mines) => set(() => ({ mines })),
  hitMine: (id) => set(state => ({
    mines: state.mines.map(m => m.id === id ? { ...m, active: false } : m),
  })),

  asteroids: [] as AsteroidData[],
  initAsteroids: (asteroids) => set(() => ({ asteroids })),
  hitAsteroid: (id) => set(state => ({
    asteroids: state.asteroids.map(a => a.id === id ? { ...a, active: false } : a),
  })),

  startArcadeWave: (level) => set(() => {
    const numEnemies = 3 + (level - 1) * 2;
    const newEnemies = Array.from({ length: numEnemies }).map((_, i) => ({
      id: `arcade_enemy_${level}_${i}`,
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 400,
        -100 - Math.random() * 500
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        Math.random() * 20
      ),
      health: 100,
      active: true
    }));
    return { enemies: newEnemies };
  }),
}));
