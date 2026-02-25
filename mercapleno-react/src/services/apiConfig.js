const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api';

export const buildApiUrl = (path = '') => {
  if (!path) {
    return API_BASE_URL;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export { API_BASE_URL };
