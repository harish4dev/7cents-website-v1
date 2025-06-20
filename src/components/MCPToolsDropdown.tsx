'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Zap, Circle, AlertCircle, Shield, ExternalLink } from 'lucide-react';
import { useSession } from "next-auth/react";

// Updated MCPTool type to match dashboard logic
interface MCPTool {
    id: string;
    name: string;
    description: string;
    authRequired: boolean;
    authorized: boolean;
    category?: string;
    icon?: string;
    status: 'active' | 'inactive' | 'error';
    connected: boolean;
}

interface MCPToolsDropdownProps {
    selectedTools: string[];
    onToolsChange: (tools: string[]) => void;
}

const MCPToolsDropdown: React.FC<MCPToolsDropdownProps> = ({
    selectedTools,
    onToolsChange
}) => {
    const { data: session, status } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [tools, setTools] = useState<MCPTool[]>([]);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND;

    // Only fetch tools if user is authenticated
    useEffect(() => {
        async function fetchTools() {
            // Don't fetch if user is not authenticated
            if (status === 'loading') return;
            if (!session?.user?.id) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/userTools');
                if (!res.ok) throw new Error('Failed to fetch tools');
                const rawdata = await res.json();
                const data: MCPTool[] = rawdata.map((tool: any) => ({
                    id: tool.id,
                    name: tool.name,
                    description: tool.description,
                    authRequired: tool.authRequired,
                    authorized: tool.userTools?.[0]?.authorized || false,
                    category: tool.authProvider,
                    icon: tool.iconUrl,
                    // Map to existing interface requirements
                    status: (tool.userTools?.[0]?.authorized || !tool.authRequired) ? 'active' : 'inactive',
                    connected: tool.userTools?.[0]?.authorized || !tool.authRequired
                }));
                setTools(data);
            } catch (error) {
                console.error('Failed to fetch tools:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchTools();
    }, [session, status]);

    const handleToolToggle = (toolId: string) => {
        // Only allow if user is logged in
        if (!session?.user?.id) return;
        
        const tool = tools.find(t => t.id === toolId);
        // Only allow selection if tool is connected (authorized or doesn't require auth)
        if (!tool?.connected) return;
        
        const newSelectedTools = selectedTools.includes(toolId)
            ? selectedTools.filter(id => id !== toolId)
            : [...selectedTools, toolId];
        onToolsChange(newSelectedTools);
    };

    const handleAuthorize = (toolId: string) => {
        if (!session?.user?.id) return;
        const userId = session.user.id;
        const oauthUrl = `${backendUrl}/api/auth/tokens?userId=${userId}&toolId=${toolId}`;
        window.location.href = '/dashboard';
    };

    const handleGoToDashboard = () => {
        window.location.href = '/dashboard';
    };



    const getStatusIcon = (status: MCPTool['status']) => {
        switch (status) {
            case 'active':
                return <Zap className="w-4 h-4 text-green-500" />;
            case 'inactive':
                return <Circle className="w-4 h-4 text-gray-400" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
        }
    };

    // Close dropdown when clicking outside
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

    // Show loading state while checking authentication
    if (status === 'loading') {
        return (
            <div className="relative inline-block text-left">
                <button
                    disabled
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-sm opacity-50 cursor-not-allowed"
                >
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    <span className="text-sm font-medium text-gray-500">Loading...</span>
                </button>
            </div>
        );
    }

    // Don't render the component if user is not authenticated
    if (!session?.user?.id) {
        return null;
    }

    const connectedTools = tools.filter(tool => tool.connected);
    const availableTools = tools.filter(tool => tool.authRequired && !tool.authorized);

    return (
        <div ref={dropdownRef} className="relative inline-block text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition-all"
            >
                <Zap className="w-4 h-4 text-gray-700" />
                <span className="text-sm font-medium text-gray-800">
                    MCP Tools {selectedTools.length > 0 && `(${selectedTools.length})`}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform text-gray-500 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mt-[-0.5rem] w-96 bg-white border border-gray-300 rounded-lg shadow-xl z-50">
                    <div className="p-4 max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="ml-2 text-sm text-gray-600">Loading tools...</span>
                            </div>
                        ) : (
                            <>
                                {/* Connected Tools Section */}
                                {connectedTools.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                                                <Shield className="w-4 h-4 mr-1 text-green-600" />
                                                Connected Tools
                                                <a href="/marketplace" className="text-xs ml-5 font-medium text-blue-600 hover:underline hover:text-blue-800 transition">
                                                + Add Tools
                                                </a>
                                            </h3>
                                        </div>
                                        <div className="space-y-2">
                                            {connectedTools.map((tool) => (
                                                <div
                                                    key={tool.id}
                                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    {/* <input
                                                        type="checkbox"
                                                        checked={selectedTools.includes(tool.id)}
                                                        onChange={() => handleToolToggle(tool.id)}
                                                        className="accent-blue-600"
                                                    /> */}
                                                    <div className="flex items-center gap-2 flex-1">
                                                        {getStatusIcon(tool.status)}
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-gray-900">{tool.name}</span>
                                                            <span className="text-xs text-gray-500 line-clamp-1">{tool.description}</span>
                                                        </div>
                                                    </div>
                                                    {tool.authorized && (
                                                        <div className="flex items-center text-green-600">
                                                            <Shield className="w-3 h-3" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Available Tools Section */}
                                {availableTools.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                                                <ExternalLink className="w-4 h-4 mr-1 text-blue-600" />
                                                Available Tools
                                            </h3>
                                        </div>
                                        <div className="space-y-2">
                                            {availableTools.map((tool) => (
                                                <div
                                                    key={tool.id}
                                                    className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 opacity-75"
                                                >
                                                    {/* <input
                                                        type="checkbox"
                                                        disabled
                                                        className="accent-blue-600 opacity-50"
                                                    /> */}
                                                    <div className="flex items-center gap-2 flex-1">
                                                        {getStatusIcon(tool.status)}
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-gray-900">{tool.name}</span>
                                                            <span className="text-xs text-gray-500 line-clamp-1">{tool.description}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAuthorize(tool.id)}
                                                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors flex items-center gap-1"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        Connect
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* No tools or footer */}
                                {tools.length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500 mb-2">No MCP tools found</p>
                                        <button
                                            onClick={handleGoToDashboard}
                                            className="text-xs font-medium text-blue-600 hover:underline"
                                        >
                                            Go to Dashboard
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border-t pt-3 mt-2">
                                        <button
                                            onClick={handleGoToDashboard}
                                            className="w-full text-xs font-medium text-blue-600 hover:text-blue-800 transition text-center"
                                        >
                                            Manage Tools in Dashboard →
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MCPToolsDropdown;