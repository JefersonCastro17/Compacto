import { buildApiUrl } from './apiConfig';
import { authorizedFetch } from './productData';

const REPORTS_BASE_PATH = '/reports';

export const formatPrice = (price) => {
  if (typeof price !== 'number' || Number.isNaN(price)) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const getVentasMes = async (inicio, fin) => {
  let endpoint = `${REPORTS_BASE_PATH}/ventas-mes`;
  const params = new URLSearchParams();

  if (inicio) params.append('inicio', inicio);
  if (fin) params.append('fin', fin);
  if (params.toString()) endpoint += `?${params.toString()}`;

  const response = await authorizedFetch(endpoint, 'GET');
  return response.data || response;
};

export const getTopProductos = async () => {
  const response = await authorizedFetch(`${REPORTS_BASE_PATH}/top-productos`, 'GET');
  return response.data || response;
};

export const getResumen = async () => {
  const response = await authorizedFetch(`${REPORTS_BASE_PATH}/resumen`, 'GET');
  return response.data || response;
};

export const getResumenMes = async () => {
  const response = await authorizedFetch(`${REPORTS_BASE_PATH}/resumen-mes`, 'GET');
  return response.data || response;
};

export const getPDFUrl = () => buildApiUrl('/sales/reports/pdf-resumen');

export const fetchReportPdf = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(getPDFUrl(), {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    const error = new Error(errorText || `Error al descargar PDF: ${response.status}`);
    error.status = response.status;

    if (response.status === 401 || response.status === 403) {
      error.code = 'UNAUTHORIZED_ACCESS';
    }

    throw error;
  }

  return response.blob();
};
