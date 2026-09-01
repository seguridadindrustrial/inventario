import React, { useRef, useState, useEffect } from 'react';

// Lista desplegable con buscador.
// - Accepta: groups=[{categoria, items:[...]}]  → muestra por categorías
//            options=[...]                       → lista plana
// - Ordena alfabéticamente y filtra mientras escribes
// - value / onChange: texto seleccionado
export default function Combobox({ options = [], groups = null, value, onChange, placeholder = 'Elige una opción...' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const q = query.trim().toLowerCase();

  const flatOptions = [...options].sort((a, b) => a.localeCompare(b, 'es'));
  const filteredFlat = flatOptions.filter((o) => o.toLowerCase().includes(q));

  const filteredGroups = groups
    ? groups
        .map((g) => ({
          categoria: g.categoria,
          items: [...g.items].sort((a, b) => a.localeCompare(b, 'es')).filter((o) => o.toLowerCase().includes(q))
        }))
        .filter((g) => g.items.length > 0)
    : [];

  const hasResults = groups ? filteredGroups.length > 0 : filteredFlat.length > 0;

  function select(o) {
    onChange(o);
    setOpen(false);
    setQuery('');
  }

  return (
    <div className="combobox" ref={wrapRef}>
      <input
        value={open ? query : value}
        placeholder={placeholder}
        onFocus={() => { setQuery(value); setOpen(true); }}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
      />
      {open && (
        <>
          {groups ? (
            filteredGroups.length > 0 && (
              <ul className="combobox-list">
                {filteredGroups.map((g) => (
                  <li key={g.categoria}>
                    <div className="combobox-group">{g.categoria}</div>
                    <ul className="combobox-sublist">
                      {g.items.map((it) => (
                        <li key={it} className="combobox-item" onMouseDown={(e) => { e.preventDefault(); select(it); }}>
                          {it}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )
          ) : (
            filteredFlat.length > 0 && (
              <ul className="combobox-list">
                {filteredFlat.map((o) => (
                  <li key={o} className="combobox-item" onMouseDown={(e) => { e.preventDefault(); select(o); }}>
                    {o}
                  </li>
                ))}
              </ul>
            )
          )}
          {!hasResults && (
            <div className="combobox-empty">Sin resultados para "{query}"</div>
          )}
        </>
      )}
    </div>
  );
}