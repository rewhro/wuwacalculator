import {useEffect, useLayoutEffect, useState} from "react";
const THEME_KEY = 'user-theme';
const DARK_VARIANT_KEY = 'user-dark-variant';
const USER_HAS_SELECTED = 'user-has-selected-theme';
export default function useDarkMode() {
    const getInitialTheme = () => {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored === 'light' || stored === 'dark') return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const getInitialDarkVariant = () => {
        const stored = localStorage.getItem(DARK_VARIANT_KEY);
        return stored === 'dark-alt' ? 'dark-alt' : 'dark';
    };

    const [theme, setThemeState] = useState(getInitialTheme);
    const [darkVariantState, setDarkVariantState] = useState(getInitialDarkVariant);

    const setTheme = (value) => {
        localStorage.setItem(USER_HAS_SELECTED, 'true');
        localStorage.setItem(THEME_KEY, value);
        setThemeState(value);
    };

    const setDarkVariant = (value) => {
        localStorage.setItem(DARK_VARIANT_KEY, value);
        setDarkVariantState(value);
    };

    useLayoutEffect(() => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark', 'dark-alt');
        const applied = theme === 'light' ? 'light' : darkVariantState;
        root.classList.add(applied);
    }, [theme, darkVariantState]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleSystemChange = () => {
            const systemTheme = mediaQuery.matches ? 'dark' : 'light';
            setTheme(systemTheme);
        };

        mediaQuery.addEventListener('change', handleSystemChange);
        return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }, []);

    return {
        theme,
        setTheme,
        darkVariant: darkVariantState,
        setDarkVariant,
        isDark: theme === 'dark',
        effectiveTheme: theme === 'dark' ? darkVariantState : 'light'
    };
}