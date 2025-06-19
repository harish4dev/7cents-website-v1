"use client"
import React, { useEffect, useState } from 'react';
import { Copy, Check, ExternalLink, Shield, Zap, Settings, Code2, Link, MessageCircle } from 'lucide-react';
import { useSession } from "next-auth/react";

type Tool = {
  id: string;
  name: string;
  description: string;
  authRequired: boolean;
  authorized: boolean;
  category?: string;
  icon?: string;
};

const UserToolCard: React.FC<{
  name: string;
  description: string;
  authRequired: boolean;
  authorized: boolean;
  onAuthorize: () => void;
  category?: string;
}> = ({ name, description, authRequired, authorized, onAuthorize, category }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{name}</h3>
            {category && (
              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full mt-1">
                {category}
              </span>
            )}
          </div>
        </div>
        {authorized && (
          <div className="flex items-center space-x-1 text-green-600">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium">Connected</span>
          </div>
        )}
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
      
      {authRequired && !authorized && (
        <button
          onClick={onAuthorize}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Connect Tool using</span>
        </button>
      )}
      
      {!authRequired && (
        <div className="flex items-center justify-center py-2 text-gray-500 text-sm">
          <Check className="w-4 h-4 mr-1" />
          Ready to use
        </div>
      )}
    </div>
  );
};

const ConfigCard: React.FC<{
  title: string;
  config: string;
  description: string;
}> = ({ title, config, description }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Code2 className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          <span className={copied ? "text-green-600" : "text-gray-600"}>
            {copied ? "Copied!" : "Copy"}
          </span>
        </button>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      
      <pre className="bg-gray-50 p-4 rounded-lg text-xs font-mono overflow-x-auto border border-gray-100">
        <code className="text-gray-800">{config}</code>
      </pre>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const { data: session, status } = useSession();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND;
  const mcpServerUrl = process.env.NEXT_PUBLIC_MCP_SERVER;

  useEffect(() => {
    async function fetchTools() {
      try {
        const res = await fetch('/api/userTools');
        if (!res.ok) throw new Error('Failed to fetch tools');
        const rawdata= await res.json();
        const data: Tool[] = rawdata.map((tool: any) => ({
          id: tool.id,
          name: tool.name,
          description: tool.description,
          authRequired: tool.authRequired,
          authorized: tool.userTools?.[0]?.authorized || false, // fallback to false
          category: tool.authProvider, // if applicable
          icon: tool.iconUrl, // rename to match your type
        }));
        console.log(data)
        setTools(data);
        console.log(tools)
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchTools();
  }, []);

  const handleAuthorize = (toolId: string) => {
    const userId = session?.user.id;
    const oauthUrl = `${backendUrl}/api/auth/tokens?userId=${userId}&toolId=${toolId}`;
    window.location.href = oauthUrl;
  };

  const cursorConfig = JSON.stringify({
    mcpServers: {
      "7cents_cutom_mcp_server": {
        transport: "http",
        url: `${mcpServerUrl}/mcp?userId=${session?.user.id}`,
        header: {
          "Content-Type": "application/json"
        }
      }
    }
  }, null, 2);

  const claudeConfig = JSON.stringify({
    mcpServers: {
      "7cents_cutom_mcp_server": {
        command: "npx",
        args: [
          "-y",
          "mcp-remote",
          `${mcpServerUrl}/mcp?userId=${session?.user.id}`,
          "--header",
          "Content-Type:application/json"
        ]
      }
    }
  }, null, 2);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tools...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your dashboard</p>
        </div>
      </div>
    );
  }

  const connectedTools = tools.filter(tool => tool.authorized || !tool.authRequired);
  const availableTools = tools.filter(tool => tool.authRequired && !tool.authorized );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-green-50">
      {/* Header */}
      <div className=" border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MCP Tools Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your connected tools and configurations</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session?.user.name}</p>
                <p className="text-xs text-gray-500">{session?.user.email}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {session?.user.name?.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tools Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Tools</p>
                    <p className="text-2xl font-bold text-gray-900">{tools.length}</p>
                  </div>
                  <Settings className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Connected</p>
                    <p className="text-2xl font-bold text-green-600">{connectedTools.length}</p>
                  </div>
                  <Link className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Available</p>
                    <p className="text-2xl font-bold text-blue-600">{availableTools.length}</p>
                  </div>
                  <ExternalLink className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Connected Tools */}
            {connectedTools.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Connected Tools
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connectedTools.map((tool) => (
                    <UserToolCard
                      key={tool.id}
                      name={tool.name}
                      description={tool.description}
                      authRequired={tool.authRequired}
                      authorized={tool.authorized}
                      category={tool.category}
                      onAuthorize={() => handleAuthorize(tool.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Available Tools */}
            {availableTools.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <ExternalLink className="w-5 h-5 mr-2 text-blue-600" />
                  Available Tools
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableTools.map((tool) => (
                    <UserToolCard
                      key={tool.id}
                      name={tool.name}
                      description={tool.description}
                      authRequired={tool.authRequired}
                      authorized={tool.authorized}
                      category={tool.category}
                      onAuthorize={() => handleAuthorize(tool.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {tools.length === 0 && (
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
                <p className="text-gray-600">Check back later for available integrations.</p>
              </div>
            )}
          </div>

          {/* Configuration Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-blue-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Code2 className="w-5 h-5 mr-2 text-blue-600" />
                MCP Configurations
              </h2>
              <p className="text-sm text-gray-600">
                Copy these configurations to connect your tools with different MCP clients.
              </p>
            </div>

            <ConfigCard
              title="Cursor MCP"
              description="Add this configuration to your Cursor settings for HTTP transport."
              config={cursorConfig}
            />

            <ConfigCard
              title="Claude Desktop MCP"
              description="Use this configuration with Claude Desktop using the mcp-remote package."
              config={claudeConfig}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;