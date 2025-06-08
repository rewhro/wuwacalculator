// src/components/EchoBagMenu.jsx
import React, {useEffect, useState} from 'react';
import { X } from 'lucide-react';
import {formatStatKey, getValidMainStats} from "./EchoesPane.jsx";
import EditSubstatsModal from './EchoEditModal';
import {setIconMap} from "../constants/echoSetData";
import { isEqual } from 'lodash'; // optional if you prefer deep comparison
import {
    getEchoBag,
    subscribeEchoBag,
    removeEchoFromBag,
    updateEchoInBag
} from '../state/echoBagStore';

function isEchoModified(oldEcho, updatedEcho) {
    return (
        oldEcho.selectedSet !== updatedEcho.selectedSet ||
        oldEcho.cost !== updatedEcho.cost ||
        !isEqual(oldEcho.mainStats, updatedEcho.mainStats) ||
        !isEqual(oldEcho.subStats, updatedEcho.subStats)
    );
}

export default function EchoBagMenu({ onClose, onEquip }) {
    const [echoBag, setEchoBag] = useState(getEchoBag());

    useEffect(() => {
        const unsubscribe = subscribeEchoBag(setEchoBag);
        return unsubscribe;
    }, []);

    const [version, setVersion] = useState(0); // unused, for forcing rerender
    const [editingEcho, setEditingEcho] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [selectedCost, setSelectedCost] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSet, setSelectedSet] = useState(null);

    useEffect(() => {
        setIsVisible(true);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setIsAnimatingOut(false);
            });
        });
    }, []);

    const handleOverlayClick = () => {
        if (!editingEcho) {
            setIsAnimatingOut(true);
            setTimeout(() => {
                setIsVisible(false);
                onClose(); // call parent's close
                setIsAnimatingOut(false);
            }, 300);
        }
    };

    const filteredEchoes = [...echoBag]
        .filter(echo => {
            const matchesCost = selectedCost === null || echo.cost === selectedCost;
            const matchesName = echo.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSet = selectedSet === null || echo.selectedSet === selectedSet;
            return matchesCost && matchesName && matchesSet;
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    if (!isVisible) return null;

    return (
        <div
            className={`menu-overlay ${isAnimatingOut ? 'hiding' : 'show'}`}
            onClick={handleOverlayClick}
        >
            <div
                className={`edit-substats-modal echo-bag-modal ${isAnimatingOut ? 'hiding' : 'show'}`}
                onClick={(e) => e.stopPropagation()}
            >
                    <div className="menu-header-with-buttons">
                        <div className="menu-header">Saved Echoes</div>
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
                    <div className="modal-body echo-grid">
                        {filteredEchoes.length === 0 ? (
                            <div className="empty-message">
                                ...
                            </div>
                        ) : (
                            filteredEchoes.map(echo => (
                                <div key={echo.uid}
                                     className="echo-tile"
                                     onClick={() => {
                                         const freshEcho = echoBag.find(e => e.uid === echo.uid);
                                         setEditingEcho(freshEcho);
                                     }}
                                >
                                    <div className="remove-button-container">
                                        <button
                                            className="remove-substat-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeEchoFromBag(echo.uid);
                                                setVersion(v => v + 1); // force re-render
                                            }}
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="echo-set-cost-header">
                                        {echo.selectedSet && (
                                            <img
                                                src={setIconMap[echo.selectedSet]}
                                                alt={`Set ${echo.selectedSet}`}
                                                className="echo-set-icon-bag"
                                            />
                                        )}
                                        <div className="echo-slot-cost-badge bag">{echo.cost}</div>
                                    </div>

                                    <img src={echo.icon} alt={echo.name} />
                                    <div className="echo-name">{echo.name}</div>

                                    <div className="echo-stats-preview">
                                        <div className="echo-bag-info-main">
                                            {Object.entries(echo.mainStats ?? {}).map(([key, val]) => (
                                                <div key={key} className="stat-row">
                                                    <span className="echo-stat-label">{formatStatKey(key)}</span>
                                                    <span className="echo-stat-value">
                                                {key.endsWith('Flat')
                                                    ? val
                                                    : (typeof val === 'number' ? `${val.toFixed(1)}%` : '—')}
                                            </span>
                                                </div>
                                            ))}
                                        </div>
                                        {Object.entries(echo.subStats ?? {}).map(([key, val]) => (
                                            <div key={key} className="stat-row">
                                                <span className="echo-stat-label">{formatStatKey(key)}</span>
                                                <span className="echo-stat-value">
                                            {key.endsWith('Flat')
                                                ? val
                                                : (typeof val === 'number' ? `${val.toFixed(1)}%` : '—')}
                                        </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="modal-footer">
                                        {[1, 2, 3, 4, 5].map(slotIndex => (
                                            <button
                                                key={slotIndex}
                                                className="edit-substat-button slot"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const freshEcho = echoBag.find(e => e.uid === echo.uid);
                                                    if (freshEcho) {
                                                        onEquip(freshEcho, slotIndex - 1);
                                                    }
                                                }}
                                            >
                                                {slotIndex}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Edit Modal */}
                {editingEcho && (
                    <EditSubstatsModal
                        isOpen={true}
                        echo={editingEcho}
                        substats={editingEcho.subStats ?? {}}
                        mainStats={editingEcho.mainStats ?? {}}
                        getValidMainStats={getValidMainStats}
                        selectedSet={editingEcho.selectedSet ?? editingEcho.sets?.[0] ?? null}
                        onClose={() => setEditingEcho(null)}
                        onSave={(updatedEcho) => {
                            const originalEcho = echoBag.find(e => e.uid === editingEcho.uid);
                            if (!originalEcho) return;

                            const hasChanged = isEchoModified(originalEcho, updatedEcho);
                            const newUid = hasChanged
                                ? (typeof crypto !== 'undefined' && crypto.randomUUID
                                        ? crypto.randomUUID()
                                        : `${Date.now()}-${Math.random()}`
                                )
                                : originalEcho.uid;

                            updateEchoInBag({
                                ...updatedEcho,
                                uid: newUid,
                                oldUid: originalEcho.uid,
                            });
                            setVersion(v => v + 1); // force re-render

                            setEditingEcho(null);
                        }}
                    />
                )}
        </div>
    );
}