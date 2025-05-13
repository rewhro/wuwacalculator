// src/components/CharacterMenu.jsx
import React from 'react';

export default function CharacterMenu({ characters, handleCharacterSelect, menuRef, menuOpen }) {
    return (
        <div ref={menuRef} className={`icon-menu-vertical ${menuOpen ? 'show' : ''}`}>
            {characters.length > 0 ? (
                characters.map((char, i) => (
                    <div key={i} className="dropdown-item" onClick={() => handleCharacterSelect(char)}>
                        <img src={char.icon} alt={char.displayName} className="icon-menu-img" />
                        <span className="dropdown-label">{char.displayName}</span>
                    </div>
                ))
            ) : (
                <p>Loading characters...</p>
            )}
        </div>
    );
}