import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.92)',
          fontFamily: "'Share Tech Mono', monospace",
          color: '#ff3333',
          gap: '1.5rem',
          zIndex: 999,
        }}>
          <h2 style={{ margin: 0, fontSize: '2rem', letterSpacing: '0.2rem', textShadow: '0 0 20px #ff3333' }}>
            SYSTEM FAILURE
          </h2>
          <pre style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', maxWidth: '600px', textAlign: 'center', whiteSpace: 'pre-wrap' }}>
            {error.message}
          </pre>
          <button
            className="interactive-btn"
            onClick={() => this.setState({ error: null })}
            style={{ padding: '0.75rem 2rem', fontSize: '1rem', background: 'rgba(255, 51, 51, 0.15)' }}
          >
            ATTEMPT RESTART
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
