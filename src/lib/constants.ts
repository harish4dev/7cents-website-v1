export const APP_CONFIG = {
  APP_NAME: 'Chat Interface',
  DEFAULT_LLM: 'gemini',
  MAX_MESSAGE_LENGTH: 4000,
  TYPING_INDICATOR_DELAY: 1000,
  AUTO_SAVE_DELAY: 2000,
} as const;

export const API_ENDPOINTS = {
  CHAT: '/api/chat',
  MCP_CONNECT: '/api/mcp/connect',
  CONVERSATIONS: '/api/conversations',
  MESSAGES: (conversationId: string) => `/api/conversations/${conversationId}/messages`,
} as const;

export const UI_CONSTANTS = {
  MOBILE_BREAKPOINT: 768,
  SIDEBAR_WIDTH: 320,
  MESSAGE_MAX_WIDTH: '85%',
  MESSAGE_MAX_WIDTH_MD: '75%',
  TEXTAREA_MAX_HEIGHT: 120,
} as const;

export const SUGGESTED_PROMPTS = [
  "How to teach world geography to teenagers?",
  "Is it possible to use music clips in YouTube videos?",
  "How do fintech platforms disrupt traditional banking?",
  "Write a Python script to analyze CSV data"
] as const;
