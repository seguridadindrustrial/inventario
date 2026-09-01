import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../api';

export default function Layout() {
  const user = getUser();
  const navigate = useNavigate();

  function logout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">📦 Inventario</div>
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
            Nuevo
          </NavLink>
          <NavLink to="/historial" className={({ isActive }) => (isActive ? 'active' : '')}>
            Historial
          </NavLink>
        </div>
        <div className="user-area">
          <span className="user-name">{user?.role === 'admin' ? 'Administrador' : 'Usuario'}</span>
          {user?.role === 'admin' && <span className="badge-admin">Admin</span>}
          <button className="btn-logout" onClick={logout}>Salir</button>
        </div>
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
