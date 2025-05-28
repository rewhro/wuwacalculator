// src/json-data-scripts/fetchWeapons.js
import weapons from '../data/weaponDetails.json';

export async function fetchWeapons() {
    // This assumes weaponDetails.json is preprocessed and saved
    const mapped = weapons.reduce((acc, weapon) => {
        const id = weapon.Id ?? weapon.id ?? weapon.weaponId;
        if (!id) return acc;

        acc[id] = {
            ...weapon,
            icon: `https://api.hakush.in/ww/UI/UIResources/Common/Image/IconWeapon/T_IconWeapon${id}_UI.webp`
        };

        return acc;
    }, {});

    return mapped;
}