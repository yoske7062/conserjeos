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
