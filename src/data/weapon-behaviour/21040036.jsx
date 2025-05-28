import React from 'react';

export function blazingJusticeUI({
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
                        When enabled, Basic Attacks ignore {currentParamValues[1] ?? '8%'} of enemy DEF and Spectro Frazzle DMG is Amplified by {currentParamValues[2] ?? '50%'}.
                    </p>
                    <label className="modern-checkbox">
                        <input
                            type="checkbox"
                            checked={activeStates.darknessBreaker || false}
                            onChange={() => toggleState('darknessBreaker')}
                        />
                        Enable
                    </label>
                </div>
            </div>
        </div>
    );
}

export const WeaponUI = blazingJusticeUI;

export function applyWeaponLogic({
                                     mergedBuffs,
                                     combatState,
                                     characterState,
                                     skillMeta = {},
                                     isToggleActive = () => false,
                                     currentParamValues = []
                                 }) {
    const atkBonus = parseFloat(currentParamValues[0]);
    const defIgnore = parseFloat(currentParamValues[1]);
    const amplify = parseFloat(currentParamValues[2]);
    mergedBuffs.atkPercent = (mergedBuffs.atkPercent ?? 0) + atkBonus;


    if (characterState?.activeStates?.darknessBreaker) {
        mergedBuffs.enemyDefIgnore = (mergedBuffs.enemyDefIgnore ?? 0) + defIgnore;
        mergedBuffs.damageTypeAmplify.spectroFrazzle = (mergedBuffs.damageTypeAmplify.spectroFrazzle ?? 0) + amplify;
    }

    return { mergedBuffs, combatState, skillMeta };
}