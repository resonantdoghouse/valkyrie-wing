import { useState, useEffect } from 'react';
import { useGameStore } from '../../state/useGameStore';
import { useMissionStore } from '../../state/useMissionStore';
import { useCombatStore } from '../../state/useCombatStore';
import { LCDPanel } from '../../components/ui/LCDPanel';
import { TerminalText } from '../../components/ui/TerminalText';

export function BarUI() {
  const { setMode, playerStats, updateCredits } = useGameStore();
  const { startMission } = useMissionStore();
  const [currentView, setCurrentView] = useState<'MAIN' | 'BARTENDER' | 'COMMANDOS' | 'CONVERSATION' | 'ARCADE'>('MAIN');
  const [dialogue, setDialogue] = useState<string[]>([]);
  const credits = playerStats.credits;
  const [activeCharacter, setActiveCharacter] = useState<{ id: string, name: string, drank: boolean } | null>(null);
  const [conversationOptions, setConversationOptions] = useState<Array<{ label: string, action: () => void }>>([]);
  const [leaderboard, setLeaderboard] = useState<{name: string, score: number}[]>([]);

  useEffect(() => {
    if (currentView === 'ARCADE') {
      const lb = JSON.parse(localStorage.getItem('vanguard_arcade_leaderboard') || '[]');
      setLeaderboard(lb);
    }
  }, [currentView]);

  const handleOrder = (item: string, cost: number) => {
    if (credits >= cost) {
      updateCredits(-cost);
      setDialogue([`Bartender Unit 7: "One ${item} coming right up, Ensign."`]);
    } else {
      setDialogue(['Bartender Unit 7: "Insufficient credits. The Vanguard doesn\'t run on tabs."']);
    }
  };

  const initiateConversation = (id: string, name: string) => {
    setActiveCharacter({ id, name, drank: false });
    setCurrentView('CONVERSATION');
    let intro = `${name}: "What's on your mind, Ensign?"`;
    if (id === 'VIPER') intro = `${name}: "You're the new pilot from Terra, right? The name's Viper. Take a seat."`;
    if (id === 'BULLDOG') intro = `${name}: "Ensign. You held formation well out there. Bulldog. What can I do for you?"`;
    if (id === 'GHOST') intro = `${name}: "Quiet in here today. I'm Elara, they call me Ghost. Join me if you're not reporting to Command."`;
    setDialogue([intro]);
    setConversationOptions(getStandardOptions(id, name, false));
  };

  const getStandardOptions = (id: string, name: string, drank: boolean) => {
    const options = [
      { label: 'TELL ME ABOUT YOURSELF', action: () => handleDialogueChoice(id, name, drank, 'ABOUT') },
      { label: 'HEARD ANY RUMORS?', action: () => handleDialogueChoice(id, name, drank, 'RUMORS') }
    ];

    if (!drank) {
      options.push({ label: 'OFFER TO BUY A DRINK (10 C)', action: () => handleDialogueChoice(id, name, drank, 'BUY_DRINK') });
    } else {
      options.push({ label: 'ASK FOR A WAR STORY', action: () => handleDialogueChoice(id, name, drank, 'STORY') });
    }
    
    options.push({ label: 'LEAVE', action: () => {
      setCurrentView('COMMANDOS');
      setDialogue([]);
      setActiveCharacter(null);
    }});

    return options;
  };

  const handleDialogueChoice = (id: string, name: string, drank: boolean, choice: string) => {
    let newDialogue: string[] = [];
    let updatedDrank = drank;
    
    if (choice === 'BUY_DRINK') {
      if (credits >= 10) {
        updateCredits(-10);
        updatedDrank = true;
        setActiveCharacter({ id, name, drank: true });
        newDialogue = [`${name}: "Thanks, Ensign. Nothing like Terra-brewed Synth-Ale to take the edge off. I owe you one."`];
      } else {
        newDialogue = [`${name}: "You're a bit short on credits, Ensign. Maybe next time."`];
      }
    } else if (choice === 'ABOUT') {
      if (!drank) {
        if (id === 'VIPER') newDialogue = [`${name}: "I'm from the Mars colonies. Buy me a drink and I'll tell you the rest."`];
        if (id === 'BULLDOG') newDialogue = [`${name}: "Old Earth born. Not much to tell. My throat's a bit dry though."`];
        if (id === 'GHOST') newDialogue = [`${name}: "I specialize in stealth ops. Get me something from the bar and we can talk details."`];
      } else {
        if (id === 'VIPER') newDialogue = [`${name}: "Like I said, Mars colonies. Joined the Vanguard to explore the frontier. But Terra needs us here. The Remnant is aggressive, they don't do diplomacy."`];
        if (id === 'BULLDOG') newDialogue = [`${name}: "Earth is beautiful, but the frontier is where we are tested. We're not just fighting the Remnant, we're trying to unite the outer rim colonies. It's a heavy burden."`];
        if (id === 'GHOST') newDialogue = [`${name}: "I'm trying to establish comms with the Zeltron diplomats. If Terra can forge an alliance with them, the Remnant won't stand a chance. But they're scared of retribution."`];
      }
    } else if (choice === 'RUMORS') {
      if (!drank) {
        if (id === 'VIPER') newDialogue = [`${name}: "I've heard a few things. You buying?"`];
        if (id === 'BULLDOG') newDialogue = [`${name}: "Rumors are cheap. Drinks cost credits."`];
        if (id === 'GHOST') newDialogue = [`${name}: "The walls have ears. And I have an empty glass."`];
      } else {
        if (id === 'VIPER') newDialogue = [`${name}: "Word is the Remnant has a new capital ship in Sector 4. Shielding so thick our standard lasers bounce right off. Command is sweating."`];
        if (id === 'BULLDOG') newDialogue = [`${name}: "I heard Command is looking into ancient alien jump gates. If we can activate them, we could bypass the Remnant entirely and strike their homeworld."`];
        if (id === 'GHOST') newDialogue = [`${name}: "The Zeltrons have technology that can cloak entire cruisers. If we get our hands on that, Terra's fleet would be unstoppable."`];
      }
    } else if (choice === 'STORY') {
      if (id === 'VIPER') newDialogue = [`${name}: "On the Alpha sector patrol last month, I had three Remnant fighters on my tail. Cut my engines, flipped 180, and vaped two of them while drifting backwards. Best maneuver of my life."`];
      if (id === 'BULLDOG') newDialogue = [`${name}: "During the Siege of Orion, my shields were at 0%. I used the blast wave of an exploding asteroid to surf my way back to the carrier. Hell of a ride."`];
      if (id === 'GHOST') newDialogue = [`${name}: "Slipped past a Remnant blockade using only passive sensors. I was close enough to see their hull markings. They look like jagged metallic insects up close. Terrifying."`];
    }
    
    setDialogue(newDialogue);
    setConversationOptions(getStandardOptions(id, name, updatedDrank));
  };

  return (
    <div className="overlay" style={{ backgroundColor: 'transparent', pointerEvents: 'auto' }}>
      <LCDPanel style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', width: '90vw', maxWidth: '1000px', maxHeight: '85vh', overflowY: 'auto', pointerEvents: 'auto' }}>
        {currentView === 'MAIN' && (
          <>
            <TerminalText as="h2" className="terminal-title" text="The Vanguard Bar" />
            <TerminalText as="p" text="> Welcome back, Ensign." delay={10} />
            
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="interactive-btn" onClick={() => setCurrentView('BARTENDER')}>
                APPROACH THE BAR (BARTENDER UNIT 7)
              </button>
              <button className="interactive-btn" onClick={() => setCurrentView('COMMANDOS')}>
                MINGLE WITH WING COMMANDOS
              </button>
              <button className="interactive-btn" onClick={() => setCurrentView('ARCADE')}>
                PLAY ARCADE FLIGHT SIM
              </button>
              <button className="interactive-btn" onClick={() => setMode('BRIEFING')}>
                GO TO BRIEFING ROOM
              </button>
              <button className="interactive-btn" onClick={() => setMode('QUARTERS')}>
                GO TO QUARTERS
              </button>
              <button className="interactive-btn" onClick={() => setMode('MENU')} style={{ opacity: 0.7 }}>
                RETURN TO FLIGHT DECK
              </button>
            </div>
          </>
        )}

        {currentView === 'ARCADE' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--theme-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <TerminalText as="h2" text="Vanguard Defender Cabinet" style={{ margin: 0, fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1rem' }} />
              <TerminalText as="p" text={`> Credits: ${credits} C`} style={{ margin: 0, color: 'var(--text-highlight)' }} />
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 400px' }}>
                <div style={{ minHeight: '60px', padding: '10px', border: '1px solid var(--theme-color)', background: 'rgba(51, 133, 255, 0.1)' }}>
                  {dialogue.length > 0 ? (
                    dialogue.map((line, i) => <TerminalText key={i} as="p" text={line} delay={5} />)
                  ) : (
                    <>
                      <TerminalText as="p" text="> Insert 5 Credits to play 'Vanguard Defender'." delay={10} />
                      <div style={{ marginTop: '1rem', borderTop: '1px solid var(--theme-color)', paddingTop: '0.5rem' }}>
                        <TerminalText as="h3" text="HIGH SCORES" style={{ margin: 0, marginBottom: '0.5rem', color: 'var(--text-highlight)' }} />
                        {leaderboard.length > 0 ? (
                          leaderboard.map((entry, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '250px', fontFamily: "'Share Tech Mono', monospace" }}>
                              <span>{index + 1}. {entry.name}</span>
                              <span style={{ color: 'var(--accent-orange)' }}>{entry.score}</span>
                            </div>
                          ))
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '250px', fontFamily: "'Share Tech Mono', monospace" }}>
                            <span>1. Lt. Viper</span>
                            <span style={{ color: 'var(--accent-orange)' }}>500</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <TerminalText as="h3" text="ARCADE OPTIONS" style={{ margin: 0, marginBottom: '0.5rem', borderBottom: '1px solid var(--theme-color)', paddingBottom: '0.5rem', color: 'var(--text-highlight)' }} />
                <button className="interactive-btn" onClick={() => {
                  if (credits >= 5) {
                    updateCredits(-5);
                    startMission('arcade_sim_1');
                    useCombatStore.getState().startArcadeWave(1);
                    setMode('FLIGHT');
                  } else {
                    setDialogue(['> ERROR: Insufficient Credits.']);
                  }
                }}>
                  INSERT 5 C & PLAY
                </button>
                <button className="interactive-btn" onClick={() => {
                  setCurrentView('MAIN');
                  setDialogue([]);
                }} style={{ marginTop: '1rem' }}>
                  STEP AWAY
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'BARTENDER' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Top Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--theme-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <TerminalText as="h2" text="Bartender Unit 7" style={{ margin: 0, fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1rem' }} />
              <TerminalText as="p" text={`> Credits: ${credits} C`} style={{ margin: 0, color: 'var(--text-highlight)' }} />
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {/* Left Side: Dialogue */}
              <div style={{ flex: '1 1 400px' }}>
                <div style={{ minHeight: '60px', padding: '10px', border: '1px solid var(--theme-color)', background: 'rgba(51, 133, 255, 0.1)' }}>
                  {dialogue.length > 0 ? (
                    dialogue.map((line, i) => <TerminalText key={i} as="p" text={line} delay={5} />)
                  ) : (
                    <TerminalText as="p" text="Bartender Unit 7: 'What can I get you, Ensign?'" delay={10} />
                  )}
                </div>
              </div>

            {/* Right Side: Options */}
            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <TerminalText as="h3" text="ACTIONS & ORDERS" style={{ margin: 0, marginBottom: '0.5rem', borderBottom: '1px solid var(--theme-color)', paddingBottom: '0.5rem', color: 'var(--text-highlight)' }} />
              <button className="interactive-btn" onClick={() => handleOrder('Nebula Stout', 10)}>
                ORDER NEBULA STOUT (10 C)
              </button>
              <button className="interactive-btn" onClick={() => handleOrder('Synthetic Protein Ration', 15)}>
                ORDER SYNTH-PROTEIN RATION (15 C)
              </button>
              <button className="interactive-btn" onClick={() => {
                setDialogue([
                  'Bartender Unit 7: "I process many conversations.',
                  'The organic pilots are anxious about the Nebula Remnant expansion.',
                  'Also, the synthesizer is low on artificial lime flavoring."'
                ]);
              }}>
                ASK FOR RUMORS
              </button>
              <button className="interactive-btn" onClick={() => {
                setDialogue(['Bartender Unit 7: "I was manufactured on Earth in 2142. My purpose is to ensure crew morale and hydration. I have mixed 4,201 drinks to date."']);
              }}>
                TELL ME ABOUT YOURSELF
              </button>
              <button className="interactive-btn" onClick={() => {
                setCurrentView('MAIN');
                setDialogue([]);
              }} style={{ marginTop: '1rem' }}>
                STEP AWAY
              </button>
            </div>
            </div>
          </div>
        )}

        {currentView === 'COMMANDOS' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Top Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--theme-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <TerminalText as="h2" text="Crew Lounge" style={{ margin: 0, fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1rem' }} />
              <TerminalText as="p" text="> Off-duty pilots are gathered around the tables." style={{ margin: 0, color: 'var(--text-highlight)' }} />
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {/* Left Side: Dialogue/Status */}
              <div style={{ flex: '1 1 400px' }}>
                <div style={{ minHeight: '60px', padding: '10px', border: '1px solid var(--theme-color)', background: 'rgba(51, 133, 255, 0.1)' }}>
                  {dialogue.length > 0 ? (
                    dialogue.map((line, i) => <TerminalText key={i} as="p" text={line} delay={5} />)
                  ) : (
                    <TerminalText as="p" text="> Select a commando to speak with." delay={10} />
                  )}
                </div>
              </div>

            {/* Right Side: Options */}
            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <TerminalText as="h3" text="PILOTS" style={{ margin: 0, marginBottom: '0.5rem', borderBottom: '1px solid var(--theme-color)', paddingBottom: '0.5rem', color: 'var(--text-highlight)' }} />
              <button className="interactive-btn" onClick={() => initiateConversation('VIPER', 'Lt. Sarah "Viper" Jenkins')}>
                APPROACH LT. JENKINS (VIPER)
              </button>
              <button className="interactive-btn" onClick={() => initiateConversation('BULLDOG', 'Cpt. Marcus "Bulldog" Vance')}>
                APPROACH CPT. VANCE (BULLDOG)
              </button>
              <button className="interactive-btn" onClick={() => initiateConversation('GHOST', 'Ens. Elara "Ghost" Vance')}>
                APPROACH ENS. ELARA (GHOST)
              </button>
              <button className="interactive-btn" onClick={() => {
                setCurrentView('MAIN');
                setDialogue([]);
              }} style={{ marginTop: '1rem' }}>
                BACK TO MAIN AREA
              </button>
            </div>
            </div>
          </div>
        )}

        {currentView === 'CONVERSATION' && activeCharacter && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Top Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--theme-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <TerminalText as="h2" text={activeCharacter.name} style={{ margin: 0, fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1rem' }} />
              <TerminalText as="p" text={`> Credits: ${credits} C`} style={{ margin: 0, color: 'var(--text-highlight)' }} />
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {/* Left Side: Dialogue */}
              <div style={{ flex: '1 1 400px' }}>
                <div style={{ minHeight: '80px', padding: '10px', border: '1px solid var(--theme-color)', background: 'rgba(51, 133, 255, 0.1)' }}>
                  {dialogue.map((line, i) => <TerminalText key={i} as="p" text={line} delay={5} />)}
                </div>
              </div>

            {/* Right Side: Options */}
            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <TerminalText as="h3" text="RESPONSES & ACTIONS" style={{ margin: 0, marginBottom: '0.5rem', borderBottom: '1px solid var(--theme-color)', paddingBottom: '0.5rem', color: 'var(--text-highlight)' }} />
              {conversationOptions.map((opt, i) => (
                <button key={i} className="interactive-btn" onClick={opt.action}>
                  {opt.label}
                </button>
              ))}
            </div>
            </div>
          </div>
        )}
      </LCDPanel>
    </div>
  );
}
