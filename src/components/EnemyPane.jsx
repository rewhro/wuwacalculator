import React from 'react';

export default function EnemyPane({ enemyLevel, setEnemyLevel, enemyRes, setEnemyRes, combatState, setCombatState }) {
    if (enemyLevel == null || enemyRes == null) return null;

    const handleLevelChange = (val) => {
        const clamped = Math.min(120, Math.max(1, Number(val)));
        setEnemyLevel(clamped);
        setCombatState(prev => ({ ...prev, enemyLevel: clamped }));
    };

    const handleResChange = (val) => {
        const clamped = Math.min(100, Math.max(0, Number(val)));
        setEnemyRes(clamped);
        setCombatState(prev => ({ ...prev, enemyRes: clamped }));
    };

    return (
        <div className="character-settings">
            <h3>Enemy Settings</h3>

            {/* Enemy Level slider + number */}
            <div className="slider-group">
                <div className="slider-label-with-input">
                    <label htmlFor="enemy-level">Enemy Level </label>
                    <input
                        id="enemy-level"
                        type="number"
                        min="1"
                        max="120"
                        value={enemyLevel}
                        onChange={(e) => handleLevelChange(e.target.value)}
                    />
                </div>
                <input
                    type="range"
                    min="1"
                    max="120"
                    value={enemyLevel}
                    onChange={(e) => handleLevelChange(e.target.value)}
                />
            </div>

            {/* Enemy Resistance slider + number */}
            <div className="slider-group">
                <div className="slider-label-with-input">
                    <label htmlFor="enemy-res">Enemy Resistance </label>
                    <input
                        id="enemy-res"
                        type="number"
                        min="0"
                        max="100"
                        value={enemyRes}
                        onChange={(e) => handleResChange(e.target.value)}
                    />
                    <span>%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={enemyRes}
                    onChange={(e) => handleResChange(e.target.value)}
                />
            </div>
        </div>
    );
}