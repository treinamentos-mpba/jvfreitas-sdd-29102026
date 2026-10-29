import { type FormEvent, useId, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const inputId = useId();
  const normalizedQuery = query.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled || !normalizedQuery) {
      return;
    }

    onSearch(normalizedQuery);
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="w-full max-w-2xl space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-white">
        Buscar cidade
      </label>
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-3 shadow-glass backdrop-blur-md sm:flex-row">
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          disabled={disabled}
          required
          placeholder="Ex.: Campinas"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-night-900/80 px-4 py-3 text-white placeholder:text-slate-400 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400/40 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled || normalizedQuery.length === 0}
          className="rounded-lg bg-accent-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-accent-400 hover:text-night-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
