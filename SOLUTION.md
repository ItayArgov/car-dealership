# Solution Overview

> For detailed architecture, implementation details, and development guidelines, see [CLAUDE.md](./CLAUDE.md).

## Quick Start

```bash
# Install dependencies
pnpm install

# Start all services (MongoDB + Backend + Frontend)
# Option 1: VSCode - use "Debugging" launch configuration
# Option 2: Manual
docker compose up -d
pnpm backend dev    # Terminal 1 - http://localhost:3000
pnpm frontend dev   # Terminal 2 - http://localhost:5173
```

## API Endpoints

- `GET /api/cars` - List cars with pagination (offset/limit)
- `GET /api/cars/:sku` - Get single car by SKU
- `POST /api/cars` - Create new car
- `PUT /api/cars/:sku` - Update existing car
- `DELETE /api/cars/:sku` - Soft delete car
- `POST /api/cars/excel/insert` - Bulk insert from Excel
- `POST /api/cars/excel/update` - Bulk update from Excel

## Future Improvements

**High Priority:**

- **Table improvements:**
  - Search/filter by make, model, year, color, SKU
  - Sort by column
  - Configurable page size

**Lower Priority:**

- **Handle bulk operation race conditions** - Bulk operations lack atomicity between concurrent requests. For inserts: if two Excel files insert overlapping SKUs simultaneously, some cars may come from one file and some from the other. For updates: concurrent updates to overlapping SKUs result in mixed writes from both files (last-write-wins per SKU). The solution is to use MongoDB transactions to ensure each bulk operation completes atomically.

## Test Data

Excel test files are in `test-data/`:

- `cars-valid-insert.xlsx` - 200 valid cars
- `cars-valid-update.xlsx` - 200 updates
- `cars-invalid-insert.xlsx` - 20 validation errors
- `cars-invalid-update.xlsx` - 16 validation errors

Regenerate with: `cd packages/backend && node scripts/generate-test-data.js`
