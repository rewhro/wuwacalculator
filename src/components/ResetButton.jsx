import { useState } from "react";
import { RotateCcw } from "lucide-react";
import {mapExtraStatToCombat} from "./WeaponPane.jsx";

export default function ResetButton({
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
                                        characterRuntimeStates,
                                        weapons,
                                    }) {
    const [resetModalOpen, setResetModalOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleReset = () => {
        if (!activeId) return;

        const cached = characterRuntimeStates?.[activeId];

        // 1. Clear from localStorage
        const runtime = JSON.parse(localStorage.getItem('characterRuntimeStates') || '{}');
        delete runtime[activeId];
        localStorage.setItem('characterRuntimeStates', JSON.stringify(runtime));

        // 2. Clear from React state
        setCharacterRuntimeStates(prev => {
            const updated = { ...prev };
            delete updated[activeId];
            return updated;
        });

        // 3. Reset all local React UI states
        setSliderValues(defaultSliderValues);
        setCustomBuffs(defaultCustomBuffs);
        setTraceNodeBuffs(defaultTraceBuffs);
        setCharacterLevel(1);
        setRotationEntries([]);

        // 4. Reset weapon level and stats (preserve a currently equipped weapon)
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

            // Fallback if no valid weapon is equipped
            return {
                ...defaultCombatState,
                enemyLevel: prev.enemyLevel,
                enemyRes: prev.enemyRes
            };
        });

        // 5. Close modal
        handleClose();
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setResetModalOpen(false);
            setIsClosing(false);
        }, 300);
    };

    return (
        <>
            <button className="sidebar-button" onClick={() => setResetModalOpen(true)}>
                <div className="icon-slot">
                    <RotateCcw size={24} className="reset-icon" />
                </div>
                <div className="label-slot">
                    <span className="label-text">Reset</span>
                </div>
            </button>

            {resetModalOpen && (
                <div className={`skills-modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
                    <div className={`skills-modal-content ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
                        <h2>Reset Character?</h2>
                        <div className="reset-modal-actions">
                            <button className="btn-danger" onClick={handleReset}>Reset Character</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}