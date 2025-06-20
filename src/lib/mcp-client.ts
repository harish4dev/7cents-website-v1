export interface MCPTool {
    name: string;
    description: string;
    inputSchema: any;
  }
  
  export class MCPClientManager {
    private tools: MCPTool[] = [];
    private connected = false;
    private serverUrl: string = '';
    private userId: string = '';
  
    constructor() {}
  
    async connect(serverUrl: string, userId: string = 'default-user'): Promise<void> {
      try {
        if (this.connected) {
          await this.disconnect();
        }
  
        this.serverUrl = serverUrl.replace(/\/$/, ''); // Remove trailing slash
        this.userId = userId;
  
        // Test connection with initialize
        const initResponse = await this.makeRequest('initialize', {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          clientInfo: { name: "nextjs-mcp-client", version: "1.0.0" }
        });
  
        if (!initResponse.protocolVersion) {
          throw new Error('Invalid initialize response');
        }
  
        // Get available tools
        const toolsResponse = await this.makeRequest('tools/list', {});
        this.tools = toolsResponse.tools?.map((tool: any) => ({
          name: tool.name,
          description: tool.description || '',
          inputSchema: tool.inputSchema
        })) || [];
  
        this.connected = true;
        console.log('Connected to MCP server with tools:', this.tools.map(t => t.name));
      } catch (error) {
        console.error('Failed to connect to MCP server:', error);
        throw error;
      }
    }
  
    async disconnect(): Promise<void> {
      this.connected = false;
      this.tools = [];
      this.serverUrl = '';
      this.userId = '';
    }
  
    private async makeRequest(method: string, params: any): Promise<any> {
      const url = `${this.serverUrl}/mcp?userId=${encodeURIComponent(this.userId)}`;
      const requestBody = {
        jsonrpc: '2.0',
        method,
        params,
        id: Date.now()
      };
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
  
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`MCP Error: ${data.error.message}`);
      }
  
      return data.result;
    }
  
    // Fixed: Return tools with consistent camelCase naming
    getTools(): MCPTool[] {
      return this.tools;
    }
  
    async callTool(name: string, args: any): Promise<any> {
      if (!this.connected) {
        throw new Error('Not connected to MCP server');
      }
  
      try {
        const result = await this.makeRequest('tools/call', {
          name,
          arguments: args
        });
        return result;
      } catch (error) {
        console.error(`Tool call failed for ${name}:`, error);
        throw error;
      }
    }
  
    isConnected(): boolean {
      return this.connected;
    }
  
    getToolsList(): MCPTool[] {
      return this.tools;
    }
  }
  
  // Global instance
  let mcpClientInstance: MCPClientManager | null = null;
  
  export function getMCPClient(): MCPClientManager {
    if (!mcpClientInstance) {
      mcpClientInstance = new MCPClientManager();
    }
    return mcpClientInstance;
  }