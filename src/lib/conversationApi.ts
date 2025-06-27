// lib/conversationApi.ts
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3333';

export interface ConversationSummary {
  id: string;
  title: string;
  lastLLM: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  llmProvider?: string;
  toolResults?: any;
  createdAt: string;
}

export interface ConversationDetail {
  conversation: {
    id: string;
    title: string;
    lastLLM: string;
    createdAt: string;
    updatedAt: string;
  };
  messages: ConversationMessage[];
}

export const conversationApi = {
  // Get all conversations for a user
  async getConversations(userId: string): Promise<ConversationSummary[]> {
    const response = await fetch(`${BACKEND_URL}/api/conversations?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }
    return response.json();
  },

  // Get conversation with messages
  async getConversation(conversationId: string): Promise<ConversationDetail> {
    const response = await fetch(`${BACKEND_URL}/api/conversations/${conversationId}/messages`);
    if (!response.ok) {
      throw new Error('Failed to fetch conversation');
    }
    return response.json();
  },

  // Create new conversation
  async createConversation(data: {
    userId: string;
    title: string;
    lastLLM: string;
    messages?: Array<{
      role: string;
      content: string;
      llmProvider?: string;
      toolResults?: any;
    }>;
  }): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create conversation');
    }
    return response.json();
  },

  // Add message to conversation
  async addMessage(conversationId: string, data: {
    role: string;
    content: string;
    llmProvider?: string;
    toolResults?: any;
  }): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to add message');
    }
    return response.json();
  },

  // Update conversation
  async updateConversation(conversationId: string, data: {
    title?: string;
    lastLLM?: string;
  }): Promise<any> {
    const response = await fetch(`${BACKEND_URL}/api/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update conversation');
    }
    return response.json();
  },

  // Delete conversation
  async deleteConversation(conversationId: string): Promise<void> {
    const response = await fetch(`${BACKEND_URL}/api/conversations/${conversationId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete conversation');
    }
  },
};