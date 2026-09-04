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
 * Note: Base.vn API structure might vary. This script uses a common pattern.
 * If API response format is different, adjust parsing accordingly.
 */
async function fetchBaseData() {
  try {
    console.log('\n🔄 Fetching data from Base.vn...');

    // Base.vn API endpoint (adjust if needed)
    const apiUrl = `https://api.base.vn/v1/base/${BASE_ID}/table/${encodeURIComponent(TABLE_NAME)}/records`;

    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log(`✓ API Response received (${response.data.length || response.data.records?.length || 'unknown'} records)`);
    return response.data;

  } catch (error) {
    if (error.response) {
      console.error(`❌ API Error ${error.response.status}: ${error.response.statusText}`);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to Base.vn API. Check internet connection.');
    } else {
      console.error('❌ Network error:', error.message);
    }
    throw error;
  }
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
