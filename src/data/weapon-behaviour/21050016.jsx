import React from 'react';
import DropdownSelect from "../../components/DropdownSelect.jsx";
import {elementToAttribute} from "../../utils/attributeHelpers.js";

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
                    <p>Grants {currentParamValues[0]} Attribute DMG Bonus.</p>
                </div>

                <div className="status-toggle-box-inner">
                    <p>
                        When dealing Resonance Skill DMG, increases ATK by {currentParamValues[1]}, stacking up to 2 times.
                    </p>
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
                    <p>
                        When the wielder is not on the field, increases their ATK by an additional {currentParamValues[4]}.
                    </p>
                    <label className="modern-checkbox">
                        <input
                            type="checkbox"
                            checked={activeStates.secondP || false}
                            onChange={() => toggleState('secondP')}
                        />
                        Enable
                    </label>
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
                                     currentParamValues = [],
                                     activeCharacter
                                 }) {
    const attr = parseFloat(currentParamValues[0]);
    const stacks = characterState?.activeStates?.stacks ?? 0;
    const atk = parseFloat(currentParamValues[1]) * stacks;
    const atk2 = parseFloat(currentParamValues[4]);

    for (const elem of Object.values(elementToAttribute)) {
        mergedBuffs[elem] = (mergedBuffs[elem] ?? 0) + attr;
    }
    mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + atk;

    if (characterState?.activeStates?.secondP) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + atk2;
    }

    return { mergedBuffs, combatState, skillMeta };
}