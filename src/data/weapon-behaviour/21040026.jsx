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
                    <p>Increases ATK by {currentParamValues[0]}.</p>
                </div>

                <div className="status-toggle-box-inner">
                    <p>
                        Every time Basic Attack or Intro Skill is cast, Heavy Attack DMG Bonus increases by {currentParamValues[1]} for 3s.
                    </p>
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

    const atk = parseFloat(currentParamValues[0]);
    const firstP = parseFloat(currentParamValues[1]);

    mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + atk;


    if (characterState?.activeStates?.firstP) {
        mergedBuffs.heavyAtk = (mergedBuffs.heavyAtk ?? 0) + firstP;
    }


    return { mergedBuffs, combatState, skillMeta };
}