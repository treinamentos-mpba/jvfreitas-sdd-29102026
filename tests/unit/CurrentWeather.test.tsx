import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import { mockWeatherData } from '../../src/mocks/weatherData';

describe('CurrentWeather', () => {
  it('exibe cidade, condição e métricas atuais', () => {
    render(
      <CurrentWeather
        city={mockWeatherData.city}
        current={mockWeatherData.current}
        unit="celsius"
      />,
    );

    expect(screen.getByRole('heading', { name: 'Campinas' })).toBeInTheDocument();
    expect(screen.getByText('Predominantemente ensolarado')).toBeInTheDocument();
    expect(screen.getByText('23,8 °C')).toBeInTheDocument();
    expect(screen.getByText('Umidade')).toBeInTheDocument();
    expect(screen.getByText('57 %')).toBeInTheDocument();
    expect(screen.getByText('9,4 km/h')).toBeInTheDocument();
    expect(screen.getByText('0,2 mm')).toBeInTheDocument();
    expect(screen.getByText('1.013,2 hPa')).toBeInTheDocument();
  });

  it('formata temperatura na unidade recebida e mostra métricas ausentes', () => {
    const current = {
      ...mockWeatherData.current,
      precipitationMm: null,
      pressureHpa: null,
    };

    render(<CurrentWeather city={mockWeatherData.city} current={current} unit="fahrenheit" />);

    expect(screen.getByText('74,8 °F')).toBeInTheDocument();
    expect(screen.getAllByText('Indisponível')).toHaveLength(2);
  });
});

