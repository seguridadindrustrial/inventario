import React, { useEffect, useMemo, useState } from 'react';

// Muestra una sección de categoría con la lista completa de sus productos.
// - Cada producto tiene su propio campo de cantidad.
// - Reporta hacia arriba (onCambio) los productos con cantidad > 0.
export default function CategoriaPedido({ categoria, items, onCambio }) {
  const [query, setQuery] = useState('');
  const [cant, setCant] = useState({});

  const lista = useMemo(
    () => items.slice().sort((a, b) => a.localeCompare(b, 'es')),
    [items]
  );

  const q = query.trim().toLowerCase();
  const visibles = lista.filter((o) => o.toLowerCase().includes(q));
  const total = Object.values(cant).reduce((s, n) => s + (Number(n) || 0), 0);

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
    <div className="cat-seccion">
      <div className="cat-seccion-head">
        <span className="cat-seccion-titulo">{categoria}</span>
        {total > 0 && <span className="cat-seccion-total">{total} uds</span>}
      </div>
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
    </div>
  );
}
