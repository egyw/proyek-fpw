// Chat types for Tawk.to integration

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'visitor' | 'agent';
  timestamp: string;
  visitorName?: string;
  agentName?: string;
}

export interface ChatConversation {
  id: string;
  visitorName: string;
  visitorEmail?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'closed';
  messages: ChatMessage[];
}

export interface ChatStats {
  activeChats: number;
  totalChats: number;
  avgResponseTime: string;
}
