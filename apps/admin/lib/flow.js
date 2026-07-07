import crypto from 'crypto';

const BASE_URL = process.env.FLOW_SANDBOX === 'true'
  ? 'https://sandbox.flow.cl/api'
  : 'https://www.flow.cl/api';

function firmar(params, secretKey) {
  const claves = Object.keys(params).filter(k => k !== 's').sort();
  const concatenado = claves.map(k => `${k}${params[k]}`).join('');
  return crypto.createHmac('sha256', secretKey).update(concatenado).digest('hex');
}

function getCredenciales() {
  if (typeof window !== 'undefined') {
    throw new Error('flow.js solo se puede usar en el servidor');
  }
  const apiKey = process.env.FLOW_API_KEY;
  const secretKey = process.env.FLOW_SECRET_KEY;
  if (!apiKey || !secretKey) {
    throw new Error('FLOW_API_KEY / FLOW_SECRET_KEY no configuradas. Ver apps/admin/.env.example.');
  }
  return { apiKey, secretKey };
}

// Todos los servicios de Flow van firmados con la SecretKey — nunca se
// arma el request a mano en el resto del código, siempre por acá.
async function llamar(path, params, { method = 'POST' } = {}) {
  const { apiKey, secretKey } = getCredenciales();
  const completos = { ...params, apiKey };
  const s = firmar(completos, secretKey);
  const body = new URLSearchParams({ ...completos, s });

  const url = method === 'GET' ? `${BASE_URL}${path}?${body.toString()}` : `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers: method === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : undefined,
    body: method === 'POST' ? body.toString() : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.message ?? 'Error en la API de Flow');
    err.flowCode = data?.code;
    throw err;
  }
  return data;
}

export async function crearCliente({ name, email, externalId }) {
  return llamar('/customer/create', { name, email, externalId });
}

export async function registrarTarjeta({ customerId, urlReturn }) {
  return llamar('/customer/register', { customerId, url_return: urlReturn });
}

export async function estadoRegistroTarjeta({ token }) {
  return llamar('/customer/getRegisterStatus', { token }, { method: 'GET' });
}

export async function crearSuscripcion({ planId, customerId }) {
  return llamar('/subscription/create', { planId, customerId });
}
