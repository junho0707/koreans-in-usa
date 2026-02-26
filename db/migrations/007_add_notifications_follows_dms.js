exports.up = async (pgm) => {
  pgm.sql(`
    -- Notification types
    CREATE TYPE notification_type AS ENUM (
      'COMMENT_ON_POST',
      'REPLY_TO_COMMENT',
      'ACCEPTED_ANSWER',
      'NEW_FOLLOWER',
      'DM_RECEIVED'
    );

    -- Notifications
    CREATE TABLE notifications (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type notification_type NOT NULL,
      actor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
      post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
      comment_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
      message_id BIGINT,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

    -- Follows
    CREATE TABLE follows (
      id BIGSERIAL PRIMARY KEY,
      follower_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      following_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(follower_id, following_id),
      CHECK(follower_id != following_id)
    );

    CREATE INDEX idx_follows_follower ON follows(follower_id);
    CREATE INDEX idx_follows_following ON follows(following_id);

    -- Direct messages
    CREATE TABLE conversations (
      id BIGSERIAL PRIMARY KEY,
      user_a_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_b_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_a_id, user_b_id),
      CHECK(user_a_id < user_b_id)
    );

    CREATE TABLE messages (
      id BIGSERIAL PRIMARY KEY,
      conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_messages_convo ON messages(conversation_id, created_at DESC);
    CREATE INDEX idx_conversations_user_a ON conversations(user_a_id, last_message_at DESC);
    CREATE INDEX idx_conversations_user_b ON conversations(user_b_id, last_message_at DESC);

    -- Add foreign key for notifications.message_id now that messages table exists
    ALTER TABLE notifications
      ADD CONSTRAINT fk_notifications_message
      FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE;

    -- Reputation columns on users
    ALTER TABLE users
      ADD COLUMN reputation INT NOT NULL DEFAULT 0,
      ADD COLUMN badge TEXT;
  `);
};

exports.down = async (pgm) => {
  pgm.sql(`
    ALTER TABLE users DROP COLUMN IF EXISTS badge;
    ALTER TABLE users DROP COLUMN IF EXISTS reputation;
    ALTER TABLE notifications DROP CONSTRAINT IF EXISTS fk_notifications_message;
    DROP TABLE IF EXISTS messages;
    DROP TABLE IF EXISTS conversations;
    DROP TABLE IF EXISTS follows;
    DROP TABLE IF EXISTS notifications;
    DROP TYPE IF EXISTS notification_type;
  `);
};
