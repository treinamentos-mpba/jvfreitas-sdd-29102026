import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import EmptyState from '../../src/components/states/EmptyState';
import ErrorState from '../../src/components/states/ErrorState';
import LoadingState from '../../src/components/states/LoadingState';

describe('LoadingState', () => {
  it('anuncia o carregamento com role status', () => {
    render(<LoadingState message="Buscando previsão" />);

    expect(screen.getByRole('status')).toHaveTextContent('Buscando previsão');
  });
});

describe('ErrorState', () => {
  it('mostra mensagem de erro e aciona retry', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Verifique sua conexão" onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Verifique sua conexão');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe('EmptyState', () => {
  it('mostra título e dica', () => {
    render(<EmptyState title="Nenhuma cidade encontrada" hint="Tente outro nome." />);

    expect(screen.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeInTheDocument();
    expect(screen.getByText('Tente outro nome.')).toBeInTheDocument();
  });
});
