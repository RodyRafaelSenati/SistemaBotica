import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, UserCircle } from 'lucide-react';
import SellerPanel from './SellerPanel';
import AdminPanel from './AdminPanel';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="container">
      <header className="dashboard-header">
        <div>
          <h1 style={{fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)'}}>
            Dashboard Botica - Panel {user.rol === 'admin' ? 'Administrativo' : 'de Vendedor'}
          </h1>
          <p style={{color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <UserCircle size={16} />
            {user.username} ({user.rol})
          </p>
        </div>
        <button onClick={handleLogout} className="btn btn-logout" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </header>
      
      {user.rol === 'admin' ? <AdminPanel /> : <SellerPanel />}
    </div>
  );
};

export default Dashboard;
