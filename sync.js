#!/usr/bin/env node

/**
 * Sync script: Fetch data from Base.vn "Base Request – Theo dõi công việc" table
 * Output: data/requests.json with 7 MVP columns
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_KEY = process.env.BASE_API_KEY;
const BASE_ID = process.env.BASE_ID;
const TABLE_NAME = process.env.TABLE_NAME || 'Base Request – Theo dõi công việc';

// MVP columns to extract (7 most important)
const MVP_COLUMNS = [
  'Tên yêu cầu',
  'Trạng thái',
  'Hạn xử lý',
  'Người xử lý gần nhất',
  'Mảng',
  'Ưu tiên',
  'Ngày tạo yêu cầu'
];

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Validate configuration
 */
function validateConfig() {
  const errors = [];

  if (!API_KEY) errors.push('❌ BASE_API_KEY not set in .env');
  if (!BASE_ID) errors.push('❌ BASE_ID not set in .env');

  if (errors.length > 0) {
    console.error('Configuration errors:');
    errors.forEach(err => console.error(err));
    console.error('\nPlease set up .env file with required values.');
    process.exit(1);
  }

  console.log('✓ Configuration validated');
  console.log(`  - API Key: ${API_KEY.substring(0, 20)}...`);
  console.log(`  - Base ID: ${BASE_ID}`);
  console.log(`  - Table: ${TABLE_NAME}`);
}

/**
 * Fetch data from Base.vn API
 *
 * Note: Base.vn API structure may vary. If API fails, see SETUP_MANUAL_EXPORT.md.
 */
async function fetchBaseData() {
  console.log('\n🔄 Attempting to fetch data from Base.vn API...');

  // Try multiple API endpoints in case Base.vn structure differs
  const endpoints = [
    // Primary: Standard structure
    {
      name: 'Primary endpoint',
      url: `https://api.base.vn/v1/base/${BASE_ID}/table/${encodeURIComponent(TABLE_NAME)}/records`
    },
    // Alternative 1: Different path structure
    {
      name: 'Alternative endpoint 1',
      url: `https://api.base.vn/v1/base/${BASE_ID}`
    },
    // Alternative 2: Simplified path
    {
      name: 'Alternative endpoint 2',
      url: `https://api.base.vn/v1/${BASE_ID}`
    }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`  Trying ${endpoint.name}...`);

      const response = await axios.get(endpoint.url, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000,
        validateStatus: () => true // Accept all status codes
      });

      // Check if response is valid JSON with data
      if (response.status === 200 && response.data && (
        Array.isArray(response.data) ||
        response.data.records ||
        response.data.data
      )) {
        console.log(`  ✓ Success on: ${endpoint.name}`);
        const recordCount = response.data.length ||
                          response.data.records?.length ||
                          response.data.data?.length || 0;
        console.log(`  ✓ Records fetched: ${recordCount}`);
        return response.data;
      }

    } catch (error) {
      // Try next endpoint
      continue;
    }
  }

  // If all API attempts fail, guide user
  console.error('\n⚠️ All Base.vn API endpoints failed.');
  console.error('   Possible causes:');
  console.error('   1. Base ID format incorrect (got: ' + BASE_ID + ')');
  console.error('   2. API key invalid or expired');
  console.error('   3. Base.vn API structure is different');
  console.error('\n📖 For manual data import: See SETUP_MANUAL_EXPORT.md\n');
  throw new Error('Could not fetch data from Base.vn API');
}

/**
 * Transform raw data to MVP format
 */
function transformData(rawData) {
  console.log('\n🔄 Transforming data...');

  let records = rawData;
  if (rawData.records) records = rawData.records;
  if (!Array.isArray(records)) {
    console.warn('⚠️ Unexpected data format. Expected array or {records: array}');
    records = [];
  }

  const transformed = records.map((record, index) => {
    const item = {};

    // Extract MVP columns only
    MVP_COLUMNS.forEach(col => {
      // Try to find the column (case-sensitive and case-insensitive)
      const key = Object.keys(record).find(k => k === col || k.toLowerCase() === col.toLowerCase());
      item[col] = key ? record[key] : null;
    });

    // Add unique ID if not present
    if (!item.id) {
      item.id = record.id || record._id || `request_${index}`;
    }

    return item;
  });

  console.log(`✓ Transformed ${transformed.length} records`);
  console.log(`  - Columns: ${MVP_COLUMNS.join(', ')}`);

  return transformed;
}

/**
 * Save data to JSON file
 */
function saveData(data) {
  const outputPath = path.join(DATA_DIR, 'requests.json');

  try {
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n✓ Data saved to: ${outputPath}`);
    console.log(`  - Records: ${data.length}`);
    console.log(`  - File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error(`❌ Failed to save data: ${error.message}`);
    throw error;
  }
}

/**
 * Main sync function
 */
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Base.vn Data Sync Script');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Step 1: Validate config
    validateConfig();

    // Step 2: Fetch data
    const rawData = await fetchBaseData();

    // Step 3: Transform to MVP format
    const transformedData = transformData(rawData);

    // Step 4: Save to JSON
    saveData(transformedData);

    console.log('\n✓ Sync completed successfully!');
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    console.error('═══════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

// Run sync
main();
