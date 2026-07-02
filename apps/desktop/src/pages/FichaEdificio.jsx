import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { clasificarError } from '../lib/errores';

const INPUT_STYLE = {
  width: '100%', height: 44, background: 'var(--bg-input)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '0 12px', color: 'var(--text)', fontSize: 16,
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 120ms',
};

export default function FichaEdificio({ perfil }) {
  const [edificio, setEdificio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [contactos, setContactos] = useState([]);
  const [protocolos, setProtocolos] = useState([]);
  const [nuevoContacto, setNuevoContacto] = useState({ nombre: '', rol: '', telefono: '' });
  const [nuevoProtocolo, setNuevoProtocolo] = useState({ titulo: '', texto: '' });

  const esAdmin = perfil.rol === 'admin';

  const cargarEdificio = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('edificios').select('*').eq('id', perfil.edificio_id).single();
    setEdificio(data);
    setContactos(data?.contactos ?? []);
    setProtocolos(data?.protocolos ?? []);
    setLoading(false);
  }, [perfil.edificio_id]);

  useEffect(() => { cargarEdificio(); }, [cargarEdificio]);

  function agregarContacto() {
    if (!nuevoContacto.nombre.trim()) return;
    setContactos(prev => [...prev, { ...nuevoContacto, nombre: nuevoContacto.nombre.trim() }]);
    setNuevoContacto({ nombre: '', rol: '', telefono: '' });
  }

  function quitarContacto(i) {
    setContactos(prev => prev.filter((_, idx) => idx !== i));
  }

  function agregarProtocolo() {
    if (!nuevoProtocolo.titulo.trim() || !nuevoProtocolo.texto.trim()) return;
    setProtocolos(prev => [...prev, { titulo: nuevoProtocolo.titulo.trim(), texto: nuevoProtocolo.texto.trim() }]);
    setNuevoProtocolo({ titulo: '', texto: '' });
  }

  function quitarProtocolo(i) {
    setProtocolos(prev => prev.filter((_, idx) => idx !== i));
  }

  async function guardar() {
    setGuardando(true);
    setErrorMsg('');
    const { error } = await supabase.from('edificios')
      .update({ contactos, protocolos })
      .eq('id', perfil.edificio_id);
    if (error) setErrorMsg(`No se pudo guardar. ${clasificarError(error, 'ficha.guardar').mensaje}`);
    else { setEditando(false); cargarEdificio(); }
    setGuardando(false);
  }

  function cancelarEdicion() {
    setContactos(edificio?.contactos ?? []);
    setProtocolos(edificio?.protocolos ?? []);
    setEditando(false);
    setErrorMsg('');
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 720, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{edificio?.nombre ?? 'Edificio'}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {[edificio?.direccion, edificio?.comuna].filter(Boolean).join(', ') || 'Sin dirección registrada'}
          </p>
        </div>
        {esAdmin && !editando && (
          <button onClick={() => setEditando(true)} style={{
            height: 44, padding: '0 18px', background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}>Editar</button>
        )}
      </div>

      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 24 }}>
        A quién llamar y qué hacer en cada situación del edificio. Útil sobre todo si eres nuevo o estás reemplazando a otro conserje.
      </p>

      {errorMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--crit-bg)', borderLeft: '4px solid var(--crit-tx)',
          borderRadius: '0 8px 8px 0', padding: '12px 16px', marginBottom: 20,
        }}>
          <span style={{ fontSize: 14, color: 'var(--crit-tx)', fontWeight: 600 }}>{errorMsg}</span>
        </div>
      )}

      {/* Contactos importantes */}
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        A quién llamar
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-subtle)', marginBottom: 10 }}>Administrador, mantención, proveedores frecuentes…</p>

      {contactos.length === 0 && !editando && (
        <p style={{ fontSize: 13, color: 'var(--text-subtle)', marginBottom: 28 }}>Sin contactos registrados todavía.</p>
      )}

      {contactos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: editando ? 16 : 28 }}>
          {contactos.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px',
            }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{c.nombre}{c.rol ? ` — ${c.rol}` : ''}</p>
                {c.telefono && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.telefono}</p>}
              </div>
              {editando && (
                <button onClick={() => quitarContacto(i)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18, flexShrink: 0,
                }}>✕</button>
              )}
            </div>
          ))}
        </div>
      )}

      {editando && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          <input style={{ ...INPUT_STYLE, flex: 2, minWidth: 140 }} placeholder="Nombre" value={nuevoContacto.nombre}
            onChange={e => setNuevoContacto(c => ({ ...c, nombre: e.target.value }))} />
          <input style={{ ...INPUT_STYLE, flex: 1, minWidth: 120 }} placeholder="Rol (administrador, plomero…)" value={nuevoContacto.rol}
            onChange={e => setNuevoContacto(c => ({ ...c, rol: e.target.value }))} />
          <input style={{ ...INPUT_STYLE, flex: 1, minWidth: 120 }} placeholder="Teléfono" value={nuevoContacto.telefono}
            onChange={e => setNuevoContacto(c => ({ ...c, telefono: e.target.value }))} />
          <button onClick={agregarContacto} type="button" style={{
            height: 44, padding: '0 20px', background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--text)', fontSize: 14, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
          }}>Agregar</button>
        </div>
      )}

      {/* Protocolos individuales */}
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        Qué hacer en cada caso
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-subtle)', marginBottom: 10 }}>Protocolos propios de este edificio, uno por situación</p>

      {protocolos.length === 0 && !editando && (
        <p style={{ fontSize: 13, color: 'var(--text-subtle)', marginBottom: 28 }}>Sin protocolos registrados todavía.</p>
      )}

      {protocolos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: editando ? 16 : 28 }}>
          {protocolos.map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
              background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px',
            }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{p.titulo}</p>
                <p style={{ fontSize: 14, color: 'var(--text-body)', lineHeight: 1.5 }}>{p.texto}</p>
              </div>
              {editando && (
                <button onClick={() => quitarProtocolo(i)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18, flexShrink: 0,
                }}>✕</button>
              )}
            </div>
          ))}
        </div>
      )}

      {editando && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
          <input style={INPUT_STYLE} placeholder="Título (ej: Corte de agua, Portón no abre…)" value={nuevoProtocolo.titulo}
            onChange={e => setNuevoProtocolo(p => ({ ...p, titulo: e.target.value }))} />
          <div style={{ display: 'flex', gap: 8 }}>
            <textarea value={nuevoProtocolo.texto} onChange={e => setNuevoProtocolo(p => ({ ...p, texto: e.target.value }))}
              placeholder="Qué hacer paso a paso…"
              style={{ flex: 1, height: 70, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontSize: 16, resize: 'none', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
            />
            <button onClick={agregarProtocolo} type="button" style={{
              height: 44, padding: '0 20px', background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--text)', fontSize: 14, fontWeight: 600, cursor: 'pointer', flexShrink: 0, alignSelf: 'flex-start',
            }}>Agregar</button>
          </div>
        </div>
      )}

      {editando && (
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={cancelarEdicion} style={{
            flex: 1, height: 44, background: 'transparent', border: '1px solid var(--border)', borderRadius: 8,
            color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}>Cancelar</button>
          <button onClick={guardar} disabled={guardando} style={{
            flex: 1, height: 44, background: 'var(--brand)', border: 'none', borderRadius: 8,
            color: 'var(--brand-text-on)', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>{guardando ? '...' : 'Guardar'}</button>
        </div>
      )}
    </div>
  );
}
