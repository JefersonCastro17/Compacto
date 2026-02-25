// 🟢 src/pages/InventoryPage.jsx (VERSIÓN FINAL Y ROBUSTA)

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ui/ProductCard';
import FilterBar from '../components/features/FilterBar'; 
import { getProducts, getCategories } from '../services/productData'; 
import { useAuthContext } from '../context/AuthContext'; 

//estilos 

import "../styles/base.css";
import "../styles/inventory.css";


function InventoryPage() {
    const navigate = useNavigate();
    const { logout } = useAuthContext(); 
    const [products, setProducts] = useState([]); 
    const [isLoading, setIsLoading] = useState(true); 
    const [categories, setCategories] = useState([]);
    
    // Estado único para gestionar TODOS los filtros
    const [currentFilters, setCurrentFilters] = useState({
        nombre: '',
        categoria: 'todas',
        precioMin: '',
        precioMax: '',
    });

    // Función de error centralizada para el 401
    const handleUnauthorizedAccess = useCallback(() => {
        console.error("Acceso no autorizado. Redirigiendo a Login.");
        logout(); 
        localStorage.removeItem('token');
        navigate('/login');
    }, [navigate, logout]);


    // 1. CARGA ASÍNCRONA DE CATEGORÍAS (Corrección para 'data is not iterable')
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories();
                
                // 💡 CORRECCIÓN 1: Asegurar que 'categoriesArray' sea un array
                const categoriesArray = Array.isArray(response) 
                    ? response 
                    : (response.data || response.categories || []); // Intenta buscar en .data o .categories o usa []
                
                setCategories([{ value: 'todas', label: 'Todas las categorías' }, ...categoriesArray]);
            } catch (error) {
                if (error.code === "UNAUTHORIZED_ACCESS" || error.status === 401 || error.status === 403) {
                    handleUnauthorizedAccess();
                    return; 
                }
                console.error("Error al cargar categorías:", error);
                // En caso de error, inicializa con solo la opción "Todas"
                setCategories([{ value: 'todas', label: 'Todas las categorías' }]);
            }
        };
        fetchCategories();
    }, [handleUnauthorizedAccess]); 

    
    // 2. FUNCIÓN DE CARGA ASÍNCRONA DE PRODUCTOS CON FILTROS
    const fetchFilteredProducts = useCallback(async (filters) => {
        setIsLoading(true);
        try {
            const data = await getProducts(
                filters.nombre, 
                filters.categoria,
                filters.precioMin,
                filters.precioMax
            ); 
            
            // 💡 CORRECCIÓN 2: Asegurar que 'data' sea un array (Similar a categorías)
            const productsArray = Array.isArray(data) 
                ? data 
                : (data.data || data.products || []); // Intenta buscar en .data o .products o usa []

            setProducts(productsArray);

        } catch (error) {
            // MANEJO DE ERROR DE AUTENTICACIÓN
            if (error.code === "UNAUTHORIZED_ACCESS" || error.status === 401 || error.status === 403) {
                handleUnauthorizedAccess();
                return;
            }
            console.error("Error al cargar productos filtrados:", error);
            setProducts([]); // 🔑 CLAVE: Siempre establece a un array vacío en caso de error
        } finally {
            setIsLoading(false);
        }
    }, [handleUnauthorizedAccess]); 

    // 3. EFECTO: Se dispara la carga de productos CADA VEZ que los filtros cambian
    useEffect(() => {
        fetchFilteredProducts(currentFilters);
    }, [currentFilters, fetchFilteredProducts]);


    // 4. HANDLER: Función para recibir los filtros actualizados de FilterBar
    const handleFilterChange = useCallback((newFilters) => {
        setCurrentFilters(newFilters);
    }, []);


    // RENDERIZADO
    const visibleCategories = categories.filter(cat => cat.value !== 'todas');

    return (
        <div className="inventory-page-container">
            <header className="catalog-header">
                <div className="catalog-title">
                    <span className="catalog-eyebrow">Catalogo</span>
                    <h1>Productos disponibles</h1>
                    <p>Explora novedades, filtra por categoria y arma tu pedido en minutos.</p>
                </div>
                <div className="catalog-stats">
                    <div className="stat-card">
                        <span>Productos</span>
                        <strong>{isLoading ? "-" : products.length}</strong>
                    </div>
                    <div className="stat-card">
                        <span>Categorias</span>
                        <strong>{visibleCategories.length}</strong>
                    </div>
                </div>
            </header>

            <FilterBar
                onFilterChange={handleFilterChange}
                categories={categories}
            />

            {isLoading ? (
                <p className="catalog-loading">Cargando productos...</p>
            ) : (
                <section className="catalogo">
                    {products.length > 0 ? (
                        products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <p className="catalog-empty">
                            No se encontraron productos que coincidan con los filtros.
                        </p>
                    )}
                </section>
            )}
        </div>
    );
}

export default InventoryPage;
