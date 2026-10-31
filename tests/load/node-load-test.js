/**
 * LEVIX Zero-Dependency Native Node.js Load Tester
 * Runs 500 concurrent requests without requiring external binary installations (k6 / Artillery).
 *
 * Usage:
 *   node tests/load/node-load-test.js
 *   node tests/load/node-load-test.js http://localhost:3000 500
 */

const TARGET_URL = process.argv[2] || process.env.BASE_URL || 'http://localhost:3000';
const CONCURRENCY = parseInt(process.argv[3] || '100', 10);
const TOTAL_REQUESTS = CONCURRENCY * 5;

const ENDPOINTS = [
  '/',
  '/shop',
  '/api/health',
  '/shipping-returns',
];

console.log('\n============================================================');
console.log('⚡ LEVIX STREETWEAR - HIGH-VELOCITY LOAD SIMULATION');
console.log('============================================================');
console.log(`Target Host:        ${TARGET_URL}`);
console.log(`Concurrency (VUs):  ${CONCURRENCY}`);
console.log(`Total Requests:     ${TOTAL_REQUESTS}`);
console.log(`P95 SLA Target:     < 800 ms`);
console.log('------------------------------------------------------------\n');

async function sendRequest(id) {
  const endpoint = ENDPOINTS[id % ENDPOINTS.length];
  const url = `${TARGET_URL}${endpoint}`;
  const start = performance.now();

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Levix-Node-LoadTester/1.0',
        'Accept': 'text/html,application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    const duration = performance.now() - start;
    return {
      status: res.status,
      duration,
      success: res.status >= 200 && res.status < 400,
      endpoint,
    };
  } catch (err) {
    const duration = performance.now() - start;
    return {
      status: 0,
      duration,
      success: false,
      error: err.message,
      endpoint,
    };
  }
}

async function run() {
  console.log('🚀 Dispatching concurrent request waves...');
  const overallStart = performance.now();

  const results = [];
  const batches = Math.ceil(TOTAL_REQUESTS / CONCURRENCY);

  for (let b = 0; b < batches; b++) {
    const batchPromises = [];
    for (let c = 0; c < CONCURRENCY; c++) {
      const reqId = b * CONCURRENCY + c;
      if (reqId < TOTAL_REQUESTS) {
        batchPromises.push(sendRequest(reqId));
      }
    }
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    process.stdout.write(`  Wave ${b + 1}/${batches} finished (${results.length}/${TOTAL_REQUESTS} requests)\r`);
  }

  const overallDuration = (performance.now() - overallStart) / 1000;
  console.log('\n\n✅ Load test completed successfully!\n');

  // Metrics Calculation
  const durations = results.map((r) => r.duration).sort((a, b) => a - b);
  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.length - successCount;
  const rps = (results.length / overallDuration).toFixed(1);

  const p50 = durations[Math.floor(durations.length * 0.5)].toFixed(1);
  const p90 = durations[Math.floor(durations.length * 0.9)].toFixed(1);
  const p95 = durations[Math.floor(durations.length * 0.95)].toFixed(1);
  const p99 = durations[Math.floor(durations.length * 0.99)].toFixed(1);
  const min = durations[0].toFixed(1);
  const max = durations[durations.length - 1].toFixed(1);

  console.log('------------------------------------------------------------');
  console.log('📊 TELEMETRY RESULTS:');
  console.log('------------------------------------------------------------');
  console.log(`Total Completed:    ${results.length} requests in ${overallDuration.toFixed(2)}s`);
  console.log(`Throughput:         ${rps} req/sec`);
  console.log(`Success Rate:       ${((successCount / results.length) * 100).toFixed(2)}% (${successCount} ok, ${failureCount} failed)`);
  console.log('------------------------------------------------------------');
  console.log('⏱️ LATENCY PERCENTILES:');
  console.log(`  Min:              ${min} ms`);
  console.log(`  p50 (Median):     ${p50} ms`);
  console.log(`  p90:              ${p90} ms`);
  console.log(`  p95:              ${p95} ms ${parseFloat(p95) < 800 ? '✅ (PASS < 800ms)' : '❌ (EXCEEDED 800ms)'}`);
  console.log(`  p99:              ${p99} ms`);
  console.log(`  Max:              ${max} ms`);
  console.log('============================================================\n');
}

run().catch((err) => {
  console.error('Fatal load tester error:', err);
  process.exit(1);
});
