import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

describe('convertTemperature', () => {
  it('converte os casos de referência Celsius para Fahrenheit', () => {
    expect(convertTemperature(0, 'fahrenheit')).toBe(32);
    expect(convertTemperature(100, 'fahrenheit')).toBe(212);
    expect(convertTemperature(-40, 'fahrenheit')).toBe(-40);
  });

  it('preserva Celsius e converte Fahrenheit a partir do valor Celsius', () => {
    expect(convertTemperature(21.5, 'celsius')).toBe(21.5);
    expect(convertTemperature(21.5, 'fahrenheit')).toBe(70.7);
  });
});

describe('unitLabel', () => {
  it('retorna o símbolo da unidade selecionada', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});

describe('formatTemperature', () => {
  it('arredonda para uma casa decimal e inclui o símbolo da unidade', () => {
    expect(formatTemperature(21.26, 'celsius')).toBe('21,3 °C');
    expect(formatTemperature(23.8, 'fahrenheit')).toBe('74,8 °F');
  });

  it('retorna indisponível quando não há temperatura', () => {
    expect(formatTemperature(null, 'celsius')).toBe('Indisponível');
  });
});
