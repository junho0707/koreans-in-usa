exports.up = async (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS announcements (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT,
      type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success')),
      is_active BOOLEAN DEFAULT TRUE,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
};

exports.down = async (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS announcements;');
};
