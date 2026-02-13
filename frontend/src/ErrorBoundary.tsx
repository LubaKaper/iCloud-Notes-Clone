import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: 'monospace', color: '#fff', backgroundColor: '#1e1e1e' }}>
          <h1 style={{ color: '#f5b800' }}>App Error</h1>
          <pre style={{ color: '#e57373', overflow: 'auto' }}>{this.state.message ?? 'Unknown error'}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
