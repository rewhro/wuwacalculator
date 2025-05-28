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
    const stacks = characterRuntimeStates?.[charId]?.activeStates?.stacks ?? 0;

    const handleChange = (newValue) => {
        setCharacterRuntimeStates(prev => ({
            ...prev,
            [charId]: {
                ...(prev[charId] ?? {}),
                activeStates: {
                    ...(prev[charId]?.activeStates ?? {}),
                    stacks: newValue
                }
            }
        }));
    };

    return (
        <div className="status-toggles">
            <div className="status-toggle-box">
                <div className="status-toggle-box-inner">
                    <p>When Intro Skill is cast, increases ATK by {currentParamValues[0]} and DEF by {currentParamValues[1]}, lasting for 15s.</p>
                </div>
                <label className="modern-checkbox">
                    <input
                        type="checkbox"
                        checked={activeStates.firstP || false}
                        onChange={() => toggleState('firstP')}
                    />
                    Enable
                </label>
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
    const atk = parseFloat(currentParamValues[0]);
    const def = parseFloat(currentParamValues[1]);
    if (characterState?.activeStates?.firstP) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + atk;
        mergedBuffs.defPercent = (mergedBuffs.defPercent ?? 0) + def;
    }

    return { mergedBuffs, combatState, skillMeta };
}