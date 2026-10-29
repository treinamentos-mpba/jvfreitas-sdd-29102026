import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ForecastList from '../../src/components/ForecastList';
import { mockWeatherData } from '../../src/mocks/weatherData';

describe('ForecastList', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renderiza cinco cards com rótulos, ícones, temperaturas e chuva', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-29T12:00:00-03:00'));

    render(
      <ForecastList
        forecast={mockWeatherData.forecast}
        unit="fahrenheit"
        timeZone={mockWeatherData.city.timeZone}
      />,
    );

    const list = screen.getByRole('list', { name: 'Previsão dos próximos dias' });
    const cards = within(list).getAllByRole('article');

    expect(cards).toHaveLength(5);
    expect(within(cards[0]).getByRole('heading', { name: 'Hoje' })).toBeInTheDocument();
    expect(within(cards[0]).getByText('Predominantemente ensolarado')).toBeInTheDocument();
    expect(within(cards[0]).getByText('80,8 °F')).toBeInTheDocument();
    expect(within(cards[0]).getByText('63,0 °F')).toBeInTheDocument();
    expect(within(cards[0]).getByText('10%')).toBeInTheDocument();
  });

  it('mostra o dia seguinte e valores indisponíveis para dados nulos', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-29T12:00:00-03:00'));
    const firstDay = {
      ...mockWeatherData.forecast[1],
      maximumTemperatureC: null,
      minimumTemperatureC: null,
      precipitationProbabilityPercent: null,
    };

    render(
      <ForecastList
        forecast={[firstDay]}
        unit="celsius"
        timeZone={mockWeatherData.city.timeZone}
      />,
    );

    const card = screen.getByRole('article', { name: 'Previsão para Amanhã' });
    expect(within(card).getAllByText('Indisponível')).toHaveLength(3);
  });
});
