export interface LLMProvider {
    id: string;
    name: string;
    icon: string;
    enabled: boolean;
    api_key:string;
}

export interface Tool {
    id: string;
    name: string;
    description: string;
    authRequired: boolean;
    authorized: boolean;
    category?: string;
    icon?: string;
    status: 'active' | 'inactive' | 'error';
    connected: boolean;
}


export interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    llmProvider?: string;
    mcpTools?: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  llmProvider?: string;
  toolResults?: ToolResult[];
}

export interface ToolResult {
  toolName: string;
  toolArgs: any;
  result: any;
}

export interface ChatResponse {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  toolResults?: ToolResult[];
  conversationId?: string;
}

export interface LLMProvider {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  api_key: string;
}

// export interface Tool {
//   id: string;
//   name: string;
//   description: string;
//   enabled: boolean;
// }

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
