import React, { useEffect, useMemo, useState } from 'react';

// Sección de categoría desplegable (acordeón).
// - El título/encabezado abre y cierra la lista de productos.
// - Cada producto tiene su propio campo de cantidad.
// - Reporta hacia arriba (onCambio) los productos con cantidad > 0.
export default function CategoriaPedido({ categoria, items, onCambio }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cant, setCant] = useState({});

  const lista = useMemo(
    () => items.slice().sort((a, b) => a.localeCompare(b, 'es')),
    [items]
  );

  const q = query.trim().toLowerCase();
  const visibles = lista.filter((o) => o.toLowerCase().includes(q));
  const total = Object.values(cant).reduce((s, n) => s + (Number(n) || 0), 0);
  const elegidos = Object.entries(cant);

  useEffect(() => {
    onCambio(categoria, cant);
  }, [cant]); // eslint-disable-line react-hooks/exhaustive-deps

  function setProdCant(prod, val) {
    setCant((prev) => {
      const next = { ...prev };
      if (Number(val) > 0) next[prod] = val;
      else delete next[prod];
      return next;
    });
  }

  return (
    <div className={'cat-seccion' + (open ? ' open' : '')}>
      <button type="button" className="cat-seccion-head" onClick={() => setOpen((v) => !v)}>
        <span className={'cat-seccion-arrow' + (open ? ' open' : '')}>▸</span>
        <span className="cat-seccion-titulo">{categoria}</span>
        {total > 0 && <span className="cat-seccion-total">{total} uds</span>}
      </button>

      {open && (
        <>
          <input
            className="cat-seccion-buscar"
            placeholder="Buscar en esta categoría..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="cat-seccion-lista">
            {visibles.length === 0 && <div className="muted">Sin resultados.</div>}
            {visibles.map((prod) => (
              <div className={'cat-prod-row' + (cant[prod] ? ' sel' : '')} key={prod}>
                <span className="cat-prod-nombre">{prod}</span>
                <input
                  className="cat-prod-qty"
                  type="number"
                  min="0"
                  value={cant[prod] || ''}
                  placeholder="Cant."
                  onChange={(e) => setProdCant(prod, e.target.value)}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {!open && elegidos.length > 0 && (
        <div className="cat-seccion-resumen">
          {elegidos.map(([prod, n]) => (
            <span key={prod} className="resumen-item">{prod} x{n}</span>
          ))}
        </div>
      )}
    </div>
  );
}
