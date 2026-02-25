import React, { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { buildApiUrl } from '../services/apiConfig';
import { resolveImageUrl, FALLBACK_IMAGE } from '../services/imageUtils';
import '../styles/Lista_productos.css';

const PRODUCTS_URL = buildApiUrl('/productos');

const ModalAgregar = ({ onCerrar, onGuardar }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    id_categoria: '',
    id_proveedor: '',
    descripcion: '',
    estado: '',
    imagen: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar({
      ...formData,
      precio: parseFloat(formData.precio) || 0,
      id_categoria: Number(formData.id_categoria),
      id_proveedor: Number(formData.id_proveedor),
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Agregar Producto</h2>
        <form onSubmit={handleSubmit}>
          <label>Nombre:</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />

          <label>Precio:</label>
          <input type="number" name="precio" step="0.01" value={formData.precio} onChange={handleChange} required />

          <label>Categoria (ID):</label>
          <input type="number" name="id_categoria" value={formData.id_categoria} onChange={handleChange} required />

          <label>Proveedor (ID):</label>
          <input type="number" name="id_proveedor" value={formData.id_proveedor} onChange={handleChange} required />

          <label>Descripcion:</label>
          <textarea name="descripcion" rows="3" value={formData.descripcion} onChange={handleChange} />

          <label>Estado:</label>
          <input type="text" name="estado" value={formData.estado} onChange={handleChange} required />

          <label>Imagen (local, public/images/productos):</label>
          <input type="text" name="imagen" value={formData.imagen} onChange={handleChange} />

          <div className="modal-actions">
            <button type="submit" className="btn green">
              Agregar
            </button>
            <button type="button" onClick={onCerrar} className="btn red outline">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ModalEdicion = ({ producto, onCerrar, onGuardar }) => {
  const [formData, setFormData] = useState(producto);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar({
      ...formData,
      precio: parseFloat(formData.precio) || 0,
      id_categoria: Number(formData.id_categoria),
      id_proveedor: Number(formData.id_proveedor),
    });
  };

  if (!producto) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Editar Producto: {producto.nombre}</h2>
        <form onSubmit={handleSubmit}>
          <label>ID:</label>
          <input type="text" name="id_productos" value={formData.id_productos} disabled className="disabled-input" />

          <label>Nombre:</label>
          <input type="text" name="nombre" value={formData.nombre || ''} onChange={handleChange} required />

          <label>Precio:</label>
          <input type="number" name="precio" value={formData.precio || ''} onChange={handleChange} step="0.01" required />

          <label>Categoria (ID):</label>
          <input type="number" name="id_categoria" value={formData.id_categoria || ''} onChange={handleChange} required />

          <label>Proveedor (ID):</label>
          <input type="number" name="id_proveedor" value={formData.id_proveedor || ''} onChange={handleChange} required />

          <label>Descripcion:</label>
          <textarea name="descripcion" value={formData.descripcion || ''} onChange={handleChange} rows="3" />

          <label>Estado:</label>
          <input type="text" name="estado" value={formData.estado || ''} onChange={handleChange} required />

          <label>Imagen (local, public/images/productos):</label>
          <input type="text" name="imagen" value={formData.imagen || ''} onChange={handleChange} />

          <div className="modal-actions">
            <button type="submit" className="btn green">
              Guardar Cambios
            </button>
            <button type="button" onClick={onCerrar} className="btn red outline">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Lista_productos() {
  const { token, logout } = useAuthContext();

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productoEditando, setProductoEditando] = useState(null);
  const [modalAgregarVisible, setModalAgregarVisible] = useState(false);

  const authHeaders = useCallback(
    (includeJson = false) => ({
      ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token],
  );

  const handleUnauthorized = useCallback(() => {
    logout();
    alert('Sesion expirada. Inicia sesion nuevamente.');
    window.location.href = '/login';
  }, [logout]);

  const parseBody = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }

    const text = await response.text();
    return text ? { message: text } : {};
  };

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(PRODUCTS_URL, { headers: authHeaders() });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      const data = await parseBody(response);
      if (!response.ok) {
        setError(`Error al cargar la lista: ${data.error || data.message || response.statusText}`);
        return;
      }

      setProductos(Array.isArray(data) ? data : data.productos || []);
    } catch (_err) {
      setError('Error de conexion con el servidor.');
    } finally {
      setLoading(false);
    }
  }, [authHeaders, handleUnauthorized]);

  useEffect(() => {
    if (token) {
      fetchProductos();
    }
  }, [token, fetchProductos]);

  const handleDelete = async (id) => {
    if (!window.confirm(`Eliminar producto ID ${id}?`)) return;

    const idNumerico = parseInt(String(id).replace(/[^\d]/g, ''), 10);
    if (Number.isNaN(idNumerico)) {
      alert('Error: ID de producto no valido para la eliminacion.');
      return;
    }

    try {
      const response = await fetch(`${PRODUCTS_URL}/${idNumerico}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      const data = await parseBody(response);
      if (!response.ok) {
        alert(`Error al eliminar: ${data.error || data.message || response.statusText}`);
        return;
      }

      setProductos((prev) => prev.filter((p) => p.id_productos !== idNumerico));
      alert(`Producto ${id} eliminado.`);
    } catch (_err) {
      alert('Error de conexion.');
    }
  };

  const handleEdit = (id) => {
    const idNumerico = parseInt(String(id).replace(/[^\d]/g, ''), 10);
    const productoAEditar = productos.find((p) => p.id_productos === idNumerico);
    setProductoEditando(productoAEditar || null);
  };

  const handleCloseModal = () => {
    setProductoEditando(null);
    setModalAgregarVisible(false);
  };

  const handleUpdateSubmit = async (productoActualizado) => {
    const idNumerico = parseInt(String(productoActualizado.id_productos).replace(/[^\d]/g, ''), 10);
    if (Number.isNaN(idNumerico)) {
      alert('Error: ID de producto no valido para la actualizacion.');
      return;
    }

    try {
      const response = await fetch(`${PRODUCTS_URL}/${idNumerico}`, {
        method: 'PUT',
        headers: authHeaders(true),
        body: JSON.stringify(productoActualizado),
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      const data = await parseBody(response);
      if (!response.ok) {
        alert(`Error al actualizar: ${data.error || data.message || response.statusText}`);
        return;
      }

      setProductos((prev) =>
        prev.map((p) =>
          p.id_productos === idNumerico
            ? {
                ...p,
                ...productoActualizado,
              }
            : p,
        ),
      );

      handleCloseModal();
      alert(`Producto ${productoActualizado.id_productos} actualizado.`);
    } catch (_err) {
      alert('Error de conexion.');
    }
  };

  const handleAddSubmit = async (nuevoProducto) => {
    try {
      const response = await fetch(PRODUCTS_URL, {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify(nuevoProducto),
      });

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      const data = await parseBody(response);
      if (!response.ok) {
        alert(`Error al agregar: ${data.error || data.message || response.statusText}`);
        return;
      }

      alert('Producto agregado correctamente.');
      setModalAgregarVisible(false);
      fetchProductos();
    } catch (_err) {
      alert('Error de conexion.');
    }
  };

  return (
    <div className="entrada-page">
      <header className="top-bar">
        <div className="top-left">
          <div className="logo-wrap">
            <div className="logo-circle">M</div>
            <div className="brand">Mercapleno</div>
          </div>
        </div>
        <div className="top-right" />
      </header>

      <h1 className="page-title">Lista de Productos</h1>

      <main className="card-area">
        <section className="card list-card">
          <div className="table-container">
            <button
              className="btn green"
              style={{ marginBottom: '15px' }}
              onClick={() => setModalAgregarVisible(true)}
            >
              Agregar Producto
            </button>

            {loading && <p style={{ textAlign: 'center' }}>Cargando...</p>}
            {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

            {!loading && !error && (
              <table className="product-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Categoria</th>
                    <th>Proveedor</th>
                    <th>Descripcion</th>
                    <th>Estado</th>
                    <th>Imagen</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.length > 0 ? (
                    productos.map((p) => (
                      <tr key={p.id_productos}>
                        <td>{p.id_productos}</td>
                        <td>{p.nombre}</td>
                        <td>${p.precio}</td>
                        <td>{p.id_categoria}</td>
                        <td>{p.id_proveedor}</td>
                        <td>{p.descripcion}</td>
                        <td>{p.estado}</td>
                        <td className="img-cell">
                          <img
                            src={resolveImageUrl(p.imagen)}
                            alt={p.nombre}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = FALLBACK_IMAGE;
                            }}
                          />
                        </td>
                        <td className="action-cell">
                          <button onClick={() => handleDelete(p.id_productos)} className="btn small red">
                            Eliminar
                          </button>
                          <button onClick={() => handleEdit(p.id_productos)} className="btn small yellow">
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center' }}>
                        No se encontraron productos.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="card-footer">
            <button className="btn green" onClick={() => window.history.back()}>
              Volver
            </button>
          </div>
        </section>
      </main>

      {productoEditando && (
        <ModalEdicion producto={productoEditando} onCerrar={handleCloseModal} onGuardar={handleUpdateSubmit} />
      )}

      {modalAgregarVisible && (
        <ModalAgregar onCerrar={handleCloseModal} onGuardar={handleAddSubmit} />
      )}

      <footer className="site-footer">
        <div className="footer-inner">
          <div>2025 Portal 2 Todos los derechos reservados.</div>
          <div className="socials">WhatsApp - Facebook - Instagram</div>
        </div>
      </footer>
    </div>
  );
}
