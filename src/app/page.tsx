"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Wrench, Loader2, MessageSquare, Menu, X } from 'lucide-react';
import LLMSelector from '@/components/LLMSelector';
import MCPToolsDropdown from '@/components/MCPToolsDropdown';
import ConversationSidebar from '@/components/ConversationSidebar';
import { LLMProvider, Tool, ChatMessage } from '../types';
import { useSession, signIn } from 'next-auth/react';

// Updated interfaces to match the working chat interface
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  llmProvider?: string;
  toolResults?: any;
}

interface ToolResult {
  toolName: string;
  toolArgs: any;
  result: any;
}

interface ChatResponse {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  toolResults?: ToolResult[];
  conversationId?: string;
}

const ChatInterface: React.FC = () => {
  // Updated state to match the working interface
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState('gemini');
  const [selectedMCPTools, setSelectedMCPTools] = useState<string[]>([]);
  const [toolResults, setToolResults] = useState<ToolResult[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Always closed by default
  const [isMobile, setIsMobile] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const serverUrl = process.env.NEXT_PUBLIC_MCP_SERVER!
  const [userId, setUserId] = useState('');
  const { data: session, status } = useSession();

  // Mock data - replace with actual data sources
  const llmProviders: LLMProvider[] = [
    { id: 'claude', name: 'Claude', icon: '🤖', enabled: true, api_key: '' },
    { id: 'chatgpt', name: 'ChatGPT', icon: '💬', enabled: true, api_key: '' },
    { id: 'gemini', name: 'Gemini', icon: '✨', enabled: true, api_key: 'AIzaSyCzzwMECJYtC-1WyAP3Paj7UXanCTN75nM' },
  ];

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Don't auto-open sidebar on any screen size
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversation messages
  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`http://localhost:3333/api/conversations/${conversationId}/messages`);
      if (response.ok) {
        const data = await response.json();
        const loadedMessages: Message[] = data.messages.map((msg: any, index: number) => ({
          id: msg.id || `${Date.now()}-${index}`,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.createdAt),
          llmProvider: msg.llmProvider,
          toolResults: msg.toolResults,
        }));
        setMessages(loadedMessages);
        setSelectedLLM(data.conversation.lastLLM || 'gemini');
        setCurrentConversationId(conversationId);

        // Extract tool results from messages
        const allToolResults: ToolResult[] = [];
        loadedMessages.forEach(msg => {
          if (msg.toolResults) {
            allToolResults.push(...msg.toolResults);
          }
        });
        setToolResults(allToolResults);

        // Close sidebar after selection on all screen sizes
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  // Handle conversation selection
  const handleConversationSelect = (conversationId: string) => {
    loadConversation(conversationId);
  };

  // Handle new conversation
  const handleNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setToolResults([]);
    setInputValue('');
    // Close sidebar after creating new conversation on all screen sizes
    setSidebarOpen(false);
  };

  useEffect(() => {
    scrollToBottom();
    if (session?.user?.id) {
      setUserId(session.user.id);
      setShowAuthPrompt(false); // Hide auth prompt if user is authenticated
    }
    
    // Only connect to MCP if user is authenticated
    if (session?.user?.id) {
      const connect = async () => {
        try {
          const response = await fetch('/api/mcp/connect', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ serverUrl, userId: session.user.id }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to connect');
          }
        } catch {
          // Handle connection error silently
        }
      };
      connect();
    }
  }, [messages, session]);

  // Check authentication before sending message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Check if user is authenticated
    if (!session?.user?.id) {
      setShowAuthPrompt(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Use the same API call as the working interface
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          selectedLLM,
          conversationId: currentConversationId,
          userId: session.user.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data: ChatResponse = await response.json();

      // Add assistant messages
      const assistantMessages: Message[] = data.messages.map((msg, index) => ({
        id: `${Date.now()}-${index}`,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(),
        llmProvider: msg.role === 'assistant' ? selectedLLM : undefined,
        toolResults: data.toolResults && msg.role === 'assistant' ? data.toolResults : undefined
      }));

      setMessages(prev => [...prev, ...assistantMessages]);

      // Update conversation ID if this was a new conversation
      if (data.conversationId && !currentConversationId) {
        setCurrentConversationId(data.conversationId);
      }

      // Update tool results if any
      if (data.toolResults) {
        setToolResults(prev => [...prev, ...data.toolResults!]);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle LLM provider change
  const handleLLMChange = (newLLM: string) => {
    setSelectedLLM(newLLM);
    // Messages persist when switching LLMs
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle authentication
  const handleSignIn = async () => {
    try {
      await signIn('google');
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleCloseAuthPrompt = () => {
    setShowAuthPrompt(false);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-green-50 flex flex-col overflow-hidden">
      {/* Authentication Prompt Modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/20 z-50">
          <div className="bg-white rounded-xl shadow-xl border p-6 max-w-sm mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-lg font-bold">C</span>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Sign in to continue</h2>
              <p className="text-gray-600 mb-6 text-sm">
                Please sign in to start chatting and save your conversations.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCloseAuthPrompt}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignIn}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header - Always at the top */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 z-30">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-pink-500 rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">C</span>
              </div>
              <h1 className="text-lg font-medium text-gray-900 hidden md:block">
                {currentConversationId ? 'Chat' : 'New conversation'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 hidden md:block">
              {selectedLLM.charAt(0).toUpperCase() + selectedLLM.slice(1)}
            </div>
            {session?.user ? (
              <div className="flex items-center gap-2">
                <img
                  src={session.user.image || ''}
                  alt={session.user.name || ''}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-gray-700 hidden md:block">
                  {session.user.name}
                </span>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar - Positioned based on screen size */}
        {sidebarOpen && (
          <>
            {/* Backdrop for mobile */}
            {isMobile && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar Container */}
            <div className={`
              ${isMobile
                ? 'absolute top-0 left-0 right-0 bottom-0 z-50 bg-white'
                : 'relative w-80 flex-shrink-0'
              }
              border-r border-gray-200
            `}>
              {/* Close button for mobile */}
              {isMobile && (
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Conversations</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Sidebar Content */}
              <div className={`h-full ${isMobile ? 'pt-0' : ''}`}>
                {session?.user?.id ? (
                  <ConversationSidebar
                    currentConversationId={currentConversationId}
                    onConversationSelect={handleConversationSelect}
                    onNewConversation={handleNewConversation}
                    userId={session.user.id}
                  />
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-gray-500 text-sm mb-4">
                      Sign in to view your conversations
                    </p>
                    <button
                      onClick={handleSignIn}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      Sign in
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Chat Content - Takes remaining space */}
        <div className="flex-1 flex flex-col min-w-0">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center max-w-2xl mx-auto">
                <div className="mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl mx-auto mb-6 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">C</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
                    How can I help you today?
                  </h2>
                  <p className="text-gray-600">
                    I&apos;m an AI assistant. I can help with analysis, math, coding, creative writing, and much more.
                  </p>
                  {!session?.user && (
                    <p className="text-sm text-gray-500 mt-2">
                      Start typing to explore, or sign in to save your conversations.
                    </p>
                  )}
                </div>

                {/* Suggested Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                  {[
                    "How to teach world geography to teenagers?",
                    "Is it possible to use music clips in YouTube videos?",
                    "How do fintech platforms disrupt traditional banking?",
                    "Write a Python script to analyze CSV data"
                  ].map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(prompt)}
                      className="p-4 text-left bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 group"
                    >
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                        {prompt}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
                {messages.map((message) => (
                  <div key={message.id} className="group">
                    <div className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-4 max-w-[85%] md:max-w-[75%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}>
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user'
                            ? 'bg-blue-600'
                            : 'bg-gradient-to-br from-orange-400 to-pink-500'
                          }`}>
                          {message.role === 'user' ? (
                            <User className="h-4 w-4 text-white" />
                          ) : (
                            <span className="text-white text-xs font-bold">C</span>
                          )}
                        </div>

                        {/* Message Content */}
                        <div className="flex-1 min-w-0">
                          <div className={`prose prose-sm max-w-none ${message.role === 'user'
                              ? 'bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-tr-md'
                              : 'text-gray-900'
                            }`}>
                            <p className="whitespace-pre-wrap m-0 leading-relaxed">
                              {message.content}
                            </p>
                          </div>

                          {/* Message metadata */}
                          <div className={`mt-2 text-xs text-gray-500 flex items-center gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}>
                            <span>{message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                            {message.llmProvider && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{message.llmProvider}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Tool Results Display */}
                {toolResults.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-[85%] md:max-w-[75%]">
                    <div className="flex items-center space-x-2 mb-2">
                      <Wrench className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">Tool Usage</span>
                    </div>
                    {toolResults.slice(-3).map((result, index) => (
                      <div key={index} className="text-xs text-amber-700 mb-1">
                        <span className="font-mono bg-amber-100 px-2 py-0.5 rounded">
                          {result.toolName}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="group">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">C</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-white">
            <div className="max-w-4xl mx-auto p-4">
              <div className="relative bg-white border border-gray-300 rounded-2xl shadow-sm focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all duration-200">
                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={session?.user ? "Message..." : "Message... (sign in to send)"}
                  className="w-full resize-none border-0 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-500 px-4 py-3 pr-16 rounded-2xl"
                  rows={1}
                  disabled={isLoading}
                  style={{ minHeight: '52px', maxHeight: '120px' }}
                />

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 bottom-2 w-8 h-8 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between mt-3 px-1">
                <div className="flex items-center gap-2">
                  <LLMSelector
                    providers={llmProviders}
                    selectedProvider={selectedLLM}
                    onProviderChange={handleLLMChange}
                  />
                  <MCPToolsDropdown
                    selectedTools={selectedMCPTools}
                    onToolsChange={setSelectedMCPTools}
                  />
                </div>

                <div className="text-xs text-gray-500 hidden md:block">
                  Press ⏎ to send, Shift + ⏎ for new line
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;