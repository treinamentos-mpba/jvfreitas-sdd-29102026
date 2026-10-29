import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
  timeZone: string;
}

export default function ForecastList({ forecast, unit, timeZone }: ForecastListProps) {
  if (forecast.length === 0) {
    return <p className="text-sm text-slate-300">Previsão não disponível.</p>;
  }

  return (
    <ol
      aria-label="Previsão dos próximos dias"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
    >
      {forecast.map((day) => (
        <li key={day.date} className="min-w-0">
          <ForecastCard day={day} unit={unit} timeZone={timeZone} />
        </li>
      ))}
    </ol>
  );
}
