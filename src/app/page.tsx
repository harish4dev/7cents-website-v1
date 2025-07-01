"use client"
import React from 'react';
import { X } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import ConversationSidebar from '@/components/ConversationSidebar';
import ChatHeader from '@/components/ChatHeader';
import AuthPrompt from '@/components/AuthPrompt';
import WelcomeScreen from '@/components/WelcomeScreen';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';
import { useChat } from '@/hooks/useChat';
import { useUI } from '@/hooks/useUI';
import { useLLM } from '@/hooks/useLLM';
import { useMCP } from '@/hooks/useMCP';

const ChatInterface: React.FC = () => {
  const { data: session } = useSession();
  
  // Custom hooks
  const {
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
  } = useChat();

  const {
    sidebarOpen,
    isMobile,
    showAuthPrompt,
    toggleSidebar,
    closeSidebar,
    openAuthPrompt,
    closeAuthPrompt
  } = useUI();

  const {
    selectedLLM,
    setSelectedLLM,
    selectedMCPTools,
    setSelectedMCPTools,
    llmProviders
  } = useLLM();

  // Initialize MCP connection
  useMCP();

  // Event handlers
  const handleSendMessage = async () => {
    if (!session?.user?.id) {
      openAuthPrompt();
      return;
    }
    await sendMessage(selectedLLM);
  };

  const handleConversationSelect = async (conversationId: string) => {
    const lastLLM = await loadConversation(conversationId);
    if (lastLLM) setSelectedLLM(lastLLM);
    closeSidebar();
  };

  const handleNewConversation = () => {
    clearConversation();
    closeSidebar();
  };

  const handleSignIn = async () => {
    try {
      await signIn('google');
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setInputValue(prompt);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-green-50 flex flex-col overflow-hidden">
      {/* Authentication Prompt Modal */}
      <AuthPrompt
        isOpen={showAuthPrompt}
        onClose={closeAuthPrompt}
        onSignIn={handleSignIn}
      />

      {/* Header */}
      <ChatHeader
        onToggleSidebar={toggleSidebar}
        currentConversationId={currentConversationId}
        selectedLLM={selectedLLM}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        {sidebarOpen && (
          <>
            {/* Backdrop for mobile */}
            {isMobile && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={closeSidebar}
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
                    onClick={closeSidebar}
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

        {/* Chat Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {messages.length === 0 ? (
            <WelcomeScreen onPromptSelect={handlePromptSelect} />
          ) : (
            <ChatMessages
              messages={messages}
              toolResults={toolResults}
              isLoading={isLoading}
              messagesEndRef={messagesEndRef}
            />
          )}

          {/* Input Area */}
          <ChatInput
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            selectedLLM={selectedLLM}
            onLLMChange={setSelectedLLM}
            selectedMCPTools={selectedMCPTools}
            onMCPToolsChange={setSelectedMCPTools}
            llmProviders={llmProviders}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
