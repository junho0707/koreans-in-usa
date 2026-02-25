import { User } from '@/src/domain/entities/user';

export type CreateFromAuthInput = {
  supabaseUid: string;
  email: string | null;
  phone: string | null;
  displayName: string;
};

export type UpdateProfileInput = {
  displayName?: string;
  profileState?: string | null;
  country?: string | null;
  city?: string | null;
  interests?: string[];
  koreanXIdentity?: string | null;
};

export interface UserRepository {
  findBySupabaseUid(uid: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  createFromAuth(input: CreateFromAuthInput): Promise<User>;
  updateProfile(id: number, input: UpdateProfileInput): Promise<User>;
}
