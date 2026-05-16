import { create } from 'zustand';

interface DebugState {
  showDirections: boolean;
  showCameraInfo: boolean;
  showStats: boolean;
  showLightHelpers: boolean;
  setShowDirections: (v: boolean) => void;
  setShowCameraInfo: (v: boolean) => void;
  setShowStats: (v: boolean) => void;
  setShowLightHelpers: (v: boolean) => void;
}

export const useDebugStore = create<DebugState>((set) => ({
  showDirections: false,
  showCameraInfo: false,
  showStats: false,
  showLightHelpers: false,
  setShowDirections: (v) => set({ showDirections: v }),
  setShowCameraInfo: (v) => set({ showCameraInfo: v }),
  setShowStats: (v) => set({ showStats: v }),
  setShowLightHelpers: (v) => set({ showLightHelpers: v }),
}));
