import { useState } from 'react';
import { LCDPanel } from '../../components/ui/LCDPanel';
import { MainView } from './views/MainView';
import { BartenderView } from './views/BartenderView';
import { CommandosView } from './views/CommandosView';
import { ArcadeView } from './views/ArcadeView';

type BarView = 'MAIN' | 'BARTENDER' | 'COMMANDOS' | 'ARCADE';

export function BarUI() {
  const [currentView, setCurrentView] = useState<BarView>('MAIN');

  return (
    <div className="overlay" style={{ backgroundColor: 'transparent', pointerEvents: 'auto' }}>
      <LCDPanel style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', width: '90vw', maxWidth: '1000px', maxHeight: '85vh', overflowY: 'auto', pointerEvents: 'auto' }}>
        {currentView === 'MAIN'      && <MainView      onNavigate={setCurrentView} />}
        {currentView === 'BARTENDER' && <BartenderView onBack={() => setCurrentView('MAIN')} />}
        {currentView === 'COMMANDOS' && <CommandosView onBack={() => setCurrentView('MAIN')} />}
        {currentView === 'ARCADE'    && <ArcadeView    onBack={() => setCurrentView('MAIN')} />}
      </LCDPanel>
    </div>
  );
}
