// src/components/EchoBagMenu.jsx
import React from 'react';
import { useGlobalEchoBag } from '../hooks/useGlobalEchoBag';

export default function EchoBagMenu({ onClose, onEquip }) {
    const { echoBag, removeEchoFromBag } = useGlobalEchoBag();

    return (
        <div className="echo-menu-overlay" onClick={onClose}>
            <div className="echo-menu-content" onClick={(e) => e.stopPropagation()}>
                <h2>Echo Bag</h2>
                <div className="echo-grid">
                    {echoBag.map(echo => (
                        <div key={echo.uid} className="echo-tile">
                            <img src={echo.icon} alt={echo.name} />
                            <div>{echo.name}</div>
                            <button onClick={() => onEquip(echo)}>Equip</button>
                            <button onClick={() => removeEchoFromBag(echo.uid)}>Remove</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}