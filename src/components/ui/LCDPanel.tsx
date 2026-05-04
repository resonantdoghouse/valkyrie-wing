import { ReactNode, CSSProperties } from 'react';

interface LCDPanelProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function LCDPanel({ children, className = '', style }: LCDPanelProps) {
  return (
    <div className={`lcd-panel ${className}`} style={style}>
      {children}
    </div>
  );
}
