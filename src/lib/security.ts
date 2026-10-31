import { NextRequest } from 'next/server';

/**
 * Strips dangerous HTML tags, inline javascript, and malicious event handlers from user inputs.
 * Applied across review submissions, address entries, customer inquiries, and admin text.
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove dangerous attributes like onerror, onclick, onload, etc.
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\bon\w+\s*=\s*[^>\s]+/gi, '')
    // Strip iframe, object, embed, eval tags
    .replace(/<\/?(iframe|object|embed|applet|meta|link|style)[^>]*>/gi, '')
    // Disarm javascript: pseudo-protocols
    .replace(/javascript:/gi, 'disarmed-js:')
    // Trim extraneous whitespace
    .trim();
}

/**
 * Escapes characters for safe rendering inside HTML contexts.
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Recursively sanitizes string fields within an object payload.
 */
export function sanitizePayload<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;

  const result: any = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeHtml(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizePayload(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Verifies request origin and referer to defend against Cross-Site Request Forgery (CSRF).
 */
export function verifyCsrfOrigin(req: NextRequest, allowedOrigins: string[]): boolean {
  // Safe HTTP read methods are exempt from CSRF origin checks
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return true;
  }

  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');

  // If neither origin nor referer is provided on state-mutating requests
  if (!origin && !referer) {
    // In production, require at least one header
    if (process.env.NODE_ENV === 'production') return false;
    return true;
  }

  if (origin) {
    return allowedOrigins.some((allowed) => origin === allowed || origin.endsWith(allowed));
  }

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      return allowedOrigins.some(
        (allowed) => refererUrl.origin === allowed || refererUrl.origin.endsWith(allowed)
      );
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Validates image upload MIME types, extensions, and file sizes.
 */
export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateImageUpload(file: {
  size: number;
  type: string;
  buffer?: Buffer;
}): ImageValidationResult {
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      valid: false,
      error: `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB uploaded)`,
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported file format '${file.type}'. Allowed formats: WebP, PNG, JPEG`,
    };
  }

  // Magic bytes inspection if buffer is provided
  if (file.buffer && file.buffer.length >= 4) {
    const isJpeg = file.buffer[0] === 0xff && file.buffer[1] === 0xd8 && file.buffer[2] === 0xff;
    const isPng =
      file.buffer[0] === 0x89 &&
      file.buffer[1] === 0x50 &&
      file.buffer[2] === 0x4e &&
      file.buffer[3] === 0x47;
    const isWebp =
      file.buffer.length >= 12 &&
      file.buffer.toString('ascii', 0, 4) === 'RIFF' &&
      file.buffer.toString('ascii', 8, 12) === 'WEBP';

    if (!isJpeg && !isPng && !isWebp) {
      return {
        valid: false,
        error: 'File content does not match genuine image header signatures (magic bytes rejected)',
      };
    }
  }

  return { valid: true };
}
