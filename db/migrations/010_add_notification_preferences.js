exports.up = async (pgm) => {
  pgm.addColumn('users', {
    email_notifications: { type: 'boolean', default: true, notNull: true },
    notification_dm: { type: 'boolean', default: true, notNull: true },
    notification_comments: { type: 'boolean', default: true, notNull: true },
    notification_follows: { type: 'boolean', default: true, notNull: true },
    notification_mentions: { type: 'boolean', default: true, notNull: true },
  });
};

exports.down = async (pgm) => {
  pgm.dropColumn('users', [
    'email_notifications',
    'notification_dm',
    'notification_comments',
    'notification_follows',
    'notification_mentions',
  ]);
};
