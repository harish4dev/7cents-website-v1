// pages/marketplace.tsx
"use client"
import { useEffect, useState } from 'react';
import ToolCard from "@/components/ToolCard"
import CartDrawer from '@/components/CartDrawer';

type Tool = {
  id: string;
  name: string;
  description: string;
  iconUrl?: string | null;
  authProvider: string;
  authRequired: boolean;
};

type UserTool = {
  id: string;
  name: string;
  description: string;
  authRequired: boolean;
  authorized: boolean;
  category: string;
  icon?: string | null;
};

export default function Marketplace() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [userTools, setUserTools] = useState<UserTool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all marketplace tools
        const toolsRes = await fetch("/api/tools"); // This hits your internal proxy route  
        if (!toolsRes.ok) throw new Error('Failed to fetch tools');
        const toolsData: Tool[] = await toolsRes.json();
        setTools(toolsData);
        setFilteredTools(toolsData);

        // Fetch user's subscribed tools
        try {
          const userToolsRes = await fetch('/api/userTools');
          if (userToolsRes.ok) {
            const rawUserData = await userToolsRes.json();
            const userToolsData: UserTool[] = rawUserData.map((tool: any) => ({
              id: tool.id,
              name: tool.name,
              description: tool.description,
              authRequired: tool.authRequired,
              authorized: tool.userTools?.[0]?.authorized || false,
              category: tool.authProvider,
              icon: tool.iconUrl,
            }));
            setUserTools(userToolsData);
            console.log('User tools:', userToolsData);
          }
        } catch (userToolsError) {
          console.warn('Failed to fetch user tools:', userToolsError);
          // Continue without user tools - user might not be logged in
        }
      } catch (err: any) {
        setError(err.message || 'Unexpected error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter tools based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTools(tools);
    } else {
      const filtered = tools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.authProvider.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTools(filtered);
    }
  }, [searchQuery, tools]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Helper function to check if user has subscribed to a tool
  const isToolSubscribed = (toolId: string) => {
    return userTools.some(userTool => userTool.id === toolId);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-green-50">
        <div className="flex flex-col justify-center items-center h-screen space-y-4 px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-lg font-medium text-center">Loading amazing tools...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-green-50">
        <div className="flex flex-col justify-center items-center h-screen space-y-4 px-4">
          <div className="bg-red-100 p-4 rounded-full">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 text-lg font-medium text-center">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 pb-24 lg:pb-12">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4 px-2">
            Tools Marketplace
          </h1>
          <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            Discover and integrate powerful tools to supercharge your productivity
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-4 sm:mb-6 px-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search tools by name, description, or provider..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl sm:rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500 text-sm sm:text-base"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Search Results Info */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 px-4">
            <div className="bg-white rounded-full px-4 sm:px-6 py-2 shadow-lg">
              <span className="text-xs sm:text-sm font-medium text-gray-600">
                {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'} 
                {searchQuery && (
                  <span className="text-blue-600"> found</span>
                )}
              </span>
            </div>
            {searchQuery && (
              <div className="bg-blue-100 rounded-full px-3 sm:px-4 py-2 shadow-lg max-w-xs sm:max-w-none">
                <span className="text-xs sm:text-sm font-medium text-blue-800 truncate">
                  Searching:&quot{searchQuery.length > 20 ? searchQuery.substring(0, 20) + '...' : searchQuery}&quot
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tools Grid */}
        {filteredTools.length === 0 ? (
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 max-w-md mx-auto">
              <div className="bg-gray-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4">
                {searchQuery ? (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                {searchQuery ? 'No Tools Found' : 'No Tools Available'}
              </h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                {searchQuery 
                  ? `No tools match your search "${searchQuery}". Try different keywords.`
                  : 'Check back later for new tools and integrations.'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
            {filteredTools.map((tool, index) => (
              <div 
                key={tool.id}
                className="transform transition-all duration-300 hover:scale-105"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <ToolCard
                  id={tool.id}
                  name={tool.name}
                  description={tool.description}
                  iconUrl={tool.iconUrl}
                  authProvider={tool.authProvider}
                  authRequired={tool.authRequired}
                  isSubscribed={isToolSubscribed(tool.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}