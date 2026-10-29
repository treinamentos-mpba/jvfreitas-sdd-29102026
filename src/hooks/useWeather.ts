import { useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

type LastOperation = { kind: 'search'; name: string } | { kind: 'select-city'; city: City };

export interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: WeatherServiceError | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

function toWeatherServiceError(error: unknown): WeatherServiceError {
  if (error instanceof WeatherServiceError) {
    return error;
  }

  return new WeatherServiceError(
    'Não foi possível carregar os dados do clima. Verifique sua conexão e tente novamente.',
    null,
  );
}

export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<WeatherServiceError | null>(null);
  const [query, setQuery] = useState('');
  const requestId = useRef(0);
  const lastOperation = useRef<LastOperation | null>(null);

  async function search(name: string): Promise<void> {
    const currentRequestId = ++requestId.current;
    lastOperation.current = { kind: 'search', name };
    setQuery(name);
    setStatus('loading');
    setData(null);
    setCities([]);
    setError(null);

    try {
      const results = await searchCities(name);
      if (currentRequestId !== requestId.current) {
        return;
      }

      setCities(results);
      const firstCity = results[0];
      if (!firstCity) {
        setStatus('empty');
        return;
      }

      const weather = await getWeather(firstCity);
      if (currentRequestId !== requestId.current) {
        return;
      }

      setData(weather);
      setStatus('success');
    } catch (caughtError) {
      if (currentRequestId !== requestId.current) {
        return;
      }

      setError(toWeatherServiceError(caughtError));
      setStatus('error');
    }
  }

  async function selectCity(city: City): Promise<void> {
    const currentRequestId = ++requestId.current;
    lastOperation.current = { kind: 'select-city', city };
    setQuery(city.name);
    setStatus('loading');
    setData(null);
    setError(null);

    try {
      const weather = await getWeather(city);
      if (currentRequestId !== requestId.current) {
        return;
      }

      setData(weather);
      setStatus('success');
    } catch (caughtError) {
      if (currentRequestId !== requestId.current) {
        return;
      }

      setError(toWeatherServiceError(caughtError));
      setStatus('error');
    }
  }

  async function retry(): Promise<void> {
    const operation = lastOperation.current;
    if (!operation) {
      return;
    }

    if (operation.kind === 'search') {
      await search(operation.name);
      return;
    }

    await selectCity(operation.city);
  }

  return { status, data, cities, error, query, search, selectCity, retry };
}
