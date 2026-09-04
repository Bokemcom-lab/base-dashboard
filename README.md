# Base.vn Dashboard

Interactive dashboard to track and manage requests from Base.vn "Base Request – Theo dõi công việc" table.

## Features (MVP)

- **Sync data** from Base.vn API to JSON
- **Track status** of work requests
- **Filter & search** by name, status, priority, department
- **View deadlines** and assigned owners
- *More features coming in Phase 2 & 3*

## Quick Start

### 1. Setup Environment

```bash
# Install dependencies
npm install

# Create .env file (manually - copy from .env.example)
# Edit .env with your Base.vn credentials:
# - BASE_API_KEY: Your API key from Base.vn Settings → Integrations
# - BASE_ID: Your Base ID
```

### 2. Sync Data

```bash
npm run sync
```

This will:
- Fetch data from Base.vn API
- Extract 7 MVP columns (Tên yêu cầu, Trạng thái, Hạn xử lý, etc.)
- Save to `data/requests.json`

### 3. Deploy (Phase 2 & 3)

React dashboard and GitHub Pages deployment coming next.

## Configuration

Create `.env` file with:

```
BASE_API_KEY=your_api_key_here
BASE_ID=@Cuong02
TABLE_NAME=Base Request – Theo dõi công việc
LOG_LEVEL=info
```

## Data Columns (MVP)

1. **Tên yêu cầu** - Request name
2. **Trạng thái** - Status (In progress, Done, etc.)
3. **Hạn xử lý** - Deadline
4. **Người xử lý gần nhất** - Last handler / Owner
5. **Mảng** - Category / Department
6. **Ưu tiên** - Priority level
7. **Ngày tạo yêu cầu** - Created date

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `BASE_API_KEY not set` | Create `.env` file (copy from `.env.example`) with real credentials |
| `Cannot connect to Base.vn API` | Check internet connection; verify API endpoint |
| `API Error 401` | Check if API key is correct and valid |
| `API Error 404` | Verify Base ID and table name spelling |

## Project Structure

```
base-dashboard/
├── sync.js              # Script to fetch & sync Base.vn data
├── package.json         # Dependencies (axios, dotenv)
├── .env.example         # Example configuration
├── .env                 # Actual config (add manually, not in git)
├── .gitignore           # Git ignore rules
├── data/                # Synced data (JSON)
├── src/                 # React app (Phase 2)
├── public/              # Static files (Phase 3)
└── README.md            # This file
```

## Next Steps

- **Phase 1 (Done):** ✓ GitHub repo + Sync script
- **Phase 2:** React dashboard (table, filters, charts)
- **Phase 3:** Deploy to GitHub Pages + CI/CD
- **Phase 4:** Testing + Live demo

## Author

Bokemcom-lab

## License

MIT
