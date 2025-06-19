'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import LLMSelector from '@/components/LLMSelector';
import MCPToolsDropdown from '@/components/MCPToolsDropdown';
import { LLMProvider, MCPTool, ChatMessage } from '../types';
import { createLLMConnection } from '@/lib/llm-connection';
import AuthWrapper from '@/components/AuthWrapper';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState('gemini');
  const [selectedMCPTools, setSelectedMCPTools] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data - replace with actual data sources
  const llmProviders: LLMProvider[] = [
    { id: 'claude', name: 'Claude', icon: '🤖', enabled: true ,api_key:''},
    { id: 'chatgpt', name: 'ChatGPT', icon: '💬', enabled: true,api_key:'' },
    { id: 'gemini', name: 'Gemini', icon: '✨', enabled: true,api_key:'AIzaSyCzzwMECJYtC-1WyAP3Paj7UXanCTN75nM' },
  ];

  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
      llmProvider: selectedLLM,
      mcpTools: selectedMCPTools
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Mock API key - in production, this should come from environment variables or user settings
      const connection = createLLMConnection(selectedLLM,'AIzaSyCzzwMECJYtC-1WyAP3Paj7UXanCTN75nM' );
      const response = await connection.sendMessage(inputValue, selectedMCPTools);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
        llmProvider: selectedLLM,
        mcpTools: selectedMCPTools
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error processing your message. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
        llmProvider: selectedLLM
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

  return (
   <AuthWrapper>
     <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-green-50">

{/* Main Content */}
<main className="max-w-4xl mx-auto px-6 py-8">
  {messages.length === 0 ? (
    /* Welcome Screen */
    <div className="text-center py-20">
      <div className="mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <span className="h-10 w-10 text-white text-4xl">7c</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Hello there!</h2>
        <p className="text-xl text-gray-600">What's on your mind?</p>
      </div>

      {/* Suggested Prompts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
        {[
          "How to teach world geography to teenagers?",
          "Is it possible to use music clips in YouTube videos?",
          "How do fintech platforms disrupt traditional banking?"
        ].map((prompt, index) => (
          <button
            key={index}
            onClick={() => setInputValue(prompt)}
            className="p-4 text-left bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <span className="text-sm text-gray-700">{prompt}</span>
          </button>
        ))}
      </div>
    </div>
  ) : (
    /* Chat Messages */
    <div className="space-y-6 mb-6">
      {messages.map((message) => (
        <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`flex gap-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.role === 'user' ? 'bg-blue-600' : 'bg-gray-200'
            }`}>
              {message.role === 'user' ? (
                <User className="h-4 w-4 text-white" />
              ) : (
                <Bot className="h-4 w-4 text-gray-600" />
              )}
            </div>
            <div className={`px-4 py-3 rounded-2xl ${
              message.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.role === 'assistant' && message.llmProvider && (
                <div className="mt-2 text-xs text-gray-500">
                  via {llmProviders.find(p => p.id === message.llmProvider)?.name}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex gap-4 justify-start">
          <div className="flex gap-3 max-w-3xl">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-200">
              <Bot className="h-4 w-4 text-gray-600" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-gray-100">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )}

  {/* Input Area */}
  <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm focus-within:shadow-lg focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-50 transition-all duration-200">
    {/* Input */}
    <div className="mb-4">
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Ask anything"
        className="w-full resize-none border-0 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-500 min-h-[60px] max-h-32"
        rows={1}
        disabled={isLoading}
      />
    </div>
    
    {/* Controls and Send Button at bottom */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <LLMSelector
          providers={llmProviders}
          selectedProvider={selectedLLM}
          onProviderChange={setSelectedLLM}
        />
        <MCPToolsDropdown
          selectedTools={selectedMCPTools}
          onToolsChange={setSelectedMCPTools}
        />
      </div>
      <button
        onClick={handleSendMessage}
        disabled={!inputValue.trim() || isLoading}
        className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  </div>
</main>
</div>
   </AuthWrapper>
  );
};

export default ChatInterface;