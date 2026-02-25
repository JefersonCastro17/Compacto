import { buildApiUrl } from './apiConfig';

const SALES_BASE_URL = buildApiUrl('/sales');

export const formatPrice = (price) => {
  if (typeof price !== 'number' || Number.isNaN(price)) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const buildSalesUrl = (endpoint) => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  const normalized = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${SALES_BASE_URL}${normalized}`;
};

const parseResponseBody = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : {};
};

export const authorizedFetch = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildSalesUrl(endpoint), {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    const error = new Error(
      data.message || data.error || `Error en la solicitud: ${response.status}`,
    );
    error.status = response.status;

    if (response.status === 401 || response.status === 403) {
      error.code = 'UNAUTHORIZED_ACCESS';
    }

    throw error;
  }

  return data;
};

export const getProducts = async (nombre, categoria, precioMin, precioMax) => {
  const params = new URLSearchParams();

  if (nombre) params.append('search', nombre);
  if (categoria && categoria !== 'todas') params.append('category', categoria);
  if (precioMin !== undefined && precioMin !== '') params.append('precioMin', precioMin);
  if (precioMax !== undefined && precioMax !== '') params.append('precioMax', precioMax);

  const endpoint = `/products${params.toString() ? `?${params.toString()}` : ''}`;
  const result = await authorizedFetch(endpoint);

  return result.products || result.data || result;
};

export const getCategories = async () => {
  const result = await authorizedFetch('/categories');
  return result.categories || result.data || result;
};

export const sendOrder = async (orderData) => {
  const sanitized = {
    ...orderData,
    total: parseFloat(Number(orderData.total || 0).toFixed(2)),
  };

  return authorizedFetch('/orders', 'POST', sanitized);
};
