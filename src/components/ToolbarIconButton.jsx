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
            <img src={iconPath} alt={altText} style={{ width: 34, height: 34 }} />
        </button>
    );
}