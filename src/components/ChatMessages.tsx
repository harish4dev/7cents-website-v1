"use client"
import React from 'react';
import { User, Loader2, Wrench } from 'lucide-react';
import { Message, ToolResult } from '@/types';

interface ChatMessagesProps {
  messages: Message[];
  toolResults: ToolResult[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  toolResults,
  isLoading,
  messagesEndRef
}) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {messages.map((message) => (
          <div key={message.id} className="group">
            <div className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-4 max-w-[85%] md:max-w-[75%] ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user'
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
                  <div className={`prose prose-sm max-w-none ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-tr-md'
                      : 'text-gray-900'
                  }`}>
                    <p className="whitespace-pre-wrap m-0 leading-relaxed">
                      {message.content}
                    </p>
                  </div>

                  {/* Message metadata */}
                  <div className={`mt-2 text-xs text-gray-500 flex items-center gap-2 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
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
  );
};

export default ChatMessages;