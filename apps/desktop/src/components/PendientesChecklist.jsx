import { useState } from 'react';
import { state as estados } from '../lib/tokens';

export default function PendientesChecklist({ turno, onReconocido }) {
  const pendientes = turno.pendientes ?? [];
  const [marcados, setMarcados] = useState(() => pendientes.map(() => false));
  const todosMarcados = marcados.length > 0 && marcados.every(Boolean);

  function toggle(i) {
    setMarcados(prev => prev.map((m, idx) => idx === i ? !m : m));
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24,
    }}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }}>
        <div style={{ padding: '22px 22px 14px' }}>
          <div style={{
            width: 44, height: 44, background: estados.warning.bg, border: `1px solid ${estados.warning.border}`,
            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12, fontSize: 20, color: estados.warning.color,
          }}>{estados.warning.icon}</div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Pendientes del turno anterior</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Antes de seguir, revisa y marca como leído cada pendiente que dejó el turno anterior.</p>
        </div>
        <div style={{ padding: '0 22px', display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
          {pendientes.map((p, i) => (
            <label key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer',
              background: marcados[i] ? 'rgba(47,191,113,0.08)' : 'var(--bg-input)',
              border: `1px solid ${marcados[i] ? 'rgba(47,191,113,0.3)' : 'var(--border)'}`,
              borderRadius: 8, padding: '12px 14px', transition: 'all 120ms', minHeight: 44, boxSizing: 'border-box',
            }}>
              <input
                type="checkbox" checked={marcados[i]} onChange={() => toggle(i)}
                style={{ width: 20, height: 20, marginTop: 1, accentColor: '#2FBF71', cursor: 'pointer', flexShrink: 0 }}
              />
              <span style={{ fontSize: 15, color: 'var(--text-body)', lineHeight: 1.5 }}>{p.texto}</span>
            </label>
          ))}
        </div>
        <div style={{ padding: 22 }}>
          <button
            onClick={onReconocido}
            disabled={!todosMarcados}
            style={{
              width: '100%', height: 44, background: todosMarcados ? 'var(--brand)' : 'var(--border)',
              border: 'none', borderRadius: 8, color: todosMarcados ? 'var(--brand-text-on)' : 'var(--text-muted)',
              fontSize: 14, fontWeight: 700, cursor: todosMarcados ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
            }}
          >{todosMarcados ? 'Continuar' : `Marca los ${pendientes.length} pendientes para continuar`}</button>
        </div>
      </div>
    </div>
  );
}
