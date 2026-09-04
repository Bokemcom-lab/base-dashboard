#!/usr/bin/env node

/**
 * Convert CSV export from Base.vn to dashboard JSON format
 *
 * Usage:
 *   1. Export data from Base.vn as CSV
 *   2. Save to data/requests_raw.csv
 *   3. Run: node convert-csv.js
 *   4. Output: data/requests.json
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync'); // or simpler manual parsing

const DATA_DIR = path.join(__dirname, 'data');
const INPUT_FILE = path.join(DATA_DIR, 'requests_raw.csv');
const OUTPUT_FILE = path.join(DATA_DIR, 'requests.json');

// MVP columns we need
const MVP_COLUMNS = [
  'Tên yêu cầu',
  'Trạng thái',
  'Hạn xử lý',
  'Người xử lý gần nhất',
  'Mảng',
  'Ưu tiên',
  'Ngày tạo yêu cầu'
];

console.log('═══════════════════════════════════════════════════');
console.log('  CSV to JSON Converter');
console.log('═══════════════════════════════════════════════════\n');

// Check if input file exists
if (!fs.existsSync(INPUT_FILE)) {
  console.error(`❌ Input file not found: ${INPUT_FILE}`);
  console.error('\nSteps:');
  console.error('1. Export data from Base.vn as CSV');
  console.error('2. Save to: ' + INPUT_FILE);
  console.error('3. Run this script again');
  process.exit(1);
}

try {
  // Read CSV file
  console.log('📖 Reading CSV file...');
  const csvContent = fs.readFileSync(INPUT_FILE, 'utf-8');

  // Simple CSV parsing (handles basic cases)
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file is empty or only has header');
  }

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  console.log(`✓ Headers found: ${headers.join(', ')}\n`);

  // Parse records
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));

    const record = {};
    headers.forEach((header, idx) => {
      record[header] = values[idx] || null;
    });
    records.push(record);
  }

  console.log(`✓ Records parsed: ${records.length}\n`);

  // Transform to MVP format
  console.log('🔄 Transforming to MVP format...');
  const transformed = records.map((record, idx) => {
    const item = {};

    // Extract MVP columns
    MVP_COLUMNS.forEach(col => {
      const key = Object.keys(record).find(k =>
        k === col || k.toLowerCase() === col.toLowerCase()
      );
      item[col] = key ? record[key] : null;
    });

    // Add ID
    item.id = record.id || record._id || `request_${idx}`;

    return item;
  });

  console.log(`✓ Transformed ${transformed.length} records`);
  console.log(`✓ Columns: ${MVP_COLUMNS.join(', ')}\n`);

  // Save JSON
  console.log('💾 Saving to JSON...');
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(transformed, null, 2), 'utf-8');

  const fileSize = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2);
  console.log(`✓ Saved to: ${OUTPUT_FILE}`);
  console.log(`✓ Size: ${fileSize} KB`);
  console.log(`✓ Records: ${transformed.length}\n`);

  console.log('═══════════════════════════════════════════════════');
  console.log('✓ Conversion complete! Data ready for dashboard.\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
