import { describe, it, expect } from 'vitest';
import { parseApiError } from './error-messages';

describe('parseApiError', () => {
  it('mapea "Invalid email or password" a español', () => {
    const err = { error: { detail: 'Invalid email or password' } };
    expect(parseApiError(err, 'fallback')).toBe('Correo o contraseña incorrectos.');
  });

  it('mapea array de errores de validación a español', () => {
    const err = {
      error: {
        detail: [
          { type: 'string_too_short', loc: ['body', 'first_name'], msg: 'String should have at least 1 character', ctx: { min_length: 1 } },
        ],
      },
    };
    expect(parseApiError(err, 'fallback')).toContain('El nombre');
  });

  it('mapea error de email inválido', () => {
    const err = {
      error: {
        detail: [
          { type: 'value_error', loc: ['body', 'email'], msg: 'value is not a valid email', ctx: {} },
        ],
      },
    };
    expect(parseApiError(err, 'fallback')).toContain('El correo');
  });

  it('mapea error de fecha inválida', () => {
    const err = {
      error: {
        detail: [
          { type: 'date_from_datetime_parsing', loc: ['body', 'birth_date'], msg: 'Input should be a valid date', ctx: {} },
        ],
      },
    };
    expect(parseApiError(err, 'fallback')).toContain('La fecha de nacimiento');
  });

  it('usa fallback cuando no hay detail', () => {
    expect(parseApiError({}, 'Error genérico')).toBe('Error genérico');
  });

  it('retorna el detail string si no está en el mapa', () => {
    const err = { error: { detail: 'Unknown error from server' } };
    expect(parseApiError(err, 'fallback')).toBe('Unknown error from server');
  });

  it('mapea error de contraseña muy corta', () => {
    const err = {
      error: {
        detail: [
          { type: 'string_too_short', loc: ['body', 'password'], msg: 'String should have at least 8 characters', ctx: { min_length: 8 } },
        ],
      },
    };
    expect(parseApiError(err, 'fallback')).toContain('La contraseña');
  });
});
