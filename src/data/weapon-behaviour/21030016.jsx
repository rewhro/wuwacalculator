import React from 'react';

export function lastDanceUI({
                                     combatState,
                                     setCombatState,
                                     activeStates,
                                     toggleState,
                                     currentParamValues = []
                                 }) {
    return (
        <div className="status-toggles">
            <div className="status-toggle-box">
                <div className="status-toggle-box-inner">
                    <p>Increases ATK by {currentParamValues[0]}</p>
                </div>

                <div className="status-toggle-box-inner">
                    <p>
                        Every time Intro Skill or Resonance Liberation is cast, Resonance Skill DMG Bonus increases by {currentParamValues[1]}.
                    </p>
                    <label className="modern-checkbox">
                        <input
                            type="checkbox"
                            checked={activeStates.eulogy || false}
                            onChange={() => toggleState('eulogy')}
                        />
                        Enable
                    </label>
                </div>
            </div>
        </div>
    );
}

export const WeaponUI = lastDanceUI;

export function applyWeaponLogic({
                                     mergedBuffs,
                                     combatState,
                                     characterState,
                                     skillMeta = {},
                                     isToggleActive = () => false,
                                     currentParamValues = []
                                 }) {
    const atkBonus = parseFloat(currentParamValues[0]);
    const skill = parseFloat(currentParamValues[1]);

    mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + atkBonus;


    if (characterState?.activeStates?.eulogy) {
        mergedBuffs.resonanceSkill = (mergedBuffs.resonanceSkill ?? 0) + skill;
    }

    return { mergedBuffs, combatState, skillMeta };
}