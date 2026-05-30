import { create } from 'zustand';
import * as THREE from 'three';
import { useMissionStore } from './useMissionStore';
import { playLaserSound, playExplosionSound } from '../utils/audio';
import {
  selectBehavior,
  computeSteering,
  ENEMY_SPEED,
  type EnemyBehavior,
  type EnemyData,
} from '../features/flight/enemyAI';
export type { EnemyBehavior, EnemyData } from '../features/flight/enemyAI';

export interface LaserData {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  active: boolean;
  life: number;
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
  updateEnemies: (delta: number, playerPosition: THREE.Vector3, playerVelocity: THREE.Vector3) => void;
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

const ENEMY_COLLISION_RADIUS_SQ = 100; // ~10 unit radius
const ENEMY_COLLISION_DAMAGE = 10;
const ENEMY_COLLISION_COOLDOWN = 1.0; // seconds between collision damage ticks
const _enemyCollisionCooldowns = new Map<string, number>();

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
    { id: 'enemy_1', position: new THREE.Vector3(0, 0, -100), velocity: new THREE.Vector3(10, 0, 0), health: 100, active: true, behaviorState: 'approach' as EnemyBehavior, behaviorTimer: 2, phaseOffset: 0, time: 0, formationIndex: 0, flockId: 0 },
    { id: 'enemy_2', position: new THREE.Vector3(50, 20, -150), velocity: new THREE.Vector3(-10, 5, 0), health: 100, active: true, behaviorState: 'formation' as EnemyBehavior, behaviorTimer: 2, phaseOffset: 2.09, time: 0, formationIndex: 1, flockId: 0 },
    { id: 'enemy_3', position: new THREE.Vector3(-40, -10, -200), velocity: new THREE.Vector3(0, -5, 10), health: 100, active: true, behaviorState: 'formation' as EnemyBehavior, behaviorTimer: 2.5, phaseOffset: 4.19, time: 0, formationIndex: 2, flockId: 0 },
  ],

  spawnEnemy: (id, position) => set(state => ({
    enemies: [...state.enemies, {
      id, position, velocity: new THREE.Vector3(), health: 100, active: true,
      behaviorState: 'approach' as EnemyBehavior, behaviorTimer: 1,
      phaseOffset: Math.random() * Math.PI * 2, time: 0,
      formationIndex: 0, flockId: state.enemies.length,
    }]
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

  updateEnemies: (delta, playerPosition, playerVelocity) => set(state => {
    if (!state.enemies.some(e => e.active)) return state;

    let collisionPlayerDamage = 0;

    const newEnemies = state.enemies.map((enemy, idx) => {
      if (!enemy.active) return enemy;

      const time = enemy.time + delta;
      const distance = playerPosition.distanceTo(enemy.position);

      const behavior = selectBehavior(enemy.behaviorState, enemy.behaviorTimer, distance, delta);
      const steer = computeSteering(
        { ...enemy, ...behavior, time },
        idx,
        state.enemies,
        playerPosition,
        playerVelocity,
      );

      const lerpRate = behavior.behaviorState === 'evade' ? 4.5 : 1.8;
      const vel = enemy.velocity.clone().lerp(steer, delta * lerpRate);
      if (vel.length() > ENEMY_SPEED * 1.5) vel.normalize().multiplyScalar(ENEMY_SPEED * 1.5);

      const newPos = enemy.position.clone().addScaledVector(vel, delta);

      // Fire — rate varies by behavior
      const fireChance: Record<string, number> = {
        strafe: 0.028, approach: 0.018, flank: 0.015, formation: 0.01, evade: 0.006,
      };
      if (distance < 200 && Math.random() < fireChance[behavior.behaviorState]) {
        const interceptT = Math.min(distance / Math.max(ENEMY_SPEED, 1), 3);
        const predicted = playerPosition.clone().addScaledVector(playerVelocity, interceptT * 0.5);
        const noise = new THREE.Vector3(
          (Math.random() - 0.5) * 0.08,
          (Math.random() - 0.5) * 0.08,
          (Math.random() - 0.5) * 0.08,
        );
        const fireDir = predicted.clone().sub(enemy.position).normalize().add(noise).normalize();
        state.fireEnemyLaser(enemy.position, fireDir, vel);
      }

      // Ship-to-ship collision
      const prevCooldown = _enemyCollisionCooldowns.get(enemy.id) ?? 0;
      const cooldown = Math.max(0, prevCooldown - delta);
      _enemyCollisionCooldowns.set(enemy.id, cooldown);

      let enemyCollisionDamage = 0;
      if (newPos.distanceToSquared(playerPosition) < ENEMY_COLLISION_RADIUS_SQ) {
        const push = newPos.clone().sub(playerPosition);
        if (push.lengthSq() < 0.001) push.set(1, 0, 0);
        vel.lerp(push.normalize().multiplyScalar(ENEMY_SPEED * 2), 0.6);

        if (cooldown <= 0) {
          _enemyCollisionCooldowns.set(enemy.id, ENEMY_COLLISION_COOLDOWN);
          enemyCollisionDamage = ENEMY_COLLISION_DAMAGE;
          collisionPlayerDamage += ENEMY_COLLISION_DAMAGE;
        }
      }

      const finalHealth = Math.max(0, enemy.health - enemyCollisionDamage);
      if (enemyCollisionDamage > 0 && finalHealth === 0) {
        const missionStore = useMissionStore.getState();
        const activeMission = missionStore.activeMission;
        if (activeMission?.id.startsWith('arcade_sim')) {
          missionStore.addArcadeScore(100);
        } else {
          missionStore.updateObjective('obj_kill_1', 1);
        }
        playExplosionSound();
      }

      return { ...enemy, ...behavior, position: newPos, velocity: vel, time, health: finalHealth, active: finalHealth > 0 };
    });

    if (collisionPlayerDamage > 0) {
      import('./useGameStore').then(({ useGameStore }) => {
        useGameStore.getState().takeDamage('front', collisionPlayerDamage);
      });
    }

    return { enemies: newEnemies };
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
    _enemyCollisionCooldowns.clear();
    const numEnemies = 3 + (level - 1) * 2;
    const newEnemies: EnemyData[] = Array.from({ length: numEnemies }).map((_, i) => {
      const flockId = Math.floor(i / 3);
      const formationIndex = i % 3;
      return {
        id: `arcade_enemy_${level}_${i}`,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 400,
          (Math.random() - 0.5) * 200,
          -150 - Math.random() * 400,
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 15,
        ),
        health: 100,
        active: true,
        behaviorState: formationIndex === 0 ? 'approach' : 'formation',
        behaviorTimer: 1 + Math.random() * 2,
        phaseOffset: (i / numEnemies) * Math.PI * 2 + Math.random() * 0.5,
        time: 0,
        formationIndex,
        flockId,
      };
    });
    return { enemies: newEnemies };
  }),
}));
