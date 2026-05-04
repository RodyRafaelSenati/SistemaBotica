import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, User, AlertCircle } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLocked(false);
    try {
      const response = await api.post('/login', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al iniciar sesión';
      setError(msg);
      if (msg.includes('bloqueada')) {
        setIsLocked(true);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
          <div style={{backgroundColor: isLocked ? 'var(--danger)' : 'var(--primary)', color: 'white', padding: '1rem', borderRadius: '50%', transition: 'background-color 0.3s'}}>
            {isLocked ? <AlertCircle size={32} /> : <Lock size={32} />}
          </div>
        </div>
        <h2 className="card-title">Sistema Botica</h2>
        {error && (
          <div style={{backgroundColor: '#FEE2E2', borderLeft: '4px solid var(--danger)', padding: '0.75rem', marginBottom: '1.5rem', borderRadius: '0.25rem'}}>
            <p style={{color: '#991B1B', fontSize: '0.875rem', margin: 0, fontWeight: '500'}}>{error}</p>
          </div>
        )}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <div style={{position: 'relative'}}>
              <User size={20} style={{position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)'}} />
              <input
                type="text"
                className="form-input"
                style={{paddingLeft: '2.5rem'}}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div style={{position: 'relative'}}>
              <Lock size={20} style={{position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)'}} />
              <input
                type="password"
                className="form-input"
                style={{paddingLeft: '2.5rem'}}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn" disabled={isLocked} style={isLocked ? {backgroundColor: 'var(--text-muted)', cursor: 'not-allowed'} : {}}>
            Ingresar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
