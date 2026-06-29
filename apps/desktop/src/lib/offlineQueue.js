const KEY = 'portia:offline-queue';
const listeners = new Set();

function notifyAll() {
  listeners.forEach(cb => cb(count()));
}

export function enqueue(item) {
  const q = getAll();
  q.push({ ...item, _id: crypto.randomUUID(), _ts: new Date().toISOString() });
  localStorage.setItem(KEY, JSON.stringify(q));
  notifyAll();
}

export function getAll() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); }
  catch { return []; }
}

export function remove(_id) {
  localStorage.setItem(KEY, JSON.stringify(getAll().filter(i => i._id !== _id)));
  notifyAll();
}

export function count() { return getAll().length; }

// Suscribirse a cambios de count — devuelve cleanup
export function onCountChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// Para guardar fotos en la cola offline (no se puede subir a Storage sin conexión).
// Se codifican como data URL en localStorage y se suben recién al reconectar.
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function base64ToBlob(dataUrl) {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/data:(.*?);/)?.[1] ?? 'image/jpeg';
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
