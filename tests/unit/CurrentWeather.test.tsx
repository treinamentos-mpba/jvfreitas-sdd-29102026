import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import UnitToggle from '../../src/components/UnitToggle';
import { mockWeatherData } from '../../src/mocks/weatherData';
import type { Unit } from '../../src/types/weather';

function TemperatureUnitHarness() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const current = { ...mockWeatherData.current, temperatureC: 0, apparentTemperatureC: 0 };

  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather city={mockWeatherData.city} current={current} unit={unit} />
    </>
  );
}

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

  it('atualiza a temperatura de 0 °C para 32 °F ao usar o UnitToggle', async () => {
    const user = userEvent.setup();
    render(<TemperatureUnitHarness />);

    expect(screen.getAllByText('0,0 °C')).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getAllByText('32,0 °F')).toHaveLength(2);
  });
});
