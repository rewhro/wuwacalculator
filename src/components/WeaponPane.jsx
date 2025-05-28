import React, { useEffect, useRef, useState } from 'react';
import WeaponMenu from './WeaponMenu';

export default function WeaponPane({ activeCharacter, combatState, setCombatState, weapons }) {
    const [weaponMenuOpen, setWeaponMenuOpen] = useState(false);
    const weaponMenuRef = useRef(null);
    const weaponTriggerRef = useRef(null);

    const weaponId = combatState.weaponId;
    const weaponLevel = combatState.weaponLevel ?? 1;
    const activeWeaponIconPath = weaponId
        ? `/assets/weapon-icons/${weaponId}.webp`
        : '/assets/default-icon.webp';


    const [selectedRarities, setSelectedRarities] = useState([1, 2, 3, 4, 5]);

    const handleWeaponSelect = (weapon) => {
        if (combatState.weaponId === weapon.Id) return;

        const levelData = weapon.Stats?.["0"]?.["1"] ?? weapon.Stats?.["0"]?.["0"];
        const baseAtk = levelData?.[0]?.Value ?? 0;
        const stat = levelData?.[1] ?? null;

        const mappedStat = mapExtraStatToCombat(stat);

        setCombatState(prev => ({
            ...prev,
            weaponId: weapon.Id,
            weaponLevel: 1,
            weaponBaseAtk: baseAtk,
            weaponStat: stat,
            weaponRarity: weapon.Rarity ?? 1,

            // 🔁 Reset all mapped stat fields to 0 before applying the new one
            atkPercent: 0,
            defPercent: 0,
            hpPercent: 0,
            critRate: 0,
            critDmg: 0,
            energyRegen: 0,
            ...mappedStat
        }));
        setWeaponMenuOpen(false);
    };

    const handleLevelChange = (level) => {
        const weapon = Object.values(weapons).find(w => w.Id === weaponId);
        if (!weapon) return;

        let tier = 0;
        if (level >= 80) tier = 6;
        else if (level >= 70) tier = 5;
        else if (level >= 60) tier = 4;
        else if (level >= 50) tier = 3;
        else if (level >= 40) tier = 2;
        else if (level >= 20) tier = 1;

        const stats = weapon.Stats?.[tier]?.[level];
        if (!stats) return;

        const baseAtk = Math.trunc(stats[0]?.Value ?? 0);
        const stat = stats[1] ?? null;

        const mappedStat = mapExtraStatToCombat(stat);

        setCombatState(prev => ({
            ...prev,
            weaponLevel: level,
            weaponBaseAtk: baseAtk,
            weaponStat: stat,
            ...mappedStat
        }));
    };

    const formatStatValue = (stat) => {
        const name = stat?.Name ?? 'Stat';
        const value = stat?.Value ?? 0;
        const isRatio = stat?.IsRatio;
        const isPercent = stat?.IsPercent;

        let formattedValue = value;

        if (isRatio) {
            formattedValue = `${(value * 100).toFixed(2)}%`;
        } else if (isPercent) {
            formattedValue = `${(value / 100).toFixed(2)}%`;
        } else {
            formattedValue = value.toFixed(2);
        }

        return `${name}: ${formattedValue}`;
    };

    const filteredWeapons = Object.values(weapons)
        .filter(
            (weapon) =>
                typeof weapon.Id === 'number' &&
                String(weapon.Id).length >= 8 &&
                (activeCharacter?.weaponType == null || weapon.Type === activeCharacter.weaponType)
        )
        .sort((a, b) => (b.Rarity ?? 0) - (a.Rarity ?? 0));

    function mapExtraStatToCombat(stat) {
        if (!stat || !stat.Name) return {};

        const value = stat.Value ?? 0;
        const name = stat.Name.toLowerCase();

        // Handle ratio and percent
        const scaled = stat.IsRatio ? value * 100 : stat.IsPercent ? value / 100 : value;

        switch (name) {
            case 'atk': return stat.IsRatio ? { atkPercent: scaled } : { atk: scaled };
            case 'hp': return stat.IsRatio ? { hpPercent: scaled } : { hp: scaled };
            case 'def': return stat.IsRatio ? { defPercent: scaled } : { def: scaled };
            case 'crit. rate': return { critRate: scaled };
            case 'crit. dmg': return { critDmg: scaled };
            case 'energy regen': return { energyRegen: scaled };
            default: return {};
        }
    }

    useEffect(() => {
        if (!combatState.weaponId && filteredWeapons.length > 0) {
            handleWeaponSelect(filteredWeapons[0]);
        }
    }, [activeCharacter, filteredWeapons]);

    return (
        <div className="character-settings">
            <h3>Weapon Settings</h3>

            {/* Weapon Icon Trigger */}
            <div className="weapon-header-row">
                <div
                    className={`weapon-icon-wrapper rarity-${combatState.weaponRarity ?? 1}`}
                    onClick={() => setWeaponMenuOpen(prev => !prev)}
                    ref={weaponTriggerRef}
                >
                    <img
                        src={activeWeaponIconPath}
                        alt="Weapon"
                        className="header-icon"
                        onError={(e) => {
                            e.target.onerror = null; // prevent infinite loop
                            e.target.src = '/assets/default-icon.webp';
                        }}
                    />
                </div>

                <div className="weapon-slider">
                    <div className="slider-label-inline">
                        <label style={{ fontWeight: 'bold', marginRight: '8px' }}>Level</label>
                        <input
                            type="number"
                            className="character-level-input"
                            value={weaponLevel}
                            min="1"
                            max="90"
                            onChange={(e) => handleLevelChange(Number(e.target.value))}
                        />
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="90"
                        step="1"
                        value={weaponLevel}
                        onChange={(e) => handleLevelChange(Number(e.target.value))}
                    />
                </div>
            </div>

            {/* Weapon Base ATK display */}
            <div className="slider-group">
                <div className="slider-label-with-input">
                    <label style={{ fontWeight: 'bold', fontSize: '16px' }}>ATK:</label>
                    <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        {combatState.weaponBaseAtk ?? 0}
                    </span>
                </div>
            </div>

            {/* Weapon Stat Display */}
            {combatState.weaponStat && (
                <p style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {formatStatValue(combatState.weaponStat)}
                </p>
            )}

            {/* Weapon Menu */}
            <WeaponMenu
                weapons={filteredWeapons}
                handleWeaponSelect={handleWeaponSelect}
                menuOpen={weaponMenuOpen}
                menuRef={weaponMenuRef}
                setMenuOpen={setWeaponMenuOpen}
                selectedRarities={selectedRarities}
                setSelectedRarities={setSelectedRarities}
            />
        </div>
    );
}