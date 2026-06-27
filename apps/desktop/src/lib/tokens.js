// Paleta de Portia — marca separada de estado (nunca el mismo verde para todo)
export const bg = {
  base: '#0B0B0B',
  surface: '#161616',
  surfaceHigh: '#1F1F1F',
  elevated: '#1F2225',
  input: '#0D0D0D',
};

export const border = {
  default: '#2E2E2E',
  strong: '#3D3D3D',
};

export const text = {
  primary: '#F5F5F5',
  secondary: '#A8A8A8',
  muted: '#636363',
  subtle: '#4E4E4E',
};

// Marca: solo logo, foco y CTAs primarios. Nunca representa "éxito" ni "todo bien".
export const brand = {
  color: 'var(--brand)',
  bg: 'var(--info-bg)',
  border: 'var(--info-border)',
};

// Estados semánticos: cada uno con su propio color + icono. Nunca solo color.
export const state = {
  success:   { color: 'var(--ok-tx)', bg: 'var(--ok-bg)',  border: 'var(--ok-border)',  icon: '✓' },
  info:      { color: 'var(--info-tx)', bg: 'var(--info-bg)',  border: 'var(--info-border)',  icon: 'ℹ' },
  warning:   { color: 'var(--warn-tx)', bg: 'var(--warn-bg)',  border: 'var(--warn-border)',  icon: '▲' },
  incident:  { color: 'var(--warn-tx)', bg: 'var(--warn-bg)',  border: 'var(--warn-border)',  icon: '!' },
  emergency: { color: 'var(--crit-tx)', bg: 'var(--crit-bg)',   border: 'var(--crit-border)',   icon: '◆' },
};

// Tipos de novedad → estado semántico (ver §10.2 research: emergencia nunca es verde)
export const TIPO_NOVEDAD = {
  urgente:     { ...state.emergency, label: 'Urgente' },
  incidente:   { ...state.incident,  label: 'Incidente' },
  informativo: { ...state.info,      label: 'Informativo' },
};

// Piso de accesibilidad — no son sugerencias
export const a11y = {
  minButtonHeight: 44,
  minInputHeight: 44,
  minFontSize: 16,
  minControlGap: 8,
};
