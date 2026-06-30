import { useEffect } from 'react';
import { useControls, folder, Leva } from 'leva';
import { useDebugStore } from './useDebugStore';
import { useControlsConfig, DEFAULT_BINDINGS } from '../hooks/useControlsConfig';

function ControlsConfig() {
  const setBinding = useControlsConfig((s) => s.setBinding);

  useControls({
    Controls: folder(
      {
        pitchDown: {
          value: DEFAULT_BINDINGS.pitchDown,
          label: 'Pitch Down',
          onChange: (v: string) => setBinding('pitchDown', v),
        },
        pitchUp: {
          value: DEFAULT_BINDINGS.pitchUp,
          label: 'Pitch Up',
          onChange: (v: string) => setBinding('pitchUp', v),
        },
        yawLeft: {
          value: DEFAULT_BINDINGS.yawLeft,
          label: 'Yaw Left',
          onChange: (v: string) => setBinding('yawLeft', v),
        },
        yawRight: {
          value: DEFAULT_BINDINGS.yawRight,
          label: 'Yaw Right',
          onChange: (v: string) => setBinding('yawRight', v),
        },
        rollLeft: {
          value: DEFAULT_BINDINGS.rollLeft,
          label: 'Roll Left (Aileron)',
          onChange: (v: string) => setBinding('rollLeft', v),
        },
        rollRight: {
          value: DEFAULT_BINDINGS.rollRight,
          label: 'Roll Right (Aileron)',
          onChange: (v: string) => setBinding('rollRight', v),
        },
        throttleUp: {
          value: DEFAULT_BINDINGS.throttleUp,
          label: 'Throttle Up',
          onChange: (v: string) => setBinding('throttleUp', v),
        },
        throttleDown: {
          value: DEFAULT_BINDINGS.throttleDown,
          label: 'Throttle Down',
          onChange: (v: string) => setBinding('throttleDown', v),
        },
        fire: {
          value: DEFAULT_BINDINGS.fire,
          label: 'Fire',
          onChange: (v: string) => setBinding('fire', v),
        },
        boost: {
          value: DEFAULT_BINDINGS.boost,
          label: 'Boost',
          onChange: (v: string) => setBinding('boost', v),
        },
      },
      { collapsed: true }
    ),
  });

  return null;
}

function DebugControls() {
  const store = useDebugStore();

  useControls({
    Debug: folder(
      {
        showDirections: {
          value: false,
          label: 'Direction Arrows',
          onChange: (v: boolean) => store.setShowDirections(v),
        },
        showCameraInfo: {
          value: false,
          label: 'Camera Info',
          onChange: (v: boolean) => store.setShowCameraInfo(v),
        },
        showStats: {
          value: false,
          label: 'GPU Stats (FPS)',
          onChange: (v: boolean) => store.setShowStats(v),
        },
        showLightHelpers: {
          value: false,
          label: 'Light Helpers',
          onChange: (v: boolean) => store.setShowLightHelpers(v),
        },
      },
      { collapsed: true }
    ),
  });

  return null;
}

export function DebugPanel() {
  // Backtick toggles the Leva panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '`') {
        const leva = document.querySelector('[class*="leva"]') as HTMLElement | null;
        if (leva) leva.style.display = leva.style.display === 'none' ? '' : 'none';
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <Leva
        collapsed={true}
        titleBar={{ title: 'DEV PANEL  [`] to toggle', drag: true, filter: true }}
      />
      <DebugControls />
      <ControlsConfig />
    </>
  );
}
