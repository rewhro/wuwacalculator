import React from 'react';

export default function EnemyPane({ enemyLevel, setEnemyLevel, enemyRes, setEnemyRes }) {
    return (
        <div className="character-settings">
            <h3>Enemy Settings</h3>

            {/* Enemy Level Slider */}
            <div className="slider-group">
                <div className="slider-label-with-input">
                    <label>Enemy Level</label>
                    <input type="number"
                           className="character-level-input"
                           value={enemyLevel}
                           min="1"
                           max="120"
                           onChange={(e) => setEnemyLevel(Math.min(Math.max(+e.target.value, 1), 120))} />
                </div>
                <div className="slider-controls">
                    <input type="range" min="1" max="120"
                           value={enemyLevel}
                           onChange={(e) => setEnemyLevel(Number(e.target.value))}
                           style={{ '--slider-color': '#888' }} />
                    <span>{enemyLevel}</span>
                </div>
            </div>

            {/* Enemy Resistance Slider */}
            <div className="slider-group">
                <div className="slider-label-with-input">
                    <label>Enemy Resistance (%)</label>
                    <input type="number"
                           className="character-level-input"
                           value={enemyRes}
                           min="0"
                           max="100"
                           onChange={(e) => setEnemyRes(Math.min(Math.max(+e.target.value, 0), 100))} />
                </div>
                <div className="slider-controls">
                    <input type="range" min="0" max="100"
                           value={enemyRes}
                           onChange={(e) => setEnemyRes(Number(e.target.value))}
                           style={{ '--slider-color': '#888' }} />
                    <span>{enemyRes}%</span>
                </div>
            </div>
        </div>
    );
}