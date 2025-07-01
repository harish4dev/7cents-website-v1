import React from 'react';

interface AuthPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
}

const AuthPrompt: React.FC<AuthPromptProps> = ({ isOpen, onClose, onSignIn }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/20 z-50">
      <div className="bg-white rounded-xl shadow-xl border p-6 max-w-sm mx-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-lg font-bold">C</span>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Sign in to continue</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Please sign in to start chatting and save your conversations 
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={onSignIn}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPrompt;