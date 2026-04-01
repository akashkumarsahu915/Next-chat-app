export * from './auth';

export interface User {
  _id: string;
  uid: string; // Unique 6-digit ID
  username: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  status?: string;
  isOnline?: boolean;
  isPrivate?: boolean;
  interests?: string[];
  notificationSettings?: {
    pushEnabled: boolean;
    newMessages: boolean;
    friendRequests: boolean;
    systemAlerts: boolean;
  };
}

export interface Message {
  _id: string;
  chatId: string;
  senderId: string | Partial<User>;
  content: string;
  timestamp?: string; // Legacy fallback
  createdAt: string;
  updatedAt: string;
  type: 'text' | 'image' | 'file';
  status: 'sent' | 'delivered' | 'read';
  readBy?: string[];
}

export interface Chat {
  _id: string;
  name?: string; // Local display name fallback
  groupName?: string; // Backend group name
  isGroup: boolean;
  participants: User[];
  lastMessage?: Message;
  unreadCount?: number; // Legacy fallback
  unreadCounts?: Record<string, number>; // Backend unread counts mapping
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequest {
  id: string;
  from: User;
  to: User;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  type: 'message' | 'friend_request' | 'system';
  link?: string;
}
