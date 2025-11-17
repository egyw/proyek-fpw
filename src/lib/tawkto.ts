// Tawk.to API Helper Functions

const TAWKTO_API_BASE = 'https://api.tawk.to/v3';
const API_KEY = process.env.TAWKTO_API_KEY;
const PROPERTY_ID = process.env.TAWKTO_PROPERTY_ID;

if (!API_KEY || !PROPERTY_ID) {
  console.warn('[Tawk.to] API Key or Property ID not found in environment variables');
}

// Tawk.to API response types
interface TawktoApiResponse {
  id?: string;
  _id?: string;
  visitor?: {
    name?: string;
    email?: string;
  };
  lastMessage?: {
    text?: string;
    time?: string;
  };
  messages?: Array<{
    id?: string;
    _id?: string;
    text: string;
    time?: string;
    createdAt?: string;
    type?: 'visitor' | 'agent';
    sender?: {
      type?: 'visitor' | 'agent';
      name?: string;
    };
  }>;
  status?: 'open' | 'closed';
  unread?: {
    count?: number;
  };
  updatedAt?: string;
}

/**
 * Fetch all conversations from Tawk.to API
 */
export async function getTawktoConversations() {
  try {
    const response = await fetch(
      `${TAWKTO_API_BASE}/properties/${PROPERTY_ID}/conversations`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Tawk.to API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[getTawktoConversations] Error:', error);
    throw error;
  }
}

/**
 * Fetch single conversation with messages
 */
export async function getTawktoConversation(conversationId: string) {
  try {
    const response = await fetch(
      `${TAWKTO_API_BASE}/conversations/${conversationId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Tawk.to API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[getTawktoConversation] Error:', error);
    throw error;
  }
}

/**
 * Send message to conversation
 */
export async function sendTawktoMessage(conversationId: string, message: string, agentName: string) {
  try {
    const response = await fetch(
      `${TAWKTO_API_BASE}/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message,
          sender: {
            type: 'agent',
            name: agentName,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Tawk.to API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[sendTawktoMessage] Error:', error);
    throw error;
  }
}

/**
 * Transform Tawk.to conversation to our format
 */
export function transformTawktoConversation(tawktoData: TawktoApiResponse) {
  return {
    id: tawktoData.id || tawktoData._id || '',
    visitorName: tawktoData.visitor?.name || 'Anonymous',
    visitorEmail: tawktoData.visitor?.email,
    lastMessage: tawktoData.lastMessage?.text || '',
    lastMessageTime: tawktoData.lastMessage?.time || tawktoData.updatedAt || new Date().toISOString(),
    unreadCount: tawktoData.unread?.count || 0,
    status: tawktoData.status === 'closed' ? ('closed' as const) : ('active' as const),
    messages: tawktoData.messages?.map((msg) => ({
      id: msg.id || msg._id || '',
      text: msg.text,
      sender: msg.sender?.type || msg.type || 'visitor',
      timestamp: msg.time || msg.createdAt || new Date().toISOString(),
      visitorName: msg.sender?.type === 'visitor' ? tawktoData.visitor?.name : undefined,
      agentName: msg.sender?.type === 'agent' ? msg.sender?.name : undefined,
    })) || [],
  };
}
