import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { formatPrice } from '../services/productData';
import { getInventoryProducts, registerInventoryMovement } from '../services/inventarioService';
import { resolveImageUrl, FALLBACK_IMAGE } from '../services/imageUtils';
import '../styles/Lista_productos.css';

const ModalMovimiento = ({ producto, onCerrar, onGuardar }) => {
  const [cantidad, setCantidad] = useState('');
  const [tipo, setTipo] = useState('ENTRADA');
  const [documento, setDocumento] = useState('');
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const numCantidad = parseInt(cantidad, 10);
    if (Number.isNaN(numCantidad) || numCantidad <= 0) {
      setError('La cantidad debe ser un numero positivo.');
      return;
    }

    if (tipo === 'SALIDA' && numCantidad > producto.stock) {
      setError(`Stock insuficiente. Disponible: ${producto.stock}.`);
      return;
    }

    if (!documento.trim()) {
      setError('Debe especificar un numero/codigo de documento.');
      return;
    }

    onGuardar({
      id_producto: producto.id,
      tipo_movimiento: tipo,
      cantidad: numCantidad,
      id_documento: documento.trim(),
      comentario: comentario.trim(),
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <header className="modal-header">
          <h2>
            Registrar {tipo === 'ENTRADA' ? 'Entrada' : 'Salida'} - {producto.nombre}
          </h2>
          <button onClick={onCerrar} className="close-modal-btn">
            X
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Tipo de Movimiento</label>
              <select
                value={tipo}
                onChange={(e) => {
                  setTipo(e.target.value);
                  setError(null);
                }}
                className="input"
                required
              >
                <option value="ENTRADA">Entrada / Recepcion de mercancia</option>
                <option value="SALIDA">Salida / Ajuste negativo</option>
              </select>
            </div>

            <div className="form-group">
              <label>Cantidad</label>
              <input
                type="number"
                value={cantidad}
                onChange={(e) => {
                  setCantidad(e.target.value);
                  setError(null);
                }}
                className="input"
                min="1"
                required
              />
              <small className="help-text" style={{ fontWeight: 'bold' }}>
                Stock actual:{' '}
                <span
                  style={{
                    color: producto.stock > 10 ? 'green' : producto.stock > 0 ? 'orange' : 'red',
                  }}
                >
                  {producto.stock}
                </span>
              </small>
            </div>

            <div className="form-group">
              <label>Doc. de Referencia (Factura #, Acta #)</label>
              <input
                type="text"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                className="input"
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Comentario (motivo)</label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="input"
                rows="2"
              />
            </div>
          </div>

          {error && (
            <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <footer className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className={`btn ${tipo === 'ENTRADA' ? 'btn-primary' : 'btn-danger'}`}>
              Registrar {tipo}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default function RegistroMovimientos() {
  const { token, logout } = useAuthContext();
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [toast, setToast] = useState(null);

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUnauthorized = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getInventoryProducts(token);
      setProductos(data);
    } catch (err) {
      if (err.code === 'UNAUTHORIZED_ACCESS' || err.status === 401 || err.status === 403) {
        handleUnauthorized();
        return;
      }

      setError(`Error al cargar la lista de productos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [token, handleUnauthorized]);

  useEffect(() => {
    if (token) {
      fetchProductos();
    }
  }, [token, fetchProductos]);

  const handleGuardarMovimiento = async (movimientoData) => {
    setProductoSeleccionado(null);
    setLoading(true);

    try {
      const result = await registerInventoryMovement(token, movimientoData);
      mostrarToast(result.message || 'Movimiento registrado correctamente.', 'success');
      await fetchProductos();
    } catch (err) {
      if (err.code === 'UNAUTHORIZED_ACCESS' || err.status === 401 || err.status === 403) {
        handleUnauthorized();
        return;
      }

      setError(`Fallo al registrar el movimiento: ${err.message}`);
      mostrarToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = useMemo(() => {
    const lowerCaseFiltro = filtroNombre.toLowerCase();

    if (!lowerCaseFiltro) {
      return productos;
    }

    return productos.filter((p) => {
      const nombre = String(p.nombre || '').toLowerCase();
      const categoria = String(p.categoria || '').toLowerCase();
      const id = String(p.id || '').toLowerCase();
      return nombre.includes(lowerCaseFiltro) || categoria.includes(lowerCaseFiltro) || id.includes(lowerCaseFiltro);
    });
  }, [productos, filtroNombre]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Registro de Inventario (Entradas y Salidas)</h1>
        <p>Modulo para registrar ajustes, recepciones o perdidas de inventario.</p>
        <button className="btn green" onClick={() => navigate('/usuarioC')}>
          Volver al Dashboard
        </button>
      </header>

      <main className="dashboard-content">
        <section className="card full-width">
          <header className="card-header">
            <h2>Lista de Productos y Stock</h2>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Buscar producto, ID o categoria..."
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
                className="input"
              />
            </div>
          </header>

          <div className="card-body table-responsive">
            {loading ? (
              <p style={{ textAlign: 'center' }}>Cargando productos...</p>
            ) : error ? (
              <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>
                {error}
              </p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Categoria</th>
                    <th>Precio Venta</th>
                    <th>Stock Actual</th>
                    <th>Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.length > 0 ? (
                    productosFiltrados.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>
                          <img
                            src={resolveImageUrl(p.imagen)}
                            alt={p.nombre}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = FALLBACK_IMAGE;
                            }}
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                        </td>
                        <td>{p.nombre}</td>
                        <td>{p.categoria}</td>
                        <td>{formatPrice(Number(p.precio))}</td>
                        <td
                          style={{
                            fontWeight: 'bold',
                            color: p.stock > 10 ? 'green' : p.stock > 0 ? 'orange' : 'red',
                          }}
                        >
                          {p.stock}
                        </td>
                        <td>
                          <button className="btn btn-primary btn-sm" onClick={() => setProductoSeleccionado(p)}>
                            Registrar Movimiento
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center' }}>
                        No se encontraron productos.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      {productoSeleccionado && (
        <ModalMovimiento
          producto={productoSeleccionado}
          onCerrar={() => setProductoSeleccionado(null)}
          onGuardar={handleGuardarMovimiento}
        />
      )}

      {toast && (
        <div
          className={`toast-notification ${toast.tipo}`}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '10px 20px',
            borderRadius: '8px',
            backgroundColor: toast.tipo === 'success' ? '#198754' : '#dc3545',
            color: 'white',
            zIndex: 1000,
          }}
        >
          {toast.mensaje}
        </div>
      )}
    </div>
  );
}
