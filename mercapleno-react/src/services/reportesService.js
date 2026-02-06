// src/services/reportesService.js

import { authorizedFetch } from './productData';

// La URL base para reportes (se complementa con /api/sales en productData.js)
const BASE_REPORTS_URL = "/reports";

export const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) return '$0';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

// 1. Ventas por mes
export const getVentasMes = async (inicio, fin) => {
    let endpoint = `${BASE_REPORTS_URL}/ventas-mes`;
    const params = new URLSearchParams();
    if (inicio) params.append('inicio', inicio);
    if (fin) params.append('fin', fin);
    if (params.toString()) endpoint += `?${params.toString()}`;

    const response = await authorizedFetch(endpoint, 'GET');
    return response.data || response;
};

// 2. Top productos
export const getTopProductos = async () => {
    const response = await authorizedFetch(`${BASE_REPORTS_URL}/top-productos`, 'GET');
    return response.data || response;
};

// 3. Resumen KPIs
export const getResumen = async () => {
    const response = await authorizedFetch(`${BASE_REPORTS_URL}/resumen`, 'GET');
    return response.data || response;
};

// 4. Resumen por mes
export const getResumenMes = async () => {
    const response = await authorizedFetch(`${BASE_REPORTS_URL}/resumen-mes`, 'GET');
    return response.data || response;
};

// 5. URL PDF
export const getPDFUrl = () => {
    return `http://localhost:4000/api/sales${BASE_REPORTS_URL}/pdf-resumen`;
};

// 6. Descargar PDF autenticado
export const fetchReportPdf = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(getPDFUrl(), {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            const authError = new Error("Token invalido o requerido. Redirigir a Login.");
            authError.status = response.status;
            throw authError;
        }
        const errorText = await response.text().catch(() => '');
        const error = new Error(errorText || `Error al descargar PDF: ${response.status}`);
        error.status = response.status;
        throw error;
    }

    return response.blob();
};

