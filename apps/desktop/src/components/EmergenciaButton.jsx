import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { enqueue } from '../lib/offlineQueue';

const PROTOCOLOS = [
  { id: 'incendio',   label: 'Incendio',                     texto: 'Activa la alarma, evacúa por las escaleras (nunca el ascensor) y llama a Bomberos (132).' },
  { id: 'medica',     label: 'Emergencia médica',            texto: 'Llama a Salud Responde / SAMU (131) y mantén despejado el acceso para la ambulancia.' },
  { id: 'ascensor',   label: 'Persona atrapada en ascensor', texto: 'No intentes abrir el ascensor. Llama a la empresa mantenedora y tranquiliza a la persona por el citófono si existe.' },
  { id: 'intrusion',  label: 'Intrusión / seguridad',        texto: 'No te enfrentes a la persona. Llama a Carabineros (133) y avisa al administrador.' },
  { id: 'otra',       label: 'Otra emergencia',              texto: 'Avisa a quien corresponda según la situación y documenta apenas puedas.' },
];

const INPUT = {
  width: '100%', borderRadius: 10, padding: '11px 14px',
  background: '#F6F6F4', border: '1.5px solid rgba(25,24,26,0.12)',
  color: '#19181A', fontSize: 14, fontFamily: 'inherit', fontWeight: 500,
  outline: 'none', resize: 'none', boxSizing: 'border-box',
  transition: 'border-color .15s',
};

export default function EmergenciaButton({ perfil, turno }) {
  const [abierto, setAbierto]       = useState(false);
  const [paso, setPaso]             = useState('select'); // 'select' | 'custom' | 'protocol'
  const [protocolo, setProtocolo]   = useState(null);
  const [customTipo, setCustomTipo] = useState('');
  const [detalles, setDetalles]     = useState('');
  const [enviando, setEnviando]     = useState(false);
  const [novId, setNovId]           = useState(null);
  const [errorMsg, setErrorMsg]     = useState('');

  async function disparar(p, custom) {
    setEnviando(true);
    setErrorMsg('');
    const label = custom || p.label;
    const payload = {
      edificio_id: perfil.edificio_id, conserje_id: perfil.id,
      turno_id: turno?.id ?? null, tipo: 'urgente',
      descripcion: `🆘 EMERGENCIA: ${label}`,
      created_at: new Date().toISOString(),
    };

    if (!navigator.onLine) {
      enqueue({ table: 'novedades', op: 'insert', payload });
      setProtocolo(p);
      setPaso('protocol');
      setEnviando(false);
      return;
    }

    const { data, error } = await supabase.from('novedades').insert(payload).select('id').single();
    if (error) setErrorMsg('No se pudo registrar automáticamente. El protocolo sigue siendo válido.');
    if (data) setNovId(data.id);
    setProtocolo(p);
    setPaso('protocol');
    setEnviando(false);
  }

  function seleccionar(p) {
    if (p.id === 'otra') { setProtocolo(p); setPaso('custom'); }
    else disparar(p, '');
  }

  async function confirmarDetalles() {
    if (detalles.trim() && novId) {
      const label = protocolo.id === 'otra' ? customTipo : protocolo.label;
      await supabase.from('novedades')
        .update({ descripcion: `🆘 EMERGENCIA: ${label} — ${detalles.trim()}` })
        .eq('id', novId);
    }
    cerrar();
  }

  function cerrar() {
    setAbierto(false); setPaso('select'); setProtocolo(null);
    setCustomTipo(''); setDetalles(''); setNovId(null); setErrorMsg('');
  }

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          height: 36, padding: '0 18px', flexShrink: 0,
          background: '#E6701E', border: 'none',
          borderRadius: 980, color: '#fff', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', transition: 'filter .12s',
          letterSpacing: '0.01em',
        }}
        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
        onMouseLeave={e => e.currentTarget.style.filter = 'none'}
      >
        Emergencia
      </button>

      {abierto && (
        <div
          onClick={e => { if (e.target === e.currentTarget) cerrar(); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000, padding: 24 }}
        >
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 420, boxShadow: '0 32px 80px rgba(0,0,0,0.4)', overflow: 'hidden' }}>

            {/* PASO 1 — elegir tipo */}
            {paso === 'select' && <>
              <div style={{ padding: '24px 24px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#C42B2B', marginBottom: 8 }}>Emergencia</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#19181A', marginBottom: 5, letterSpacing: '-0.3px' }}>¿Qué está pasando?</h2>
                <p style={{ fontSize: 14, color: '#6A6762', lineHeight: 1.5 }}>Toca una opción para avisar de inmediato. Después podrás agregar detalles.</p>
              </div>
              <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {PROTOCOLOS.map(p => (
                  <button key={p.id} disabled={enviando} onClick={() => seleccionar(p)} style={{
                    minHeight: 50, padding: '13px 18px', borderRadius: 12, textAlign: 'left',
                    background: '#FAFAF8', border: '1.5px solid rgba(25,24,26,0.1)',
                    color: '#19181A', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F0EEE8'}
                  onMouseLeave={e => e.currentTarget.style.background = '#FAFAF8'}
                  >
                    {p.label}
                    <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: '#B4B0A9' }}>chevron_right</span>
                  </button>
                ))}
                <button onClick={cerrar} style={{ minHeight: 40, marginTop: 4, background: 'transparent', border: 'none', color: '#B4B0A9', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                  Cancelar
                </button>
              </div>
            </>}

            {/* PASO 1.5 — describir "Otra emergencia" */}
            {paso === 'custom' && <>
              <div style={{ padding: '24px 24px 16px' }}>
                <button onClick={() => setPaso('select')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6A6762', fontSize: 13, fontFamily: 'inherit', fontWeight: 600, padding: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16 }}>arrow_back</span> Volver
                </button>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#19181A', marginBottom: 5, letterSpacing: '-0.3px' }}>¿Qué está ocurriendo?</h2>
                <p style={{ fontSize: 14, color: '#6A6762', lineHeight: 1.5 }}>Describe brevemente la emergencia para registrarla.</p>
              </div>
              <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  autoFocus type="text"
                  placeholder="Ej: Inundación en piso 3, cortocircuito, etc."
                  value={customTipo}
                  onChange={e => setCustomTipo(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && customTipo.trim()) disparar(protocolo, customTipo.trim()); }}
                  style={{ ...INPUT, height: 48 }}
                  onFocus={e => e.target.style.borderColor = '#C42B2B'}
                  onBlur={e => e.target.style.borderColor = 'rgba(25,24,26,0.12)'}
                />
                <button
                  disabled={!customTipo.trim() || enviando}
                  onClick={() => disparar(protocolo, customTipo.trim())}
                  style={{
                    height: 48, background: '#C42B2B', color: '#fff', border: 'none', borderRadius: 12,
                    fontSize: 15, fontWeight: 700, cursor: customTipo.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit', opacity: customTipo.trim() ? 1 : 0.45, transition: 'opacity .15s',
                  }}
                >{enviando ? 'Registrando…' : 'Avisar ahora'}</button>
              </div>
            </>}

            {/* PASO 2 — protocolo + detalles opcionales */}
            {paso === 'protocol' && protocolo && <>
              <div style={{ padding: '24px 24px 16px' }}>
                <div style={{ width: 44, height: 44, background: '#FEF0F0', border: '1px solid rgba(196,43,43,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, fontSize: 18, color: '#C42B2B' }}>◆</div>
                <h2 style={{ fontSize: 19, fontWeight: 700, color: '#19181A', marginBottom: 6, letterSpacing: '-0.2px' }}>
                  {protocolo.id === 'otra' ? customTipo : protocolo.label}
                </h2>
                <p style={{ fontSize: 14, color: '#3D3939', lineHeight: 1.65 }}>{protocolo.texto}</p>
              </div>
              <div style={{ margin: '0 24px 16px' }}>
                {errorMsg
                  ? <div style={{ background: '#FEF0F0', borderLeft: '3px solid #C42B2B', borderRadius: '0 8px 8px 0', padding: '10px 14px' }}>
                      <span style={{ fontSize: 13, color: '#C42B2B', lineHeight: 1.5 }}>{errorMsg}</span>
                    </div>
                  : <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#EDF7EF', borderRadius: 8, padding: '8px 14px' }}>
                      <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16, color: '#1A6B35' }}>check_circle</span>
                      <span style={{ fontSize: 13, color: '#1A6B35', fontWeight: 600 }}>Registrado en Novedades como urgente.</span>
                    </div>
                }
              </div>
              <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#6A6762' }}>
                  Detalles adicionales (opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Nombre, piso, observaciones, hora exacta…"
                  value={detalles}
                  onChange={e => setDetalles(e.target.value)}
                  style={{ ...INPUT, lineHeight: 1.55 }}
                  onFocus={e => e.target.style.borderColor = '#0A1C40'}
                  onBlur={e => e.target.style.borderColor = 'rgba(25,24,26,0.12)'}
                />
                <button
                  onClick={confirmarDetalles}
                  style={{
                    height: 48, background: '#0A1C40', color: '#fff', border: 'none', borderRadius: 12,
                    fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'filter .12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.3)'}
                  onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                >
                  {detalles.trim() ? 'Guardar y cerrar' : 'Entendido'}
                </button>
              </div>
            </>}

          </div>
        </div>
      )}
    </>
  );
}
