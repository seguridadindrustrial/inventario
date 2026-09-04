import React, { useRef, useState } from 'react';
import { crearVerificacion, getUser } from '../api';
import { CATEGORIAS_VERIFICACION } from '../catalog';
import { comprimirImagen, sinPrefijo } from '../util';
import Camera from './Camera';

const MAX_FOTOS = 5;

export default function Verificacion() {
  const user = getUser();
  const [estado, setEstado] = useState({});   // { cat: { prod: 'todo' | 'falta' } }
  const [fotos, setFotos] = useState({});     // { cat: [dataURL] } máx MAX_FOTOS
  const [nota, setNota] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [waLink, setWaLink] = useState('');
  const [open, setOpen] = useState({});       // acordeón por categoría
  const [query, setQuery] = useState({});     // buscador por categoría
  const [camCat, setCamCat] = useState(null); // categoría de la cámara abierta
  const fileRefs = useRef({});

  const cats = CATEGORIAS_VERIFICACION.filter((g) => g.items.length > 0);

  function toggleEstado(cat, prod) {
    setEstado((prev) => {
      const actual = (prev[cat] || {})[prod] === 'falta' ? 'todo' : 'falta';
      return { ...prev, [cat]: { ...(prev[cat] || {}), [prod]: actual } };
    });
  }

  function faltantes(cat) {
    const mapa = estado[cat] || {};
    return cats
      .find((g) => g.categoria === cat)
      ?.items.filter((p) => mapa[p] === 'falta') || [];
  }

  function agregarFoto(cat, url) {
    setFotos((prev) => {
      const actuales = prev[cat] || [];
      if (actuales.length >= MAX_FOTOS) return prev;
      return { ...prev, [cat]: [...actuales, url] };
    });
  }

  async function onArchivo(cat, e) {
    const files = Array.from(e.target.files || []);
    const actuales = (fotos[cat] || []).length;
    const cupo = MAX_FOTOS - actuales;
    for (const file of files.slice(0, cupo)) {
      try {
        const url = await comprimirImagen(file);
        agregarFoto(cat, url);
      } catch {
        setError('No se pudo procesar una imagen.');
      }
    }
    if (fileRefs.current[cat]) fileRefs.current[cat].value = '';
  }

  function quitarFoto(cat, i) {
    setFotos((prev) => {
      const actuales = prev[cat] || [];
      return { ...prev, [cat]: actuales.filter((_, idx) => idx !== i) };
    });
  }

  const faltan = cats.flatMap((g) => faltantes(g.categoria));
  const totalFotos = Object.values(fotos).reduce((s, a) => s + a.length, 0);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setWaLink('');
    const categorias = cats.map((g) => ({
      categoria: g.categoria,
      productos: g.items.map((p) => ({
        producto: p,
        estado: (estado[g.categoria] || {})[p] || 'todo'
      }))
    }));
    const fotosOut = {};
    for (const [cat, arr] of Object.entries(fotos)) {
      fotosOut[cat] = arr.map(sinPrefijo);
    }
    const datos = { categorias, fotos: fotosOut, nota };

    try {
      const res = await crearVerificacion(datos, user);
      const lineas = cats.map((g) => {
        const f = faltantes(g.categoria);
        const estado = f.length === 0 ? '✅ Todo correcto' : `⚠️ Falta: ${f.join(', ')}`;
        return `${g.categoria}: ${estado}`;
      });
      const encabezado = faltan.length === 0
        ? '✅ *VERIFICACIÓN DE INVENTARIO*\n\nTodo completo.'
        : `⚠️ *VERIFICACIÓN DE INVENTARIO*\n\nFALTA ALGO (${faltan.length} artículo(s)).`;
      const texto = `${encabezado}\n\n👤 De: ${user.nombre}\n\n${lineas.join('\n')}\n\n📝 Nota: ${nota || 'Sin nota'}${totalFotos ? `\n\n📷 ${totalFotos} foto(s) adjuntas al correo.` : ''}`;
      setWaLink(`https://wa.me/?text=${encodeURIComponent(texto)}`);
      setMsg(`${res.message}${totalFotos ? ` (${totalFotos} foto(s) al correo)` : ''}`);
      setEstado({});
      setFotos({});
      setNota('');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="card card-wide" onSubmit={submit}>
      <h2>Verificar Inventario</h2>
      <p className="muted">Marca "Falta" en cada artículo ausente. Acompaña la verificación con fotos (hasta {MAX_FOTOS} por categoría): solo van al correo.</p>

      {cats.map((g) => {
        const isOpen = !!open[g.categoria];
        const f = faltantes(g.categoria);
        const map = estado[g.categoria] || {};
        const q = (query[g.categoria] || '').trim().toLowerCase();
        const visibles = g.items.filter((p) => p.toLowerCase().includes(q));
        const fotosCat = fotos[g.categoria] || [];

        return (
          <div className={'cat-seccion' + (isOpen ? ' open' : '')} key={g.categoria}>
            <button
              type="button"
              className="cat-seccion-head"
              onClick={() => setOpen((o) => ({ ...o, [g.categoria]: !isOpen }))}
            >
              <span className={'cat-seccion-arrow' + (isOpen ? ' open' : '')}>▸</span>
              <span className="cat-seccion-titulo">{g.categoria}</span>
              {f.length > 0 ? (
                <span className="cat-seccion-total falta">{f.length} falta(n)</span>
              ) : (
                <span className="cat-seccion-total ok">✓ todo</span>
              )}
            </button>

            {isOpen && (
              <>
                <input
                  className="cat-seccion-buscar"
                  placeholder="Buscar en esta categoría..."
                  value={query[g.categoria] || ''}
                  onChange={(e) => setQuery((q2) => ({ ...q2, [g.categoria]: e.target.value }))}
                />
                <div className="cat-seccion-lista">
                  {visibles.length === 0 && <div className="muted">Sin resultados.</div>}
                  {visibles.map((p) => (
                    <div className={'cat-prod-row' + (map[p] === 'falta' ? ' falta' : '')} key={p}>
                      <span className="cat-prod-nombre">
                        {map[p] === 'falta' ? '⚠️ ' : ''}{p}
                      </span>
                      <div className="estado-toggle">
                        <button
                          type="button"
                          className={map[p] ? 'but' : 'but on'}
                          onClick={() => setEstado((prev) => ({ ...prev, [g.categoria]: { ...(prev[g.categoria] || {}), [p]: 'todo' } }))}
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          className={map[p] === 'falta' ? 'but faut on' : 'but faut'}
                          onClick={() => setEstado((prev) => ({ ...prev, [g.categoria]: { ...(prev[g.categoria] || {}), [p]: 'falta' } }))}
                        >
                          ✗
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="foto-verif">
                  {fotosCat.map((foto, i) => (
                    <div className="thumb" key={i}>
                      <img src={foto} alt={`Foto ${i + 1}`} />
                      <button type="button" className="thumb-del" onClick={() => quitarFoto(g.categoria, i)}>✕</button>
                    </div>
                  ))}
                  {fotosCat.length < MAX_FOTOS && (
                    <>
                      <button type="button" className="btn-cam" onClick={() => setCamCat(g.categoria)}>📷</button>
                      <label className="btn-upload">
                        🖼️
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                          ref={(el) => { fileRefs.current[g.categoria] = el; }}
                          onChange={(e) => onArchivo(g.categoria, e)}
                        />
                      </label>
                    </>
                  )}
                  {fotosCat.length > 0 && (
                    <span className="muted foto-count">{fotosCat.length}/{MAX_FOTOS}</span>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}

      <label>📝 Nota</label>
      <textarea value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Nota adicional (opcional)" />

      {error && <p className="error">{error}</p>}
      {msg && <p className="success">{msg}</p>}
      {waLink && <a className="wa-btn" href={waLink} target="_blank" rel="noreferrer">📱 Enviar resumen por WhatsApp</a>}
      <button type="submit">Enviar Verificación</button>

      {camCat && (
        <Camera
          onPhoto={(url) => { agregarFoto(camCat, url); setCamCat(null); }}
          onClose={() => setCamCat(null)}
        />
      )}
    </form>
  );
}