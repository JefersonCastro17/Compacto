// 🟢 src/components/ui/CartItem.jsx (CORREGIDO)

import React from 'react';
import { useCartContext } from '../../context/CartContext';
import { formatPrice } from '../../services/productData';
import { resolveImageUrl, FALLBACK_IMAGE } from '../../services/imageUtils';

function CartItem({ item }) {
  const { setItemQuantity, removeFromCart } = useCartContext();
  const subtotal = item.price * item.cantidad;
  
  const imageSrc = resolveImageUrl(item.image);

  const handleIncrement = () => {
    setItemQuantity(item.id, item.cantidad + 1);
  };

  const handleDecrement = () => {
    setItemQuantity(item.id, item.cantidad - 1);
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  return (
    <div className="producto-carrito-item">
      <div className="producto-carrito-info">
        {/* 🔑 CORRECCIÓN CRÍTICA: Usamos item.image directamente */}
        <img 
            src={imageSrc} 
            alt={item.nombre} 
            onError={(e) => {
                e.target.onerror = null; 
                e.target.src = FALLBACK_IMAGE; 
            }}
        />
        <div>
          <p className="producto-carrito-nombre">{item.nombre}</p>
          <p style={{ margin: '0', fontSize: '0.9em' }}>{formatPrice(item.price)} c/u</p>
        </div>
      </div>
      
      <div className="producto-carrito-cantidad">
        <button className="btn-cantidad" onClick={handleDecrement}>-</button>
        <p>{item.cantidad}</p>
        <button className="btn-cantidad" onClick={handleIncrement}>+</button>
      </div>
      
      <div className="producto-carrito-subtotal">
        <p><strong>Subtotal:</strong> {formatPrice(subtotal)}</p>
        <button className="btn-eliminar" onClick={handleRemove}>Eliminar</button>
      </div>
    </div>
  );
}

export default CartItem;