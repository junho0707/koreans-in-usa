exports.up = async (pgm) => {
  pgm.sql(`
    ALTER TABLE topic_tags ADD COLUMN keywords TEXT[] NOT NULL DEFAULT '{}';

    INSERT INTO topic_tags (slug, name, keywords) VALUES
      ('visa', 'Visa', '{"visa","h1b","h-1b","green card","greencard","f1","f-1","opt","cpt","ead","i-140","i-485","immigration","uscis"}'),
      ('housing', 'Housing', '{"housing","rent","apartment","lease","mortgage","landlord","tenant","roommate","deposit","move","moving"}'),
      ('jobs', 'Jobs', '{"job","career","interview","resume","salary","hiring","employment","work","internship","offer","layoff","linkedin"}'),
      ('food', 'Food', '{"food","restaurant","korean food","kimchi","grocery","hmart","h-mart","cooking","recipe","meal"}'),
      ('legal', 'Legal', '{"legal","lawyer","attorney","lawsuit","court","contract","rights","law","sue","dispute"}'),
      ('medical', 'Medical', '{"medical","doctor","hospital","insurance","health","clinic","dentist","pharmacy","prescription","mental health"}'),
      ('school', 'School', '{"school","university","college","student","education","tuition","admission","campus","degree","gpa"}')
    ON CONFLICT (slug) DO UPDATE SET keywords = EXCLUDED.keywords;
  `);
};

exports.down = async (pgm) => {
  pgm.sql(`
    DELETE FROM topic_tags WHERE slug IN ('visa','housing','jobs','food','legal','medical','school');
    ALTER TABLE topic_tags DROP COLUMN IF EXISTS keywords;
  `);
};
