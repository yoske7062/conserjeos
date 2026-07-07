'use client';
import { useEffect, useRef } from 'react';
import { getSupabase } from './supabase';

// Debounce: una ráfaga de cambios (ej. sync offline del desktop) dispara un
// solo refetch después de que la ráfaga se calma, en vez de uno por evento.
// onChange se guarda en un ref para no tener que memoizarlo en el caller ni
// resuscribir el canal en cada render.
export function useRealtimeRefetch(table, edificioId, onChange, debounceMs = 400) {
  const debounceRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!edificioId) return;
    const supabase = getSupabase();
    // React StrictMode monta el efecto dos veces en dev — sin esto, la
    // segunda pasada reutiliza el canal ya suscrito y explota al llamar
    // .on() sobre algo que ya hizo .subscribe().
    const nombreCanal = `${table}-${edificioId}`;
    const previo = supabase.getChannels().find(c => c.topic === `realtime:${nombreCanal}`);
    if (previo) supabase.removeChannel(previo);

    const channel = supabase
      .channel(nombreCanal)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `edificio_id=eq.${edificioId}` },
        () => {
          clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => onChangeRef.current(), debounceMs);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [table, edificioId, debounceMs]);
}
