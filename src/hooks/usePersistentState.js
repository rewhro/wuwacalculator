import { useState, useEffect } from 'react';

export function usePersistentState(key, defaultValue) {
    const [state, setState] = useState(() => {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch {
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (err) {
            console.warn(`Error saving ${key} to localStorage`, err);
        }
    }, [key, state]);

    return [state, setState];
}