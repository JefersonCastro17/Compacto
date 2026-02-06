import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "./logo.svg";

import "./styles/base.css";
import "./styles/registro.css";

function Recuperar() {
  const navigate = useNavigate();

  const [step, setStep] = useState("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch("http://localhost:4000/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "No se pudo enviar el codigo");
        setMessageType("error");
        setLoading(false);
        return;
      }

      setMessage(data.message || "Si el correo existe, se envio un codigo.");
      setMessageType("success");
      setStep("reset");
    } catch (err) {
      console.error("Error al solicitar codigo:", err);
      setMessage("Error de conexion con el servidor.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    if (newPassword !== confirmPassword) {
      setMessage("Las contrasenas no coinciden.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "No se pudo actualizar la contrasena");
        setMessageType("error");
        setLoading(false);
        return;
      }

      setMessage(data.message || "Contrasena actualizada correctamente.");
      setMessageType("success");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error("Error al resetear:", err);
      setMessage("Error de conexion con el servidor.");
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
          </nav>
        </div>
      </header>

      <main>
        <div className="form-container">
          <h2>Recuperar Contrasena</h2>

          {message && <div className={`message ${messageType}`}>{message}</div>}

          {step === "request" && (
            <form onSubmit={handleRequest}>
              <div className="form-group">
                <label htmlFor="resetEmail">Correo Electronico</label>
                <input
                  type="email"
                  id="resetEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Enviando..." : "Enviar Codigo"}
              </button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleReset}>
              <div className="form-group">
                <label htmlFor="resetEmailConfirm">Correo Electronico</label>
                <input
                  type="email"
                  id="resetEmailConfirm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="resetCode">Codigo</label>
                <input
                  type="text"
                  id="resetCode"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Nueva Contrasena</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contrasena</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Actualizando..." : "Actualizar Contrasena"}
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  );
}

export default Recuperar;
