import { create } from "zustand";

type GameMode =
  | "MENU"
  | "BAR"
  | "BRIEFING"
  | "FLIGHT_DECK"
  | "LAUNCH"
  | "FLIGHT"
  | "LANDING"
  | "QUARTERS";

interface GameState {
  currentMode: GameMode;
  setMode: (mode: GameMode) => void;
  boundaryWarning: 'none' | 'warning' | 'turning';
  setBoundaryWarning: (phase: 'none' | 'warning' | 'turning') => void;
  playerStats: {
    kills: number;
    credits: number;
    rank: string;
  };
  updateCredits: (amount: number) => void;
  missionId: string | null;
  startMission: (id: string) => void;
  playerHealth: {
    hull: { front: number; rear: number; left: number; right: number };
    shields: { front: number; rear: number; left: number; right: number };
  };
  takeDamage: (
    direction: "front" | "rear" | "left" | "right",
    amount: number,
  ) => void;
  rechargeShields: (delta: number) => void;
  isPlayerDead: boolean;
  setPlayerDead: (dead: boolean) => void;
  
  // Room Interactivity States
  barView: 'MAIN' | 'BARTENDER' | 'COMMANDOS' | 'ARCADE';
  setBarView: (view: 'MAIN' | 'BARTENDER' | 'COMMANDOS' | 'ARCADE') => void;
  briefingMode: 'NAV' | 'HAZARDS' | 'TACTICAL';
  setBriefingMode: (mode: 'NAV' | 'HAZARDS' | 'TACTICAL') => void;
  quartersLogs: string[];
  addQuartersLog: (log: string) => void;
  setQuartersLogs: (logs: string[]) => void;
  quartersLightsOn: boolean;
  toggleQuartersLights: () => void;
  cinematicViewMode: boolean;
  toggleCinematicViewMode: () => void;
  setCinematicViewMode: (active: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentMode: "MENU",
  boundaryWarning: 'none',
  setBoundaryWarning: (phase) => set({ boundaryWarning: phase }),
  isPlayerDead: false,
  setPlayerDead: (dead) => set({ isPlayerDead: dead }),
  playerStats: { kills: 0, credits: 300, rank: "Ensign" },
  updateCredits: (amount: number) =>
    set((state) => ({
      playerStats: {
        ...state.playerStats,
        credits: state.playerStats.credits + amount,
      },
    })),
  missionId: null,
  playerHealth: {
    hull: { front: 100, rear: 100, left: 100, right: 100 },
    shields: { front: 100, rear: 100, left: 100, right: 100 },
  },
  
  // Initial Room States
  barView: 'MAIN',
  setBarView: (view) => set({ barView: view, cinematicViewMode: false }),
  briefingMode: 'NAV',
  setBriefingMode: (mode) => set({ briefingMode: mode }),
  quartersLogs: ['Status: Rest period active.', 'Rank: Ensign.', 'System diagnostics: Nominal.'],
  addQuartersLog: (log) => set((state) => ({
    quartersLogs: [...state.quartersLogs.slice(-4), log] // Keep last 5 lines for clean overlay display
  })),
  setQuartersLogs: (logs) => set({ quartersLogs: logs }),
  quartersLightsOn: true,
  toggleQuartersLights: () => set((state) => ({ quartersLightsOn: !state.quartersLightsOn })),
  cinematicViewMode: false,
  toggleCinematicViewMode: () => set((state) => ({ cinematicViewMode: !state.cinematicViewMode })),
  setCinematicViewMode: (active) => set({ cinematicViewMode: active }),

  setMode: (mode) => set({ currentMode: mode }),
  startMission: (id) =>
    set({
      missionId: id,
      currentMode: "FLIGHT",
      isPlayerDead: false,
      playerHealth: {
        hull: { front: 100, rear: 100, left: 100, right: 100 },
        shields: { front: 100, rear: 100, left: 100, right: 100 },
      },
    }),
  takeDamage: (direction, amount) =>
    set((state) => {
      const newHealth = {
        ...state.playerHealth,
        shields: { ...state.playerHealth.shields },
        hull: { ...state.playerHealth.hull },
      };
      let remainingDamage = amount;

      if (newHealth.shields[direction] > 0) {
        if (newHealth.shields[direction] >= remainingDamage) {
          newHealth.shields[direction] -= remainingDamage;
          remainingDamage = 0;
        } else {
          remainingDamage -= newHealth.shields[direction];
          newHealth.shields[direction] = 0;
        }
      }

      if (remainingDamage > 0) {
        newHealth.hull[direction] = Math.max(
          0,
          newHealth.hull[direction] - remainingDamage,
        );
      }

      const isDead =
        newHealth.hull.front === 0 ||
        newHealth.hull.rear === 0 ||
        newHealth.hull.left === 0 ||
        newHealth.hull.right === 0;

      return {
        playerHealth: newHealth,
        isPlayerDead: state.isPlayerDead || isDead,
      };
    }),
  rechargeShields: (delta) =>
    set((state) => {
      // Recharge 5 units per second
      const rechargeRate = 5 * delta;
      const newShields = { ...state.playerHealth.shields };
      let changed = false;

      (["front", "rear", "left", "right"] as const).forEach((dir) => {
        if (newShields[dir] < 100) {
          newShields[dir] = Math.min(100, newShields[dir] + rechargeRate);
          changed = true;
        }
      });

      if (changed) {
        return { playerHealth: { ...state.playerHealth, shields: newShields } };
      }
      return state;
    }),
}));
