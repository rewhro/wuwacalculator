import React from 'react';

export default function ToolbarIconButton({ iconName, onClick, altText, effectiveTheme }) {
    let iconPath;

    if (effectiveTheme === 'dark') {
        iconPath = `/assets/icons/dark/${iconName}.png`;
    } else {
        iconPath = `/assets/icons/light/${iconName}.png`;
    }

    return (
        <button onClick={onClick} className="toolbar-icon-button">
            <img src={iconPath} alt={altText} style={{ maxWidth: 30, maxHeight: 30, minWidth: 30, minHeight: 30 }} />
        </button>
    );
}

export function ToolbarSidebarButton({ iconName, label, onClick, selected, effectiveTheme }) {
    const iconPath = `/assets/icons/${effectiveTheme === 'dark' ? 'dark' : 'light'}/${iconName}.png`;

    return (
        <button
            className={`sidebar-button ${selected ? 'active' : ''}`}
            onClick={onClick}
        >
            <div className="icon-slot">
                <img src={iconPath} alt={label} style={{ maxWidth: 24, maxHeight: 24, minWidth: 24, minHeight: 24 }} />
            </div>
            <div className="label-slot">
                <span className="label-text">{label}</span>
            </div>
        </button>
    );
}