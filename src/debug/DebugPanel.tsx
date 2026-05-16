import { useEffect } from 'react';
import { useControls, folder, Leva } from 'leva';
import { useDebugStore } from './useDebugStore';

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
      { collapsed: false }
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
        collapsed={false}
        titleBar={{ title: 'DEV PANEL  [`] to toggle', drag: true, filter: true }}
      />
      <DebugControls />
    </>
  );
}
