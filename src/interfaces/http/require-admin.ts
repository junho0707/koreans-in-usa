import { PgUserRepository } from '@/src/infrastructure/repositories/pg-user-repository';

const userRepo = new PgUserRepository();

export async function requireAdmin(userId: number): Promise<void> {
  const user = await userRepo.findById(userId);
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }
}
