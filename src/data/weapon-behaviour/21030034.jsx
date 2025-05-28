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
                    <p>When the Resonator takes no damage, increases ATK by {currentParamValues[1]} every 5s, stacking up to 2 time(s). This effect lasts for 8s. When the Resonator takes damage, loses 1 stacks and heals {currentParamValues[5]} of their Max HP.</p>
                </div>
                <label className="modern-checkbox">
                    <DropdownSelect
                        label=""
                        options={[0, 1, 2]}
                        value={stacks}
                        onChange={handleChange}
                        width="80px"
                    />
                    Stacks
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
    const stacks = characterState?.activeStates?.stacks ?? 0;
    const atk = parseFloat(currentParamValues[0]) * stacks;
    
    mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + atk;

    return { mergedBuffs, combatState, skillMeta };
}