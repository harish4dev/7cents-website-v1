"use client"
import React from 'react';
import { useSession } from 'next-auth/react';

interface WelcomeScreenProps {
  onPromptSelect: (prompt: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onPromptSelect }) => {
  const { data: session } = useSession();

  const suggestedPrompts = [
    "How to teach world geography to teenagers?",
    "Is it possible to use music clips in YouTube videos?",
    "How do fintech platforms disrupt traditional banking?",
    "Write a Python script to analyze CSV data"
  ];

  return (
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {suggestedPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => onPromptSelect(prompt)}
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
  );
};

export default WelcomeScreen;