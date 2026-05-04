import { create } from 'zustand';

export type ObjectiveType = 'KILL' | 'PROTECT' | 'NAV';

export interface Objective {
  id: string;
  type: ObjectiveType;
  target: string;
  count: number;
  currentCount: number;
  completed: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  objectives: Objective[];
  dialogueTreeId: string;
}

interface MissionState {
  activeMission: Mission | null;
  availableMissions: Mission[];
  startMission: (missionId: string) => void;
  updateObjective: (objectiveId: string, amount: number) => void;
  completeMission: () => void;
  failMission: () => void;
}

// Mock initial missions
const mockMissions: Mission[] = [
  {
    id: 'm1_escort_alpha',
    title: 'Escort to Waypoint Alpha',
    description: 'Ensure the Vanguard Cargo reaches Waypoint Alpha safely. Nebula Remnant presence expected.',
    dialogueTreeId: 'dt_m1_intro',
    objectives: [
      { id: 'obj_nav_1', type: 'NAV', target: 'Waypoint Alpha', count: 1, currentCount: 0, completed: false },
      { id: 'obj_kill_1', type: 'KILL', target: 'Remnant Interceptor', count: 3, currentCount: 0, completed: false }
    ]
  },
  {
    id: 'm2_defend_carrier',
    title: 'Defend the Vanguard',
    description: 'A massive Remnant fleet is approaching the carrier. Scramble all fighters.',
    dialogueTreeId: 'dt_m2_intro',
    objectives: [
      { id: 'obj_protect_1', type: 'PROTECT', target: 'CMS Vanguard', count: 1, currentCount: 0, completed: false },
      { id: 'obj_kill_2', type: 'KILL', target: 'Remnant Bomber', count: 5, currentCount: 0, completed: false }
    ]
  }
];

export const useMissionStore = create<MissionState>((set) => ({
  activeMission: null,
  availableMissions: mockMissions,
  
  startMission: (missionId) => set((state) => {
    const mission = state.availableMissions.find(m => m.id === missionId);
    return { activeMission: mission || null };
  }),

  updateObjective: (objectiveId, amount) => set((state) => {
    if (!state.activeMission) return state;

    const updatedObjectives = state.activeMission.objectives.map(obj => {
      if (obj.id === objectiveId) {
        const newCount = Math.min(obj.currentCount + amount, obj.count);
        return {
          ...obj,
          currentCount: newCount,
          completed: newCount >= obj.count
        };
      }
      return obj;
    });

    return {
      activeMission: {
        ...state.activeMission,
        objectives: updatedObjectives
      }
    };
  }),

  completeMission: () => set({ activeMission: null }),
  failMission: () => set({ activeMission: null })
}));
