import pg from 'pg';
import { readFileSync } from 'fs';

// Read .env.local manually
const envContent = readFileSync('.env.local', 'utf-8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)="?([^"]*)"?$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const connectionString = process.env.DATABASE_URL.replace(
  /[?&]sslmode=[^&]*/g,
  (match) => match.startsWith('?') ? '?' : '',
).replace(/\?$/, '');

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const sql = `
  CREATE TABLE IF NOT EXISTS communities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(60) NOT NULL UNIQUE,
    description VARCHAR(500),
    scope VARCHAR(10) NOT NULL DEFAULT 'USA',
    region_id TEXT REFERENCES regions(id),
    privacy VARCHAR(10) NOT NULL DEFAULT 'PUBLIC',
    leader_id BIGINT NOT NULL REFERENCES users(id),
    kakao_link VARCHAR(500),
    member_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS community_members (
    id SERIAL PRIMARY KEY,
    community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(15) NOT NULL DEFAULT 'MEMBER',
    status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(community_id, user_id)
  );

  ALTER TABLE posts ADD COLUMN IF NOT EXISTS community_id INTEGER REFERENCES communities(id);

  CREATE TABLE IF NOT EXISTS community_events (
    id SERIAL PRIMARY KEY,
    community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    creator_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(100) NOT NULL,
    description VARCHAR(2000),
    location VARCHAR(200),
    event_date TIMESTAMPTZ NOT NULL,
    event_end_date TIMESTAMPTZ,
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    max_attendees INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS event_rsvps (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES community_events(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(15) NOT NULL DEFAULT 'GOING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, user_id)
  );

  CREATE INDEX IF NOT EXISTS idx_communities_scope ON communities(scope);
  CREATE INDEX IF NOT EXISTS idx_communities_region ON communities(region_id);
  CREATE INDEX IF NOT EXISTS idx_communities_leader ON communities(leader_id);
  CREATE INDEX IF NOT EXISTS idx_communities_slug ON communities(slug);
  CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
  CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);
  CREATE INDEX IF NOT EXISTS idx_posts_community ON posts(community_id);
  CREATE INDEX IF NOT EXISTS idx_community_events_community ON community_events(community_id);
  CREATE INDEX IF NOT EXISTS idx_community_events_date ON community_events(event_date);
  CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON event_rsvps(event_id);
`;

try {
  await pool.query(sql);
  console.log('Migration 016 applied successfully!');
} catch (err) {
  console.error('Migration failed:', err.message);
} finally {
  await pool.end();
}
