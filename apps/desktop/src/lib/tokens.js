// Portia Design Tokens — Warm White + Deep Navy
// Hardcoded values for JS usage; CSS custom properties defined in index.css

export const bg = {
  base: '#FAFAF8',
  section: '#F3F0E9',
  surface: '#FFFFFF',
  surfaceHigh: '#F3F0E9',
  elevated: '#FFFFFF',
  input: '#FFFFFF',
};

export const border = {
  default: 'rgba(25,24,26,0.13)',
  strong: 'rgba(25,24,26,0.2)',
};

export const text = {
  primary: '#19181A',
  secondary: '#6A6762',
  muted: '#B4B0A9',
  subtle: '#D4D2CE',
};

// Marca: navy profundo — solo logo, foco y CTAs primarios.
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

// Tipos de novedad → estado semántico
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
