import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export const useMCP = () => {
  const { data: session } = useSession();
  const serverUrl = process.env.NEXT_PUBLIC_MCP_SERVER!;

  useEffect(() => {
    if (session?.user?.id) {
      const connect = async () => {
        try {
          const response = await fetch('/api/mcp/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serverUrl, userId: session.user.id }),
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Failed to connect');
          }
        } catch {
          // Handle connection error silently
        }
      };
      connect();
    }
  }, [session, serverUrl]);
};