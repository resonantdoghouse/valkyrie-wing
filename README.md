# Valkyrie Wing

A browser-based 3D space combat game built with React, Three.js, and Zustand.

## Gameplay

You play as a pilot aboard the carrier **CMS Vanguard**, flying missions against the **Nebula Remnant** faction. Between missions you return to the ship's bar to take on new contracts, talk to wing commandos, and play the arcade simulator.

**Flight controls (rebindable in-game via the debug panel):**

| Action | Default |
|---|---|
| Pitch up / down | `W` / `S` |
| Roll left / right | `A` / `D` |
| Throttle up / down | `R` / `F` |
| Fire laser | `Space` |
| Cycle target | `T` |
| Toggle camera | `C` |
| Debug panel | `` ` `` |

## Tech Stack

| Layer | Library |
|---|---|
| UI framework | React 18 |
| 3D rendering | Three.js via `@react-three/fiber` |
| 3D helpers | `@react-three/drei` |
| State management | Zustand |
| Debug controls | Leva |
| Build tool | Vite |

## Project Structure

```
src/
├── App.tsx                    # Game mode router (MENU → BAR → FLIGHT → …)
├── components/
│   ├── GameCanvas.tsx         # R3F Canvas + scene dispatcher
│   └── ui/                   # Shared UI primitives (LCDPanel, ScanlineOverlay, TerminalText)
├── features/
│   ├── bar/                   # Bar scene + UI views (Bartender, Commandos, Arcade)
│   ├── briefing/              # Mission briefing scene
│   ├── flight/                # Flight scene, player ship, HUD, enemies, VFX, shaders
│   └── quarters/              # Crew quarters scene
├── hooks/
│   ├── usePlayerControls.ts   # Keyboard → Controls boolean flags
│   └── useControlsConfig.ts   # Rebindable key mapping store
├── state/
│   ├── useGameStore.ts        # Game mode, player health/shields, credits
│   ├── useCombatStore.ts      # Laser pools, enemy AI, collision, arcade waves
│   └── useMissionStore.ts     # Mission lifecycle, objectives, arcade score
└── utils/
    └── audio.ts               # Procedural Web Audio sound effects
```

## Game Modes

The game routes through a set of discrete modes managed by `useGameStore`:

```
MENU → BAR ←→ BRIEFING
              BAR → LAUNCH → FLIGHT → LANDING → BAR
              BAR → ARCADE (FLIGHT mode, arcade ruleset)
              BAR → QUARTERS
```

## Enemy AI

Enemy ships use a 5-state finite-state machine defined in `src/features/flight/enemyAI.ts`:

- **approach** — intercept the player using predictive targeting
- **strafe** — orbit at ~90 units while closing or opening range
- **flank** — circle wide around the player using a Lissajous offset
- **evade** — break away with a randomised evasion vector
- **formation** — wingmen hold a V behind their flight leader

Flocks share a `flockId`; separation forces prevent ships from stacking.

## Development

```bash
npm install
npm run dev      # start Vite dev server
npm run build    # production build
```

## Codebase Knowledge Graph

This project includes a pre-built [Understand Anything](https://github.com/understand-anything/understand-anything) knowledge graph at `.understand-anything/knowledge-graph.json`. It maps the architecture into 9 layers, 84 nodes, 159 edges, and a 15-step guided tour.

### View the interactive dashboard

With [Claude Code](https://claude.ai/code) installed, run:

```
/understand-dashboard
```

This starts a local Vite server and opens an interactive graph explorer. The dashboard URL includes an access token — copy the full URL from the terminal output (it looks like `http://127.0.0.1:5173/?token=<token>`).

### Update the graph after code changes

```
/understand
```

Run this after significant changes to regenerate the graph incrementally. It detects which files changed since the last analysis and only re-analyses those.

### What the graph contains

| Section | Detail |
|---|---|
| **Layers** | 9 architectural layers: Entry & Routing, Flight Scene, Non-Flight Scenes, Shared UI, Game State, Input Hooks, 3D Assets, Debug & Utils, Configuration |
| **Tour** | 15-step guided walkthrough from bootstrap → state stores → flight physics → shaders |
| **Nodes** | 84 total: 41 file, 39 function, 4 config |
| **Edges** | 159 total: imports, contains, exports, calls, depends\_on, configures |

The graph is version-controlled so new contributors can explore the architecture without running the analysis themselves.
