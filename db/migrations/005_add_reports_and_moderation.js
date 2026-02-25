exports.up = async (pgm) => {
  pgm.sql(`
    CREATE TYPE report_target_type AS ENUM ('POST', 'COMMENT');

    CREATE TABLE reports (
      id BIGSERIAL PRIMARY KEY,
      reporter_id BIGINT NOT NULL REFERENCES users(id),
      target_type report_target_type NOT NULL,
      target_id BIGINT NOT NULL,
      reason TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(reporter_id, target_type, target_id)
    );

    ALTER TABLE posts
      ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN report_count INT NOT NULL DEFAULT 0;

    ALTER TABLE comments
      ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN report_count INT NOT NULL DEFAULT 0;

    CREATE INDEX idx_reports_target ON reports(target_type, target_id);
    CREATE INDEX idx_posts_hidden ON posts(is_hidden);
    CREATE INDEX idx_comments_hidden ON comments(is_hidden);
  `);
};

exports.down = async (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_comments_hidden;
    DROP INDEX IF EXISTS idx_posts_hidden;
    DROP INDEX IF EXISTS idx_reports_target;

    ALTER TABLE comments
      DROP COLUMN IF EXISTS is_hidden,
      DROP COLUMN IF EXISTS report_count;

    ALTER TABLE posts
      DROP COLUMN IF EXISTS is_hidden,
      DROP COLUMN IF EXISTS report_count;

    DROP TABLE IF EXISTS reports;
    DROP TYPE IF EXISTS report_target_type;
  `);
};
