import React from 'react';

const weaponMap = {
    broadblade: 1,
    sword: 2,
    pistols: 3,
    gauntlets: 4,
    rectifier: 5
};

const getWeaponName = (value) => {
    const entry = Object.entries(weaponMap).find(([, val]) => val === value);
    return entry ? entry[0] : 'unknown';
};

export default function CharacterHeader({ activeCharacter, setMenuOpen, attributeIconPath, menuOpen, triggerRef }) {
    const weaponName = getWeaponName(activeCharacter?.weaponType);

    return (
        <div className="header-with-icon">
            {activeCharacter && (
                <img
                    ref={triggerRef}
                    src={activeCharacter.icon}
                    alt={activeCharacter.displayName}
                    className="header-icon"
                    loading="lazy"
                    onClick={() => setMenuOpen(!menuOpen)}
                />
            )}
            <div className="character-info-header">
                <h2>{activeCharacter?.displayName ?? "Character Info"}</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {weaponName !== 'unknown' && (
                        <img
                            src={`/assets/weapons/${weaponName}.webp`}
                            alt="weapon"
                            className="weapon-icon"
                            loading="lazy"
                        />
                    )}
                    {attributeIconPath && (
                        <img src={attributeIconPath} alt="attribute" className="attribute-icon" />
                    )}
                </div>
            </div>
        </div>
    );
}