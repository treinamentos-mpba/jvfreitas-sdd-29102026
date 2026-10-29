import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../../src/App';

describe('App', () => {
  it('começa no estado idle e busca o mock da cidade', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText('Busque uma cidade para consultar o clima.')).toBeInTheDocument();

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Campinas');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('heading', { name: 'Campinas' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Previsão dos próximos dias' })).toBeInTheDocument();
  });

  it('mostra estado vazio para cidade sem mock e converte usando a unidade selecionada', async () => {
    const user = userEvent.setup();
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
});
