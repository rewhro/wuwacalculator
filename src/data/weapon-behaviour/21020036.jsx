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
                    <p>Increase Crit. Rate by {currentParamValues[0]}.</p>
                </div>

                <div className="status-toggle-box-inner">
                    <p>
                        Casting Resonance Liberation gives {currentParamValues[1]} Basic Attack DMG Bonus.
                    </p>
                    <label className="modern-checkbox">
                        <input
                            type="checkbox"
                            checked={activeStates.firstP || false}
                            onChange={() => toggleState('firstP')}
                        />
                        Enable
                    </label>
                    <p>
                        Dealing Basic Attack DMG gives {currentParamValues[3]} Basic Attack DMG Bonus.
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
                                     currentParamValues = []
                                 }) {
    const basic1 = parseFloat(currentParamValues[1]);
    const cr = parseFloat(currentParamValues[0]);
    const basic2 = parseFloat(currentParamValues[3]);

    mergedBuffs.critRate = (mergedBuffs.critRate ?? 0) + cr;

    if (characterState?.activeStates?.firstP) {
        mergedBuffs.basicAtk = (mergedBuffs.basicAtk ?? 0) + basic1;
    }

    if (characterState?.activeStates?.secondP) {
        mergedBuffs.basicAtk = (mergedBuffs.basicAtk ?? 0) + basic2;
    }

    return { mergedBuffs, combatState, skillMeta };
}