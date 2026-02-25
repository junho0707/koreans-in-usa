exports.up = async (pgm) => {
  pgm.sql(`
    -- Full-text search index on posts
    ALTER TABLE posts ADD COLUMN IF NOT EXISTS search_vector tsvector;

    CREATE OR REPLACE FUNCTION posts_search_vector_update() RETURNS trigger AS $$
    BEGIN
      NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.body, '')), 'B');
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER posts_search_vector_trigger
      BEFORE INSERT OR UPDATE OF title, body ON posts
      FOR EACH ROW EXECUTE FUNCTION posts_search_vector_update();

    -- Backfill existing posts
    UPDATE posts SET search_vector =
      setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
      setweight(to_tsvector('english', COALESCE(body, '')), 'B');

    CREATE INDEX idx_posts_search ON posts USING GIN(search_vector);

    -- Bookmarks table
    CREATE TABLE bookmarks (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, post_id)
    );

    CREATE INDEX idx_bookmarks_user ON bookmarks(user_id, created_at DESC);
  `);
};

exports.down = async (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS bookmarks;
    DROP INDEX IF EXISTS idx_posts_search;
    DROP TRIGGER IF EXISTS posts_search_vector_trigger ON posts;
    DROP FUNCTION IF EXISTS posts_search_vector_update();
    ALTER TABLE posts DROP COLUMN IF EXISTS search_vector;
  `);
};
