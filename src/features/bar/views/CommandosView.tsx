import { useState } from 'react';
import { useGameStore } from '../../../state/useGameStore';
import { TerminalText } from '../../../components/ui/TerminalText';

interface Character {
  id: string;
  name: string;
  callsign: string;
  icon: string;
  role: string;
  drank: boolean;
}

type DialogueChoice = 'ABOUT' | 'RUMORS' | 'BUY_DRINK' | 'STORY';

interface Props {
  onBack: () => void;
}

export function CommandosView({ onBack }: Props) {
  const { playerStats, updateCredits } = useGameStore();
  const credits = playerStats.credits;

  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [dialogue, setDialogue] = useState<string[]>([]);
  const [conversationOptions, setConversationOptions] = useState<Array<{ label: string; action: () => void; variant?: string }>>([]);

  const buildOptions = (char: Character) => {
    const opts: Array<{ label: string; action: () => void; variant?: string }> = [
      { label: '💬 TELL ME ABOUT YOURSELF', action: () => handleChoice(char, 'ABOUT') },
      { label: '📡 HEARD ANY RUMORS?',       action: () => handleChoice(char, 'RUMORS') },
    ];
    if (!char.drank) {
      opts.push({ label: '🍺 OFFER A DRINK (10 C)', action: () => handleChoice(char, 'BUY_DRINK') });
    } else {
      opts.push({ label: '⚔️ ASK FOR A WAR STORY', action: () => handleChoice(char, 'STORY') });
    }
    opts.push({ label: '&larr; STEP AWAY', action: () => { setActiveCharacter(null); setDialogue([]); }, variant: 'secondary' });
    return opts;
  };

  const handleChoice = (char: Character, choice: DialogueChoice) => {
    let lines: string[] = [];
    let updatedChar = { ...char };

    if (choice === 'BUY_DRINK') {
      if (credits >= 10) {
        updateCredits(-10);
        updatedChar.drank = true;
        setActiveCharacter(updatedChar);
        lines = [`${char.name}: "Thanks, Ensign. Nothing like Terra-brewed Synth-Ale to take the edge off. I owe you one."`];
      } else {
        lines = [`${char.name}: "You're a bit short on credits, Ensign. Maybe next round."`];
      }
    } else if (choice === 'ABOUT') {
      if (!char.drank) {
        if (char.id === 'VIPER')   lines = [`${char.name}: "I'm from the Mars colonies. Buy me a drink and I'll tell you the rest."`];
        if (char.id === 'BULLDOG') lines = [`${char.name}: "Old Earth born. Not much to tell. My throat's a bit dry though."`];
        if (char.id === 'GHOST')   lines = [`${char.name}: "I specialize in stealth recon ops. Get me something from the bar and we can talk details."`];
      } else {
        if (char.id === 'VIPER')   lines = [`${char.name}: "Like I said, Mars colonies. Joined the Vanguard to explore the frontier. The Remnant is aggressive, they don't do diplomacy."`];
        if (char.id === 'BULLDOG') lines = [`${char.name}: "Earth is beautiful, but the frontier is where we are tested. We're not just fighting the Remnant, we're trying to unite the outer rim colonies."`];
        if (char.id === 'GHOST')   lines = [`${char.name}: "I'm trying to establish comms with the Zeltron diplomats. If Terra can forge an alliance with them, the Remnant won't stand a chance."`];
      }
    } else if (choice === 'RUMORS') {
      if (!char.drank) {
        if (char.id === 'VIPER')   lines = [`${char.name}: "I've heard a few things. You buying?"`];
        if (char.id === 'BULLDOG') lines = [`${char.name}: "Rumors are cheap. Drinks cost credits."`];
        if (char.id === 'GHOST')   lines = [`${char.name}: "The walls have ears. And I have an empty glass."`];
      } else {
        if (char.id === 'VIPER')   lines = [`${char.name}: "Word is the Remnant has a new capital ship in Sector 4. Shielding so thick our standard lasers bounce right off. Command is sweating."`];
        if (char.id === 'BULLDOG') lines = [`${char.name}: "I heard Command is looking into ancient alien jump gates. If we can activate them, we could bypass the Remnant entirely."`];
        if (char.id === 'GHOST')   lines = [`${char.name}: "The Zeltrons have technology that can cloak entire cruisers. If we get our hands on that, Terra's fleet would be unstoppable."`];
      }
    } else if (choice === 'STORY') {
      if (char.id === 'VIPER')   lines = [`${char.name}: "On the Alpha sector patrol last month, I had three Remnant fighters on my tail. Cut my engines, flipped 180, and vaped two of them while drifting backwards."`];
      if (char.id === 'BULLDOG') lines = [`${char.name}: "During the Siege of Orion, my shields were at 0%. I used the blast wave of an exploding asteroid to surf my way back to the carrier."`];
      if (char.id === 'GHOST')   lines = [`${char.name}: "Slipped past a Remnant blockade using only passive sensors. I was close enough to see their hull markings. Metallic insects up close."`];
    }

    setDialogue(lines);
    setConversationOptions(buildOptions(updatedChar));
  };

  const approach = (id: string, name: string, callsign: string, icon: string, role: string) => {
    const char: Character = { id, name, callsign, icon, role, drank: false };
    setActiveCharacter(char);
    let intro = `${name}: "What's on your mind, Ensign?"`;
    if (id === 'VIPER')   intro = `${name}: "You're the new pilot from Terra, right? The name's Viper. Take a seat."`;
    if (id === 'BULLDOG') intro = `${name}: "Ensign. You held formation well out there. Bulldog. What can I do for you?"`;
    if (id === 'GHOST')   intro = `${name}: "Quiet in here today. I'm Elara, they call me Ghost. Join me if you're not reporting to Command."`;
    setDialogue([intro]);
    setConversationOptions(buildOptions(char));
  };

  if (activeCharacter) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Character Avatar Header */}
        <div className="character-avatar-badge">
          <div className="character-avatar-icon" style={{ borderColor: '#ff9900', color: '#ff9900' }}>
            {activeCharacter.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', letterSpacing: '0.08rem' }}>
                {activeCharacter.name} [{activeCharacter.callsign}]
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-highlight)' }}>
                CREDITS: {credits} C
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              ROLE: {activeCharacter.role} &bull; MORALE: {activeCharacter.drank ? 'OPTIMAL' : 'SOBER'}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="dialogue-content-grid" style={{ marginTop: '0.75rem' }}>
          <div className="dialogue-speech-box">
            {dialogue.map((line, i) => <TerminalText key={i} as="p" text={line} delay={4} style={{ margin: 0, fontSize: '0.95rem' }} />)}
          </div>
          <div className="dialogue-actions-box">
            {conversationOptions.map((opt, i) => (
              <button 
                key={i} 
                className={`interactive-btn${opt.variant ? ` interactive-btn--${opt.variant}` : ''}`} 
                onClick={opt.action}
                style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                dangerouslySetInnerHTML={{ __html: opt.label }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="character-avatar-badge">
        <div className="character-avatar-icon" style={{ borderColor: '#ff7700', color: '#ff7700' }}>
          👥
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', letterSpacing: '0.08rem' }}>
            WING COMMANDOS // PILOT LOUNGE
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            3 VETERAN PILOTS OFF-DUTY &bull; TABLE SECTOR B
          </div>
        </div>
      </div>

      <div className="dialogue-content-grid" style={{ marginTop: '0.75rem' }}>
        <div className="dialogue-speech-box">
          <TerminalText as="p" text="> Off-duty pilots from the 7th Fighter Squadron are sharing combat logs and Synth-Ale around the table." delay={8} style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }} />
          <TerminalText as="p" text="> Select a commando to sit down and chat with." delay={8} style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#00ff88' }} />
        </div>

        <div className="dialogue-actions-box">
          <button className="interactive-btn" onClick={() => approach('VIPER', 'Lt. Sarah Jenkins', 'VIPER', '⚡', 'Interceptor Specialist')} style={{ padding: '0.5rem', fontSize: '0.9rem' }}>
            ⚡ LT. JENKINS (VIPER)
          </button>
          <button className="interactive-btn" onClick={() => approach('BULLDOG', 'Cpt. Marcus Vance', 'BULLDOG', '🛡️', 'Heavy Bomber Lead')} style={{ padding: '0.5rem', fontSize: '0.9rem' }}>
            🛡️ CPT. VANCE (BULLDOG)
          </button>
          <button className="interactive-btn" onClick={() => approach('GHOST', 'Ens. Elara Vance', 'GHOST', '👁️', 'Stealth Recon Specialist')} style={{ padding: '0.5rem', fontSize: '0.9rem' }}>
            👁️ ENS. ELARA (GHOST)
          </button>
          <button className="interactive-btn interactive-btn--secondary" onClick={onBack} style={{ padding: '0.45rem', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            &larr; BACK TO MAIN LOUNGE
          </button>
        </div>
      </div>
    </div>
  );
}

