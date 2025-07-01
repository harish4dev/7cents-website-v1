import { useState } from 'react';
import { LLMProvider } from '@/types';

export const useLLM = () => {
  const [selectedLLM, setSelectedLLM] = useState('gemini');
  const [selectedMCPTools, setSelectedMCPTools] = useState<string[]>([]);

  const llmProviders: LLMProvider[] = [
    { id: 'claude', name: 'Claude', icon: '🤖', enabled: true, api_key: '' },
    { id: 'chatgpt', name: 'ChatGPT', icon: '💬', enabled: true, api_key: '' },
    { id: 'gemini', name: 'Gemini', icon: '✨', enabled: true, api_key: 'AIzaSyCzzwMECJYtC-1WyAP3Paj7UXanCTN75nM' },
  ];

  return {
    selectedLLM,
    setSelectedLLM,
    selectedMCPTools,
    setSelectedMCPTools,
    llmProviders
  };
};
