'use client';
import { useState, useEffect } from 'react';
import { getSupabase } from '../../../lib/supabase';

export default function PerfilesPage() {
  const [conserjes, setConserjes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState({ nombre: '', email: '', telefono: '' });
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState('');
  const [eid, setEid]             = useState(null);

  useEffect(() => {
    async function cargar() {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: perfil }   = await supabase.from('perfiles').select('edificio_id').eq('id', user.id).single();
      setEid(perfil.edificio_id);
      const { data } = await supabase.from('perfiles')
        .select('id,nombre,email,telefono,activo,created_at')
        .eq('edificio_id', perfil.edificio_id)
        .eq('rol', 'conserje')
        .order('nombre');
      setConserjes(data ?? []);
      setLoading(false);
    }
    cargar();
  }, []);

  async function toggleActivo(id, activo) {
    const supabase = getSupabase();
    await supabase.from('perfiles').update({ activo: !activo }).eq('id', id);
    setConserjes(prev => prev.map(c => c.id === id ? { ...c, activo: !activo } : c));
  }

  async function crearConserje(e) {
    e.preventDefault();
    setError('');
    setGuardando(true);
    const supabase = getSupabase();
    const tempPass = Math.random().toString(36).slice(-8) + 'P1!';
    const { data: authData, error: authErr } = await supabase.auth.signUp({ email: form.email, password: tempPass });
    if (authErr) { setError(authErr.message); setGuardando(false); return; }
    await supabase.from('perfiles').insert({
      id:          authData.user.id,
      edificio_id: eid,
      nombre:      form.nombre,
      email:       form.email,
      telefono:    form.telefono || null,
      rol:         'conserje',
      activo:      true,
    });
    setModal(false);
    setForm({ nombre: '', email: '', telefono: '' });
    setGuardando(false);
    const { data: refreshed } = await supabase.from('perfiles').select('id,nombre,email,telefono,activo,created_at').eq('edificio_id', eid).eq('rol', 'conserje').order('nombre');
    setConserjes(refreshed ?? []);
  }

  const inputSt = { width: '100%', height: 44, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none' };
  const iniciales = (nombre) => nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900, margin: '0 auto', width: '100%' }} className="fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Conserjes</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Gestión de cuentas del personal</p>
        </div>
        <button onClick={() => setModal(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 18px',
          background: 'var(--brand)', border: 'none', borderRadius: 10,
          color: 'var(--brand-text-on)', fontSize: 14, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>person_add</span>
          Agregar conserje
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {conserjes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: 14 }}>No hay conserjes registrados</div>
          )}
          {conserjes.map(c => (
            <div key={c.id} style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12,
              padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16,
              opacity: c.activo ? 1 : 0.55,
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                background: c.activo ? 'rgba(var(--brand-rgb),0.1)' : 'var(--bg-surface-high)',
                border: `1px solid ${c.activo ? 'rgba(var(--brand-rgb),0.2)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: c.activo ? 'var(--brand)' : 'var(--text-muted)',
              }}>{iniciales(c.nombre)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{c.nombre}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.email}</p>
                {c.telefono && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{c.telefono}</p>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: c.activo ? 'var(--success)' : 'var(--text-muted)',
                  background: c.activo ? 'rgba(47,191,113,0.1)' : 'var(--bg-surface-high)',
                  padding: '3px 10px', borderRadius: 20,
                }}>
                  {c.activo ? 'Activo' : 'Inactivo'}
                </span>
                <button onClick={() => toggleActivo(c.id, c.activo)} style={{
                  fontSize: 12, padding: '5px 12px', borderRadius: 7,
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  {c.activo ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px', width: '100%', maxWidth: 420 }} className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Nuevo conserje</h2>
              <button onClick={() => { setModal(false); setError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'Material Symbols Outlined', fontSize: 22 }}>close</button>
            </div>
            <form onSubmit={crearConserje} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Nombre completo *</label>
                <input style={inputSt} placeholder="Ej: Juan Pérez" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Email *</label>
                <input type="email" style={inputSt} placeholder="conserje@email.cl" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Teléfono</label>
                <input style={inputSt} placeholder="+56 9 1234 5678" value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-input)', borderRadius: 8, padding: '10px 12px', lineHeight: 1.5 }}>
                Se enviará un email de confirmación al conserje para que active su cuenta y establezca su contraseña.
              </p>
              {error && <p style={{ fontSize: 13, color: 'var(--error)', background: 'rgba(229,72,77,0.1)', padding: '10px 12px', borderRadius: 8 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => { setModal(false); setError(''); }} style={{ flex: 1, height: 44, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                <button type="submit" disabled={guardando} style={{ flex: 1, height: 44, background: 'var(--brand)', border: 'none', borderRadius: 10, color: 'var(--brand-text-on)', fontSize: 14, fontWeight: 700, cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.7 : 1, fontFamily: 'inherit' }}>
                  {guardando ? 'Creando…' : 'Crear cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
