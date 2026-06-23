import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { state as estados } from '../lib/tokens';

const PROTOCOLOS = [
  { id: 'incendio',   label: 'Incendio',                          texto: 'Activa la alarma, evacúa por las escaleras (nunca el ascensor) y llama a Bomberos (132).' },
  { id: 'medica',     label: 'Emergencia médica',                 texto: 'Llama a Salud Responde / SAMU (131) y mantén despejado el acceso para la ambulancia.' },
  { id: 'ascensor',   label: 'Persona atrapada en ascensor',       texto: 'No intentes abrir el ascensor. Llama a la empresa mantenedora y tranquiliza a la persona por el citófono si existe.' },
  { id: 'intrusion',  label: 'Intrusión / seguridad',              texto: 'No te enfrentes a la persona. Llama a Carabineros (133) y avisa al administrador.' },
  { id: 'otra',       label: 'Otra emergencia',                   texto: 'Avisa a quien corresponda según la situación y documenta apenas puedas.' },
];

export default function EmergenciaButton({ perfil, turno }) {
  const [abierto, setAbierto] = useState(false);
  const [protocolo, setProtocolo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function dispararEmergencia(p) {
    setEnviando(true);
    setErrorMsg('');
    const { error } = await supabase.from('novedades').insert({
      edificio_id: perfil.edificio_id, conserje_id: perfil.id,
      turno_id: turno?.id ?? null, tipo: 'urgente',
      descripcion: `🆘 EMERGENCIA: ${p.label}`,
    });
    if (error) setErrorMsg('No se pudo avisar automáticamente. Llama de todos modos — el protocolo sigue siendo válido.');
    setProtocolo(p);
    setEnviando(false);
  }

  function cerrar() {
    setAbierto(false);
    setProtocolo(null);
    setErrorMsg('');
  }

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        title="Emergencia"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          height: 36, padding: '0 12px', flexShrink: 0,
          background: 'transparent', border: `1px solid ${estados.emergency.border}`,
          borderRadius: 8, color: estados.emergency.color, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          transition: 'background 120ms',
        }}
        onMouseEnter={e => e.currentTarget.style.background = estados.emergency.bg}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      ><span style={{ fontSize: 14 }}>{estados.emergency.icon}</span> Emergencia</button>

      {abierto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 24 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }}>
            {!protocolo ? (
              <>
                <div style={{ padding: '20px 22px 14px' }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>¿Qué está pasando?</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Toca una opción para avisar de inmediato. Después podrás agregar detalle.</p>
                </div>
                <div style={{ padding: '0 22px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {PROTOCOLOS.map(p => (
                    <button key={p.id} disabled={enviando} onClick={() => dispararEmergencia(p)} style={{
                      minHeight: 44, padding: '12px 16px', borderRadius: 8, textAlign: 'left',
                      background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text)',
                      fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    }}>{p.label}</button>
                  ))}
                  <button onClick={cerrar} style={{
                    minHeight: 44, marginTop: 4, background: 'transparent', border: 'none',
                    color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  }}>Cancelar</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ padding: '20px 22px 14px' }}>
                  <div style={{
                    width: 44, height: 44, background: estados.emergency.bg, border: `1px solid ${estados.emergency.border}`,
                    borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 12, fontSize: 20, color: estados.emergency.color,
                  }}>{estados.emergency.icon}</div>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{protocolo.label}</h2>
                  <p style={{ fontSize: 14, color: 'var(--text-body)', lineHeight: 1.6 }}>{protocolo.texto}</p>
                </div>
                {errorMsg && (
                  <div style={{ margin: '0 22px 14px', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(229,72,77,0.1)', borderLeft: '4px solid #E5484D', borderRadius: '0 8px 8px 0', padding: '10px 14px' }}>
                    <span style={{ fontSize: 13, color: '#FF8A8A' }}>{errorMsg}</span>
                  </div>
                )}
                {!errorMsg && (
                  <p style={{ margin: '0 22px 14px', fontSize: 13, color: '#2FBF71' }}>✓ Quedó registrado en Novedades como urgente.</p>
                )}
                <div style={{ padding: '0 22px 22px' }}>
                  <button onClick={cerrar} style={{
                    width: '100%', height: 44, background: 'var(--brand)', border: 'none', borderRadius: 8,
                    color: 'var(--brand-text-on)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  }}>Entendido</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
