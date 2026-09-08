import React, { useState } from 'react';
import { crearPedido, crearReporte, getUser } from '../api';
import { CATEGORIAS_PEDIDOS, CATEGORIAS_DANOS, ZONAS, porZona } from '../catalog';
import { comprimirImagen, sinPrefijo } from '../util';
import Combobox from '../components/Combobox';
import CategoriaPedido from '../components/CategoriaPedido';
import CategoriaReporte from '../components/CategoriaReporte';
import Verificacion from '../components/Verificacion';
import Camera from '../components/Camera';

export default function Dashboard() {
  const [tab, setTab] = useState('pedido');
  const [orderMsg, setOrderMsg] = useState('');
  const [reportMsg, setReportMsg] = useState('');
  const [waLink, setWaLink] = useState('');
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const user = getUser();

  const [cats, setCats] = useState([]);                  // categorías seleccionadas
  const [cantPorCat, setCantPorCat] = useState({});      // { categoria: { producto: cantidad } }
  const [zona, setZona] = useState('');
  const [urgencia, setUrgencia] = useState('normal');
  const [notas, setNotas] = useState('');
  const [reporteForm, setReporteForm] = useState({ categoria: '', objeto: '', zona: '', urgencia: 'normal', descripcion: '', nota: '', foto: null });
  const [reporteKey, setReporteKey] = useState(0);

  function getItemsCategoria(cat) {
    const g = CATEGORIAS_PEDIDOS.find((c) => c.categoria === cat);
    return g ? g.items : [];
  }

  function toggleCategoria(cat) {
    setCats((prev) => {
      if (prev.includes(cat)) {
        const quedan = prev.filter((c) => c !== cat);
        setCantPorCat((cp) => {
          const next = { ...cp };
          delete next[cat];
          return next;
        });
        return quedan;
      }
      return [...prev, cat];
    });
  }

  function onCantCatChange(cat, mapa) {
    setCantPorCat((prev) => ({ ...prev, [cat]: mapa }));
  }

  function onZonaPedido(z) {
    setZona(z);
    setCats([]);
    setCantPorCat({});
  }

  function onZonaReporte(z) {
    setReporteForm({ ...reporteForm, zona: z, objeto: '' });
    setReporteKey((k) => k + 1);
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
    const validos = [];
    cats.forEach((cat) => {
      const mapa = cantPorCat[cat] || {};
      Object.entries(mapa).forEach(([producto, cantidad]) => {
        validos.push({ producto, cantidad });
      });
    });
    if (validos.length === 0) return setError('Agrega al menos un producto con su cantidad.');
    if (!zona) return setError('Elige una zona.');

    const datos = { productos: validos, zona, urgencia, nota: notas };
    try {
      const res = await crearPedido(datos, user);
      const lista = validos.map((p) => `• ${p.producto} x${p.cantidad}`).join('\n');
      const texto = `*NUEVO PEDIDO (${urgencia.toUpperCase()})*\n\nDe: ${user.nombre}\n\nProductos:\n${lista}\n\nZona: ${zona}\nNota: ${notas || 'Sin nota'}`;
      setWaLink(`https://wa.me/?text=${encodeURIComponent(texto)}`);
      setOrderMsg(`${res.message} (No. ${res.id})`);
      setCats([]);
      setCantPorCat({});
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
      let texto = `*REPORTE DE DAÑO*\n\nDe: ${user.nombre}\nObjeto: ${datos.objeto}\nZona: ${datos.zona}\nUrgencia: ${datos.urgencia}\nNota: ${datos.nota || 'Sin nota'}`;
      if (datos.foto) texto += '\nIncluye foto adjunta (ver correo).';
      setWaLink(`https://wa.me/?text=${encodeURIComponent(texto)}`);
      setReportMsg(`${res.message} (No. ${res.id})`);
      setReporteForm({ categoria: '', objeto: '', zona: '', urgencia: 'normal', descripcion: '', nota: '', foto: null });
      setReporteKey((k) => k + 1);
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
        <button className={tab === 'verificar' ? 'tab active' : 'tab'} onClick={() => setTab('verificar')}>
          ✅ Verificar
        </button>
      </div>

      {tab === 'verificar' ? (
        <Verificacion />
      ) : tab === 'pedido' ? (
        <form className="card card-wide" onSubmit={submitPedido}>
          <h2>Nuevo Pedido</h2>

          <label>1. Elige la zona</label>
          <Combobox
            options={ZONAS}
            value={zona}
            onChange={onZonaPedido}
            placeholder="Busca y elige la zona..."
          />
          {!zona && <p className="muted">Primero elige la zona para ver sus categorías.</p>}

          {zona && (
            <>
              <label>2. Elige las categorías de productos</label>
              <div className="cat-chips">
                {porZona(CATEGORIAS_PEDIDOS, zona).map((g) => (
                  <button
                    key={g.categoria}
                    type="button"
                    className={'cat-chip' + (cats.includes(g.categoria) ? ' active' : '')}
                    onClick={() => toggleCategoria(g.categoria)}
                  >
                    {g.categoria}
                  </button>
                ))}
              </div>

              {cats.length === 0 && <p className="muted">Selecciona una o más categorías para elegir sus productos.</p>}

              {cats.map((cat) => (
                <CategoriaPedido
                  key={cat}
                  categoria={cat}
                  items={getItemsCategoria(cat)}
                  onCambio={onCantCatChange}
                />
              ))}

              <label>3. Urgencia</label>
              <select value={urgencia} onChange={(e) => setUrgencia(e.target.value)}>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>

              <label>4. Notas</label>
              <textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Notas adicionales" />

              {error && <p className="error">{error}</p>}
              {orderMsg && <p className="success">{orderMsg}</p>}
              {waLink && <a className="wa-btn" href={waLink} target="_blank" rel="noreferrer">📱 Enviar por WhatsApp</a>}
              <button type="submit">Enviar Pedido</button>
            </>
          )}
        </form>
      ) : (
        <form className="card" onSubmit={submitReporte}>
          <h2>Reportar Daño</h2>

          <label>1. Elige la zona</label>
          <Combobox
            options={ZONAS}
            value={reporteForm.zona}
            onChange={onZonaReporte}
            placeholder="Busca y elige la zona..."
          />
          {!reporteForm.zona && <p className="muted">Primero elige la zona para ver sus objetos.</p>}

          {reporteForm.zona && (
            <>
              <label>2. Objeto dañado</label>
              <CategoriaReporte
                key={reporteKey}
                groups={porZona(CATEGORIAS_DANOS, reporteForm.zona)}
                seleccion={reporteForm.objeto}
                onSeleccion={(obj) => setReporteForm((prev) => ({ ...prev, objeto: obj }))}
              />

              <label>3. Urgencia</label>
              <select value={reporteForm.urgencia} onChange={(e) => setReporteForm({ ...reporteForm, urgencia: e.target.value })}>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>

              <label>4. Nota</label>
              <textarea value={reporteForm.nota} onChange={(e) => setReporteForm({ ...reporteForm, nota: e.target.value })} placeholder="Nota adicional (opcional)" />

              <label>5. Descripción del daño</label>
              <textarea value={reporteForm.descripcion} onChange={(e) => setReporteForm({ ...reporteForm, descripcion: e.target.value })} required placeholder="Describe qué ocurrió" />

              <label>6. Foto del daño</label>
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
            </>
          )}
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