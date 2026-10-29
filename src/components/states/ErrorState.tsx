interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section
      role="alert"
      className="flex flex-col gap-4 rounded-xl border border-red-300/20 bg-red-950/30 p-5 text-white backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h2 className="font-semibold">Não foi possível carregar</h2>
        <p className="mt-1 text-sm text-slate-200">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-accent-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
      >
        Tentar novamente
      </button>
    </section>
  );
}
