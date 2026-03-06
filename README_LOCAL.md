# Local Development Setup

This guide provides step-by-step instructions to run the Darency project locally.

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Setup Steps

### 1. Clone the repository

```bash
git clone https://github.com/withteddy00/darency-saas.git
cd darency-saas
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

The project is pre-configured to use SQLite for local development. The `.env` file should contain:

```env
# Database - SQLite for local development
DATABASE_URL="file:./dev.db"

# For PostgreSQL production, uncomment and configure:
# DATABASE_URL="postgresql://user:password@localhost:5432/darency"

# NextAuth
NEXTAUTH_SECRET="development-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Generate Prisma client & create database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates SQLite file)
npm run db:push
```

### 5. Seed the database with demo data

```bash
npm run db:seed
```

This will create:
- 1 Organization (Darency Property Management)
- 1 Residence (Résidence Al-Manar)
- 3 Apartments
- 3 Demo users (Owner, Admin, Resident)
- Sample expenses, payments, and maintenance requests

### 6. Run development server

```bash
npm run dev
```

The app will be available at http://localhost:3000

## Demo Credentials

After seeding the database, you can log in with these accounts:

| Role | Email | Password | Scope | Redirects to |
|------|-------|----------|-------|-------------|
| **OWNER** | owner@darency.ma | Owner123! | Global (all residences) | /owner |
| **ADMIN** | admin@darency.ma | Admin123! | Single residence | /admin |
| **ADMIN 2** | admin-rabat@darency.ma | Admin123! | Single residence | /admin |
| **RESIDENT** | resident@darency.ma | Resident123! | Own apartment | /resident |

### Role Scoping Rules

Darency enforces strict role-based access control:

#### OWNER (Global Super Admin)
- **Scope**: Organization/Platform level
- **Permissions**:
  - Can view and manage ALL residences
  - Can create, edit, and delete residences
  - Can create and manage ADMIN users
  - Can assign ADMIN to a specific residence
  - Has access to global statistics and platform settings
- **Residence Assignment**: NOT tied to any single residence (global access)

#### ADMIN (Syndic/Manager)
- **Scope**: Exactly ONE residence
- **Permissions**:
  - Can only manage their assigned residence
  - Can manage apartments, residents, charges, payments, maintenance requests
  - Can create announcements and documents for their residence
- **Residence Assignment**: MUST be assigned to exactly one residence via `adminForResidenceId`
- **Restrictions**: Cannot access other residences or global owner pages

#### RESIDENT
- **Scope**: Own apartment
- **Permissions**:
  - Can view their own charges and payments
  - Can submit maintenance requests
  - Can view announcements and documents for their residence
- **Residence Assignment**: Linked to one apartment via `apartmentId`

### API Access Control

All API endpoints enforce role scoping:
- `GET /api/charges`: OWNER sees all, ADMIN sees only their residence
- `POST /api/charges`: ADMIN must have assigned residence
- `GET /api/residents`: OWNER sees all, ADMIN sees only their residence
- `POST /api/residents`: ADMIN must have assigned residence

If an ADMIN attempts to access endpoints without an assigned residence, they receive:
```
403 Forbidden: "Admin residence not assigned. Please contact the owner."
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed database with demo data |

## Database

- **Local (SQLite)**: `dev.db` file in project root
- **Production (PostgreSQL)**: Set `DATABASE_URL` in `.env`

### Switching to PostgreSQL

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/darency"
```

3. Regenerate and push:
```bash
npx prisma generate
npm run db:push
npm run db:seed
```

## Troubleshooting

### Port already in use
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Reset database
```bash
rm dev.db
npm run db:push
npm run db:seed
```

### Clear node_modules and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```
