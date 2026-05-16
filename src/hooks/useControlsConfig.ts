import { create } from 'zustand';

export interface ControlBindings {
  pitchDown: string;
  pitchUp: string;
  yawLeft: string;
  yawRight: string;
  rollLeft: string;
  rollRight: string;
  throttleUp: string;
  throttleDown: string;
  fire: string;
  boost: string;
  cycleTarget: string;
}

interface ControlsConfigStore {
  bindings: ControlBindings;
  setBinding: (action: keyof ControlBindings, code: string) => void;
}

export const DEFAULT_BINDINGS: ControlBindings = {
  pitchDown:    'KeyW / ArrowUp',
  pitchUp:      'KeyS / ArrowDown',
  yawLeft:      'KeyA / ArrowLeft',
  yawRight:     'KeyD / ArrowRight',
  rollLeft:     'KeyQ',
  rollRight:    'KeyE',
  throttleUp:   'Equal / NumpadAdd',
  throttleDown: 'Minus / NumpadSubtract',
  fire:         'Space',
  boost:        'ShiftLeft / ShiftRight',
  cycleTarget:  'KeyT',
};

export const useControlsConfig = create<ControlsConfigStore>((set) => ({
  bindings: { ...DEFAULT_BINDINGS },
  setBinding: (action, code) =>
    set((s) => ({ bindings: { ...s.bindings, [action]: code } })),
}));
