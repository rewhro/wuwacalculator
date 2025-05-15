import React from 'react';

export default function EnemyPane({ combatState, setCombatState }) {
    return (
        <div className="character-settings">
            <h3>Enemy Settings</h3>

            {/* Enemy Level Slider */}
            <div className="slider-group">
                <div className="slider-label-with-input">
                    <label>Enemy Level</label>
                    <input type="number"
                           className="character-level-input"
                           value={combatState.enemyLevel}
                           min="1"
                           max="120"
                           onChange={(e) => setCombatState(prev => ({
                               ...prev,
                               enemyLevel: Math.min(Math.max(+e.target.value, 1), 120)
                           }))} />
                </div>
                <div className="slider-controls">
                    <input type="range" min="1" max="120"
                           value={combatState.enemyLevel}
                           onChange={(e) => setCombatState(prev => ({
                               ...prev,
                               enemyLevel: Number(e.target.value)
                           }))}
                           style={{ '--slider-color': '#888' }} />
                    <span>{combatState.enemyLevel}</span>
                </div>
            </div>

            {/* Enemy Resistance Slider */}
            <div className="slider-group">
                <div className="slider-label-with-input">
                    <label>Enemy Resistance (%)</label>
                    <input type="number"
                           className="character-level-input"
                           value={combatState.enemyRes}
                           min="0"
                           max="100"
                           onChange={(e) => setCombatState(prev => ({
                               ...prev,
                               enemyRes: Math.min(Math.max(+e.target.value, 0), 100)
                           }))} />
                </div>
                <div className="slider-controls">
                    <input type="range" min="0" max="100"
                           value={combatState.enemyRes}
                           onChange={(e) => setCombatState(prev => ({
                               ...prev,
                               enemyRes: Number(e.target.value)
                           }))}
                           style={{ '--slider-color': '#888' }} />
                    <span>{combatState.enemyRes}%</span>
                </div>
            </div>
        </div>
    );
}