import { formatDayLabel } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherPresentation } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
  timeZone: string;
}

const percentageFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

export default function ForecastCard({ day, unit, timeZone }: ForecastCardProps) {
  const dayLabel = formatDayLabel(day.date, timeZone);
  const condition = getWeatherPresentation(day.weatherCode);
  const precipitation =
    day.precipitationProbabilityPercent === null
      ? 'Indisponível'
      : `${percentageFormatter.format(day.precipitationProbabilityPercent)}%`;

  return (
    <article
      aria-label={`Previsão para ${dayLabel}`}
      className="h-full min-w-0 rounded-xl border border-white/10 bg-white/5 p-4 text-white shadow-glass backdrop-blur-md"
    >
      <h3 className="font-semibold">{dayLabel}</h3>
      <div className="mt-3 flex flex-col items-center text-center">
        <span className="text-4xl" aria-hidden="true">
          {condition.icon}
        </span>
        <p className="mt-2 min-h-10 text-sm text-slate-300">{condition.label}</p>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-slate-300">Máx.</dt>
          <dd className="font-semibold">{formatTemperature(day.maximumTemperatureC, unit)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-slate-300">Mín.</dt>
          <dd className="font-medium">{formatTemperature(day.minimumTemperatureC, unit)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-slate-300">Chuva</dt>
          <dd className="font-medium">{precipitation}</dd>
        </div>
      </dl>
    </article>
  );
}
