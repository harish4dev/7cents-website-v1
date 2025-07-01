import { ChatResponse, Message } from '@/types';
import { API_ENDPOINTS } from './constants';

export class ApiClient {
  private static async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  static async sendMessage(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    selectedLLM: string,
    conversationId: string | null,
    userId: string
  ): Promise<ChatResponse> {
    return this.request<ChatResponse>(API_ENDPOINTS.CHAT, {
      method: 'POST',
      body: JSON.stringify({
        messages,
        selectedLLM,
        conversationId,
        userId,
      }),
    });
  }

  static async loadConversation(conversationId: string) {
    return this.request(API_ENDPOINTS.MESSAGES(conversationId));
  }

  static async connectMCP(serverUrl: string, userId: string) {
    return this.request(API_ENDPOINTS.MCP_CONNECT, {
      method: 'POST',
      body: JSON.stringify({ serverUrl, userId }),
    });
  }
}