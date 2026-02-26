exports.up = async (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS post_views (
      id SERIAL PRIMARY KEY,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id),
      ip_hash TEXT,
      viewed_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_post_views_post ON post_views(post_id);
    CREATE INDEX IF NOT EXISTS idx_post_views_user ON post_views(user_id) WHERE user_id IS NOT NULL;

    ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
  `);
};

exports.down = async (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS post_views;
    ALTER TABLE posts DROP COLUMN IF EXISTS view_count;
  `);
};
