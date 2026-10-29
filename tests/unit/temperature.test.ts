import { describe, expect, it } from 'vitest';
import { formatTemperature } from '../../src/lib/temperature';

describe('formatTemperature', () => {
  it('formata Celsius e Fahrenheit com uma casa decimal em pt-BR', () => {
    expect(formatTemperature(23.8, 'celsius')).toBe('23,8 °C');
    expect(formatTemperature(23.8, 'fahrenheit')).toBe('74,8 °F');
  });

  it('retorna indisponível quando não há temperatura', () => {
    expect(formatTemperature(null, 'celsius')).toBe('Indisponível');
  });
});
