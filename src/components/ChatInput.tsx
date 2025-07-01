"use client"
import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useSession } from 'next-auth/react';
import LLMSelector from '@/components/LLMSelector';
import MCPToolsDropdown from '@/components/MCPToolsDropdown';
import { LLMProvider } from '@/types';

interface ChatInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  selectedLLM: string;
  onLLMChange: (llm: string) => void;
  selectedMCPTools: string[];
  onMCPToolsChange: (tools: string[]) => void;
  llmProviders: LLMProvider[];
}

const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  onInputChange,
  onSendMessage,
  isLoading,
  selectedLLM,
  onLLMChange,
  selectedMCPTools,
  onMCPToolsChange,
  llmProviders
}) => {
  const { data: session } = useSession();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="flex-shrink-0 border-t border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto p-4">
        <div className="relative bg-white border border-gray-300 rounded-2xl shadow-sm focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all duration-200">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={session?.user ? "Message..." : "Message... (sign in to send)"}
            className="w-full resize-none border-0 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-500 px-4 py-3 pr-16 rounded-2xl"
            rows={1}
            disabled={isLoading}
            style={{ minHeight: '52px', maxHeight: '120px' }}
          />

          {/* Send Button */}
          <button
            onClick={onSendMessage}
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
              onProviderChange={onLLMChange}
            />
            <MCPToolsDropdown
              selectedTools={selectedMCPTools}
              onToolsChange={onMCPToolsChange}
            />
          </div>

          <div className="text-xs text-gray-500 hidden md:block">
            Press ⏎ to send, Shift + ⏎ for new line
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;