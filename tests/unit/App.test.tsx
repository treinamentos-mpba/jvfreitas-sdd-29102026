import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { mockWeatherData } from '../../src/mocks/weatherData';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  getWeather: vi.fn(),
  searchCities: vi.fn(),
  WeatherServiceError: class WeatherServiceError extends Error {
    status: number | null;

    constructor(message: string, status: number | null) {
      super(message);
      this.name = 'WeatherServiceError';
      this.status = status;
    }
  },
}));

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('oferece skip link por teclado para o conteúdo principal', async () => {
    const user = userEvent.setup();
    render(<App />);

    const skipLink = screen.getByRole('link', { name: 'Pular para o conteúdo' });
    expect(skipLink).toHaveAttribute('href', '#main-content');
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');

    await user.tab();
    expect(skipLink).toHaveFocus();
  });

  it('começa no estado idle e busca o mock da cidade', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    render(<App />);

    expect(screen.getByText('Busque uma cidade para consultar o clima.')).toBeInTheDocument();

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Campinas');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('heading', { name: 'Campinas' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Previsão dos próximos dias' })).toBeInTheDocument();
  });

  it('sinaliza loading com aria-busy e foca o resultado após a busca', async () => {
    const user = userEvent.setup();
    let resolveCities: ((cities: City[]) => void) | undefined;
    vi.mocked(searchCities).mockReturnValue(
      new Promise((resolve) => {
        resolveCities = resolve;
      }),
    );
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    render(<App />);

    const main = screen.getByRole('main');
    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Campinas');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(main).toHaveAttribute('aria-busy', 'true');
    resolveCities?.([mockWeatherData.city]);

    const resultHeading = await screen.findByRole('heading', { name: 'Campinas' });
    expect(main).toHaveAttribute('aria-busy', 'false');
    expect(resultHeading).toHaveFocus();
  });

  it('mostra estado vazio sem resultados e converte usando a unidade selecionada', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValueOnce([]).mockResolvedValueOnce([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Curitiba');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(
      await screen.findByRole('heading', { name: 'Nenhuma cidade encontrada' }),
    ).toBeInTheDocument();

    await user.clear(screen.getByRole('searchbox', { name: 'Buscar cidade' }));
    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Campinas');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByText('74,8 °F')).toBeInTheDocument();
  });

  it('não consulta geocodificação quando a busca está vazia ou só tem espaços', async () => {
    const user = userEvent.setup();
    render(<App />);

    const form = screen.getByRole('search');
    const input = screen.getByRole('searchbox', { name: 'Buscar cidade' });

    fireEvent.submit(form);
    await user.type(input, '   ');
    fireEvent.submit(form);

    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
    expect(screen.getByText('Busque uma cidade para consultar o clima.')).toBeInTheDocument();
  });

  it('envia caracteres especiais como texto literal, sem interpretá-los como marcação', async () => {
    const user = userEvent.setup();
    const query = '<script>alert("Münchén & Co")</script>';
    vi.mocked(searchCities).mockResolvedValue([]);
    render(<App />);

    const input = screen.getByRole('searchbox', { name: 'Buscar cidade' });
    await user.type(input, query);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(
      await screen.findByRole('heading', { name: 'Nenhuma cidade encontrada' }),
    ).toBeInTheDocument();
    expect(searchCities).toHaveBeenCalledWith(query);
    expect(getWeather).not.toHaveBeenCalled();
    // a consulta aparece como texto literal na dica, sem virar nó de script
    expect(screen.getByText((content) => content.includes(query))).toBeInTheDocument();
    expect(document.querySelector('main script')).toBeNull();
    expect(input).toBeEnabled();
    expect(input).toHaveValue(query);
  });

  it('não consulta o clima quando o geocoding retorna zero resultados e mantém a busca editável', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([]);
    render(<App />);

    const input = screen.getByRole('searchbox', { name: 'Buscar cidade' });
    await user.type(input, 'Atlântida');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(
      await screen.findByRole('heading', { name: 'Nenhuma cidade encontrada' }),
    ).toBeInTheDocument();
    expect(getWeather).not.toHaveBeenCalled();
    expect(input).toBeEnabled();
    expect(input).toHaveValue('Atlântida');

    await user.type(input, ' do Sul');
    expect(input).toHaveValue('Atlântida do Sul');
  });

  it('mantém os dados válidos e marca como Indisponível os campos ausentes do forecast incompleto', async () => {
    const user = userEvent.setup();
    const partialWeather = {
      ...mockWeatherData,
      current: {
        ...mockWeatherData.current,
        apparentTemperatureC: null,
        relativeHumidityPercent: null,
        windSpeedKmh: null,
      },
      forecast: [
        {
          ...mockWeatherData.forecast[0],
          minimumTemperatureC: null,
          maximumTemperatureC: null,
          precipitationProbabilityPercent: null,
        },
        ...mockWeatherData.forecast.slice(1),
      ],
    };
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue(partialWeather);
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Campinas');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('heading', { name: 'Campinas' })).toBeInTheDocument();
    // dados válidos preservados: temperatura atual e máxima do segundo dia
    expect(screen.getByText('23,8 °C')).toBeInTheDocument();
    expect(screen.getByText('26,3 °C')).toBeInTheDocument();
    // 3 métricas atuais + 3 campos do primeiro dia ausentes, sem valores estimados
    expect(screen.getAllByText('Indisponível')).toHaveLength(6);
  });

  it('mostra erro e retry repete a busca que falhou', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather)
      .mockRejectedValueOnce(new WeatherServiceError('Falha de rede.', null))
      .mockResolvedValueOnce(mockWeatherData);
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Campinas');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede.');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('heading', { name: 'Campinas' })).toBeInTheDocument();
    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(getWeather).toHaveBeenCalledTimes(2);
  });
});
