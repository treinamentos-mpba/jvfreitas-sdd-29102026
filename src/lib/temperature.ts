import type { Unit } from '../types/weather';

export function convertTemperature(temperatureC: number, unit: Unit): number {
  return unit === 'fahrenheit' ? (temperatureC * 9) / 5 + 32 : temperatureC;
}

export function unitLabel(unit: Unit): string {
  return unit === 'celsius' ? '°C' : '°F';
}

export function formatTemperature(temperatureC: number | null, unit: Unit): string {
  if (temperatureC === null || !Number.isFinite(temperatureC)) {
    return 'Indisponível';
  }

  const temperature = convertTemperature(temperatureC, unit);
  const roundedTemperature =
    (Math.sign(temperature) * Math.round((Math.abs(temperature) + Number.EPSILON) * 10)) / 10;
  const formattedTemperature = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(roundedTemperature);
  return `${formattedTemperature} ${unitLabel(unit)}`;
}
