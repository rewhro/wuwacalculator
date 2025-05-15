// src/components/ToolbarIconButton.jsx
import React from 'react';
import useDarkMode from '../hooks/useDarkMode';

export default function ToolbarIconButton({ iconName, onClick, altText }) {
    const isDark = useDarkMode();
    const iconPath = `/assets/icons/${isDark ? 'dark' : 'light'}/${iconName}.png`;

    return (
        <button onClick={onClick} className="toolbar-icon-button">
            <img src={iconPath} alt={altText} style={{ width: 28, height: 28 }} />
        </button>
    );
}