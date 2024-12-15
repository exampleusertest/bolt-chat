export interface User {
  id: number;
  email: string;
  username: string;
  avatarUrl?: string;
}

export interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId?: number;
  channelId?: number;
  createdAt: string;
  sender: {
    username: string;
    avatarUrl?: string;
  };
}

export interface Channel {
  id: number;
  name: string;
  description?: string;
  createdBy: number;
  createdAt: string;
}