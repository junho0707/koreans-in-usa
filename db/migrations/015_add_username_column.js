exports.up = async (pgm) => {
  pgm.addColumn('users', {
    username: { type: 'text', default: null },
  });
  pgm.sql('CREATE UNIQUE INDEX idx_users_username_lower ON users(LOWER(username))');
};

exports.down = async (pgm) => {
  pgm.sql('DROP INDEX IF EXISTS idx_users_username_lower');
  pgm.dropColumn('users', ['username']);
};
