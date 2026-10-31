import http from 'k6/http';
import { check, sleep, group } from 'k6';

/**
 * LEVIX Streetwear Flash-Drop Load Test
 * Target: 500 Concurrent Virtual Users (VUs) with p95 response time under 800ms.
 *
 * How to Run:
 *   k6 run tests/load/k6-browse-checkout.js
 *
 * For custom target URL:
 *   k6 run -e BASE_URL=https://thelevix.com tests/load/k6-browse-checkout.js
 */

export const options = {
  stages: [
    { duration: '30s', target: 100 },  // Warm-up ramp
    { duration: '1m', target: 500 },   // Surge to 500 peak drop users
    { duration: '2m', target: 500 },   // Sustain 500 concurrent users during drop
    { duration: '30s', target: 0 },    // Cool down
  ],
  thresholds: {
    // 95% of all requests must complete within 800ms
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
    // Error rate must remain under 1%
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'k6-load-test-agent',
};

export default function () {
  // Scenario 1: Browse Campaign Home
  group('01_Home_Page', () => {
    const res = http.get(`${BASE_URL}/`, { headers: HEADERS });
    check(res, {
      'home status is 200': (r) => r.status === 200,
      'home latency < 500ms': (r) => r.timings.duration < 500,
    });
  });

  sleep(1);

  // Scenario 2: Catalog Faceted Search
  group('02_Shop_Catalog', () => {
    const categories = ['waffle-oversized', 'boxy-fit', 'acid-wash', 'full-sleeve-oversized'];
    const chosenCat = categories[Math.floor(Math.random() * categories.length)];

    const res = http.get(`${BASE_URL}/shop?category=${chosenCat}&sort=featured`, {
      headers: HEADERS,
    });

    check(res, {
      'shop status is 200': (r) => r.status === 200,
      'shop latency < 600ms': (r) => r.timings.duration < 600,
    });
  });

  sleep(1.5);

  // Scenario 3: Product Detail Page (PDP)
  group('03_Product_Detail', () => {
    const res = http.get(`${BASE_URL}/product/heavyweight-boxy-fit-tee`, {
      headers: HEADERS,
    });

    check(res, {
      'pdp status is 200': (r) => r.status === 200,
      'pdp latency < 600ms': (r) => r.timings.duration < 600,
    });
  });

  sleep(2);

  // Scenario 4: Coupon Validation
  group('04_Coupon_Validate', () => {
    const payload = JSON.stringify({
      code: 'WELCOME10',
      subtotalPaise: 359800,
    });

    const res = http.post(`${BASE_URL}/api/coupons/validate`, payload, {
      headers: HEADERS,
    });

    check(res, {
      'coupon status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      'coupon latency < 400ms': (r) => r.timings.duration < 400,
    });
  });

  sleep(1);

  // Scenario 5: Health Check Telemetry
  group('05_Healthcheck', () => {
    const res = http.get(`${BASE_URL}/api/health`, { headers: HEADERS });
    check(res, {
      'health status is 200': (r) => r.status === 200,
      'health latency < 200ms': (r) => r.timings.duration < 200,
    });
  });

  sleep(1);
}
