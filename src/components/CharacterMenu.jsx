import React from 'react';

export default function CharacterMenu({
                                          characters,
                                          handleCharacterSelect,
                                          menuRef,
                                          menuOpen,
                                          setMenuOpen
                                      }) {
    if (!menuOpen) return null;

    return (
        <div
            className="menu-overlay"
            onClick={() => setMenuOpen(false)} // closes when clicking outside
        >
            <div
                ref={menuRef}
                className="icon-menu-vertical show"
                onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            >
                <div className="menu-header">Select Character</div>
                <div className="menu-body">
                    {characters.length > 0 ? (
                        characters.map((char, i) => (
                            <div
                                key={i}
                                className="dropdown-item"
                                onClick={() => handleCharacterSelect(char)}
                            >
                                <img
                                    src={char.icon}
                                    alt={char.displayName}
                                    className="icon-menu-img"
                                />
                                <span className="dropdown-label">{char.displayName}</span>
                            </div>
                        ))
                    ) : (
                        <p>Loading characters...</p>
                    )}
                </div>
            </div>
        </div>
    );
}