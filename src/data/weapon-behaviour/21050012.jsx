import React from 'react';
import DropdownSelect from "../../components/DropdownSelect.jsx";

export function applyWeaponLogic({
                                     mergedBuffs,
                                     combatState,
                                     characterState,
                                     skillMeta = {},
                                     isToggleActive = () => false,
                                     currentParamValues = []
                                 }) {
    const atk = parseFloat(currentParamValues[0]);
    mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + atk;


    return { mergedBuffs, combatState, skillMeta };
}