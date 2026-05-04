import { create } from 'zustand';

type GameMode = 'MENU' | 'BAR' | 'BRIEFING' | 'FLIGHT_DECK' | 'FLIGHT' | 'QUARTERS';

interface GameState {
  currentMode: GameMode;
  setMode: (mode: GameMode) => void;
  playerStats: {
    kills: number;
    credits: number;
    rank: string;
  };
  missionId: string | null;
  startMission: (id: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentMode: 'MENU',
  playerStats: { kills: 0, credits: 0, rank: 'Ensign' },
  missionId: null,
  setMode: (mode) => set({ currentMode: mode }),
  startMission: (id) => set({ missionId: id, currentMode: 'FLIGHT' }),
}));
