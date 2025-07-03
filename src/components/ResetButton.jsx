import React, { useState } from "react";
import { RotateCcw } from "lucide-react";
import {mapExtraStatToCombat} from "./WeaponPane.jsx";

export default function ResetButton({ onClick }) {
    return (
        <button className="sidebar-button" onClick={onClick}>
            <div className="icon-slot">
                <RotateCcw size={24} className="reset-icon" />
            </div>
            <div className="label-slot">
                <span className="label-text">Reset</span>
            </div>
        </button>
    );
}

export function ResetCharacter ({
                                    activeId,
                                    setCharacterRuntimeStates,
                                    setSliderValues,
                                    setCustomBuffs,
                                    setTraceNodeBuffs,
                                    setCombatState,
                                    setCharacterLevel,
                                    setRotationEntries,
                                    defaultSliderValues,
                                    defaultCustomBuffs,
                                    defaultTraceBuffs,
                                    defaultCombatState,
                                    weapons,
                                    handleClose,
                                    isClosing,
                                    setTeam,
                                }) {
    const handleReset = () => {
        if (!activeId) return;

        const runtime = JSON.parse(localStorage.getItem('characterRuntimeStates') || '{}');
        delete runtime[activeId];
        localStorage.setItem('characterRuntimeStates', JSON.stringify(runtime));

        setCharacterRuntimeStates(prev => {
            const updated = { ...prev };
            delete updated[activeId];
            return updated;
        });

        setSliderValues(defaultSliderValues);
        setCustomBuffs(defaultCustomBuffs);
        setTraceNodeBuffs(defaultTraceBuffs);
        setCharacterLevel(1);
        setRotationEntries([]);
        setTeam([activeId ?? null, null, null]);

        setCombatState(prev => {
            const weaponId = prev.weaponId;
            const weapon = weapons?.[weaponId];

            if (weapon) {
                const levelData = weapon.Stats?.["0"]?.["1"] ?? weapon.Stats?.["0"]?.["0"];
                const baseAtk = levelData?.[0]?.Value ?? 0;
                const stat = levelData?.[1] ?? null;
                const mappedStat = mapExtraStatToCombat(stat);

                return {
                    ...defaultCombatState,
                    enemyLevel: prev.enemyLevel,
                    enemyRes: prev.enemyRes,
                    weaponId,
                    weaponLevel: 1,
                    weaponRank: 1,
                    weaponBaseAtk: baseAtk,
                    weaponStat: stat,
                    weaponRarity: weapon.Rarity ?? 1,
                    weaponEffect: weapon.Effect ?? null,
                    weaponEffectName: weapon.EffectName ?? null,
                    weaponParam: weapon.Param ?? [],
                    ...mappedStat
                };
            }

            return {
                ...defaultCombatState,
                enemyLevel: prev.enemyLevel,
                enemyRes: prev.enemyRes
            };
        });

        handleClose();
    };

    return (
        <div className={`skills-modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
            <div className={`skills-modal-content ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
                <h2>Reset Character?</h2>
                <div className="reset-modal-actions">
                    <button className="btn-danger" onClick={handleReset}>Reset Character</button>
                </div>
            </div>
        </div>
    )
}