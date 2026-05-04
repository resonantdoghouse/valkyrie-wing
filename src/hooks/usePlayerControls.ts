import { useEffect, useState } from 'react';

interface Controls {
  pitchUp: boolean;
  pitchDown: boolean;
  yawLeft: boolean;
  yawRight: boolean;
  rollLeft: boolean;
  rollRight: boolean;
  throttleUp: boolean;
  throttleDown: boolean;
  fire: boolean;
}

export function usePlayerControls() {
  const [controls, setControls] = useState<Controls>({
    pitchUp: false,
    pitchDown: false,
    yawLeft: false,
    yawRight: false,
    rollLeft: false,
    rollRight: false,
    throttleUp: false,
    throttleDown: false,
    fire: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp': setControls((c) => ({ ...c, pitchDown: true })); break;
        case 'KeyS':
        case 'ArrowDown': setControls((c) => ({ ...c, pitchUp: true })); break;
        case 'KeyA':
        case 'ArrowLeft': setControls((c) => ({ ...c, yawLeft: true })); break;
        case 'KeyD':
        case 'ArrowRight': setControls((c) => ({ ...c, yawRight: true })); break;
        case 'KeyQ': setControls((c) => ({ ...c, rollLeft: true })); break;
        case 'KeyE': setControls((c) => ({ ...c, rollRight: true })); break;
        case 'Equal':
        case 'NumpadAdd': setControls((c) => ({ ...c, throttleUp: true })); break;
        case 'Minus':
        case 'NumpadSubtract': setControls((c) => ({ ...c, throttleDown: true })); break;
        case 'Space': setControls((c) => ({ ...c, fire: true })); break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp': setControls((c) => ({ ...c, pitchDown: false })); break;
        case 'KeyS':
        case 'ArrowDown': setControls((c) => ({ ...c, pitchUp: false })); break;
        case 'KeyA':
        case 'ArrowLeft': setControls((c) => ({ ...c, yawLeft: false })); break;
        case 'KeyD':
        case 'ArrowRight': setControls((c) => ({ ...c, yawRight: false })); break;
        case 'KeyQ': setControls((c) => ({ ...c, rollLeft: false })); break;
        case 'KeyE': setControls((c) => ({ ...c, rollRight: false })); break;
        case 'Equal':
        case 'NumpadAdd': setControls((c) => ({ ...c, throttleUp: false })); break;
        case 'Minus':
        case 'NumpadSubtract': setControls((c) => ({ ...c, throttleDown: false })); break;
        case 'Space': setControls((c) => ({ ...c, fire: false })); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return controls;
}
