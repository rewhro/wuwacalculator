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
                    <p>Max HP is increased by {currentParamValues[0]}.</p>
                </div>

                <div className="status-toggle-box-inner">
                    <p>
                        15s after casting Intro Skill or Basic Attacks, ignores {currentParamValues[1]} of the target's DEF when dealing damage.
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
                        If the target has more than 1 stack of Aero Erosion, the target's DMG taken is Amplified by {currentParamValues[2]}.
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
    const hp = parseFloat(currentParamValues[0]);
    const defIgnore = parseFloat(currentParamValues[1]);
    const amp = parseFloat(currentParamValues[2]);

    const elementMap = {
        1: 'glacio',
        2: 'fusion',
        3: 'electro',
        4: 'aero',
        5: 'spectro',
        6: 'havoc'
    };
    const element = elementMap?.[activeCharacter?.attribute];

    mergedBuffs.hpPercent = (mergedBuffs.hpPercent ?? 0) + hp;

    if (characterState?.activeStates?.firstP) {
        mergedBuffs.enemyDefIgnore = (mergedBuffs.enemyDefIgnore ?? 0) + defIgnore;
    }

    if (characterState?.activeStates?.secondP && combatState.aeroErosion >= 1) {
        mergedBuffs.elementDmgAmplify[element] = (mergedBuffs.elementDmgAmplify[element] ?? 0) + amp;
    }

    return { mergedBuffs, combatState, skillMeta };
}