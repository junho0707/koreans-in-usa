exports.up = async (pgm) => {
  pgm.sql(`
    INSERT INTO regions (id, name, slug)
    VALUES
      ('NE', 'Northeast', 'northeast'),
      ('S', 'South', 'south'),
      ('MW', 'Midwest', 'midwest'),
      ('W', 'West', 'west')
    ON CONFLICT (id) DO NOTHING;
  `);
};

exports.down = async (pgm) => {
  pgm.sql(`DELETE FROM regions WHERE id IN ('NE', 'S', 'MW', 'W');`);
};
