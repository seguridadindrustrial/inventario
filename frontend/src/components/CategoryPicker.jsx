import React, { useRef, useState, useEffect } from 'react';

// Selector en dos pasos:
// 1. Primero eliges una categoría (Vinos, Mezcladores, ...) en un selector simple.
// 2. Al elegirla, aparece un Combobox con buscador de SOLO los productos de esa categoría.
export default function CategoryPicker({ groups = [], categoria = '', onCategoriaChange, value, onChange, placeholder = 'Busca y elige...' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const itemsCategoria = categoria
    ? groups
        .find((g) => g.categoria === categoria)
        ?.items
        .slice()
        .sort((a, b) => a.localeCompare(b, 'es')) || []
    : [];

  const q = query.trim().toLowerCase();
  const filtered = itemsCategoria.filter((o) => o.toLowerCase().includes(q));

  function selectCategoria(c) {
    onCategoriaChange(c);
    onChange(''); // resetea el producto al cambiar de categoría
  }

  function selectItem(o) {
    onChange(o);
    setOpen(false);
    setQuery('');
  }

  return (
    <div className="category-picker" ref={wrapRef}>
      <select
        className="cat-select"
        value={categoria}
        onChange={(e) => selectCategoria(e.target.value)}
      >
        <option value="">— Elige una categoría —</option>
        {groups.map((g) => (
          <option key={g.categoria} value={g.categoria}>{g.categoria}</option>
        ))}
      </select>

      {categoria && (
        <div className="combobox">
          <input
            value={open ? query : value}
            placeholder={placeholder}
            onFocus={() => { setQuery(value); setOpen(true); }}
            onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
            onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
          />
          {open && (
            <>
              {filtered.length > 0 && (
                <ul className="combobox-list">
                  {filtered.map((o) => (
                    <li key={o} className="combobox-item" onMouseDown={(e) => { e.preventDefault(); selectItem(o); }}>
                      {o}
                    </li>
                  ))}
                </ul>
              )}
              {filtered.length === 0 && <div className="combobox-empty">Sin resultados para "{query}"</div>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
