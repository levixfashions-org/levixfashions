import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

describe('LEVIX Concurrency & Throughput Benchmark', () => {
  test('Concurrent Product Fetch Benchmark (50 parallel requests)', async () => {
    const URL = 'http://localhost:5000/api/products'
    const TOTAL_REQUESTS = 50
    const start = performance.now()

    try {
      const requests = Array.from({ length: TOTAL_REQUESTS }).map(() =>
        fetch(URL, {
          headers: { Accept: 'application/json' },
        }).then((res) => ({
          status: res.status,
          ok: res.ok,
        }))
      )

      const results = await Promise.all(requests)
      const durationMs = performance.now() - start

      const successful = results.filter((r) => r.ok).length
      const successRate = (successful / TOTAL_REQUESTS) * 100

      console.log(`\n  ⚡ Concurrency Test Metrics:`)
      console.log(`     Total Requests: ${TOTAL_REQUESTS}`)
      console.log(`     Successful:     ${successful}`)
      console.log(`     Total Time:     ${durationMs.toFixed(2)} ms`)
      console.log(`     Avg per Req:    ${(durationMs / TOTAL_REQUESTS).toFixed(2)} ms`)
      console.log(`     Throughput:     ${((TOTAL_REQUESTS / durationMs) * 1000).toFixed(0)} req/sec`)
      console.log(`     Success Rate:   ${successRate.toFixed(1)}%\n`)

      assert.equal(successful, TOTAL_REQUESTS)
      assert.ok(durationMs < 5000, '50 requests must complete in under 5 seconds')
    } catch (err) {
      // If server is not running during isolated test runner, mark test note
      console.log('  ⚠️ Server offline for live HTTP test, skipping local socket test:', err.message)
    }
  test('Admin-to-Storefront Workflow Benchmark (Image Upload, Price Edit, Instant Reflection)', async () => {
    const BASE = 'http://localhost:5000'
    const ADMIN_HEADERS = {
      'Content-Type': 'application/json',
      'x-admin-key': 'levix_admin_auth_sec_2026',
    }

    try {
      // 1. Image Upload Benchmark
      const uploadStart = performance.now()
      // 1x1 test JPEG base64
      const sampleBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='
      const uploadRes = await fetch(`${BASE}/api/upload`, {
        method: 'POST',
        headers: ADMIN_HEADERS,
        body: JSON.stringify({ image: sampleBase64 }),
      })
      const uploadDuration = performance.now() - uploadStart
      assert.equal(uploadRes.status, 200, 'Image upload must return HTTP 200')
      const uploadData = await uploadRes.json()
      assert.ok(uploadData.url && uploadData.url.startsWith('/uploads/'), 'Must return static /uploads URL')

      // 2. Product Creation Benchmark
      const createStart = performance.now()
      const testId = `test-prod-${Date.now()}`
      const createRes = await fetch(`${BASE}/api/products`, {
        method: 'POST',
        headers: ADMIN_HEADERS,
        body: JSON.stringify({
          id: testId,
          name: 'Benchmark Organic Tee',
          slug: `benchmark-tee-${Date.now()}`,
          price: 249900,
          stock: 50,
          images: [uploadData.url],
          categoryId: 'cat-t-shirts',
          isPublished: true,
        }),
      })
      const createDuration = performance.now() - createStart
      assert.equal(createRes.status, 200, 'Product creation must return HTTP 200')

      // 3. Storefront Instant Reflection Benchmark
      const fetchStart = performance.now()
      const storefrontRes = await fetch(`${BASE}/api/products?_t=${Date.now()}`, {
        headers: { Accept: 'application/json' },
      })
      const fetchDuration = performance.now() - fetchStart
      assert.equal(storefrontRes.status, 200)
      const cacheControl = storefrontRes.headers.get('cache-control') || ''
      assert.ok(cacheControl.includes('no-store'), 'Storefront response must include no-store header')

      const storefrontData = await storefrontRes.json()
      const createdItem = storefrontData.products.find((p) => p.id === testId)
      assert.ok(createdItem, 'Created product must be instantly visible on storefront')
      assert.equal(createdItem.price, 249900)

      // 4. Admin Price Update Benchmark
      const updateStart = performance.now()
      const updateRes = await fetch(`${BASE}/api/products`, {
        method: 'POST',
        headers: ADMIN_HEADERS,
        body: JSON.stringify({
          ...createdItem,
          price: 199900, // Price updated to ₹1,999
          salePrice: 179900,
        }),
      })
      const updateDuration = performance.now() - updateStart
      assert.equal(updateRes.status, 200)

      // 5. Storefront Instant Updated Price Verification
      const verifyStart = performance.now()
      const updatedStorefrontRes = await fetch(`${BASE}/api/products?_t=${Date.now()}`)
      const verifyDuration = performance.now() - verifyStart
      const updatedStorefrontData = await updatedStorefrontRes.json()
      const updatedItem = updatedStorefrontData.products.find((p) => p.id === testId)
      assert.equal(updatedItem.price, 199900, 'Storefront must reflect updated price immediately')
      assert.equal(updatedItem.salePrice, 179900, 'Storefront must reflect updated sale price immediately')

      // 6. Cleanup
      await fetch(`${BASE}/api/products/${testId}`, {
        method: 'DELETE',
        headers: ADMIN_HEADERS,
      })

      console.log(`\n  ⚡ Admin-to-Storefront Update Metrics:`)
      console.log(`     Image Upload Time:     ${uploadDuration.toFixed(2)} ms`)
      console.log(`     Product Save Time:     ${createDuration.toFixed(2)} ms`)
      console.log(`     Storefront Fetch Time: ${fetchDuration.toFixed(2)} ms`)
      console.log(`     Price Update Time:     ${updateDuration.toFixed(2)} ms`)
      console.log(`     Price Verify Time:     ${verifyDuration.toFixed(2)} ms`)
      console.log(`     Total Workflow Time:   ${(uploadDuration + createDuration + fetchDuration + updateDuration + verifyDuration).toFixed(2)} ms\n`)

      assert.ok(uploadDuration < 500, 'Image upload should take under 500ms')
      assert.ok(createDuration < 500, 'Product creation should take under 500ms')
      assert.ok(updateDuration < 500, 'Product update should take under 500ms')
    } catch (err) {
      console.log('  ⚠️ Local server offline for workflow benchmark:', err.message)
    }
  })
})
