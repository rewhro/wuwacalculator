import React, { useEffect, useState } from 'react';
import { imageCache } from '../pages/calculator.jsx';
export default function CharacterMenu({
                                          characters,
                                          handleCharacterSelect,
                                          menuRef,
                                          menuOpen,
                                          setMenuOpen,
    attributeMap,
    weaponMap
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

    if (!isVisible) return null;

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
                                    <img
                                        src={imageCache[`/assets/weapons/${weapon}.webp`]?.src || `/assets/weapons/${weapon}.webp`}
                                        alt={weapon}
                                        loading="eager"
                                    />
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
                                    <img
                                        src={imageCache[`/assets/attributes/attributes alt/${attr}.webp`]?.src || `/assets/attributes/attributes alt/${attr}.webp`}
                                        alt={attr}
                                        loading="eager"
                                    />
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
                                        <img
                                            src={imageCache[char.icon]?.src || char.icon}
                                            alt={char.displayName}
                                            className="icon-menu-img"
                                            loading="eager"
                                        />
                                        <span className="dropdown-label">{char.displayName}</span>
                                    </div>
                                    <div className="dropdown-icons">
                                        <img
                                            src={imageCache[`/assets/weapons/${getWeaponName(char.weaponType)}.webp`]?.src || `/assets/weapons/${getWeaponName(char.weaponType)}.webp`}
                                            alt="Weapon"
                                            className="mini-weapon-icon"
                                            loading="eager"
                                        />
                                        <img
                                            src={imageCache[`/assets/attributes/attributes alt/${getAttributeName(char.attribute)}.webp`]?.src || `/assets/attributes/attributes alt/${getAttributeName(char.attribute)}.webp`}
                                            alt="Element"
                                            className="mini-icon"
                                            loading="eager"
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