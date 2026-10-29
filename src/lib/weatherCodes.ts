export interface WeatherPresentation {
  label: string;
  icon: string;
}

const weatherPresentations: Partial<Record<number, WeatherPresentation>> = {
  0: { label: 'Ensolarado', icon: '☀️' },
  1: { label: 'Predominantemente ensolarado', icon: '🌤️' },
  2: { label: 'Parcialmente nublado', icon: '⛅' },
  3: { label: 'Nublado', icon: '☁️' },
  45: { label: 'Neblina', icon: '🌫️' },
  48: { label: 'Neblina com geada', icon: '🌫️' },
  51: { label: 'Garoa leve', icon: '🌦️' },
  53: { label: 'Garoa moderada', icon: '🌦️' },
  55: { label: 'Garoa intensa', icon: '🌧️' },
  56: { label: 'Garoa congelante leve', icon: '🌧️' },
  57: { label: 'Garoa congelante intensa', icon: '🌧️' },
  61: { label: 'Chuva leve', icon: '🌧️' },
  63: { label: 'Chuva moderada', icon: '🌧️' },
  65: { label: 'Chuva intensa', icon: '🌧️' },
  66: { label: 'Chuva congelante leve', icon: '🌧️' },
  67: { label: 'Chuva congelante intensa', icon: '🌧️' },
  71: { label: 'Neve leve', icon: '🌨️' },
  73: { label: 'Neve moderada', icon: '🌨️' },
  75: { label: 'Neve intensa', icon: '❄️' },
  77: { label: 'Grãos de neve', icon: '❄️' },
  80: { label: 'Pancadas de chuva leves', icon: '🌦️' },
  81: { label: 'Pancadas de chuva moderadas', icon: '🌧️' },
  82: { label: 'Pancadas de chuva intensas', icon: '🌧️' },
  85: { label: 'Pancadas de neve leves', icon: '🌨️' },
  86: { label: 'Pancadas de neve intensas', icon: '❄️' },
  95: { label: 'Trovoada', icon: '⛈️' },
  96: { label: 'Trovoada com granizo leve', icon: '⛈️' },
  99: { label: 'Trovoada com granizo intenso', icon: '⛈️' },
};

export function getWeatherPresentation(weatherCode: number | null): WeatherPresentation {
  if (weatherCode === null) {
    return { label: 'Condição indisponível', icon: '？' };
  }

  return (
    weatherPresentations[weatherCode] ?? {
      label: 'Condição indisponível',
      icon: '？',
    }
  );
}
