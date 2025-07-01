import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Message, ToolResult, ChatResponse } from '@/types';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toolResults, setToolResults] = useState<ToolResult[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND;


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (selectedLLM: string) => {
    if (!inputValue.trim() || isLoading || !session?.user?.id) return false;

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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      if (!response.ok) throw new Error('Failed to send message');

      const data: ChatResponse = await response.json();

      const assistantMessages: Message[] = data.messages.map((msg, index) => ({
        id: `${Date.now()}-${index}`,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(),
        llmProvider: msg.role === 'assistant' ? selectedLLM : undefined,
        toolResults: data.toolResults && msg.role === 'assistant' ? data.toolResults : undefined
      }));

      setMessages(prev => [...prev, ...assistantMessages]);

      if (data.conversationId && !currentConversationId) {
        setCurrentConversationId(data.conversationId);
      }

      if (data.toolResults) {
        setToolResults(prev => [...prev, ...data.toolResults!]);
      }

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/conversations/${conversationId}/messages`);
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
        setCurrentConversationId(conversationId);

        const allToolResults: ToolResult[] = [];
        loadedMessages.forEach(msg => {
          if (msg.toolResults) {
            allToolResults.push(...msg.toolResults);
          }
        });
        setToolResults(allToolResults);

        return data.conversation.lastLLM || 'gemini';
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
    return null;
  };

  const clearConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setToolResults([]);
    setInputValue('');
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    toolResults,
    currentConversationId,
    messagesEndRef,
    sendMessage,
    loadConversation,
    clearConversation
  };
};