import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { mockWeatherData } from '../../src/mocks/weatherData';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';

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
