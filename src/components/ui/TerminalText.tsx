import { useEffect, useState, CSSProperties } from 'react';

interface TerminalTextProps {
  text: string;
  delay?: number;
  className?: string;
  as?: 'h1' | 'h2' | 'p' | 'span';
  style?: CSSProperties;
}

export function TerminalText({ text, delay = 30, className = 'terminal-text', as = 'p', style }: TerminalTextProps) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(intervalId);
      }
    }, delay);

    return () => clearInterval(intervalId);
  }, [text, delay]);

  const Component = as;

  return (
    <Component className={className} style={style}>
      {displayedText}
      <span style={{ animation: 'flicker 1s infinite' }}>_</span>
    </Component>
  );
}
