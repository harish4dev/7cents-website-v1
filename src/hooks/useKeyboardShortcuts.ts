import { useEffect } from 'react';

interface KeyboardShortcuts {
  onNewConversation?: () => void;
  onToggleSidebar?: () => void;
  onFocusInput?: () => void;
}

export const useKeyboardShortcuts = ({
  onNewConversation,
  onToggleSidebar,
  onFocusInput,
}: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + N - New conversation
      if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
        event.preventDefault();
        onNewConversation?.();
      }

      // Cmd/Ctrl + B - Toggle sidebar
      if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
        event.preventDefault();
        onToggleSidebar?.();
      }

      // Cmd/Ctrl + K - Focus input
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        onFocusInput?.();
      }

      // Escape - Close modals/sidebar
      if (event.key === 'Escape') {
        // This would need to be handled by individual components
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNewConversation, onToggleSidebar, onFocusInput]);
};
