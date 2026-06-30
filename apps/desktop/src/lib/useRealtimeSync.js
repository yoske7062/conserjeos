import { useEffect } from 'react';
import { supabase } from './supabase';

/**
 * Hook para manejar actualizaciones en tiempo real de Supabase (CDC)
 * 
 * @param {string} tableName - Nombre de la tabla a escuchar (ej. 'novedades')
 * @param {string} edificioId - ID del edificio para filtrar los eventos
 * @param {Object} callbacks - Funciones a ejecutar cuando ocurre un evento
 * @param {function} callbacks.onInsert - callback(payload.new)
 * @param {function} callbacks.onUpdate - callback(payload.new)
 * @param {function} callbacks.onDelete - callback(payload.old)
 */
export function useRealtimeSync(tableName, edificioId, { onInsert, onUpdate, onDelete }) {
  useEffect(() => {
    if (!edificioId || !tableName) return;

    const channel = supabase.channel(`${tableName}-live-${edificioId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName, filter: `edificio_id=eq.${edificioId}` },
        (payload) => {
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
  }, [tableName, edificioId, onInsert, onUpdate, onDelete]);
}
