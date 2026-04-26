import { useState, useEffect } from 'react';

/**
 * Custom hook for managing theme (dark/light mode)
 * Handles:
 * - Reading from localStorage on mount
 * - Applying theme to document.documentElement
 * - Synchronizing across components via custom events
 * - Syncing with backend when authenticated
 */
export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme !== 'light';
    
    // Update state
    setIsDarkMode(isDark);
    
    // Apply to DOM immediately
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    
    // Mark as ready
    setIsReady(true);
  }, []);

  // Listen for theme changes from other components and apply them
  useEffect(() => {
    const handleThemeChange = (e) => {
      const isDark = e.detail?.isDarkMode ?? (localStorage.getItem('theme') === 'dark');
      setIsDarkMode(isDark);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    };

    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  // Toggle theme function
  const toggleTheme = async () => {
    const newDarkMode = !isDarkMode;
    
    // Update state
    setIsDarkMode(newDarkMode);
    
    // Update localStorage
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    
    // Apply to DOM immediately
    document.documentElement.setAttribute('data-theme', newDarkMode ? 'dark' : 'light');
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('theme-changed', {
      detail: { isDarkMode: newDarkMode }
    }));
    
    // Save to backend if authenticated
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';
        await fetch(`${API_BASE.replace('/api/', '')}/api/users/me/preferences/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ darkMode: newDarkMode })
        }).catch(() => {});
      }
    } catch (e) {
      // Silently fail - theme is already applied locally
    }
  };

  // Set theme directly (for syncing from Settings or other sources)
  const setTheme = async (isDark) => {
    setIsDarkMode(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    
    window.dispatchEvent(new CustomEvent('theme-changed', {
      detail: { isDarkMode: isDark }
    }));
    
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';
        await fetch(`${API_BASE.replace('/api/', '')}/api/users/me/preferences/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ darkMode: isDark })
        }).catch(() => {});
      }
    } catch (e) {
      // Silently fail
    }
  };

  return {
    isDarkMode,
    isReady,
    toggleTheme,
    setTheme
  };
}
