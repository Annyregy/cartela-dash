import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  label: string;
  onReset?: () => void;
}
interface State {
  error: Error | null;
}

export class TabErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // Surface the real error in the console so future debug turns can see it.
    console.error(`[TabErrorBoundary:${this.props.label}]`, error, info);
  }

  reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-xl bg-surface border border-border p-6 text-center space-y-3 max-w-md mx-auto mt-6">
          <h2 className="text-lg font-bold text-foreground">
            Não foi possível carregar {this.props.label}
          </h2>
          <p className="text-sm text-muted-foreground">
            Ocorreu um problema nesta aba. Você pode tentar novamente sem sair do app.
          </p>
          <pre className="text-xs text-left bg-background/60 border border-border rounded p-2 overflow-auto max-h-40">
            {this.state.error.message}
          </pre>
          <div className="flex gap-2 justify-center">
            <button
              onClick={this.reset}
              className="px-4 py-2 rounded-lg bg-gold text-gold-foreground font-semibold text-sm"
            >
              Tentar novamente
            </button>
            <button
              onClick={() => location.reload()}
              className="px-4 py-2 rounded-lg bg-muted text-foreground font-semibold text-sm border border-border"
            >
              Recarregar app
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
