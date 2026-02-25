import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "./logo.svg";

import "./styles/base.css";
import "./styles/registro.css";
import { buildApiUrl } from "./services/apiConfig";

function Registro() {
  const navigate = useNavigate();

  /*
    Controlled Components (Componentes controlados):
    - Definicion: el valor de cada input vive en el estado de React.
    - Como se logra: se usa value={formData.campo} + onChange={handleChange}.
    - Por que aqui: validacion, mensajes de error y envio confiable de datos.
    - Resultado: React controla el formulario y evita leer valores directo del DOM.
  */
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    direccion: "",
    fecha_nacimiento: "",
    id_rol: 3,
    id_tipo_identificacion: "",
    numero_identificacion: ""
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    // Controlled Components: el onChange actualiza el estado con el id del input
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    const {
      nombre,
      apellido,
      email,
      password,
      direccion,
      fecha_nacimiento,
      id_tipo_identificacion,
      numero_identificacion
    } = formData;

    if (
      !nombre ||
      !apellido ||
      !email ||
      !password ||
      !direccion ||
      !fecha_nacimiento ||
      !id_tipo_identificacion ||
      !numero_identificacion
    ) {
      setMessage("Por favor completa todos los campos");
      setMessageType("error");
      setLoading(false);
      return;
    }

    const nacimiento = new Date(fecha_nacimiento);
    const hoy = new Date();
    const edad = hoy.getFullYear() - nacimiento.getFullYear();

    if (edad < 10) {
      setMessage("Debes tener al menos 10 anos para registrarte");
      setMessageType("error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(buildApiUrl("/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Error al registrar");
        setMessageType("error");
        setLoading(false);
        return;
      }

      setMessage(data.message || "Registro exitoso. Revisa tu correo para el codigo.");
      setMessageType("success");

      setTimeout(() => {
        navigate(`/verificar?email=${encodeURIComponent(formData.email)}`);
      }, 800);
    } catch (err) {
      console.error("ERROR FETCH:", err);
      setMessage("Error al conectar con el servidor");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header>
        <div className="header-container">
          <div className="logo-section">
            <img src={logo} alt="Logo" className="logo-img" />
            <h1 className="portal-title">Portal 2</h1>
          </div>

          <nav className="nav-links">
            <Link to="/" className="nav-btn">Inicio</Link>
            <Link to="/login" className="nav-btn">Iniciar Sesion</Link>
            <Link to="/registro" className="nav-btn">Registrate</Link>
          </nav>
        </div>
      </header>

      <main>
        <div className="form-container">
          <h2>Registrarse</h2>

          {message && <div className={`message ${messageType}`}>{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              {/* Controlled Component: value toma el dato del estado */}
              <input
                type="text"
                id="nombre"
                value={formData.nombre}
                onChange={handleChange} // onChange actualiza el estado
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="apellido">Apellido</label>
              {/* Controlled Component: value toma el dato del estado */}
              <input
                type="text"
                id="apellido"
                value={formData.apellido}
                onChange={handleChange} // onChange actualiza el estado
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="id_tipo_identificacion">Tipo de identificacion</label>
              {/* Controlled Component: select controlado por estado */}
              <select
                id="id_tipo_identificacion"
                value={formData.id_tipo_identificacion}
                onChange={handleChange} // onChange actualiza el estado
                required
              >
                <option value="">Seleccione...</option>
                <option value="1">Cedula de ciudadania</option>
                <option value="2">Tarjeta de identidad</option>
                <option value="3">Cedula de extranjeria</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="numero_identificacion">Numero de identificacion</label>
              {/* Controlled Component: value toma el dato del estado */}
              <input
                type="text"
                id="numero_identificacion"
                value={formData.numero_identificacion}
                onChange={handleChange} // onChange actualiza el estado
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
              {/* Controlled Component: value toma el dato del estado */}
              <input
                type="date"
                id="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange} // onChange actualiza el estado
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electronico</label>
              {/* Controlled Component: value toma el dato del estado */}
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange} // onChange actualiza el estado
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="direccion">Direccion</label>
              {/* Controlled Component: value toma el dato del estado */}
              <input
                type="text"
                id="direccion"
                value={formData.direccion}
                onChange={handleChange} // onChange actualiza el estado
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contrasena</label>
              {/* Controlled Component: value toma el dato del estado */}
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange} // onChange actualiza el estado
                required
              />
            </div>

            {/* Nota: id_rol se mantiene fijo en el estado (id_rol: 3) */}
            <input type="hidden" id="id_rol" value={3} />

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Registrando..." : "Enviar"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

export default Registro;

