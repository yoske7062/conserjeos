import { useState, useRef, useEffect } from 'react';

const BTN_STYLE = {
  flex: 1, height: 44, borderRadius: 8, border: '1px dashed var(--border)',
  background: 'transparent', color: 'var(--text-muted)', fontSize: 13,
  cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center',
  justifyContent: 'center', gap: 6, transition: 'all 100ms',
};

// Permite adjuntar una foto tomando una con la cámara del equipo o eligiendo
// un archivo. Tomar foto directo es más fácil para alguien con poco manejo
// de PC que navegar el explorador de archivos de Windows.
// `compact`: en vez de ocupar todo el ancho, parte como un botón chico y se
// expande solo cuando el conserje realmente quiere adjuntar algo.
export default function FotoField({ value, onChange, compact = false }) {
  const fileRef  = useRef();
  const videoRef = useRef();
  const streamRef = useRef(null);
  const [camAbierta, setCamAbierta] = useState(false);
  const [camError, setCamError]     = useState('');
  const [expandido, setExpandido]   = useState(false);

  useEffect(() => {
    if (camAbierta && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [camAbierta]);

  useEffect(() => () => detenerCamara(), []);

  async function abrirCamara() {
    setCamError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setCamAbierta(true);
    } catch {
      setCamError('No se pudo acceder a la cámara. Usa "Elegir archivo".');
    }
  }

  function detenerCamara() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCamAbierta(false);
  }

  function capturar() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (blob) onChange(new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      detenerCamara();
    }, 'image/jpeg', 0.85);
  }

  if (camAbierta) {
    return (
      <div style={compact ? { position: 'absolute', zIndex: 5, background: 'var(--bg-surface)', width: 280 } : undefined}>
        <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: '#000' }}>
          <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: 'block', maxHeight: 220, objectFit: 'cover' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button type="button" onClick={detenerCamara} style={{ ...BTN_STYLE, border: '1px solid var(--border)' }}>Cancelar</button>
          <button type="button" onClick={capturar} style={{ ...BTN_STYLE, border: 'none', background: 'var(--brand)', color: 'var(--brand-text-on)', fontWeight: 700 }}>📷 Capturar</button>
        </div>
      </div>
    );
  }

  if (value) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 99, padding: compact ? '6px 8px 6px 12px' : '10px 12px' }}>
        <span style={{ color: 'var(--brand)' }}>📎</span>
        <span style={{ fontSize: 12, color: 'var(--text-body)', maxWidth: compact ? 90 : undefined, flex: compact ? 'none' : 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value.name}</span>
        <button type="button" onClick={() => { onChange(null); setExpandido(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
      </div>
    );
  }

  const inputFile = <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={e => { onChange(e.target.files?.[0] ?? null); setExpandido(false); }} />;

  if (compact) {
    return (
      <div style={{ position: 'relative' }}>
        {inputFile}
        <button type="button" onClick={() => setExpandido(v => !v)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 99,
          border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)',
          fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        ><span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 15 }}>add_a_photo</span>Foto</button>
        {expandido && (
          <div style={{
            position: 'absolute', bottom: '120%', right: 0, zIndex: 5,
            background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)', padding: 6, display: 'flex', flexDirection: 'column', gap: 4, width: 160,
          }}>
            <button type="button" onClick={abrirCamara} style={{ ...BTN_STYLE, justifyContent: 'flex-start', border: 'none', height: 38 }}>📷 Tomar foto</button>
            <button type="button" onClick={() => fileRef.current.click()} style={{ ...BTN_STYLE, justifyContent: 'flex-start', border: 'none', height: 38 }}>📁 Elegir archivo</button>
            {camError && <p style={{ fontSize: 11, color: 'var(--crit-tx)', padding: '0 8px' }}>{camError}</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={compact ? { position: 'relative' } : undefined}>
      {inputFile}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={abrirCamara} style={BTN_STYLE}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >📷 Tomar foto</button>
        <button type="button" onClick={() => fileRef.current.click()} style={BTN_STYLE}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >📁 Elegir archivo</button>
      </div>
      {camError && <p style={{ fontSize: 12, color: 'var(--crit-tx)', marginTop: 6 }}>{camError}</p>}
    </div>
  );
}
