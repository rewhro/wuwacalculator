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
                        Dealing DMG to enemies with Spectro Frazzle increases the wielder's Spectro DMG by {currentParamValues[0]}, gaining 1 stack per second for 6s, stacking up to 4 times.
                    </p>
                </div>
                <label className="modern-checkbox">
                    <DropdownSelect
                        label=""
                        options={[0, 1, 2, 3, 4]}
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
    const spectro = parseFloat(currentParamValues[0]) * stacks;

    if (combatState.spectroFrazzle > 0) {
        mergedBuffs.spectro = (mergedBuffs.spectro ?? 0) + spectro;
    }

    return { mergedBuffs, combatState, skillMeta };
}