import { NextRequest, NextResponse } from 'next/server';
import { getMCPClient } from '@/lib/mcp-client';

export async function POST(request: NextRequest) {
  try {
    const { serverUrl, userId } = await request.json();
    
    if (!serverUrl) {
      return NextResponse.json(
        { error: 'Server URL is required' },
        { status: 400 }
      );
    }

    const mcpClient = getMCPClient();
    await mcpClient.connect(serverUrl, userId || 'default-user');
    
    const tools = mcpClient.getToolsList();
    
    return NextResponse.json({
      success: true,
      tools: tools.map(tool => ({
        name: tool.name,
        description: tool.description
      }))
    });
  } catch (error) {
    console.error('MCP connection error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to connect to MCP server' },
      { status: 500 }
    );
  }
}