import React, { useEffect, useState, useMemo } from 'react';
import { listarHistorial, getUser } from '../api';

function claseUrgencia(u) {
  const v = (u || 'normal').toLowerCase();
  if (v === 'urgente') return 'row-urgente';
  if (v === 'alta') return 'row-alta';
  return 'row-normal';
}

export default function Historial() {
  const user = getUser();
  const [segment, setSegment] = useState('todo');
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todo');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await listarHistorial();
      setAll(data.registros || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function getFilterInterval() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    switch (filter) {
      case 'hoy': return { from: today, to: new Date() };
      case 'semana': return { from: weekAgo, to: new Date() };
      case 'mes': return { from: monthAgo, to: new Date() };
      case 'custom': return {
        from: fechaDesde ? new Date(fechaDesde + 'T00:00') : new Date(0),
        to: fechaHasta ? new Date(fechaHasta + 'T23:59') : new Date()
      };
      default: return { from: new Date(0), to: new Date() };
    }
  }

  function applyFilters(items) {
    const { from, to } = getFilterInterval();
    let result = items.filter((it) => {
      const d = new Date(it.fecha_hora || 0);
      return d >= from && d <= to;
    });

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter((it) =>
        `${it.articulo || ''} ${it.id} ${it.zona || ''} ${it.nota || ''}`.toLowerCase().includes(s)
      );
    }
    return result;
  }

  const filtered = useMemo(() => applyFilters(all), [all, filter, fechaDesde, fechaHasta, search]);

  const countT = (t) => filtered.filter((r) => r.tipo === t).length;

  const visibles = segment === 'todo'
    ? filtered
    : filtered.filter((r) => r.tipo === segment);

  return (
    <div>
      <h2>Historial {user?.role === 'admin' && <span className="badge-admin">Admin</span>}</h2>

      <div className="filter-bar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="todo">Todo</option>
          <option value="hoy">Hoy</option>
          <option value="semana">Última semana</option>
          <option value="mes">Último mes</option>
          <option value="custom">Personalizado</option>
        </select>
        {filter === 'custom' && (
          <>
            <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
            <span>a</span>
            <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
          </>
        )}
        <input
          className="search"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="tabs">
        <button className={segment === 'todo' ? 'tab active' : 'tab'} onClick={() => setSegment('todo')}>
          📋 Todo ({filtered.length})
        </button>
        <button className={segment === 'pedido' ? 'tab active' : 'tab'} onClick={() => setSegment('pedido')}>
          📦 Pedidos ({countT('pedido')})
        </button>
        <button className={segment === 'daño' ? 'tab active' : 'tab'} onClick={() => setSegment('daño')}>
          ⚠️ Daños ({countT('daño')})
        </button>
      </div>

      <div className="legend">
        <span className="legend-item row-urgente">Urgente</span>
        <span className="legend-item row-alta">Alta</span>
        <span className="legend-item row-normal">Normal</span>
      </div>

      {error && <p className="error">Error al cargar: {error} — ¿Configuraste la URL en config.js?</p>}
      {loading && <p className="muted">Cargando historial...</p>}
      {!loading && !error && filtered.length === 0 && <p className="muted">No hay registros que coincidan.</p>}

      {!loading && !error && visibles.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tipo</th>
                <th>Artículo</th>
                <th>Cantidad</th>
                <th>Zona</th>
                <th>Urgencia</th>
                <th>Nota</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((o, i) => (
                <tr key={i} className={claseUrgencia(o.urgencia)}>
                  <td>{o.id}</td>
                  <td>{o.tipo}</td>
                  <td>{o.articulo || '—'}</td>
                  <td>{o.cantidad || '—'}</td>
                  <td>{o.zona || '—'}</td>
                  <td>
                    <span className={`badge urgencia-${(o.urgencia || 'normal').toLowerCase()}`}>{o.urgencia || 'normal'}</span>
                  </td>
                  <td>{o.nota || '—'}</td>
                  <td>{new Date(o.fecha_hora).toLocaleString('es-MX')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
