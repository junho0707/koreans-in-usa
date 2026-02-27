import { pool } from '@/src/lib/db';
import { getBadgeForReputation } from '@/src/domain/services/reputation';

export async function addReputation(userId: number, points: number): Promise<void> {
  const { rows } = await pool.query<{ reputation: number }>(
    'UPDATE users SET reputation = reputation + $2 WHERE id = $1 RETURNING reputation',
    [userId, points],
  );
  if (rows[0]) {
    const newRep = Number(rows[0].reputation);
    const badge = getBadgeForReputation(newRep);
    await pool.query('UPDATE users SET badge = $2 WHERE id = $1', [userId, badge]);
  }
}
