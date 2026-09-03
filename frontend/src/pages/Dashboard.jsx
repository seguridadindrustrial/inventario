import React, { useState } from 'react';
import { crearPedido, crearReporte, getUser } from '../api';
import { CATEGORIAS, ZONAS } from '../catalog';
import Combobox from '../components/Combobox';
import Camera from '../components/Camera';

const NUEVO_ITEM = () => ({ producto: '', cantidad: '1' });

// Comprime una imagen (File) y devuelve un dataURL jpeg (prefijo incluido)
function comprimirImagen(file, maxW = 900, maxH = 900, calidad = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * ratio));
        canvas.height = Math.max(1, Math.round(img.height * ratio));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', calidad));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Genera una miniaturla (ya no se usa; la foto solo va al correo)
const sinPrefijo = (url) => (url || '').split(',')[1] || '';

export default function Dashboard() {
  const [tab, setTab] = useState('pedido');
  const [orderMsg, setOrderMsg] = useState('');
  const [reportMsg, setReportMsg] = useState('');
  const [waLink, setWaLink] = useState('');
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const user = getUser();

  const [items, setItems] = useState([NUEVO_ITEM()]);
  const [zona, setZona] = useState('');
  const [urgencia, setUrgencia] = useState('normal');
  const [notas, setNotas] = useState('');
  const [reporteForm, setReporteForm] = useState({ objeto: '', zona: '', urgencia: 'normal', descripcion: '', nota: '', foto: null });

  function updateItem(i, campo, valor) {
    setItems(items.map((it, idx) => (idx === i ? { ...it, [campo]: valor } : it)));
  }

  function addItem() {
    setItems([...items, NUEVO_ITEM()]);
  }

  function removeItem(i) {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== i));
  }

  async function onArchivo(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const foto = await comprimirImagen(file);
      setReporteForm((prev) => ({ ...prev, foto }));
    } catch {
      setError('No se pudo procesar la imagen.');
    }
    e.target.value = '';
  }

  async function submitPedido(e) {
    e.preventDefault();
    setError(''); setWaLink('');
    const validos = items.filter((it) => it.producto.trim() && Number(it.cantidad) > 0);
    if (validos.length === 0) return setError('Agrega al menos un producto con su cantidad.');
    if (!zona) return setError('Elige una zona.');

    const datos = { productos: validos, zona, urgencia, nota: notas };
    try {
      const res = await crearPedido(datos, user);
      const lista = validos.map((p) => `• ${p.producto} x${p.cantidad}`).join('\n');
      const texto = `📦 *NUEVO PEDIDO ${urgencia.toUpperCase()}*\n\n👤 De: ${user.nombre}\n🛒 Productos:\n${lista}\n📍 Zona: ${zona}\n📝 Nota: ${notas || 'Sin nota'}`;
      setWaLink(`https://wa.me/?text=${encodeURIComponent(texto)}`);
      setOrderMsg(`${res.message} (No. ${res.id})`);
      setItems([NUEVO_ITEM()]);
      setZona('');
      setUrgencia('normal');
      setNotas('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitReporte(e) {
    e.preventDefault();
    setError(''); setWaLink('');
    if (!reporteForm.zona) return setError('Elige una zona.');
    const datos = {
      objeto: reporteForm.objeto,
      zona: reporteForm.zona,
      urgencia: reporteForm.urgencia,
      nota: reporteForm.nota,
      descripcion: reporteForm.descripcion
    };
    if (reporteForm.foto) {
      try {
        datos.foto = sinPrefijo(reporteForm.foto); // base64 completa (va adjunta SOLO al correo, no al Excel)
      } catch {
        setError('No se pudo procesar la foto.');
        return;
      }
    }
    try {
      const res = await crearReporte(datos, user);
      let texto = `⚠️ *REPORTE DE DAÑO*\n\n👤 De: ${user.nombre}\n🪑 Objeto: ${datos.objeto}\n📍 Zona: ${datos.zona}\n⚡ Urgencia: ${datos.urgencia}\n📝 Nota: ${datos.nota || 'Sin nota'}`;
      if (datos.foto) texto += '\n📷 Incluye foto';
      setWaLink(`https://wa.me/?text=${encodeURIComponent(texto)}`);
      setReportMsg(`${res.message} (No. ${res.id})`);
      setReporteForm({ objeto: '', zona: '', urgencia: 'normal', descripcion: '', nota: '', foto: null });
      e.target.reset();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="tabs">
        <button className={tab === 'pedido' ? 'tab active' : 'tab'} onClick={() => { setTab('pedido'); setWaLink(''); setOrderMsg(''); }}>
          📋 Nuevo Pedido
        </button>
        <button className={tab === 'reporte' ? 'tab active' : 'tab'} onClick={() => { setTab('reporte'); setWaLink(''); setReportMsg(''); }}>
          ⚠️ Reportar Daño
        </button>
      </div>

      {tab === 'pedido' ? (
        <form className="card card-wide" onSubmit={submitPedido}>
          <h2>Nuevo Pedido</h2>

          <div className="items-header">
            <span>🛒 Productos</span>
            <button type="button" className="btn-add" onClick={addItem}>＋ Agregar producto</button>
          </div>

          {items.map((it, idx) => (
            <div className="item-row" key={idx}>
              <Combobox
                groups={CATEGORIAS}
                value={it.producto}
                onChange={(v) => updateItem(idx, 'producto', v)}
                placeholder="Busca y elige un producto..."
              />
              <input
                className="qty"
                type="number"
                min="1"
                value={it.cantidad}
                onChange={(e) => updateItem(idx, 'cantidad', e.target.value)}
                title="Cantidad"
              />
              {items.length > 1 && (
                <button type="button" className="btn-remove" onClick={() => removeItem(idx)}>✕</button>
              )}
            </div>
          ))}

          <label>📍 Zona</label>
          <Combobox
            options={ZONAS}
            value={zona}
            onChange={setZona}
            placeholder="Busca y elige la zona..."
          />

          <label>⚡ Urgencia</label>
          <select value={urgencia} onChange={(e) => setUrgencia(e.target.value)}>
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>

          <label>📝 Notas</label>
          <textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Notas adicionales" />

          {error && <p className="error">{error}</p>}
          {orderMsg && <p className="success">{orderMsg}</p>}
          {waLink && <a className="wa-btn" href={waLink} target="_blank" rel="noreferrer">📱 Enviar por WhatsApp</a>}
          <button type="submit">Enviar Pedido</button>
        </form>
      ) : (
        <form className="card" onSubmit={submitReporte}>
          <h2>Reportar Daño</h2>
          <label>Objeto dañado</label>
          <Combobox
            groups={CATEGORIAS}
            value={reporteForm.objeto}
            onChange={(v) => setReporteForm({ ...reporteForm, objeto: v })}
            placeholder="Busca y elige el objeto..."
          />
          <label>📍 Zona</label>
          <Combobox
            options={ZONAS}
            value={reporteForm.zona}
            onChange={(v) => setReporteForm({ ...reporteForm, zona: v })}
            placeholder="Elige la zona..."
          />
          <label>⚡ Urgencia</label>
          <select value={reporteForm.urgencia} onChange={(e) => setReporteForm({ ...reporteForm, urgencia: e.target.value })}>
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
          <label>📝 Nota</label>
          <textarea value={reporteForm.nota} onChange={(e) => setReporteForm({ ...reporteForm, nota: e.target.value })} placeholder="Nota adicional (opcional)" />
          <label>Descripción del daño</label>
          <textarea value={reporteForm.descripcion} onChange={(e) => setReporteForm({ ...reporteForm, descripcion: e.target.value })} required placeholder="Describe qué ocurrió" />

          <label>📷 Foto del daño</label>
          <div className="photo-actions">
            <button type="button" className="btn-cam" onClick={() => setShowCamera(true)}>📷 Tomar foto</button>
            <label className="btn-upload">
              🖼️ Subir foto
              <input type="file" accept="image/*" hidden onChange={onArchivo} />
            </label>
          </div>
          {reporteForm.foto && (
            <div className="photo-preview">
              <img src={reporteForm.foto} alt="Vista previa" />
              <button type="button" className="btn-remove-photo" onClick={() => setReporteForm({ ...reporteForm, foto: null })}>✕ Quitar</button>
            </div>
          )}

          {error && <p className="error">{error}</p>}
          {reportMsg && <p className="success">{reportMsg}</p>}
          {waLink && <a className="wa-btn" href={waLink} target="_blank" rel="noreferrer">📱 Enviar por WhatsApp</a>}
          <button type="submit">Enviar Reporte</button>
        </form>
      )}

      {showCamera && (
        <Camera
          onPhoto={(url) => { setReporteForm((prev) => ({ ...prev, foto: url })); setShowCamera(false); }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}