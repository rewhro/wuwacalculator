// CharacterHeader.jsx
import React from 'react';

export default function CharacterHeader({ activeCharacter, setMenuOpen, attributeIconPath, menuOpen, triggerRef }) {
    return (
        <div className="header-with-icon">
            {activeCharacter && (
                <img
                    ref={triggerRef} // ✅ allow outside click logic to detect the trigger
                    src={activeCharacter.icon}
                    alt={activeCharacter.displayName}
                    className="header-icon"
                    onClick={() => setMenuOpen(!menuOpen)}
                />
            )}
            <div className="character-info-header">
                <h2>{activeCharacter?.displayName ?? "Character Info"}</h2>
                {attributeIconPath && (
                    <img src={attributeIconPath} alt="attribute" className="attribute-icon" />
                )}
            </div>
        </div>
    );
}