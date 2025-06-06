import React, {useRef, useState} from 'react';
import EchoMenu from './EchoMenu.jsx';
import EditSubstatsModal from './EchoEditModal.jsx';
import echoSets, {setIconMap, skillKeywords, statKeywords} from "../constants/echoSetData.jsx";
import { getEchoSetUIOverrides } from "../data/set-ui/index.js";
import { echoes } from '../json-data-scripts/getEchoes.js';
import {attributeColors} from "../utils/attributeHelpers.js";
import {Backpack, X, Save} from "lucide-react";
import {mainEchoBuffs} from "../data/buffs/setEffect.js";
import DropdownSelect from "./DropdownSelect.jsx";
import EchoBagMenu from "./EchoBagMenu.jsx";
import {useGlobalEchoBag } from "../hooks/useGlobalEchoBag.js";


export function highlightKeywordsInText(text, extraKeywords = []) {
    if (typeof text !== 'string') return text;

    const elementKeywords = Object.keys(attributeColors);
    const staticKeywords = [...skillKeywords, ...statKeywords, ...elementKeywords];
    const allKeywords = [...staticKeywords, ...extraKeywords];

    // Escape keywords for RegExp
    const escapedKeywords = allKeywords.map(k =>
        k.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    );

    const percentPattern = '\\d+(\\.\\d+)?%';
    const keywordPattern = escapedKeywords.length > 0 ? `\\b(${escapedKeywords.join('|')})\\b` : '';
    const allPattern = [percentPattern, keywordPattern].filter(Boolean).join('|');
    const regex = new RegExp(allPattern, 'gi');

    return (
        <span dangerouslySetInnerHTML={{
            __html: text.replace(regex, (match) => {
                const lower = match.toLowerCase();

                if (/^\d+(\.\d+)?%$/.test(match)) {
                    return `<strong class="highlight">${match}</strong>`;
                }

                if (skillKeywords.includes(match)) {
                    return `<strong class="highlight">${match}</strong>`;
                }

                if (statKeywords.includes(match)) {
                    return `<strong class="highlight">${match}</strong>`;
                }

                if (elementKeywords.includes(lower)) {
                    const color = attributeColors[lower];
                    return `<strong style="color: ${color}; font-weight: bold;">${match}</strong>`;
                }

                if (extraKeywords.includes(match)) {
                    return `<strong class="highlight echo-name">${match}</strong>`;
                }

                return match;
            })
        }} />
    );
}

const formatStatKey = (key) => {
    const labelMap = {
        atkPercent: 'ATK%', atkFlat: 'ATK',
        hpPercent: 'HP%', hpFlat: 'HP',
        defPercent: 'DEF%', defFlat: 'DEF',
        critRate: 'Crit Rate', critDmg: 'Crit DMG',
        energyRegen: 'Energy Regen', healingBonus: 'Healing Bonus',
        basicAtk: 'Basic Attack DMG Bonus',
        heavyAtk: 'Heavy Attack DMG Bonus', skill: 'Resonance Skill DMG Bonus',
        ultimate: 'Resonance Liberation DMG Bonus',
        aero: 'Aero DMG Bonus', spectro: 'Spectro DMG Bonus', fusion: 'Fusion DMG Bonus',
        glacio: 'Glacio DMG Bonus', havoc: 'Havoc DMG Bonus', electro: 'Electro DMG Bonus'
    };
    return labelMap[key] ?? key;
};

const statIconMap = {
    'ATK': '/assets/stat-icons/atk.png',
    'ATK%': '/assets/stat-icons/atk.png',
    'HP': '/assets/stat-icons/hp.png',
    'HP%': '/assets/stat-icons/hp.png',
    'DEF': '/assets/stat-icons/def.png',
    'DEF%': '/assets/stat-icons/def.png',
    'Energy Regen': '/assets/stat-icons/energyregen.png',
    'Crit Rate': '/assets/stat-icons/critrate.png',
    'Crit DMG': '/assets/stat-icons/critdmg.png',
    'Healing Bonus': '/assets/stat-icons/healing.png',
    'Basic Attack DMG Bonus': '/assets/stat-icons/basic.png',
    'Heavy Attack DMG Bonus': '/assets/stat-icons/heavy.png',
    'Resonance Skill DMG Bonus': '/assets/stat-icons/skill.png',
    'Resonance Liberation DMG Bonus': '/assets/stat-icons/liberation.png',
    'Aero DMG Bonus': '/assets/stat-icons/aero.png',
    'Glacio DMG Bonus': '/assets/stat-icons/glacio.png',
    'Spectro DMG Bonus': '/assets/stat-icons/spectro.png',
    'Fusion DMG Bonus': '/assets/stat-icons/fusion.png',
    'Electro DMG Bonus': '/assets/stat-icons/electro.png',
    'Havoc DMG Bonus': '/assets/stat-icons/havoc.png'
};

const getValidMainStats = (cost) => {
    if (cost === 1) {
        return { hpPercent: 22.8, atkPercent: 18, defPercent: 18 };
    } else if (cost === 3) {
        return {
            hpPercent: 30, atkPercent: 30, defPercent: 38,
            energyRegen: 32,
            aero: 30, glacio: 30, electro: 30, fusion: 30, havoc: 30, spectro: 30
        };
    } else if (cost === 4) {
        return {
            hpPercent: 33, atkPercent: 33, defPercent: 41.5,
            critRate: 22, critDmg: 44, healingBonus: 26
        };
    }
    return {};
};

const applyFixedSecondMainStat = (mainStats, cost) => {
    const updated = { ...mainStats };

    if (cost === 1) {
        updated.hpFlat = 2280;
    }
    if (cost === 3) {
        updated.atkFlat = 100;
    }
    if (cost === 4) {
        updated.atkFlat = 150;
    }

    return updated;
};

export function formatDescription(rawDesc, paramArray) {
    if (!rawDesc || !Array.isArray(paramArray)) return rawDesc ?? '';

    return rawDesc.replace(/{(\d+)}/g, (_, index) => paramArray[index] ?? `{${index}}`);
}

export function getEchoStatsFromEquippedEchoes(equippedEchoes = []) {
    const echoStats = {};

    for (const echo of equippedEchoes) {
        if (!echo) continue;

        // Add mainStats
        for (const [key, value] of Object.entries(echo.mainStats ?? {})) {
            echoStats[key] = (echoStats[key] ?? 0) + value;
        }

        // Add subStats (even if key overlaps, we add)
        for (const [key, value] of Object.entries(echo.subStats ?? {})) {
            echoStats[key] = (echoStats[key] ?? 0) + value;
        }
    }

    return echoStats;
}

function getSetCounts(equippedEchoes) {
    const counts = {};
    const seenEchoIdsPerSet = {};

    for (const echo of equippedEchoes) {
        const setId = echo?.selectedSet;
        const echoId = echo?.id;

        if (!setId || !echoId) continue;

        // Initialize a Set for this setId if not already done
        if (!seenEchoIdsPerSet[setId]) {
            seenEchoIdsPerSet[setId] = new Set();
        }

        // Only count if this echo ID hasn't been seen yet for this set
        if (!seenEchoIdsPerSet[setId].has(echoId)) {
            seenEchoIdsPerSet[setId].add(echoId);
            counts[setId] = (counts[setId] ?? 0) + 1;
        }
    }

    return counts;
}

export default function EchoesPane({
                                       charId,
                                        setCharacterRuntimeStates,
                                        characterRuntimeStates,
                                   }) {
    const echoSlots = [0, 1, 2, 3, 4];
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeSlot, setActiveSlot] = useState(null);
    const [substatModalSlot, setSubstatModalSlot] = useState(null);
    const menuRef = useRef(null);
    // Placeholder echo data
    const echoData = characterRuntimeStates?.[charId]?.equippedEchoes ?? [null, null, null, null, null];
    const [popupMessage, setPopupMessage] = useState('');
    const [showEffect, setShowEffect] = useState(false);
    const showPopup = (message, duration = 3000) => {
        setPopupMessage(message);
        setTimeout(() => setPopupMessage(''), duration);
    };
    const [bagOpen, setBagOpen] = useState(false);
    const handleRemoveEcho = (slotIndex) => {
        const currentEchoes = characterRuntimeStates?.[charId]?.equippedEchoes ?? [null, null, null, null, null];
        const updated = [...currentEchoes];
        updated[slotIndex] = null;

        setCharacterRuntimeStates(prev => ({
            ...prev,
            [charId]: {
                ...(prev[charId] ?? {}),
                equippedEchoes: updated
            }
        }));
    };

    const { addEchoToBag } = useGlobalEchoBag();
    const { echoBag } = useGlobalEchoBag();

    const handleEchoIconClick = (slotIndex) => {
        setActiveSlot(slotIndex);
        setMenuOpen(true);
    };

    const handleSubstatSave = (updatedEcho) => {
        setCharacterRuntimeStates(prev => {
            const prevEchoes = prev?.[charId]?.equippedEchoes ?? [null, null, null, null, null];

            const newEchoes = prevEchoes.map((echo, i) =>
                i === substatModalSlot ? updatedEcho : echo
            );

            return {
                ...prev,
                [charId]: {
                    ...(prev[charId] ?? {}),
                    equippedEchoes: newEchoes
                }
            };
        });

        setSubstatModalSlot(null); // ✅ Close the modal
    };

    const activeStates = characterRuntimeStates?.[charId]?.activeStates ?? {};

    const toggleState = (key) => {
        setCharacterRuntimeStates(prev => ({
            ...prev,
            [charId]: {
                ...(prev[charId] ?? {}),
                activeStates: {
                    ...(prev[charId]?.activeStates ?? {}),
                    [key]: !(prev[charId]?.activeStates?.[key] ?? false)
                }
            }
        }));
    };

    const handleSaveToBag = (echo) => {
        setEchoBag(prev => {
            const alreadyExists = prev.some(e =>
                e.id === echo.id &&
                JSON.stringify(e.mainStats) === JSON.stringify(echo.mainStats) &&
                JSON.stringify(e.subStats) === JSON.stringify(echo.subStats)
            );

            if (alreadyExists) return prev; // Don't save duplicates

            return [...prev, { ...echo }];
        });
    };

    const handleEchoSelect = (selectedEcho) => {
        const currentEchoes = characterRuntimeStates?.[charId]?.equippedEchoes ?? [null, null, null, null, null];

        const totalCost = currentEchoes.reduce((sum, echo, index) => {
            if (index === activeSlot || !echo) return sum;
            return sum + (echo.cost ?? 0);
        }, 0);

        const newEchoCost = selectedEcho.cost ?? 0;
        if (totalCost + newEchoCost > 12) {
            const badEchoCost = totalCost + newEchoCost;
            showPopup("Cost (" + badEchoCost + ") > 12");
            return;
        }

        const newEcho = {
            ...selectedEcho,
            mainStats: {},
            subStats: {},
            selectedSet: selectedEcho.sets?.[0] ?? null,
            originalSets: selectedEcho.sets ?? [],
            uid: crypto.randomUUID?.() ?? Date.now().toString(),
        };

        setCharacterRuntimeStates(prev => ({
            ...prev,
            [charId]: {
                ...(prev[charId] ?? {}),
                equippedEchoes: currentEchoes.map((e, i) =>
                    i === activeSlot ? newEcho : e
                )
            }
        }));

        setMenuOpen(false);
    };

    const setCounts = getSetCounts(echoData);
    const hasSetEffects = Object.entries(setCounts).some(([setId, count]) => count >= 2);

    return (
        <div className="echoes-pane">
            <div className="echoes-header">
                {/*}
                <button
                    className="open-bag-button"
                    onClick={() => setBagOpen(true)}
                    style={{ position: 'absolute', top: 8, right: 8 }}
                >
                    <Backpack size={26} />
                </button>
                */}
            </div>
            {echoSlots.map((slotIndex) => {
                const echo = echoData[slotIndex];
                const isMain = slotIndex === 0;
                return (
                    <React.Fragment key={slotIndex}>
                        <div key={slotIndex} className="inherent-skills-box echo">
                            <div className="echo-slot-content">
                                <div className="echo-slot-left">
                                    <div className="echo-slot-icon-wrapper">
                                        {echo ? (
                                            <>
                                                <img
                                                    src={echo.icon} alt={echo.name}
                                                    className="header-icon"
                                                    onClick={() => handleEchoIconClick(slotIndex)}
                                                />
                                                <button
                                                    className="remove-teammate-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveEcho(slotIndex);
                                                    }}
                                                    title="Remove Echo"
                                                >
                                                    <X size={14} strokeWidth={2.5} />
                                                </button>
                                            </>
                                        ) : (
                                            <div
                                                className="echo-slot-icon empty-slot"
                                                 onClick={() => handleEchoIconClick(slotIndex)}
                                            />
                                        )}
                                    </div>
                                    <div className="echo-slot-details">
                                        {echo ? (
                                            <>
                                                <div className="echo-slot-title">{echo.name}</div>
                                                <div className="echo-slot-cost-group">
                                                    <div className="echo-slot-cost-badge">Cost {echo.cost}</div>
                                                    {echo.selectedSet && (
                                                        <img
                                                            src={setIconMap[echo.selectedSet]}
                                                            alt={`Set ${echo.selectedSet}`}
                                                            className="echo-set-icon"
                                                        />
                                                    )}
                                                    {/*}
                                                    {echo && (
                                                        <button
                                                            className="save-to-bag-button inline"
                                                            onClick={() => addEchoToBag(echo)}
                                                            title="Save Echo to Bag"
                                                        >
                                                            <Save/>
                                                        </button>
                                                    )}
                                                    */}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="echo-slot-title">
                                                    {isMain ? 'Main Echo Slot' : `Echo Slot ${slotIndex + 1}`}
                                                </div>
                                                <div className="echo-slot-desc">No Echo equipped</div>
                                            </>
                                        )}
                                        {isMain && echo?.rawDesc && echo?.rawParams?.[4] && (
                                            <button
                                                className="toggle-effect-button"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // prevent opening substat modal
                                                    setShowEffect(prev => !prev);
                                                }}
                                            >
                                                {showEffect ? "Hide Effect" : "Show Effect"}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="echo-details" onClick={() => echo && setSubstatModalSlot(slotIndex)}>
                                    {echo ? (
                                        <div className="echo-card">
                                            <div className="echo-card-section main">
                                                {Object.entries(echo.mainStats ?? {}).map(([key, val]) => {
                                                    const label = formatStatKey(key);
                                                    const iconUrl = statIconMap[label];

                                                    return (
                                                        <div key={key} className="stat-row">
                                                        <span className="echo-stat-label">
                                                            {iconUrl && (
                                                                <div
                                                                    className="stat-icon"
                                                                    style={{
                                                                        width: 18,
                                                                        height: 18,
                                                                        backgroundColor: '#999',
                                                                        WebkitMaskImage: `url(${iconUrl})`,
                                                                        maskImage: `url(${iconUrl})`,
                                                                        WebkitMaskRepeat: 'no-repeat',
                                                                        maskRepeat: 'no-repeat',
                                                                        WebkitMaskSize: 'contain',
                                                                        maskSize: 'contain',
                                                                        display: 'inline-block',
                                                                        marginRight: '0.25rem',
                                                                        verticalAlign: 'middle',
                                                                        paddingRight: '0.25rem',
                                                                    }}
                                                                />
                                                            )}
                                                            {label}
                                                        </span>
                                                            <span className="echo-stat-value">
                                                            {key.endsWith('Flat') ? val : `${val.toFixed(1)}%`}
                                                        </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="echo-card-section">
                                                {Object.entries(echo.subStats ?? {}).map(([key, val]) => {
                                                    const label = formatStatKey(key);
                                                    const iconUrl = statIconMap[label];

                                                    return (
                                                        <div key={key} className="stat-row">
                                                        <span className="echo-stat-label">
                                                            {iconUrl && (
                                                                <div
                                                                    className="stat-icon"
                                                                    style={{
                                                                        width: 18,
                                                                        height: 18,
                                                                        backgroundColor: '#999',
                                                                        WebkitMaskImage: `url(${iconUrl})`,
                                                                        maskImage: `url(${iconUrl})`,
                                                                        WebkitMaskRepeat: 'no-repeat',
                                                                        maskRepeat: 'no-repeat',
                                                                        WebkitMaskSize: 'contain',
                                                                        maskSize: 'contain',
                                                                        display: 'inline-block',
                                                                        marginRight: '0.25rem',
                                                                        verticalAlign: 'middle',
                                                                        paddingRight: '0.25rem',
                                                                    }}
                                                                />
                                                            )}
                                                            {label}
                                                        </span>
                                                            <span className="echo-stat-value">
                                                            {key.endsWith('Flat') ? val : `${val.toFixed(1)}%`}
                                                        </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-muted"></span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isMain && echo?.rawDesc && echo?.rawParams?.[4] && (
                            <div
                                className={`main-echo-description-wrapper ${showEffect ? 'expanded' : 'collapsed'}`}
                            >
                                <div className="main-echo-description" >
                                    {highlightKeywordsInText(
                                        formatDescription(echo.rawDesc, echo.rawParams[4]),
                                        [echo.name]
                                    )}
                                    {isMain && echo?.id && mainEchoBuffs?.[echo.id] && (
                                        <div className="main-echo-toggle-controls">
                                            {/* Toggleable Buffs */}
                                            {mainEchoBuffs[echo.id].toggleable && (
                                                <label className="modern-checkbox echo">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!activeStates.mainEchoToggle}
                                                        onChange={() => toggleState('mainEchoToggle')}
                                                    />
                                                    {mainEchoBuffs[echo.id].toggleable.label ?? 'Enable'}
                                                </label>
                                            )}

                                            {/* Stackable Buffs */}
                                            {isMain && echo?.id && mainEchoBuffs?.[echo.id]?.stackable && (() => {
                                                const stackKey = mainEchoBuffs[echo.id]?.stackable?.key ?? 'mainEchoStack';
                                                const currentStackValue = activeStates?.[stackKey] ?? 0;

                                                const handleChange = (newValue) => {
                                                    setCharacterRuntimeStates(prev => ({
                                                        ...prev,
                                                        [charId]: {
                                                            ...(prev[charId] ?? {}),
                                                            activeStates: {
                                                                ...(prev[charId]?.activeStates ?? {}),
                                                                [stackKey]: newValue
                                                            }
                                                        }
                                                    }));
                                                };

                                                return (
                                                    <DropdownSelect
                                                        label=""
                                                        options={Array.from(
                                                            { length: (mainEchoBuffs[echo.id].stackable?.max ?? 3) + 1 },
                                                            (_, i) => (i)
                                                        )}
                                                        value={currentStackValue}
                                                        onChange={handleChange}
                                                        width="80px"
                                                    />
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                );
            })}

            {hasSetEffects && (
                <div className="inherent-skills-box set">
                    <div className="echo-buffs set">
                        {Object.entries(setCounts).map(([setId, count]) => {
                            const numericId = Number(setId);
                            const setInfo = echoSets.find(set => set.id === numericId);
                            if (!setInfo || count < 2) return null;

                            const { twoPiece: TwoPieceUI, fivePiece: FivePieceUI } = getEchoSetUIOverrides(numericId);

                            return (
                                <div key={setId} className="echo-set-content">
                                    {count >= 2 && (
                                        TwoPieceUI ? (
                                            <TwoPieceUI setInfo={setInfo} />
                                        ) : (
                                            <div className="echo-buff">
                                                <div className="echo-buff-header">
                                                    <img className="echo-buff-icon" src={setIconMap[setInfo.id]} alt={setInfo.name} />
                                                    <div className="echo-buff-name">{setInfo.name} (2-piece)</div>
                                                </div>
                                                <div className="echo-buff-effect">
                                                    {setInfo.twoPiece}
                                                </div>
                                            </div>
                                        )
                                    )}
                                    {count === 5 && (
                                        FivePieceUI ? (
                                            <FivePieceUI setInfo={setInfo} activeStates={activeStates} toggleState={toggleState} />
                                        ) : (
                                            <div className="echo-buff">
                                                <div className="echo-buff-header">
                                                    <img className="echo-buff-icon" src={setIconMap[setInfo.id]} alt={setInfo.name} />
                                                    <div className="echo-buff-name">{setInfo.name} (5-piece)</div>
                                                </div>
                                                <div className="echo-buff-effect">
                                                    {setInfo.fivePiece}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <EchoMenu
                echoes={echoes}
                handleEchoSelect={handleEchoSelect}
                menuRef={menuRef}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
            />

            {substatModalSlot !== null && echoData[substatModalSlot] && (
                <EditSubstatsModal
                    isOpen={true}
                    echo={echoData[substatModalSlot]}
                    mainStats={getValidMainStats(echoData[substatModalSlot]?.cost ?? 1)}
                    substats={echoData[substatModalSlot]?.subStats ?? {}}
                    sets={echoData[substatModalSlot]?.originalSets ?? []}
                    selectedSet={echoData[substatModalSlot]?.selectedSet ?? null}
                    slotIndex={substatModalSlot}
                    onClose={() => setSubstatModalSlot(null)}
                    onSave={(updatedEcho) => handleSubstatSave(updatedEcho)}
                    getValidMainStats={getValidMainStats}
                    applyFixedSecondMainStat={applyFixedSecondMainStat}
                />
            )}
            {/*}
            {bagOpen && (
                <EchoBagMenu
                    onClose={() => setBagOpen(false)}
                    onEquip={(echo) => {
                        // Call your equip logic here
                        handleEchoSelect(echo);
                        setBagOpen(false);
                    }}
                />
            )}
            */}

            {popupMessage && (
                <div className="popup-message">
                    {popupMessage}
                </div>
            )}
        </div>
    );
}