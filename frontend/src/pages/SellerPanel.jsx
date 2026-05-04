import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AlertTriangle, Clock, ShoppingCart, PlusCircle } from 'lucide-react';

const SellerPanel = () => {
  const [productos, setProductos] = useState([]);
  const [alertas, setAlertas] = useState({ bajoStock: [], porVencer: [] });
  const [ventaForm, setVentaForm] = useState({ producto_id: '', cantidad: 1 });
  const [msgVenta, setMsgVenta] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [prodRes, alertRes] = await Promise.all([
        api.get('/productos'),
        api.get('/alertas')
      ]);
      setProductos(prodRes.data);
      setAlertas(alertRes.data);
    } catch (error) {
      if(error.response?.status === 401 || error.response?.status === 403) {
        localStorage.clear();
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVenta = async (e) => {
    e.preventDefault();
    try {
      await api.post('/ventas', ventaForm);
      setMsgVenta('Venta registrada exitosamente');
      setVentaForm({ producto_id: '', cantidad: 1 });
      fetchData(); 
      setTimeout(() => setMsgVenta(''), 3000);
    } catch (error) {
      setMsgVenta(error.response?.data?.message || 'Error al registrar venta');
      setTimeout(() => setMsgVenta(''), 3000);
    }
  };

  return (
    <div className="grid">
      <div className="main-content">
        <div className="panel">
          <h2 className="panel-title" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <ShoppingCart size={20} />
            Inventario de Productos
          </h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Stock</th>
                  <th>Vencimiento</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p => {
                  const isLowStock = p.stock < 5;
                  const isExpiring = new Date(p.fecha_vencimiento) < new Date(Date.now() + 30*24*60*60*1000);
                  return (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td style={{fontWeight: '500'}}>{p.nombre}</td>
                      <td>
                        <span className={`badge ${isLowStock ? 'badge-danger' : 'badge-success'}`}>
                          {p.stock} un.
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isExpiring ? 'badge-warning' : ''}`} style={!isExpiring ? {backgroundColor: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border)'} : {}}>
                          {new Date(p.fecha_vencimiento).toLocaleDateString()}
                        </span>
                      </td>
                      <td>S/ {Number(p.precio).toFixed(2)}</td>
                    </tr>
                  );
                })}
                {productos.length === 0 && (
                  <tr><td colSpan="5" style={{textAlign: 'center', color: 'var(--text-muted)'}}>No hay productos en inventario</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="sidebar">
        <div className="panel" style={{marginBottom: '1.5rem'}}>
          <h2 className="panel-title" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)'}}>
            <PlusCircle size={20} />
            Registrar Venta
          </h2>
          {msgVenta && <div style={{marginBottom: '1rem', padding: '0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem', backgroundColor: msgVenta.includes('Error') ? '#FEE2E2' : '#D1FAE5', color: msgVenta.includes('Error') ? 'var(--danger)' : 'var(--success)'}}>{msgVenta}</div>}
          <form onSubmit={handleVenta}>
            <div className="form-group">
              <label className="form-label">Producto</label>
              <select className="form-input" value={ventaForm.producto_id} onChange={(e) => setVentaForm({...ventaForm, producto_id: e.target.value})} required>
                <option value="">Seleccione...</option>
                {productos.filter(p => p.stock > 0).map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} (S/ {p.precio})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cantidad</label>
              <input type="number" min="1" className="form-input" value={ventaForm.cantidad} onChange={(e) => setVentaForm({...ventaForm, cantidad: parseInt(e.target.value) || ''})} required />
            </div>
            <button type="submit" className="btn">Procesar Venta</button>
          </form>
        </div>

        <div className="panel" style={{border: '1px solid #FEE2E2', backgroundColor: '#FEF2F2'}}>
          <h2 className="panel-title" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991B1B', borderBottomColor: '#FECACA'}}>
            <AlertTriangle size={20} />
            Alertas del Sistema
          </h2>
          {alertas.bajoStock.length === 0 && alertas.porVencer.length === 0 && (
             <p style={{fontSize: '0.875rem', color: 'var(--text-muted)'}}>No hay alertas pendientes.</p>
          )}
          {alertas.bajoStock.map(p => (
            <div key={`stock-${p.id}`} className="alert-item danger">
              <AlertTriangle size={16} />
              <span><strong>{p.nombre}</strong>: ¡Bajo stock! ({p.stock} un.)</span>
            </div>
          ))}
          {alertas.porVencer.map(p => (
            <div key={`venc-${p.id}`} className="alert-item warning">
              <Clock size={16} />
              <span><strong>{p.nombre}</strong>: Vence pronto ({new Date(p.fecha_vencimiento).toLocaleDateString()})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SellerPanel;
