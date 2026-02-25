exports.up = async (pgm) => {
  pgm.sql(`
    CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');

    ALTER TABLE users
      ADD COLUMN supabase_uid UUID UNIQUE,
      ADD COLUMN country TEXT,
      ADD COLUMN city TEXT,
      ADD COLUMN interests TEXT[] NOT NULL DEFAULT '{}',
      ADD COLUMN korean_x_identity TEXT,
      ADD COLUMN role user_role NOT NULL DEFAULT 'USER',
      ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

    CREATE INDEX idx_users_supabase_uid ON users(supabase_uid);
  `);
};

exports.down = async (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_users_supabase_uid;

    ALTER TABLE users
      DROP COLUMN IF EXISTS supabase_uid,
      DROP COLUMN IF EXISTS country,
      DROP COLUMN IF EXISTS city,
      DROP COLUMN IF EXISTS interests,
      DROP COLUMN IF EXISTS korean_x_identity,
      DROP COLUMN IF EXISTS role,
      DROP COLUMN IF EXISTS is_active;

    DROP TYPE IF EXISTS user_role;
  `);
};
