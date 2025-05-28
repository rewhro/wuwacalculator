// src/data/weapon-ui/index.js
const modules = import.meta.glob('./*.jsx', { eager: true });

const weaponUIMap = {};
const weaponLogicMap = {};

for (const path in modules) {
    const file = modules[path];
    const weaponId = path.match(/\/(\d+)\.jsx$/)?.[1];

    if (weaponId) {
        if (file.WeaponUI) {
            weaponUIMap[weaponId] = file.WeaponUI;
        }
        if (file.applyWeaponLogic) {
            weaponLogicMap[weaponId] = file.applyWeaponLogic;
        }
    }
}

export function getWeaponUIComponent(weaponId) {
    return weaponUIMap[String(weaponId)] ?? null;
}

export function getWeaponOverride(weaponId) {
    const applyLogic = weaponLogicMap[String(weaponId)];
    return applyLogic ? { applyWeaponLogic: applyLogic } : null;
}