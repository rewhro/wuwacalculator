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
                    <p>ATK is increased by {currentParamValues[0]}.</p>
                </div>

                <div className="status-toggle-box-inner">
                    <p>
                        Inflicting Aero Erosion on the target gives {currentParamValues[1]} Aero DMG Bonus for 10s.
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
                        Hitting targets with Aero Erosion reduces their Aero RES by {currentParamValues[3]} for 20s. Effects of the same name cannot be stacked.
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
    const atk = parseFloat(currentParamValues[0]);
    const resShred = parseFloat(currentParamValues[3]);
    const aero = parseFloat(currentParamValues[1]);

    const elementMap = {
        1: 'glacio',
        2: 'fusion',
        3: 'electro',
        4: 'aero',
        5: 'spectro',
        6: 'havoc'
    };
    const element = elementMap?.[activeCharacter?.attribute];

    mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + atk;

    if (characterState?.activeStates?.firstP) {
        mergedBuffs.aero = (mergedBuffs.aero ?? 0) + aero;
    }

    if (characterState?.activeStates?.secondP && element === 'aero') {
        mergedBuffs.enemyResShred = (mergedBuffs.enemyResShred ?? 0) + resShred;
    }

    return { mergedBuffs, combatState, skillMeta };
}