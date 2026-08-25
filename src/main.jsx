import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("AquaRise Runtime Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ocean-950 text-slate-100 flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-amber-500/40 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-300 mx-auto flex items-center justify-center font-bold text-2xl">
              🌊
            </div>
            <h2 className="text-2xl font-black text-white">AquaRise Encountered an Issue</h2>
            <p className="text-xs text-slate-300">
              {this.state.error?.toString() || 'A runtime error occurred.'}
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-aqua-500 to-ocean-600 text-ocean-950 font-bold text-xs shadow-lg"
            >
              Reset Local Cache & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
