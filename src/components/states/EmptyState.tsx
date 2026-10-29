interface EmptyStateProps {
  title: string;
  hint: string;
}

export default function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-5 text-white backdrop-blur-md">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-slate-300">{hint}</p>
    </section>
  );
}
