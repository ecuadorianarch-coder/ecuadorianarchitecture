import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { ContentProvider } from './context/ContentContext';
import { AdvertisingProvider } from './context/AdvertisingContext';
import { AdminPage } from './pages/Admin';
import './styles/globals.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AdminErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Admin Panel Uncaught Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-[#121212] text-white flex items-center justify-center p-6 font-inter">
          <div className="max-w-md w-full bg-[#1c1c1c] border border-white/20 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 font-anton text-sm uppercase tracking-wider">
              <span>⚠️ RECUPERACIÓN DEL PANEL CMS</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed font-mono">
              {this.state.error?.message || 'Ocurrió un error inesperado al renderizar el componente.'}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="flex-1 py-2 px-3 bg-white text-black font-anton text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors"
              >
                Recargar Panel
              </button>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem('ea_editing_article_id');
                  window.location.href = '/admin.html';
                }}
                className="py-2 px-3 bg-white/10 text-white font-anton text-xs uppercase tracking-wider hover:bg-white/20 transition-colors border border-white/20"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const AdminApp: React.FC = () => {
  return (
    <AdminErrorBoundary>
      <ContentProvider>
        <AdvertisingProvider>
          <AdminPage />
        </AdvertisingProvider>
      </ContentProvider>
    </AdminErrorBoundary>
  );
};

ReactDOM.createRoot(document.getElementById('admin-root')!).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
);
