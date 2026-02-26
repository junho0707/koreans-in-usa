export type Conversation = {
  id: number;
  otherUserId: number;
  otherDisplayName: string;
  lastMessageBody: string;
  lastMessageAt: string;
  unreadCount: number;
};

export type Message = {
  id: number;
  conversationId: number;
  senderId: number;
  senderDisplayName: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

export interface MessageRepository {
  getConversations(userId: number, cursor?: number, limit?: number): Promise<{ items: Conversation[]; nextCursor: number | null }>;
  getOrCreateConversation(userAId: number, userBId: number): Promise<number>;
  getMessages(conversationId: number, userId: number, cursor?: number, limit?: number): Promise<{ items: Message[]; nextCursor: number | null }>;
  sendMessage(conversationId: number, senderId: number, body: string): Promise<Message>;
  markConversationRead(conversationId: number, userId: number): Promise<void>;
  getUnreadTotal(userId: number): Promise<number>;
}
