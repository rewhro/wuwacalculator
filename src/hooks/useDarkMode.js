import { useState, useEffect } from 'react';

const STORAGE_KEY = 'user-theme'; // 'dark' | 'light' | null

export default function useDarkMode() {
    const getInitialTheme = () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const [theme, setTheme] = useState(getInitialTheme);

    // Always sync effective theme with stored theme
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleSystemChange = () => {
            const systemTheme = mediaQuery.matches ? 'dark' : 'light';
            setTheme(systemTheme); // 🔁 Actively toggle theme on system change
        };

        mediaQuery.addEventListener('change', handleSystemChange);
        return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }, []);

    return {
        theme,
        setTheme,
        isDark: theme === 'dark',
        effectiveTheme: theme
    };
}