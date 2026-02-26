/** @param {import('pg').Pool} pool */
export async function up(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reactions (
      id SERIAL PRIMARY KEY,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      emoji TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (post_id, user_id, emoji)
    );

    CREATE INDEX IF NOT EXISTS idx_reactions_post ON reactions(post_id);
  `);
}
