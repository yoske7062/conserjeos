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
    const channel = supabase
      .channel(`${table}-${edificioId}`)
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
