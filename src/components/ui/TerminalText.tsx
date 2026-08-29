import { useEffect, useState, CSSProperties } from 'react';
import { playTerminalKeySound } from '../../utils/audio';

interface TerminalTextProps {
  text: string;
  delay?: number;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  style?: CSSProperties;
  enableAudio?: boolean;
}

export function TerminalText({
  text,
  delay = 30,
  className = 'terminal-text',
  as = 'p',
  style,
  enableAudio = true,
}: TerminalTextProps) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const intervalId = setInterval(() => {
      const char = text[i];
      setDisplayedText(text.slice(0, i + 1));
      
      // Play typing tick for visible characters (skip spaces)
      if (enableAudio && char && char.trim() !== '') {
        playTerminalKeySound();
      }
      
      i++;
      if (i >= text.length) {
        clearInterval(intervalId);
      }
    }, delay);

    return () => clearInterval(intervalId);
  }, [text, delay, enableAudio]);

  const Component = as;

  return (
    <Component className={className} style={style}>
      {displayedText}
      <span style={{ animation: 'flicker 1s infinite' }}>_</span>
    </Component>
  );
}
