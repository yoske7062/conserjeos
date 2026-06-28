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
export default function FotoField({ value, onChange }) {
  const fileRef  = useRef();
  const videoRef = useRef();
  const streamRef = useRef(null);
  const [camAbierta, setCamAbierta] = useState(false);
  const [camError, setCamError]     = useState('');

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
      <div>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
        <span style={{ color: 'var(--brand)' }}>📎</span>
        <span style={{ fontSize: 13, color: 'var(--text-body)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value.name}</span>
        <button type="button" onClick={() => onChange(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
      </div>
    );
  }

  return (
    <div>
      <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={e => onChange(e.target.files?.[0] ?? null)} />
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
