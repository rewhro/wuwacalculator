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
                    <p>Increase HP by {currentParamValues[0]}.</p>
                </div>

                <div className="status-toggle-box-inner">
                    <p>
                        When casting Resonance Skill that heals, increase nearby party members' ATK by {currentParamValues[4]} for 30s. Effects of the same name cannot be stacked.
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

    const atk = parseFloat(currentParamValues[4]);
    const hp = parseFloat(currentParamValues[0]);

    mergedBuffs.hpPercent = (mergedBuffs.hpPercent ?? 0) + hp;

    if (characterState?.activeStates?.firstP) {
        mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + atk;
    }

    return { mergedBuffs, combatState, skillMeta };
}