// src/services/imageUtils.js

const PUBLIC_URL = process.env.PUBLIC_URL || '';

export const FALLBACK_IMAGE = `${PUBLIC_URL}/images/placeholder.svg`;

// Returns a safe URL for product images.
// - Full URLs (http/https), protocol-relative (//) and data URIs are returned as-is.
// - Leading "/" paths are treated as public-root paths.
// - Relative paths with "/" are treated as public-root paths.
// - Bare filenames are resolved under /images/productos/.
export const resolveImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') return FALLBACK_IMAGE;

  const trimmed = imagePath.trim();
  if (!trimmed) return FALLBACK_IMAGE;

  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
    return trimmed;
  }

  const normalized = trimmed.replace(/\\/g, '/');
  if (normalized.startsWith('/')) {
    return `${PUBLIC_URL}${normalized}`;
  }

  const cleaned = normalized.replace(/^\.?\//, '');
  if (cleaned.includes('/')) {
    return `${PUBLIC_URL}/${cleaned}`;
  }

  return `${PUBLIC_URL}/images/productos/${cleaned}`;
};
