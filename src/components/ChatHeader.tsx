"use client"
import React from 'react';
import { Menu } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  currentConversationId: string | null;
  selectedLLM: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  onToggleSidebar,
  currentConversationId,
  selectedLLM
}) => {
  const { data: session } = useSession();

  const handleSignIn = async () => {
    try {
      await signIn('google');
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <header className="flex-shrink-0 bg-white border-b border-gray-200 z-30">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
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
  );
};

export default ChatHeader;