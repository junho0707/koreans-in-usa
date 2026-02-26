exports.up = async (pgm) => {
  pgm.sql(`
    ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE;
    CREATE INDEX idx_posts_pinned ON posts(is_pinned) WHERE is_pinned = TRUE;
  `);
};

exports.down = async (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_posts_pinned;
    ALTER TABLE posts DROP COLUMN IF EXISTS is_pinned;
  `);
};
