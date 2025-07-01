import { useState, useEffect } from 'react';

export const useUI = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const openAuthPrompt = () => setShowAuthPrompt(true);
  const closeAuthPrompt = () => setShowAuthPrompt(false);

  return {
    sidebarOpen,
    isMobile,
    showAuthPrompt,
    toggleSidebar,
    closeSidebar,
    openAuthPrompt,
    closeAuthPrompt
  };
};
