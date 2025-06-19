'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Brain } from 'lucide-react';
import { LLMProvider } from '../types';

interface LLMSelectorProps {
  providers: LLMProvider[];
  selectedProvider: string;
  onProviderChange: (providerId: string) => void;
}

const LLMSelector: React.FC<LLMSelectorProps> = ({
  providers,
  selectedProvider,
  onProviderChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedProviderData = providers.find(p => p.id === selectedProvider);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition-all"
      >
        <Brain className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-800">
          {selectedProviderData?.name || 'Select LLM'}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          <div className="p-1 max-h-64 overflow-y-auto">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => {
                  onProviderChange(provider.id);
                  setIsOpen(false);
                }}
                disabled={!provider.enabled}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-left transition-colors ${
                  selectedProvider === provider.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                } ${!provider.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="text-lg">{provider.icon}</span>
                <span className="truncate">{provider.name}</span>
                {selectedProvider === provider.id && (
                  <div className="ml-auto h-2 w-2 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LLMSelector;
