const MSG_MAP: Record<string, string> = {
  'Invalid email or password': 'Correo o contraseña incorrectos.',
  'value is not a valid email address: An email address must have an @-sign.': 'Ingresa un correo electrónico válido.',
  'field required': 'Este campo es obligatorio.',
  "Email already registered": 'Este correo ya está registrado.',
};

const FIELD_MAP: Record<string, string> = {
  first_name: 'El nombre',
  last_name: 'El apellido',
  email: 'El correo',
  phone: 'El teléfono',
  country: 'El país',
  city: 'La ciudad',
  birth_date: 'La fecha de nacimiento',
  password: 'La contraseña',
  identification_number: 'El número de identificación',
};

function fieldLabel(loc: string[]): string {
  const field = loc[loc.length - 1];
  return FIELD_MAP[field] ?? field;
}

function translateMsg(e: any): string {
  if (e.type === 'string_too_short') {
    return `${fieldLabel(e.loc)} debe tener al menos ${e.ctx?.min_length} caracter(es).`;
  }
  if (e.type === 'value_error' || e.type === 'date_from_datetime_parsing') {
    return `${fieldLabel(e.loc)} no es válido.`;
  }
  return MSG_MAP[e.msg] ?? `${fieldLabel(e.loc)}: ${e.msg}`;
}

export function parseApiError(err: any, fallback: string): string {
  const detail = err?.error?.detail;

  if (Array.isArray(detail)) {
    return detail.map(translateMsg).join('\n');
  }

  if (typeof detail === 'string') {
    return MSG_MAP[detail] ?? detail;
  }

  return fallback;
}
