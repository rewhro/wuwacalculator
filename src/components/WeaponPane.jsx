// src/components/WeaponPane.jsx
import React from 'react';

export default function WeaponPane({ activeCharacter, combatState, setCombatState }) {
    return (
        <div className="character-settings">
            <h3>Weapon Settings</h3>

            {/* Weapon Base ATK input */}
            <div className="slider-group">
                <div className="slider-label-with-input">
                    <label>Weapon Base ATK</label>
                    <input
                        type="number"
                        value={combatState.weaponBaseAtk ?? 0}
                        min="0"
                        max="999"
                        onChange={(e) => setCombatState(prev => ({
                            ...prev,
                            weaponBaseAtk: Number(e.target.value)
                        }))}
                    />
                </div>
            </div>

            {/* Future weapon options can be added here later */}
        </div>
    );
}