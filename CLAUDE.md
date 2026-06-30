# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Vite dev server (hot reload)
npm run build    # tsc type-check then Vite production build
npm run preview  # Preview the production build locally
```

There is no test suite and no linter configured.

## Architecture

**Valkyrie Wing** is a browser-based 3D space combat game: React 18 + Zustand for state, `@react-three/fiber` (R3F) for 3D rendering, Leva for debug controls, procedural Web Audio for sound.

### Mode routing

All navigation is managed by a `GameMode` string in `useGameStore` — there is no React Router. `App.tsx` switches 2D overlays based on `currentMode`. `GameCanvas.tsx` contains a `SceneManager` component that mounts the matching R3F scene. Valid modes: `MENU → BAR ←→ BRIEFING`, `BAR → LAUNCH → FLIGHT → LANDING → BAR`, `BAR → QUARTERS`.

### State stores (`src/state/`)

| Store | Owns |
|---|---|
| `useGameStore` | `currentMode`, player health/shields (directional), credits, rank, boundary warning phase |
| `useCombatStore` | Laser pools (pooled, `MAX_LASERS = 50`), enemy list with AI state, mine/asteroid lists, target lock, arcade wave spawning |
| `useMissionStore` | Active mission + objectives (KILL/NAV/PROTECT), arcade score/level |

**Cross-store calls** happen via `.getState()` (e.g., `useCombatStore` imports `useGameStore.getState().takeDamage(...)` via dynamic `import()` inside `set()` to avoid circular deps at module load time).

### Flight physics & controls

- `usePlayerControls` (`src/hooks/usePlayerControls.ts`) returns a **stable `ref`** (not reactive state) so `useFrame` callbacks can read key state every frame without triggering re-renders. Bindings are rebindable via `useControlsConfig`.
- `PlayerShip.tsx` drives the ship in `useFrame`: applies rotation from controls, lerps velocity toward throttle-scaled forward direction, positions camera (1st or 3rd person via `V`).
- Boundary at 700 units: warns for 5 s then auto-turns the ship back toward origin.

### Enemy AI (`src/features/flight/enemyAI.ts`)

Pure functions — no React. Two exports:
- `selectBehavior()` — probabilistic FSM tick, returns next `EnemyBehavior` + timer
- `computeSteering()` — returns a target velocity vector for the chosen behavior

Five behaviors: `approach`, `strafe`, `flank`, `evade`, `formation`. Flocks share `flockId`; `formationIndex === 0` is the leader. Separation force prevents stacking. Called every frame inside `useCombatStore.updateEnemies()`.

### Shaders (`src/features/flight/shaders.ts`)

Three `THREE.ShaderMaterial` factories:
- `makeEngineGlowMaterial` — FBM plasma with animated intensity (throttle-driven)
- `makeLaserMaterial` — instancing-aware bolt with pulse + end-cap fade
- `makeExplosionMaterial` — vertex-displaced sphere with heat-ramp color

All use additive blending, `depthWrite: false`. Uniform `uTime` is advanced in `useFrame`.

### 3D assets

GLB files live in `src/assets/models/`. Vite is configured to treat `.glb` as assets (`assetsInclude: ['**/*.glb']`). Loaded with `useGLTF`; each component that uses a model calls `useGLTF.preload()` at module level.

### Debug tooling

Press `` ` `` in-game to toggle the Leva debug panel (`DebugPanel.tsx`). Panels include Ship & Camera (FOV, speed/turn multipliers), stats overlay, direction gizmos, and camera info label. The `useDebugStore` (Zustand) holds visibility flags read by `GameCanvas` and `PlayerShip`.
