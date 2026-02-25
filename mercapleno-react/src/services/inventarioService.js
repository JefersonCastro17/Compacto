import { buildApiUrl } from './apiConfig';

const MOVIMIENTOS_BASE_URL = buildApiUrl('/movimientos');

const getAuthHeaders = (token, includeJson = true) => {
  const headers = {};

  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const parseApiResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : {};
};

const handleApiError = (response, payload) => {
  const error = new Error(payload?.error || payload?.message || 'Error en la solicitud');
  error.status = response.status;

  if (response.status === 401 || response.status === 403) {
    error.code = 'UNAUTHORIZED_ACCESS';
  }

  throw error;
};

export const getInventoryProducts = async (token) => {
  const response = await fetch(`${MOVIMIENTOS_BASE_URL}/productos`, {
    method: 'GET',
    headers: getAuthHeaders(token, false),
  });

  const payload = await parseApiResponse(response);
  if (!response.ok) {
    handleApiError(response, payload);
  }

  return payload;
};

export const registerInventoryMovement = async (token, movementData) => {
  const response = await fetch(`${MOVIMIENTOS_BASE_URL}/registrar`, {
    method: 'POST',
    headers: getAuthHeaders(token, true),
    body: JSON.stringify(movementData),
  });

  const payload = await parseApiResponse(response);
  if (!response.ok) {
    handleApiError(response, payload);
  }

  return payload;
};
