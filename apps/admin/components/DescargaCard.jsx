'use client';
import { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabase';
import { actualizarMetodoDePago } from '../app/dashboard/actions';

const REPO = 'yoske7062/conserjeos';

function encontrarAsset(assets, patron) {
  return assets.find(a => patron.test(a.name));
}

export default function DescargaCard() {
  const [estado, setEstado] = useState('cargando'); // cargando | activo | bloqueado
  const [assets, setAssets] = useState(null);
  const [abriendoPortal, setAbriendoPortal] = useState(false);
  const [errorPortal, setErrorPortal] = useState('');

  async function abrirBillingPortal() {
    setAbriendoPortal(true);
    setErrorPortal('');
    const res = await actualizarMetodoDePago();
    if (res.error) { setErrorPortal(res.error); setAbriendoPortal(false); return; }
    window.location.href = res.url;
  }

  useEffect(() => {
    async function cargar() {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: perfil } = await supabase.from('perfiles').select('edificio_id').eq('id', user.id).single();
      const { data: edificio } = await supabase.from('edificios').select('subscription_status').eq('id', perfil.edificio_id).single();

      const activo = edificio?.subscription_status === 'active';
      setEstado(activo ? 'activo' : 'bloqueado');
      if (!activo) return;

      try {
        const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
        const release = await res.json();
        const items = release.assets ?? [];
        setAssets({
          version: release.tag_name,
          mac: encontrarAsset(items, /arm64\.dmg$/),
          macIntel: encontrarAsset(items, /x64\.dmg$/),
          win: encontrarAsset(items, /Setup.*\.exe$/),
        });
      } catch {
        setAssets(null);
      }
    }
    cargar();
  }, []);

  if (estado === 'cargando') return null;

  if (estado === 'bloqueado') {
    return (
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px', marginBottom: 24 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Descarga bloqueada</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
          Tu suscripción no está activa. Regulariza el pago para desbloquear la descarga de la app de escritorio.
        </p>
        {errorPortal && <p style={{ fontSize: 12, color: '#C42B2B', marginBottom: 10 }}>{errorPortal}</p>}
        <button onClick={abrirBillingPortal} disabled={abriendoPortal} style={{ ...btnStyle, border: 'none', cursor: abriendoPortal ? 'not-allowed' : 'pointer', opacity: abriendoPortal ? 0.7 : 1 }}>
          {abriendoPortal ? 'Abriendo…' : 'Actualizar método de pago'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px', marginBottom: 24 }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Descargar Portia Desktop</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
        {assets ? `Versión ${assets.version} — instalala en el computador de conserjería.` : 'Buscando la última versión…'}
      </p>
      {errorPortal && <p style={{ fontSize: 12, color: '#C42B2B', marginBottom: 10 }}>{errorPortal}</p>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {assets?.mac && <a href={assets.mac.browser_download_url} style={btnStyle}>Mac (Apple Silicon)</a>}
        {assets?.macIntel && <a href={assets.macIntel.browser_download_url} style={btnStyle}>Mac (Intel)</a>}
        {assets?.win && <a href={assets.win.browser_download_url} style={btnStyle}>Windows</a>}
        <button onClick={abrirBillingPortal} disabled={abriendoPortal} style={{
          padding: '9px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 9,
          color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
          cursor: abriendoPortal ? 'not-allowed' : 'pointer', opacity: abriendoPortal ? 0.7 : 1,
        }}>
          {abriendoPortal ? 'Abriendo…' : 'Actualizar método de pago'}
        </button>
      </div>
    </div>
  );
}

const btnStyle = {
  display: 'inline-block', padding: '9px 18px', background: 'var(--brand)', color: '#fff',
  borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none',
};
