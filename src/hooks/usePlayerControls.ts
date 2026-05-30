import { useEffect, useRef } from 'react';
import { useControlsConfig, ControlBindings } from './useControlsConfig';

export interface Controls {
  pitchUp: boolean;
  pitchDown: boolean;
  yawLeft: boolean;
  yawRight: boolean;
  rollLeft: boolean;
  rollRight: boolean;
  throttleUp: boolean;
  throttleDown: boolean;
  fire: boolean;
  boost: boolean;
  cycleTarget: boolean;
}

const INITIAL_CONTROLS: Controls = {
  pitchUp: false, pitchDown: false,
  yawLeft: false, yawRight: false,
  rollLeft: false, rollRight: false,
  throttleUp: false, throttleDown: false,
  fire: false, boost: false, cycleTarget: false,
};

function matchesSlot(code: string, slot: string): boolean {
  return slot.split('/').map((s) => s.trim()).includes(code);
}

function codeToAction(code: string, bindings: ControlBindings): keyof Controls | null {
  if (matchesSlot(code, bindings.pitchDown))    return 'pitchDown';
  if (matchesSlot(code, bindings.pitchUp))      return 'pitchUp';
  if (matchesSlot(code, bindings.yawLeft))      return 'yawLeft';
  if (matchesSlot(code, bindings.yawRight))     return 'yawRight';
  if (matchesSlot(code, bindings.rollLeft))     return 'rollLeft';
  if (matchesSlot(code, bindings.rollRight))    return 'rollRight';
  if (matchesSlot(code, bindings.throttleUp))   return 'throttleUp';
  if (matchesSlot(code, bindings.throttleDown)) return 'throttleDown';
  if (matchesSlot(code, bindings.fire))         return 'fire';
  if (matchesSlot(code, bindings.boost))        return 'boost';
  if (matchesSlot(code, bindings.cycleTarget))  return 'cycleTarget';
  return null;
}

// Returns a stable ref — callers read controls.current inside useFrame without
// triggering React re-renders on every keypress.
export function usePlayerControls() {
  const bindings = useControlsConfig((s) => s.bindings);
  const controlsRef = useRef<Controls>({ ...INITIAL_CONTROLS });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const action = codeToAction(e.code, bindings);
      if (action) controlsRef.current = { ...controlsRef.current, [action]: true };
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const action = codeToAction(e.code, bindings);
      if (action) controlsRef.current = { ...controlsRef.current, [action]: false };
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [bindings]);

  return controlsRef;
}
