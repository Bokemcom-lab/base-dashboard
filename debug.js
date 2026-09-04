#!/usr/bin/env node

/**
 * Debug script: Test Base.vn API connection and check response format
 */

require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.BASE_API_KEY;
const BASE_ID = process.env.BASE_ID;
const TABLE_NAME = process.env.TABLE_NAME || 'Base Request – Theo dõi công việc';

console.log('═══════════════════════════════════════════════════');
console.log('  Base.vn API Debug Script');
console.log('═══════════════════════════════════════════════════\n');

console.log('Configuration:');
console.log(`  API Key: ${API_KEY ? API_KEY.substring(0, 20) + '...' : 'NOT SET'}`);
console.log(`  Base ID: ${BASE_ID}`);
console.log(`  Table: ${TABLE_NAME}\n`);

if (!API_KEY || !BASE_ID) {
  console.error('❌ Missing API key or Base ID. Check .env file.');
  process.exit(1);
}

/**
 * Test different Base.vn API endpoints
 */
async function testEndpoints() {
  const endpoints = [
    // Endpoint 1: Records endpoint
    {
      name: 'Records endpoint (v1)',
      url: `https://api.base.vn/v1/base/${BASE_ID}/table/${encodeURIComponent(TABLE_NAME)}/records`
    },
    // Endpoint 2: Alternative structure
    {
      name: 'Base endpoint (list tables)',
      url: `https://api.base.vn/v1/base/${BASE_ID}`
    },
    // Endpoint 3: Direct table data
    {
      name: 'Direct table query',
      url: `https://api.base.vn/v1/base/${BASE_ID}/table/${encodeURIComponent(TABLE_NAME)}`
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`\n🔄 Testing: ${endpoint.name}`);
    console.log(`   URL: ${endpoint.url}\n`);

    try {
      const response = await axios.get(endpoint.url, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log(`✓ Status: ${response.status}`);
      console.log(`✓ Response type: ${typeof response.data}`);
      console.log(`✓ Response keys: ${Object.keys(response.data).join(', ')}`);

      // Log first 500 chars of response
      const responseStr = JSON.stringify(response.data, null, 2);
      console.log(`\n📋 Response (first 1000 chars):\n`);
      console.log(responseStr.substring(0, 1000));
      if (responseStr.length > 1000) {
        console.log('\n... (truncated) ...\n');
      }

      // Check for records
      if (response.data.records) {
        console.log(`\n✓ Found 'records' key with ${response.data.records.length} items`);
      } else if (Array.isArray(response.data)) {
        console.log(`\n✓ Response is array with ${response.data.length} items`);
      } else {
        console.log(`\n⚠️ No records array found in response`);
      }

      console.log('\n' + '─'.repeat(50));

    } catch (error) {
      if (error.response) {
        console.log(`❌ HTTP ${error.response.status}: ${error.response.statusText}`);
        console.log(`   Response: ${JSON.stringify(error.response.data, null, 2).substring(0, 300)}`);
      } else {
        console.log(`❌ Error: ${error.message}`);
      }
      console.log('\n' + '─'.repeat(50));
    }
  }
}

// Run debug
testEndpoints().then(() => {
  console.log('\n✓ Debug complete. Check response formats above.');
  console.log('\nNext: Update sync.js with correct response parsing.');
  process.exit(0);
}).catch(err => {
  console.error('❌ Debug failed:', err.message);
  process.exit(1);
});
