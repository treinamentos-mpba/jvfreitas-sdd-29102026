import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const MAX_RESULTS = 5;
const REQUEST_TIMEOUT_MS = 10_000;
const NETWORK_ERROR_MESSAGE =
  'Não foi possível conectar ao serviço de clima. Verifique sua conexão e tente novamente.';
const TIMEOUT_ERROR_MESSAGE =
  'A conexão excedeu o limite de 10 segundos. Verifique sua conexão e tente novamente.';
const CURRENT_FIELDS =
  'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,precipitation,pressure_msl';
const DAILY_FIELDS =
  'weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max,wind_speed_10m_max';

export class WeatherServiceError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null) {
    super(message);
    this.name = 'WeatherServiceError';
    this.status = status;
  }
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError'
  );
}

async function fetchWithTimeout<T>(
  url: string,
  init: RequestInit,
  onResponse: (response: Response) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutError = new Error(TIMEOUT_ERROR_MESSAGE);
  const timeout = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(timeoutError);
    }, REQUEST_TIMEOUT_MS);
  });

  try {
    const response = await Promise.race([
      fetch(url, { ...init, signal: controller.signal }),
      timeout,
    ]);
    return await Promise.race([onResponse(response), timeout]);
  } catch (error) {
    if (error instanceof WeatherServiceError) {
      throw error;
    }

    if (error === timeoutError || isAbortError(error)) {
      throw new WeatherServiceError(TIMEOUT_ERROR_MESSAGE, null);
    }

    throw new WeatherServiceError(NETWORK_ERROR_MESSAGE, null);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

async function parseJsonResponse(response: Response, message: string): Promise<unknown> {
  try {
    return await response.json();
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    throw new WeatherServiceError(message, response.status);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function optionalText(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function dailyNumber(daily: Record<string, unknown>, field: string, index: number): number | null {
  const values = daily[field];
  if (!Array.isArray(values)) {
    return null;
  }

  const value = values[index];
  if (field === 'precipitation_probability_max' && value === null) {
    return 0;
  }

  return finiteNumber(value);
}

function mapCity(value: unknown): City | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.name !== 'string' ||
    value.name.trim().length === 0 ||
    typeof value.latitude !== 'number' ||
    !Number.isFinite(value.latitude) ||
    typeof value.longitude !== 'number' ||
    !Number.isFinite(value.longitude) ||
    typeof value.timezone !== 'string' ||
    value.timezone.trim().length === 0
  ) {
    return null;
  }

  return {
    id: typeof value.id === 'number' && Number.isFinite(value.id) ? value.id : null,
    name: value.name,
    adminRegion: optionalText(value.admin1),
    country: optionalText(value.country),
    countryCode: optionalText(value.country_code),
    latitude: value.latitude,
    longitude: value.longitude,
    timeZone: value.timezone,
  };
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();
  if (!query) {
    return [];
  }

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=${MAX_RESULTS}&language=pt&format=json`;
  return fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, async (response) => {
    if (!response.ok) {
      throw new WeatherServiceError(
        'Não foi possível buscar cidades agora. Tente novamente.',
        response.status,
      );
    }

    const payload = await parseJsonResponse(
      response,
      'A busca retornou uma resposta inválida. Tente novamente.',
    );

    if (!isRecord(payload) || payload.results === undefined) {
      return [];
    }

    if (!Array.isArray(payload.results)) {
      throw new WeatherServiceError(
        'A busca retornou dados em formato inesperado. Tente novamente.',
        response.status,
      );
    }

    return payload.results
      .map(mapCity)
      .filter((city): city is City => city !== null)
      .slice(0, MAX_RESULTS);
  });
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: CURRENT_FIELDS,
    daily: DAILY_FIELDS,
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    pressure_unit: 'hPa',
    precipitation_unit: 'mm',
    timezone: city.timeZone,
    forecast_days: '5',
  });
  return fetchWithTimeout(
    `${FORECAST_URL}?${params.toString()}`,
    { headers: { Accept: 'application/json' } },
    async (response) => {
      if (!response.ok) {
        throw new WeatherServiceError(
          'Não foi possível carregar a previsão agora. Tente novamente.',
          response.status,
        );
      }

      const payload = await parseJsonResponse(
        response,
        'A previsão retornou uma resposta inválida. Tente novamente.',
      );

      if (!isRecord(payload) || !isRecord(payload.current) || !isRecord(payload.daily)) {
        throw new WeatherServiceError(
          'Os dados da previsão estão incompletos. Tente novamente.',
          response.status,
        );
      }

      const daily = payload.daily;
      const dates = daily.time;
      if (
        !Array.isArray(dates) ||
        dates.length < 5 ||
        dates.slice(0, 5).some((date) => typeof date !== 'string')
      ) {
        throw new WeatherServiceError(
          'A previsão não contém cinco datas válidas. Tente novamente.',
          response.status,
        );
      }

      const current = payload.current;
      const currentWeather: CurrentWeather = {
        temperatureC: finiteNumber(current.temperature_2m),
        apparentTemperatureC: finiteNumber(current.apparent_temperature),
        weatherCode: finiteNumber(current.weather_code),
        relativeHumidityPercent: finiteNumber(current.relative_humidity_2m),
        windSpeedKmh: finiteNumber(current.wind_speed_10m),
        precipitationMm: finiteNumber(current.precipitation),
        pressureHpa: finiteNumber(current.pressure_msl),
        observedAtLocal: optionalText(current.time),
      };

      const forecast: ForecastDay[] = dates.slice(0, 5).map((date, index) => ({
        date: date as string,
        weatherCode: dailyNumber(daily, 'weather_code', index),
        minimumTemperatureC: dailyNumber(daily, 'temperature_2m_min', index),
        maximumTemperatureC: dailyNumber(daily, 'temperature_2m_max', index),
        precipitationProbabilityPercent: dailyNumber(daily, 'precipitation_probability_max', index),
        maximumWindSpeedKmh: dailyNumber(daily, 'wind_speed_10m_max', index),
      }));

      return { city, current: currentWeather, forecast };
    },
  );
}
