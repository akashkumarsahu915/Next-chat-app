export interface User {
  id: string;
  uid: string; // Unique 6-digit ID
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  status?: string;
  isOnline: boolean;
  isPrivate: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image';
  status: 'sent' | 'delivered' | 'read';
}

export interface Chat {
  id: string;
  name?: string;
  isGroup: boolean;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
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
