import { useEffect, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const weather = useWeather();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (weather.status !== 'success' && weather.status !== 'empty') {
      return;
    }

    mainRef.current?.querySelector<HTMLElement>('h2[tabindex="-1"]')?.focus();
  }, [weather.status]);

  function renderWeatherContent() {
    switch (weather.status) {
      case 'idle':
        return (
          <p className="rounded-xl border border-white/10 bg-white/5 p-5 text-slate-300 backdrop-blur-md">
            Busque uma cidade para consultar o clima.
          </p>
        );
      case 'loading':
        return <LoadingState message={`Buscando ${weather.query}...`} />;
      case 'empty':
        return (
          <EmptyState
            title="Nenhuma cidade encontrada"
            hint={`Não foram encontradas cidades para “${weather.query}”. Tente outro nome.`}
          />
        );
      case 'error':
        return (
          <ErrorState
            message={weather.error?.message ?? 'Não foi possível carregar os dados.'}
            onRetry={() => {
              void weather.retry();
            }}
          />
        );
      case 'success': {
        if (!weather.data) {
          return (
            <ErrorState
              message="Os dados recebidos estão incompletos."
              onRetry={() => {
                void weather.retry();
              }}
            />
          );
        }

        return (
          <div className="space-y-8">
            <CurrentWeather city={weather.data.city} current={weather.data.current} unit={unit} />
            <section aria-labelledby="forecast-heading" className="space-y-4">
              <h2 id="forecast-heading" className="text-lg font-semibold text-white">
                Previsão de 5 dias
              </h2>
              <ForecastList
                forecast={weather.data.forecast}
                unit={unit}
                timeZone={weather.data.city.timeZone}
              />
            </section>
          </div>
        );
      }
    }
  }

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-50 rounded-lg bg-accent-400 px-4 py-3 font-semibold text-night-900 focus:not-sr-only focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Pular para o conteúdo
      </a>
      <header className="border-b border-white/10 bg-night-800/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="shrink-0">
            <span className="block text-xs font-semibold uppercase tracking-widest text-accent-400">
              Weather
            </span>
            <span className="mt-1 block text-2xl font-bold">Tempo</span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <SearchBar
              onSearch={(name) => {
                void weather.search(name);
              }}
              disabled={weather.status === 'loading'}
            />
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>
      </header>

      <main
        id="main-content"
        ref={mainRef}
        aria-busy={weather.status === 'loading'}
        tabIndex={-1}
        className="mx-auto max-w-7xl space-y-8 px-4 py-8 focus-visible:outline-none sm:px-6 lg:px-8"
      >
        {renderWeatherContent()}
      </main>
    </div>
  );
}
