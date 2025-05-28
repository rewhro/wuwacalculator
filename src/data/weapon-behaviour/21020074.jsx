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
                        When Resonance Skill is cast, increases Basic Attack DMG Bonus and Heavy Attack DMG Bonus by {currentParamValues[0]}, stacking up to 1 time(s). This effect lasts for 10s and can be triggered 1 time(s) every 1s.
                    </p>
                </div>
                <label className="modern-checkbox">
                    <DropdownSelect
                        label=""
                        options={Array.from({ length: 2 }, (_, i) => i)}
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
    const bonus = parseFloat(currentParamValues[0]) * stacks;

    mergedBuffs.heavyAtk = (mergedBuffs.heavyAtk ?? 0) + bonus;
    mergedBuffs.basicAtk = (mergedBuffs.basicAtk ?? 0) + bonus;


    return { mergedBuffs, combatState, skillMeta };
}