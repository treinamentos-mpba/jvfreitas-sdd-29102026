import { useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { mockWeatherData } from './mocks/weatherData';
import type { Unit, WeatherData } from './types/weather';

type WeatherViewState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'empty'; query: string }
  | { status: 'error'; query: string }
  | { status: 'success'; query: string; data: WeatherData };

function loadMockWeather(query: string): Promise<WeatherData | null> {
  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
  const mockCityName = mockWeatherData.city.name.toLocaleLowerCase('pt-BR');

  return Promise.resolve(normalizedQuery === mockCityName ? mockWeatherData : null);
}

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const [viewState, setViewState] = useState<WeatherViewState>({ status: 'idle' });

  function handleSearch(query: string) {
    setViewState({ status: 'loading', query });

    void loadMockWeather(query)
      .then((data) => {
        if (data) {
          setViewState({ status: 'success', query, data });
          return;
        }

        setViewState({ status: 'empty', query });
      })
      .catch(() => {
        setViewState({ status: 'error', query });
      });
  }

  function renderWeatherContent() {
    switch (viewState.status) {
      case 'idle':
        return (
          <p className="rounded-xl border border-white/10 bg-white/5 p-5 text-slate-300 backdrop-blur-md">
            Busque uma cidade para consultar o clima.
          </p>
        );
      case 'loading':
        return <LoadingState message={`Buscando ${viewState.query}...`} />;
      case 'empty':
        return (
          <EmptyState
            title="Nenhuma cidade encontrada"
            hint={`Não há dados de demonstração para “${viewState.query}”. Tente Campinas.`}
          />
        );
      case 'error':
        return (
          <ErrorState
            message="Não foi possível carregar os dados. Tente novamente."
            onRetry={() => handleSearch(viewState.query)}
          />
        );
      case 'success':
        return (
          <div className="space-y-8">
            <CurrentWeather
              city={viewState.data.city}
              current={viewState.data.current}
              unit={unit}
            />
            <section aria-labelledby="forecast-heading" className="space-y-4">
              <h2 id="forecast-heading" className="text-lg font-semibold text-white">
                Próximos dias
              </h2>
              <ForecastList
                forecast={viewState.data.forecast}
                unit={unit}
                timeZone={viewState.data.city.timeZone}
              />
            </section>
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <header className="border-b border-white/10 bg-night-800/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <a
            href="#main-content"
            className="w-fit rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
          >
            <span className="block text-xs font-semibold uppercase tracking-widest text-accent-400">
              Weather
            </span>
            <span className="mt-1 block text-2xl font-bold">Tempo</span>
          </a>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <SearchBar onSearch={handleSearch} disabled={viewState.status === 'loading'} />
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {renderWeatherContent()}
      </main>
    </div>
  );
}
