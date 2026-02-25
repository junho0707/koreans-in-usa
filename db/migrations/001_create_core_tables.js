exports.up = async (pgm) => {
  pgm.sql(`
    CREATE TYPE post_type AS ENUM ('QA', 'TIP', 'GENERAL');
    CREATE TYPE vote_target_type AS ENUM ('POST', 'COMMENT');
    CREATE TYPE tag_source AS ENUM ('USER', 'AUTO');
    CREATE TYPE news_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

    CREATE TABLE users (
      id BIGSERIAL PRIMARY KEY,
      email TEXT UNIQUE,
      phone TEXT UNIQUE,
      display_name TEXT NOT NULL,
      profile_state TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE regions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE
    );

    CREATE TABLE posts (
      id BIGSERIAL PRIMARY KEY,
      author_id BIGINT NOT NULL REFERENCES users(id),
      type post_type NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      scope_usa BOOLEAN NOT NULL DEFAULT FALSE,
      scope_region BOOLEAN NOT NULL DEFAULT FALSE,
      region_id TEXT REFERENCES regions(id),
      state_code TEXT,
      metro_area TEXT,
      accepted_comment_id BIGINT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT posts_scope_region_check CHECK ((scope_region = FALSE) OR (region_id IS NOT NULL))
    );

    CREATE TABLE comments (
      id BIGSERIAL PRIMARY KEY,
      post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      author_id BIGINT NOT NULL REFERENCES users(id),
      parent_comment_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE posts
      ADD CONSTRAINT posts_accepted_comment_fk
      FOREIGN KEY (accepted_comment_id) REFERENCES comments(id) ON DELETE SET NULL;

    CREATE TABLE votes (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id),
      target_type vote_target_type NOT NULL,
      target_id BIGINT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, target_type, target_id)
    );

    CREATE TABLE topic_tags (
      id BIGSERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE post_topic_tags (
      post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      topic_tag_id BIGINT NOT NULL REFERENCES topic_tags(id) ON DELETE CASCADE,
      source tag_source NOT NULL,
      PRIMARY KEY(post_id, topic_tag_id)
    );

    CREATE TABLE news_items (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT,
      url TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL,
      published_at TIMESTAMPTZ NOT NULL,
      tags TEXT[] NOT NULL DEFAULT '{}',
      status news_status NOT NULL DEFAULT 'DRAFT',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_posts_scope_usa_created_at ON posts(scope_usa, created_at DESC);
    CREATE INDEX idx_posts_scope_region_region_created_at ON posts(scope_region, region_id, created_at DESC);
    CREATE INDEX idx_posts_type_created_at ON posts(type, created_at DESC);
    CREATE INDEX idx_posts_state_created_at ON posts(state_code, created_at DESC);
    CREATE INDEX idx_votes_target ON votes(target_type, target_id);
    CREATE INDEX idx_comments_post_created_at ON comments(post_id, created_at DESC);
    CREATE INDEX idx_post_topic_tags_topic_post ON post_topic_tags(topic_tag_id, post_id);
  `);
};

exports.down = async (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS news_items;
    DROP TABLE IF EXISTS post_topic_tags;
    DROP TABLE IF EXISTS topic_tags;
    DROP TABLE IF EXISTS votes;
    DROP TABLE IF EXISTS comments;
    DROP TABLE IF EXISTS posts;
    DROP TABLE IF EXISTS regions;
    DROP TABLE IF EXISTS users;
    DROP TYPE IF EXISTS news_status;
    DROP TYPE IF EXISTS tag_source;
    DROP TYPE IF EXISTS vote_target_type;
    DROP TYPE IF EXISTS post_type;
  `);
};
