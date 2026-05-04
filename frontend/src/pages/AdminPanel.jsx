import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Users, PackagePlus, AlertTriangle, Clock, ListOrdered, Edit, Trash2, Unlock, TrendingUp, DollarSign, Activity, ShoppingBag } from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('metricas'); // 'metricas', 'abastecer', 'inventario', 'usuarios'
  
  const [userForm, setUserForm] = useState({ username: '', password: '', rol: 'vendedor' });
  const [prodForm, setProdForm] = useState({ nombre: '', stock: 0, fecha_vencimiento: '', precio: 0, costo: 0 });
  const [stockForm, setStockForm] = useState({ id: '', stock: 0 });
  const [editProdForm, setEditProdForm] = useState(null);

  const [productos, setProductos] = useState([]);
  const [alertas, setAlertas] = useState({ bajoStock: [], porVencer: [] });
  const [usuariosList, setUsuariosList] = useState([]);
  const [stats, setStats] = useState({ metrics: {}, topVendidos: [], menosVendidos: [] });
  
  const [msgGlobal, setMsgGlobal] = useState('');

  const showMsg = (msg) => {
    setMsgGlobal(msg);
    setTimeout(() => setMsgGlobal(''), 3000);
  };

  const fetchData = async () => {
    try {
      const [prodRes, alertRes] = await Promise.all([
        api.get('/productos'),
        api.get('/alertas')
      ]);
      setProductos(prodRes.data);
      setAlertas(alertRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsuariosList(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/estadisticas');
      setStats(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
    if (activeTab === 'usuarios') fetchUsers();
    if (activeTab === 'metricas') fetchStats();
  }, [activeTab]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/usuarios', userForm);
      showMsg('Usuario creado correctamente');
      setUserForm({ username: '', password: '', rol: 'vendedor' });
      fetchUsers();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Error al crear usuario');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/productos', prodForm);
      showMsg('Producto creado correctamente');
      setProdForm({ nombre: '', stock: 0, fecha_vencimiento: '', precio: 0, costo: 0 });
      fetchData();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Error al crear producto');
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/stock/${stockForm.id}/add`, { stock: stockForm.stock });
      showMsg('Stock abastecido correctamente');
      setStockForm({ id: '', stock: 0 });
      fetchData();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Error al abastecer stock');
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/productos/${editProdForm.id}/edit`, {
        nombre: editProdForm.nombre,
        precio: editProdForm.precio,
        costo: editProdForm.costo,
        fecha_vencimiento: editProdForm.fecha_vencimiento
      });
      showMsg('Producto editado correctamente');
      setEditProdForm(null);
      fetchData();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Error al editar producto');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Estás seguro de borrar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      showMsg('Producto borrado exitosamente');
      fetchData();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Error al borrar producto');
    }
  };

  const handleUnlockUser = async (id) => {
    try {
      await api.put(`/usuarios/${id}/unlock`);
      showMsg('Usuario desbloqueado');
      fetchUsers();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Error al desbloquear');
    }
  };

  return (
    <div>
      <div className="tabs" style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem', overflowX: 'auto'}}>
        <button className={`tab-btn ${activeTab === 'metricas' ? 'active' : ''}`} onClick={() => setActiveTab('metricas')}>
          <TrendingUp size={18} /> Métricas
        </button>
        <button className={`tab-btn ${activeTab === 'abastecer' ? 'active' : ''}`} onClick={() => setActiveTab('abastecer')}>
          <PackagePlus size={18} /> Abastecer
        </button>
        <button className={`tab-btn ${activeTab === 'inventario' ? 'active' : ''}`} onClick={() => setActiveTab('inventario')}>
          <ListOrdered size={18} /> Editar Inventario
        </button>
        <button className={`tab-btn ${activeTab === 'usuarios' ? 'active' : ''}`} onClick={() => setActiveTab('usuarios')}>
          <Users size={18} /> Control de Usuarios
        </button>
      </div>

      {msgGlobal && <div style={{marginBottom: '1rem', padding: '1rem', borderRadius: '0.5rem', fontWeight: '500', backgroundColor: msgGlobal.includes('Error') ? '#FEE2E2' : '#D1FAE5', color: msgGlobal.includes('Error') ? 'var(--danger)' : 'var(--success)'}}>{msgGlobal}</div>}

      {/* TAB: METRICAS */}
      {activeTab === 'metricas' && (
        <div className="dashboard-stats">
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem'}}>
            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#E0E7FF', color: '#4338CA'}}><DollarSign size={24} /></div>
              <div className="stat-info">
                <h4>Ingresos del Mes</h4>
                <p>S/ {Number(stats.metrics.ingresos || 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#D1FAE5', color: '#059669'}}><TrendingUp size={24} /></div>
              <div className="stat-info">
                <h4>Utilidad Neta</h4>
                <p>S/ {Number(stats.metrics.ganancias || 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#FEF3C7', color: '#D97706'}}><ShoppingBag size={24} /></div>
              <div className="stat-info">
                <h4>Ventas Totales</h4>
                <p>{stats.metrics.total_ventas || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#FEE2E2', color: '#DC2626'}}><AlertTriangle size={24} /></div>
              <div className="stat-info">
                <h4>Productos Críticos</h4>
                <p>{stats.metrics.productos_criticos || 0}</p>
              </div>
            </div>
          </div>

          <div className="grid">
            <div className="panel">
              <h2 className="panel-title" style={{color: 'var(--success)'}}>Top 5 Más Vendidos</h2>
              <div className="ranking-list">
                {stats.topVendidos.map((item, index) => {
                  const maxSold = Math.max(...stats.topVendidos.map(i => i.unidades_vendidas), 1);
                  const percentage = (item.unidades_vendidas / maxSold) * 100;
                  return (
                    <div key={index} className="ranking-item">
                      <div className="ranking-header">
                        <span>{index + 1}. {item.nombre}</span>
                        <span style={{fontWeight: '600'}}>{item.unidades_vendidas} un.</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{width: `${percentage}%`, backgroundColor: 'var(--success)'}}></div>
                      </div>
                    </div>
                  );
                })}
                {stats.topVendidos.length === 0 && <p style={{color: 'var(--text-muted)'}}>No hay ventas registradas.</p>}
              </div>
            </div>
            
            <div className="panel">
              <h2 className="panel-title" style={{color: 'var(--danger)'}}>Top 5 Menos Vendidos</h2>
              <div className="ranking-list">
                {stats.menosVendidos.map((item, index) => {
                  const maxSold = Math.max(...stats.menosVendidos.map(i => i.unidades_vendidas), 1);
                  const percentage = maxSold > 0 ? (item.unidades_vendidas / maxSold) * 100 : 0;
                  return (
                    <div key={index} className="ranking-item">
                      <div className="ranking-header">
                        <span>{item.nombre}</span>
                        <span style={{fontWeight: '600'}}>{item.unidades_vendidas} un.</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{width: `${percentage}%`, backgroundColor: 'var(--danger)'}}></div>
                      </div>
                    </div>
                  );
                })}
                {stats.menosVendidos.length === 0 && <p style={{color: 'var(--text-muted)'}}>No hay productos suficientes.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ABASTECER */}
      {activeTab === 'abastecer' && (
        <div className="grid">
          <div className="main-content">
            <div className="panel" style={{marginBottom: '2rem'}}>
              <h2 className="panel-title" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <PackagePlus size={20} />
                Abastecer Inventario
              </h2>
              
              <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
                {/* Form to Create Product */}
                <form onSubmit={handleCreateProduct} style={{flex: 1, minWidth: '300px', padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem'}}>
                  <h3 style={{marginBottom: '1rem', fontSize: '1rem', color: 'var(--primary)'}}>Crear Nuevo Producto</h3>
                  <div className="form-group">
                    <label className="form-label">Nombre</label>
                    <input type="text" className="form-input" value={prodForm.nombre} onChange={e => setProdForm({...prodForm, nombre: e.target.value})} required />
                  </div>
                  <div style={{display: 'flex', gap: '1rem'}}>
                    <div className="form-group" style={{flex: 1}}>
                      <label className="form-label">Costo Compra (S/)</label>
                      <input type="number" step="0.01" min="0" className="form-input" value={prodForm.costo} onChange={e => setProdForm({...prodForm, costo: parseFloat(e.target.value) || 0})} required />
                    </div>
                    <div className="form-group" style={{flex: 1}}>
                      <label className="form-label">Precio Venta (S/)</label>
                      <input type="number" step="0.01" min="0" className="form-input" value={prodForm.precio} onChange={e => setProdForm({...prodForm, precio: parseFloat(e.target.value) || 0})} required />
                    </div>
                  </div>
                  <div style={{display: 'flex', gap: '1rem'}}>
                    <div className="form-group" style={{flex: 1}}>
                      <label className="form-label">Stock Inicial</label>
                      <input type="number" min="0" className="form-input" value={prodForm.stock} onChange={e => setProdForm({...prodForm, stock: parseInt(e.target.value) || 0})} required />
                    </div>
                    <div className="form-group" style={{flex: 2}}>
                      <label className="form-label">Fecha Vencimiento</label>
                      <input type="date" className="form-input" value={prodForm.fecha_vencimiento} onChange={e => setProdForm({...prodForm, fecha_vencimiento: e.target.value})} required />
                    </div>
                  </div>
                  <button type="submit" className="btn" style={{backgroundColor: 'var(--success)'}}>Registrar Producto</button>
                </form>

                {/* Form to Add Stock */}
                <form onSubmit={handleAddStock} style={{flex: 1, minWidth: '300px', padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem'}}>
                  <h3 style={{marginBottom: '1rem', fontSize: '1rem', color: 'var(--primary)'}}>Añadir Stock Existente</h3>
                  <div className="form-group">
                    <label className="form-label">Producto</label>
                    <select className="form-input" value={stockForm.id} onChange={e => setStockForm({...stockForm, id: e.target.value})} required>
                      <option value="">Seleccione producto...</option>
                      {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} (Stock actual: {p.stock})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cantidad a Añadir</label>
                    <input type="number" min="1" className="form-input" value={stockForm.stock} onChange={e => setStockForm({...stockForm, stock: parseInt(e.target.value) || ''})} required />
                  </div>
                  <button type="submit" className="btn">Actualizar Stock</button>
                </form>
              </div>
            </div>
          </div>

          <div className="sidebar">
            <div className="panel" style={{border: '1px solid #FEE2E2', backgroundColor: '#FEF2F2'}}>
              <h2 className="panel-title" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991B1B', borderBottomColor: '#FECACA'}}>
                <AlertTriangle size={20} />
                Monitoreo de Alertas
              </h2>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <div>
                  <h4 style={{marginBottom: '0.5rem', color: '#991B1B', fontSize: '0.875rem'}}>Bajo Stock</h4>
                  {alertas.bajoStock.length === 0 && <p style={{fontSize: '0.875rem'}}>Ninguno.</p>}
                  {alertas.bajoStock.map(p => (
                    <div key={`s-${p.id}`} className="alert-item danger" style={{padding: '0.5rem', marginBottom: '0.5rem'}}>
                      <AlertTriangle size={14} /> <strong>{p.nombre}</strong> ({p.stock} un.)
                    </div>
                  ))}
                </div>
                <div>
                  <h4 style={{marginBottom: '0.5rem', color: '#92400E', fontSize: '0.875rem'}}>Por Vencer</h4>
                  {alertas.porVencer.length === 0 && <p style={{fontSize: '0.875rem'}}>Ninguno.</p>}
                  {alertas.porVencer.map(p => (
                    <div key={`v-${p.id}`} className="alert-item warning" style={{padding: '0.5rem', marginBottom: '0.5rem'}}>
                      <Clock size={14} /> <strong>{p.nombre}</strong> ({new Date(p.fecha_vencimiento).toLocaleDateString()})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: INVENTARIO */}
      {activeTab === 'inventario' && (
        <div className="panel">
          <h2 className="panel-title">Gestión de Inventario (Editar/Borrar)</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Stock</th>
                  <th>Vencimiento</th>
                  <th>Costo (S/)</th>
                  <th>Precio (S/)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    {editProdForm && editProdForm.id === p.id ? (
                      <>
                        <td><input type="text" className="form-input" style={{padding: '0.25rem', fontSize: '0.875rem'}} value={editProdForm.nombre} onChange={e => setEditProdForm({...editProdForm, nombre: e.target.value})} /></td>
                        <td>{p.stock} un.</td>
                        <td><input type="date" className="form-input" style={{padding: '0.25rem', fontSize: '0.875rem'}} value={editProdForm.fecha_vencimiento} onChange={e => setEditProdForm({...editProdForm, fecha_vencimiento: e.target.value})} /></td>
                        <td><input type="number" step="0.01" className="form-input" style={{padding: '0.25rem', fontSize: '0.875rem', width: '80px'}} value={editProdForm.costo} onChange={e => setEditProdForm({...editProdForm, costo: parseFloat(e.target.value)})} /></td>
                        <td><input type="number" step="0.01" className="form-input" style={{padding: '0.25rem', fontSize: '0.875rem', width: '80px'}} value={editProdForm.precio} onChange={e => setEditProdForm({...editProdForm, precio: parseFloat(e.target.value)})} /></td>
                        <td>
                          <button className="btn" style={{padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginRight: '0.5rem', backgroundColor: 'var(--success)'}} onClick={handleEditProduct}>Guardar</button>
                          <button className="btn" style={{padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--text-muted)'}} onClick={() => setEditProdForm(null)}>Cancelar</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{fontWeight: '500'}}>{p.nombre}</td>
                        <td>{p.stock} un.</td>
                        <td>{new Date(p.fecha_vencimiento).toLocaleDateString()}</td>
                        <td>S/ {Number(p.costo).toFixed(2)}</td>
                        <td>S/ {Number(p.precio).toFixed(2)}</td>
                        <td>
                          <button title="Editar" className="btn-icon" onClick={() => setEditProdForm({id: p.id, nombre: p.nombre, fecha_vencimiento: p.fecha_vencimiento.split('T')[0], precio: p.precio, costo: p.costo})} style={{color: 'var(--primary)', marginRight: '1rem', background: 'none', border: 'none', cursor: 'pointer'}}><Edit size={18} /></button>
                          <button title="Borrar" className="btn-icon" onClick={() => handleDeleteProduct(p.id)} style={{color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer'}}><Trash2 size={18} /></button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: USUARIOS */}
      {activeTab === 'usuarios' && (
        <div className="grid">
          <div className="main-content">
            <div className="panel">
              <h2 className="panel-title">Lista de Usuarios</h2>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Rol</th>
                      <th>Intentos Fallidos</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosList.map(u => (
                      <tr key={u.id}>
                        <td>#{u.id}</td>
                        <td style={{fontWeight: '500'}}>{u.username}</td>
                        <td style={{textTransform: 'capitalize'}}>{u.rol}</td>
                        <td>{u.failed_attempts}</td>
                        <td>
                          {u.is_locked ? <span className="badge badge-danger">Bloqueado</span> : <span className="badge badge-success">Activo</span>}
                        </td>
                        <td>
                          {u.is_locked ? (
                            <button className="btn" style={{display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--success)'}} onClick={() => handleUnlockUser(u.id)}>
                              <Unlock size={14} /> Desbloquear
                            </button>
                          ) : <span style={{color: 'var(--text-muted)', fontSize: '0.75rem'}}>Sin acción</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="sidebar">
            <div className="panel">
              <h2 className="panel-title" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <Users size={20} />
                Crear Usuario
              </h2>
              <form onSubmit={handleCreateUser}>
                <div className="form-group">
                  <label className="form-label">Nombre de Usuario</label>
                  <input type="text" className="form-input" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input type="password" className="form-input" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Rol del Sistema</label>
                  <select className="form-input" value={userForm.rol} onChange={e => setUserForm({...userForm, rol: e.target.value})}>
                    <option value="vendedor">Vendedor / Técnico</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <button type="submit" className="btn">Registrar Usuario</button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
