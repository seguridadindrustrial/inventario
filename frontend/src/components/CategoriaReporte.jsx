import React, { useMemo, useState } from 'react';

// Selección de objeto dañado: chips de categorías (varias, marcadas).
// Cada categoría despliega su lista con buscador; al tocar un objeto se marca como elegido.
export default function CategoriaReporte({ groups = [], seleccion, onSeleccion }) {
  const [cats, setCats] = useState([]);        // categorías abiertas/procesadas
  const [open, setOpen] = useState({});        // qué categoría está desplegada
  const [query, setQuery] = useState({});      // búsqueda por categoría

  function toggleCategoria(g) {
    setCats((prev) => {
      if (prev.includes(g)) return prev.filter((c) => c !== g);
      return [...prev, g];
    });
    setOpen((o) => ({ ...o, [g]: !!!open[g] }));
    setQuery((q) => ({ ...q, [g]: '' }));
  }

  function elegir(cat, prod) {
    onSeleccion(prod);
    setCats((prev) => prev.filter((c) => c !== cat)); // cierra la categoría tras elegir
    setOpen((o) => ({ ...o, [cat]: false }));
  }

  return (
    <div className="reporte-categorias">
      <div className="cat-chips">
        {groups.filter((g) => g.items.length > 0).map((g) => (
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

      {cats.length === 0 && <p className="muted">Selecciona una categoría para ver sus objetos.</p>}

      {cats.map((cat) => {
        const g = groups.find((x) => x.categoria === cat);
        if (!g) return null;
        const lista = g.items.slice().sort((a, b) => a.localeCompare(b, 'es'));
        const q = (query[cat] || '').trim().toLowerCase();
        const visibles = lista.filter((o) => o.toLowerCase().includes(q));
        const isOpen = !!open[cat];
        return (
          <div className={'cat-seccion' + (isOpen ? ' open' : '')} key={cat}>
            <button type="button" className="cat-seccion-head" onClick={() => setOpen((o) => ({ ...o, [cat]: !isOpen }))}>
              <span className={'cat-seccion-arrow' + (isOpen ? ' open' : '')}>▸</span>
              <span className="cat-seccion-titulo">{cat}</span>
            </button>
            {isOpen && (
              <>
                <input
                  className="cat-seccion-buscar"
                  placeholder="Buscar en esta categoría..."
                  value={query[cat] || ''}
                  onChange={(e) => setQuery((q2) => ({ ...q2, [cat]: e.target.value }))}
                />
                <div className="cat-seccion-lista">
                  {visibles.length === 0 && <div className="muted">Sin resultados.</div>}
                  {visibles.map((prod) => (
                    <div
                      key={prod}
                      className={'cat-prod-row sel-clic' + (seleccion === prod ? ' sel' : '')}
                      onClick={() => elegir(cat, prod)}
                    >
                      <span className="cat-prod-nombre">{prod}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })}

      {seleccion && (
        <div className="seleccion-final">
          ✓ Objeto a reportar: <b>{seleccion}</b>
          <button type="button" className="cat-chip" onClick={() => onSeleccion('')}>✕ Quitar</button>
        </div>
      )}
    </div>
  );
}
