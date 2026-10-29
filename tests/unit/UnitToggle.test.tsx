import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import UnitToggle from '../../src/components/UnitToggle';

describe('UnitToggle', () => {
  it('expõe o grupo e indica a unidade ativa com aria-pressed', () => {
    render(<UnitToggle unit="celsius" onChange={vi.fn()} />);

    expect(screen.getByRole('group', { name: 'Unidade de temperatura' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('aciona a unidade focada pelo teclado', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(unit: 'celsius' | 'fahrenheit') => void>();

    render(<UnitToggle unit="celsius" onChange={onChange} />);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith('fahrenheit');
  });
});
