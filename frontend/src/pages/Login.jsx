import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuth } from '../api';
import { ADMIN_PASSWORD, USER_PASSWORD } from '../config';

export default function Login() {
  const [role, setRole] = useState('user');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const ok = role === 'admin'
      ? password === ADMIN_PASSWORD
      : password === USER_PASSWORD;
    if (!ok) { setError('Contraseña incorrecta'); return; }
    const finalNombre = role === 'admin'
      ? (nombre.trim() || 'Administrador')
      : (nombre.trim() || 'Usuario');
    setAuth({ id: role, nombre: finalNombre, email: '', role });
    navigate('/');
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Inventario</h1>
        <p className="auth-sub">Sistema de Pedidos y Reportes</p>
        <form onSubmit={handleSubmit}>
          <div className="role-toggle">
            <button
              type="button"
              className={`role-btn ${role === 'user' ? 'active' : ''}`}
              onClick={() => setRole('user')}
            >
              Usuario
            </button>
            <button
              type="button"
              className={`role-btn ${role === 'admin' ? 'active' : ''}`}
              onClick={() => setRole('admin')}
            >
              Admin
            </button>
          </div>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder={role === 'admin' ? 'Tu nombre (opcional)' : 'Tu nombre'}
            required={role !== 'admin'}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={`Contraseña de ${role === 'admin' ? 'admin' : 'usuario'}`}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Entrar como {role === 'admin' ? 'Admin' : 'Usuario'}</button>
        </form>
      </div>
    </div>
  );
}