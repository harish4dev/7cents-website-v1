import { ClaudeConnection } from './claude';
import { OpenAIConnection } from './openai';
import { GeminiConnection } from './gemini';
import { BaseLLMConnection } from './base';

export const createLLMConnection = (provider: string, apiKey: string): BaseLLMConnection => {
  switch (provider) {
    case 'claude':
      return new ClaudeConnection(apiKey);
    case 'chatgpt':
      return new OpenAIConnection(apiKey);
    case 'gemini':
      return new GeminiConnection(apiKey);
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
};

export { ClaudeConnection, OpenAIConnection, GeminiConnection, BaseLLMConnection };