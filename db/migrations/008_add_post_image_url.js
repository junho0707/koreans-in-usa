exports.up = async (pgm) => {
  pgm.sql(`
    ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url TEXT;
  `);
};

exports.down = async (pgm) => {
  pgm.sql(`
    ALTER TABLE posts DROP COLUMN IF EXISTS image_url;
  `);
};
