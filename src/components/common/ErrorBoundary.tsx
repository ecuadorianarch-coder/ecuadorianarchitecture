import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error capturado por ErrorBoundary de Ecuadorian Architecture:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] text-ea-black flex flex-col items-center justify-center p-6 text-center select-none font-inter">
          <div className="max-w-md w-full bg-white border-2 border-ea-black p-8 shadow-[6px_6px_0px_#000]">
            <div className="w-12 h-12 bg-black text-white flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <h2 className="font-anton text-2xl uppercase tracking-wider mb-2">
              EXPEDIENTE TEMPORALMENTE NO DISPONIBLE
            </h2>
            <p className="font-creato text-sm text-ea-black/70 mb-6 leading-relaxed">
              Ocurrió un error inesperado al procesar la vista. Tus datos y navegación no se han perdido.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-4 py-2.5 bg-ea-black text-white font-anton text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reintentar</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-4 py-2.5 border-2 border-ea-black text-ea-black font-anton text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Ir al Inicio</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
