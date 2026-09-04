# Manual Data Export (Temporary Workaround)

If Base.vn API is not accessible via REST, use this method to export data:

## Step 1: Export from Base.vn UI

1. Go to Base.vn → Open database "Base Request – Theo dõi công việc"
2. Click **Export** (or similar button)
3. Export as **CSV** or **JSON**
4. Save file as `data/requests_raw.csv` or `data/requests_raw.json`

## Step 2: Run conversion script

```bash
npm run convert-csv
# or
npm run convert-json
```

This will transform the exported data to the dashboard-compatible format.

## Step 3: Continue with Phase 2

React dashboard will read from `data/requests.json` (either from API sync or manual export).

---

## Permanent Solution: Fix API

Once you have the correct API endpoint format:
1. Update `sync.js` with correct endpoint
2. Test with `npm run sync`
3. Commit & push to GitHub
