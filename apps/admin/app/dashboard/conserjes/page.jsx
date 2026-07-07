'use client';
import { useState, useEffect } from 'react';
import { getSupabase } from '../../../lib/supabase';
import { invitarConserjeAction } from './actions';
import { usePerfil } from '../../../lib/perfil-context';

export default function ConserjesPage() {
  const perfil = usePerfil();
  const eid = perfil.edificio_id;
  const [conserjes, setConserjes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState({ nombre: '', email: '' });
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function cargar() {
      const supabase = getSupabase();
      const { data } = await supabase.from('perfiles')
        .select('id,nombre,email,activo,created_at')
        .eq('edificio_id', eid)
        .eq('rol', 'conserje')
        .order('nombre');
      setConserjes(data ?? []);
      setLoading(false);
    }
    cargar();
  }, [eid]);

  async function toggleActivo(id, activo) {
    const supabase = getSupabase();
    const { error } = await supabase.from('perfiles').update({ activo: !activo }).eq('id', id);
    if (!error) {
      setConserjes(prev => prev.map(c => c.id === id ? { ...c, activo: !activo } : c));
    }
  }

  async function renombrar(id, nombreActual) {
    const nuevo = window.prompt('Nuevo nombre:', nombreActual);
    if (!nuevo || nuevo === nombreActual) return;
    const supabase = getSupabase();
    const { error } = await supabase.from('perfiles').update({ nombre: nuevo }).eq('id', id);
    if (!error) {
      setConserjes(prev => prev.map(c => c.id === id ? { ...c, nombre: nuevo } : c));
    }
  }

  async function enviarInvitacion(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setGuardando(true);

    const res = await invitarConserjeAction(form.email, form.nombre, eid);
    if (res.error) {
      setError(res.error);
      setGuardando(false);
      return;
    }

    setSuccessMsg('Invitación enviada con éxito por email.');
    setModal(false);
    setForm({ nombre: '', email: '' });
    setGuardando(false);

    // Refresh list
    const supabase = getSupabase();
    const { data: refreshed } = await supabase.from('perfiles')
      .select('id,nombre,email,activo,created_at')
      .eq('edificio_id', eid)
      .eq('rol', 'conserje')
      .order('nombre');
    setConserjes(refreshed ?? []);
  }

  const inputSt = { 
    width: '100%', 
    height: 44, 
    background: 'var(--bg-input)', 
    border: '1px solid var(--border)', 
    borderRadius: 'var(--radius)', 
    padding: '0 12px', 
    color: 'var(--text)', 
    fontSize: 14, 
    fontFamily: 'inherit', 
    outline: 'none' 
  };

  const tableHeaderCellSt = {
    padding: '12px 16px',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    borderBottom: '2px solid var(--border)'
  };

  const tableBodyCellSt = {
    padding: '16px',
    fontSize: 14,
    color: 'var(--text-body)',
    borderBottom: '1px solid var(--border)',
    verticalAlign: 'middle'
  };

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1000, margin: '0 auto', width: '100%' }} className="fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Conserjes</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Gestión de cuentas y personal del edificio</p>
        </div>
        <button onClick={() => setModal(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 18px',
          background: 'var(--brand)', border: 'none', borderRadius: 'var(--radius)',
          color: 'var(--brand-text-on)', fontSize: 14, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>person_add</span>
          Invitar conserje
        </button>
      </div>

      {successMsg && (
        <div style={{
          background: 'var(--ok-bg)', border: '1px solid var(--ok-border)', borderRadius: 'var(--radius)',
          padding: '12px 16px', color: 'var(--ok-tx)', fontSize: 14, fontWeight: 600, marginBottom: 20
        }}>
          {successMsg}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
          {conserjes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: 14 }}>No hay conserjes registrados</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={tableHeaderCellSt}>Nombre</th>
                  <th style={tableHeaderCellSt}>Email</th>
                  <th style={tableHeaderCellSt}>Fecha Alta</th>
                  <th style={tableHeaderCellSt}>Estado</th>
                  <th style={{ ...tableHeaderCellSt, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {conserjes.map(c => (
                  <tr key={c.id} style={{ opacity: c.activo ? 1 : 0.6 }}>
                    <td style={{ ...tableBodyCellSt, fontWeight: 600 }}>{c.nombre}</td>
                    <td style={tableBodyCellSt}>{c.email}</td>
                    <td style={tableBodyCellSt}>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                    </td>
                    <td style={tableBodyCellSt}>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: c.activo ? 'var(--ok-tx)' : 'var(--text-muted)',
                        background: c.activo ? 'var(--ok-bg)' : 'var(--bg-surface-high)',
                        border: `1px solid ${c.activo ? 'var(--ok-border)' : 'var(--border)'}`,
                        padding: '2px 8px', borderRadius: 20,
                        textTransform: 'uppercase', letterSpacing: '0.04em'
                      }}>
                        {c.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ ...tableBodyCellSt, textAlign: 'right' }}>
                      <button onClick={() => renombrar(c.id, c.nombre)} style={{
                        fontSize: 12, padding: '5px 12px', borderRadius: 6, marginRight: 8,
                        background: 'transparent', border: '1px solid var(--border)',
                        color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 120ms'
                      }}>
                        Renombrar
                      </button>
                      <button onClick={() => toggleActivo(c.id, c.activo)} style={{
                        fontSize: 12, padding: '5px 12px', borderRadius: 6,
                        background: 'transparent', border: '1px solid var(--border)',
                        color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 120ms'
                      }}>
                        {c.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px', width: '100%', maxWidth: 420 }} className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Invitar conserje</h2>
              <button onClick={() => { setModal(false); setError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'Material Symbols Outlined', fontSize: 22 }}>close</button>
            </div>
            <form onSubmit={enviarInvitacion} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Nombre completo *</label>
                <input style={inputSt} placeholder="Ej: Juan Pérez" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Email *</label>
                <input type="email" style={inputSt} placeholder="conserje@email.cl" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-surface-high)', borderRadius: 8, padding: '10px 12px', lineHeight: 1.5 }}>
                Se enviará un email al conserje con un enlace de acceso seguro. No requiere definir una contraseña manualmente en este paso.
              </p>
              {error && <p style={{ fontSize: 13, color: 'var(--error)', background: 'var(--crit-bg)', border: '1px solid var(--crit-border)', padding: '10px 12px', borderRadius: 8 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => { setModal(false); setError(''); }} style={{ flex: 1, height: 44, background: 'var(--bg-surface-high)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                <button type="submit" disabled={guardando} style={{ flex: 1, height: 44, background: 'var(--brand)', border: 'none', borderRadius: 10, color: 'var(--brand-text-on)', fontSize: 14, fontWeight: 700, cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.7 : 1, fontFamily: 'inherit' }}>
                  {guardando ? 'Enviando…' : 'Enviar invitación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
