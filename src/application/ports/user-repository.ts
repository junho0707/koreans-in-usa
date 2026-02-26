import { User } from '@/src/domain/entities/user';

export type CreateFromAuthInput = {
  supabaseUid: string;
  email: string | null;
  phone: string | null;
  displayName: string;
  username?: string;
};

export type UpdateProfileInput = {
  displayName?: string;
  username?: string;
  profileState?: string | null;
  country?: string | null;
  city?: string | null;
  interests?: string[];
  koreanXIdentity?: string | null;
};

export type UserPostSummary = {
  id: number;
  title: string;
  type: string;
  score: number;
  commentCount: number;
  createdAt: string;
};

export type UserCommentSummary = {
  id: number;
  postId: number;
  postTitle: string;
  body: string;
  score: number;
  createdAt: string;
};

export interface UserRepository {
  findBySupabaseUid(uid: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  isUsernameTaken(username: string): Promise<boolean>;
  createFromAuth(input: CreateFromAuthInput): Promise<User>;
  updateProfile(id: number, input: UpdateProfileInput): Promise<User>;
  getPostsByUser(userId: number, cursor?: number, limit?: number): Promise<{ items: UserPostSummary[]; nextCursor: number | null }>;
  getCommentsByUser(userId: number, cursor?: number, limit?: number): Promise<{ items: UserCommentSummary[]; nextCursor: number | null }>;
  deactivate(userId: number): Promise<void>;
}
