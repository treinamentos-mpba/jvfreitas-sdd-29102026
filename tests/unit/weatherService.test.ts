import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockWeatherData } from '../../src/mocks/weatherData';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';

describe('searchCities', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('retorna lista vazia sem chamar a rede para input vazio', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('codifica o nome e mapeia resultados válidos para City', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              id: 3448439,
              name: 'São Paulo',
              admin1: 'São Paulo',
              country: 'Brasil',
              country_code: 'BR',
              latitude: -23.55,
              longitude: -46.63,
              timezone: 'America/Sao_Paulo',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const cities = await searchCities(' São Paulo & ');
    const requestUrl = String(fetchMock.mock.calls[0]?.[0]);

    expect(requestUrl).toContain(`name=${encodeURIComponent('São Paulo &')}`);
    expect(requestUrl).toContain('count=5&language=pt&format=json');
    expect(cities).toEqual([
      {
        id: 3448439,
        name: 'São Paulo',
        adminRegion: 'São Paulo',
        country: 'Brasil',
        countryCode: 'BR',
        latitude: -23.55,
        longitude: -46.63,
        timeZone: 'America/Sao_Paulo',
      },
    ]);
  });

  it('descarta resultados sem coordenadas ou fuso consultável', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ results: [null, { name: 'Cidade sem coordenadas' }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('Cidade')).resolves.toEqual([]);
  });

  it('lança WeatherServiceError quando a resposta HTTP não é ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('Campinas')).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(searchCities('Campinas')).rejects.toMatchObject({ status: 503 });
  });

  it('aborta e lança WeatherServiceError após dez segundos', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn<typeof fetch>(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => {
              const abortError = new Error('aborted');
              abortError.name = 'AbortError';
              reject(abortError);
            },
            { once: true },
          );
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const request = expect(searchCities('Campinas')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'A requisição demorou demais.',
      status: null,
    });
    await vi.advanceTimersByTimeAsync(10_000);

    await request;
  });

  it('converte falha de rede em WeatherServiceError e limpa o timer', async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('fetch failed'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('Campinas')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Falha de rede.',
      status: null,
    });
    expect(clearTimeoutSpy).toHaveBeenCalledOnce();
  });

  it('consulta current e daily e mapeia cinco dias por índice', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          current: {
            time: '2026-10-29T12:00',
            temperature_2m: 23.8,
            apparent_temperature: 24.2,
            weather_code: 1,
            relative_humidity_2m: 57,
            wind_speed_10m: 9.4,
            precipitation: 0.2,
            pressure_msl: 1013.2,
          },
          daily: {
            time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
            weather_code: [1, 3, 61, 2, 0],
            temperature_2m_min: [17.2, 18, 19.1, 17.8, 16.4],
            temperature_2m_max: [27.1, 26.3, 24.8, 25.4, 28],
            precipitation_probability_max: [10, 15, 75, 20, 0],
            wind_speed_10m_max: [12.4, 14.1, 17.6, 11.3, 9.2],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const weather = await getWeather(mockWeatherData.city);
    const requestUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));

    expect(requestUrl.searchParams.get('current')).toContain('temperature_2m');
    expect(requestUrl.searchParams.get('daily')).toContain('temperature_2m_min');
    expect(requestUrl.searchParams.get('timezone')).toBe('America/Sao_Paulo');
    expect(weather.city).toEqual(mockWeatherData.city);
    expect(weather.current.temperatureC).toBe(23.8);
    expect(weather.current.pressureHpa).toBe(1013.2);
    expect(weather.forecast).toHaveLength(5);
    expect(weather.forecast[2]).toEqual({
      date: '2026-10-31',
      weatherCode: 61,
      minimumTemperatureC: 19.1,
      maximumTemperatureC: 24.8,
      precipitationProbabilityPercent: 75,
      maximumWindSpeedKmh: 17.6,
    });
  });

  it('lança WeatherServiceError quando current ou daily estão ausentes', async () => {
    const incompleteResponses = [
      { daily: { time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'] } },
      { current: { temperature_2m: 20 } },
    ];

    for (const payload of incompleteResponses) {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }));
      vi.stubGlobal('fetch', fetchMock);

      await expect(getWeather(mockWeatherData.city)).rejects.toBeInstanceOf(WeatherServiceError);
    }
  });
});
