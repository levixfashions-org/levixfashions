import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

const ALLOWED_ORIGINS = [
  'https://thelevix.com',
  'https://www.thelevix.com',
  'http://localhost:3000',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

  // 1. Rate Limiting on Sensitive API Endpoints
  if (pathname.startsWith('/api/auth')) {
    const limit = rateLimit(clientIp, 'AUTH');
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Too many authentication attempts. Please retry in 60 seconds.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.resetMs / 1000)) } }
      );
    }
  } else if (pathname.startsWith('/api/cart')) {
    const limit = rateLimit(clientIp, 'CART');
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Cart operation rate limit exceeded.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.resetMs / 1000)) } }
      );
    }
  } else if (pathname.startsWith('/api/coupons') || pathname.includes('/coupon')) {
    const limit = rateLimit(clientIp, 'COUPON');
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Too many coupon validation attempts.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.resetMs / 1000)) } }
      );
    }
  } else if (pathname.startsWith('/api/payments') || pathname.startsWith('/api/orders')) {
    const limit = rateLimit(clientIp, 'CHECKOUT');
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Order placement velocity limit reached. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.resetMs / 1000)) } }
      );
    }
  }

  // 2. Authentication Guard for Protected Routes
  const sessionToken = req.cookies.get('__session')?.value;
  const isProtectedPath =
    pathname.startsWith('/account') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/admin');

  if (isProtectedPath && !sessionToken) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Dynamic Nonce & Content Security Policy (CSP) Generation
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://checkout.razorpay.com https://apis.google.com https://www.googletagmanager.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com https://*.googleusercontent.com https://checkout.razorpay.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.sentry.io;
    frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://*.firebaseapp.com;
    frame-ancestors 'none';
    form-action 'self';
    base-uri 'self';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Forward nonce and request ID in request headers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('x-request-id', requestId);
  requestHeaders.set('content-security-policy', cspHeader);

  // Initialize response
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 4. Harden Response Security Headers (Grade A+ on securityheaders.com)
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  );
  response.headers.set('X-Request-Id', requestId);

  // 5. CORS Whitelist
  const origin = req.headers.get('origin');
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, X-Request-Id'
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (public meta files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
