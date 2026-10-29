import { useId } from 'react';
import { formatTemperature } from '../lib/temperature';
import { getWeatherPresentation } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

const numberFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

function formatMetric(value: number | null | undefined, unit: string): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 'Indisponível';
  }

  return `${numberFormatter.format(value)} ${unit}`;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const titleId = useId();
  const condition = getWeatherPresentation(current.weatherCode);
  const location = [city.adminRegion, city.country].filter(Boolean).join(', ');

  const metrics = [
    { label: 'Sensação térmica', value: formatTemperature(current.apparentTemperatureC, unit) },
    { label: 'Umidade', value: formatMetric(current.relativeHumidityPercent, '%') },
    { label: 'Vento', value: formatMetric(current.windSpeedKmh, 'km/h') },
    { label: 'Precipitação', value: formatMetric(current.precipitationMm, 'mm') },
    { label: 'Pressão', value: formatMetric(current.pressureHpa, 'hPa') },
  ];

  return (
    <section
      aria-labelledby={titleId}
      className="w-full rounded-2xl border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-md text-white sm:p-8"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id={titleId} className="text-xl font-semibold">
            {city.name}
          </h2>
          {location && <p className="mt-1 text-sm text-slate-300">{location}</p>}
        </div>
        <div className="text-right text-sm text-slate-300">
          <span className="text-4xl" aria-hidden="true">
            {condition.icon}
          </span>
          <p>{condition.label}</p>
        </div>
      </header>

      <div className="mt-6">
        <p className="text-5xl font-bold leading-tight sm:text-6xl">
          {formatTemperature(current.temperatureC, unit)}
        </p>
        <p className="mt-2 text-sm text-slate-300">
          {current.observedAtLocal
            ? `Atualizado às ${current.observedAtLocal}`
            : 'Horário da observação indisponível'}
        </p>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-lg border border-white/10 bg-night-800/70 p-4">
            <dt className="text-sm text-slate-300">{metric.label}</dt>
            <dd className="mt-1 font-semibold text-white">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}