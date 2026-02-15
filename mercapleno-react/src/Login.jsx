  // Controlled Components:
  // Definicion: el valor del input vive en el estado de React y se actualiza con onChange.
  // Por que: permite validacion, bloqueo y sincronizacion de datos antes de enviar.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./styles/base.css";
import "./styles/login.css";
import logo from "./logo.svg";
import { useAuthContext } from "./context/AuthContext";

function Login() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  /*
    Controlled Components (Componentes controlados):
    - Definicion: el valor de cada input vive en el estado de React.
    - Como se logra: se usa value={estado} + onChange={setEstado}.
    - Por que aqui: necesitamos validar, bloquear y enviar datos confiables
      (por ejemplo, deshabilitar email/password cuando se pide el codigo).
    - Resultado: React es la "fuente de verdad" del formulario, no el DOM (nterfaz de programación que permite a los navegadores interpretar y manipular las páginas web).
  */

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [requireCode, setRequireCode] = useState(false);
  const [expectedCode, setExpectedCode] = useState("");
  const [userToVerify, setUserToVerify] = useState(null);
  const [tokenToVerify, setTokenToVerify] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Se leen los valores desde el estado (email, password, securityCode),
    // no desde el DOM. Esto es propio de formularios controlados.
    setLoading(true);

    if (requireCode) {
      if (securityCode !== expectedCode) {
        alert("Codigo de seguridad incorrecto.");
        setLoading(false);
        return;
      }

      if (userToVerify && tokenToVerify) {
        login(userToVerify, tokenToVerify);
      } else {
        alert("Error: No se encontro la informacion del usuario para completar la sesion.");
        setLoading(false);
        return;
      }

      alert("Inicio de sesion exitoso");

      if (userToVerify.id_rol === 1 || userToVerify.id_rol === 2) {
        navigate("/usuarioC");
      } else {
        navigate("/catalogo");
      }

      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.code === "EMAIL_NOT_VERIFIED") {
          alert("Debes verificar tu correo antes de iniciar sesion.");
          navigate(`/verificar?email=${encodeURIComponent(email)}`);
        } else {
          alert(data.message || "Credenciales incorrectas");
          login(null, null);
        }
        setLoading(false);
        return;
      }

      if (!data.success) {
        alert(data.message || "Credenciales incorrectas");
        login(null, null);
        setLoading(false);
        return;
      }

      setUserToVerify(data.user);
      setTokenToVerify(data.token);

      if (data.user.id_rol === 1) {
        setRequireCode(true);
        setExpectedCode("123");
        alert("Este usuario es ADMIN. Ingrese el codigo de seguridad.");
      } else if (data.user.id_rol === 2) {
        setRequireCode(true);
        setExpectedCode("456");
        alert("Este usuario es EMPLEADO. Ingrese el codigo de seguridad.");
      } else {
        login(data.user, data.token);
        navigate("/catalogo");
      }
    } catch (error) {
      console.error("Error al iniciar sesion:", error);
      alert("Error de conexion con el servidor de autenticacion.");
    }

    setLoading(false);
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
            <Link to="/registro" className="nav-btn">Registrate</Link>
          </nav>
        </div>
      </header>

      <main>
        <div className="form-container">
          <h2>Iniciar Sesion</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Correo electronico</label>
              {/* Controlled Component: value={email} conecta el input al estado */}
              <input
                type="email"
                id="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // onChange actualiza el estado
                required
                disabled={requireCode} // el estado controla si el input se bloquea
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contrasena</label>
              {/* Controlled Component: value={password} conecta el input al estado */}
              <input
                type="password"
                id="password"
                placeholder="Contrasena"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // onChange actualiza el estado
                required
                disabled={requireCode} // el estado controla si el input se bloquea
              />
            </div>

            {requireCode && (
              <div className="form-group">
                <label htmlFor="securityCode">Codigo de seguridad</label>
                {/* Controlled Component: value={securityCode} conecta el input al estado */}
                <input
                  type="text"
                  id="securityCode"
                  placeholder="Ingrese el codigo de seguridad"
                  value={securityCode}
                  onChange={(e) => setSecurityCode(e.target.value)} // onChange actualiza el estado
                  required
                />
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </button>

            <div className="register-link">
              <p>
                Olvidaste tu contrasena? <Link to="/recuperar">Recuperala</Link>
              </p>
              <p>
                No tienes cuenta? <Link to="/registro">Registrate aqui</Link>
              </p>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

export default Login;
