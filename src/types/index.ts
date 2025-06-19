export interface LLMProvider {
    id: string;
    name: string;
    icon: string;
    enabled: boolean;
    api_key:string;
}

export interface MCPTool {
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
