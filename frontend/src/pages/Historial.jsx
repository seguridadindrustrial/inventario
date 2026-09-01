import React, { useEffect, useState, useMemo } from 'react';
import { listarHistorial, getUser } from '../api';

export default function Historial() {
  const user = getUser();
  const [segment, setSegment] = useState('pedidos');
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
      const d = new Date(it.fecha);
      return d >= from && d <= to;
    });

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter((it) => {
        const text = it.tipo === 'pedido'
          ? `${(it.productos || []).map((p) => p.producto).join(' ')} ${it.destino} ${it.urgencia} ${it.notas || ''}`
          : `${it.objeto} ${it.descripcion}`;
        return text.toLowerCase().includes(s);
      });
    }
    return result;
  }

  const filtered = useMemo(() => applyFilters(all), [all, filter, fechaDesde, fechaHasta, search]);

  const pedidos = filtered.filter((r) => r.tipo === 'pedido');
  const reportes = filtered.filter((r) => r.tipo === 'reporte');

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
        <button className={segment === 'pedidos' ? 'tab active' : 'tab'} onClick={() => setSegment('pedidos')}>
          📋 Pedidos ({pedidos.length})
        </button>
        <button className={segment === 'reportes' ? 'tab active' : 'tab'} onClick={() => setSegment('reportes')}>
          ⚠️ Reportes ({reportes.length})
        </button>
      </div>

      {error && <p className="error">Error al cargar: {error} — ¿Configuraste la URL en config.js?</p>}
      {loading && <p className="muted">Cargando historial...</p>}
      {!loading && !error && filtered.length === 0 && <p className="muted">No hay registros que coincidan.</p>}

      {segment === 'pedidos' && pedidos.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Productos</th>
                <th>Destino</th>
                <th>Urgencia</th>
                <th>Notas</th>
                <th>Quién</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>
                    <ul className="mini-list">
                      {(o.productos || []).map((p, i) => (
                        <li key={i}>{p.producto} <b>x{p.cantidad}</b></li>
                      ))}
                    </ul>
                  </td>
                  <td>{o.destino}</td>
                  <td>
                    <span className={`badge urgencia-${o.urgencia || 'normal'}`}>{o.urgencia || 'normal'}</span>
                  </td>
                  <td>{o.notas || '—'}</td>
                  <td>{o.usuario || '—'}</td>
                  <td>{new Date(o.fecha).toLocaleString('es-MX')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {segment === 'reportes' && reportes.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Objeto</th>
                <th>Descripción</th>
                <th>Foto</th>
                <th>Quién</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {reportes.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.objeto}</td>
                  <td>{r.descripcion}</td>
                  <td>
                    {r.foto ? (
                      <a href={`data:image/jpeg;base64,${r.foto}`} target="_blank" rel="noreferrer">Ver foto</a>
                    ) : '—'}
                  </td>
                  <td>{r.usuario || '—'}</td>
                  <td>{new Date(r.fecha).toLocaleString('es-MX')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}