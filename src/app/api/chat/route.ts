import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part, Content, FunctionDeclaration } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { getMCPClient } from '@/lib/mcp-client';

// Initialize LLM clients
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "AIzaSyCzzwMECJYtC-1WyAP3Paj7UXanCTN75nM");
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Tool mapping functions for different providers
function mapToolsToGeminiFormat(tools: any[]): FunctionDeclaration[] {
  return tools.map(tool => {
    const { inputSchema, ...restOfTool } = tool; 
    return {
      ...restOfTool,
      parameters: inputSchema,
    };
  });
}

function mapToolsToClaudeFormat(tools: any[]) {
  return tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.inputSchema,
  }));
}

function mapToolsToOpenAIFormat(tools: any[]) {
  return tools.map(tool => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    }
  }));
}

// Message mapping functions
function mapMessagesToGemini(messages: any[]): Content[] {
  return messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : msg.role,
    parts: [{ text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) }],
  }));
}

function mapMessagesToClaude(messages: any[]) {
  return messages.map(msg => ({
    role: msg.role,
    content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
  }));
}

function mapMessagesToOpenAI(messages: any[]) {
  return messages.map(msg => ({
    role: msg.role,
    content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
  }));
}

// Save conversation to backend
// Save conversation to backend
async function saveConversation(conversationId: string | null, userId: string, allMessages: any[], selectedLLM: string, newMessagesToSave: any[], toolResults: any[] = []) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3333';
    
    if (!conversationId) {
      // Create new conversation - save all messages
      const title = generateConversationTitle(allMessages[0]?.content || 'New Conversation');
      
      const response = await fetch(`${backendUrl}/api/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          title,
          lastLLM: selectedLLM,
          messages: allMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
            llmProvider: msg.role === 'assistant' ? selectedLLM : null,
            toolResults: msg.role === 'assistant' && toolResults.length > 0 ? toolResults : null,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.id;
      }
    } else {
      // Update existing conversation - save only new messages
      for (const message of newMessagesToSave) {
        await fetch(`${backendUrl}/api/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: message.role,
            content: message.content,
            llmProvider: message.role === 'assistant' ? selectedLLM : null,
            toolResults: message.role === 'assistant' && toolResults.length > 0 ? toolResults : null,
          }),
        });
      }

      // Update lastLLM
      await fetch(`${backendUrl}/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastLLM: selectedLLM,
        }),
      });

      return conversationId;
    }
  } catch (error) {
    console.error('Error saving conversation:', error);
    return null;
  }
}

// Generate conversation title from first message
function generateConversationTitle(content: string): string {
  const words = content.split(' ').slice(0, 6);
  return words.join(' ') + (content.split(' ').length > 6 ? '...' : '');
}

// Gemini chat handler
async function handleGeminiChat(messages: any[], mcpTools: any[], mcpClient: any) {
  const geminiFormattedTools = mapToolsToGeminiFormat(mcpTools);
  
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    tools: geminiFormattedTools.length > 0 ? [{ functionDeclarations: geminiFormattedTools }] : undefined,
  });

  const chat = model.startChat({
    history: mapMessagesToGemini(messages.slice(0, -1)),
  });

  const lastMessage = messages[messages.length - 1];
  const initialResult = await chat.sendMessage(lastMessage.content);
  
  const response = initialResult.response;
  const responseMessages = [];
  const toolResults = [];
  const functionCalls = response.functionCalls();

  if (functionCalls && functionCalls.length > 0) {
    const call = functionCalls[0];
    try {
      const toolResultContent = await mcpClient.callTool(call.name, call.args);
      toolResults.push({ toolName: call.name, toolArgs: call.args, result: toolResultContent });
      const toolResponsePart: Part = { functionResponse: { name: call.name, response: { result: toolResultContent } } };
      const finalResult = await chat.sendMessage([toolResponsePart]);
      responseMessages.push({ role: 'assistant' as const, content: finalResult.response.text() });
    } catch (toolError: any) {
      responseMessages.push({ role: 'assistant' as const, content: `Error executing tool ${call.name}: ${toolError.message || toolError}` });
    }
  } else {
    responseMessages.push({ role: 'assistant' as const, content: response.text() });
  }

  return { messages: responseMessages, toolResults };
}

// Claude chat handler
async function handleClaudeChat(messages: any[], mcpTools: any[], mcpClient: any) {
  const claudeFormattedTools = mapToolsToClaudeFormat(mcpTools);
  const claudeMessages = mapMessagesToClaude(messages);

  const params: any = {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    messages: claudeMessages,
  };

  if (claudeFormattedTools.length > 0) {
    params.tools = claudeFormattedTools;
  }

  const response = await anthropic.messages.create(params);
  
  const responseMessages = [];
  const toolResults = [];

  for (const block of response.content) {
    if (block.type === 'text') {
      responseMessages.push({ role: 'assistant' as const, content: block.text });
    } else if (block.type === 'tool_use') {
      try {
        const toolResultContent = await mcpClient.callTool(block.name, block.input);
        toolResults.push({ toolName: block.name, toolArgs: block.input, result: toolResultContent });
        
        // Make follow-up call with tool result
        const followUpResponse = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          messages: [
            ...claudeMessages,
            { role: 'assistant', content: response.content },
            { role: 'user', content: [{ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(toolResultContent) }] }
          ],
          tools: claudeFormattedTools,
        });
        
        for (const followUpBlock of followUpResponse.content) {
          if (followUpBlock.type === 'text') {
            responseMessages.push({ role: 'assistant' as const, content: followUpBlock.text });
          }
        }
      } catch (toolError: any) {
        responseMessages.push({ role: 'assistant' as const, content: `Error executing tool ${block.name}: ${toolError.message || toolError}` });
      }
    }
  }

  if (responseMessages.length === 0) {
    responseMessages.push({ role: 'assistant' as const, content: 'I received your message but couldn\'t generate a response.' });
  }

  return { messages: responseMessages, toolResults };
}

// OpenAI chat handler
async function handleOpenAIChat(messages: any[], mcpTools: any[], mcpClient: any) {
  const openAIFormattedTools = mapToolsToOpenAIFormat(mcpTools);
  const openAIMessages = mapMessagesToOpenAI(messages);

  const params: any = {
    model: 'gpt-4',
    messages: openAIMessages,
  };

  if (openAIFormattedTools.length > 0) {
    params.tools = openAIFormattedTools;
    params.tool_choice = 'auto';
  }

  const response = await openai.chat.completions.create(params);
  
  const responseMessages = [];
  const toolResults = [];
  const message = response.choices[0].message;

  if (message.tool_calls && message.tool_calls.length > 0) {
    // Build messages array with proper typing
    const conversationMessages: any[] = [...openAIMessages];
    
    // Add the assistant message with tool calls
    conversationMessages.push({
      role: 'assistant',
      content: message.content,
      tool_calls: message.tool_calls
    });
    
    // Process each tool call
    for (const toolCall of message.tool_calls) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        const toolResultContent = await mcpClient.callTool(toolCall.function.name, args);
        toolResults.push({ toolName: toolCall.function.name, toolArgs: args, result: toolResultContent });
        
        // Add tool result message with proper structure
        conversationMessages.push({
          role: 'tool' as const,
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResultContent)
        });
      } catch (toolError: any) {
        conversationMessages.push({
          role: 'tool' as const,
          tool_call_id: toolCall.id,
          content: `Error: ${toolError.message || toolError}`
        });
      }
    }

    // Make follow-up call with tool results
    const followUpResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: conversationMessages,
      tools: openAIFormattedTools,
    });

    const followUpMessage = followUpResponse.choices[0].message;
    if (followUpMessage.content) {
      responseMessages.push({ role: 'assistant' as const, content: followUpMessage.content });
    }
  } else if (message.content) {
    responseMessages.push({ role: 'assistant' as const, content: message.content });
  }

  return { messages: responseMessages, toolResults };
}

export async function POST(request: NextRequest) {
  try {
    const { messages, selectedLLM = 'gemini', conversationId, userId } = await request.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const mcpClient = getMCPClient();
    if (!mcpClient.isConnected()) {
      return NextResponse.json(
        { error: 'Not connected to MCP server' },
        { status: 400 }
      );
    }
    
    const mcpTools = mcpClient.getTools();
    let result;

    // Route to appropriate LLM handler
    switch (selectedLLM) {
      case 'claude':
        if (!process.env.ANTHROPIC_API_KEY) {
          return NextResponse.json(
            { error: 'Claude API key not configured' },
            { status: 500 }
          );
        }
        result = await handleClaudeChat(messages, mcpTools, mcpClient);
        break;
      
      case 'chatgpt':
        if (!process.env.OPENAI_API_KEY) {
          return NextResponse.json(
            { error: 'OpenAI API key not configured' },
            { status: 500 }
          );
        }
        result = await handleOpenAIChat(messages, mcpTools, mcpClient);
        break;
      
      case 'gemini':
      default:
        result = await handleGeminiChat(messages, mcpTools, mcpClient);
        break;
    }

    // Prepare messages to save - for new conversations, save all; for existing, save only new ones
    const allMessages = [...messages, ...result.messages];
    const messagesToSave = conversationId ? 
      [messages[messages.length - 1], ...result.messages] : // For existing: user message + assistant responses
      allMessages; // For new: all messages

    // Save conversation
    const savedConversationId = await saveConversation(
      conversationId, 
      userId, 
      allMessages, // All messages for context
      selectedLLM, 
      messagesToSave, // Only new messages to save
      result.toolResults
    );

    return NextResponse.json({
      ...result,
      conversationId: savedConversationId
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}