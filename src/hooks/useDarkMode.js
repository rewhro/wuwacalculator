// src/hooks/useDarkMode.js
import { useState, useEffect } from 'react';

export default function useDarkMode() {
    const [isDark, setIsDark] = useState(
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => setIsDark(mediaQuery.matches);

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return isDark;
}