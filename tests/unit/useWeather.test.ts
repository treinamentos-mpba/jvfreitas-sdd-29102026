import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { mockWeatherData } from '../../src/mocks/weatherData';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';

vi.mock('../../src/services/weatherService', () => ({
  getWeather: vi.fn(),
  searchCities: vi.fn(),
  WeatherServiceError: class WeatherServiceError extends Error {
    status: number | null;

    constructor(message: string, status: number | null) {
      super(message);
      this.name = 'WeatherServiceError';
      this.status = status;
    }
  },
}));

describe('useWeather', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('começa idle e carrega o clima da primeira cidade encontrada', async () => {
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    expect(result.current.status).toBe('idle');

    await act(async () => {
      await result.current.search('Campinas');
    });

    expect(searchCities).toHaveBeenCalledWith('Campinas');
    expect(getWeather).toHaveBeenCalledWith(mockWeatherData.city);
    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(mockWeatherData);
    expect(result.current.cities).toEqual([mockWeatherData.city]);
    expect(result.current.query).toBe('Campinas');
    expect(result.current.error).toBeNull();
  });

  it('entra em empty quando a busca não retorna cidades', async () => {
    vi.mocked(searchCities).mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Cidade inexistente');
    });

    expect(result.current.status).toBe('empty');
    expect(result.current.data).toBeNull();
    expect(result.current.cities).toEqual([]);
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('seleciona uma cidade, expõe erro e retry refaz a seleção', async () => {
    const serviceError = new WeatherServiceError('Falha de rede.', null);
    vi.mocked(getWeather)
      .mockRejectedValueOnce(serviceError)
      .mockResolvedValueOnce(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectCity(mockWeatherData.city);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(serviceError);

    await act(async () => {
      await result.current.retry();
    });

    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(mockWeatherData);
    expect(result.current.error).toBeNull();
  });
});
