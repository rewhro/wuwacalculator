import React, { useEffect, useState } from 'react';

export default function CharacterMenu({
                                          characters,
                                          handleCharacterSelect,
                                          menuRef,
                                          menuOpen,
                                          setMenuOpen
                                      }) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    useEffect(() => {
        if (menuOpen) {
            setIsVisible(true);
            setIsAnimatingOut(false);
        } else if (isVisible) {
            setIsAnimatingOut(true);
            const timeout = setTimeout(() => {
                setIsVisible(false);
                setIsAnimatingOut(false);
            }, 300);
            return () => clearTimeout(timeout); // clean up
        }
    }, [menuOpen]);

    const attributeMap = {
        glacio: 1,
        fusion: 2,
        electro: 3,
        aero: 4,
        spectro: 5,
        havoc: 6
    };

    const weaponMap = {
        broadblade: 1,
        sword: 2,
        pistols: 3,
        gauntlets: 4,
        rectifier: 5
    };

    const getAttributeName = (value) =>
        Object.entries(attributeMap).find(([, val]) => val === value)?.[0] ?? 'unknown';

    const getWeaponName = (value) =>
        Object.entries(weaponMap).find(([, val]) => val === value)?.[0] ?? 'unknown';

    const [selectedWeapon, setSelectedWeapon] = useState(null);
    const [selectedAttribute, setSelectedAttribute] = useState(null);

    const filteredCharacters = characters.filter((char) => {
        const weaponMatch = selectedWeapon === null || char.weaponType === weaponMap[selectedWeapon];
        const attributeMatch = selectedAttribute === null || char.attribute === attributeMap[selectedAttribute];
        return weaponMatch && attributeMatch;
    });

    if (!isVisible) return null; // optional: hide if fully finished animating out

    return (
        <div
            className={`menu-overlay ${menuOpen ? 'show' : ''} ${isAnimatingOut ? 'hiding' : ''}`}
            onClick={() => setMenuOpen(false)}
        >
            <div
                ref={menuRef}
                className={`icon-menu-vertical ${menuOpen ? 'show' : ''} ${isAnimatingOut ? 'hiding' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Menu Header */}
                <div className="menu-header-with-buttons">
                    <div className="menu-header">Select Character</div>

                    <div className="button-group-container">
                        <div className="weapon-button-group">
                            {Object.keys(weaponMap).map((weapon) => (
                                <button
                                    key={weapon}
                                    className={`weapon-button ${selectedWeapon === weapon ? 'selected' : ''}`}
                                    onClick={() => setSelectedWeapon((prev) => (prev === weapon ? null : weapon))}
                                    title={weapon}
                                >
                                    <img src={`/assets/weapons/${weapon}.webp`} alt={weapon} />
                                </button>
                            ))}
                        </div>

                        <div className="attribute-button-group">
                            {Object.keys(attributeMap).map((attr) => (
                                <button
                                    key={attr}
                                    className={`attribute-button ${selectedAttribute === attr ? 'selected' : ''}`}
                                    onClick={() => setSelectedAttribute((prev) => (prev === attr ? null : attr))}
                                    title={attr}
                                >
                                    <img src={`/assets/attributes/attributes alt/${attr}.webp`} alt={attr} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="menu-body">
                    {filteredCharacters.length > 0 ? (
                        filteredCharacters.map((char, i) => (
                            <div key={i} className="dropdown-item" onClick={() => handleCharacterSelect(char)}>
                                <div className="dropdown-item-content">
                                    <div className="dropdown-main">
                                        <img src={char.icon} alt={char.displayName} className="icon-menu-img" />
                                        <span className="dropdown-label">{char.displayName}</span>
                                    </div>
                                    <div className="dropdown-icons">
                                        <img
                                            src={`/assets/weapons/${getWeaponName(char.weaponType)}.webp`}
                                            alt="Weapon"
                                            className="mini-weapon-icon"
                                        />
                                        <img
                                            src={`/assets/attributes/attributes alt/${getAttributeName(char.attribute)}.webp`}
                                            alt="Element"
                                            className="mini-icon"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Hope Kuro Games releases the character of your dreams.</p>
                    )}
                </div>
            </div>
        </div>
    );
}