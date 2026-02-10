import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'monospace', color: '#fff', backgroundColor: '#1e1e1e' }}>
          <h1 style={{ color: '#f5b800' }}>App Error</h1>
          <pre style={{ color: '#e57373', overflow: 'auto' }}>
            {this.state.error.toString()}
          </pre>
          <pre style={{ fontSize: 12, color: '#8e8e8e' }}>
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
