interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Carregando...' }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-slate-200 backdrop-blur-md"
    >
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-white/20 border-t-accent-400"
      />
      <span>{message}</span>
    </div>
  );
}
