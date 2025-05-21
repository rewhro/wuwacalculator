import React from 'react';

export default function ToolbarIconButton({ iconName, onClick, altText, effectiveTheme }) {
    let iconPath;

    if (effectiveTheme === 'dark') {
        iconPath = `/assets/icons/dark/${iconName}.png`;
    } else {
        iconPath = `/assets/icons/light/${iconName}.png`;
    }

    console.log(`[🧪 Icon Theme] Using theme: ${effectiveTheme}, icon path: ${iconPath}`);

    return (
        <button onClick={onClick} className="toolbar-icon-button">
            <img src={iconPath} alt={altText} style={{ width: 28, height: 28 }} />
        </button>
    );
}