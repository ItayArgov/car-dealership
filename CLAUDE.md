# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Car Dealership Management System** - a fullstack TypeScript application built as a monorepo using pnpm workspaces. The system allows managing cars via UI forms and Excel file uploads, with dual input validation on both client and server.

## Architecture

### Monorepo Structure

```
packages/
├── backend/          # Hono API server with MongoDB
├── frontend/         # React + Vite SPA
└── common/           # Shared types, Zod schemas, and constants
```

**Key architectural decisions:**
- **Shared validation**: Zod schemas in `common/` package are used by both frontend (form validation) and backend (API validation)
- **Type safety**: TypeScript types are shared via `common/models/` (e.g., `Car` interface)
- **Immutable SKU**: Car SKU is the primary identifier and cannot be changed after creation
- **Soft delete pattern**: Cars are never removed from the database; deletion sets `deletedAt` timestamp
- **Separate insert/update endpoints**: Excel uploads use distinct endpoints (`/excel/insert` vs `/excel/update`) for explicit operation control

### Backend (Hono + MongoDB)

- **Framework**: Hono (modern, lightweight web framework)
- **Database**: MongoDB with native driver (collection: `cars`, unique index on `sku`)
- **Structure**:
  - `routes/` - HTTP route definitions
  - `services/` - Business logic (car CRUD, Excel parsing with `xlsx`)
  - `middleware/` - Request validation using Zod
  - `utils/` - Error handling utilities
- **Base path**: All API routes are under `/api`
- **Database initialization**: Creates unique index on `sku` field at startup

### Frontend (React + Mantine)

- **Stack**: React 19, Vite, React Router v7
- **State management**: @tanstack/react-query for server state
- **Forms**: react-hook-form with Zod resolver
- **UI library**: Mantine v8
- **Structure**:
  - `pages/` - CarListPage, CreateCarPage, CarDetailPage
  - `components/` - CreateCarForm, EditCarForm, ExcelUpload, CarCard, CarsTable, Layout
  - `hooks/` - React Query hooks (useCars, useCarMutations, useExcelUpload)
  - `services/api.ts` - Axios client with typed API calls

### Common Package

- `models/` - TypeScript interfaces (Car)
- `schemas/` - Zod validation schemas
- `constants/` - Shared constants (valid colors, year ranges)
- `types/` - API request/response types

## Development Commands

### Initial Setup
```bash
pnpm install
```

### Running the Application

**Option 1: VSCode (Recommended)**
- Use the "Debugging" launch configuration from the debug panel
- Automatically starts MongoDB, backend, and frontend with debugger attached

**Option 2: Manual**
```bash
# Terminal 1: Start MongoDB
docker compose up -d

# Terminal 2: Start backend (http://localhost:3000)
pnpm backend dev

# Terminal 3: Start frontend (http://localhost:5173)
pnpm frontend dev
```

### Per-Package Commands

```bash
# Backend
pnpm backend dev        # Development mode with watch
pnpm backend build      # TypeScript compilation
pnpm backend start      # Run production build

# Frontend
pnpm frontend dev       # Vite dev server
pnpm frontend build     # Production build
pnpm frontend preview   # Preview production build
pnpm frontend lint      # ESLint
```

### Database Management

```bash
# Start MongoDB
docker compose up -d

# Stop MongoDB
docker compose down

# Reset database (removes volumes)
docker compose down -v
```

### Test Data Generation

```bash
cd packages/backend
node scripts/generate-test-data.js
```

Generates 4 Excel files in `test-data/`:
- `cars-valid-insert.xlsx` - 200 valid cars for insertion (tests pagination)
- `cars-valid-update.xlsx` - 200 updates (same SKUs, modified data)
- `cars-invalid-insert.xlsx` - 20 invalid records (various validation failures)
- `cars-invalid-update.xlsx` - 16 invalid updates (including non-existent SKU)

## Data Model & Business Rules

### Car Interface
```typescript
interface Car {
  sku: string;       // Unique, immutable identifier
  model: string;
  make: string;
  price: number;
  year: number;
  color: "red" | "blue" | "green" | "yellow" | "silver" | "black" | "white";
}
```

### Validation Rules
- **SKU**: Immutable after creation, used as primary identifier for lookups and updates
- **Price**: Must be positive number
- **Year**: Reasonable range (MIN_YEAR = 1900, MAX_YEAR = current year + 1)
- **Color**: Must be one of 7 predefined values
- **All fields**: Required, non-empty

### Soft Delete Pattern
- Cars are never physically deleted from the database
- DELETE operations set `deletedAt` timestamp on the document
- All queries filter for `deletedAt: null` to exclude soft-deleted records
- Allows data recovery and maintains referential integrity

### Excel Upload Behavior
- **Two separate endpoints**:
  - `/api/cars/excel/insert` - Insert only, fails if SKU already exists
  - `/api/cars/excel/update` - Update only, fails if SKU doesn't exist
- Excel format matches Car interface (headers: sku, model, make, price, year, color)
- Each row is validated individually using Zod schema
- Invalid rows are reported without blocking valid ones
- Uses MongoDB `bulkWrite` with `ordered: false` for parallel operations
- Returns detailed per-row errors with SKU and error messages

## Tech Stack Specifics

### Dependencies
- **Backend**: hono@^4.9.9, mongodb@^6.20.0, xlsx@latest, zod@^4.1.11
- **Frontend**: react@^19.1.1, @mantine/core@^8.3.2, @tanstack/react-query@^5.90.2, react-hook-form@^7.63.0, react-router-dom@^7.9.3, zod@^4.1.11

### Package Manager
- **pnpm** (v10.15.0) - workspace-aware, must use pnpm for all operations

### TypeScript Configuration
- Each package has its own `tsconfig.json`
- Backend uses path alias `~/` for `src/`
- Frontend imports from common via `@dealership/common`

## Git Conventions

**Commit messages**: Use Conventional Commits format with scopes when appropriate.

Examples:
```
feat(backend): add Excel upload endpoint for batch car import
fix(frontend): correct SKU field disabled state on edit form
chore(common): update Zod schema with stricter year validation
docs: update README with test data generation instructions
refactor(backend): extract Excel parsing into dedicated service
```

Scopes: `backend`, `frontend`, `common`, `config`, `deps`

## Important Notes

- **MongoDB connection**: Hardcoded to `mongodb://localhost:27017` (change if needed in `packages/backend/src/db.ts`)
- **Frontend dev server**: Runs on port 5173 (Vite default)
- **Backend API**: Runs on port 3000, all routes under `/api`
- **CORS**: Enabled for all origins in development
- **No authentication**: This is a simple demo app, no auth required
- **Excel library**: Uses SheetJS from CDN (not npm) for latest version

## MCP Tools

This project is configured to work with Claude Code and the following MCP servers:

### context7 MCP
Provides access to up-to-date library documentation for dependencies used in this project.

**Usage:**
1. Use `resolve-library-id` to find the Context7-compatible library ID for a package (e.g., "react", "hono", "mongodb")
2. Use `get-library-docs` with the library ID to retrieve current documentation, code examples, and API references

**Example workflow:**
```
User: "How do I use Hono's context binding?"
Assistant: [Uses resolve-library-id for "hono" → gets "/honojs/hono"]
Assistant: [Uses get-library-docs with "/honojs/hono" and topic "context binding"]
Assistant: [Provides answer using up-to-date Hono documentation]
```

**Benefits:**
- Always get current documentation (not limited by Claude's knowledge cutoff)
- Access to official examples and best practices
- Avoid deprecated API usage

## Key Files to Reference

- Car type definition: `packages/common/src/models/Car.ts`
- Database setup: `packages/backend/src/db.ts`
- Backend entry: `packages/backend/src/index.ts`
- Frontend entry: `packages/frontend/src/main.tsx`
- Test data script: `packages/backend/scripts/generate-test-data.js`
