import { useState, useEffect } from 'react';
import { getSignedFotoUrl } from '../lib/fotos';

// Resuelve un path del bucket privado 'fotos' a una signed URL temporal
// antes de pintar el <img>. El bucket ya no permite getPublicUrl().
export default function FotoPrivada({ path, alt, style }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let vivo = true;
    setUrl(null);
    getSignedFotoUrl(path).then(u => { if (vivo) setUrl(u); });
    return () => { vivo = false; };
  }, [path]);

  if (!url) return <div style={{ ...style, background: 'var(--bg-surface)' }} />;
  return <img src={url} alt={alt} style={style} />;
}
