#!/usr/bin/env node

/**
 * Debug script: Test alternative Base.vn API endpoints
 * Base.vn might use a different API structure
 */

require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.BASE_API_KEY;
const BASE_ID = process.env.BASE_ID;

console.log('═══════════════════════════════════════════════════');
console.log('  Base.vn API Debug - Alternative Endpoints');
console.log('═══════════════════════════════════════════════════\n');

if (!API_KEY || !BASE_ID) {
  console.error('❌ Missing API key or Base ID');
  process.exit(1);
}

/**
 * Test alternative endpoints
 */
async function testAlternatives() {
  const endpoints = [
    // Try without /v1/
    {
      name: 'Direct base endpoint (no v1)',
      url: `https://api.base.vn/base/${BASE_ID}`,
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    },
    // Try with /api/
    {
      name: '/api/ path',
      url: `https://api.base.vn/api/base/${BASE_ID}`,
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    },
    // Try different auth format (Token instead of Bearer)
    {
      name: 'Token auth format',
      url: `https://api.base.vn/v1/base/${BASE_ID}`,
      headers: { 'Authorization': `Token ${API_KEY}` }
    },
    // Try with query parameters
    {
      name: 'Query params format',
      url: `https://api.base.vn/v1/base/${BASE_ID}?key=${API_KEY}`,
      headers: {}
    },
    // Try simpler structure
    {
      name: 'Root base endpoint',
      url: `https://api.base.vn/v1/${BASE_ID}`,
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    },
    // Try with different domain
    {
      name: 'Alternative domain (app.base.vn)',
      url: `https://app.base.vn/api/v1/base/${BASE_ID}`,
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`🔄 ${endpoint.name}`);
    console.log(`   URL: ${endpoint.url}`);

    try {
      const response = await axios.get(endpoint.url, {
        headers: {
          'Content-Type': 'application/json',
          ...endpoint.headers
        },
        timeout: 5000,
        validateStatus: () => true // Accept all status codes
      });

      console.log(`   Status: ${response.status}`);
      const dataPreview = JSON.stringify(response.data).substring(0, 200);
      console.log(`   Response: ${dataPreview}${JSON.stringify(response.data).length > 200 ? '...' : ''}`);

      if (response.status === 200 && (Array.isArray(response.data) || response.data.records || response.data.data)) {
        console.log(`   ✓ POTENTIAL MATCH! Actual response structure found.\n`);
      } else {
        console.log('');
      }

    } catch (error) {
      console.log(`   ❌ ${error.message}\n`);
    }
  }
}

testAlternatives();
