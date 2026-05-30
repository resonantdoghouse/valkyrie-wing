import * as THREE from 'three';

export type EnemyBehavior = 'approach' | 'strafe' | 'evade' | 'flank' | 'formation';

export interface EnemyData {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  health: number;
  active: boolean;
  behaviorState: EnemyBehavior;
  behaviorTimer: number;
  phaseOffset: number;
  time: number;
  formationIndex: number;
  flockId: number;
}

export const ENEMY_SPEED = 45;

const UP = new THREE.Vector3(0, 1, 0);

export function selectBehavior(
  behaviorState: EnemyBehavior,
  behaviorTimer: number,
  distance: number,
  delta: number,
): { behaviorState: EnemyBehavior; behaviorTimer: number } {
  const next = behaviorTimer - delta;
  if (next > 0) return { behaviorState, behaviorTimer: next };

  const roll = Math.random();
  if (distance > 260) return { behaviorState: 'approach',   behaviorTimer: 2.5 + Math.random() * 2 };
  if (distance < 38)  return { behaviorState: 'evade',      behaviorTimer: 1   + Math.random() * 1.2 };
  if (roll < 0.28)    return { behaviorState: 'approach',   behaviorTimer: 2   + Math.random() * 2.5 };
  if (roll < 0.52)    return { behaviorState: 'strafe',     behaviorTimer: 3   + Math.random() * 3 };
  if (roll < 0.72)    return { behaviorState: 'flank',      behaviorTimer: 2   + Math.random() * 2.5 };
  if (roll < 0.84)    return { behaviorState: 'evade',      behaviorTimer: 1   + Math.random() * 1 };
  return               { behaviorState: 'formation', behaviorTimer: 3   + Math.random() * 3 };
}

export function computeSteering(
  enemy: EnemyData,
  enemyIndex: number,
  allEnemies: EnemyData[],
  playerPosition: THREE.Vector3,
  playerVelocity: THREE.Vector3,
): THREE.Vector3 {
  const { behaviorState, phaseOffset, formationIndex, flockId, time } = enemy;
  const pos = enemy.position.clone();
  const toPlayer = playerPosition.clone().sub(pos);
  const distance = toPlayer.length();
  const toPlayerNorm = distance > 0.01 ? toPlayer.clone().normalize() : new THREE.Vector3(0, 0, -1);

  const interceptT = Math.min(distance / Math.max(ENEMY_SPEED, 1), 3);
  const predicted = playerPosition.clone().addScaledVector(playerVelocity, interceptT * 0.5);

  const steer = new THREE.Vector3();

  if (behaviorState === 'approach') {
    steer.copy(predicted.clone().sub(pos)).normalize().multiplyScalar(ENEMY_SPEED);

  } else if (behaviorState === 'strafe') {
    const right = new THREE.Vector3().crossVectors(toPlayerNorm, UP).normalize();
    const strafeSign = formationIndex % 2 === 0 ? 1 : -1;
    const desiredRange = 90 + Math.sin(time * 0.25 + phaseOffset) * 25;
    const rangeErr = distance - desiredRange;
    const radial = rangeErr > 0 ? toPlayerNorm.clone() : toPlayerNorm.clone().negate();
    steer.copy(right).multiplyScalar(strafeSign * 0.75)
      .addScaledVector(radial, 0.25).normalize().multiplyScalar(ENEMY_SPEED);

  } else if (behaviorState === 'flank') {
    const angle = phaseOffset + time * 0.15;
    const offset = new THREE.Vector3(
      Math.cos(angle) * 90,
      Math.sin(angle * 0.6) * 30,
      Math.sin(angle) * -90,
    );
    steer.copy(playerPosition.clone().add(offset).sub(pos)).normalize().multiplyScalar(ENEMY_SPEED * 1.1);

  } else if (behaviorState === 'evade') {
    const ba = phaseOffset + time * 2.5;
    const breakVec = new THREE.Vector3(Math.cos(ba), Math.sin(ba * 0.8), Math.sin(ba + 1.3)).normalize();
    steer.copy(toPlayerNorm).negate().multiplyScalar(0.55)
      .addScaledVector(breakVec, 0.45).normalize().multiplyScalar(ENEMY_SPEED * 1.35);

  } else {
    // formation: leader approaches player, wingmen hold V formation behind leader
    if (formationIndex === 0) {
      steer.copy(predicted.clone().sub(pos)).normalize().multiplyScalar(ENEMY_SPEED);
    } else {
      const leaderIdx = allEnemies.findIndex(
        e => e.active && e.flockId === flockId && e.formationIndex === 0,
      );
      if (leaderIdx >= 0) {
        const leader = allEnemies[leaderIdx];
        const lFwd = leader.velocity.lengthSq() > 0.1
          ? leader.velocity.clone().normalize()
          : new THREE.Vector3(0, 0, -1);
        const lRight = new THREE.Vector3().crossVectors(lFwd, UP).normalize();
        const isLeft = formationIndex % 2 === 1;
        const tier = Math.floor(formationIndex / 2);
        const lateral = (25 + tier * 10) * (isLeft ? -1 : 1);
        const back = 15 + tier * 10;
        const formPos = leader.position.clone()
          .addScaledVector(lRight, lateral)
          .addScaledVector(lFwd, -back);
        steer.copy(formPos.sub(pos)).normalize().multiplyScalar(ENEMY_SPEED);
      } else {
        steer.copy(toPlayerNorm).multiplyScalar(ENEMY_SPEED);
      }
    }
  }

  // Per-enemy oscillation — unique frequency/phase so ships never fly identically
  const wFreq = 0.9 + (enemyIndex % 5) * 0.22;
  const wAmp  = 3   + (enemyIndex % 3) * 1.5;
  steer.x += Math.sin(time * wFreq       + phaseOffset)       * wAmp * 0.15;
  steer.y += Math.cos(time * wFreq * 0.7 + phaseOffset + 1.8) * wAmp * 0.15;
  steer.z += Math.sin(time * wFreq * 0.5 + phaseOffset + 3.1) * wAmp * 0.08;

  // Separation — push away from nearby enemies
  for (const other of allEnemies) {
    if (other.id === enemy.id || !other.active) continue;
    const diff = pos.clone().sub(other.position);
    const dist = diff.length();
    if (dist < 28 && dist > 0.01) {
      steer.add(diff.normalize().multiplyScalar(18 * (1 - dist / 28)));
    }
  }

  return steer;
}
