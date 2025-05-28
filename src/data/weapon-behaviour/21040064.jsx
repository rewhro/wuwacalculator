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
                    <p>
                        When Resonance Liberation is cast, grants 3 stack(s) of Iron Armor. Each stack increases ATK and DEF by {currentParamValues[1]}, stacking up to 3 time(s). When the Resonator takes damage, reduces the number of stacks by 1.
                    </p>
                </div>
                <label className="modern-checkbox">
                    <DropdownSelect
                        label=""
                        options={Array.from({ length: 4 }, (_, i) => i)}
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
    const bonus = parseFloat(currentParamValues[1]) * stacks;

    mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + bonus;
    mergedBuffs.defPercent = (mergedBuffs.defPercent ?? 0) + bonus;


    return { mergedBuffs, combatState, skillMeta };
}