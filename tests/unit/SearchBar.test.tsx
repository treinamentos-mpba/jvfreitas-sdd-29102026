import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

describe('SearchBar', () => {
  it('expõe formulário de busca e input com label acessível', () => {
    render(<SearchBar onSearch={vi.fn()} />);

    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Buscar cidade' })).toBeInTheDocument();
  });

  it('não envia consulta vazia ou composta somente por espaços', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn<(city: string) => void>();

    render(<SearchBar onSearch={onSearch} />);

    const form = screen.getByRole('search');
    const input = screen.getByRole('searchbox', { name: 'Buscar cidade' });

    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    fireEvent.submit(form);
    await user.type(input, '   ');
    fireEvent.submit(form);

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('envia a cidade sem espaços externos', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn<(city: string) => void>();

    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), '  Curitiba  ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledOnce();
    expect(onSearch).toHaveBeenCalledWith('Curitiba');
  });

  it('desabilita input e busca quando disabled é true', () => {
    const onSearch = vi.fn<(city: string) => void>();

    render(<SearchBar onSearch={onSearch} disabled />);

    expect(screen.getByRole('searchbox', { name: 'Buscar cidade' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    fireEvent.submit(screen.getByRole('search'));

    expect(onSearch).not.toHaveBeenCalled();
  });
});
