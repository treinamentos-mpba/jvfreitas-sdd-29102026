import type { Unit } from '../types/weather';

export function formatTemperature(temperatureC: number | null, unit: Unit): string {
  if (temperatureC === null || !Number.isFinite(temperatureC)) {
    return 'Indisponível';
  }

  const temperature = unit === 'fahrenheit' ? (temperatureC * 9) / 5 + 32 : temperatureC;
  const roundedTemperature =
    (Math.sign(temperature) * Math.round((Math.abs(temperature) + Number.EPSILON) * 10)) / 10;
  const formattedTemperature = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(roundedTemperature);
  const unitSymbol = unit === 'celsius' ? 'C' : 'F';

  return `${formattedTemperature} °${unitSymbol}`;
}
