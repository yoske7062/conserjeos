'use client';
import { createContext, useContext } from 'react';

// El layout ya resuelve sesión + perfil una sola vez — las páginas lo leen
// de acá en vez de repetir getUser()+perfiles en cada una (eran 2 round
// trips redundantes por página, en las 7 páginas del dashboard).
export const PerfilContext = createContext(null);

export function usePerfil() {
  const perfil = useContext(PerfilContext);
  if (!perfil) throw new Error('usePerfil() debe usarse dentro de PerfilContext.Provider');
  return perfil;
}
