import { SCRIPT_URL } from './config';

export function setAuth(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('user');
}

export function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

async function fetchScript(params) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${SCRIPT_URL}?${qs}`);
  return res.json();
}

async function postScript(payload) {
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
    mode: 'cors'
  });
  return res.json();
}

export async function listarHistorial() {
  if (!SCRIPT_URL || SCRIPT_URL.includes('PEGA_AQUI')) {
    throw new Error('Configura la URL del Apps Script en frontend/src/config.js');
  }
  const data = await fetchScript({ accion: 'listar' });
  if (data.error) throw new Error(data.error);
  return data;
}

export async function crearPedido(datos, usuario) {
  return postScript({ accion: 'nuevo', tipo: 'pedido', datos, usuario });
}

export async function crearReporte(datos, usuario) {
  return postScript({ accion: 'nuevo', tipo: 'reporte', datos, usuario });
}