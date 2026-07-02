import { useEffect, useRef } from 'react';
import { supabase } from './supabase';

/**
 * Hook para manejar actualizaciones en tiempo real de Supabase (CDC)
 *
 * Los callbacks se pasan por ref (no por dependencia del efecto) porque en
 * cada call site se construyen inline como objeto literal — si entraran al
 * array de dependencias del useEffect, el canal se desuscribiría y
 * resuscribiría en cada render del componente, no solo cuando cambia la
 * tabla o el edificio.
 *
 * @param {string} tableName - Nombre de la tabla a escuchar (ej. 'novedades')
 * @param {string} edificioId - ID del edificio para filtrar los eventos
 * @param {Object} callbacks - Funciones a ejecutar cuando ocurre un evento
 * @param {function} callbacks.onInsert - callback(payload.new)
 * @param {function} callbacks.onUpdate - callback(payload.new)
 * @param {function} callbacks.onDelete - callback(payload.old)
 */
export function useRealtimeSync(tableName, edificioId, callbacks) {
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  useEffect(() => {
    if (!edificioId || !tableName) return;

    const channel = supabase.channel(`${tableName}-live-${edificioId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName, filter: `edificio_id=eq.${edificioId}` },
        (payload) => {
          const { onInsert, onUpdate, onDelete } = callbacksRef.current;
          if (payload.eventType === 'INSERT' && onInsert) {
            onInsert(payload.new);
          } else if (payload.eventType === 'UPDATE' && onUpdate) {
            onUpdate(payload.new);
          } else if (payload.eventType === 'DELETE' && onDelete) {
            onDelete(payload.old);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, edificioId]);
}
