export type UserRole = 'USER' | 'ADMIN';

export type User = {
  id: number;
  supabaseUid: string;
  email: string | null;
  phone: string | null;
  username: string | null;
  displayName: string;
  profileState: string | null;
  country: string | null;
  city: string | null;
  interests: string[];
  koreanXIdentity: string | null;
  role: UserRole;
  isActive: boolean;
  reputation: number;
  badge: string | null;
  createdAt: string;
};
