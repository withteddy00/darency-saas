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

The project is pre-configured to use SQLite for local development. A `.env` file is already included:

```
DATABASE_URL="file:./dev.db"
```

For PostgreSQL (production), update `.env`:
```bash
# For production with PostgreSQL:
# DATABASE_URL="postgresql://user:password@localhost:5432/darency"
```

### 4. Generate Prisma client & create database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates SQLite file)
npm run db:push
```

### 5. Run development server

```bash
npm run dev
```

The app will be available at http://localhost:3000

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
```

### Clear node_modules and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```
