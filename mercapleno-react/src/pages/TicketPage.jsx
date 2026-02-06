import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 🚨 Importamos useNavigate
import { formatPrice } from '../services/productData'; 
import { useAuthContext } from '../context/AuthContext'; 

// Estilos 
import "../styles/base.css";
import "../styles/ticket.css";

function TicketPage() {
  // 🚨 Inicializamos el hook de navegación
  const navigate = useNavigate();
  
  const { getUserName, getUserEmail } = useAuthContext(); 
  const [ticketData, setTicketData] = useState(null);
  
  useEffect(() => {
    const userName = getUserName() || 'Usuario Desconocido';
    const userEmail = getUserEmail() || 'N/A';
    
    // Recuperar los datos de la última compra
    const finalCartJSON = localStorage.getItem('lastPurchasedCart');
    const finalTotalsJSON = localStorage.getItem('lastPurchasedTotals');

    if (finalCartJSON && finalTotalsJSON) {
        const totals = JSON.parse(finalTotalsJSON);
        
        const now = new Date();
        const dateString = now.toLocaleDateString('es-CO', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        setTicketData({
            cart: JSON.parse(finalCartJSON),
            totals: totals,
            name: userName,
            email: userEmail,
            date: dateString, 
            ticketNumber: totals.ticketId || 'N/A', 
            paymentMethod: totals.paymentMethod || 'Efectivo',
        });
        
    } else {
        // Si no hay datos (acceso directo a la URL), redirigir al catálogo
        navigate('/catalogo');
    }
  }, [getUserName, getUserEmail, navigate]);

  const handleBack = () => {
    // 🚨 Limpiamos los datos del ticket para que no se dupliquen en el futuro
    localStorage.removeItem('lastPurchasedCart');
    localStorage.removeItem('lastPurchasedTotals');
    // 🚨 Navegamos al catálogo
    navigate('/catalogo');
  };

  const handlePrint = () => {
    window.print();
  };

  if (!ticketData) {
      return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando información del ticket...</div>;
  }
  
  return (
    <div className="ticket-page-container">
        <div className="ticket-content">
            <h2 className="ticket-header">Ticket de Compra Electrónico</h2>
            <p className="ticket-logo">MERCAPLENO</p>

            <div className="ticket-details-user">
                <p><strong>Nombre:</strong> {ticketData.name}</p>
                <p><strong>Correo:</strong> {ticketData.email}</p>
                <p><strong>Fecha:</strong> {ticketData.date}</p>
                <p><strong>Número de ticket:</strong> {ticketData.ticketNumber}</p>
                <p><strong>Método de Pago:</strong> {ticketData.paymentMethod}</p>
            </div>

            <p className="productos-titulo"><strong>Detalle de Productos:</strong></p>
            <div className="detalle-productos">
                {ticketData.cart.map(item => {
                    const nombre = item.nombre || item.name || 'Producto';
                    return (
                        <div key={item.id} className="producto-linea">
                            <span className="producto-nombre">
                                {nombre} ({item.cantidad} unid.)
                            </span>
                            <span className="alinear-derecha">
                                {formatPrice(item.price * item.cantidad)}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="ticket-totals">
                <p>Subtotal: <span className="alinear-derecha">{formatPrice(ticketData.totals.subTotal)}</span></p>
                <p>Impuestos (19%): <span className="alinear-derecha">{formatPrice(ticketData.totals.tax)}</span></p>
                <h3 className="total-final">TOTAL: <span className="alinear-derecha">{formatPrice(ticketData.totals.finalTotal)}</span></h3>
            </div>
            
            <p className="agradecimiento">¡Gracias por tu compra!</p>

            {/* 🚨 Cambiamos el onClick para usar nuestra nueva función handleBack */}
            <div className="ticket-actions">
                <button onClick={handlePrint} className="boton-nav print-btn">
                    Imprimir recibo
                </button>
                <button onClick={handleBack} className="boton-nav volver-catalogo-btn">
                    Volver al Catalogo
                </button>
            </div>
        </div>
    </div>
  );
}

export default TicketPage;
