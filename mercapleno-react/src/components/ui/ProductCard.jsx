// 🟢 src/components/ui/ProductCard.js (CORRECCIÓN FINAL - RUTA DE IMAGEN)

import React from 'react';
import { useCartContext } from '../../context/CartContext';
import { formatPrice } from '../../services/productData';
import { resolveImageUrl, FALLBACK_IMAGE } from '../../services/imageUtils';

function ProductCard({ product }) {
  const { addToCart } = useCartContext();

  const handleAddToCart = () => {
    addToCart(product);
  };
    
  const imageSrc = resolveImageUrl(product.image);


  return (
    <div 
        className="producto" 
        data-name={product.nombre} 
        data-category={product.category} // Correcto, viene de productModel.js
        data-price={product.price}        // Correcto, viene de productModel.js
        data-id={product.id}             // Correcto, viene de productModel.js
    >
      <p className="nombre">{product.nombre}</p>
      <div className="imagen">
        {/* 🔑 CORRECCIÓN CRÍTICA: Usamos product.image directamente sin prefijo local. */}
        <img 
            src={imageSrc} 
            alt={product.nombre} 
            // Manejo de error para asegurar que se muestre algo si la URL de internet falla
            onError={(e) => {
                e.target.onerror = null; 
                e.target.src = FALLBACK_IMAGE; 
            }}
        />
      </div>
        {/* Usamos product.price, que está correcto */}
      <p className="precio">{formatPrice(product.price)}</p> 
      <div className="botones">
        <button 
          className="botoncito_producto"
          onClick={handleAddToCart}
        >
          <span>agregar al carrito</span>
        </button>
      </div>
    </div>
  );
}

export default ProductCard;