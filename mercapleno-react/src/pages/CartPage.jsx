import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCartContext } from "../context/CartContext";
import { useAuthContext } from "../context/AuthContext";
import CartItem from "../components/ui/CartItem";
import TotalsSummary from "../components/features/TotalsSummary";
import { formatPrice } from "../services/productData";

import "../styles/base.css";
import "../styles/cart.css";

const PAYMENT_METHODS = [
  { id: 1, name: "Efectivo", dbId: "M1" },
  { id: 2, name: "Tarjeta de Credito", dbId: "M2" },
  { id: 3, name: "Tarjeta de Debito", dbId: "M3" },
  { id: 4, name: "Transferencia", dbId: "M4" },
  { id: 5, name: "Nequi", dbId: "M5" },
  { id: 6, name: "Daviplata", dbId: "M6" }
];

function CartPage() {
  const navigate = useNavigate();

  const { cart, totalItems, clearCart, processCheckout } = useCartContext();
  const { isAuthenticated, getUserId } = useAuthContext();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS[0].dbId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  const totals = useMemo(() => {
    const subTotalCents = cart.reduce((sum, item) => sum + (Math.round(item.price * 100) * item.cantidad), 0);
    const subTotal = subTotalCents / 100;
    const taxRate = 0.19;
    const taxCents = Math.round(subTotalCents * taxRate);
    const tax = taxCents / 100;
    const finalTotalCents = subTotalCents + taxCents;
    const finalTotal = finalTotalCents / 100;
    return { subTotal, tax, finalTotal };
  }, [cart]);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setCheckoutError("Tu carrito esta vacio.");
      return;
    }

    const id_usuario = getUserId();
    if (!isAuthenticated || !id_usuario) {
      setCheckoutError("Debes iniciar sesion para completar la compra.");
      return;
    }

    setIsProcessing(true);
    setCheckoutError(null);

    try {
      const result = await processCheckout(selectedPaymentMethod);

      if (result && (result.id_venta || result.ticketId)) {
        localStorage.setItem("lastPurchasedCart", JSON.stringify(cart));
        localStorage.setItem("lastPurchasedTotals", JSON.stringify({
          ...totals,
          ticketId: result.ticketId || result.id_venta || "N/A",
          paymentMethod: PAYMENT_METHODS.find(m => m.dbId === selectedPaymentMethod)?.name || "Desconocido"
        }));

        clearCart();
        navigate("/ticket");
      } else {
        setCheckoutError("Error al procesar la compra.");
      }
    } catch (error) {
      setCheckoutError(error.message || "Error grave al procesar el pago.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="carrito-main">
      <header className="cart-header">
        <div>
          <h1>Tu Carrito</h1>
          <p className="cart-subtitle">Revisa tu pedido y finaliza la compra.</p>
        </div>
        <div className="cart-summary-pill">
          <span>{totalItems} productos</span>
          <strong>{formatPrice(totals.finalTotal)}</strong>
        </div>
      </header>

      {totalItems === 0 ? (
        <div className="mensaje-vacio">
          <p>Tu carrito esta vacio</p>
          <button className="boton-nav" onClick={() => navigate("/catalogo")}>
            Explorar productos
          </button>
        </div>
      ) : (
        <div className="carrito-content-grid">
          <section className="productos-carrito-container">
            <div className="cart-items-header">
              <span>Producto</span>
              <span>Cantidad</span>
              <span>Subtotal</span>
            </div>
            {cart.map(item => <CartItem key={item.id} item={item} />)}
          </section>

          <section className="resumen-pago-container">
            <div className="cart-actions">
              <button
                className="boton-nav btn-danger"
                onClick={() => { if (window.confirm("Vaciar carrito?")) clearCart(); }}
              >
                Vaciar Carrito
              </button>
              <button className="boton-nav btn-muted" onClick={() => navigate("/catalogo")}>
                Seguir comprando
              </button>
            </div>

            <div className="payment-card">
              <label className="payment-label">Metodo de Pago</label>
              <select
                className="payment-select"
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                disabled={isProcessing}
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method.dbId} value={method.dbId}>{method.name}</option>
                ))}
              </select>
            </div>

            <TotalsSummary totals={totals} totalItems={totalItems} formatPrice={formatPrice} />

            {checkoutError && <p className="checkout-error">{checkoutError}</p>}

            <button
              className="boton-nav pay-btn"
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? "Procesando..." : `Pagar ${formatPrice(totals.finalTotal)}`}
            </button>
          </section>
        </div>
      )}

    </main>
  );
}

export default CartPage;
