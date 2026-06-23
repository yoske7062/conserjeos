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
// Dorado en vez de verde neón: la zona azul-verde es la más difícil de discriminar
// para ojos mayores por el amarilleamiento del cristalino.
export const brand = {
  color: '#C8932F',
  bg: 'rgba(200,147,47,0.08)',
  border: 'rgba(200,147,47,0.2)',
};

// Estados semánticos: cada uno con su propio color + icono. Nunca solo color.
export const state = {
  success:   { color: '#2FBF71', bg: 'rgba(47,191,113,0.12)',  border: 'rgba(47,191,113,0.3)',  icon: '✓' },
  info:      { color: '#3B9EFF', bg: 'rgba(59,158,255,0.12)',  border: 'rgba(59,158,255,0.3)',  icon: 'ℹ' },
  warning:   { color: '#F5A524', bg: 'rgba(245,165,36,0.12)',  border: 'rgba(245,165,36,0.3)',  icon: '▲' },
  incident:  { color: '#FF6B3D', bg: 'rgba(255,107,61,0.12)',  border: 'rgba(255,107,61,0.3)',  icon: '!' },
  emergency: { color: '#E5484D', bg: 'rgba(229,72,77,0.12)',   border: 'rgba(229,72,77,0.3)',   icon: '◆' },
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
