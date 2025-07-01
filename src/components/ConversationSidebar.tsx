"use client"
import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Trash2, Edit2, Check, X, Search } from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  lastLLM: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
}

interface ConversationSidebarProps {
  currentConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
  onNewConversation: () => void;
  userId: string;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  currentConversationId,
  onConversationSelect,
  onNewConversation,
  userId
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND;

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/conversations?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  // Delete conversation
  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation? This action cannot be undone.')) return;

    try {
      const response = await fetch(`${backendUrl}/api/conversations/${conversationId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        if (currentConversationId === conversationId) {
          onNewConversation();
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  // Start editing
  const startEdit = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  // Save edit
  const saveEdit = async (conversationId: string) => {
    if (!editTitle.trim()) return;

    try {
      const response = await fetch(`${backendUrl}/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editTitle.trim() }),
      });

      if (response.ok) {
        setConversations(prev =>
          prev.map(c => c.id === conversationId ? { ...c, title: editTitle.trim() } : c)
        );
        setEditingId(null);
        setEditTitle('');
      }
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1}d ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getLLMIcon = (llm: string) => {
    switch (llm) {
      case 'claude': return '🤖';
      case 'chatgpt': return '💬';
      case 'gemini': return '✨';
      default: return '🤖';
    }
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group conversations by date
  const groupedConversations = filteredConversations.reduce((groups, conversation) => {
    const date = new Date(conversation.updatedAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    let group = 'Older';
    if (date.toDateString() === today.toDateString()) {
      group = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      group = 'Yesterday';
    } else if (date > lastWeek) {
      group = 'Last 7 days';
    } else if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
      group = 'This month';
    }

    if (!groups[group]) groups[group] = [];
    groups[group].push(conversation);
    return groups;
  }, {} as Record<string, Conversation[]>);

  if (loading) {
    return (
      <div className="w-80 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="flex-1 p-4 space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>
      </div>

      {/* Search */}
      <div className="flex-shrink-0 p-4 bg-white border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center">
            {searchQuery ? (
              <div>
                <Search className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-500">No conversations found</p>
                <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
              </div>
            ) : (
              <div>
                <MessageSquare className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-500">No conversations yet</p>
                <p className="text-xs text-gray-400 mt-1">Start a new chat to get going</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-2">
            {Object.entries(groupedConversations).map(([group, groupConversations]) => (
              <div key={group} className="mb-6">
                <h3 className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {group}
                </h3>
                <div className="space-y-1 px-2">
                  {groupConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => onConversationSelect(conversation.id)}
                      className={`group relative px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        currentConversationId === conversation.id
                          ? 'bg-orange-100 border border-orange-200 shadow-sm'
                          : 'hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-2">
                          {editingId === conversation.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit(conversation.id);
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                autoFocus
                                onBlur={() => saveEdit(conversation.id)}
                              />
                              <button
                                onClick={() => saveEdit(conversation.id)}
                                className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <h4 className="font-medium text-sm text-gray-900 truncate mb-1 leading-5">
                                {conversation.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  {getLLMIcon(conversation.lastLLM)}
                                  <span className="capitalize">{conversation.lastLLM}</span>
                                </span>
                                <span className="text-gray-300">•</span>
                                <span>{formatDate(conversation.updatedAt)}</span>
                              </div>
                            </>
                          )}
                        </div>
                        
                        {/* Action buttons */}
                        {editingId !== conversation.id && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => startEdit(conversation, e)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Rename"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(conversation.id, e)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationSidebar;