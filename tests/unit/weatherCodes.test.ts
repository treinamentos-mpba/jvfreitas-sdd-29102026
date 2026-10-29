import { describe, expect, it } from 'vitest';
import { getWeatherPresentation } from '../../src/lib/weatherCodes';

describe('getWeatherPresentation', () => {
  it('mapeia código conhecido para condição e ícone', () => {
    expect(getWeatherPresentation(1)).toEqual({
      label: 'Predominantemente ensolarado',
      icon: '🌤️',
    });
  });

  it('usa fallback para código desconhecido ou ausente', () => {
    expect(getWeatherPresentation(999).label).toBe('Condição indisponível');
    expect(getWeatherPresentation(null).label).toBe('Condição indisponível');
  });
});
