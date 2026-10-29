export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: number | null; // Identificador GeoNames, quando disponível.
  name: string; // Nome da cidade.
  adminRegion: string | null; // Região administrativa retornada como admin1.
  country: string | null; // Nome do país.
  countryCode: string | null; // Código ISO do país.
  latitude: number; // Latitude usada nas consultas meteorológicas.
  longitude: number; // Longitude usada nas consultas meteorológicas.
  timeZone: string; // Fuso IANA usado para datas e horários locais.
}

export interface CurrentWeather {
  temperatureC: number | null; // Temperatura atual em Celsius.
  apparentTemperatureC: number | null; // Sensação térmica em Celsius.
  weatherCode: number | null; // Código WMO da condição atual.
  relativeHumidityPercent: number | null; // Umidade relativa em porcentagem.
  windSpeedKmh: number | null; // Velocidade atual do vento em km/h.
  precipitationMm?: number | null; // Precipitação atual em milímetros, quando disponível.
  pressureHpa?: number | null; // Pressão ao nível do mar em hPa, quando disponível.
  observedAtLocal: string | null; // Horário local da observação, associado ao fuso da cidade.
}

export interface ForecastDay {
  date: string; // Data local no formato YYYY-MM-DD.
  weatherCode: number | null; // Código WMO da condição prevista.
  minimumTemperatureC: number | null; // Temperatura mínima em Celsius.
  maximumTemperatureC: number | null; // Temperatura máxima em Celsius.
  precipitationProbabilityPercent: number | null; // Probabilidade máxima de precipitação em porcentagem.
  maximumWindSpeedKmh: number | null; // Velocidade máxima prevista do vento em km/h.
}

export interface WeatherData {
  city: City; // Cidade associada aos dados e ao fuso horário.
  current: CurrentWeather; // Dados meteorológicos atuais normalizados.
  forecast: ForecastDay[]; // Previsão diária, de hoje até os quatro dias seguintes.
}

export type RequestErrorKind = 'network' | 'api' | 'timeout' | 'invalid-response';

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'empty'; data: T }
  | { status: 'error'; kind: RequestErrorKind };
