import React, { useState } from 'react';
import {setIconMap} from "../constants/echoSetData.jsx";

export default function EchoMenu({ echoes, handleEchoSelect, menuRef, menuOpen, setMenuOpen }) {
    const [selectedCost, setSelectedCost] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSet, setSelectedSet] = useState(null);

    const filteredEchoes = echoes.filter(echo => {
        const matchesCost = selectedCost === null || echo.cost === selectedCost;
        const matchesName = echo.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSet = selectedSet === null || (echo.sets || []).includes(selectedSet);
        return matchesCost && matchesName && matchesSet;
    });

    if (!menuOpen) return null;

    return (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)}>
            <div ref={menuRef} className="icon-menu-vertical show" onClick={e => e.stopPropagation()}>
                <div className="menu-header-with-buttons echo">
                    <div className="menu-header">Select Echo</div>
                    <div className="button-group-container echo">
                        {Object.entries(setIconMap).map(([setId, iconPath]) => (
                            <img
                                key={setId}
                                src={iconPath}
                                alt={`Set ${setId}`}
                                className={`set-icon-filter ${selectedSet === Number(setId) ? 'selected' : ''}`}
                                onClick={() =>
                                    setSelectedSet(prev => prev === Number(setId) ? null : Number(setId))
                                }
                            />
                        ))}
                        {[1, 3, 4].map(cost => (
                            <button
                                key={cost}
                                className={`echo-slot-cost-badge mini ${selectedCost === cost ? 'selected' : ''}`}
                                onClick={() => setSelectedCost(prev => prev === cost ? null : cost)}
                            >
                                C {cost}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="menu-body">
                    {filteredEchoes.map((echo, i) => (
                        <div key={i} className="dropdown-item" onClick={() => handleEchoSelect(echo)}>
                            <div className="dropdown-main">
                                <img src={echo.icon} alt={echo.name} className="icon-menu-img" />
                                <span className="dropdown-label">{echo.name}</span>
                            </div>
                            <div className="echo-meta">
                                <div className="echo-slot-cost-badge">Cost {echo.cost}</div>
                                <div className="set-icons-row">
                                    {echo.sets?.map(setId => (
                                        <img
                                            key={setId}
                                            src={setIconMap[setId]}
                                            alt={`Set ${setId}`}
                                            className="set-icon"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}