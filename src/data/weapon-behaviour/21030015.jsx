import React from 'react';
import DropdownSelect from "../../components/DropdownSelect.jsx";

export function WeaponUI({
                                 combatState,
                                 setCombatState,
                                 activeStates,
                                 toggleState,
                                 currentParamValues = [],
                                 characterRuntimeStates, setCharacterRuntimeStates, charId
                             }) {

    return (
        <div className="status-toggles">
            <div className="status-toggle-box">
                <div className="status-toggle-box-inner">
                    <p>Increases Energy Regen by {currentParamValues[0]}.</p>
                </div>

                <div className="status-toggle-box-inner">
                    <p>
                        Incoming Resonator's ATK is increased by {currentParamValues[1]} for 14s, stackable for up to 1 times after the wielder casts Outro Skill.
                    </p>

                </div>
            </div>
        </div>
    );
}


export function applyWeaponLogic({
                                     mergedBuffs,
                                     combatState,
                                     characterState,
                                     skillMeta = {},
                                     isToggleActive = () => false,
                                     currentParamValues = []
                                 }) {
    const energy = parseFloat(currentParamValues[0]);
    mergedBuffs.energyRegen = (mergedBuffs.energyRegen ?? 0) + energy;

    return { mergedBuffs, combatState, skillMeta };
}