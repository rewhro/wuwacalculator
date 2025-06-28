// src/components/EchoBagMenu.jsx
import React, {useEffect, useState} from 'react';
import { X } from 'lucide-react';
import EditSubstatsModal from './EchoEditModal';
import {setIconMap} from "../constants/echoSetData";
import { isEqual } from 'lodash'; // optional if you prefer deep comparison
import {
    getEchoBag,
    subscribeEchoBag,
    removeEchoFromBag,
    updateEchoInBag
} from '../state/echoBagStore';
import {formatStatKey, getValidMainStats} from "../utils/echoHelper.js";
import {imageCache} from "../pages/calculator.jsx";

function isEchoModified(oldEcho, updatedEcho) {
    return (
        oldEcho.selectedSet !== updatedEcho.selectedSet ||
        oldEcho.cost !== updatedEcho.cost ||
        !isEqual(oldEcho.mainStats, updatedEcho.mainStats) ||
        !isEqual(oldEcho.subStats, updatedEcho.subStats)
    );
}

export default function EchoBagMenu({
                                        onClose,
                                        onEquip,
                                        selectedSet,
                                        setSelectedSet,
                                        selectedCost,
                                        setSelectedCost,
                                        searchTerm,
                                        setSearchTerm
}) {
    const [echoBag, setEchoBag] = useState(getEchoBag());
    const [version, setVersion] = useState(0); // unused, for forcing rerender
    const [editingEcho, setEditingEcho] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [preloaded, setPreloaded] = useState(false);
    const [didOpenOnce, setDidOpenOnce] = useState(false);
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

    useEffect(() => {
        const unsubscribe = subscribeEchoBag(setEchoBag);
        return unsubscribe;
    }, []);
    useEffect(() => {
        setIsVisible(true);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setIsAnimatingOut(false);
            });
        });
    }, []);
    useEffect(() => {
        if (!isVisible || didOpenOnce) return;

        const preloadImages = async () => {
            const srcList = [];

            for (const echo of echoBag) {
                if (echo.icon) srcList.push(echo.icon);
                if (echo.selectedSet) srcList.push(setIconMap[echo.selectedSet]);
            }

            await Promise.all(
                srcList.map(src => new Promise(resolve => {
                    const img = new Image();
                    img.onload = resolve;
                    img.onerror = resolve;
                    img.src = src;
                }))
            );

            setPreloaded(true);
            setDidOpenOnce(true);
        };

        setPreloaded(false);
        preloadImages();
    }, [isVisible, echoBag, didOpenOnce]);

    if (!isVisible || (!preloaded && !didOpenOnce)) return null;

    return (
        <div
            className={`menu-overlay ${isAnimatingOut ? 'hiding' : 'show'}`}
            onClick={handleOverlayClick}
        >
            <div
                className={`edit-substats-modal echo-bag-modal ${isAnimatingOut ? 'hiding' : 'show'}`}
                onClick={(e) => e.stopPropagation()}
            >
                    <div className="menu-header-with-buttons echo">
                        <div className="menu-header echo">Saved Echoes</div>
                        <div className="button-group-container echo">
                            {Object.entries(setIconMap).map(([setId, iconPath]) => (
                                <img
                                    key={setId}
                                    src={imageCache[iconPath]?.src || iconPath}
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
                                >
                                    <div className="remove-button-container">
                                        <button
                                            className="remove-substat-button"
                                            onClick={() => {
                                                removeEchoFromBag(echo.uid);
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

                                    <img
                                        src={imageCache[echo.icon]?.src || echo.icon}
                                        alt={echo.name}
                                         loading="eager"
                                         onError={(e) => {
                                             e.currentTarget.onerror = null;
                                             e.currentTarget.src = '/assets/echoes/default.webp';
                                             e.currentTarget.classList.add('fallback-icon');
                                         }}
                                    />
                                    <div className="echo-name">{echo.name}</div>

                                    <div
                                        className="echo-stats-preview"
                                        onClick={() => {
                                            const freshEcho = echoBag.find(e => e.uid === echo.uid);
                                            setEditingEcho(freshEcho);
                                        }}
                                    >
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
                                                onClick={() => {
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
                            setVersion(v => v + 1);

                            setEditingEcho(null);
                        }}
                    />
                )}
        </div>
    );
}