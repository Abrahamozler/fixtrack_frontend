import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props){ super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error){ return { hasError: true, error }; }
  componentDidCatch(error, info){ console.error('App crashed:', error, info); }
  render(){
    if (this.state.hasError) return <div style={{ padding: 24 }}>Something went wrong.</div>;
    return this.props.children;
  }
}
export default ErrorBoundary;
