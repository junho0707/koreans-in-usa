# Agent Rules

- Implement ONLY what SPEC.md says. Do not invent features.
- If anything is ambiguous, STOP and ask a question before coding.
- Use Next.js App Router + React + TypeScript.
- Prefer simple, explicit SQL (Postgres) over ORMs. Use `pg` (node-postgres), no ORM.
- Database is Supabase Postgres. Read DATABASE_URL from env.
- Use Supabase **transaction pooler** connection string (port **6543**).
- Use SSL for Postgres connections in production (DATABASE_URL includes `sslmode=require`).
- Use node-pg-migrate for migrations. SQL migrations live in /db/migrations.
- Use vitest for tests.
- Add appropriate indexes for feed performance (created_at, region_id, scope_usa, scope_region, votes target columns).
- Feed pages must support client infinite scroll.
- Add tests for feed composition, ranking, and cursor pagination.
- After changes, run: typecheck, lint, tests; report results.
