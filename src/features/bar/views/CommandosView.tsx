import { useState } from 'react';
import { useGameStore } from '../../../state/useGameStore';
import { TerminalText } from '../../../components/ui/TerminalText';

interface Character {
  id: string;
  name: string;
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

  const buildOptions = (id: string, name: string, drank: boolean) => {
    const opts: Array<{ label: string; action: () => void; variant?: string }> = [
      { label: 'TELL ME ABOUT YOURSELF', action: () => handleChoice(id, name, drank, 'ABOUT') },
      { label: 'HEARD ANY RUMORS?',       action: () => handleChoice(id, name, drank, 'RUMORS') },
    ];
    if (!drank) {
      opts.push({ label: 'OFFER TO BUY A DRINK (10 C)', action: () => handleChoice(id, name, drank, 'BUY_DRINK') });
    } else {
      opts.push({ label: 'ASK FOR A WAR STORY', action: () => handleChoice(id, name, drank, 'STORY') });
    }
    opts.push({ label: 'LEAVE', action: () => { setActiveCharacter(null); setDialogue([]); }, variant: 'secondary' });
    return opts;
  };

  const handleChoice = (id: string, name: string, drank: boolean, choice: DialogueChoice) => {
    let lines: string[] = [];
    let newDrank = drank;

    if (choice === 'BUY_DRINK') {
      if (credits >= 10) {
        updateCredits(-10);
        newDrank = true;
        setActiveCharacter({ id, name, drank: true });
        lines = [`${name}: "Thanks, Ensign. Nothing like Terra-brewed Synth-Ale to take the edge off. I owe you one."`];
      } else {
        lines = [`${name}: "You're a bit short on credits, Ensign. Maybe next time."`];
      }
    } else if (choice === 'ABOUT') {
      if (!drank) {
        if (id === 'VIPER')   lines = [`${name}: "I'm from the Mars colonies. Buy me a drink and I'll tell you the rest."`];
        if (id === 'BULLDOG') lines = [`${name}: "Old Earth born. Not much to tell. My throat's a bit dry though."`];
        if (id === 'GHOST')   lines = [`${name}: "I specialize in stealth ops. Get me something from the bar and we can talk details."`];
      } else {
        if (id === 'VIPER')   lines = [`${name}: "Like I said, Mars colonies. Joined the Vanguard to explore the frontier. But Terra needs us here. The Remnant is aggressive, they don't do diplomacy."`];
        if (id === 'BULLDOG') lines = [`${name}: "Earth is beautiful, but the frontier is where we are tested. We're not just fighting the Remnant, we're trying to unite the outer rim colonies. It's a heavy burden."`];
        if (id === 'GHOST')   lines = [`${name}: "I'm trying to establish comms with the Zeltron diplomats. If Terra can forge an alliance with them, the Remnant won't stand a chance. But they're scared of retribution."`];
      }
    } else if (choice === 'RUMORS') {
      if (!drank) {
        if (id === 'VIPER')   lines = [`${name}: "I've heard a few things. You buying?"`];
        if (id === 'BULLDOG') lines = [`${name}: "Rumors are cheap. Drinks cost credits."`];
        if (id === 'GHOST')   lines = [`${name}: "The walls have ears. And I have an empty glass."`];
      } else {
        if (id === 'VIPER')   lines = [`${name}: "Word is the Remnant has a new capital ship in Sector 4. Shielding so thick our standard lasers bounce right off. Command is sweating."`];
        if (id === 'BULLDOG') lines = [`${name}: "I heard Command is looking into ancient alien jump gates. If we can activate them, we could bypass the Remnant entirely and strike their homeworld."`];
        if (id === 'GHOST')   lines = [`${name}: "The Zeltrons have technology that can cloak entire cruisers. If we get our hands on that, Terra's fleet would be unstoppable."`];
      }
    } else if (choice === 'STORY') {
      if (id === 'VIPER')   lines = [`${name}: "On the Alpha sector patrol last month, I had three Remnant fighters on my tail. Cut my engines, flipped 180, and vaped two of them while drifting backwards. Best maneuver of my life."`];
      if (id === 'BULLDOG') lines = [`${name}: "During the Siege of Orion, my shields were at 0%. I used the blast wave of an exploding asteroid to surf my way back to the carrier. Hell of a ride."`];
      if (id === 'GHOST')   lines = [`${name}: "Slipped past a Remnant blockade using only passive sensors. I was close enough to see their hull markings. They look like jagged metallic insects up close. Terrifying."`];
    }

    setDialogue(lines);
    setConversationOptions(buildOptions(id, name, newDrank));
  };

  const approach = (id: string, name: string) => {
    setActiveCharacter({ id, name, drank: false });
    let intro = `${name}: "What's on your mind, Ensign?"`;
    if (id === 'VIPER')   intro = `${name}: "You're the new pilot from Terra, right? The name's Viper. Take a seat."`;
    if (id === 'BULLDOG') intro = `${name}: "Ensign. You held formation well out there. Bulldog. What can I do for you?"`;
    if (id === 'GHOST')   intro = `${name}: "Quiet in here today. I'm Elara, they call me Ghost. Join me if you're not reporting to Command."`;
    setDialogue([intro]);
    setConversationOptions(buildOptions(id, name, false));
  };

  if (activeCharacter) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--theme-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <TerminalText as="h2" text={activeCharacter.name} style={{ margin: 0, fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1rem' }} />
          <TerminalText as="p" text={`> Credits: ${credits} C`} style={{ margin: 0, color: 'var(--text-highlight)' }} />
        </div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ minHeight: '80px', padding: '10px', border: '1px solid var(--theme-color)', background: 'rgba(51, 133, 255, 0.1)' }}>
              {dialogue.map((line, i) => <TerminalText key={i} as="p" text={line} delay={5} />)}
            </div>
          </div>
          <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <TerminalText as="h3" text="RESPONSES & ACTIONS" style={{ margin: 0, marginBottom: '0.5rem', borderBottom: '1px solid var(--theme-color)', paddingBottom: '0.5rem', color: 'var(--text-highlight)' }} />
            {conversationOptions.map((opt, i) => (
              <button key={i} className={`interactive-btn${opt.variant ? ` interactive-btn--${opt.variant}` : ''}`} onClick={opt.action}>{opt.label}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--theme-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        <TerminalText as="h2" text="Crew Lounge" style={{ margin: 0, fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1rem' }} />
        <TerminalText as="p" text="> Off-duty pilots are gathered around the tables." style={{ margin: 0, color: 'var(--text-highlight)' }} />
      </div>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px' }}>
          <div style={{ minHeight: '60px', padding: '10px', border: '1px solid var(--theme-color)', background: 'rgba(51, 133, 255, 0.1)' }}>
            <TerminalText as="p" text="> Select a commando to speak with." delay={10} />
          </div>
        </div>
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <TerminalText as="h3" text="PILOTS" style={{ margin: 0, marginBottom: '0.5rem', borderBottom: '1px solid var(--theme-color)', paddingBottom: '0.5rem', color: 'var(--text-highlight)' }} />
          <button className="interactive-btn" onClick={() => approach('VIPER', 'Lt. Sarah "Viper" Jenkins')}>
            APPROACH LT. JENKINS (VIPER)
          </button>
          <button className="interactive-btn" onClick={() => approach('BULLDOG', 'Cpt. Marcus "Bulldog" Vance')}>
            APPROACH CPT. VANCE (BULLDOG)
          </button>
          <button className="interactive-btn" onClick={() => approach('GHOST', 'Ens. Elara "Ghost" Vance')}>
            APPROACH ENS. ELARA (GHOST)
          </button>
          <button className="interactive-btn interactive-btn--secondary" onClick={onBack} style={{ marginTop: '1rem' }}>
            BACK TO MAIN AREA
          </button>
        </div>
      </div>
    </div>
  );
}
